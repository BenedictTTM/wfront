"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchAuthToken } from "@/features/auth/api";
import { getAchievementsWsUrl, formatAchievementUnlockToast } from "./ws-utils";
import { AchievementUnlockedPayload } from "./types";

const RECONNECT_INTERVALS = [1000, 2000, 5000, 10000];

/**
 * Global WebSocket hook listening for real-time achievement unlocks from the backend worker.
 * Displays immediate toast feedback and invalidates relevant caches without requiring page reload.
 */
export function useAchievementNotifications(enabled: boolean = true) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    if (!enabled) return;

    let socket: WebSocket | null = null;

    async function connect() {
      try {
        const token = await fetchAuthToken();
        if (!token || !isMountedRef.current) return;

        const wsUrl = getAchievementsWsUrl();
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          reconnectAttemptRef.current = 0;
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                event: "authenticate",
                data: { token },
              })
            );
          }
        };

        socket.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.event === "achievement.unlocked") {
              const data = parsed.data as AchievementUnlockedPayload;

              const toastContent = formatAchievementUnlockToast(data);
              toast.success(toastContent.title, {
                description: toastContent.description,
                duration: 6500,
              });

              // Instantly refresh achievement lists, stats, and profile views
              queryClient.invalidateQueries({ queryKey: ["achievements"] });
              queryClient.invalidateQueries({ queryKey: ["dashboard"] });
              queryClient.invalidateQueries({ queryKey: ["stats"] });
            }
          } catch (err) {
            console.error("[useAchievementNotifications] Error parsing WS message", err);
          }
        };

        socket.onclose = (event) => {
          if (!isMountedRef.current) return;
          // Clean close or intentional teardown
          if (event.code === 1000) return;

          const delay =
            RECONNECT_INTERVALS[
              Math.min(reconnectAttemptRef.current, RECONNECT_INTERVALS.length - 1)
            ];
          reconnectAttemptRef.current += 1;

          reconnectTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              connect();
            }
          }, delay);
        };

        socket.onerror = () => {
          socket?.close();
        };
      } catch {
        // Silently retry on token / network errors
        const delay =
          RECONNECT_INTERVALS[
            Math.min(reconnectAttemptRef.current, RECONNECT_INTERVALS.length - 1)
          ];
        reconnectAttemptRef.current += 1;

        reconnectTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            connect();
          }
        }, delay);
      }
    }

    connect();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (socket) {
        socket.close(1000, "Unmounted");
      }
      wsRef.current = null;
    };
  }, [enabled, queryClient]);
}
