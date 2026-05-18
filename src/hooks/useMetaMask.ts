import { useCallback, useEffect, useState } from "react";

// Binance Smart Chain Mainnet
export const BSC_CHAIN_ID = "0x38"; // 56
export const BSC_PARAMS = {
  chainId: BSC_CHAIN_ID,
  chainName: "BNB Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com"],
};

type Eth = {
  isMetaMask?: boolean;
  request: (a: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (e: string, cb: (...args: unknown[]) => void) => void;
  removeListener?: (e: string, cb: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window { ethereum?: Eth }
}

export type Toast = { id: number; title: string; desc?: string; kind: "ok" | "err" | "info" };

const toastBus = new EventTarget();
export function pushToast(t: Omit<Toast, "id">) {
  toastBus.dispatchEvent(new CustomEvent("toast", { detail: { ...t, id: Date.now() + Math.random() } }));
}
export function onToast(cb: (t: Toast) => void) {
  const h = (e: Event) => cb((e as CustomEvent<Toast>).detail);
  toastBus.addEventListener("toast", h);
  return () => toastBus.removeEventListener("toast", h);
}

export function useMetaMask() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [connecting, setConnecting] = useState(false);

  const isInstalled = typeof window !== "undefined" && !!window.ethereum?.isMetaMask;

  const refreshBalance = useCallback(async (addr: string) => {
    if (!window.ethereum) return;
    try {
      const wei = await window.ethereum.request({ method: "eth_getBalance", params: [addr, "latest"] }) as string;
      const bnb = parseInt(wei, 16) / 1e18;
      setBalance(bnb.toFixed(4));
    } catch { /* ignore */ }
  }, []);

  const ensureBSC = useCallback(async () => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BSC_CHAIN_ID }] });
      return true;
    } catch (err: unknown) {
      const e = err as { code?: number };
      if (e?.code === 4902) {
        try {
          await window.ethereum.request({ method: "wallet_addEthereumChain", params: [BSC_PARAMS] });
          return true;
        } catch {
          pushToast({ kind: "err", title: "Failed to add BSC network" });
          return false;
        }
      }
      pushToast({ kind: "err", title: "Network switch rejected" });
      return false;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!isInstalled) {
      pushToast({ kind: "err", title: "MetaMask not detected", desc: "Install MetaMask to continue." });
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setConnecting(true);
    try {
      const accounts = await window.ethereum!.request({ method: "eth_requestAccounts" }) as string[];
      const acc = accounts?.[0] ?? null;
      setAddress(acc);
      const cid = await window.ethereum!.request({ method: "eth_chainId" }) as string;
      setChainId(cid);
      if (cid !== BSC_CHAIN_ID) {
        pushToast({ kind: "info", title: "Switching to BNB Smart Chain..." });
        const ok = await ensureBSC();
        if (ok) setChainId(BSC_CHAIN_ID);
      }
      if (acc) {
        await refreshBalance(acc);
        pushToast({ kind: "ok", title: "Wallet connected", desc: `${acc.slice(0, 6)}...${acc.slice(-4)}` });
      }
    } catch {
      pushToast({ kind: "err", title: "Connection rejected" });
    } finally {
      setConnecting(false);
    }
  }, [ensureBSC, isInstalled, refreshBalance]);

  const disconnect = useCallback(() => {
    setAddress(null); setBalance("0");
    pushToast({ kind: "info", title: "Wallet disconnected" });
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const onAcc = (...args: unknown[]) => {
      const accs = args[0] as string[];
      const a = accs?.[0] ?? null;
      setAddress(a);
      if (a) refreshBalance(a);
    };
    const onChain = (...args: unknown[]) => setChainId(args[0] as string);
    window.ethereum.on?.("accountsChanged", onAcc);
    window.ethereum.on?.("chainChanged", onChain);
    return () => {
      window.ethereum?.removeListener?.("accountsChanged", onAcc);
      window.ethereum?.removeListener?.("chainChanged", onChain);
    };
  }, [refreshBalance]);

  return {
    address, chainId, balance, connecting, isInstalled,
    isBSC: chainId === BSC_CHAIN_ID,
    connect, disconnect, ensureBSC,
  };
}
