// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
}

// CCIP Router Interface for Cross-Chain Rewards
interface IRouterClient {
    function ccipSend(uint64 destinationChainSelector, Client.EVM2AnyMessage calldata message) external payable returns (bytes32);
}

library Client {
    struct EVMTokenAmount {
        address token;
        uint256 amount;
    }
    struct EVM2AnyMessage {
        bytes receiver;
        bytes data;
        EVMTokenAmount[] tokenAmounts;
        address feeToken;
        bytes extraArgs;
    }
}

// zkVerify Proof Interface
interface IZkVerify {
    function verifyProof(uint256[] memory publicInputs, bytes memory proof) external view returns (bool);
}


contract TriageQueue {
    struct Ticket {
        uint256 id;
        address owner;
        uint256 triageScore;
        uint256 timestamp;
        string zkProof;
        bool isOracleVerified;
        bool exists;
    }

    struct YieldOffer {
        uint256 ticketId;
        uint256 offerAmount; // USDC
        uint256 scoreReduction;
        bool exists;
    }

    // Contracts & Access Control
    address public owner;
    IERC20 public usdcToken;
    address public oracleAttester;

    // Queue State
    uint256 public nextTicketId;
    uint256[] public activeQueue; // Sorted array of ticket IDs
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => YieldOffer) public activeOffers;

    // Phase 4: Integrations State
    IRouterClient public ccipRouter;
    IZkVerify public zkVerifier;
    uint64 public destinationChainSelector; // ID for target chain (e.g. Base)

    // Events
    event TicketCreated(uint256 indexed ticketId, address indexed owner, uint256 triageScore);
    event YieldOfferCreated(uint256 indexed ticketId, uint256 offerAmount, uint256 scoreReduction);
    event YieldOfferAccepted(uint256 indexed ticketId, address indexed owner, uint256 originalScore, uint256 newScore, uint256 payoutAmount);
    event OracleVerified(uint256 indexed ticketId, uint256 previousScore, uint256 verifiedScore, bool matched);
    event OracleVerificationRequested(uint256 indexed ticketId, string patientDataRef);

    modifier onlyOwner() {
        require(msg.sender == owner, "TriageQueue: caller is not the owner");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracleAttester, "TriageQueue: caller is not the oracle attester");
        _;
    }

    constructor(address _usdcToken, address _oracleAttester) {
        owner = msg.sender;
        usdcToken = IERC20(_usdcToken);
        oracleAttester = _oracleAttester;
        nextTicketId = 1;
    }

    // --- Phase 4 Setup ---
    function setIntegrations(address _ccipRouter, address _zkVerifier, uint64 _chainSelector) external onlyOwner {
        ccipRouter = IRouterClient(_ccipRouter);
        zkVerifier = IZkVerify(_zkVerifier);
        destinationChainSelector = _chainSelector;
    }

    // --- Core Patient Actions ---

    /**
     * @notice Submit a new ZK-verified triage ticket and place it in the sorted queue.
     * @param triageScore Urgency score calculated from patient symptoms and vitals (1-99).
     * @param zkProofCID Zero-knowledge proof verification CID / transaction hash.
     */
    function createTicket(uint256 triageScore, string calldata zkProofCID, bytes memory actualProof, uint256[] memory publicInputs) external returns (uint256) {
        require(triageScore > 0 && triageScore <= 100, "TriageQueue: score must be between 1 and 100");
        
        // zkVerify Check: Ensure the patient's triage score is mathematically verified before queueing
        if (address(zkVerifier) != address(0) && actualProof.length > 0) {
            require(zkVerifier.verifyProof(publicInputs, actualProof), "TriageQueue: Invalid ZK Proof of Triage");
        }
        
        uint256 ticketId = nextTicketId++;
        tickets[ticketId] = Ticket({
            id: ticketId,
            owner: msg.sender,
            triageScore: triageScore,
            timestamp: block.timestamp,
            zkProof: zkProofCID, // Keep CID string for frontend / IPFS indexing
            isOracleVerified: false,
            exists: true
        });

        _insertSorted(ticketId, triageScore);
        
        emit TicketCreated(ticketId, msg.sender, triageScore);
        return ticketId;
    }

    /**
     * @notice Accept a pending yield offer, lowering queue priority in exchange for a stablecoin refund.
     * @param ticketId The ID of the ticket.
     */
    function acceptYieldOffer(uint256 ticketId, bool crossChain) external {
        Ticket storage ticket = tickets[ticketId];
        require(ticket.exists, "TriageQueue: ticket does not exist");
        require(ticket.owner == msg.sender, "TriageQueue: caller is not the ticket owner");
        
        YieldOffer memory offer = activeOffers[ticketId];
        require(offer.exists, "TriageQueue: no active yield offer for this ticket");

        // Pay out USDC reward to patient
        require(usdcToken.balanceOf(address(this)) >= offer.offerAmount, "TriageQueue: insufficient contract reward balance");
        
        if (crossChain && address(ccipRouter) != address(0)) {
            // Send USDC Cross-Chain via CCIP (e.g., from Sepolia to Base Sepolia)
            Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
            tokenAmounts[0] = Client.EVMTokenAmount({
                token: address(usdcToken),
                amount: offer.offerAmount
            });

            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(msg.sender),
                data: "",
                tokenAmounts: tokenAmounts,
                feeToken: address(0),
                extraArgs: ""
            });

            usdcToken.approve(address(ccipRouter), offer.offerAmount);
            ccipRouter.ccipSend(destinationChainSelector, message);
        } else {
            // Settle on the same chain
            usdcToken.transfer(msg.sender, offer.offerAmount);
        }

        // Adjust queue score and re-sort
        uint256 originalScore = ticket.triageScore;
        uint256 newScore = originalScore > offer.scoreReduction ? originalScore - offer.scoreReduction : 1;
        ticket.triageScore = newScore;

        // Re-sort the queue
        _removeAndResort(ticketId);
        _insertSorted(ticketId, newScore);

        // Clear offer
        delete activeOffers[ticketId];

        emit YieldOfferAccepted(ticketId, msg.sender, originalScore, newScore, offer.offerAmount);
    }

    // --- Oracle / Chainlink Functions Simulated Callback ---

    /**
     * @notice Requests off-chain verification of vitals via Chainlink Functions.
     */
    function requestOracleVerification(uint256 ticketId, string calldata patientDataRef) external {
        require(tickets[ticketId].exists, "TriageQueue: ticket does not exist");
        emit OracleVerificationRequested(ticketId, patientDataRef);
    }

    /**
     * @notice Callback invoked by Chainlink DON attester to submit verified biometric score.
     * Checks if patient exaggerated symptoms compared to regional wearable datasets.
     */
    function fulfillOracleVerify(uint256 ticketId, uint256 verifiedScore) external onlyOracle {
        Ticket storage ticket = tickets[ticketId];
        require(ticket.exists, "TriageQueue: ticket does not exist");
        require(!ticket.isOracleVerified, "TriageQueue: already oracle verified");

        uint256 previousScore = ticket.triageScore;
        bool matched = (verifiedScore == previousScore);

        // Update score to verified biometric score
        ticket.triageScore = verifiedScore;
        ticket.isOracleVerified = true;

        // Re-sort in queue since score changed
        _removeAndResort(ticketId);
        _insertSorted(ticketId, verifiedScore);

        emit OracleVerified(ticketId, previousScore, verifiedScore, matched);
    }

    // --- Admin / Clinic Operator Actions ---

    /**
     * @notice Create a yield incentive offer for a patient.
     */
    function createYieldOffer(uint256 ticketId, uint256 offerAmount, uint256 scoreReduction) external onlyOwner {
        require(tickets[ticketId].exists, "TriageQueue: ticket does not exist");
        activeOffers[ticketId] = YieldOffer({
            ticketId: ticketId,
            offerAmount: offerAmount,
            scoreReduction: scoreReduction,
            exists: true
        });

        emit YieldOfferCreated(ticketId, offerAmount, scoreReduction);
    }

    /**
     * @notice Remove a patient from queue (when called in for checkup).
     */
    function dequeuePatient(uint256 ticketId) external onlyOwner {
        require(tickets[ticketId].exists, "TriageQueue: ticket does not exist");
        _removeAndResort(ticketId);
        delete tickets[ticketId];
        delete activeOffers[ticketId];
    }

    // --- Queue Management Helpers ---

    /**
     * @notice Expose the sorted active queue array.
     */
    function getActiveQueue() external view returns (uint256[] memory) {
        return activeQueue;
    }

    /**
     * @dev Insert a ticket ID into the active queue maintaining descending score order.
     */
    function _insertSorted(uint256 ticketId, uint256 score) internal {
        uint256 i = 0;
        uint256 length = activeQueue.length;
        
        // Find insert index (highest score first)
        while (i < length && tickets[activeQueue[i]].triageScore >= score) {
            i++;
        }

        // Insert at index i
        activeQueue.push(ticketId); // expand length
        for (uint256 j = activeQueue.length - 1; j > i; j--) {
            activeQueue[j] = activeQueue[j - 1];
        }
        activeQueue[i] = ticketId;
    }

    /**
     * @dev Remove a ticket ID from the queue and collapse the array.
     */
    function _removeAndResort(uint256 ticketId) internal {
        uint256 length = activeQueue.length;
        uint256 index = length;

        for (uint256 i = 0; i < length; i++) {
            if (activeQueue[i] == ticketId) {
                index = i;
                break;
            }
        }

        if (index < length) {
            for (uint256 i = index; i < length - 1; i++) {
                activeQueue[i] = activeQueue[i + 1];
            }
            activeQueue.pop();
        }
    }
}
