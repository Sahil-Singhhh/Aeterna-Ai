import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/slices/authSlice";
import { User, Lock, ArrowRight, Loader } from "lucide-react";

const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-[#7000FF] rounded-full mix-blend-screen"
        style={{
          width: Math.random() * 8 + 2,
          height: Math.random() * 8 + 2,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.5 + 0.1,
        }}
        animate={{
          y: [0, -150, 0],
          x: [0, Math.random() * 100 - 50, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ))}
  </div>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Neural link coordinates required (Email/Password).");
      return;
    }

    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const existingUsers = JSON.parse(
        localStorage.getItem("aeterna_users") || "[]",
      );
      const user = existingUsers.find(
        (u) => u.email === email && u.password === password,
      );
      if (user) {
        dispatch(
          login({
            name: user.name,
            email: user.email,
            memberSince: user.memberSince,
            age: user.age || 30,
          }),
        );
        // Existing user logs in -> redirect to dashboard
        navigate("/");
      } else {
        setError("Unauthorized biometrics. Invalid email or password.");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex items-center justify-center relative overflow-hidden font-sans">
      <Particles />

      {/* Huge Background Glows */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00F2FF] blur-[150px] rounded-full pointer-events-none"
      />

      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.12, 0.1] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#7000FF] blur-[150px] rounded-full pointer-events-none"
      />

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="glassmorphism p-10 md:p-14 rounded-3xl z-10 w-full max-w-md border border-white/10 shadow-[0_0_50px_rgba(0,242,255,0.05)]"
      >
        <div className="text-center mb-10 border-b border-white/5 pb-8">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#00F2FF] to-[#7000FF] flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.4)]"
          >
            <span className="font-extrabold text-3xl tracking-tighter mix-blend-overlay">
              Ae
            </span>
          </motion.div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#8B949E]">
            Neural Uplink
          </h2>
          <p className="text-[#00F2FF] text-xs uppercase tracking-[0.3em] font-mono mt-2 opacity-80">
            Aeterna Identity Protocol
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm text-center font-mono">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B949E] group-focus-within:text-[#00F2FF] transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Secure Email Identity"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#8B949E] focus:outline-none focus:border-[#00F2FF] focus:ring-1 focus:ring-[#00F2FF] transition-all shadow-[0_0_0_rgba(0,242,255,0)] focus:shadow-[0_0_20px_rgba(0,242,255,0.2)]"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B949E] group-focus-within:text-[#7000FF] transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Biometric Passkey"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#8B949E] focus:outline-none focus:border-[#7000FF] focus:ring-1 focus:ring-[#7000FF] transition-all shadow-[0_0_0_rgba(112,0,255,0)] focus:shadow-[0_0_20px_rgba(112,0,255,0.2)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00F2FF] to-[#7000FF] text-white font-bold tracking-wide uppercase text-sm hover:shadow-[0_0_30px_rgba(0,242,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transition-transform -translate-x-full group-hover:translate-x-0 ease-out duration-300" />
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Initiate Uplink <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-[#8B949E]">
          Unregistered Bio-signature?{" "}
          <Link
            to="/signup"
            className="text-[#00F2FF] hover:text-white transition-colors underline underline-offset-4 pointer"
          >
            Create Protocol
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
