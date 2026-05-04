import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile } from '../context/ProfileContext';
import type { MedicalCondition } from '../context/ProfileContext';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';

export default function ProfileSetup() {
  const { profile, setProfile } = useProfile();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleConditionChange = (condition: MedicalCondition) => {
    let newConditions = [...profile.conditions];
    if (condition === 'None') {
      newConditions = ['None'];
    } else {
      newConditions = newConditions.filter(c => c !== 'None');
      if (newConditions.includes(condition)) {
         newConditions = newConditions.filter(c => c !== condition);
      } else {
         newConditions.push(condition);
      }
      if (newConditions.length === 0) newConditions = ['None'];
    }
    setProfile(p => ({ ...p, conditions: newConditions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.age !== '' && profile.gender !== '' && profile.weight !== '' && profile.height !== '' && profile.activityLevel !== '') {
      dispatch(setUser({ age: Number(profile.age) })); // Sync with existing redux state for engine
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#00F2FF] blur-[150px] rounded-full pointer-events-none" 
      />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glassmorphism max-w-lg w-full p-8 rounded-2xl relative z-10 border-t border-[#00F2FF]/30 shadow-[0_0_30px_rgba(0,242,255,0.05)]"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#8B949E]">
            Neural Profile Setup
          </h2>
          <p className="text-[#00F2FF] uppercase font-mono text-xs mt-2 opacity-80 flex justify-center items-center gap-2">
            Calibrating Biomarkers
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F2FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F2FF]"></span>
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs uppercase font-mono text-text-muted mb-2">Age</label>
              <input 
                type="number" 
                required
                min="0"
                value={profile.age} 
                onChange={e => setProfile(p => ({ ...p, age: e.target.value ? Number(e.target.value) : '' }))}
                className="w-full bg-[#0D1117] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00F2FF]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-mono text-text-muted mb-2">Gender</label>
              <select 
                required
                value={profile.gender}
                onChange={e => setProfile(p => ({ ...p, gender: e.target.value as any }))}
                className="w-full bg-[#0D1117] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00F2FF]/50 transition-colors appearance-none"
              >
                <option value="" disabled>Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase font-mono text-text-muted mb-2">Weight (kg)</label>
              <input 
                type="number" 
                required
                min="0"
                value={profile.weight} 
                onChange={e => setProfile(p => ({ ...p, weight: e.target.value ? Number(e.target.value) : '' }))}
                className="w-full bg-[#0D1117] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00F2FF]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-mono text-text-muted mb-2">Height (cm)</label>
              <input 
                type="number" 
                required
                min="0"
                value={profile.height} 
                onChange={e => setProfile(p => ({ ...p, height: e.target.value ? Number(e.target.value) : '' }))}
                className="w-full bg-[#0D1117] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00F2FF]/50 transition-colors"
              />
            </div>
          </div>

          <div>
             <label className="block text-xs uppercase font-mono text-text-muted mb-2">Activity Level</label>
             <select 
                required
                value={profile.activityLevel}
                onChange={e => setProfile(p => ({ ...p, activityLevel: e.target.value as any }))}
                className="w-full bg-[#0D1117] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00F2FF]/50 transition-colors appearance-none"
              >
                <option value="" disabled>Select Activity Level</option>
                <option value="Sedentary">Sedentary (Little to no exercise)</option>
                <option value="Light">Light (Exercise 1-3 days/week)</option>
                <option value="Moderate">Moderate (Exercise 3-5 days/week)</option>
                <option value="Active">Active (Exercise 6-7 days/week)</option>
                <option value="Very Active">Very Active (Hard physical job)</option>
              </select>
          </div>

          <div>
            <label className="block text-xs uppercase font-mono text-text-muted mb-3">Prior Medical Conditions</label>
            <div className="flex flex-wrap gap-3">
              {(['None', 'Diabetes', 'Thyroid', 'Hypertension'] as MedicalCondition[]).map(cond => {
                const isSelected = profile.conditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleConditionChange(cond)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${
                      isSelected 
                        ? 'bg-[#00F2FF]/20 border-[#00F2FF] text-[#00F2FF] shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                        : 'bg-transparent border-white/10 text-white/70 hover:border-white/30'
                    }`}
                  >
                    {cond}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-mono text-text-muted mb-2">Current Medications</label>
            <input 
              type="text" 
              placeholder="e.g. Metformin, Lisinopril, None..."
              value={profile.medications} 
              onChange={e => setProfile(p => ({ ...p, medications: e.target.value }))}
              className="w-full bg-[#0D1117] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00F2FF]/50 transition-colors placeholder:text-white/20"
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-6 py-4 bg-gradient-to-r from-[#00F2FF] to-[#7000FF] rounded-lg font-bold text-lg text-white shadow-[0_0_20px_rgba(112,0,255,0.4)] hover:shadow-[0_0_30px_rgba(112,0,255,0.6)] transition-all hover:scale-[1.02]"
          >
            INITIALIZE UPLINK
          </button>
        </form>
      </motion.div>
    </div>
  );
}
