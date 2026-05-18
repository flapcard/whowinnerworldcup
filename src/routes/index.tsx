import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Wallet, Swords, Coins, Trophy, Zap, Users, Sparkles, ShieldCheck,
  Twitter, Send, MessageCircle, Copy, ChevronRight, Volume2, VolumeX,
  CircleDot, Flame, Crown, Star, Gamepad2, Store, ArrowUpRight, Check,
  X, AlertTriangle, Info, LogOut, Network,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import { Logo } from "@/components/site/Logo";
import { Stadium } from "@/components/site/Stadium";
import { PlayerCard, type PlayerCardData } from "@/components/site/PlayerCard";
import { MintModalRoot } from "@/components/site/MintModal";
import { WalletStatusBanner } from "@/components/site/WalletStatusBanner";
import { useMetaMask, onToast, pushToast, type Toast } from "@/hooks/useMetaMask";
import card1 from "@/assets/card-1.jpg";
import card2 from "@/assets/card-2.jpg";
import card3 from "@/assets/card-3.jpg";
import card4 from "@/assets/card-4.jpg";
import card5 from "@/assets/card-5.jpg";
import trophyImg from "@/assets/trophy.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Who Winner World Cup? — Football NFT Battles on BSC" },
      { name: "description", content: "Collect legendary football NFTs, battle players, win $CUP. A Web3 football card battle game on Binance Smart Chain." },
    ],
  }),
  component: Index,
});

const players: PlayerCardData[] = [
  { name: "L. MESSI",   country: "Argentina", image: card1, rarity: "Legendary", attack: 96, defense: 41, speed: 87, skill: 99 },
  { name: "C. RONALDO", country: "Portugal",  image: card2, rarity: "Mythic",    attack: 94, defense: 38, speed: 82, skill: 95 },
  { name: "NEYMAR JR",  country: "Brazil",    image: card3, rarity: "Epic",      attack: 89, defense: 36, speed: 91, skill: 96 },
  { name: "K. MBAPPÉ",  country: "France",    image: card4, rarity: "Legendary", attack: 92, defense: 39, speed: 97, skill: 90 },
  { name: "E. HAALAND", country: "Norway",    image: card5, rarity: "Mythic",    attack: 95, defense: 45, speed: 89, skill: 88 },
];

function Index() {
  return (
    <div id="top" className="relative min-h-screen text-foreground overflow-x-clip">
      <Header />
      <Hero />
      <LiveTicker />
      <Gameplay />
      <CardShowcase />
      <Features />
      <Tokenomics />
      <RaritySystem />
      <Marketplace />
      <Leaderboard />
      <Roadmap />
      <FAQ />
      <CTA />
      <Footer />
      <WalletModalRoot />
      <MintModalRoot />
      <ToastStack />
      <BSCNetworkBanner />
    </div>
  );
}

/* ----------------------------- HEADER ----------------------------- */

function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#gameplay", label: "Gameplay" },
    { href: "#cards", label: "Cards" },
    { href: "#token", label: "Token" },
    { href: "#roadmap", label: "Roadmap" },
    { href: "#faq", label: "FAQ" },
  ];
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-3">
        <div className="glass-strong rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm">
            {links.map(l => (
              <a key={l.href} href={l.href} className="text-muted-foreground hover:text-neon-yellow transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <SoundToggle />
            <div className="hidden sm:block"><WalletButton /></div>
            <button onClick={() => setOpen(o => !o)} className="md:hidden text-foreground p-2" aria-label="menu">
              <div className="space-y-1.5">
                <div className="h-0.5 w-5 bg-foreground" />
                <div className="h-0.5 w-5 bg-foreground" />
                <div className="h-0.5 w-5 bg-foreground" />
              </div>
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden glass-strong rounded-2xl mt-2 p-4 space-y-2 animate-fade-up">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-neon-yellow">{l.label}</a>
            ))}
            <button
              onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("open-wallet")); }}
              className="w-full mt-2 rounded-xl bg-neon-yellow text-emerald-darker px-4 py-2 text-sm font-display"
            >
              CONNECT METAMASK
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function SoundToggle() {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn(s => !s)}
      className="hidden sm:grid place-items-center h-10 w-10 rounded-xl glass text-neon-green hover:text-neon-yellow transition"
      aria-label="Toggle sound"
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}

/* ------------------------------- HERO ------------------------------ */

function useCounter(target: number, duration = 1800) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

