import { Logo } from "@/components/common/logo";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="flex flex-col items-center gap-3 mb-8 select-none text-center animate-in fade-in slide-in-from-top-3 duration-300">
        <Link href="/" className="transition-transform hover:scale-105 active:scale-95 duration-200">
          <Logo width={56} height={56} priority />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Briefly</h1>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}