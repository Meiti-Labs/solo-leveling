import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlarmClock,
  Award,
  Bike,
  BookOpen,
  Brain,
  Briefcase,
  CalendarCheck,
  Camera,
  Code2,
  Coffee,
  Coins,
  Compass,
  Crown,
  Dumbbell,
  Flame,
  Gamepad2,
  Gem,
  GraduationCap,
  Handshake,
  Heart,
  HeartPulse,
  Leaf,
  Medal,
  MessageSquare,
  Moon,
  Mountain,
  Music,
  Palette,
  Pencil,
  Rocket,
  Shield,
  Smile,
  Sparkles,
  Star,
  Sun,
  Sword,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import type {
  AttributeColorScheme,
  AttributeIconKey,
  AttributeKey,
  AttributeProgress,
  CoreAttributeKey,
} from "@/lib/indexed-db/types";
import {
  isAttributeColorScheme,
  isAttributeIconKey,
  isCoreAttributeKey,
} from "@/lib/indexed-db/types";

export type AttributeVisual = {
  color: AttributeColorScheme;
  icon: LucideIcon;
  iconKey: AttributeIconKey;
};

export const attributeIconOptions: Array<{
  icon: LucideIcon;
  key: AttributeIconKey;
  label: string;
}> = [
  { key: "activity", label: "Activity", icon: Activity },
  { key: "alarm-clock", label: "Alarm", icon: AlarmClock },
  { key: "award", label: "Award", icon: Award },
  { key: "bike", label: "Bike", icon: Bike },
  { key: "book-open", label: "Book", icon: BookOpen },
  { key: "brain", label: "Brain", icon: Brain },
  { key: "briefcase", label: "Work", icon: Briefcase },
  { key: "calendar-check", label: "Calendar", icon: CalendarCheck },
  { key: "camera", label: "Camera", icon: Camera },
  { key: "code-2", label: "Code", icon: Code2 },
  { key: "coffee", label: "Coffee", icon: Coffee },
  { key: "coins", label: "Coins", icon: Coins },
  { key: "compass", label: "Compass", icon: Compass },
  { key: "crown", label: "Crown", icon: Crown },
  { key: "dumbbell", label: "Workout", icon: Dumbbell },
  { key: "flame", label: "Flame", icon: Flame },
  { key: "gamepad-2", label: "Gaming", icon: Gamepad2 },
  { key: "gem", label: "Gem", icon: Gem },
  { key: "graduation-cap", label: "Learning", icon: GraduationCap },
  { key: "handshake", label: "Social", icon: Handshake },
  { key: "heart", label: "Heart", icon: Heart },
  { key: "heart-pulse", label: "Health", icon: HeartPulse },
  { key: "leaf", label: "Nature", icon: Leaf },
  { key: "medal", label: "Medal", icon: Medal },
  { key: "message-square", label: "Chat", icon: MessageSquare },
  { key: "moon", label: "Moon", icon: Moon },
  { key: "mountain", label: "Mountain", icon: Mountain },
  { key: "music", label: "Music", icon: Music },
  { key: "palette", label: "Art", icon: Palette },
  { key: "pencil", label: "Writing", icon: Pencil },
  { key: "rocket", label: "Rocket", icon: Rocket },
  { key: "shield", label: "Shield", icon: Shield },
  { key: "smile", label: "Mood", icon: Smile },
  { key: "sparkles", label: "Spark", icon: Sparkles },
  { key: "star", label: "Star", icon: Star },
  { key: "sun", label: "Sun", icon: Sun },
  { key: "sword", label: "Sword", icon: Sword },
  { key: "target", label: "Target", icon: Target },
  { key: "trophy", label: "Trophy", icon: Trophy },
  { key: "zap", label: "Energy", icon: Zap },
];