function Stat({ icon: Icon, label, value, suffix = "" }: { icon: typeof Trophy; label: string; value: number; suffix?: string }) {
  const n = useCounter(value);
  return (
    <div className="glass rounded-xl p-4 text-left">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-neon-yellow" />
      </div>
      <div className="mt-2 font-display text-2xl sm:text-3xl text-foreground text-glow-yellow">
        {n.toLocaleString()}{suffix}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pt-36 sm:pt-44 pb-20">
      <Stadium />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs text-neon-green">
            <CircleDot className="h-3 w-3 animate-pulse" />
            LIVE ON BNB SMART CHAIN · SEASON 01
          </div>
          <h1 className="mt-5 font-display font-black text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight">
            <span className="block text-foreground">WHO WINNER</span>
            <span className="block text-gradient-cup">WORLD CUP?</span>
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground">
            Collect <span className="text-neon-yellow">legendary football NFTs</span>, battle other players in PvP arenas,
            and win <span className="text-neon-green">$CUP</span>. The first AAA Web3 football card battler on Binance Smart Chain.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#gameplay" className="group inline-flex items-center gap-2 rounded-xl bg-neon-yellow text-emerald-darker px-5 py-3 font-display tracking-wide glow-yellow hover:brightness-110 transition">
              <Gamepad2 className="h-5 w-5" /> PLAY NOW
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </a>
            <a href="#cards" className="inline-flex items-center gap-2 rounded-xl bg-neon-green/15 border border-neon-green/40 text-neon-green px-5 py-3 font-display tracking-wide hover:bg-neon-green/25 transition">
              <Sparkles className="h-5 w-5" /> MINT NFT
            </a>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-wallet"))}
              className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-display tracking-wide text-foreground hover:border-neon-yellow/40 transition"
            >
              <Wallet className="h-5 w-5" /> CONNECT METAMASK
            </button>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat icon={Swords} label="Total Battles"     value={284913} />
            <Stat icon={Users}  label="Active Players"    value={48207} />
            <Stat icon={Coins}  label="Prize Pool ($CUP)" value={12500000} />
            <Stat icon={Trophy} label="NFTs Minted"       value={36421} />
          </div>
        </div>
        <FloatingCards />
      </div>
    </section>
  );
}

function FloatingCards() {
  return (
    <div className="relative h-[520px] sm:h-[600px] hidden lg:block">
      {/* Trophy glow */}
      <img
        src={trophyImg}
        alt=""
        aria-hidden
        className="absolute -top-6 right-4 w-40 opacity-90 animate-float-slow drop-shadow-[0_0_40px_oklch(0.92_0.21_110/0.6)]"
      />
      <div className="absolute left-0 top-10 w-56 rotate-[-8deg] animate-float">
        <PlayerCard data={players[0]} />
      </div>
      <div className="absolute right-2 top-32 w-60 rotate-[6deg] animate-float-slow z-10">
        <PlayerCard data={players[1]} />
      </div>
      <div className="absolute left-16 bottom-0 w-56 rotate-[3deg] animate-float" style={{ animationDelay: "-2s" }}>
        <PlayerCard data={players[2]} />
      </div>
    </div>
  );
}

/* --------------------------- LIVE TICKER --------------------------- */

