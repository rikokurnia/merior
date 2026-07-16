// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TriageQueue.sol";
import "../src/MockUSDC.sol";

contract TriageQueueTest is Test {
    TriageQueue public triageQueue;
    MockUSDC public mockUSDC;

    address public owner = address(1);
    address public oracleAttester = address(2);
    address public patient1 = address(3);
    address public patient2 = address(4);
    address public patient3 = address(5);

    function setUp() public {
        vm.startPrank(owner);
        mockUSDC = new MockUSDC();
        triageQueue = new TriageQueue(address(mockUSDC), oracleAttester);

        // Seed the TriageQueue contract with mock USDC rewards
        mockUSDC.transfer(address(triageQueue), 5000 * 10**6);
        vm.stopPrank();
    }

    function testCreateTicketAndSorting() public {
        // Patient 1 creates ticket: score 70
        vm.prank(patient1);
        uint256 id1 = triageQueue.createTicket(70, "proof1");

        // Patient 2 creates ticket: score 95 (should move to #1)
        vm.prank(patient2);
        uint256 id2 = triageQueue.createTicket(95, "proof2");

        // Patient 3 creates ticket: score 40 (should be #3)
        vm.prank(patient3);
        uint256 id3 = triageQueue.createTicket(40, "proof3");

        // Fetch queue and verify order
        uint256[] memory queue = triageQueue.getActiveQueue();
        assertEq(queue.length, 3);
        assertEq(queue[0], id2); // score 95
        assertEq(queue[1], id1); // score 70
        assertEq(queue[2], id3); // score 40
    }

    function testAcceptYieldOffer() public {
        vm.prank(patient1);
        uint256 id1 = triageQueue.createTicket(70, "proof1");

        vm.prank(patient2);
        uint256 id2 = triageQueue.createTicket(90, "proof2");

        // Owner creates yield offer for Patient 2 (score 90, offer 10 USDC, reduction 30)
        vm.prank(owner);
        triageQueue.createYieldOffer(id2, 10 * 10**6, 30);

        // Patient 2 accepts offer
        uint256 balanceBefore = mockUSDC.balanceOf(patient2);
        vm.prank(patient2);
        triageQueue.acceptYieldOffer(id2);

        // Verify balance increase
        assertEq(mockUSDC.balanceOf(patient2), balanceBefore + 10 * 10**6);

        // Verify score reduction (90 - 30 = 60)
        (, , uint256 newScore, , , , ) = triageQueue.tickets(id2);
        assertEq(newScore, 60);

        // Verify queue order re-sorted: patient 1 (70) should now be #1, patient 2 (60) should be #2
        uint256[] memory queue = triageQueue.getActiveQueue();
        assertEq(queue[0], id1);
        assertEq(queue[1], id2);
    }

    function testOracleVerifyAndReSorting() public {
        vm.prank(patient1);
        uint256 id1 = triageQueue.createTicket(80, "proof1"); // check-in with claim score 80

        vm.prank(patient2);
        uint256 id2 = triageQueue.createTicket(70, "proof2");

        // Attester checks wearable database and discovers patient 1 exaggerated symptoms
        // Real score verified to be 50. Attester fulfills verification.
        vm.prank(oracleAttester);
        triageQueue.fulfillOracleVerify(id1, 50);

        // Verify patient 1 ticket is marked as oracle verified, and score adjusted
        (, , uint256 newScore, , , bool isOracleVerified, ) = triageQueue.tickets(id1);
        assertEq(newScore, 50);
        assertTrue(isOracleVerified);

        // Verify queue re-sorted: Patient 2 (70) should now be #1, Patient 1 (50) should be #2
        uint256[] memory queue = triageQueue.getActiveQueue();
        assertEq(queue[0], id2);
        assertEq(queue[1], id1);
    }

    function testOnlyOracleCanVerify() public {
        vm.prank(patient1);
        uint256 id1 = triageQueue.createTicket(80, "proof1");

        // Calling from non-oracle address should revert
        vm.prank(patient2);
        vm.expectRevert("TriageQueue: caller is not the oracle attester");
        triageQueue.fulfillOracleVerify(id1, 50);
    }
}
