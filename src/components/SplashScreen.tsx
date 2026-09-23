import React, { useEffect, useState } from 'react';
import { Droplet, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Show splash for 1.4s then smoothly fade out
    const timer = setTimeout(() => {
      setFadingOut(true);
      const exitTimer = setTimeout(onComplete, 400);
      return () => clearTimeout(exitTimer);
    }, 1400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      onClick={() => {
        setFadingOut(true);
        setTimeout(onComplete, 200);
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950 text-white transition-opacity duration-400 cursor-pointer select-none ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl animate-pulse pointer-events-none" />

      {/* Animated Droplet Logo */}
      <div className="relative mb-6 flex items-center justify-center">
        <div className="relative w-28 h-28 flex items-center justify-center rounded-3xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-sky-400 shadow-2xl shadow-cyan-500/40 animate-droplet-in">
          {/* Inner wave simulation */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-30">
            <div className="absolute -bottom-4 -left-10 w-48 h-48 bg-white/40 rounded-[40%] animate-wave-slow" />
          </div>
          <Droplet className="w-14 h-14 text-white fill-white drop-shadow-md" />
        </div>

        {/* Small floating sparkles */}
        <div className="absolute -top-2 -right-2 text-cyan-300 animate-bounce">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
        Aqua<span className="text-cyan-400">Mind</span>
      </h1>

      {/* Tagline */}
      <p className="text-sm sm:text-base font-medium text-cyan-200/80 tracking-wide">
        Drink Water. Remember Everything.
      </p>

      {/* Loading bar */}
      <div className="mt-8 w-36 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full w-full animate-wave-fast" />
      </div>
    </div>
  );
};
