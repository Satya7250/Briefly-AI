import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Logo({ className, width = 36, height = 36, priority = false }: LogoProps) {
  // Crop the transparent borders of the 1536x1024 logo by scaling the image within an overflow-hidden wrapper
  const size = Math.max(width, height);

  return (
    <div
      className={cn("relative overflow-hidden flex items-center justify-center shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/log.png"
        alt="Briefly Logo"
        width={size * 4}
        height={size * 4}
        priority={priority}
        className="absolute max-w-none object-contain dark:invert transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "337.5%",
          height: "225%",
        }}
      />
    </div>
  );
}
