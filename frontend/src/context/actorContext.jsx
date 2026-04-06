import { createContext, useContext, useState } from "react";

const ActorContext = createContext(null);

export function ActorProvider({ children }) {
  const [userId, setUserIdState] = useState(localStorage.getItem("acting_user_id") || "");
  const [role, setRoleState] = useState(
    localStorage.getItem("acting_role") === "freelancer" ? "freelancer" : "client",
  );

  const setUserId = (userId) => {
    const cleaned = String(userId || "").trim();
    setUserIdState(cleaned);
    localStorage.setItem("acting_user_id", cleaned);
  };

  const setRole = (role) => {
    const normalized = role === "freelancer" ? "freelancer" : "client";
    setRoleState(normalized);
    localStorage.setItem("acting_role", normalized);
  };

  const numericUserId = Number(userId);
  const resolvedUserId = Number.isFinite(numericUserId) && numericUserId > 0 ? numericUserId : null;

  return (
    <ActorContext.Provider value={{ userId, role, resolvedUserId, setUserId, setRole }}>
      {children}
    </ActorContext.Provider>
  );
}

export function useActor() {
  const ctx = useContext(ActorContext);
  if (!ctx) {
    throw new Error("useActor must be used within an ActorProvider");
  }
  return ctx;
}
