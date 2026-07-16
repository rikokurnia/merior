"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowDown, Mail, Wallet, ArrowRight, Shield, X, RefreshCw } from "lucide-react";
import Grainient from "@/components/Grainient";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [navTheme, setNavTheme] = useState<"light" | "dark">("light");
  const [activeIntroSlide, setActiveIntroSlide] = useState(0);
  const [activeService, setActiveService] = useState(0);

  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      window.location.href = "/queue";
    }
  }, [isConnected]);

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
          <ConnectButton />
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
            <div className="absolute right-6 md:right-20 top-1/2 -translate-y-1/2 w-full max-w-[90%] md:max-w-[55%] h-[60vh] flex flex-col justify-between pointer-events-none select-none z-10">
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
                      <p className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-brand-primary">
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
                      className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-brand-primary space-y-6"
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
                      className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-brand-primary space-y-6"
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
          
          <div className="container mx-auto px-6 md:px-20 z-10 w-full h-full flex items-center justify-center">
            <div className="w-full max-w-4xl h-[60vh] px-6 overflow-hidden relative">
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
                      className="h-[60vh] flex flex-col justify-center pl-4"
                    >
                      <span className="font-sans text-xl md:text-2xl tracking-[0.25em] text-brand-accent mb-4">
                        {service.num}
                      </span>
                      <h3 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 leading-[1.1] uppercase heading-gradient">
                        {service.title}
                      </h3>
                      <p className="text-xl md:text-2xl text-white/95 font-light max-w-3xl leading-relaxed">
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
            className="aspect-square max-h-[30vh] md:max-h-none rounded-2xl overflow-hidden relative"
          >
             <img 
               src="/images/hospital.jpeg" 
               alt="Hospital Facility" 
               className="w-full h-full object-cover"
             />
          </motion.div>
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-serif text-3xl md:text-5xl lg:text-6xl leading-[1.05] mb-6 text-brand-primary uppercase"
            >
              Wait times shouldn't be fatal, and lines shouldn't be rigid.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl mb-6 text-brand-primary/80 font-light"
            >
              Beyond traditional triage, we introduce efficiency and compassion through decentralized technology.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="font-serif text-2xl md:text-3xl mt-8 text-brand-primary uppercase"
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

    </div>
  );
}
