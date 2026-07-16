// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
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

    // --- Core Patient Actions ---

    /**
     * @notice Submit a new ZK-verified triage ticket and place it in the sorted queue.
     * @param triageScore Urgency score calculated from patient symptoms and vitals (1-99).
     * @param zkProof Zero-knowledge proof verification CID / transaction hash.
     */
    function createTicket(uint256 triageScore, string calldata zkProof) external returns (uint256) {
        require(triageScore > 0 && triageScore <= 100, "TriageQueue: score must be between 1 and 100");
        
        uint256 ticketId = nextTicketId++;
        tickets[ticketId] = Ticket({
            id: ticketId,
            owner: msg.sender,
            triageScore: triageScore,
            timestamp: block.timestamp,
            zkProof: zkProof,
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
    function acceptYieldOffer(uint256 ticketId) external {
        Ticket storage ticket = tickets[ticketId];
        require(ticket.exists, "TriageQueue: ticket does not exist");
        require(ticket.owner == msg.sender, "TriageQueue: caller is not the ticket owner");
        
        YieldOffer memory offer = activeOffers[ticketId];
        require(offer.exists, "TriageQueue: no active yield offer for this ticket");

        // Pay out USDC reward to patient
        require(usdcToken.balanceOf(address(this)) >= offer.offerAmount, "TriageQueue: insufficient contract reward balance");
        usdcToken.transfer(msg.sender, offer.offerAmount);

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
