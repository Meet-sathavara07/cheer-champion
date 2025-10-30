"use client";
import { useEffect, useState } from "react";

export default function DarkModeSwitch() {
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle dark mode and store preference in localStorage
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    } else {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer mr-3 ">
      <input
        type="checkbox"
        checked={darkMode}
        onChange={toggleDarkMode}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-gray-700 peer-focus:ring-2 peer-focus:ring-gray-500"></div>
      <div className="absolute left-1 top-1 w-4 h-4 bg-white border border-gray-300 rounded-full shadow peer-checked:translate-x-5 peer-checked:border-white peer-checked:bg-gray-900 transition"></div>
    </label>
  );
}