export const attributeColorSchemeOptions: Array<{
  badge: string;
  icon: string;
  key: AttributeColorScheme;
  label: string;
  progress: string;
  selected: string;
}> = [
  {
    key: "purple",
    label: "Purple",
    badge:
      "border-violet-500/70 bg-violet-950/35 shadow-[0_0_22px_rgba(139,92,246,0.22)]",
    icon: "text-violet-400",
    progress: "from-violet-500 to-fuchsia-400",
    selected: "border-violet-400/80 bg-violet-950/35 text-violet-100",
  },
  {
    key: "blue",
    label: "Blue",
    badge:
      "border-blue-500/70 bg-blue-950/35 shadow-[0_0_22px_rgba(59,130,246,0.22)]",
    icon: "text-blue-400",
    progress: "from-blue-500 to-sky-400",
    selected: "border-blue-400/80 bg-blue-950/35 text-blue-100",
  },
  {
    key: "green",
    label: "Green",
    badge:
      "border-emerald-500/70 bg-emerald-950/35 shadow-[0_0_22px_rgba(16,185,129,0.22)]",
    icon: "text-emerald-400",
    progress: "from-emerald-500 to-teal-300",
    selected: "border-emerald-400/80 bg-emerald-950/35 text-emerald-100",
  },
  {
    key: "gold",
    label: "Gold",
    badge:
      "border-amber-500/70 bg-amber-950/35 shadow-[0_0_22px_rgba(245,158,11,0.22)]",
    icon: "text-amber-300",
    progress: "from-amber-400 to-yellow-300",
    selected: "border-amber-400/80 bg-amber-950/35 text-amber-100",
  },
  {
    key: "cyan",
    label: "Cyan",
    badge:
      "border-cyan-500/70 bg-cyan-950/35 shadow-[0_0_22px_rgba(6,182,212,0.22)]",
    icon: "text-cyan-300",
    progress: "from-cyan-500 to-sky-300",
    selected: "border-cyan-400/80 bg-cyan-950/35 text-cyan-100",
  },
  {
    key: "pink",
    label: "Pink",
    badge:
      "border-pink-500/70 bg-pink-950/35 shadow-[0_0_22px_rgba(236,72,153,0.22)]",
    icon: "text-pink-400",
    progress: "from-pink-500 to-rose-300",
    selected: "border-pink-400/80 bg-pink-950/35 text-pink-100",
  },
  {
    key: "red",
    label: "Red",
    badge:
      "border-rose-500/70 bg-rose-950/35 shadow-[0_0_22px_rgba(244,63,94,0.22)]",
    icon: "text-rose-400",
    progress: "from-rose-500 to-red-300",
    selected: "border-rose-400/80 bg-rose-950/35 text-rose-100",
  },
  {
    key: "indigo",
    label: "Indigo",
    badge:
      "border-indigo-500/70 bg-indigo-950/35 shadow-[0_0_22px_rgba(99,102,241,0.22)]",
    icon: "text-indigo-300",
    progress: "from-indigo-500 to-blue-300",
    selected: "border-indigo-400/80 bg-indigo-950/35 text-indigo-100",
  },
];

const coreAttributeVisuals: Record<
  CoreAttributeKey,
  Pick<AttributeVisual, "color" | "iconKey">
> = {
  strength: { color: "purple", iconKey: "sword" },
  intelligence: { color: "blue", iconKey: "book-open" },
  discipline: { color: "green", iconKey: "shield" },
  finance: { color: "gold", iconKey: "coins" },
  wisdom: { color: "cyan", iconKey: "flame" },
  communication: { color: "pink", iconKey: "message-square" },
};

export function getAttributeIconOption(icon?: string) {
  const iconKey = icon && isAttributeIconKey(icon) ? icon : "sparkles";

  return (
    attributeIconOptions.find((option) => option.key === iconKey) ??
    attributeIconOptions[0]
  );
}

export function getAttributeColorSchemeOption(color?: string) {
  const colorKey =
    color && isAttributeColorScheme(color) ? color : ("blue" as const);

  return (
    attributeColorSchemeOptions.find((option) => option.key === colorKey) ??
    attributeColorSchemeOptions[1]
  );
}

export function getAttributeVisual(
  attribute: AttributeKey | Pick<AttributeProgress, "colorScheme" | "icon" | "key">,
): AttributeVisual {
  const key = typeof attribute === "string" ? attribute : attribute.key;
  const coreVisual = isCoreAttributeKey(key) ? coreAttributeVisuals[key] : null;
  const iconKey =
    coreVisual?.iconKey ??
    (typeof attribute === "string" ? undefined : attribute.icon) ??
    "sparkles";
  const color =
    coreVisual?.color ??
    (typeof attribute === "string" ? undefined : attribute.colorScheme) ??
    "blue";
  const iconOption = getAttributeIconOption(iconKey);
  const colorOption = getAttributeColorSchemeOption(color);

  return {
    color: colorOption.key,
    icon: iconOption.icon,
    iconKey: iconOption.key,
  };
}
