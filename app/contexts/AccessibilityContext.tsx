"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AccessibilityContextType {
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
};

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSize] = useState(1); // multiplier, e.g., 1 = normal, 1.2 = larger

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${fontSize}rem`);
  }, [fontSize]);

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 0.1, 2)); // max 2x
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 0.1, 0.8)); // min 0.8x

  return (
    <AccessibilityContext.Provider value={{ fontSize, increaseFontSize, decreaseFontSize }}>
      {children}
    </AccessibilityContext.Provider>
  );
};