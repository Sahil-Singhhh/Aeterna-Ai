import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useProfile } from '../context/ProfileContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, Clock, Activity, Zap, CheckCircle2 } from 'lucide-react';

interface ProgressLog {
  date: string;
  score: number;
  optimized: number;
  lifestyle: {
    steps_daily: number;
    sleep_hours: number;
    hydration_liters: number;
    stress_level: number;
  };
}

export default function Progress() {
  const prediction = useSelector((state: RootState) => state.prediction);
  const user = useSelector((state: RootState) => state.auth.user);
  const { profile } = useProfile();
  const emailKey = user?.email ? `_${user.email}` : '';
  
  const actualWeight = Number(profile.weight) || 0;
  const heightCm = Number(profile.height) || 0;
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? (actualWeight / (heightM * heightM)) : 0;
  
  const logs: ProgressLog[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`aeterna_progress_logs${emailKey}`) || '[]');
    } catch {
      return [];
    }
  }, [emailKey]);

  const currentScore = prediction.current_score ? Number(parseFloat(prediction.current_score.toString()).toFixed(1)) : 0;
  
  const lastRecord = logs.length > 0 ? logs[logs.length - 1] : null;
  const lastScore = lastRecord ? lastRecord.score : currentScore;
  
  const delta = currentScore - lastScore;

  const gap = lastRecord ? (lastRecord.optimized - lastRecord.score) : 0;
  let gapAdvice = "Maintain Routine Consistency!";
  if (lastRecord) {
    if (lastRecord.lifestyle.sleep_hours < 7) {
      gapAdvice = "Focus on Deep Sleep today!";
    } else if (lastRecord.lifestyle.hydration_liters < 2.5) {
      gapAdvice = "Prioritize Hydration today!";
    } else if (lastRecord.lifestyle.steps_daily < 6000) {
      gapAdvice = "Increase Kinetic Daily Movement!";
    } else if (lastRecord.lifestyle.stress_level > 5) {
      gapAdvice = "Focus on Cortisol Reduction!";
    }
  }

  const chartData = useMemo(() => {
    return logs.map(log => ({
      date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: log.score,
    }));
  }, [logs]);

  // AI Summary Logic simple mock
  const aiSummary = useMemo(() => {
    if (logs.length < 2) return "Insufficient telemetry data. Please log your progress daily to generate AI insights.";
    
    const firstLog = logs[0];
    const latestLog = logs[logs.length - 1];
    
    let summary = `Over your recorded timeline, your vitality score shifted by ${latestLog.score - firstLog.score > 0 ? '+' : ''}${(latestLog.score - firstLog.score).toFixed(1)} points. `;
    
    if (latestLog.lifestyle.steps_daily > firstLog.lifestyle.steps_daily) {
      summary += "Your increased kinetic output (steps) is significantly driving your longevity trajectory upward. ";
    }
    if (latestLog.lifestyle.sleep_hours >= 7 && latestLog.lifestyle.sleep_hours > firstLog.lifestyle.sleep_hours) {
      summary += "Improved circadian consistency has fundamentally optimized your cellular repair metrics. ";
    } else if (latestLog.lifestyle.stress_level < firstLog.lifestyle.stress_level) {
      summary += "A measured reduction in cortisol (stress) levels is actively preventing bio-degradation.";
    }
    return summary;
  }, [logs]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto z-10 relative">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#39FF14] blur-[150px] rounded-full pointer-events-none" 
      />

      <header className="pb-6 border-b border-white/5 relative z-10">
         <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#8B949E]">
            Temporal Progress
         </h1>
         <p className="text-sm text-[#00F2FF] tracking-widest uppercase font-mono mt-1 opacity-80">
            Historical Trajectory & Milestones
         </p>
      </header>
      
      {logs.length === 0 ? (
        <div className="glassmorphism p-12 text-center rounded-2xl border border-white/10">
          <Clock className="w-16 h-16 text-[#8B949E] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">No Temporal Records Found</h3>
          <p className="text-text-muted max-w-md mx-auto">
            Navigate to your Dashboard and select "Save Daily Progress" to initialize your health telemetry tracking.
          </p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} className="glassmorphism p-6 rounded-2xl border-t border-t-[#8B949E]/30 relative overflow-hidden group">
              <h4 className="text-xs text-text-muted font-bold tracking-widest uppercase mb-4">Last Logged Score</h4>
              <div className="text-5xl font-light text-white font-mono tracking-tighter">
                {lastScore.toFixed(1)}
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="glassmorphism p-6 rounded-2xl border-t border-t-[#39FF14]/30 relative overflow-hidden group shadow-[0_0_20px_rgba(57,255,20,0.05)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xs text-[#39FF14] font-bold tracking-widest uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Current Live Pulse
                </h4>
                {delta !== 0 && (
                  <div className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
                    delta > 0 ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-[#FF4D4D]/20 text-[#FF4D4D]'
                  }`}>
                    {delta > 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                    {delta > 0 ? '+' : ''}{delta.toFixed(1)} Pts
                  </div>
                )}
              </div>
              <div className="text-5xl font-light text-[#00F2FF] font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                {currentScore ? currentScore.toFixed(1) : '--'}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glassmorphism p-6 rounded-2xl border-t border-t-[#7000FF]/30 relative overflow-hidden group shadow-[0_0_20px_rgba(112,0,255,0.05)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/5 to-transparent pointer-events-none" />
              <h4 className="text-xs text-[#7000FF] font-bold tracking-widest uppercase mb-4">
                Simulation vs Reality Gap
              </h4>
              <div className="text-4xl font-light text-white font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(112,0,255,0.3)]">
                {gap > 0 ? `-${gap.toFixed(1)}` : '0.0'} <span className="text-xl text-[#8B949E]">Pts</span>
              </div>
              {gap > 0 && (
                <p className="text-xs text-white/70 mt-3 leading-relaxed">
                  You are <span className="text-[#FF4D4D] font-bold">{gap.toFixed(1)} points</span> away from peak potential. {gapAdvice}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="glassmorphism p-6 rounded-2xl border-t border-t-[#FF0055]/30 relative overflow-hidden group shadow-[0_0_20px_rgba(255,0,85,0.05)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF0055]/5 to-transparent pointer-events-none" />
              <h4 className="text-xs text-[#FF0055] font-bold tracking-widest uppercase mb-4">Body Metrics</h4>
              <div className="flex flex-col justify-end h-full mt-2">
                <div className="text-4xl font-light text-white font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(255,0,85,0.3)]">
                  {bmi > 0 ? bmi.toFixed(1) : '--'} <span className="text-xl text-[#8B949E]">BMI</span>
                </div>
                <p className="text-xs text-white/70 mt-3 font-mono bg-white/5 py-1 px-2 rounded w-fit">
                  {actualWeight ? `${actualWeight}kg` : '--'} | {heightCm ? `${heightCm}cm` : '--'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Area Chart */}
          <motion.div variants={itemVariants} className="glassmorphism p-6 rounded-2xl border border-white/5 space-y-6 bg-black/40">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historical Trend</h3>
              <span className="text-xs text-[#00F2FF] font-mono bg-[#00F2FF]/10 px-2 py-1 rounded">VITALITY INDEX</span>
            </div>
            
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#8B949E" tick={{ fill: '#8B949E', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#8B949E" tick={{ fill: '#8B949E', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#05070A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#39FF14', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#39FF14" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="p-4 bg-[#7000FF]/10 border border-[#7000FF]/20 rounded-xl flex items-start gap-4">
               <Zap className="w-5 h-5 text-[#00F2FF] shrink-0 mt-0.5" />
               <p className="text-sm text-[#00F2FF] leading-relaxed">
                 <span className="font-bold uppercase tracking-wider text-[#7000FF]">Neural Summary: </span>
                 {aiSummary}
               </p>
            </div>
          </motion.div>

          {/* Timeline UI */}
          <motion.div variants={itemVariants} className="space-y-4">
             <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
               <Clock className="w-4 h-4 text-[#8B949E]" /> Log Timeline
             </h3>
             <div className="space-y-4">
                {[...logs].reverse().map((log, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.01, x: 5 }}
                    className="glassmorphism p-4 rounded-xl border-l-2 border-[#39FF14] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-[#39FF14]/5 to-transparent transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-[#39FF14]" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{new Date(log.date).toLocaleDateString()} <span className="text-xs text-[#8B949E] font-normal ml-2">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                        <p className="text-xs text-white/50 font-mono mt-1">Steps: {log.lifestyle.steps_daily} • Sleep: {log.lifestyle.sleep_hours}hr</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                       <p className="text-2xl font-light text-white font-mono">{log.score.toFixed(1)}</p>
                       <p className="text-xs text-[#00F2FF] uppercase tracking-widest">Score</p>
                    </div>
                  </motion.div>
                ))}
             </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}
