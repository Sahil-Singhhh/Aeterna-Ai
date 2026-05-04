export const calculateHealthTargets = (age: number) => {
  let movementTarget = 10000;
  let hydrationTarget = 3.5;
  let sleepTarget = { min: 7, max: 8 };

  if (age < 18) {
    movementTarget = 12000;
    hydrationTarget = 2.0;
    sleepTarget = { min: 9, max: 11 };
  } else if (age > 60) {
    movementTarget = 6000;
    hydrationTarget = 2.5;
    sleepTarget = { min: 7, max: 9 };
  }

  return { movementTarget, hydrationTarget, sleepTarget };
};

export const calculateMaxVitalityCap = (age: number) => {
  return age > 70 ? 90 : 100;
};

// Activity Multipliers
const activityMultipliers: Record<string, number> = {
  'Sedentary': 1.2,
  'Light': 1.375,
  'Moderate': 1.55,
  'Active': 1.725,
  'Very Active': 1.9
};

export const calculateCalories = (
  age: number,
  weight: number, // kg
  height: number, // cm
  gender: string,
  activityLevel: string
) => {
  // BMR (Mifflin-St Jeor Equation)
  // Men: BMR = (10 x weight) + (6.25 x height) - (5 x age) + 5
  // Women: BMR = (10 x weight) + (6.25 x height) - (5 x age) - 161
  // For 'Other', average the two as fallback.
  
  if (!weight || !height || !age) {
      return { bmr: 0, tdee: 0 };
  }

  let bmr = 0;
  const menBMR = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  const womenBMR = (10 * weight) + (6.25 * height) - (5 * age) - 161;

  if (gender === 'Male') {
    bmr = menBMR;
  } else if (gender === 'Female') {
    bmr = womenBMR;
  } else {
    // Other / Default
    bmr = (menBMR + womenBMR) / 2;
  }

  const multiplier = activityMultipliers[activityLevel] || 1.2;
  const tdee = bmr * multiplier;

  return { bmr: Math.round(bmr), tdee: Math.round(tdee) };
};

// If the dashboard uses it to calculate score dynamically without backend:
export const calculateDynamicHealthScore = (
  age: number,
  sleep: number,
  steps: number,
  hydration: number,
  stress: number
) => {
  const targets = calculateHealthTargets(age);
  const S_target = (targets.sleepTarget.min + targets.sleepTarget.max) / 2;
  
  // S_core, M_core, H_core, St_core using dynamic targets 
  const score = (sleep / S_target * 30) + 
                (steps / targets.movementTarget * 25) + 
                (hydration / targets.hydrationTarget * 15) + 
                ((11 - stress) / 10.0 * 30);
  
  const cap = calculateMaxVitalityCap(age);
  return Math.max(0, Math.min(cap, score));
};
