import { Logo } from "@/components/common/logo"

export default function Footer() {
  return (
    <footer className="py-12 border-t border-black/[0.06] bg-neutral-50/50 select-none z-10 relative">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-neutral-500">
        <div className="flex items-center gap-2.5 font-bold text-neutral-800 text-base">
          <Logo width={24} height={24} />
          <span>Briefly</span>
        </div>
        <div className="flex gap-8 font-medium">
          <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
          <a href="#" className="hover:text-neutral-900 transition-colors">Contact</a>
        </div>
        <p className="text-xs font-semibold text-neutral-400">
          &copy; {new Date().getFullYear()} Briefly. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
