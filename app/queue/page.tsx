"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, Mail, ArrowRight, Shield, HeartPulse, 
  Activity, CheckCircle2, Coins, Lock, RefreshCw, X, AlertTriangle,
  ListOrdered, BarChart2, UserCircle, TrendingUp, Clock, ArrowUpRight, Settings, Key, Fingerprint, History
} from "lucide-react";
import Grainient from "@/components/Grainient";
import { executeConfidentialTriage } from "@/lib/chainlink-agent";
import { getTriageContract } from "@/lib/contract";
import { useAccount } from 'wagmi';
import { useEthersSigner } from '@/lib/ethers-adapter';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function QueuePage() {
  const { isConnected, address: walletAddress } = useAccount();
  const signer = useEthersSigner();
  
  const [activeTab, setActiveTab] = useState<"clinic" | "triage" | "analytics" | "identity">("triage");
  
  // Triage / Queue State
  const [symptoms, setSymptoms] = useState("");
  const [painLevel, setPainLevel] = useState(5);
  const [isWearableSynced, setIsWearableSynced] = useState(false);
  const [isSubmittingTriage, setIsSubmittingTriage] = useState(false);
  const [triageStep, setTriageStep] = useState<"form" | "verifying" | "success">("form");
  const [generatedScore, setGeneratedScore] = useState(0);
  const [zkProofHash, setZkProofHash] = useState("");
  const [attestationReason, setAttestationReason] = useState("");
  const [myTicketId, setMyTicketId] = useState<number | null>(null);
  
  // Yield Mechanism Mock states
  const [showYieldOffer, setShowYieldOffer] = useState(false);
  const [hasYielded, setHasYielded] = useState(false);
  const [balance, setBalance] = useState({ eth: "1.25", usdc: "15.00" });

  // Mock Patient Queue List
  const [queue, setQueue] = useState([
    { id: "1", name: "Patient #8812", urgency: 94, status: "In Treatment", timeWaiting: "12m", isMe: false },
    { id: "2", name: "Patient #3928", urgency: 87, status: "Triage Verified", timeWaiting: "8m", isMe: false },
    { id: "3", name: "Patient #5092", urgency: 65, status: "Triage Verified", timeWaiting: "15m", isMe: false },
    { id: "4", name: "Patient #2104", urgency: 42, status: "Triage Verified", timeWaiting: "22m", isMe: false },
  ]);


  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    setIsSubmittingTriage(true);
    setTriageStep("verifying");

    try {
      // Call off-chain Chainlink Confidential AI Attester TEE
      const result = await executeConfidentialTriage(
        symptoms,
        painLevel,
        isWearableSynced
      );

      let finalTxHash = result.zkProofRef;

      // Smart Contract Integration
      if (signer) {
        try {
          const contract = await getTriageContract(signer);
          // Sending transaction to blockchain with mock ZK Proof and inputs
          const tx = await contract.createTicket(result.urgencyScore, result.zkProofRef, "0x00", []);
          await tx.wait(); // Wait for confirmation
          finalTxHash = tx.hash;
          // In a real app we'd parse the event to get the actual Ticket ID. 
          // For now we mock it as ticket ID 1.
          setMyTicketId(1);
        } catch (error) {
          console.error("Smart contract execution failed, falling back to mock UI:", error);
          // If contract fails (e.g., user rejected), we fall back to mock just so the demo can continue
          setMyTicketId(1);
        }
      } else {
        setMyTicketId(1);
      }

      setGeneratedScore(result.urgencyScore);
      setZkProofHash(finalTxHash);
      setAttestationReason(result.reason);
      setTriageStep("success");

      // Add to patient queue list
      const newPatient = {
        id: "me",
        name: "You (Patient)",
        urgency: result.urgencyScore,
        status: result.isOracleVerified ? "ZK & Oracle Verified" : "Triage Verified",
        timeWaiting: "0m",
        isMe: true
      };

      // Sort queue dynamically by urgency (descending)
      setQueue(prev => {
        const updated = [...prev.filter(p => !p.isMe), newPatient];
        return updated.sort((a, b) => b.urgency - a.urgency);
      });

      // If our score is low, trigger the Yield Offer simulation after 5 seconds
      if (result.urgencyScore < 60) {
        setTimeout(() => {
          setShowYieldOffer(true);
        }, 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingTriage(false);
    }
  };

  const acceptYieldOffer = async () => {
    if (signer && myTicketId) {
      try {
        const contract = await getTriageContract(signer);
        const crossChain = false; // By default, settle on the same chain for Hackathon Demo unless toggled
        const tx = await contract.acceptYieldOffer(myTicketId, crossChain);
        await tx.wait();
      } catch (error) {
        console.error("Yield offer transaction failed:", error);
        alert("Transaction failed or was rejected.");
        return; // Stop execution if tx fails
      }
    }

    // Perform yield logic: move patient down, give USDC reward
    setQueue(prev => {
      const updated = prev.map(p => {
        if (p.isMe) {
          return { ...p, urgency: p.urgency - 20, timeWaiting: p.timeWaiting + " (Yielded)" };
        }
        return p;
      });
      return updated.sort((a, b) => b.urgency - a.urgency);
    });

    setBalance(prev => ({
      ...prev,
      usdc: (parseFloat(prev.usdc) + 10.00).toFixed(2)
    }));

    setHasYielded(true);
    setShowYieldOffer(false);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#112E64] font-sans text-[#D5E8F0] selection:bg-[#BCD3E9] selection:text-[#204287]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10">
        <Grainient
          color1="#7482C4"
          color2="#112E64"
          color3="#204287"
          timeSpeed={0.15}
          colorBalance={0}
          warpStrength={0.8}
          warpFrequency={4}
          warpSpeed={1.5}
          warpAmplitude={40}
          blendSoftness={0.08}
          rotationAmount={300}
          noiseScale={2.5}
          grainAmount={0.08}
          contrast={1.3}
        />
      </div>

      <div className="noise-overlay"></div>

      {/* Header / Nav */}
      <header className="w-full border-b border-white/10 backdrop-blur-md sticky top-0 z-40 px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/images/logo-light.png" 
            alt="IWC Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-4">
          <ConnectButton />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 relative z-10 min-h-[80vh]">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-72 shrink-0 h-fit sticky top-28 z-20">
          <div className="glass-panel rounded-3xl p-3 flex flex-col gap-1 shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#7482C4]/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <p className="text-[10px] uppercase tracking-widest text-[#BCD3E9]/50 font-bold px-5 pt-3 pb-3">Dashboard</p>
            
            <button 
              onClick={() => setActiveTab("triage")}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all text-left ${
                activeTab === "triage" 
                  ? "bg-[#BCD3E9]/15 text-[#D5E8F0] shadow-[inset_0_0_0_1px_rgba(188,211,233,0.2)]" 
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <HeartPulse size={18} className={activeTab === "triage" ? "text-[#BCD3E9]" : "text-white/40"} />
              <span className="font-semibold text-sm tracking-wide">My Triage</span>
            </button>

            <button 
              onClick={() => setActiveTab("clinic")}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all text-left ${
                activeTab === "clinic" 
                  ? "bg-[#BCD3E9]/15 text-[#D5E8F0] shadow-[inset_0_0_0_1px_rgba(188,211,233,0.2)]" 
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ListOrdered size={18} className={activeTab === "clinic" ? "text-[#BCD3E9]" : "text-white/40"} />
              <span className="font-semibold text-sm tracking-wide">Live Clinic Queue</span>
            </button>

            <button 
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all text-left ${
                activeTab === "analytics" 
                  ? "bg-[#BCD3E9]/15 text-[#D5E8F0] shadow-[inset_0_0_0_1px_rgba(188,211,233,0.2)]" 
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BarChart2 size={18} className={activeTab === "analytics" ? "text-[#BCD3E9]" : "text-white/40"} />
              <span className="font-semibold text-sm tracking-wide">Yield Analytics</span>
            </button>

            <div className="h-[1px] bg-white/5 my-2 mx-4" />

            <button 
              onClick={() => setActiveTab("identity")}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all text-left ${
                activeTab === "identity" 
                  ? "bg-[#BCD3E9]/15 text-[#D5E8F0] shadow-[inset_0_0_0_1px_rgba(188,211,233,0.2)]" 
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <UserCircle size={18} className={activeTab === "identity" ? "text-[#BCD3E9]" : "text-white/40"} />
              <span className="font-semibold text-sm tracking-wide">Identity & Wallet</span>
            </button>
          </div>
        </aside>

        {/* CONTENT TABS */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === "triage" && (
              <motion.div 
                key="tab-triage"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl"
              >
                {/* LEFT COLUMN: Patient Triage Action / Input */}
        <section className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[70vh] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#7482C4]/5 to-transparent rounded-bl-full pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {triageStep === "form" && (
              <motion.div
                key="triage-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="text-[#BCD3E9] w-5 h-5" />
                  <span className="text-xs uppercase tracking-[0.2em] text-[#BCD3E9]/80 font-semibold">Triage Ticket Creation</span>
                </div>
                
                <h2 className="font-serif text-3xl md:text-4xl text-[#D5E8F0] uppercase leading-tight mb-8">
                  Get Your Verified Priority Position
                </h2>
                
                <form onSubmit={handleTriageSubmit} className="space-y-6">
                  {/* Symptoms Text area */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/60 block">Describe Symptoms</label>
                    <textarea
                      required
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g. Sudden severe chest tightness spreading to left arm, difficulty breathing..."
                      className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-2xl p-4 outline-none text-white focus:border-[#BCD3E9] transition-all resize-none placeholder:text-white/30 text-sm"
                    />
                  </div>

                  {/* Pain Level Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs uppercase tracking-wider text-white/60">
                      <span>Pain / Discomfort Intensity</span>
                      <span className="font-bold text-[#BCD3E9] text-sm">{painLevel} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={painLevel}
                      onChange={(e) => setPainLevel(Number(e.target.value))}
                      className="w-full accent-[#BCD3E9] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-white/40 font-mono">
                      <span>MILD</span>
                      <span>MODERATE</span>
                      <span>SEVERE</span>
                    </div>
                  </div>

                  {/* Wearable Device Syncer */}
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                        <Activity size={18} className="text-[#BCD3E9]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Wearable Health Vitals</p>
                        <p className="text-xs text-white/40">Sync smart band (heart rate, SpO2)</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsWearableSynced(!isWearableSynced)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        isWearableSynced 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                          : "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
                      }`}
                    >
                      {isWearableSynced ? "Synced ✓" : "Sync Wearable"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#BCD3E9] to-[#7482C4] text-[#112E64] font-bold text-md uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Shield size={18} />
                    Submit Secure Triage
                  </button>
                </form>
              </motion.div>
            )}

            {triageStep === "verifying" && (
              <motion.div
                key="triage-verifying"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-16 space-y-8"
              >
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-[#BCD3E9]/20" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-t-[#BCD3E9] border-r-transparent border-b-transparent border-l-transparent"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-[#BCD3E9] animate-pulse" />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-serif text-3xl uppercase leading-tight heading-gradient">Generating ZK-Triage</h3>
                  <p className="text-sm text-white/60 mt-3 max-w-sm">
                    Chainlink AI Attester is scoring symptoms off-chain against regional datasets, and zkVerify is compiling the zero-knowledge proof...
                  </p>
                </div>

                <div className="w-64 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 text-left">
                  <Lock size={16} className="text-[#BCD3E9]" />
                  <span className="text-xs font-mono text-white/50">Hiding medical diagnostics, publishing proof of triage</span>
                </div>
              </motion.div>
            )}

            {triageStep === "success" && (
              <motion.div
                key="triage-success"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col justify-between h-full py-6"
              >
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl uppercase text-[#D5E8F0]">ZK-Triage Verified</h3>
                    <p className="text-xs text-white/40 mt-1 font-mono">Proof Published: {zkProofHash || "zkVerify Block #772109"}</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-sm mx-auto text-center relative overflow-hidden">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#BCD3E9] font-bold">Priority Triage Score</p>
                    <p className="text-7xl font-bold mt-2 font-mono text-[#D5E8F0] tracking-tight">{generatedScore}</p>
                    <p className="text-[10px] text-white/40 mt-4 leading-relaxed font-mono">
                      {attestationReason || "Calculated from pain metrics, respiratory/cardiovascular indexes, & verified Apple Health vitals"}
                    </p>
                  </div>

                  {hasYielded ? (
                    <div className="bg-[#BCD3E9]/10 border border-[#BCD3E9]/20 rounded-2xl p-4 text-sm max-w-md mx-auto flex items-start gap-3 text-left">
                      <Coins className="text-[#BCD3E9] w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#D5E8F0]">Yield Complete!</p>
                        <p className="text-xs text-white/60">You yielded your spot to a high-urgency patient and received a 10.00 USDC stablecoin incentive.</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-white/50 max-w-xs mx-auto">
                      You have been placed in the clinic queue. If a patient with a more critical emergency arrives, you may receive a yield request.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setTriageStep("form")}
                  className="w-full mt-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm uppercase tracking-wider transition-all cursor-pointer"
                >
                  Create New Ticket
                </button>
              </motion.div>
            )}
          </AnimatePresence>
                </section>
              </motion.div>
            )}

            {activeTab === "clinic" && (
              <motion.div 
                key="tab-clinic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl"
              >
                {/* RIGHT COLUMN: Live Clinic Queue Dashboard */}
                <section className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl min-h-[70vh]">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <Activity className="text-emerald-400 w-5 h-5 animate-pulse" />
                        <span className="text-xs uppercase tracking-[0.2em] text-[#BCD3E9]/80 font-semibold">Live Clinic Queue</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                        <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono">Live Sync</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {queue.map((patient, index) => (
                        <motion.div
                          key={patient.id}
                          layout
                          className={`border transition-all rounded-2xl p-4 flex items-center justify-between ${
                            patient.isMe 
                              ? "bg-[#BCD3E9]/15 border-[#BCD3E9]/30 scale-[1.02] shadow-lg" 
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-mono font-bold ${
                              patient.isMe 
                                ? "bg-[#BCD3E9] text-[#112E64]" 
                                : "bg-white/5 border border-white/10 text-white/80"
                            }`}>
                              #{index + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">{patient.name}</span>
                                {patient.isMe && (
                                  <span className="text-[10px] bg-[#BCD3E9]/20 text-[#BCD3E9] font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                                <span>Waiting: {patient.timeWaiting}</span>
                                <span>•</span>
                                <span className="text-emerald-400 font-mono">ZK Verified</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-white/40">Priority Score</p>
                            <p className="text-3xl font-black font-mono text-[#D5E8F0] tracking-tight">{patient.urgency}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-8 flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <Lock size={20} className="text-[#BCD3E9]" />
                    </div>
                    <p className="text-sm text-white/55 leading-relaxed font-mono">
                      All queue updates are managed securely by the smart contract. Patient identity keys are mapped to their zk-proof tickets to guarantee privacy.
                    </p>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div 
                key="tab-analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl"
              >
                <section className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl min-h-[70vh] relative overflow-hidden">
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#BCD3E9]/5 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <div className="flex items-center gap-2 mb-8">
                    <BarChart2 className="text-[#BCD3E9] w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.2em] text-[#BCD3E9]/80 font-semibold">System Yield Analytics</span>
                  </div>

                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden hover:bg-white/10 transition-colors">
                      <div className="absolute -right-4 -bottom-4 opacity-5">
                        <Coins size={100} />
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-white/50 mb-2">Total USDC Distributed</p>
                      <p className="text-3xl font-bold text-[#D5E8F0] font-mono">$1,450.00</p>
                      <div className="flex items-center gap-1 text-emerald-400 mt-2">
                        <TrendingUp size={12} />
                        <span className="text-xs font-mono">+12% this week</span>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden hover:bg-white/10 transition-colors">
                      <div className="absolute -right-4 -bottom-4 opacity-5">
                        <Activity size={100} />
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-white/50 mb-2">Spots Yielded</p>
                      <p className="text-3xl font-bold text-[#D5E8F0] font-mono">142</p>
                      <div className="flex items-center gap-1 text-emerald-400 mt-2">
                        <TrendingUp size={12} />
                        <span className="text-xs font-mono">High liquidity</span>
                      </div>
                    </div>
                    <div className="bg-[#BCD3E9]/10 border border-[#BCD3E9]/20 rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Clock size={100} />
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-[#BCD3E9]/70 mb-2 font-bold">Avg Wait Time Saved</p>
                      <p className="text-3xl font-bold text-[#BCD3E9] font-mono">42m</p>
                      <p className="text-xs text-[#BCD3E9]/60 mt-2 font-mono">Per critical patient</p>
                    </div>
                  </div>

                  {/* Recent Yield Activity */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <History size={16} /> Recent Yield Transactions
                    </h3>
                    <div className="space-y-3">
                      {[
                        { time: "2 mins ago", amount: "+ 15.00 USDC", to: "0x3f...9a12", type: "Yielded to Urgency Level 85" },
                        { time: "14 mins ago", amount: "+ 10.00 USDC", to: "0x7b...4c21", type: "Yielded to Urgency Level 92" },
                        { time: "1 hour ago", amount: "+ 25.00 USDC", to: "0x9a...1f44", type: "Yielded to Urgency Level 98" },
                        { time: "3 hours ago", amount: "+ 5.00 USDC", to: "0x1c...8b99", type: "Yielded to Urgency Level 74" }
                      ].map((tx, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                              <ArrowUpRight size={16} className="text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#D5E8F0]">{tx.type}</p>
                              <div className="flex items-center gap-2 text-[10px] text-white/40 mt-1 font-mono">
                                <span>{tx.time}</span>
                                <span>•</span>
                                <span>Tx: {tx.to}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-400 font-mono">{tx.amount}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Settled</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "identity" && (
              <motion.div 
                key="tab-identity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl"
              >
                <section className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl min-h-[70vh]">
                  <div className="flex items-center gap-2 mb-8">
                    <UserCircle className="text-[#BCD3E9] w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.2em] text-[#BCD3E9]/80 font-semibold">Identity & Wallet Settings</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: ZK Profile */}
                    <div className="space-y-6">
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#BCD3E9] to-[#7482C4] flex items-center justify-center mb-4 shadow-lg shadow-[#BCD3E9]/20">
                          <Fingerprint size={32} className="text-[#112E64]" />
                        </div>
                        <h3 className="font-serif text-2xl text-[#D5E8F0] mb-1">ZK-Health Profile</h3>
                        <p className="text-xs text-white/50 leading-relaxed mb-6">
                          Your medical history is encrypted and stored locally. Only cryptographic proofs of your triage state are published on-chain.
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs text-white/60 uppercase tracking-wider">Status</span>
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                              <CheckCircle2 size={12} className="text-emerald-400" />
                              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Verified</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs text-white/60 uppercase tracking-wider">Identity Hash</span>
                            <span className="text-xs font-mono text-white/80">0x88f...3a9c</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs text-white/60 uppercase tracking-wider">Last Sync</span>
                            <span className="text-xs text-white/80">Today, 09:41 AM</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Wallet Config */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-[#112E64] to-[#0c1833] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                          <Wallet size={120} />
                        </div>
                        
                        <h3 className="font-serif text-xl text-[#D5E8F0] mb-6 flex items-center gap-2">
                          <Key size={18} className="text-[#BCD3E9]" /> Connected Wallet
                        </h3>
                        
                        {isConnected ? (
                          <div className="space-y-4 relative z-10">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Network</p>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <p className="text-sm font-semibold text-white">Ethereum Sepolia</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Wallet Address</p>
                              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                                <p className="text-sm font-mono text-[#BCD3E9]">{walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}</p>
                                <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/60 uppercase tracking-wider">
                                  Web3 Wallet
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 relative z-10">
                            <p className="text-sm text-white/50 mb-4">No wallet connected</p>
                            <div className="flex justify-center">
                              <ConnectButton />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Settings size={16} /> Preferences
                        </h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#D5E8F0]">Auto-Accept High Yields</p>
                            <p className="text-[10px] text-white/40 mt-1">Automatically yield if offer is &gt; 20 USDC</p>
                          </div>
                          <div className="w-10 h-6 bg-[#BCD3E9] rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(188,211,233,0.3)]">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-[#112E64] rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* SIMULATED TOAST POPUP: Yield Offer request */}
      <AnimatePresence>
        {showYieldOffer && (
          <div className="fixed bottom-6 right-6 z-50 w-full max-w-md p-4">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-[#112E64] border border-[#BCD3E9]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#BCD3E9]/5 rounded-bl-full pointer-events-none" />
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-[#BCD3E9]/15 flex items-center justify-center shrink-0 border border-[#BCD3E9]/20">
                  <Coins className="text-[#BCD3E9] w-5 h-5 animate-pulse" />
                </div>
                
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase tracking-wider text-[#BCD3E9] font-bold">Stablecoin Yield Offer</span>
                    <button 
                      onClick={() => setShowYieldOffer(false)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  <h4 className="font-serif text-lg font-semibold text-[#D5E8F0] uppercase tracking-wide leading-tight">
                    Yield Position #3 to Patient #8812?
                  </h4>
                  
                  <p className="text-xs text-white/60 leading-relaxed">
                    A critical emergency patient (urgency score 94) has entered. The smart contract offers a **10.00 USDC** refund if you yield your position and wait.
                  </p>
                  
                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={() => setShowYieldOffer(false)}
                      className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={acceptYieldOffer}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#BCD3E9] to-[#7482C4] text-[#112E64] font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      Yield & Earn
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
