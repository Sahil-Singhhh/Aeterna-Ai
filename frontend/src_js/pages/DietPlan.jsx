import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useProfile } from "../context/ProfileContext";
import { useSelector } from "react-redux";
import {
  Activity,
  Flame,
  Moon,
  Search,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import SimulationEngine from "../components/SimulationEngine";
import TrajectoryChart from "../components/TrajectoryChart";

export default function DietPlan() {
  const { profile } = useProfile();
  const prediction = useSelector((state) => state.prediction);
  const lifestyle = useSelector((state) => state.lifestyle); // Get simulation parameters

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStrategy, setAiStrategy] = useState(null);
  const [aiMeals, setAiMeals] = useState(null);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/generate-diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lifestyle,
          profile,
          target_calories: Math.floor(
            Math.floor(
              10 * (Number(profile.weight) || 70) +
                6.25 * (Number(profile.height) || 170) -
                5 * (Number(profile.age) || 30) +
                5,
            ) *
              (lifestyle.steps_daily < 5000
                ? 1.2
                : lifestyle.steps_daily < 8000
                  ? 1.375
                  : lifestyle.steps_daily < 12000
                    ? 1.55
                    : 1.725),
          ),
        }),
      });
      const data = await res.json();
      if (data.strategy) {
        setAiStrategy(data.strategy);
        setAiMeals(data.meals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentScore = prediction.current_score || 0;
  const targetScore = prediction.optimized_score || 0;
  const gap = targetScore - currentScore;

  const age = Number(profile.age) || 30;
  const height = Number(profile.height) || 170;
  const actualWeight = Number(profile.weight) || 70;

  // BMR Calculation (Mifflin-St Jeor Equation)
  const bmr = useMemo(() => {
    return Math.floor(10 * actualWeight + 6.25 * height - 5 * age + 5);
  }, [age, actualWeight, height]);

  // Apply activity multiplier based on simulated daily steps
  const activityMultiplier = useMemo(() => {
    if (lifestyle.steps_daily < 5000) return 1.2; // Sedentary
    if (lifestyle.steps_daily < 8000) return 1.375; // Lightly active
    if (lifestyle.steps_daily < 12000) return 1.55; // Moderately active
    return 1.725; // Very active
  }, [lifestyle.steps_daily]);

  const targetCalories = Math.floor(bmr * activityMultiplier);

  // Health Conditions
  const hasDiabetes = profile.conditions.includes("Diabetes");
  const hasThyroid = profile.conditions.includes("Thyroid");
  const hasHypertension = profile.conditions.includes("Hypertension");
  const hasMedical =
    profile.conditions.length > 0 && !profile.conditions.includes("None");
  const dietStrategy = useMemo(() => {
    let strategy =
      "Optimized balanced macros to sustain daily activity and vitality.";
    if (hasDiabetes)
      strategy =
        "Low GI focused regimen to stabilize insulin spikes. Focus on high fiber.";
    else if (hasHypertension)
      strategy =
        "DASH-aligned diet low in sodium. Emphasize potassium-rich foods.";
    else if (hasThyroid)
      strategy = "Moderate cruciferous intake. Support with iodine & selenium.";

    if (lifestyle.steps_daily < 4000) {
      strategy +=
        " Sedentary lifestyle detected: Caloric deficit via strict portion control is necessary.";
    } else if (lifestyle.steps_daily > 10000) {
      strategy +=
        " High kinetic output detected: Increased complex caloric load needed for optimal muscle recovery.";
    }
    return strategy;
  }, [hasDiabetes, hasThyroid, hasHypertension, lifestyle.steps_daily]);

  // Dynamic Simple Meals based on conditions and simulation
  const meals = useMemo(() => {
    let breakfastProtein = "Eggs, Paneer, or Greek Yogurt";
    let lunchProtein = "Chicken Breast, Soya Chunks, or Rajma";
    let dinnerProtein = "Light Moong Dal, Grilled Fish, or Tofu";
    let baseCarbs = "Oats or Brown Poha";
    let lunchCarbs = "Brown Rice or Multigrain Roti";

    if (hasMedical) {
      breakfastProtein = "Sprouts, Besan Chilla, or Low-fat Paneer";
      lunchProtein = "Chana Dal, Lean Fish, or Tofu";
      dinnerProtein = "Clear Soup, Boiled Veggies, or Moong Dal";
      baseCarbs = "Oats, Quinoa, or Millet (Jowar/Bajra)";
      lunchCarbs = "Portion-controlled Brown Rice or Bajra Roti";
    }

    const baseMeals = [
      {
        name: "Breakfast (Morning Fuel)",
        desc: `Protein: ${breakfastProtein}. Carbs: ${baseCarbs}.`,
        macros: "Balanced Macros",
      },
      {
        name: "Lunch (Sustained Energy)",
        desc: `Protein: ${lunchProtein}. Carbs: ${lunchCarbs}. Add large bowl of Green Salad.`,
        macros: "Balanced Macros",
      },
      {
        name: "Dinner (Recovery Focus)",
        desc: `Protein: ${dinnerProtein}. Keep carbs extremely light.`,
        macros: "Light Carbs",
      },
    ];

    // Highly reactive conditionals based on slider
    if (lifestyle.steps_daily < 4000) {
      baseMeals[1].desc =
        "Strictly reduce carbs to half portion since activity is very low. " +
        baseMeals[1].desc;
      baseMeals[1].macros = "Low Carbs | High Protein";
    } else if (lifestyle.steps_daily >= 4000 && lifestyle.steps_daily <= 8000) {
      baseMeals[1].desc = "Standard carb portion. " + baseMeals[1].desc;
    } else if (lifestyle.steps_daily > 8000 && lifestyle.steps_daily < 15000) {
      baseMeals[1].desc +=
        " Add an extra Carb source like a Sweet Potato to fuel your high steps!";
      baseMeals[1].macros = "High Energy Carbs";
    } else if (lifestyle.steps_daily >= 15000) {
      baseMeals[1].desc +=
        " Extreme activity level! Double your complex carbs and add an afternoon Banana.";
      baseMeals[1].macros = "Maximum Recovery Carb-load";
    }

    if (lifestyle.stress_level <= 3) {
      baseMeals[2].desc += " Stress is very low, metabolic pathways are clear.";
    } else if (lifestyle.stress_level > 3 && lifestyle.stress_level <= 6) {
      baseMeals[2].desc +=
        " Include Omega-3s (Walnuts/Flaxseeds) to maintain stable cortisol.";
    } else if (lifestyle.stress_level > 6) {
      baseMeals[2].desc +=
        " HIGH STRESS DETECTED! Must add Magnesium-rich foods: Spinach, Pumpkin Seeds, or dark chocolate to lower cortisol spikes.";
    }

    if (lifestyle.hydration_liters < 2.0) {
      baseMeals[0].desc =
        "CRITICAL: Dehydration detected. Drink 2-3 massive glasses of water first! " +
        baseMeals[0].desc;
    } else if (
      lifestyle.hydration_liters >= 2.0 &&
      lifestyle.hydration_liters <= 3.5
    ) {
      baseMeals[0].desc =
        "Start with a glass of lukewarm water. " + baseMeals[0].desc;
    } else if (lifestyle.hydration_liters > 3.5) {
      baseMeals[0].desc =
        "Excellent hydration status. Kidneys flushing toxins optimally. " +
        baseMeals[0].desc;
    }

    return baseMeals;
  }, [
    hasMedical,
    lifestyle.steps_daily,
    lifestyle.stress_level,
    lifestyle.hydration_liters,
  ]);

  // Dynamic Sleep Logic based on User's Simulated Sleep
  const sleepSuggestion = useMemo(() => {
    let optimalBedtime = "10:30 PM";
    if (lifestyle.sleep_hours < 6) {
      return `CRITICAL SLEEP DEPRIVATION: ${lifestyle.sleep_hours} hours is far below cellular repair needs! Immediate intervention required to bridge the +${gap > 0 ? gap.toFixed(1) : "0.0"} pts gap. Increase to minimum 7.5 hrs!`;
    } else if (lifestyle.sleep_hours >= 6 && lifestyle.sleep_hours < 8) {
      optimalBedtime = "11:00 PM";
      return `SUB-OPTIMAL REST: ${lifestyle.sleep_hours} hours provides baseline function, but pushing it to 8 hours (aim for ${optimalBedtime}) will fully bridge your current gap and unlock the ${targetScore.toFixed(1)} optimized target score.`;
    } else if (lifestyle.sleep_hours >= 8 && lifestyle.sleep_hours <= 9) {
      optimalBedtime = "10:00 PM";
      return `OPTIMAL CIRCADIAN RHYTHM: Maintaining exactly ${lifestyle.sleep_hours} hours is structurally perfect. Hitting the bed at ${optimalBedtime} syncs flawlessly with ML-predicted peak vitality cycles.`;
    } else {
      return `OVERSLEEP WARNING: ${lifestyle.sleep_hours} hours indicates lethargy or excessive recovery. Cap sleep strictly around 8-9 hours to prevent metabolic sluggishness.`;
    }
  }, [lifestyle.sleep_hours, gap, targetScore]);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.12, 0.1] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7000FF] blur-[150px] rounded-full pointer-events-none"
      />

      <header className="pb-6 border-b border-white/5 relative z-10">
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#8B949E]">
          Dynamic Biometric Optimization
        </h1>
        <p className="text-sm text-[#00F2FF] tracking-widest uppercase font-mono mt-1 opacity-80">
          Bridging the gap between Current & Target Vitality
        </p>
      </header>

      {hasMedical && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism p-4 border-l-4 border-l-red-500 rounded-lg flex items-start gap-4 shadow-[#FF4D4D]/10"
        >
          <AlertTriangle className="text-status-danger w-6 h-6 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-status-danger uppercase tracking-wider mb-1">
              Health Warning Active
            </h3>
            <p className="text-sm text-white/80">
              User profile indicates medical predispositions:{" "}
              {profile.conditions.filter((c) => c !== "None").join(", ")}.
              Routine strictly adjusted.
            </p>
            {profile.medications && (
              <p className="text-xs text-white/60 mt-1 italic">
                Contraindications checked for medications: {profile.medications}
              </p>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 mb-6">
        <motion.div className="lg:col-span-4">
          <SimulationEngine />
        </motion.div>
        <motion.div className="lg:col-span-8">
          <TrajectoryChart />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Vitality Bridge Panel */}
        <motion.div className="lg:col-span-1 space-y-6">
          <div className="glassmorphism p-6 rounded-2xl border-t border-t-[#00F2FF]/30 h-full flex flex-col justify-between">
            <div>
              <h4 className="text-xs text-text-muted font-bold tracking-widest uppercase mb-4">
                Vitality Bridge
              </h4>
              <div className="flex justify-between items-center mb-6">
                <div className="text-center">
                  <p className="text-[#8B949E] text-xs font-mono mb-1">
                    CURRENT
                  </p>
                  <div className="text-3xl font-light text-white">
                    {currentScore ? currentScore.toFixed(1) : "--"}
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-[#00F2FF] opacity-50"
                >
                  <ChevronRight className="w-8 h-8" />
                </motion.div>
                <div className="text-center">
                  <p className="text-[#7000FF] font-bold text-xs font-mono mb-1 pulse-text">
                    TARGET
                  </p>
                  <div className="text-3xl font-light text-[#00F2FF] drop-shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                    {targetScore ? targetScore.toFixed(1) : "--"}
                  </div>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00F2FF]" /> Optimization
                    Gap
                  </span>
                  <span className="font-mono text-[#00F2FF]">
                    +{gap > 0 ? gap.toFixed(1) : "0.0"} pts
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#FF4D4D]" /> Daily Calc
                    Calories
                  </span>
                  <span className="font-mono">{targetCalories} kcal</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60 flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#7000FF]" /> Protocol
                  </span>
                  <span className="text-xs text-[#7000FF] bg-[#7000FF]/10 px-2 py-0.5 rounded font-mono">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <h4 className="flex items-center gap-2 text-sm font-bold text-[#00F2FF] mb-2">
                <Moon className="w-4 h-4" /> Circadian Correction
              </h4>
              <p className="text-sm text-white/70 leading-relaxed font-light">
                {sleepSuggestion}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Diet Plan Panel */}
        <motion.div className="lg:col-span-2 space-y-6">
          <div className="glassmorphism p-6 rounded-2xl border-t border-t-[#7000FF]/30">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xs text-[#7000FF] font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
                  Dynamic Food Suggestions
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="ml-2 bg-[#7000FF]/20 hover:bg-[#7000FF]/40 text-[#00F2FF] px-2 py-1 rounded text-[10px] flex items-center gap-1 transition-colors"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {isGenerating ? "GENERATING..." : "AI GENERATE"}
                  </button>
                </h4>
                <p className="text-sm text-white/60">
                  {aiStrategy || dietStrategy}
                </p>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-xs tracking-widest font-mono text-text-muted">
                  DAILY INTAKE
                </p>
                <p className="text-xl font-light text-[#00F2FF]">
                  {targetCalories}{" "}
                  <span className="text-sm text-white/50">kcal</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {(aiMeals || meals).map((meal, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{
                    scale: 1.01,
                    backgroundColor: "rgba(255,255,255,0.02)",
                  }}
                  className="p-5 rounded-xl border border-white/5 bg-black/20 flex flex-col md:flex-row gap-4 justify-between transition-all"
                >
                  <div>
                    <h5 className="font-bold text-[#00F2FF] text-sm tracking-wider mb-1">
                      {meal.name}
                    </h5>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {meal.desc}
                    </p>
                  </div>
                  <div className="text-xs text-center font-mono text-[#7000FF] bg-[#7000FF]/10 px-3 py-2 rounded-lg self-start md:self-center uppercase flex-shrink-0">
                    {meal.macros}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
