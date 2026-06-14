"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { signInWithGoogle } from "../actions";

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23zM5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  let buttonLabel = "Continue with Google";
  let buttonIcon = <GoogleIcon />;

  if (pending) {
    buttonLabel = "Redirecting to Google…";
    buttonIcon = <Loader2 className="size-4 animate-spin" />;
  }

  return (
    <Button
      type="submit"
      className={"w-full"}
      size={"lg"}
      disabled={pending}
    >
      {buttonIcon}
      {buttonLabel}
    </Button>
  )
}


type GoogleSignInFormProps = {
  /** Optional post-login redirect path (e.g. GitHub install callback). */
  callbackUrl?: string;
};

export function GoogleSignInForm({ callbackUrl }: GoogleSignInFormProps) {
  return (
    <form action={signInWithGoogle} className="w-full">
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}
      <SubmitButton />
    </form>
  )
}