import { Logo } from "@/components/common/logo";

export default function Footer() {
  return (
    <footer className="py-12 border-t-2 border-dashed border-[#2B2B2B]/20 bg-[#FBF2DE] select-none z-10 relative">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-[#2B2B2B]/60">
        <div className="flex items-center gap-2.5 font-hand font-bold text-[#2B2B2B] text-lg">
          <Logo className="rounded-full border-2 border-[#2B2B2B] bg-[#F6D2DE]" width={28} height={28} />
          <span>Briefly</span>
        </div>
        <div className="flex gap-8 font-medium">
          <a href="#" className="hover:text-[#2B2B2B] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#2B2B2B] transition-colors">Terms</a>
          <a href="#" className="hover:text-[#2B2B2B] transition-colors">Contact</a>
        </div>
        <p className="text-xs font-semibold text-[#2B2B2B]/40">
          &copy; {new Date().getFullYear()} Briefly. All rights reserved. ✦
        </p>
      </div>
    </footer>
  )
}