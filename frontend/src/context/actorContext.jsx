import { createContext, useContext, useState, useEffect } from "react";

const ActorContext = createContext(null);

export function ActorProvider({ children }) {
  const [userId, setUserIdState] = useState(localStorage.getItem("acting_user_id") || "");
  const [role, setRoleState] = useState(
    localStorage.getItem("acting_role") === "freelancer" ? "freelancer" : "client",
  );
  const [maxUserId, setMaxUserId] = useState(null);

  useEffect(() => {
    fetch("https://personal-43hivjqa.outsystemscloud.com/User/rest/User/user/")
      .then((r) => r.json())
      .then((json) => {
        const users = json?.data?.users;
        if (Array.isArray(users) && users.length > 0) {
          const ids = users.map((u) => u.userId).filter(Boolean);
          setMaxUserId(Math.max(...ids));
        }
      })
      .catch(() => {});
  }, []);

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

  const isUserIdValid =
    userId === "" ||
    (Number.isFinite(numericUserId) &&
      numericUserId >= 1 &&
      (maxUserId === null || numericUserId <= maxUserId));

  return (
    <ActorContext.Provider value={{ userId, role, resolvedUserId, setUserId, setRole, maxUserId, isUserIdValid }}>
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