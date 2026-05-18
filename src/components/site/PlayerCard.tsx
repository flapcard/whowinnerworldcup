import { cn } from "@/lib/utils";

export type Rarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

export interface PlayerCardData {
  name: string;
  country: string;
  image: string;
  rarity: Rarity;
  attack: number;
  defense: number;
  speed: number;
  skill: number;
}

const rarityStyles: Record<Rarity, { ring: string; chip: string; glow: string; label: string }> = {
  Common:    { ring: "ring-white/20",                chip: "bg-white/10 text-white",                                   glow: "",                                    label: "COMMON" },
  Rare:      { ring: "ring-sky-300/40",              chip: "bg-sky-300/15 text-sky-200",                               glow: "shadow-[0_0_40px_-10px_oklch(0.78_0.15_220/0.7)]", label: "RARE" },
  Epic:      { ring: "ring-fuchsia-300/40",          chip: "bg-fuchsia-300/15 text-fuchsia-200",                       glow: "shadow-[0_0_50px_-10px_oklch(0.7_0.25_320/0.8)]",  label: "EPIC" },
  Legendary: { ring: "ring-neon-yellow/60",          chip: "bg-neon-yellow/20 text-neon-yellow",                       glow: "glow-yellow",                         label: "LEGENDARY" },
  Mythic:    { ring: "ring-neon-green/70",           chip: "bg-neon-green/20 text-neon-green",                         glow: "glow-green",                          label: "MYTHIC" },
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wider">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5 flex-1 mx-2">
        <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-yellow to-neon-green"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="font-display text-foreground tabular-nums w-7 text-right">{value}</span>
      </div>
    </div>
  );
}

export function PlayerCard({ data, className }: { data: PlayerCardData; className?: string }) {
  const r = rarityStyles[data.rarity];
  const power = Math.round((data.attack + data.defense + data.speed + data.skill) / 4);

  return (
    <div
      className={cn(
        "group relative w-full clip-card bg-gradient-to-b from-emerald-deep to-emerald-darker p-[1.5px] transition-transform duration-500 hover:-translate-y-2",
        className,
      )}
    >
      <div className={cn("absolute inset-0 clip-card bg-gradient-to-b from-neon-yellow/60 via-neon-green/40 to-transparent opacity-70")} />
      <div className={cn("relative clip-card bg-emerald-darker/95 overflow-hidden", r.glow)}>
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={data.image}
            alt={`${data.name} NFT card`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-darker via-emerald-darker/40 to-transparent" />
          {/* Scan line */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-neon-yellow/15 to-transparent animate-scan" />
          </div>
          {/* Top row */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className={cn("clip-badge px-3 py-1 text-[10px] font-display tracking-[0.2em]", r.chip)}>
              {r.label}
            </div>
            <div className="text-right">
              <div className="font-display text-3xl text-neon-yellow text-glow-yellow leading-none">{power}</div>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">PWR</div>
            </div>
          </div>
          {/* Name */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="font-display text-xl text-foreground">{data.name}</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-neon-green">{data.country}</div>
          </div>
        </div>
        {/* Stats */}
        <div className="p-4 space-y-2 border-t border-neon-green/15">
          <Stat label="ATK" value={data.attack} />
          <Stat label="DEF" value={data.defense} />
          <Stat label="SPD" value={data.speed} />
          <Stat label="SKL" value={data.skill} />
        </div>
      </div>
    </div>
  );
}
