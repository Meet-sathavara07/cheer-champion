"use client";
import { createContext, useState, useEffect, useContext } from "react";
import { getLoggedInUser } from "../models/authModel";

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface User {
  id: string;
  email:string;
  token:string;
  googleAuth?:any;
}
interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
}
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      setLoading(true);
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        const res = await getLoggedInUser();
        if(res?.user){
          setUser(res.user);
        }
      }
    } catch (error) {
      console.error("Failed to fetch loggedIn user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // try {
    //   const savedUser = localStorage.getItem("user");
    //   if (savedUser) {
    //     setUser(JSON.parse(savedUser));
    //   }
    // } catch (error) {
    //   console.error("Failed to parse user from localStorage", error);
    //   localStorage.removeItem("user");
    // } finally {
    //   setLoading(false);
    // }
    refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);


  return (
    <UserContext.Provider value={{ user, setUser, loading,setLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};