function LiveTicker() {
  const items = [
    "⚡ Player 0x9a3..f21 WON 4,800 $CUP",
    "🔥 Legendary MBAPPÉ minted by 0x12c..89e",
    "🏆 Tournament 'Group D' starts in 02:14:33",
    "⚔ MESSI vs RONALDO — bet 12,000 $CUP",
    "💎 Mythic HAALAND dropped — view on BscScan",
    "🌍 Season 01 prize pool exceeded 12M $CUP",
  ];
  const row = [...items, ...items];
  return (
    <div className="relative border-y border-neon-green/15 bg-emerald-darker/60 backdrop-blur">
      <div className="overflow-hidden">
        <div className="flex gap-10 py-3 animate-ticker whitespace-nowrap text-sm">
          {row.map((t, i) => (
            <span key={i} className="text-muted-foreground">
              <span className="text-neon-yellow mr-2">●</span>{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- GAMEPLAY ----------------------------- */

const steps = [
  { icon: Wallet,       title: "Connect MetaMask",      desc: "Sign in with MetaMask on desktop or mobile." },
  { icon: Network,      title: "Switch to BSC",         desc: "Auto-detect & switch to BNB Smart Chain (BEP-20)." },
  { icon: Sparkles,     title: "Mint Football NFTs",    desc: "Mint legendary player cards directly on-chain." },
  { icon: ShieldCheck,  title: "Build Your Team",       desc: "Combine attack, defense, speed & skill to dominate." },
  { icon: Coins,        title: "Bet 1,000 $CUP+",       desc: "Stake $CUP to enter ranked arena battles." },
  { icon: Swords,       title: "Battle Players",        desc: "Real-time PvP matchmaking — best card wins." },
  { icon: Trophy,       title: "Winner Takes Pool",     desc: "Auto-paid reward pool, on-chain & transparent." },
];

function Gameplay() {
  return (
    <section id="gameplay" className="relative py-24 sm:py-32">
      <SectionHead
        eyebrow="HOW IT WORKS"
        title={<>FROM <span className="text-gradient-cup">MINT</span> TO <span className="text-gradient-cup">VICTORY</span></>}
        sub="Seven steps to enter the arena. No tutorials. No mercy."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {steps.map((s, i) => (
          <div key={s.title} className="group relative glass rounded-2xl p-6 overflow-hidden hover:border-neon-yellow/40 transition">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-neon-yellow/10 blur-2xl group-hover:bg-neon-yellow/25 transition" />
            <div className="flex items-start justify-between">
              <div className="font-display text-xs tracking-[0.3em] text-neon-green">0{i + 1}</div>
              <s.icon className="h-6 w-6 text-neon-yellow" />
            </div>
            <h3 className="mt-4 font-display text-xl text-foreground">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- CARD SHOWCASE -------------------------- */

function CardShowcase() {
  return (
    <section id="cards" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 grid-pitch opacity-40 pointer-events-none" />
      <SectionHead
        eyebrow="LEGENDARY ROSTER"
        title={<>OWN THE <span className="text-gradient-cup">GREATEST</span> CARDS</>}
        sub="Each NFT holds Attack, Defense, Speed, Skill, Rarity & Power Score — minted on BNB Smart Chain, tradable forever."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-10">
        <WalletStatusBanner mintPriceBNB={0.05} />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {players.map(p => (
          <div key={p.name} className="group/card flex flex-col gap-3">
            <PlayerCard data={p} />
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-mint", { detail: { player: p, priceBNB: "0.05" } }))}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-display tracking-[0.2em] bg-gradient-to-r from-neon-yellow to-neon-green text-emerald-darker opacity-90 hover:opacity-100 transition shadow-[0_0_25px_-10px_oklch(0.92_0.21_110/0.7)]"
            >
              <Sparkles className="h-3 w-3" /> MINT · 0.05 BNB
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- FEATURES ---------------------------- */

const features = [
  { icon: Swords,     title: "PvP Card Battles",        desc: "Head-to-head real-money matches." },
  { icon: Zap,        title: "Real-time Matchmaking",   desc: "Skill-based ELO pairing in seconds." },
  { icon: Store,      title: "NFT Marketplace",         desc: "Buy, sell and trade player cards." },
  { icon: Crown,      title: "Seasonal Leaderboards",   desc: "Climb tiers, earn glory & loot." },
  { icon: Flame,      title: "Daily Tournaments",       desc: "New brackets every 24 hours." },
  { icon: Trophy,     title: "Ranked Arena",            desc: "Bronze to Mythic — prove your team." },
  { icon: Users,      title: "Clan / Team System",      desc: "Form squads, share rewards." },
  { icon: Sparkles,   title: "Legendary Drops",         desc: "Rare mythic cards in limited mints." },
  { icon: Coins,      title: "Staking Rewards",         desc: "Stake $CUP, earn passively." },
  { icon: ShieldCheck,title: "Win-to-Earn",             desc: "Earn from every victory, forever." },
];

function Features() {
  return (
    <section className="relative py-24 sm:py-32">
      <SectionHead
        eyebrow="GAME FEATURES"
        title={<>BUILT FOR <span className="text-gradient-cup">CHAMPIONS</span></>}
        sub="A full competitive ecosystem — arena, marketplace, tournaments, staking."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {features.map(f => (
          <div key={f.title} className="glass rounded-xl p-5 hover:-translate-y-1 hover:border-neon-green/40 transition">
            <f.icon className="h-5 w-5 text-neon-green" />
            <h4 className="mt-3 font-display text-sm tracking-wide text-foreground">{f.title}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------- TOKENOMICS --------------------------- */

const tokenData = [
  { name: "Play-to-Earn Rewards", value: 35, color: "oklch(0.92 0.21 110)" },
  { name: "Liquidity Pool",       value: 20, color: "oklch(0.78 0.24 145)" },
  { name: "Marketing",            value: 15, color: "oklch(0.85 0.20 130)" },
  { name: "Staking Rewards",      value: 10, color: "oklch(0.65 0.22 160)" },
  { name: "Team",                 value: 10, color: "oklch(0.55 0.15 170)" },
  { name: "Partnerships",         value: 5,  color: "oklch(0.7 0.18 90)"  },
  { name: "Airdrop",              value: 5,  color: "oklch(0.5 0.10 155)" },
];

function Tokenomics() {
  const [copied, setCopied] = useState(false);
  const contract = "0xCUP00000000000000000000000000000000CafE42";
  return (
    <section id="token" className="relative py-24 sm:py-32">
      <SectionHead
        eyebrow="$CUP TOKEN"
        title={<>THE FUEL OF THE <span className="text-gradient-cup">ARENA</span></>}
        sub="Bet, earn, stake, trade. The $CUP token powers every battle."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-14 grid lg:grid-cols-[1fr_1.1fr] gap-8">
        <div className="glass-strong rounded-2xl p-8">
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Token Name", "CUP Token"],
              ["Ticker", "$CUP"],
              ["Blockchain", "BNB Smart Chain"],
              ["Launch", "PancakeSwap"],
              ["Total Supply", "1,000,000,000"],
              ["Standard", "BEP-20"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-emerald-darker/60 p-4 border border-neon-green/10">
                <div className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">{k}</div>
                <div className="mt-1 font-display text-lg text-foreground">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-emerald-darker/70 border border-neon-yellow/20 p-4">
            <div className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase mb-2">Contract Address</div>
            <div className="flex items-center gap-2">
              <code className="text-xs sm:text-sm text-neon-yellow truncate">{contract}</code>
              <button
                onClick={() => { navigator.clipboard.writeText(contract); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="ml-auto inline-flex items-center gap-1 rounded-md bg-neon-yellow/15 text-neon-yellow px-2 py-1 text-xs hover:bg-neon-yellow/25"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-6 sm:p-8">
          <div className="grid sm:grid-cols-[1fr_1.1fr] gap-4 items-center">
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={tokenData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    stroke="oklch(0.18 0.05 155)"
                  >
                    {tokenData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.18 0.04 155 / 0.9)",
                      border: "1px solid oklch(0.78 0.24 145 / 0.4)",
                      borderRadius: 8,
                      color: "white",
                      fontSize: 12,
                    }}
                    formatter={(v: number, n: string) => [`${v}%`, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2">
              {tokenData.map(d => (
                <li key={d.name} className="flex items-center gap-3 text-sm">
                  <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
                  <span className="text-muted-foreground flex-1">{d.name}</span>
                  <span className="font-display text-foreground tabular-nums">{d.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- RARITY SYSTEM ------------------------- */

const rarities = [
  { name: "COMMON",    desc: "Reliable squad fillers", from: "from-white/30",       to: "to-white/5" },
  { name: "RARE",      desc: "Solid tournament picks", from: "from-sky-300/40",     to: "to-sky-300/5" },
  { name: "EPIC",      desc: "Powerful match-winners", from: "from-fuchsia-300/40", to: "to-fuchsia-300/5" },
  { name: "LEGENDARY", desc: "Top-tier global stars",  from: "from-neon-yellow/60", to: "to-neon-yellow/5" },
  { name: "MYTHIC",    desc: "1-of-1 immortal cards",  from: "from-neon-green/70",  to: "to-neon-green/5" },
];

function RaritySystem() {
  return (
    <section className="relative py-24 sm:py-32">
      <SectionHead
        eyebrow="NFT RARITY"
        title={<>FIVE TIERS OF <span className="text-gradient-cup">GLORY</span></>}
        sub="From common bench warmers to mythic 1-of-1 legends. Every drop matters."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-14 grid grid-cols-2 md:grid-cols-5 gap-4">
        {rarities.map((r, i) => (
          <div key={r.name} className={`group relative clip-card p-[1.5px] bg-gradient-to-b ${r.from} ${r.to}`}>
            <div className="clip-card bg-emerald-darker/90 p-6 h-full">
              <div className="font-display text-[10px] tracking-[0.4em] text-muted-foreground">TIER 0{i + 1}</div>
              <div className="mt-3 font-display text-2xl text-foreground">{r.name}</div>
              <div className="mt-2 text-xs text-muted-foreground">{r.desc}</div>
              <div className="mt-6 flex items-center gap-1">
                {Array.from({ length: i + 1 }).map((_, k) => (
                  <Star key={k} className="h-3.5 w-3.5 text-neon-yellow fill-neon-yellow" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- MARKETPLACE --------------------------- */

function Marketplace() {
  const listings = [
    { name: "MESSI #016",   img: card1, price: "12,500 $CUP", trend: "+8.2%" },
    { name: "RONALDO #007", img: card2, price: "11,200 $CUP", trend: "+5.1%" },
    { name: "NEYMAR #010",  img: card3, price: "9,400 $CUP",  trend: "+2.7%" },
    { name: "MBAPPÉ #009",  img: card4, price: "10,800 $CUP", trend: "+11.4%" },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <SectionHead
        eyebrow="MARKETPLACE"
        title={<>TRADE THE <span className="text-gradient-cup">FLOOR</span></>}
        sub="Buy, sell, upgrade and trade NFT players directly with the community."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {listings.map(l => (
          <div key={l.name} className="group glass rounded-2xl overflow-hidden hover:border-neon-yellow/40 transition">
            <div className="aspect-[4/5] overflow-hidden relative">
              <img src={l.img} alt={l.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-3 left-3 clip-badge bg-neon-green/30 text-neon-green px-3 py-1 text-[10px] font-display tracking-widest">{l.trend}</div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="font-display text-sm text-foreground">{l.name}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Floor</div>
              </div>
              <div className="text-right">
                <div className="font-display text-neon-yellow">{l.price}</div>
                <button className="text-[10px] uppercase tracking-widest text-neon-green hover:text-neon-yellow inline-flex items-center gap-0.5">
                  Buy <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------- LEADERBOARD -------------------------- */

const leaders = [
  { rank: 1, name: "0xKAIZER",   wr: "92%", prize: "184,210 $CUP", nfts: 47 },
  { rank: 2, name: "GOAL_GOD",   wr: "88%", prize: "152,800 $CUP", nfts: 38 },
  { rank: 3, name: "ULTRAS",     wr: "85%", prize: "129,600 $CUP", nfts: 41 },
  { rank: 4, name: "BSC_NINJA",  wr: "83%", prize: "118,400 $CUP", nfts: 29 },
  { rank: 5, name: "TIKI_TAKA",  wr: "81%", prize: "104,900 $CUP", nfts: 35 },
  { rank: 6, name: "SOL_STRIKER",wr: "79%", prize: "94,300 $CUP",  nfts: 26 },
];

function Leaderboard() {
  return (
    <section className="relative py-24 sm:py-32">
      <SectionHead
        eyebrow="ARENA RANKINGS"
        title={<>SEASON 01 <span className="text-gradient-cup">LEADERBOARD</span></>}
        sub="Top players, highest win rates, biggest prize winners."
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 mt-14">
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[60px_1fr_90px_1fr_90px] sm:grid-cols-[80px_1fr_120px_1fr_120px] px-5 py-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b border-neon-green/15">
            <div>Rank</div><div>Player</div><div>Win %</div><div>Prize</div><div className="text-right">NFTs</div>
          </div>
          {leaders.map((p, i) => (
            <div key={p.name} className={`grid grid-cols-[60px_1fr_90px_1fr_90px] sm:grid-cols-[80px_1fr_120px_1fr_120px] px-5 py-4 items-center text-sm border-b border-neon-green/10 last:border-0 ${i === 0 ? "bg-neon-yellow/5" : ""}`}>
              <div className="font-display text-neon-yellow">#{p.rank}</div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neon-yellow to-neon-green grid place-items-center text-emerald-darker font-display text-xs">{p.name.slice(0, 2)}</div>
                <span className="text-foreground">{p.name}</span>
                {i === 0 && <Crown className="h-4 w-4 text-neon-yellow" />}
              </div>
              <div className="text-neon-green font-display">{p.wr}</div>
              <div className="text-foreground tabular-nums">{p.prize}</div>
              <div className="text-right text-muted-foreground tabular-nums">{p.nfts}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- ROADMAP ----------------------------- */

const roadmap = [
  { phase: "Phase 1", title: "Foundation",     items: ["Website Launch", "Community Building", "$CUP Token Launch on BSC"], status: "live" },
  { phase: "Phase 2", title: "Genesis Mint",   items: ["NFT Mint Launch", "PvP Battle Beta", "Marketplace Release"], status: "next" },
  { phase: "Phase 3", title: "Competitive",    items: ["Ranked Tournament System", "Mobile Version", "Staking Platform"], status: "soon" },
  { phase: "Phase 4", title: "Global Stage",   items: ["Global Championships", "Major Partnerships", "Esports Expansion"], status: "soon" },
];

function Roadmap() {
  return (
    <section id="roadmap" className="relative py-24 sm:py-32">
      <SectionHead
        eyebrow="ROADMAP"
        title={<>THE ROAD TO THE <span className="text-gradient-cup">FINAL</span></>}
        sub="Built in public. Shipped fast. Played hard."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {roadmap.map((r, i) => {
          const accent = r.status === "live" ? "border-neon-yellow/50 glow-yellow" : r.status === "next" ? "border-neon-green/40" : "border-white/10";
          const tag = r.status === "live" ? "LIVE" : r.status === "next" ? "IN PROGRESS" : "UPCOMING";
          const tagColor = r.status === "live" ? "bg-neon-yellow text-emerald-darker" : r.status === "next" ? "bg-neon-green/20 text-neon-green" : "bg-white/10 text-muted-foreground";
          return (
            <div key={r.phase} className={`glass rounded-2xl p-6 border ${accent}`}>
              <div className="flex items-center justify-between">
                <div className="font-display text-xs tracking-[0.3em] text-muted-foreground">{r.phase}</div>
                <div className={`text-[9px] font-display tracking-[0.2em] px-2 py-0.5 rounded ${tagColor}`}>{tag}</div>
              </div>
              <h3 className="mt-3 font-display text-2xl text-foreground">{r.title}</h3>
              <ul className="mt-5 space-y-2.5">
                {r.items.map(it => (
                  <li key={it} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className={`h-4 w-4 mt-0.5 ${r.status === "live" ? "text-neon-yellow" : "text-neon-green/70"}`} />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------- FAQ ------------------------------ */

const faqs = [
  { q: "What is Who Winner World Cup?",   a: "A Web3 football NFT battle game built on Binance Smart Chain — collect player cards, build a team, and bet $CUP in PvP matches." },
  { q: "How do I earn rewards?",          a: "Win PvP matches and tournaments using your NFT football cards. Winners take the entire prize pool, paid on-chain." },
  { q: "What is the minimum battle bet?", a: "Minimum 1,000 $CUP per match. Higher stakes unlock ranked arenas and premium tournaments." },
  { q: "Can I trade my NFTs?",            a: "Yes. Every card is a true BEP-20 NFT — buy, sell, upgrade and trade freely in the in-game marketplace." },
  { q: "Is wallet connection required?",  a: "Yes. You need MetaMask connected to BNB Smart Chain to play, mint and claim rewards." },
  { q: "Which blockchain is used?",       a: "Binance Smart Chain (BEP-20). The app auto-detects your network and offers to switch to BSC." },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <SectionHead
        eyebrow="Q & A"
        title={<>NEED <span className="text-gradient-cup">ANSWERS</span>?</>}
        sub="Everything you need to know before you step into the arena."
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 mt-12 space-y-3">
        {faqs.map((f, i) => {
          const active = open === i;
          return (
            <button
              key={f.q}
              onClick={() => setOpen(active ? -1 : i)}
              className={`w-full text-left glass rounded-xl p-5 transition ${active ? "border-neon-yellow/40" : ""}`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-display text-foreground">{f.q}</span>
                <ChevronRight className={`h-5 w-5 text-neon-yellow transition-transform ${active ? "rotate-90" : ""}`} />
              </div>
              <div className={`grid transition-all duration-300 ${active ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden text-sm text-muted-foreground">{f.a}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------- CTA ------------------------------ */

function Countdown() {
  const target = useMemo(() => Date.now() + 1000 * 60 * 60 * 26 + 1000 * 60 * 14, []);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const cell = (n: number, l: string) => (
    <div className="text-center">
      <div className="font-display text-4xl sm:text-5xl text-neon-yellow text-glow-yellow tabular-nums">{String(n).padStart(2, "0")}</div>
      <div className="text-[10px] tracking-[0.3em] text-muted-foreground mt-1">{l}</div>
    </div>
  );
  return (
    <div className="flex items-center justify-center gap-6 sm:gap-10">
      {cell(h, "HOURS")}<div className="text-neon-green text-3xl">:</div>
      {cell(m, "MIN")}  <div className="text-neon-green text-3xl">:</div>
      {cell(s, "SEC")}
    </div>
  );
}

function CTA() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative glass-strong rounded-3xl p-10 sm:p-16 overflow-hidden text-center">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-[120%] bg-neon-yellow/15 blur-3xl" />
          <div className="absolute inset-0 grid-pitch opacity-40 pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs text-neon-green">
              <Flame className="h-3 w-3" /> NEXT TOURNAMENT STARTS IN
            </div>
            <div className="mt-6"><Countdown /></div>
            <h2 className="mt-10 font-display font-black text-4xl sm:text-6xl text-foreground">
              READY TO <span className="text-gradient-cup">CLAIM THE CUP?</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Mint your first legendary card, connect MetaMask on BNB Smart Chain, and step into the arena.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-wallet"))}
                className="inline-flex items-center gap-2 rounded-xl bg-neon-yellow text-emerald-darker px-6 py-3 font-display tracking-wide glow-yellow hover:brightness-110 transition"
              >
                <Wallet className="h-5 w-5" /> CONNECT METAMASK
              </button>
              <a href="#cards" className="inline-flex items-center gap-2 rounded-xl bg-neon-green/15 border border-neon-green/40 text-neon-green px-6 py-3 font-display hover:bg-neon-green/25 transition">
                <Sparkles className="h-5 w-5" /> MINT NFT
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- FOOTER ---------------------------- */

function Footer() {
  return (
    <footer className="relative pt-16 pb-10 border-t border-neon-green/15">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              The first AAA Web3 football card battler on Binance Smart Chain. Collect. Battle. Win.
            </p>
            <div className="mt-5 flex gap-3">
              {[Twitter, Send, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 grid place-items-center rounded-xl glass text-neon-green hover:text-neon-yellow hover:border-neon-yellow/40 transition">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "GAME", links: ["Gameplay", "Marketplace", "Leaderboard", "Tournaments"] },
            { title: "TOKEN", links: ["Tokenomics", "Buy on PancakeSwap", "Staking", "Whitepaper"] },
            { title: "LEGAL", links: ["Terms", "Privacy", "Docs", "Contact"] },
          ].map(col => (
            <div key={col.title}>
              <div className="font-display text-xs tracking-[0.3em] text-neon-yellow">{col.title}</div>
              <ul className="mt-4 space-y-2 text-sm">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="text-muted-foreground hover:text-foreground">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-neon-green/10 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Who Winner World Cup. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="text-neon-green">●</span> BNB Smart Chain · Powered by PancakeSwap
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------ METAMASK + BSC LAYER ---------------------- */

function shortAddr(a: string) { return `${a.slice(0, 6)}...${a.slice(-4)}`; }

function WalletButton() {
  const { address, balance, isBSC, connect, disconnect, ensureBSC, connecting } = useMetaMask();
  const [openMenu, setOpenMenu] = useState(false);

  if (!address) {
    return (
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("open-wallet"))}
        disabled={connecting}
        className="inline-flex items-center gap-2 rounded-xl bg-neon-yellow text-emerald-darker px-4 py-2 text-sm font-display tracking-wide glow-yellow hover:brightness-110 transition disabled:opacity-60"
      >
        <Wallet className="h-4 w-4" /> {connecting ? "CONNECTING..." : "CONNECT METAMASK"}
      </button>
    );
  }
  return (
    <div className="relative">
      <button
        onClick={() => setOpenMenu(o => !o)}
        className="inline-flex items-center gap-2 rounded-xl glass border border-neon-yellow/40 px-3 py-2 text-sm font-display tracking-wide text-foreground hover:border-neon-yellow transition"
      >
        <span className={`h-2 w-2 rounded-full ${isBSC ? "bg-neon-green" : "bg-amber-400 animate-pulse"}`} />
        <span className="tabular-nums">{balance} BNB</span>
        <span className="text-neon-yellow">{shortAddr(address)}</span>
      </button>
      {openMenu && (
        <div className="absolute right-0 mt-2 w-72 glass-strong rounded-2xl p-4 z-50 animate-fade-up" onMouseLeave={() => setOpenMenu(false)}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Wallet</span>
            <span className={`text-[10px] font-display ${isBSC ? "text-neon-green" : "text-amber-400"}`}>
              {isBSC ? "● BNB SMART CHAIN" : "● WRONG NETWORK"}
            </span>
          </div>
          <div className="mt-2 font-display text-sm text-foreground break-all">{address}</div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-emerald-darker/60 p-3 border border-neon-green/15">
              <div className="text-[9px] tracking-[0.25em] text-muted-foreground uppercase">Balance</div>
              <div className="font-display text-neon-yellow">{balance} BNB</div>
            </div>
            <div className="rounded-lg bg-emerald-darker/60 p-3 border border-neon-green/15">
              <div className="text-[9px] tracking-[0.25em] text-muted-foreground uppercase">NFTs</div>
              <div className="font-display text-neon-green">0 cards</div>
            </div>
          </div>
          {!isBSC && (
            <button onClick={ensureBSC} className="mt-3 w-full rounded-lg bg-neon-yellow text-emerald-darker px-3 py-2 text-xs font-display tracking-wide">
              SWITCH TO BSC
            </button>
          )}
          <button onClick={disconnect} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="h-3 w-3" /> Disconnect
          </button>
          <div className="mt-3 text-[10px] text-muted-foreground text-center">
            <a href={`https://bscscan.com/address/${address}`} target="_blank" rel="noreferrer" className="hover:text-neon-yellow">View on BscScan ↗</a>
          </div>
        </div>
      )}
    </div>
  );
}

function WalletModalRoot() {
  const [open, setOpen] = useState(false);
  const { connect, connecting, isInstalled, address } = useMetaMask();

  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener("open-wallet", h as EventListener);
    return () => window.removeEventListener("open-wallet", h as EventListener);
  }, []);
  useEffect(() => { if (address) setOpen(false); }, [address]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-emerald-darker/80 backdrop-blur-md animate-fade-up" onClick={() => setOpen(false)}>
      <div className="w-full max-w-md glass-strong rounded-2xl p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon-yellow to-neon-green grid place-items-center text-emerald-darker font-display">M</div>
          <div>
            <h3 className="font-display text-xl text-foreground">Connect MetaMask</h3>
            <p className="text-[11px] text-muted-foreground">Binance Smart Chain · BEP-20</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-emerald-darker/70 border border-neon-green/15 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Network className="h-4 w-4 text-neon-green" />
            We&apos;ll auto-switch your wallet to <span className="text-neon-green font-display ml-1">BNB Smart Chain</span>
          </div>
        </div>

        <button
          onClick={connect}
          disabled={connecting}
          className="mt-5 w-full inline-flex items-center justify-between rounded-xl p-4 bg-gradient-to-r from-neon-yellow/30 to-neon-green/20 border border-neon-yellow/40 hover:border-neon-yellow transition group disabled:opacity-60"
        >
          <span className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-lg bg-emerald-darker grid place-items-center font-display text-neon-yellow">M</span>
            <span className="text-left">
              <span className="block font-display tracking-wide text-foreground">MetaMask</span>
              <span className="block text-[11px] text-muted-foreground">{isInstalled ? "Detected · ready to connect" : "Not installed — opens metamask.io"}</span>
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-neon-yellow group-hover:translate-x-0.5 transition" />
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2 opacity-70">
          {[
            { n: "Trust Wallet", c: "from-sky-500/20 to-sky-300/5" },
            { n: "WalletConnect", c: "from-fuchsia-500/20 to-fuchsia-300/5" },
          ].map(w => (
            <button key={w.n} onClick={() => pushToast({ kind: "info", title: `${w.n} coming soon` })} className={`flex items-center gap-2 rounded-xl p-3 bg-gradient-to-r ${w.c} border border-white/10 text-xs`}>
              <span className="h-6 w-6 rounded bg-emerald-darker grid place-items-center font-display text-[10px] text-neon-green">{w.n[0]}</span>
              <span className="text-muted-foreground">{w.n}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 text-[11px] text-muted-foreground text-center">
          By connecting you agree to the Terms & Privacy Policy.
        </div>
      </div>
    </div>
  );
}

function BSCNetworkBanner() {
  const { address, isBSC, ensureBSC } = useMetaMask();
  if (!address || isBSC) return null;
  return (
    <div className="fixed top-[88px] inset-x-0 z-40 px-4">
      <div className="mx-auto max-w-2xl glass-strong rounded-xl px-4 py-2.5 flex items-center gap-3 border border-amber-400/40 animate-fade-up">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
        <div className="text-xs text-foreground flex-1">
          Wrong network detected. Switch to <span className="text-neon-yellow font-display">BNB Smart Chain</span> to play.
        </div>
        <button onClick={ensureBSC} className="rounded-lg bg-neon-yellow text-emerald-darker px-3 py-1.5 text-[11px] font-display tracking-wide">
          SWITCH
        </button>
      </div>
    </div>
  );
}

function ToastStack() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => onToast(t => {
    setItems(prev => [...prev, t]);
    setTimeout(() => setItems(prev => prev.filter(x => x.id !== t.id)), 4200);
  }), []);
  return (
    <div className="fixed bottom-4 right-4 z-[110] space-y-2 w-[min(360px,calc(100vw-2rem))]">
      {items.map(t => {
        const tone = t.kind === "ok" ? "border-neon-green/50" : t.kind === "err" ? "border-red-400/50" : "border-neon-yellow/50";
        const Icon = t.kind === "ok" ? Check : t.kind === "err" ? AlertTriangle : Info;
        const color = t.kind === "ok" ? "text-neon-green" : t.kind === "err" ? "text-red-400" : "text-neon-yellow";
        return (
          <div key={t.id} className={`glass-strong rounded-xl p-3 flex items-start gap-3 border ${tone} animate-fade-up`}>
            <Icon className={`h-4 w-4 mt-0.5 ${color}`} />
            <div className="flex-1 min-w-0">
              <div className="font-display text-sm text-foreground">{t.title}</div>
              {t.desc && <div className="text-[11px] text-muted-foreground truncate">{t.desc}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}


/* ----------------------------- PRIMITIVES -------------------------- */

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 text-center">
      <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-[10px] tracking-[0.3em] text-neon-green">
        {eyebrow}
      </div>
      <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1] text-foreground">
        {title}
      </h2>
      <p className="mt-4 text-muted-foreground">{sub}</p>
    </div>
  );
}
