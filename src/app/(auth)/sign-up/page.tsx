import type { Metadata } from "next";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Sign up for a new account with email/password or Google OAuth.",
};

type SignUpPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { callbackUrl } = await searchParams;

  return <SignUpForm callbackUrl={callbackUrl} />;
}
