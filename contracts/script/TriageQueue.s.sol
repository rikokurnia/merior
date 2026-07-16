// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TriageQueue.sol";
import "../src/MockUSDC.sol";

contract DeployTriageQueue is Script {
    function run() external {
        // Retrieve private key from environment or use a default local development private key
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Mock USDC
        MockUSDC mockUSDC = new MockUSDC();
        console.log("MockUSDC deployed at:", address(mockUSDC));

        // 2. Deploy TriageQueue (using an arbitrary local address as the oracle attester)
        address localOracleAttester = vm.envOr("ORACLE_ATTESTER", address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8));
        TriageQueue triageQueue = new TriageQueue(address(mockUSDC), localOracleAttester);
        console.log("TriageQueue deployed at:", address(triageQueue));

        // 3. Seed contract with initial rewards pool
        mockUSDC.transfer(address(triageQueue), 1000000 * 10**6);
        console.log("Seeded TriageQueue with 1,000,000 mock USDC");

        vm.stopBroadcast();
    }
}
