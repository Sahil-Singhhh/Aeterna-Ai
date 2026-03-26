import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import LongevityClock from '../components/LongevityClock';
import SimulationEngine from '../components/SimulationEngine';
import TrajectoryChart from '../components/TrajectoryChart';
import { useSelector, useDispatch } from 'react-redux';
import { Save } from 'lucide-react';
import type { RootState, AppDispatch } from '../store/store';
import { fetchPrediction } from '../store/slices/predictionSlice';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 10 }
  }
};

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const [mounted, setMounted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const prediction = useSelector((state: RootState) => state.prediction);
  const lifestyle = useSelector((state: RootState) => state.lifestyle);
  const user = useSelector((state: RootState) => state.auth.user);
  const emailKey = user?.email ? `_${user.email}` : '';

  useEffect(() => {
    setMounted(true);
    if (user?.age) {
        dispatch(fetchPrediction({ age: user.age, lifestyle, months: 60 }));
    }
  }, [dispatch, user, lifestyle]);

  useEffect(() => {
    // Check if logged today for this specific user
    const existingLogs = JSON.parse(localStorage.getItem(`aeterna_progress_logs${emailKey}`) || '[]');
    if (existingLogs.length > 0) {
      const lastLogDate = new Date(existingLogs[existingLogs.length - 1].date);
      const today = new Date();
      if (lastLogDate.toDateString() === today.toDateString()) {
        setHasLoggedToday(true);
      } else {
        setHasLoggedToday(false);
      }
    } else {
      setHasLoggedToday(false);
    }
  }, [emailKey]);

  const handleSaveProgress = () => {
    if (!prediction.current_score || !prediction.optimized_score || hasLoggedToday) return;
    
    const newLog = {
      date: new Date().toISOString(),
      score: Number(parseFloat(prediction.current_score.toString()).toFixed(1)),
      optimized: Number(parseFloat(prediction.optimized_score.toString()).toFixed(1)),
      lifestyle: { ...lifestyle }
    };

    const existingLogs = JSON.parse(localStorage.getItem(`aeterna_progress_logs${emailKey}`) || '[]');
    localStorage.setItem(`aeterna_progress_logs${emailKey}`, JSON.stringify([...existingLogs, newLog]));
    
    setHasLoggedToday(true);
    setSaveStatus('Reality Locked!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 relative">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00F2FF] blur-[150px] rounded-full pointer-events-none" 
      />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#8B949E]">
              Overview Dashboard
            </h2>
            <p className="text-sm text-[#00F2FF] tracking-widest uppercase font-mono mt-1 opacity-80 flex items-center gap-2">
              System Telemetry Online
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FF14]"></span>
              </span>
            </p>
          </div>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <button 
              onClick={handleSaveProgress}
              disabled={hasLoggedToday || prediction.loading}
              className={`px-4 py-2 ${hasLoggedToday ? 'bg-[#39FF14]/10 border-[#39FF14]/30 text-[#39FF14]' : 'bg-[#00F2FF]/10 text-[#00F2FF] hover:bg-[#00F2FF]/20 border-[#00F2FF]/30 hover:shadow-[0_0_20px_rgba(0,242,255,0.3)]'} border rounded-lg flex items-center gap-2 transition-all font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,242,255,0.1)] ${hasLoggedToday ? '' : 'disabled:opacity-50'}`}
            >
              <Save className="w-4 h-4" />
              {hasLoggedToday ? "Reality Logged" : (saveStatus || "Log Today's Reality")}
            </button>
            
            <div className="hidden md:flex flex-col items-end text-xs font-mono text-text-muted">
              <span className="mb-1">SYS_STATUS <span className="text-[#39FF14] animate-pulse">● ONLINE</span></span>
              <span className="text-[#8B949E]/70">UPLINK V2.2.0 <span className="text-[#00F2FF]">ACTIVE</span></span>
            </div>
          </div>
        </motion.header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Real-time metrics and inputs */}
          <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex justify-center w-full">
              <LongevityClock score={prediction.optimized_score || prediction.current_score} />
            </div>
            <SimulationEngine />
          </motion.div>

          {/* Right Column - Deep analysis and multi-dimensional trajectory */}
          <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-8">
            <TrajectoryChart />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <motion.div 
                 whileHover={{ scale: 1.02 }}
                 className="glassmorphism p-6 rounded-2xl w-full border-t border-t-[#00F2FF]/30 relative overflow-hidden group shadow-[0_0_15px_rgba(0,242,255,0.05)] hover:shadow-[0_0_25px_rgba(0,242,255,0.15)] transition-all"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00F2FF]/5 to-transparent pointer-events-none" />
                  <h4 className="text-xs text-text-muted font-bold tracking-widest uppercase mb-2">Base Trajectory</h4>
                  <div className="text-4xl font-light text-white mb-2 tracking-tight">
                    {prediction.loading && !prediction.current_score ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      prediction.current_score ? parseFloat(prediction.current_score.toString()).toFixed(1) : '--'
                    )}
                  </div>
                  <p className="text-sm text-text-muted/80 leading-relaxed">
                    Projected median vitality score under current unoptimized bio-metrics mapped across 60 months.
                  </p>
               </motion.div>
               
               <motion.div 
                 whileHover={{ scale: 1.02 }}
                 className="glassmorphism p-6 rounded-2xl w-full border-t border-t-[#7000FF]/30 relative overflow-hidden group shadow-[0_0_15px_rgba(112,0,255,0.05)] hover:shadow-[0_0_25px_rgba(112,0,255,0.15)] transition-all"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/5 to-transparent pointer-events-none" />
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#7000FF] opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity" />
                  <h4 className="text-xs text-[#7000FF] font-bold tracking-widest uppercase mb-2 flex justify-between items-center">
                    Simulation Cap
                    <span className="px-2 py-0.5 rounded bg-[#7000FF]/20 text-[10px] text-[#00F2FF]">OPTIMIZED</span>
                  </h4>
                  <div className="text-4xl font-light text-[#00F2FF] mb-2 tracking-tight drop-shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                    {prediction.loading && !prediction.optimized_score ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      prediction.optimized_score ? parseFloat(prediction.optimized_score.toString()).toFixed(1) : '--'
                    )}
                  </div>
                  <p className="text-sm text-[#00F2FF]/70 leading-relaxed">
                    Maximum theoretical index achievable by strictly adhering to ML-suggested lifestyle corrections.
                  </p>
               </motion.div>
            </div>
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
