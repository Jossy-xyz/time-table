import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "./types/institutional";

interface AuthContextType {
  user: User | null;
  token: string | null; // Compatibility with useAuth usage in App.tsx
  login: (userData: User) => void;
  logout: () => void;
}

const Authenticate = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user_data");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem("token");
    return savedToken && localStorage.getItem("user_data") ? savedToken : null;
  });

  const login = async (userData: User) => {
    try {
      const res = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password,
        }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      const authenticatedUser: User = {
        ...data,
        username: data.username,
        roleCode: data.roleCode || "AD",
      };

      setUser(authenticatedUser);
      setToken("auth-token");

      localStorage.setItem("token", "auth-token");
      localStorage.setItem("username", data.username);
      localStorage.setItem("user_data", JSON.stringify(authenticatedUser));

      if (data.department) {
        localStorage.setItem("deptId", data.department.id);
      }
    } catch (err) {
      console.error("Auth failed", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("deptId");
    localStorage.removeItem("user_data");
  };

  return (
    <Authenticate.Provider value={{ user, token, login, logout }}>
      {children}
    </Authenticate.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(Authenticate);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
