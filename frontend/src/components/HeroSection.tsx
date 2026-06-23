
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '../context/AuthContext';

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const phrase = "Verifi: Where you verify realities.".split(" ");
  const titleText = "Verifi*".split("");
  
  // Create some random particles for the data-stream effect
  const particles = Array.from({ length: 20 });

  return (
    <section className="relative min-h-screen flex flex-col p-6 overflow-hidden bg-gray-100">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
      />
      
      {/* Bottom Blur Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none backdrop-blur-xl" 
        style={{ 
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 45%)', 
          maskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
          zIndex: 1 
        }}
      ></div>

      {/* Floating data particles */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute z-10 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(0,240,255,0.8)]"
          initial={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            opacity: Math.random() * 0.5 + 0.2
          }}
          animate={{
            y: [null, `${Math.random() * 100}vh`],
            opacity: [null, Math.random() * 0.8 + 0.2, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
      
      {/* Navbar */}
      <Navbar isDarkBg={true} />

      {/* Hero Content Left (Command Aesthetic) */}
      <div className="relative z-30 flex-1 flex flex-col items-start justify-center w-full mt-20 sm:mt-16 text-left max-w-7xl mx-auto px-4 md:px-12">
        
        {/* Title and Button Container */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full relative z-20 mb-4 gap-4">
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tight text-white flex overflow-hidden">
            {titleText.map((letter, i) => (
              <span
                key={i}
                className="inline-block animate-blur-fade-up"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </h1>

          {/* Call to Action Buttons (Right aligned in Flexbox) */}
          <div
            className="flex flex-col items-center w-full max-w-xs gap-3 mt-2 md:mt-6 md:ml-auto animate-blur-fade-up"
            style={{ animationDelay: '0.8s' }}
          >
            <Link 
              to="/verify" 
              className="w-full liquid-glass text-white hover:bg-white/20 transition-all duration-300 rounded-full px-8 py-3 font-medium text-center flex items-center justify-center gap-2"
            >
              Get Started for free
              <ArrowRight size={20} />
            </Link>
            
            <span className="text-slate-300 text-sm font-medium">Or</span>
            
            <Link 
              to={isAuthenticated ? "/dashboard" : "/login"} 
              className="w-full liquid-glass text-white hover:bg-white/20 transition-all duration-300 rounded-full px-8 py-3 font-medium text-center block flex items-center justify-center gap-2"
            >
              {isAuthenticated ? "My Account" : "Login to your Account"} <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Settling phrase - Left Aligned below heading */}
        <div 
          className="flex flex-wrap gap-x-2 gap-y-1 text-base sm:text-xl md:text-2xl font-medium text-primary mb-4 sm:mb-6 justify-start w-full animate-blur-fade-up drop-shadow-md"
          style={{ animationDelay: '0.9s' }}
        >
          {phrase.map((word, i) => (
            <span key={i}>{word}</span>
          ))}
        </div>

        <p
          className="text-sm sm:text-lg md:text-xl text-slate-200 max-w-xl mb-6 sm:mb-8 animate-blur-fade-up drop-shadow-md"
          style={{ animationDelay: '1.0s' }}
        >
          Real-time fact-checking powered by Openrouter & Agentic AI. Paste a claim, URL, or image to uncover the truth.
        </p>
      </div>
    </section>
  );
}
