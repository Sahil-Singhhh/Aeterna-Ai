import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/slices/authSlice";
import { User, Lock, Mail, ArrowRight, Loader } from "lucide-react";

const DNAHelix = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex justify-center opacity-20">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-64 h-24 border-x-2 border-[#00F2FF] rounded-full mix-blend-screen"
        style={{
          top: `${i * 8}%`,
          transform: `rotate(${i * 15}deg)`,
        }}
        animate={{
          rotateX: [0, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
);

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("All biometric data fields required.");
      return;
    }

    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const existingUsers = JSON.parse(
        localStorage.getItem("aeterna_users") || "[]",
      );
      const userExists = existingUsers.find((u) => u.email === email);
      if (userExists) {
        setError("Bio-signature already registered for this email.");
        setLoading(false);
        return;
      }
      const newUser = {
        name,
        email,
        password,
        memberSince: new Date().toISOString().split("T")[0],
        age: 30,
      };
      existingUsers.push(newUser);
      localStorage.setItem("aeterna_users", JSON.stringify(existingUsers));

      // Direct signup creates user & logs in
      dispatch(
        login({
          name,
          email,
          memberSince: newUser.memberSince,
          age: 30, // Will be overwritten in onboarding
        }),
      );
      // New User logic -> MUST show onboarding
      navigate("/profile");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex items-center justify-center relative overflow-hidden font-sans">
      <DNAHelix />

      {/* Huge Background Glows */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.12, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#7000FF] blur-[150px] rounded-full pointer-events-none"
      />

      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00F2FF] blur-[150px] rounded-full pointer-events-none"
      />

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="glassmorphism p-10 md:p-14 rounded-3xl z-10 w-full max-w-md border border-white/10 shadow-[0_0_50px_rgba(112,0,255,0.05)]"
      >
        <div className="text-center mb-10 border-b border-white/5 pb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FF] to-white">
            Register Bio-Signature
          </h2>
          <p className="text-[#7000FF] text-xs uppercase tracking-[0.2em] font-mono mt-2 opacity-80">
            Aeterna Nexus OS Onboarding
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm text-center font-mono">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B949E] group-focus-within:text-[#00F2FF] transition-colors" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Identifier (Name)"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#8B949E] focus:outline-none focus:border-[#00F2FF] focus:ring-1 focus:ring-[#00F2FF] transition-all shadow-[0_0_0_rgba(0,242,255,0)] focus:shadow-[0_0_20px_rgba(0,242,255,0.2)]"
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B949E] group-focus-within:text-[#7000FF] transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Secure Email"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#8B949E] focus:outline-none focus:border-[#7000FF] focus:ring-1 focus:ring-[#7000FF] transition-all shadow-[0_0_0_rgba(112,0,255,0)] focus:shadow-[0_0_20px_rgba(112,0,255,0.2)]"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B949E] group-focus-within:text-white transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Biometric Passkey"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#8B949E] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all shadow-[0_0_0_rgba(255,255,255,0)] focus:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#7000FF] to-[#00F2FF] text-white font-bold tracking-wide uppercase text-sm hover:shadow-[0_0_30px_rgba(112,0,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transition-transform -translate-x-full group-hover:translate-x-0 ease-out duration-300" />
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Register Identity <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-[#8B949E]">
          Already hold a Link?{" "}
          <Link
            to="/login"
            className="text-[#7000FF] hover:text-white transition-colors underline underline-offset-4 pointer"
          >
            Initiate Uplink
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
