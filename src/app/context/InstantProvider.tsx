"use client";
import React, { createContext, useContext } from "react";
import { init } from "@instantdb/react";
import schema from "../../../instant.schema";

// Initialize InstantDB
export const db = init({ appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID || "", schema});

// const db = init({
//   appId: INSTANT_APP_ID,
//   adminToken: process.env.INSTANT_APP_ADMIN_TOKEN,
// });

const InstantDBContext = createContext(db);

export function InstantDBProvider({ children }:{ children: React.ReactNode }) {
  return (
    <InstantDBContext.Provider value={db}>{children}</InstantDBContext.Provider>
  );
}

export function useInstantDB() {
  return useContext(InstantDBContext);
}