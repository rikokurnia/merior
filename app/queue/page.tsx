"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, Mail, ArrowRight, Shield, HeartPulse, 
  Activity, CheckCircle2, Coins, Lock, RefreshCw, X, AlertTriangle 
} from "lucide-react";
import Grainient from "@/components/Grainient";
import { executeConfidentialTriage } from "@/lib/chainlink-agent";


export default function QueuePage() {
  // Wallet State
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletType, setWalletType] = useState<"smart" | "embedded" | "">("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"select" | "email" | "otp" | "connecting">("select");
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  useEffect(() => {
    const conn = localStorage.getItem("wallet_connected");
    if (conn === "true") {
      setIsConnected(true);
      setWalletType((localStorage.getItem("wallet_type") as any) || "embedded");
      setWalletAddress(localStorage.getItem("wallet_address") || "0x7482A1a12cd04547af575f4573c8caa1e94171a1");
    } else {
      window.location.href = "/";
    }
  }, []);
  
  // Triage / Queue State
  const [symptoms, setSymptoms] = useState("");
  const [painLevel, setPainLevel] = useState(5);
  const [isWearableSynced, setIsWearableSynced] = useState(false);
  const [isSubmittingTriage, setIsSubmittingTriage] = useState(false);
  const [triageStep, setTriageStep] = useState<"form" | "verifying" | "success">("form");
  const [generatedScore, setGeneratedScore] = useState(0);
  const [zkProofHash, setZkProofHash] = useState("");
  const [attestationReason, setAttestationReason] = useState("");
  
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

  // Attempt real wallet connection if window.ethereum exists
  const connectWeb3Wallet = async () => {
    setIsConnectingWallet(true);
    setModalStep("connecting");
    
    // Simulate smart wallet delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          setWalletType("smart");
          setIsModalOpen(false);
        }
      } catch (error) {
        console.error("Wallet connection rejected", error);
        // Fallback to mock connection if rejected/error
        connectMockWallet("smart");
      }
    } else {
      // No browser wallet, fallback to premium mock
      connectMockWallet("smart");
    }
    setIsConnectingWallet(false);
  };

  const connectMockWallet = (type: "smart" | "embedded") => {
    setIsConnected(true);
    setWalletType(type);
    setWalletAddress(
      type === "smart" 
        ? "0x4b791Ce943b7B9984b79A63725bF1cCe2fdf1964" 
        : "0x7482A1a12cd04547af575f4573c8caa1e94171a1"
    );
    setIsModalOpen(false);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setModalStep("otp");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpInput];
    newOtp[index] = value.substring(value.length - 1);
    setOtpInput(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // If filled completely, simulate success
    if (newOtp.every(val => val !== "")) {
      setTimeout(() => {
        connectMockWallet("embedded");
      }, 1000);
    }
  };

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setIsModalOpen(true);
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

      setGeneratedScore(result.urgencyScore);
      setZkProofHash(result.zkProofRef);
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

  const acceptYieldOffer = () => {
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

  const disconnectWallet = () => {
    localStorage.removeItem("wallet_connected");
    localStorage.removeItem("wallet_type");
    localStorage.removeItem("wallet_address");
    setIsConnected(false);
    setWalletAddress("");
    setWalletType("");
    setTriageStep("form");
    setSymptoms("");
    setPainLevel(5);
    setIsWearableSynced(false);
    setQueue(prev => prev.filter(p => !p.isMe));
    setShowYieldOffer(false);
    setHasYielded(false);
    window.location.href = "/";
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
          <AnimatePresence mode="wait">
            {!isConnected ? (
              <motion.button
                key="connect-btn"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                onClick={() => {
                  setModalStep("select");
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#BCD3E9] to-[#7482C4] text-[#112E64] font-semibold text-sm hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <Wallet size={16} />
                Connect Wallet
              </motion.button>
            ) : (
              <motion.div
                key="connected-info"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-4 py-2"
              >
                <div className="flex flex-col text-right hidden md:flex">
                  <span className="text-[10px] uppercase tracking-wider text-white/50">Base Sepolia</span>
                  <span className="text-xs font-mono font-medium">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
                <div className="flex items-center gap-2">
                  <Coins size={14} className="text-[#BCD3E9]" />
                  <span className="text-sm font-semibold">{balance.usdc} USDC</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
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
                      ? "bg-[#BCD3E9]/15 border-[#BCD3E9]/30" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-mono font-bold ${
                      patient.isMe 
                        ? "bg-[#BCD3E9] text-[#112E64]" 
                        : "bg-white/5 border border-white/10 text-white/80"
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{patient.name}</span>
                        {patient.isMe && (
                          <span className="text-[9px] bg-[#BCD3E9]/20 text-[#BCD3E9] font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-white/40 mt-1">
                        <span>Waiting: {patient.timeWaiting}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono">ZK Verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-white/40">Priority Score</p>
                    <p className="text-xl font-bold font-mono text-[#D5E8F0]">{patient.urgency}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-8 flex items-center gap-3">
            <Lock size={16} className="text-[#BCD3E9] shrink-0" />
            <p className="text-xs text-white/55 leading-relaxed font-mono">
              All queue updates are managed securely by the smart contract. Patient identity keys are mapped to their zk-proof tickets to guarantee privacy.
            </p>
          </div>
        </section>

      </main>

      {/* MODAL: Connect Wallet Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0c1833]/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#112E64] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden z-10"
            >
              {/* Grain background glow for modal */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#7482C4]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-center mb-6 relative">
                <h3 className="font-serif text-2xl uppercase tracking-wide">Connect Wallet</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {modalStep === "select" && (
                  <motion.div
                    key="step-select"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4"
                  >
                    <p className="text-xs text-white/50 mb-4 leading-relaxed">
                      Select your preferred connection type. Embedded Wallets are perfect for non-crypto users, while Smart Wallets provide full on-chain control.
                    </p>

                    {/* OPTION A: Embedded Wallet (Google / Social) */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#BCD3E9]/80 font-bold">Option 1: Embedded Wallet (Web2 Friendly)</p>
                      
                      <button
                        onClick={() => setModalStep("email")}
                        className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Mail size={18} className="text-[#BCD3E9]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Email / Social Passkey</p>
                            <p className="text-[10px] text-white/40">No setup needed. Quick authentication</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-white/60" />
                      </button>

                      <div className="grid grid-cols-3 gap-3">
                        <button 
                          onClick={() => connectMockWallet("embedded")}
                          className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                            <path
                              fill="#BCD3E9"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#BCD3E9"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#BCD3E9"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-6.16-4.53z"
                            />
                            <path
                              fill="#BCD3E9"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          <span className="text-[10px] mt-2 font-semibold">Google</span>
                        </button>
                        <button 
                          onClick={() => connectMockWallet("embedded")}
                          className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <span className="text-sm font-bold text-[#BCD3E9]">𝕏</span>
                          <span className="text-[10px] mt-2.5 font-semibold">Twitter</span>
                        </button>
                        <button 
                          onClick={() => connectMockWallet("embedded")}
                          className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <span className="text-xs font-semibold border border-[#BCD3E9] rounded-md px-1 text-[#BCD3E9]">Passkey</span>
                          <span className="text-[10px] mt-2 font-semibold font-mono">FaceID</span>
                        </button>
                      </div>
                    </div>

                    <div className="h-[1px] bg-white/10 my-4" />

                    {/* OPTION B: Smart Wallet (MetaMask / Coinbase Smart Wallet) */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#BCD3E9]/80 font-bold">Option 2: Browser & Smart Wallet (Web3 Pro)</p>

                      <button
                        onClick={connectWeb3Wallet}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#BCD3E9]/10 to-[#7482C4]/10 border border-[#BCD3E9]/20 rounded-2xl hover:bg-white/10 transition-all text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#BCD3E9]/20 flex items-center justify-center border border-[#BCD3E9]/30">
                            <Wallet size={18} className="text-[#BCD3E9]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#D5E8F0]">Coinbase Smart Wallet</p>
                            <p className="text-[10px] text-[#BCD3E9]/70">Zero gas fees, secure smart contract wallet</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-[#BCD3E9]" />
                      </button>

                      <button
                        onClick={connectWeb3Wallet}
                        className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <span className="text-orange-400 text-lg font-bold">🦊</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">MetaMask / Extension</p>
                            <p className="text-[10px] text-white/40">Connect via browser extension wallet</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-white/60" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {modalStep === "email" && (
                  <motion.div
                    key="step-email"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/60">Enter Email Address</label>
                        <input
                          required
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="e.g. physician@clinic.com"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none text-white focus:border-[#BCD3E9] transition-all placeholder:text-white/30 text-sm"
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setModalStep("select")}
                          className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#BCD3E9] to-[#7482C4] text-[#112E64] font-bold text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          Continue
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {modalStep === "otp" && (
                  <motion.div
                    key="step-otp"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-2">
                      <p className="text-sm text-white/80">We sent a verification code to</p>
                      <p className="text-sm font-semibold text-[#BCD3E9] font-mono">{emailInput}</p>
                    </div>

                    <div className="flex justify-center gap-2">
                      {otpInput.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold font-mono focus:border-[#BCD3E9] outline-none transition-all"
                        />
                      ))}
                    </div>

                    <div className="text-center">
                      <button 
                        type="button"
                        onClick={() => setModalStep("email")}
                        className="text-xs text-white/40 hover:text-white transition-colors"
                      >
                        Change Email Address
                      </button>
                    </div>
                  </motion.div>
                )}

                {modalStep === "connecting" && (
                  <motion.div
                    key="step-connecting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 space-y-6"
                  >
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-4 border-t-[#BCD3E9] border-r-transparent border-b-transparent border-l-transparent"
                      />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-semibold">Connecting to Smart Wallet...</p>
                      <p className="text-xs text-white/45">Accept the prompt in your wallet extension</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
