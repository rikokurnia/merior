"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowDown, Mail, Wallet, ArrowRight, Shield, X, RefreshCw } from "lucide-react";
import Grainient from "@/components/Grainient";

// Wallet SVG Logos
const MetaMaskLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 318.6 288.6" fill="none">
    <path d="M286.6 19.3L159.3 90 32 19.3l15.9 83.4L159.3 140l111.4-37.3z" fill="#E17726"/>
    <path d="M159.3 140L47.9 102.7 159.3 90z" fill="#E27625"/>
    <path d="M159.3 140l111.4-37.3L159.3 90z" fill="#E27625"/>
    <path d="M159.3 270l105.7-48.6 21.6-96.6H170.8z" fill="#E27625"/>
    <path d="M159.3 270L53.6 221.4 32 124.8h112.5z" fill="#E27625"/>
    <path d="M170.8 124.8l105.7 14.8-17.2 81.8z" fill="#E27625"/>
    <path d="M147.8 124.8L42.1 139.6l17.2 81.8z" fill="#E27625"/>
    <path d="M159.3 140l11.5-15.2h-23z" fill="#D7C1B1"/>
    <path d="M159.3 270v-48.6l-11.5 8.1z" fill="#D7C1B1"/>
    <path d="M159.3 270v-48.6l11.5 8.1z" fill="#D7C1B1"/>
    <path d="M159.3 221.4l-11.5-8.1h23z" fill="#F2A365"/>
    <path d="M170.8 124.8h105.7l10.1-41.4-65-38.3z" fill="#F2A365"/>
    <path d="M147.8 124.8H42.1l-10.1-41.4 65-38.3z" fill="#F2A365"/>
    <path d="M266.5 221.4l10.1-81.8-105.8-14.8z" fill="#E27625"/>
    <path d="M52.1 221.4l-10.1-81.8 105.8-14.8z" fill="#E27625"/>
    <path d="M159.3 213.3l107.2 8.1 10.1-96.6-105.8 14.8z" fill="#E27625"/>
    <path d="M159.3 213.3L52.1 221.4l10.1-96.6 105.8 14.8z" fill="#E27625"/>
    <path d="M159.3 90L47.9 102.7 42.1 43.4 97 45.1z" fill="#E27625"/>
    <path d="M159.3 90l111.4 12.7 5.8-59.3-54.9 1.7z" fill="#E27625"/>
    <path d="M212.8 45.1l53.7-41.4-5.8 59.3z" fill="#E27625"/>
    <path d="M105.8 45.1L52.1 3.7l5.8 59.3z" fill="#E27625"/>
  </svg>
);

const CoinbaseLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#0052FF" />
    <circle cx="12" cy="12" r="4.5" fill="white" />
  </svg>
);

const TrustWalletLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 5v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V5l-8-3z" fill="#0500FF" />
    <path d="M12 5.5L7 7.5v4c0 3.5 2 6.5 5 7.5 3-1 5-4 5-7.5v-4l-5-2z" fill="white" />
  </svg>
);

const RainbowLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="url(#rainbowGrad)" />
    <defs>
      <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF007A" />
        <stop offset="50%" stopColor="#FFD600" />
        <stop offset="100%" stopColor="#00F0FF" />
      </linearGradient>
    </defs>
  </svg>
);

const PhantomLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.12.04.24-.05.24-.17v-1.63c0-.66.38-1.26.97-1.53l1.19-.54c.5-.23.82-.73.82-1.28v-.54c0-.28-.22-.5-.5-.5h-1.09c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5h2.09c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5h-1.09c-.28 0-.5.22-.5.5v.54c0 .55.32 1.05.82 1.28l1.19.54c.59.27.97.87.97 1.53v1.63c0 .12.12.21.24.17C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z" fill="#4E44E7" />
    <circle cx="9.5" cy="10.5" r="1.5" fill="white" />
    <circle cx="14.5" cy="10.5" r="1.5" fill="white" />
    <circle cx="9.5" cy="10.5" r="0.5" fill="black" />
    <circle cx="14.5" cy="10.5" r="0.5" fill="black" />
  </svg>
);

const RabbyLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#3B7DFF" />
    <path d="M8 8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V8z" fill="white" />
    <circle cx="10.5" cy="10" r="1" fill="#3B7DFF" />
    <circle cx="13.5" cy="10" r="1" fill="#3B7DFF" />
  </svg>
);

const GenericWalletLogo = () => (
  <svg className="w-6 h-6 text-[#BCD3E9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
    <line x1="16" y1="12" x2="16.01" y2="12" strokeLinecap="round" />
    <path d="M3 10h18" />
  </svg>
);

const getWalletLogo = (id: string) => {
  switch (id) {
    case "metamask":
      return <MetaMaskLogo />;
    case "coinbase":
      return <CoinbaseLogo />;
    case "trust":
      return <TrustWalletLogo />;
    case "rainbow":
      return <RainbowLogo />;
    case "phantom":
      return <PhantomLogo />;
    case "rabby":
      return <RabbyLogo />;
    default:
      return <GenericWalletLogo />;
  }
};

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [navTheme, setNavTheme] = useState<"light" | "dark">("light");
  const [activeIntroSlide, setActiveIntroSlide] = useState(0);
  const [activeService, setActiveService] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"select" | "email" | "otp" | "connecting">("select");
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<{ id: string; name: string; icon: string; desc: string }[]>([]);

  useEffect(() => {
    const conn = localStorage.getItem("wallet_connected");
    if (conn === "true") {
      setIsConnected(true);
      window.location.href = "/queue";
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const wallets: { id: string; name: string; icon: string; desc: string }[] = [];
      const eth = (window as any).ethereum;
      
      const checkProvider = (p: any) => {
        if (p.isMetaMask && !wallets.some(w => w.id === "metamask")) {
          wallets.push({ id: "metamask", name: "MetaMask", icon: "🦊", desc: "MetaMask browser extension" });
        }
        if (p.isCoinbaseWallet && !wallets.some(w => w.id === "coinbase")) {
          wallets.push({ id: "coinbase", name: "Coinbase Wallet", icon: "🛡️", desc: "Coinbase browser extension" });
        }
        if (p.isTrust && !wallets.some(w => w.id === "trust")) {
          wallets.push({ id: "trust", name: "Trust Wallet", icon: "🛡️", desc: "Trust browser extension" });
        }
        if (p.isRainbow && !wallets.some(w => w.id === "rainbow")) {
          wallets.push({ id: "rainbow", name: "Rainbow", icon: "🌈", desc: "Rainbow browser extension" });
        }
        if (p.isRabby && !wallets.some(w => w.id === "rabby")) {
          wallets.push({ id: "rabby", name: "Rabby Wallet", icon: "🐰", desc: "Rabby browser extension" });
        }
      };

      if (eth) {
        if (eth.providers && Array.isArray(eth.providers)) {
          eth.providers.forEach(checkProvider);
        } else {
          checkProvider(eth);
        }

        if (wallets.length === 0) {
          wallets.push({ id: "injected", name: "Browser Wallet", icon: "🔌", desc: "Injected Web3 provider" });
        }
      }
      
      const phantom = (window as any).phantom?.ethereum;
      if (phantom && phantom.isPhantom && !wallets.some(w => w.id === "phantom")) {
        wallets.push({ id: "phantom", name: "Phantom", icon: "👻", desc: "Phantom browser extension" });
      } else if (eth && eth.isPhantom && !wallets.some(w => w.id === "phantom")) {
        wallets.push({ id: "phantom", name: "Phantom", icon: "👻", desc: "Phantom browser extension" });
      }

      setDetectedWallets(wallets);
    }
  }, []);

  const connectWallet = (type: "smart" | "embedded", address?: string) => {
    localStorage.setItem("wallet_connected", "true");
    localStorage.setItem("wallet_type", type);
    localStorage.setItem("wallet_address", address || (type === "smart" ? "0x4b791Ce943b7B9984b79A63725bF1cCe2fdf1964" : "0x7482A1a12cd04547af575f4573c8caa1e94171a1"));
    setIsConnected(true);
    setIsModalOpen(false);
    window.location.href = "/queue";
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

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    if (newOtp.every(val => val !== "")) {
      setIsConnecting(true);
      setModalStep("connecting");
      setTimeout(() => {
        setIsConnecting(false);
        connectWallet("embedded");
      }, 1500);
    }
  };

  const connectWeb3Wallet = async () => {
    setIsConnecting(true);
    setModalStep("connecting");
    
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          connectWallet("smart", accounts[0]);
          setIsConnecting(false);
          return;
        }
      } catch (error) {
        console.error("Wallet connection rejected", error);
        setIsConnecting(false);
        setModalStep("select");
        return;
      }
    } else {
      // Fallback for demo purposes if no wallet is installed
      await new Promise((resolve) => setTimeout(resolve, 1500));
      connectWallet("smart");
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    // Nav Theme Observer
    const sections = document.querySelectorAll("section[data-theme]");
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const theme = entry.target.getAttribute("data-theme") as "light" | "dark";
            setNavTheme(theme === "dark" ? "light" : "dark");
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1
      }
    );
    sections.forEach((sec) => navObserver.observe(sec));

    // Intro Slides Observer
    const slides = document.querySelectorAll(".intro-slide");
    const slideObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveIntroSlide(Number(entry.target.getAttribute("data-index")));
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5
      }
    );
    slides.forEach((s) => slideObserver.observe(s));

    // Services Slides Observer
    const serviceSlides = document.querySelectorAll(".service-slide");
    const serviceObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveService(Number(entry.target.getAttribute("data-index")));
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5
      }
    );
    serviceSlides.forEach((s) => serviceObserver.observe(s));

    return () => {
      navObserver.disconnect();
      slideObserver.disconnect();
      serviceObserver.disconnect();
    };
  }, []);

  const { scrollYProgress: heroScrollProgress } = useScroll({
    container: containerRef,
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Scale down the hero text as we scroll
  const scale = useTransform(heroScrollProgress, [0, 1], [1, 0.7]);
  const opacity = useTransform(heroScrollProgress, [0, 0.8], [1, 0]);
  const y = useTransform(heroScrollProgress, [0, 1], [0, 150]);

  const services = [
    { num: "01", title: "AI-DRIVEN TRIAGE", desc: "Secure symptom analysis and biometric validation processed within a Confidential AI Trusted Execution Environment." },
    { num: "02", title: "ZERO-KNOWLEDGE PRIVACY", desc: "Cryptographically verify patient urgency on-chain without revealing the underlying sensitive medical data." },
    { num: "03", title: "PRIORITY YIELD QUEUES", desc: "Incentivize non-critical patients to yield their spot using automated, programmable stablecoin rewards." },
    { num: "04", title: "CROSS-CHAIN SETTLEMENT", desc: "Seamlessly distribute USDC yield rewards across multiple blockchain networks using Chainlink CCIP." },
    { num: "05", title: "VERIFIED HEALTH ORACLES", desc: "Prevent symptom exaggeration by corroborating inputs with verified wearable and biometric oracle data streams." },
  ];

  return (
    <div ref={containerRef} className="h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth text-brand-secondary hide-scrollbar relative">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 px-8 md:px-16 py-6 grid grid-cols-3 items-center transition-colors duration-300 ${
        navTheme === "light" ? "text-[#D5E8F0]" : "text-[#112E64]"
      }`}>
        <div className="flex justify-start">
          {/* Empty left side to balance centered logo */}
        </div>
        <div className="flex justify-center">
          <div className="relative w-48 h-16 md:w-60 md:h-20 transition-all duration-300">
            <img 
              src="/images/logo-light.png" 
              alt="IWC Logo" 
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
                navTheme === "light" ? "opacity-100" : "opacity-0"
              }`}
            />
            <img 
              src="/images/logo-dark.png" 
              alt="IWC Logo" 
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
                navTheme === "dark" ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
        <div className="flex justify-end items-center gap-6">
          {isConnected ? (
            <button 
              onClick={() => window.location.href = "/queue"}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-sans font-bold border border-current rounded-full px-5 py-2 hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              <span>Dashboard</span>
            </button>
          ) : (
            <button 
              onClick={() => {
                setModalStep("select");
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-sans font-bold border border-current rounded-full px-5 py-2 hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              <Wallet size={12} />
              <span>Connect Wallet</span>
            </button>
          )}
          <button className="flex items-center gap-3 text-sm uppercase tracking-widest font-sans font-semibold hover:opacity-85 transition-opacity">
            <span>MENU</span>
            <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
              <div className="w-1.5 h-1.5 bg-current rounded-full" />
              <div className="w-1.5 h-1.5 bg-current rounded-full" />
              <div className="w-1.5 h-1.5 bg-current rounded-full" />
              <div className="w-1.5 h-1.5 bg-current rounded-full" />
            </div>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="h-screen flex flex-col justify-start pt-[18vh] items-center relative z-10 px-4 overflow-hidden snap-start" data-theme="dark">
        {/* ReactBits Grainient Background */}
        <div className="absolute inset-0 -z-10">
          <Grainient
            color1="#7482C4"
            color2="#112E64"
            color3="#7482C4"
            timeSpeed={0.25}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={5}
            warpSpeed={2}
            warpAmplitude={50}
            blendAngle={0}
            blendSoftness={0.05}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={2}
            grainAnimated={false}
            contrast={1.5}
            gamma={1}
            saturation={1}
            centerX={0}
            centerY={0}
            zoom={0.9}
          />
        </div>

        <motion.div 
          style={{ scale, opacity, y }}
          className="w-full max-w-7xl mx-auto px-6 md:px-20 flex flex-col items-center text-center sticky top-[12vh]"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="font-serif text-[clamp(3rem,11vw,12rem)] leading-[0.9] tracking-tight uppercase heading-gradient w-full"
          >
            Merior
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-8 text-xl md:text-3xl font-light tracking-wide max-w-2xl text-brand-accent/80"
          >
            Privacy-Preserving AI Triage &<br />Priority Yield Queues
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-12 flex flex-col items-center gap-4 text-xs uppercase tracking-[0.3em] text-brand-accent/60"
        >
          <span>Scroll Down</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ArrowDown size={16} />
          </motion.div>
        </motion.div>
      </section>

      {/* Intro Section - Snap Scroll */}
      <section className="relative w-full h-[300vh] bg-[#D5E8F0] border-t border-brand-secondary/10 z-20" data-theme="light">
        <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
          
          {/* Logo Container on the Left */}
          <div className="absolute left-[8%] md:left-[12%] top-1/2 -translate-y-1/2 w-[35vw] h-[35vw] max-w-[360px] max-h-[360px] flex items-center justify-center pointer-events-none select-none">
            
            {/* Concentric Circles */}
            <motion.div 
              animate={{ opacity: activeIntroSlide === 2 ? 1 : 0 }}
              transition={{ duration: 1 }}
              className="absolute w-[220%] h-[220%] pointer-events-none flex items-center justify-center"
            >
              <div className="absolute w-[30%] h-[30%] rounded-full border border-brand-primary/10" />
              <div className="absolute w-[50%] h-[50%] rounded-full border border-brand-primary/10" />
              <div className="absolute w-[70%] h-[70%] rounded-full border border-brand-primary/10" />
              <div className="absolute w-[90%] h-[90%] rounded-full border border-brand-primary/10" />
            </motion.div>

            {/* The Logo */}
            <motion.div 
              animate={{ 
                scale: activeIntroSlide === 0 ? 1.2 : activeIntroSlide === 1 ? 0.8 : 0.5, 
                opacity: activeIntroSlide === 0 ? 0.4 : activeIntroSlide === 1 ? 0.65 : 1,
                filter: activeIntroSlide === 0 ? "blur(12px)" : activeIntroSlide === 1 ? "blur(6px)" : "blur(0px)",
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full h-full"
            >
              <img src="/images/logo-dark.png" alt="" className="w-full h-full object-contain" />
            </motion.div>
          </div>

          <div className="container mx-auto px-6 md:px-20 z-10 w-full h-full flex items-center justify-end relative">
            
            {/* Static PPT Display Container (Absolute positioned, behind the scroll container) */}
            <div className="absolute right-6 md:right-20 top-1/2 -translate-y-1/2 w-[90%] md:w-1/2 h-[60vh] flex flex-col justify-between pointer-events-none select-none z-10">
              <div className="h-[45vh] flex items-center relative">
                <AnimatePresence mode="wait">
                  {activeIntroSlide === 0 && (
                    <motion.div
                      key="slide-0"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <p className="text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed text-brand-primary">
                        Physical queues are rigid, inefficient, and often dangerous. In emergency rooms and clinics, time is the most critical asset, yet it is allocated on a first-come, first-served basis rather than by true medical urgency.
                      </p>
                    </motion.div>
                  )}

                  {activeIntroSlide === 1 && (
                    <motion.div
                      key="slide-1"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-brand-primary space-y-6"
                    >
                      <p>Merior introduces programmatic empathy. By leveraging Confidential AI within a Trusted Execution Environment (TEE), we accurately analyze patient symptoms and biometric data off-chain to determine a verified urgency score without ever exposing sensitive health records.</p>
                    </motion.div>
                  )}

                  {activeIntroSlide === 2 && (
                    <motion.div
                      key="slide-2"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-brand-primary space-y-6"
                    >
                      <p>Lower-priority patients are financially incentivized via stablecoin rewards to yield their spot to those in critical condition. It's a closed-loop system where urgency meets programmable economic incentives.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shared Progress Bar */}
              <div className="flex items-center gap-6 mt-6 text-brand-primary/80">
                <span className="font-sans text-sm font-semibold">{activeIntroSlide + 1}/3</span>
                <div className="w-48 h-[2px] bg-brand-primary/20 relative rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute left-0 top-0 h-full bg-brand-primary" 
                    animate={{ 
                      width: activeIntroSlide === 0 ? "33.33%" : activeIntroSlide === 1 ? "66.66%" : "100%" 
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Absolute snapping targets positioned over the h-[300vh] container */}
        <div className="absolute inset-0 pointer-events-none flex flex-col z-0">
          <div className="intro-slide h-screen snap-start" data-index="0" />
          <div className="intro-slide h-screen snap-start" data-index="1" />
          <div className="intro-slide h-screen snap-start" data-index="2" />
        </div>
      </section>

      {/* Sticky Services Section */}
      <section className="relative w-full h-[500vh] bg-[#1E3A8A]" data-theme="dark">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          {/* ReactBits Grainient Background */}
          <div className="absolute inset-0">
            <Grainient
              color1="#7482C4"
              color2="#112E64"
              color3="#7482C4"
              timeSpeed={0.25}
              colorBalance={0}
              warpStrength={1}
              warpFrequency={5}
              warpSpeed={2}
              warpAmplitude={50}
              blendAngle={0}
              blendSoftness={0.05}
              rotationAmount={500}
              noiseScale={2}
              grainAmount={0.1}
              grainScale={2}
              grainAnimated={false}
              contrast={1.5}
              gamma={1}
              saturation={1}
              centerX={0}
              centerY={0}
              zoom={0.9}
            />
          </div>
          
          <div className="container mx-auto px-6 md:px-20 z-10 w-full h-full flex items-center justify-end">
            <div className="w-full md:w-3/5 h-[60vh] overflow-hidden relative">
              <motion.div
                animate={{ y: `calc(10vh - ${activeService * 60}vh)` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="flex flex-col justify-start"
              >
                {services.map((service, idx) => {
                  const isActive = activeService === idx;
                  return (
                    <motion.div
                      key={idx}
                      animate={{
                        opacity: isActive ? 1 : 0.15,
                        scale: isActive ? 1.02 : 0.95,
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-[60vh] flex flex-col justify-center"
                    >
                      <span className="font-sans text-xl tracking-[0.2em] text-brand-accent/40 mb-6">
                        {service.num}
                      </span>
                      <h3 className="font-serif text-5xl md:text-8xl mb-8 leading-[0.9] uppercase heading-gradient">
                        {service.title}
                      </h3>
                      <p className="text-2xl text-brand-accent/70 font-light max-w-xl leading-relaxed">
                        {service.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Absolute snapping targets positioned over the h-[500vh] container */}
        <div className="absolute inset-0 pointer-events-none flex flex-col z-0">
          <div className="service-slide h-screen snap-start" data-index="0" />
          <div className="service-slide h-screen snap-start" data-index="1" />
          <div className="service-slide h-screen snap-start" data-index="2" />
          <div className="service-slide h-screen snap-start" data-index="3" />
          <div className="service-slide h-screen snap-start" data-index="4" />
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="h-screen flex items-center px-6 md:px-20 bg-brand-secondary text-brand-primary relative z-20 snap-start" data-theme="light">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-square max-h-[30vh] md:max-h-none bg-[#B0CBE0] rounded-2xl overflow-hidden relative"
          >
             {/* Abstract organic shape in place of family illustration */}
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4/5 h-4/5 bg-brand-primary/15 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-[spin_15s_linear_infinite] mix-blend-multiply blur-2xl" />
                <div className="absolute w-3/5 h-3/5 bg-brand-primary/20 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] animate-[spin_10s_linear_infinite_reverse] mix-blend-multiply blur-3xl" />
             </div>
          </motion.div>
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-serif text-5xl md:text-7xl leading-[1.05] mb-12 text-brand-primary uppercase"
            >
              Wait times shouldn't be fatal, and lines shouldn't be rigid.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-2xl mb-8 text-brand-primary/80 font-light"
            >
              Beyond traditional triage, we introduce efficiency and compassion through decentralized technology.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="font-serif text-5xl mt-16 text-brand-primary uppercase"
            >
              Care First. Always.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="min-h-screen flex items-center py-16 md:py-24 px-6 md:px-20 bg-brand-primary z-20 relative overflow-hidden snap-start" data-theme="dark">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-brand-secondary/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <h2 className="text-sm uppercase tracking-[0.2em] mb-20 text-brand-accent/60">Solutions for Every Healthcare Facility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Urgent Care Clinics', 'Public Hospitals', 'Private Practices', 'Telehealth Providers', 'Emergency Rooms'].map((title, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/3] bg-brand-secondary/5 backdrop-blur-sm border border-brand-secondary/10 flex flex-col justify-between p-10 hover:bg-brand-secondary/10 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,rgba(188,211,233,0.15)_0%,transparent_70%)]" />
                  
                  {/* Abstract particle orb representation */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-20 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
                     <div className="w-full h-full border border-brand-secondary/20 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center">
                       <div className="w-3/4 h-3/4 border-t border-brand-secondary/40 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
                     </div>
                  </div>

                  <div className="w-12 h-12 rounded-full border border-brand-accent/30 flex items-center justify-center self-end group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <div className="w-2 h-2 bg-brand-accent rounded-full" />
                  </div>
                  <h3 className="font-serif text-4xl md:text-5xl uppercase relative z-10 leading-[0.9] heading-gradient">{title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="min-h-screen flex items-center py-16 md:py-24 px-6 md:px-20 z-20 relative border-t border-brand-secondary/10 overflow-hidden snap-start" data-theme="dark">
        {/* ReactBits Grainient Background */}
        <div className="absolute inset-0 -z-10">
          <Grainient
            color1="#7482C4"
            color2="#112E64"
            color3="#7482C4"
            timeSpeed={0.25}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={5}
            warpSpeed={2}
            warpAmplitude={50}
            blendAngle={0}
            blendSoftness={0.05}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={2}
            grainAnimated={false}
            contrast={1.5}
            gamma={1}
            saturation={1}
            centerX={0}
            centerY={0}
            zoom={0.9}
          />
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 w-full">
          <div>
            <h2 className="font-serif text-[clamp(4rem,8vw,8rem)] leading-[0.8] mb-12 uppercase heading-gradient">Transform<br />your clinic's<br />queue</h2>
            <div className="mt-24">
              <p className="text-sm uppercase tracking-widest text-brand-accent/60 mb-4">Contact Us</p>
              <a href="mailto:partner@merior.health" className="text-3xl hover:text-brand-accent transition-colors block mb-2">partner@merior.health</a>
              <p className="text-3xl font-light">866.694.6292</p>
            </div>
          </div>
          <div className="glass-panel p-12 rounded-xl border-t border-white/10 shadow-2xl">
            <form className="space-y-12 flex flex-col">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="border-b border-brand-secondary/30 pb-4">
                  <label className="text-xs uppercase tracking-[0.2em] text-brand-accent/60 block mb-4">Full Name *</label>
                  <input type="text" className="w-full bg-transparent outline-none text-2xl placeholder:text-brand-secondary/20" placeholder="Your Name" />
                </div>
                <div className="border-b border-brand-secondary/30 pb-4">
                  <label className="text-xs uppercase tracking-[0.2em] text-brand-accent/60 block mb-4">E-mail *</label>
                  <input type="email" className="w-full bg-transparent outline-none text-2xl placeholder:text-brand-secondary/20" placeholder="Your E-mail" />
                </div>
              </div>
              <div className="border-b border-brand-secondary/30 pb-4">
                <label className="text-xs uppercase tracking-[0.2em] text-brand-accent/60 block mb-4">Facility Type *</label>
                <select className="w-full bg-transparent outline-none text-2xl appearance-none text-brand-secondary">
                  <option className="bg-[#12234A]">Urgent Care</option>
                  <option className="bg-[#12234A]">Hospital</option>
                  <option className="bg-[#12234A]">Private Clinic</option>
                </select>
              </div>
              <div className="border-b border-brand-secondary/30 pb-4">
                <label className="text-xs uppercase tracking-[0.2em] text-brand-accent/60 block mb-4">Tell us a little about your facility</label>
                <textarea className="w-full bg-transparent outline-none text-xl resize-none h-16 placeholder:text-brand-secondary/20" placeholder="I would like to integrate Merior into our triage workflow..."></textarea>
              </div>
              
              <button className="bg-brand-secondary text-brand-primary font-bold py-5 px-10 rounded-full self-start hover:bg-white transition-all hover:scale-105 uppercase tracking-widest text-sm mt-8">
                Send Message &rarr;
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CSS to hide scrollbar in sticky section */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Wallet Connection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#07132a]/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#0a1b3a] border border-white/10 rounded-3xl p-8 shadow-2xl text-white overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#BCD3E9]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Connect Wallet</h3>
                  <p className="text-xs text-white/50 mt-1">Select your preferred login method</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} className="text-white/60" />
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
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#BCD3E9]/80 font-bold">Embedded Wallet</p>
                      
                      <button
                        onClick={() => setModalStep("email")}
                        className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                            <Mail size={18} className="text-[#BCD3E9]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Sign in with Email</p>
                            <p className="text-[10px] text-white/40">Secure verification code via inbox</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-white/60" />
                      </button>

                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => {
                            setIsConnecting(true);
                            setModalStep("connecting");
                            setTimeout(() => {
                              setIsConnecting(false);
                              connectWallet("embedded");
                            }, 1500);
                          }}
                          className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                          </svg>
                          <span className="text-[10px] mt-2 font-semibold">Google</span>
                        </button>

                        <button 
                          onClick={() => {
                            setIsConnecting(true);
                            setModalStep("connecting");
                            setTimeout(() => {
                              setIsConnecting(false);
                              connectWallet("embedded");
                            }, 1500);
                          }}
                          className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          <span className="text-[10px] mt-2 font-semibold">Twitter</span>
                        </button>

                        <button 
                          onClick={() => {
                            setIsConnecting(true);
                            setModalStep("connecting");
                            setTimeout(() => {
                              setIsConnecting(false);
                              connectWallet("embedded");
                            }, 1500);
                          }}
                          className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <span className="text-xs font-semibold border border-[#BCD3E9] rounded-md px-1 text-[#BCD3E9]">Passkey</span>
                          <span className="text-[10px] mt-2 font-semibold font-mono">FaceID</span>
                        </button>
                      </div>
                    </div>

                    <div className="h-[1px] bg-white/10 my-4" />

                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#BCD3E9]/80 font-bold">External Wallets</p>

                      {detectedWallets.length > 0 ? (
                        detectedWallets.map((wallet) => (
                          <button
                            key={wallet.id}
                            onClick={connectWeb3Wallet}
                            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 p-2">
                                {getWalletLogo(wallet.id)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{wallet.name}</p>
                                <p className="text-[10px] text-white/40">{wallet.desc} (Detected)</p>
                              </div>
                            </div>
                            <ArrowRight size={16} className="text-white/60" />
                          </button>
                        ))
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-white/50 bg-white/5 border border-white/5 p-3.5 rounded-2xl">
                            No browser wallet extensions detected. Use email/social sign-in above or install MetaMask.
                          </p>
                          <button
                            onClick={() => window.open("https://metamask.io/download/", "_blank")}
                            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 p-2">
                                {getWalletLogo("metamask")}
                              </div>
                              <div>
                                <p className="text-sm font-semibold">Install MetaMask</p>
                                <p className="text-[10px] text-white/40">Browser extension (Not detected)</p>
                              </div>
                            </div>
                            <ArrowRight size={16} className="text-white/60" />
                          </button>
                        </div>
                      )}
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
                          placeholder="e.g. user@iwcglobal.net"
                          className="w-full bg-[#0d224a] border border-white/10 rounded-2xl p-4 outline-none text-white focus:border-[#BCD3E9] transition-all placeholder:text-white/30 text-sm animate-none"
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
                          className="flex-1 py-3.5 rounded-2xl bg-[#BCD3E9] text-[#112E64] hover:bg-white font-semibold text-sm transition-all cursor-pointer"
                        >
                          Send Code
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
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Verify your Email</h4>
                      <p className="text-xs text-white/50">Enter the code sent to {emailInput}</p>
                    </div>

                    <div className="flex justify-center gap-2">
                      {otpInput.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:border-[#BCD3E9] outline-none transition-all"
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setModalStep("email")}
                      className="text-xs text-[#BCD3E9] hover:underline cursor-pointer"
                    >
                      Back to Email
                    </button>
                  </motion.div>
                )}

                {modalStep === "connecting" && (
                  <motion.div
                    key="step-connecting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 flex flex-col items-center justify-center space-y-4"
                  >
                    <RefreshCw className="w-8 h-8 text-[#BCD3E9] animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-semibold">Contacting Dynamic Enclave...</p>
                      <p className="text-xs text-white/40 mt-1">Generating secure embedded wallet keys</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
