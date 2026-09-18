"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRequestPasswordResetMutation } from "@/features/auth/hooks";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const resetMutation = useRequestPasswordResetMutation();
  const isLoading = resetMutation.isPending;
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await resetMutation.mutateAsync(data);
      setIsSubmitted(true);
      toast.success("Password reset instructions sent!");
    } catch {
      // Best effort notification
      toast.info("If an account exists with that email, a password reset link has been sent.");
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md bg-card border-[3px] border-border shadow-offset rounded-xl p-8 sm:p-10">
        <div className="mb-6 text-center">
          <div className="w-14 h-14 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
            {isSubmitted ? (
              <CheckCircle2 className="w-7 h-7 text-primary" />
            ) : (
              <KeyRound className="w-7 h-7 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {isSubmitted
              ? "Check your email inbox for password recovery instructions."
              : "Enter your registered email address to receive password reset instructions."}
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6">
            <div className="bg-surface border-2 border-border p-4 rounded-lg text-sm text-muted-foreground leading-relaxed text-center">
              If an account is associated with your email, you will receive a reset link shortly. Please check your spam folder if it doesn&apos;t arrive within 2 minutes.
            </div>
            <Link
              href="/login"
              className="w-full bg-primary text-foreground border-2 border-border shadow-offset rounded-lg px-4 py-3.5 font-bold text-base hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
            >
              <ArrowLeft size={18} />
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-foreground">Email Address</label>
              <input
                type="email"
                placeholder="student@wassceprep.com"
                {...register("email")}
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-surface border-2 rounded-md outline-none transition-colors text-foreground
                  ${errors.email ? 'border-destructive focus:border-destructive' : 'border-border focus:ring-2 focus:ring-ring focus:border-ring'}
                `}
              />
              {errors.email && (
                <p className="text-sm font-semibold text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-foreground border-2 border-border shadow-offset rounded-lg px-4 py-4 font-bold text-lg hover:-translate-y-0.5 hover:brightness-95 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sending Request...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-sm font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

