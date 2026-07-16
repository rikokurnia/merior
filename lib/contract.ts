import { ethers } from "ethers";

export const TRIAGE_QUEUE_ABI = [
  "function createTicket(uint256 triageScore, string zkProofCID, bytes actualProof, uint256[] publicInputs) external returns (uint256)",
  "function acceptYieldOffer(uint256 ticketId, bool crossChain) external",
  "function getActiveQueue() external view returns (uint256[])",
  "function tickets(uint256) external view returns (uint256 id, address owner, uint256 triageScore, uint256 timestamp, string zkProof, bool isOracleVerified, bool exists)",
  "function activeOffers(uint256) external view returns (uint256 ticketId, uint256 offerAmount, uint256 scoreReduction, bool exists)",
  "event TicketCreated(uint256 indexed ticketId, address indexed owner, uint256 triageScore)",
  "event YieldOfferCreated(uint256 indexed ticketId, uint256 offerAmount, uint256 scoreReduction)",
  "event YieldOfferAccepted(uint256 indexed ticketId, address indexed owner, uint256 originalScore, uint256 newScore, uint256 payoutAmount)",
  "event OracleVerified(uint256 indexed ticketId, uint256 previousScore, uint256 verifiedScore, bool matched)"
];

import { TRIAGE_QUEUE_ADDRESS } from "./contract-config";

export async function getTriageContract() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No Ethereum provider found");
  }
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(TRIAGE_QUEUE_ADDRESS, TRIAGE_QUEUE_ABI, signer);
}

export async function getTriageContractReadOnly() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No Ethereum provider found");
  }
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  return new ethers.Contract(TRIAGE_QUEUE_ADDRESS, TRIAGE_QUEUE_ABI, provider);
}
