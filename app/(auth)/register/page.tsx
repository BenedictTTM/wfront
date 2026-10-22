"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { useRegisterMutation } from "@/features/auth/hooks";
import { GoogleSignInButton } from "@/features/auth/components";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const isLoading = registerMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync({ email: data.email, password: data.password });
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred during registration.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md bg-card border-2.5 border-border shadow-offset rounded-xl p-6 sm:p-7">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-black text-foreground mb-1.5">Create Account</h1>
          <p className="text-muted-foreground text-xs sm:text-sm font-semibold">Join us to start your preparation</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-foreground">Email Address</label>
            <input
              type="email"
              placeholder="student@wassceprep.com"
              {...register("email")}
              disabled={isLoading}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-surface border-2 rounded-lg outline-none transition-colors text-foreground
                ${errors.email ? 'border-destructive focus:border-destructive' : 'border-border focus:ring-2 focus:ring-ring focus:border-ring'}
              `}
            />
            {errors.email && (
              <p className="text-xs font-semibold text-destructive mt-0.5">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-foreground">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isLoading}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-surface border-2 rounded-lg outline-none transition-colors text-foreground
                ${errors.password ? 'border-destructive focus:border-destructive' : 'border-border focus:ring-2 focus:ring-ring focus:border-ring'}
              `}
            />
            {errors.password && (
              <p className="text-xs font-semibold text-destructive mt-0.5">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-foreground">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              disabled={isLoading}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-surface border-2 rounded-lg outline-none transition-colors text-foreground
                ${errors.confirmPassword ? 'border-destructive focus:border-destructive' : 'border-border focus:ring-2 focus:ring-ring focus:border-ring'}
              `}
            />
            {errors.confirmPassword && (
              <p className="text-xs font-semibold text-destructive mt-0.5">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-1.5 bg-primary text-foreground border-2 border-border shadow-offset rounded-xl px-4 py-2.5 font-black text-xs sm:text-sm hover:-translate-y-0.5 hover:brightness-95 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Creating account...</span>
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-card px-2.5 font-black text-muted-foreground tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleSignInButton label="Sign up with Google" />

        <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:underline decoration-2 underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
