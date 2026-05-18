import { useCallback, useEffect, useSyncExternalStore } from "react";

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

// ---- Shared module-level store so every component sees the same wallet ----
type WalletState = {
  address: string | null;
  chainId: string | null;
  balance: string;
  connecting: boolean;
};
const state: WalletState = { address: null, chainId: null, balance: "0", connecting: false };
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const getSnapshot = () => state;
function set(patch: Partial<WalletState>) {
  Object.assign(state, patch);
  listeners.forEach(l => l());
}

let listenersBound = false;
let bootstrapped = false;

async function refreshBalance(addr: string) {
  if (!window.ethereum) return;
  try {
    const wei = await window.ethereum.request({ method: "eth_getBalance", params: [addr, "latest"] }) as string;
    set({ balance: (parseInt(wei, 16) / 1e18).toFixed(4) });
  } catch { /* ignore */ }
}

async function ensureBSCImpl() {
  if (!window.ethereum) return false;
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BSC_CHAIN_ID }] });
    set({ chainId: BSC_CHAIN_ID });
    return true;
  } catch (err: unknown) {
    const e = err as { code?: number };
    if (e?.code === 4902) {
      try {
        await window.ethereum.request({ method: "wallet_addEthereumChain", params: [BSC_PARAMS] });
        set({ chainId: BSC_CHAIN_ID });
        return true;
      } catch {
        pushToast({ kind: "err", title: "Failed to add BSC network" });
        return false;
      }
    }
    pushToast({ kind: "err", title: "Network switch rejected" });
    return false;
  }
}

function bindProviderListeners() {
  if (listenersBound || !window.ethereum) return;
  listenersBound = true;
  const onAcc = (...args: unknown[]) => {
    const a = (args[0] as string[])?.[0] ?? null;
    set({ address: a, balance: a ? state.balance : "0" });
    if (a) refreshBalance(a);
  };
  const onChain = (...args: unknown[]) => set({ chainId: args[0] as string });
  window.ethereum.on?.("accountsChanged", onAcc);
  window.ethereum.on?.("chainChanged", onChain);
}

async function bootstrap() {
  if (bootstrapped || typeof window === "undefined" || !window.ethereum) return;
  bootstrapped = true;
  bindProviderListeners();
  try {
    const accs = await window.ethereum.request({ method: "eth_accounts" }) as string[];
    const a = accs?.[0] ?? null;
    const cid = await window.ethereum.request({ method: "eth_chainId" }) as string;
    set({ address: a, chainId: cid });
    if (a) refreshBalance(a);
  } catch { /* ignore */ }
}

async function connectImpl() {
  const isInstalled = typeof window !== "undefined" && !!window.ethereum?.isMetaMask;
  if (!isInstalled) {
    pushToast({ kind: "err", title: "MetaMask not detected", desc: "Install MetaMask to continue." });
    window.open("https://metamask.io/download/", "_blank");
    return;
  }
  bindProviderListeners();
  set({ connecting: true });
  try {
    const accounts = await window.ethereum!.request({ method: "eth_requestAccounts" }) as string[];
    const acc = accounts?.[0] ?? null;
    const cid = await window.ethereum!.request({ method: "eth_chainId" }) as string;
    set({ address: acc, chainId: cid });
    if (cid !== BSC_CHAIN_ID) {
      pushToast({ kind: "info", title: "Switching to BNB Smart Chain..." });
      await ensureBSCImpl();
    }
    if (acc) {
      await refreshBalance(acc);
      pushToast({ kind: "ok", title: "Wallet connected", desc: `${acc.slice(0, 6)}...${acc.slice(-4)}` });
    }
  } catch {
    pushToast({ kind: "err", title: "Connection rejected" });
  } finally {
    set({ connecting: false });
  }
}

function disconnectImpl() {
  set({ address: null, balance: "0" });
  pushToast({ kind: "info", title: "Wallet disconnected" });
}

export function useMetaMask() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => { bootstrap(); }, []);
  const isInstalled = typeof window !== "undefined" && !!window.ethereum?.isMetaMask;
  const connect = useCallback(connectImpl, []);
  const disconnect = useCallback(disconnectImpl, []);
  const ensureBSC = useCallback(ensureBSCImpl, []);
  return {
    address: snap.address,
    chainId: snap.chainId,
    balance: snap.balance,
    connecting: snap.connecting,
    isInstalled,
    isBSC: snap.chainId === BSC_CHAIN_ID,
    connect, disconnect, ensureBSC,
  };
}
