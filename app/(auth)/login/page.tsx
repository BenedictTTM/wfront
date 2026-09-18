"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { useLoginMutation } from "@/features/auth/hooks";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const isLoading = loginMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred during login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md bg-card border-[3px] border-border shadow-offset rounded-xl p-8 sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-3">Welcome Back</h1>
          <p className="text-muted-foreground text-lg">Sign in to your account to continue</p>
        </div>

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

          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-surface border-2 rounded-md outline-none transition-colors text-foreground
                ${errors.password ? 'border-destructive focus:border-destructive' : 'border-border focus:ring-2 focus:ring-ring focus:border-ring'}
              `}
            />
            {errors.password && (
              <p className="text-sm font-semibold text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-primary text-foreground border-2 border-border shadow-offset rounded-lg px-4 py-4 font-bold text-lg hover:-translate-y-0.5 hover:brightness-95 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground hover:underline decoration-2 underline-offset-4">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
