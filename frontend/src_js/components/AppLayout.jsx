import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Cherry, UserCircle, LogOut, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useMemo } from "react";

export default function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const streakCount = useMemo(() => {
    try {
      const emailKey = user?.email ? `_${user.email}` : "";
      const logs = JSON.parse(
        localStorage.getItem(`aeterna_progress_logs${emailKey}`) || "[]",
      );
      if (logs.length === 0) return 0;
      const uniqueDatesStr = [...new Set(logs.map((l) => l.date.split("T")[0]))]
        .sort()
        .reverse();
      if (uniqueDatesStr.length === 0) return 0;
      // Use local dates instead of strict ISO to avoid timezone shifts
      const getLocalDateStr = (d) => {
        const tzOffset = d.getTimezoneOffset() * 60000; // in milliseconds
        return new Date(d.getTime() - tzOffset).toISOString().split("T")[0];
      };

      const todayStr = getLocalDateStr(new Date());
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = getLocalDateStr(yesterdayDate);
      if (
        uniqueDatesStr[0] !== todayStr &&
        uniqueDatesStr[0] !== yesterdayStr
      ) {
        return 0;
      }
      let streak = 1;
      let checkDate = new Date(uniqueDatesStr[0]);
      for (let i = 1; i < uniqueDatesStr.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const expectedStr = getLocalDateStr(checkDate);
        if (uniqueDatesStr[i] === expectedStr) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    } catch {
      return 0;
    }
  }, [user?.email]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#05070A] text-white font-sans overflow-hidden">
      {/* Sidebar background and glow */}
      <nav className="w-20 md:w-64 glassmorphism border-r border-white/5 flex flex-col items-center md:items-start py-8 relative z-50">
        <div className="mb-12 px-0 md:px-6 w-full flex justify-center md:justify-start">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2FF] to-[#7000FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)]"
          >
            <span className="font-bold text-2xl tracking-tighter mix-blend-overlay">
              Ae
            </span>
          </motion.div>
          <div className="hidden md:block ml-4">
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#8B949E]">
              Aeterna
            </h1>
            <p className="text-[10px] text-[#00F2FF] tracking-widest uppercase font-mono mt-0.5 opacity-80">
              Nexus OS
            </p>
          </div>
        </div>

        <div className="flex flex-col w-full gap-2 px-3 md:px-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 md:px-4 py-3 rounded-xl transition-all ${isActive ? "bg-[#00F2FF]/10 text-[#00F2FF] shadow-[inset_0_0_20px_rgba(0,242,255,0.05)] border border-[#00F2FF]/20" : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"}`
            }
          >
            <LayoutDashboard className="w-6 h-6 shrink-0" />
            <span className="hidden md:inline font-semibold">Dashboard</span>
          </NavLink>
          <NavLink
            to="/diet-plan"
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 md:px-4 py-3 rounded-xl transition-all ${isActive ? "bg-[#7000FF]/10 text-[#00F2FF] shadow-[inset_0_0_20px_rgba(112,0,255,0.05)] border border-[#7000FF]/20" : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"}`
            }
          >
            <Cherry className="w-6 h-6 shrink-0" />
            <span className="hidden md:inline font-semibold">Diet Plan</span>
          </NavLink>
          <NavLink
            to="/progress"
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 md:px-4 py-3 rounded-xl transition-all ${isActive ? "bg-[#39FF14]/10 text-[#39FF14] shadow-[inset_0_0_20px_rgba(57,255,20,0.05)] border border-[#39FF14]/20" : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"}`
            }
          >
            <LogOut className="w-6 h-6 shrink-0 opacity-0 absolute pointer-events-none" />{" "}
            {/* Hidden spacer or icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-trending-up w-6 h-6 shrink-0"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <span className="hidden md:inline font-semibold">Progress</span>
          </NavLink>
          <NavLink
            to="/ai-chat"
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 md:px-4 py-3 rounded-xl transition-all ${isActive ? "bg-[#FF0055]/10 text-[#FF0055] shadow-[inset_0_0_20px_rgba(255,0,85,0.05)] border border-[#FF0055]/20" : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"}`
            }
          >
            <Bot className="w-6 h-6 shrink-0" />
            <span className="hidden md:inline font-semibold">AI Assistant</span>
          </NavLink>
        </div>

        <div className="mt-auto px-3 md:px-4 w-full space-y-4">
          {user && (
            <div className="hidden md:block px-4 py-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm font-bold text-[#00F2FF] truncate">
                {user.name}
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[10px] text-white/50 uppercase tracking-widest">
                  Idnc {user.memberSince}
                </p>
                {streakCount >= 2 && (
                  <span className="text-[10px] bg-[#FF4D4D]/20 text-[#FF4D4D] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(255,77,77,0.3)]">
                    🔥 {streakCount} Days
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 md:px-4 py-3 rounded-xl transition-all ${isActive ? "bg-white/10 text-white border border-white/20" : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"}`
              }
            >
              <UserCircle className="w-6 h-6 shrink-0" />
              <span className="hidden md:inline font-semibold">Profile</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-3 md:px-4 py-3 rounded-xl transition-all w-full text-left text-[#FF4D4D]/80 hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 border border-transparent"
            >
              <LogOut className="w-6 h-6 shrink-0" />
              <span className="hidden md:inline font-semibold uppercase tracking-wider text-sm">
                Terminate
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
