"use client";

import { useState, useEffect } from "react";
import { FaSun, FaMoon, FaPlus, FaMinus, FaUniversalAccess } from "react-icons/fa";
import { MdOutlineTextDecrease, MdOutlineTextIncrease } from "react-icons/md";
import { useAccessibility } from "../contexts/AccessibilityContext";

export default function AccessibilityButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { fontSize, increaseFontSize, decreaseFontSize } = useAccessibility();

  useEffect(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    // setIsOpen(false); // Removed to keep menu open
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Main Button */}
      <button
        onClick={toggleMenu}
        className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/80 transition-colors"
        aria-label="Accesibilidad"
      >
        <FaUniversalAccess size={20} />
      </button>

      {/* Menu */}
      {isOpen && (
        <div className="absolute top-16 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 flex flex-col gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label="Cambiar modo oscuro"
          >
            {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
            <span className="text-sm">{isDark ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>

          {/* Font Size Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={decreaseFontSize}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              aria-label="Disminuir tamaño de letra"
            >
              <MdOutlineTextDecrease size={16} />
            </button>
            <span className="text-sm text-center">Tamaño: {Math.round(fontSize * 100)}%</span>
            <button
              onClick={increaseFontSize}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              aria-label="Aumentar tamaño de letra"
            >
              <MdOutlineTextIncrease size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}