import { createContext, useContext, useState, useEffect } from "react";
import { useSelector } from "react-redux";

const defaultProfile = {
  age: "",
  gender: "",
  weight: "",
  height: "",
  activityLevel: "",
  conditions: ["None"],
  medications: "",
};

const ProfileContext = createContext(undefined);

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(defaultProfile);
  const user = useSelector((state) => state.auth.user);
  const emailKey = user?.email ? `_${user.email}` : "";

  // Load from local storage dynamically when user changes
  useEffect(() => {
    const saved = localStorage.getItem(`aeterna_user_profile${emailKey}`);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    } else {
      setProfile(defaultProfile);
    }
  }, [emailKey]);

  // Save to local storage isolated for the user
  useEffect(() => {
    if (profile.age !== "") {
      localStorage.setItem(
        `aeterna_user_profile${emailKey}`,
        JSON.stringify(profile),
      );
    }
  }, [profile, emailKey]);

  const isProfileComplete =
    profile.age !== "" &&
    profile.gender !== "" &&
    profile.weight !== "" &&
    profile.height !== "" &&
    profile.activityLevel !== "";

  return (
    <ProfileContext.Provider value={{ profile, setProfile, isProfileComplete }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
