"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export function useSystemTheme() {
  const getSystemTheme = () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const [theme, setTheme] = useState(getSystemTheme());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => setTheme(getSystemTheme());

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return theme;
}

export function useAutoLogout(user: any, clearUserHandler: () => void) {
  useEffect(() => {
    if (!user) return;

    const checkAuthToken = () => {
      const allCookies = document.cookie;
      const hasToken = allCookies.includes("auth_token=");
      if (!hasToken && user) {
        clearInterval(interval)
        toast("Session expired. Please login again.", {
          icon: "⏳",
          duration: 4000,
        });
        clearUserHandler();
      }
    };

    const interval = setInterval(checkAuthToken, 10000);
    return () => clearInterval(interval);
  }, [user]);
}