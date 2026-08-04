"use client";

// features/mock-exam/services/notification-service.ts

const PREF_KEY = "lockin_notifications_enabled";
const NOTIFICATION_TAG = "lockin-focus-warning";

export class NotificationService {
  private static instance: NotificationService | null = null;
  private activeNotification: Notification | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  public getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  }

  public isEnabledPreference(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(PREF_KEY) === "true";
  }

  public setEnabledPreference(enabled: boolean): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(PREF_KEY, enabled ? "true" : "false");
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return "denied";
    try {
      const permission = await Notification.requestPermission();
      this.setEnabledPreference(permission === "granted");
      return permission;
    } catch {
      return "denied";
    }
  }

  public showFocusLostNotification(): void {
    if (!this.isSupported()) return;
    if (this.getPermissionStatus() !== "granted") return;
    if (!this.isEnabledPreference()) return;

    this.closeNotification();

    try {
      const options: NotificationOptions = {
        body: "Return within 10 seconds or your simulation will end.",
        icon: "/favicon.ico",
        tag: NOTIFICATION_TAG,
        requireInteraction: true,
      };

      this.activeNotification = new Notification("🔒 LockIn™", options);

      this.activeNotification.onclick = () => {
        if (typeof window !== "undefined") {
          window.focus();
        }
        this.closeNotification();
      };
    } catch (e) {
      console.warn("[LockIn Notification] Failed to display notification", e);
    }
  }

  public closeNotification(): void {
    if (this.activeNotification) {
      try {
        this.activeNotification.close();
      } catch {}
      this.activeNotification = null;
    }
  }
}
