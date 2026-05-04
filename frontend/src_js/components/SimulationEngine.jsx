import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLifestyle } from "../store/slices/lifestyleSlice";
import { fetchPrediction } from "../store/slices/predictionSlice";
import { Sliders, Activity, Moon, Droplets } from "lucide-react";
import { useProfile } from "../context/ProfileContext";

const SimulationEngine = () => {
  const dispatch = useDispatch();
  const lifestyle = useSelector((state) => state.lifestyle);
  const user = useSelector((state) => state.auth.user);
  const { profile } = useProfile();

  useEffect(() => {
    // Initial fetch
    if (user?.age) {
      dispatch(
        fetchPrediction({
          age: user.age,
          gender: profile.gender,
          weight: Number(profile.weight) || 70,
          height: Number(profile.height) || 170,
          conditions: profile.conditions,
          lifestyle,
          months: 60,
        }),
      );
    }
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateLifestyle({ [name]: parseFloat(value) }));

    // Trigger prediction recalculation debounce would be ideal here but let's do instant
    if (user?.age) {
      dispatch(
        fetchPrediction({
          age: user.age,
          gender: profile.gender,
          weight: Number(profile.weight) || 70,
          height: Number(profile.height) || 170,
          conditions: profile.conditions,
          lifestyle: { ...lifestyle, [name]: parseFloat(value) },
          months: 60,
        }),
      );
    }
  };

  const renderSlider = (label, value, name, min, max, step, icon, unit) => (
    <div className="flex flex-col mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold flex items-center gap-2 text-gray-300">
          <span className="text-accent-primary">{icon}</span> {label}
        </label>
        <span className="text-sm font-mono text-accent-secondary bg-background-secondary px-2 py-1 rounded border border-gray-800">
          {value} <span className="text-xs text-text-muted">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-accent-primary focus:outline-none"
      />
    </div>
  );

  return (
    <div className="p-6 glassmorphism rounded-2xl w-full">
      <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
        <Sliders className="w-5 h-5 text-accent-primary" /> Lifecycle Simulation
      </h3>

      {renderSlider(
        "Daily Steps",
        lifestyle.steps_daily,
        "steps_daily",
        0,
        25000,
        500,
        <Activity size={16} />,
        "steps",
      )}
      {renderSlider(
        "Sleep Duration",
        lifestyle.sleep_hours,
        "sleep_hours",
        0,
        12,
        0.5,
        <Moon size={16} />,
        "hrs",
      )}
      {renderSlider(
        "Hydration",
        lifestyle.hydration_liters,
        "hydration_liters",
        0,
        8,
        0.5,
        <Droplets size={16} />,
        "L",
      )}
      {renderSlider(
        "Stress Level",
        lifestyle.stress_level,
        "stress_level",
        1,
        10,
        1,
        <Activity size={16} />,
        "/10",
      )}

      <p className="text-xs text-text-muted mt-4 text-center">
        Adjust parameters to simulate future trajectory based on current health
        vectors.
      </p>
    </div>
  );
};

export default SimulationEngine;
