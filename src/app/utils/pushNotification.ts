"use client";
import { getToken } from "firebase/messaging";
import { messaging } from "../lib/services/firebase";

async function requestPermission() {
  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error("Error requesting notification permission", error);
  }
}
export async function getFCMPushToken() {
  const permission = await requestPermission();
  try {
    if (permission === "granted") {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers are not supported.");
      }
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
        serviceWorkerRegistration: registration,
      });
      return token;
    } else if (permission === "denied") {
      console.log("Denied for the notification");
      return null;
    }
  } catch (err) {
    console.error("Error getting token:", err);
    return null;
  }
}
