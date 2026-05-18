import { useEffect, useState } from "react";
import { X, Loader2, Sparkles, ExternalLink, Copy, Check, Zap } from "lucide-react";
import { PlayerCard, type PlayerCardData } from "./PlayerCard";
import { useMint } from "@/hooks/useMint";
import { useMetaMask } from "@/hooks/useMetaMask";

type OpenDetail = { player: PlayerCardData; priceBNB?: string };

export function MintModalRoot() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<OpenDetail | null>(null);
  const { address, isBSC, ensureBSC } = useMetaMask();
  const { status, result, error, mint, reset } = useMint();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const h = (e: Event) => {
      setDetail((e as CustomEvent<OpenDetail>).detail);
      reset();
      setOpen(true);
    };
    window.addEventListener("open-mint", h as EventListener);
    return () => window.removeEventListener("open-mint", h as EventListener);
  }, [reset]);

  if (!open || !detail) return null;
  const { player, priceBNB = "0.05" } = detail;

  const close = () => { setOpen(false); setTimeout(reset, 200); };
  const onMint = () => {
    if (!address) { window.dispatchEvent(new Event("open-wallet")); return; }
    if (!isBSC) { ensureBSC(); return; }
    mint({ playerName: player.name, priceBNB });
  };
  const copyHash = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.txHash);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const busy = status === "confirming" || status === "pending";

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center p-4 bg-emerald-darker/85 backdrop-blur-md animate-fade-up"
      onClick={close}
    >
      <div
        className="relative w-full max-w-4xl glass-strong rounded-2xl p-6 sm:p-8 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={close} className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        {status === "success" && <Confetti />}

        <div className="grid md:grid-cols-[280px_1fr] gap-8 items-center">
          {/* Card preview */}
          <div className={status === "success" ? "animate-mint-pop" : ""}>
            <PlayerCard data={player} />
          </div>

          {/* Right side */}
          <div className="min-w-0">
            {status === "idle" && (
              <>
                <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-[10px] tracking-[0.3em] text-neon-green">
                  MINT ON BSC
                </div>
                <h3 className="mt-4 font-display text-3xl sm:text-4xl text-foreground">
                  Mint <span className="text-gradient-cup">{player.name}</span>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Mint this legendary card as a BEP-721 NFT directly to your wallet. Tradable forever on the BSC ecosystem.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Info label="Rarity" value={player.rarity} />
                  <Info label="Network" value="BNB Smart Chain" />
                  <Info label="Standard" value="BEP-721" />
                  <Info label="Supply" value="1 / 1000" />
                </div>
                <div className="mt-5 flex items-end justify-between rounded-xl bg-emerald-darker/70 border border-neon-green/15 px-4 py-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Mint price</div>
                    <div className="font-display text-2xl text-neon-yellow text-glow-yellow">{priceBNB} BNB</div>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">+ gas</div>
                </div>
                <button
                  onClick={onMint}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 bg-gradient-to-r from-neon-yellow to-neon-green text-emerald-darker font-display tracking-wider hover:opacity-95 transition shadow-[0_0_40px_-10px_oklch(0.92_0.21_110/0.8)]"
                >
                  <Zap className="h-4 w-4" />
                  {!address ? "CONNECT WALLET" : !isBSC ? "SWITCH TO BSC" : `MINT FOR ${priceBNB} BNB`}
                </button>
                <p className="mt-2 text-[10px] text-muted-foreground text-center">
                  By minting you agree to the Terms & Privacy Policy.
                </p>
              </>
            )}

            {busy && (
              <div className="py-6">
                <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-[10px] tracking-[0.3em] text-neon-yellow">
                  {status === "confirming" ? "AWAITING SIGNATURE" : "BROADCASTING"}
                </div>
                <h3 className="mt-4 font-display text-3xl text-foreground">Minting your NFT…</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {status === "confirming"
                    ? "Confirm the transaction inside the MetaMask popup."
                    : "Transaction submitted. Waiting for BSC confirmation…"}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-neon-green" />
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-neon-yellow to-neon-green animate-pulse" />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-widest">
                  <Step active label="Signed" done={status === "pending"} />
                  <Step active={status === "pending"} label="Broadcast" />
                  <Step label="Confirmed" />
                </div>
              </div>
            )}

            {status === "success" && result && (
              <div className="py-2">
                <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-[10px] tracking-[0.3em] text-neon-green">
                  <Sparkles className="h-3 w-3" /> MINT SUCCESS
                </div>
                <h3 className="mt-4 font-display text-3xl sm:text-4xl text-foreground">
                  <span className="text-gradient-cup">{player.name}</span> is yours
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your NFT has been minted to your BSC wallet and is ready for battle.
                </p>
                <div className="mt-5 rounded-xl bg-emerald-darker/70 border border-neon-green/30 p-4">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Token ID</div>
                  <div className="font-display text-4xl text-neon-yellow text-glow-yellow animate-token-glow">
                    {result.tokenId}
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-emerald-darker/70 border border-white/10 p-3 flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Transaction</div>
                    <div className="font-mono text-xs text-foreground truncate">{result.txHash}</div>
                  </div>
                  <button onClick={copyHash} className="rounded-md p-2 bg-white/5 hover:bg-white/10 text-muted-foreground" aria-label="Copy hash">
                    {copied ? <Check className="h-3.5 w-3.5 text-neon-green" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <a
                    href={result.blockExplorer}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-white/5 border border-white/10 hover:border-neon-green/40 text-xs font-display tracking-wide"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> VIEW ON BSCSCAN
                  </a>
                  <button
                    onClick={close}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-gradient-to-r from-neon-yellow to-neon-green text-emerald-darker text-xs font-display tracking-wide"
                  >
                    ENTER ARENA
                  </button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="py-6">
                <h3 className="font-display text-2xl text-red-400">Mint failed</h3>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={() => { reset(); }}
                  className="mt-5 w-full rounded-xl px-5 py-3 bg-gradient-to-r from-neon-yellow to-neon-green text-emerald-darker font-display tracking-wider"
                >
                  TRY AGAIN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-emerald-darker/60 border border-white/10 px-3 py-2">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-sm text-foreground">{value}</div>
    </div>
  );
}

function Step({ label, active, done }: { label: string; active?: boolean; done?: boolean }) {
  const tone = done ? "bg-neon-green text-emerald-darker" : active ? "bg-neon-yellow/30 text-neon-yellow border border-neon-yellow/50" : "bg-white/5 text-muted-foreground border border-white/10";
  return (
    <div className={`rounded-md px-2 py-1.5 text-center ${tone}`}>{label}</div>
  );
}

function Confetti() {
  const bits = Array.from({ length: 28 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const dur = 1.6 + Math.random() * 1.4;
        const color = i % 2 ? "bg-neon-yellow" : "bg-neon-green";
        return (
          <span
            key={i}
            className={`absolute top-[-10px] h-2 w-2 ${color} rounded-sm animate-confetti`}
            style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${dur}s` }}
          />
        );
      })}
    </div>
  );
}
