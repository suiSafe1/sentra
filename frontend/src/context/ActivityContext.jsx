import React, { createContext, useContext } from "react";
import { useActivity } from "../hooks/useActivity";

const ActivityContext = createContext(null);

export function ActivityProvider({ children }) {
  const activity = useActivity();

  return (
    <ActivityContext.Provider value={activity}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivityContext() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivityContext must be used within ActivityProvider");
  }
  return context;
}
