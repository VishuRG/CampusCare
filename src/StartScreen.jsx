import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Radio,
  Activity,
  ArrowRight,
  MapPin,
  Zap,
} from "lucide-react";

export default function StartScreen({ onStart }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }

        return prev + 2;
      });
    }, 35);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative flex items-center justify-center">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl -top-40 -left-40" />
        <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -bottom-40 -right-40" />

        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Main */}
      <div className="relative z-10 w-full max-w-5xl px-6">

        {/* Top status */}
        <div className="flex justify-between items-center mb-12">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="text-rose-400" size={22} />
            </div>

            <div>
              <p className="font-bold tracking-wider">CAMPUSCARE</p>
              <p className="text-xs text-slate-500">
                Emergency Response Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM ONLINE
          </div>

        </div>

        {/* Center */}
        <div className="text-center">

          {/* Radar */}
          <div className="relative mx-auto w-40 h-40 mb-10">

            <div className="absolute inset-0 rounded-full border border-rose-500/20 animate-ping" />

            <div className="absolute inset-4 rounded-full border border-rose-500/30" />

            <div className="absolute inset-8 rounded-full border border-rose-500/40" />

            <div className="absolute inset-12 rounded-full bg-rose-500/10 border border-rose-500/50 flex items-center justify-center">

              <ShieldAlert
                size={38}
                className="text-rose-400"
              />

            </div>

            <div className="absolute left-1/2 top-0 bottom-1/2 w-px bg-gradient-to-b from-rose-400 to-transparent origin-bottom animate-[spin_2s_linear_infinite]" />
          </div>

          <p className="text-rose-400 uppercase tracking-[0.4em] text-xs font-semibold mb-4">
            Intelligent Emergency Management
          </p>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight">
            Campus
            <span className="text-rose-500">Care</span>
          </h1>

          <p className="mt-6 text-slate-400 max-w-2xl mx-auto text-lg">
            A centralized platform for reporting, prioritizing and
            responding to emergencies across campus.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">

            <Feature
              icon={<Radio size={20} />}
              title="Real-Time Response"
              text="Instant incident reporting"
            />

            <Feature
              icon={<Activity size={20} />}
              title="Smart Prioritization"
              text="Automatic severity analysis"
            />

            <Feature
              icon={<MapPin size={20} />}
              title="Campus Wide"
              text="Coordinate responders"
            />

          </div>

          {/* Start section */}
          <div className="mt-12">

            {loading ? (
              <div className="max-w-md mx-auto">

                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>INITIALIZING SYSTEM</span>
                  <span>{progress}%</span>
                </div>

                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-600">
                  Checking emergency response modules...
                </p>

              </div>
            ) : (
              <button
                onClick={onStart}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold shadow-lg shadow-rose-500/20 transition-all duration-300 hover:scale-105"
              >
                ENTER CAMPUSCARE

                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            )}

          </div>

          {/* Footer */}
          <div className="mt-16 flex items-center justify-center gap-2 text-xs text-slate-600">
            <Zap size={13} />
            <span>Built for safer campuses</span>
          </div>

        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-left hover:border-slate-700 transition">
      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-rose-400 mb-4">
        {icon}
      </div>

      <h3 className="font-semibold text-slate-200">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-1">
        {text}
      </p>
    </div>
  );
}