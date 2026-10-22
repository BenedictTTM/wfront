// features/auth/components/GoogleSignInButton.tsx

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useGoogleLoginMutation } from "@/features/auth/hooks";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: unknown) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: string | number;
            }
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  label?: string;
  onSuccess?: () => void;
  className?: string;
}

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  return (
    <React.Suspense
      fallback={
        <button
          type="button"
          disabled
          className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-surface text-foreground font-bold text-base rounded-xl border-2 border-border shadow-offset opacity-60 pointer-events-none ${
            props.className || ""
          }`}
          aria-label={props.label || "Continue with Google"}
        >
          <svg
            className="w-5 h-5 shrink-0"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>{props.label || "Continue with Google"}</span>
        </button>
      }
    >
      <GoogleSignInButtonInner {...props} />
    </React.Suspense>
  );
}

function GoogleSignInButtonInner({
  label = "Continue with Google",
  onSuccess,
  className = "",
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleMutation = useGoogleLoginMutation();
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const hiddenBtnContainerRef = useRef<HTMLDivElement>(null);

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const handleCredentialResponse = useCallback(
    async (response: { credential?: string }) => {
      if (!response?.credential) {
        toast.error("Google authentication failed: No credential received.");
        return;
      }

      try {
        await googleMutation.mutateAsync({ idToken: response.credential });
        toast.success("Signed in with Google successfully!");

        if (onSuccess) {
          onSuccess();
        }

        const fromParam = searchParams.get("from");
        const isSafeLocalPath =
          !!fromParam &&
          fromParam.startsWith("/") &&
          !fromParam.startsWith("//") &&
          !fromParam.includes("\\");
        const targetUrl = isSafeLocalPath ? fromParam : "/dashboard";
        router.push(targetUrl);
      } catch (err: unknown) {
        const errorObj = err as { message?: string; code?: string } | undefined;
        const errorMsg =
          errorObj?.message ||
          (errorObj?.code === "ACCOUNT_EXISTS_WITH_PASSWORD"
            ? "An account with this email already exists using password authentication. Please sign in with your password."
            : "Google sign-in failed. Please try again.");

        toast.error(errorMsg);
      }
    },
    [googleMutation, onSuccess, router, searchParams]
  );

  // Initialize GIS once script loads
  useEffect(() => {
    if (typeof window === "undefined" || !window.google?.accounts?.id || !googleClientId) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render official hidden button to programmatically trigger standard GIS popup if prompt is blocked
      if (hiddenBtnContainerRef.current) {
        hiddenBtnContainerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(hiddenBtnContainerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: 250,
        });
      }

      setIsGsiLoaded(true);
    } catch (err) {
      console.warn("[GoogleSignIn] Initialization warning:", err);
    }
  }, [googleClientId, handleCredentialResponse, isGsiLoaded]);

  const handleClick = () => {
    if (googleMutation.isPending || isInitializing) return;

    if (!googleClientId) {
      toast.info(
        "Google Sign-In is pending configuration. Please configure NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment."
      );
      return;
    }

    if (!window.google?.accounts?.id) {
      toast.error("Google Authentication service is loading. Please wait a moment.");
      return;
    }

    setIsInitializing(true);

    try {
      // Re-initialize to ensure fresh callback closure
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Trigger GIS Prompt
      window.google.accounts.id.prompt((notification) => {
        setIsInitializing(false);
        if (notification.isNotDisplayed()) {
          // If One Tap prompt cannot display (e.g., suppressed or 3rd party cookies blocked),
          // fallback to clicking the rendered GIS button inside the hidden container
          const buttonElement = hiddenBtnContainerRef.current?.querySelector<HTMLElement>(
            'div[role="button"]'
          );
          if (buttonElement) {
            buttonElement.click();
          } else {
            toast.error("Google sign-in prompt was blocked by browser settings.");
          }
        }
      });
    } catch (err) {
      setIsInitializing(false);
      console.error("[GoogleSignIn] Prompt error:", err);
      toast.error("Failed to open Google authentication prompt.");
    }
  };

  const isLoading = googleMutation.isPending || isInitializing;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setIsGsiLoaded(true)}
      />

      {/* Hidden container for Google rendered button fallback */}
      <div
        ref={hiddenBtnContainerRef}
        aria-hidden="true"
        className="hidden"
        style={{ display: "none" }}
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-surface hover:bg-bg-secondary text-foreground font-bold text-base rounded-xl border-2 border-border shadow-offset hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-60 disabled:pointer-events-none cursor-pointer ${className}`}
        aria-label={label}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            {/* Official 4-color Google 'G' Logo */}
            <svg
              className="w-5 h-5 shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>
    </>
  );
}
