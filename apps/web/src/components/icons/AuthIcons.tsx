import Image from "next/image";
import {
  ArrowRight,
  AtSign,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Sparkles,
} from "lucide-react";
import bhutuImage from "@/app/bhutu.jpeg";

type IconProps = {
  className?: string;
};

function cn(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function BrandMark({ className }: IconProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full shadow-lg",
        className
      )}
      style={{ background: "linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 30%, white) 100%)" }}
    >
      <Sparkles size={20} style={{ color: "var(--background)" }} />
    </div>
  );
}

export function ScholarOrbIllustration({ className }: IconProps) {
  return (
    <div className={cn("relative h-80 w-80 rounded-[2rem]", className)}>
      <div
        className="absolute inset-0 rounded-[2rem]"
        style={{
          background:
            "radial-gradient(circle at top, color-mix(in srgb, var(--accent) 24%, transparent) 0%, transparent 48%), linear-gradient(180deg, color-mix(in srgb, var(--surface-alt) 82%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 90%, black 10%) 100%)",
          border: "1px solid var(--border)",
          boxShadow: "0 0 50px color-mix(in srgb, var(--accent) 16%, transparent)",
        }}
      />
      <div className="absolute inset-5 overflow-hidden rounded-[1.6rem]">
        <Image
          src={bhutuImage}
          alt="Decorative study illustration"
          fill
          className="object-cover"
          sizes="320px"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11, 19, 38, 0.08) 0%, rgba(11, 19, 38, 0.62) 100%)",
          }}
        />
      </div>
      
      <div
        className="absolute left-8 top-10 flex h-16 w-16 items-center justify-center rounded-2xl glass"
        style={{ color: "var(--accent)" }}
      >
        <GraduationCap size={28} />
      </div>
      <div
        className="absolute bottom-10 right-8 flex h-16 w-16 items-center justify-center rounded-2xl glass"
        style={{ color: "var(--accent)" }}
      >
        <Sparkles size={28} />
      </div>
    </div>
  );
}

export function EmailGlyph({ className }: IconProps) {
  return <AtSign size={20} className={className} />;
}

export function PasswordGlyph({ className }: IconProps) {
  return <Lock size={20} className={className} />;
}

export function VisibilityGlyph({
  visible,
  className,
}: IconProps & { visible: boolean }) {
  const Icon = visible ? EyeOff : Eye;
  return <Icon size={20} className={className} />;
}

export function GoogleMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function SubmitArrow({ className }: IconProps) {
  return <ArrowRight size={18} className={className} />;
}
