import { CheckCircle2, AlertTriangle, Wallet, Network, Coins } from "lucide-react";
import { useMetaMask } from "@/hooks/useMetaMask";

const MIN_BNB_FOR_MINT = 0.05;

export function WalletStatusBanner({ mintPriceBNB = MIN_BNB_FOR_MINT }: { mintPriceBNB?: number }) {
  const { address, isBSC, balance, chainId, connect, ensureBSC, connecting } = useMetaMask();

  const balNum = parseFloat(balance || "0");
  const hasFunds = balNum >= mintPriceBNB;
  const canMint = !!address && isBSC && hasFunds;

  const networkLabel = !chainId
    ? "Not detected"
    : isBSC
    ? "BNB Smart Chain"
    : `Wrong network (${parseInt(chainId, 16)})`;

  const statusTone = canMint
    ? "border-neon-green/40 bg-neon-green/5"
    : address
    ? "border-neon-yellow/40 bg-neon-yellow/5"
    : "border-white/10 bg-emerald-darker/60";

  return (
    <div className={`glass rounded-2xl border ${statusTone} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <Pill
            icon={<Wallet className="h-3.5 w-3.5" />}
            label="Wallet"
            value={address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Not connected"}
            ok={!!address}
          />
          <Pill
            icon={<Network className="h-3.5 w-3.5" />}
            label="Network"
            value={networkLabel}
            ok={isBSC}
          />
          <Pill
            icon={<Coins className="h-3.5 w-3.5" />}
            label="Balance"
            value={address ? `${balance} BNB` : "—"}
            ok={hasFunds}
          />
        </div>

        <div className="flex items-center gap-3">
          {canMint ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-display tracking-wider text-neon-green">
              <CheckCircle2 className="h-4 w-4" /> MINT ENABLED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-display tracking-wider text-neon-yellow">
              <AlertTriangle className="h-4 w-4" />
              {!address ? "WALLET REQUIRED" : !isBSC ? "WRONG NETWORK" : "LOW BALANCE"}
            </span>
          )}
          {!address && (
            <button
              onClick={connect}
              disabled={connecting}
              className="rounded-lg px-3 py-1.5 text-xs font-display tracking-wider bg-gradient-to-r from-neon-yellow to-neon-green text-emerald-darker disabled:opacity-60"
            >
              {connecting ? "CONNECTING…" : "CONNECT"}
            </button>
          )}
          {address && !isBSC && (
            <button
              onClick={ensureBSC}
              className="rounded-lg px-3 py-1.5 text-xs font-display tracking-wider bg-gradient-to-r from-neon-yellow to-neon-green text-emerald-darker"
            >
              SWITCH TO BSC
            </button>
          )}
        </div>
      </div>

      {address && !hasFunds && isBSC && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          You need at least <span className="text-neon-yellow">{mintPriceBNB} BNB</span> plus gas to mint. Top up your wallet to continue.
        </p>
      )}
    </div>
  );
}

function Pill({
  icon, label, value, ok,
}: { icon: React.ReactNode; label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`grid h-7 w-7 place-items-center rounded-md ${ok ? "bg-neon-green/15 text-neon-green" : "bg-white/5 text-muted-foreground"}`}>
        {icon}
      </span>
      <div className="leading-tight">
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="font-display text-xs text-foreground">{value}</div>
      </div>
    </div>
  );
}
