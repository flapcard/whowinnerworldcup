export function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5 group">
      <div className="relative h-9 w-9 grid place-items-center">
        <div className="absolute inset-0 rounded-md bg-gradient-to-br from-neon-yellow to-neon-green opacity-90 rotate-45 group-hover:rotate-[60deg] transition-transform" />
        <div className="relative font-display text-emerald-darker font-black text-sm">WW</div>
      </div>
      <div className="leading-tight">
        <div className="font-display text-sm tracking-[0.2em] text-foreground">WHO WINNER</div>
        <div className="font-display text-[10px] tracking-[0.4em] text-neon-green">WORLD CUP</div>
      </div>
    </a>
  );
}
