"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { GoogleSignInForm } from "@/features/auth/components/google-sign-in-form";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

type SignInFormProps = {
  callbackUrl?: string;
};

export default function SignInForm({ callbackUrl }: SignInFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
          callbackURL: callbackUrl || "/dashboard",
        },
        {
          onSuccess: () => {
            window.location.href = callbackUrl || "/dashboard";
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to sign in");
            setLoading(false);
          },
        }
      );
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl font-bold">
          Welcome to Briefly
        </CardTitle>
        <CardDescription>
          Sign in to access your AI-powered email workspace.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={loading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={loading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 border-t border-border" />
          <span className="relative px-2 text-xs text-muted-foreground bg-card">
            OR
          </span>
        </div>

        <GoogleSignInForm callbackUrl={callbackUrl} />

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href={`/sign-up${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`} className="text-primary hover:underline font-medium">
            Sign Up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
