import logoUrl from "@/assets/logo.png";

export function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5 group">
      <img
        src={logoUrl}
        alt="Who Winner World Cup logo"
        className="h-10 w-10 object-contain transition-transform group-hover:scale-105 drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]"
      />
      <div className="leading-tight">
        <div className="font-display text-sm tracking-[0.2em] text-foreground">WHO WINNER</div>
        <div className="font-display text-[10px] tracking-[0.4em] text-neon-green">WORLD CUP</div>
      </div>
    </a>
  );
}
