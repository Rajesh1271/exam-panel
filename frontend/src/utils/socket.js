// src/utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3300";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000
    });

    socket.on("connect", () => {
      console.log("⚡ [Real-Time] Connected to backend WebSockets:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ [Real-Time] Socket connection error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("🔌 [Real-Time] Disconnected from WebSockets");
    });
  }
  return socket;
};

// Global cross-tab synchronization channel
const bc = typeof window !== "undefined" && window.BroadcastChannel ? new BroadcastChannel("exam_panel_sync") : null;

/**
 * Universal real-time event listener
 * Supports:
 *   1. onRealtimeEvent((eventName, payload) => ...)  // Catch-all
 *   2. onRealtimeEvent('questionAdded', (payload) => ...) // Specific event
 *   3. onRealtimeEvent(['questionAdded', 'examCreated'], (eventName, payload) => ...) // Array of events
 */
export const onRealtimeEvent = (eventOrCallback, maybeCallback) => {
  const sock = getSocket();
  let cleanupFns = [];

  if (typeof eventOrCallback === "function") {
    // 1. Catch-all wildcard callback: callback(eventName, payload)
    const callback = eventOrCallback;

    const anyHandler = (event, data) => {
      try {
        callback(event, data);
      } catch (err) {
        console.error("Error in realtime wildcard listener:", err);
      }
    };
    sock.onAny(anyHandler);
    cleanupFns.push(() => sock.offAny(anyHandler));

    const bcHandler = (e) => {
      if (e.data && e.data.type) {
        try {
          callback(e.data.type, e.data.payload);
        } catch (err) {
          console.error("Error in BC wildcard listener:", err);
        }
      }
    };
    if (bc) {
      bc.addEventListener("message", bcHandler);
      cleanupFns.push(() => bc.removeEventListener("message", bcHandler));
    }

    const windowHandler = (e) => {
      if (e.detail) {
        try {
          callback(e.detail.eventName || e.type, e.detail.payload || e.detail);
        } catch (err) {
          console.error("Error in window custom event listener:", err);
        }
      }
    };
    window.addEventListener("realtime_event", windowHandler);
    cleanupFns.push(() => window.removeEventListener("realtime_event", windowHandler));

  } else if (typeof eventOrCallback === "string" && typeof maybeCallback === "function") {
    // 2. Specific single event listener
    const eventName = eventOrCallback;
    const callback = maybeCallback;

    const sockHandler = (data) => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in realtime listener for ${eventName}:`, err);
      }
    };
    sock.on(eventName, sockHandler);
    cleanupFns.push(() => sock.off(eventName, sockHandler));

    const bcHandler = (e) => {
      if (e.data && e.data.type === eventName) {
        try {
          callback(e.data.payload);
        } catch (err) {
          console.error(`Error in BC listener for ${eventName}:`, err);
        }
      }
    };
    if (bc) {
      bc.addEventListener("message", bcHandler);
      cleanupFns.push(() => bc.removeEventListener("message", bcHandler));
    }

    const windowHandler = (e) => {
      try {
        callback(e.detail);
      } catch (err) {
        console.error(`Error in window listener for ${eventName}:`, err);
      }
    };
    window.addEventListener(eventName, windowHandler);
    cleanupFns.push(() => window.removeEventListener(eventName, windowHandler));

  } else if (Array.isArray(eventOrCallback) && typeof maybeCallback === "function") {
    // 3. Array of events
    const events = eventOrCallback;
    const callback = maybeCallback;

    events.forEach((evt) => {
      const unsub = onRealtimeEvent(evt, (payload) => callback(evt, payload));
      cleanupFns.push(unsub);
    });
  }

  return () => {
    cleanupFns.forEach((fn) => {
      try {
        fn();
      } catch (e) {}
    });
  };
};

export const broadcastLocalEvent = (eventName, payload) => {
  if (bc) {
    try {
      bc.postMessage({ type: eventName, payload });
    } catch (e) {}
  }
  window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
  window.dispatchEvent(new CustomEvent("realtime_event", { detail: { eventName, payload } }));
};
