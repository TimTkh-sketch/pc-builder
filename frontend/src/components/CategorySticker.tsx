import {
  Cpu, CircuitBoard, MemoryStick, Gamepad2, HardDrive,
  Zap, Box, Wind, Monitor, Keyboard, Mouse, Wrench,
  type LucideIcon,
} from "lucide-react";

/* ── Icon & colour config ────────────────────────────────────── */
interface Meta { Icon: LucideIcon; gradient: string; glow: string; iconColor: string }

const CATEGORY: Record<string, Meta> = {
  cpu: {
    Icon: Cpu,
    gradient: "from-blue-600/30 via-blue-500/10 to-blue-950/50",
    glow:     "bg-blue-500/25",
    iconColor:"text-blue-300",
  },
  motherboard: {
    Icon: CircuitBoard,
    gradient: "from-purple-600/30 via-purple-500/10 to-purple-950/50",
    glow:     "bg-purple-500/25",
    iconColor:"text-purple-300",
  },
  ram: {
    Icon: MemoryStick,
    gradient: "from-green-600/30 via-green-500/10 to-green-950/50",
    glow:     "bg-green-500/25",
    iconColor:"text-green-300",
  },
  gpu: {
    Icon: Gamepad2,
    gradient: "from-red-600/30 via-red-500/10 to-red-950/50",
    glow:     "bg-red-500/25",
    iconColor:"text-red-300",
  },
  storage: {
    Icon: HardDrive,
    gradient: "from-yellow-600/30 via-yellow-500/10 to-yellow-950/50",
    glow:     "bg-yellow-500/25",
    iconColor:"text-yellow-300",
  },
  psu: {
    Icon: Zap,
    gradient: "from-orange-600/30 via-orange-500/10 to-orange-950/50",
    glow:     "bg-orange-500/25",
    iconColor:"text-orange-300",
  },
  case: {
    Icon: Box,
    gradient: "from-slate-600/30 via-slate-500/10 to-slate-950/50",
    glow:     "bg-slate-500/25",
    iconColor:"text-slate-300",
  },
  cooler: {
    Icon: Wind,
    gradient: "from-cyan-600/30 via-cyan-500/10 to-cyan-950/50",
    glow:     "bg-cyan-500/25",
    iconColor:"text-cyan-300",
  },
  monitor: {
    Icon: Monitor,
    gradient: "from-indigo-600/30 via-indigo-500/10 to-indigo-950/50",
    glow:     "bg-indigo-500/25",
    iconColor:"text-indigo-300",
  },
  keyboard: {
    Icon: Keyboard,
    gradient: "from-violet-600/30 via-violet-500/10 to-violet-950/50",
    glow:     "bg-violet-500/25",
    iconColor:"text-violet-300",
  },
  mouse: {
    Icon: Mouse,
    gradient: "from-fuchsia-600/30 via-fuchsia-500/10 to-fuchsia-950/50",
    glow:     "bg-fuchsia-500/25",
    iconColor:"text-fuchsia-300",
  },
};

const FALLBACK: Meta = {
  Icon: Wrench,
  gradient: "from-gray-600/30 via-gray-500/10 to-gray-950/50",
  glow:     "bg-gray-500/25",
  iconColor:"text-gray-300",
};

/* ── Size variants ───────────────────────────────────────────── */
type Size = "xs" | "sm" | "md" | "lg" | "xl";

const HEIGHT: Record<Size, string>   = { xs:"h-10", sm:"h-16", md:"h-28", lg:"h-40", xl:"h-52" };
const ICON_PX: Record<Size, number>  = { xs:18,     sm:24,     md:40,     lg:52,     xl:72 };
const GLOW_SZ: Record<Size, string>  = { xs:"w-8 h-8", sm:"w-12 h-12", md:"w-20 h-20", lg:"w-28 h-28", xl:"w-40 h-40" };

/* ── Components ──────────────────────────────────────────────── */
interface Props {
  slug: string;
  size?: Size;
  className?: string;
}

export default function CategorySticker({ slug, size = "md", className = "" }: Props) {
  const meta     = CATEGORY[slug] ?? FALLBACK;
  const { Icon, gradient, glow, iconColor } = meta;

  return (
    <div
      className={`bg-gradient-to-br ${gradient} ${HEIGHT[size]} flex items-center justify-center select-none relative overflow-hidden ${className}`}
    >
      {/* Glow blob */}
      <div className={`absolute rounded-full blur-2xl ${glow} ${GLOW_SZ[size]}`} />
      {/* Icon */}
      <Icon
        size={ICON_PX[size]}
        className={`relative drop-shadow-lg ${iconColor}`}
        strokeWidth={1.5}
      />
    </div>
  );
}

/** Inline icon badge (no background) for small spaces */
export function StickerBadge({ slug, size = 16, className = "" }: { slug: string; size?: number; className?: string }) {
  const { Icon, iconColor } = CATEGORY[slug] ?? FALLBACK;
  return <Icon size={size} className={`${iconColor} inline-block ${className}`} strokeWidth={1.5} />;
}
