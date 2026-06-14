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

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

type SignUpFormProps = {
  callbackUrl?: string;
};

export default function SignUpForm({ callbackUrl }: SignUpFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await authClient.signUp.email(
        {
          email: values.email,
          password: values.password,
          name: values.name,
          callbackURL: callbackUrl || "/dashboard",
        },
        {
          onSuccess: () => {
            window.location.href = callbackUrl || "/dashboard";
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to sign up");
            setLoading(false);
          },
        }
      );
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl font-bold">
          Create an Account
        </CardTitle>
        <CardDescription>
          Sign up to get started with Briefly.
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Alex Johnson"
              disabled={loading}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
            )}
          </div>

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
            Sign Up
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
          Already have an account?{" "}
          <Link href={`/sign-in${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`} className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
