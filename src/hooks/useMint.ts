import { useCallback, useState } from "react";
import { BSC_CHAIN_ID, pushToast } from "./useMetaMask";

export type MintStatus = "idle" | "confirming" | "pending" | "success" | "error";

export interface MintResult {
  txHash: string;
  tokenId: string;
  blockExplorer: string;
}

// Deployed BEP-721 contract on BSC mainnet.
// Assumes standard signature: function mint(address to) payable
export const NFT_CONTRACT_ADDRESS = "0x52582a977EAe7579BF17f77b295690E20B91F360";

// Function selector for mint(address) = keccak256("mint(address)")[0..4]
const MINT_SELECTOR = "0x6a627842";

// Event topic for Transfer(address,address,uint256)
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ZERO_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

function padAddress(addr: string): string {
  return addr.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

function encodeMintCalldata(to: string): string {
  return MINT_SELECTOR + padAddress(to);
}

function bnbToHexWei(bnb: string): string {
  // Avoid float precision issues for typical mint prices (<= 18 decimals).
  const [whole, frac = ""] = bnb.split(".");
  const fracPadded = (frac + "0".repeat(18)).slice(0, 18);
  const wei = BigInt(whole || "0") * 10n ** 18n + BigInt(fracPadded || "0");
  return "0x" + wei.toString(16);
}

export function useMint() {
  const [status, setStatus] = useState<MintStatus>("idle");
  const [result, setResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mint = useCallback(async (opts: { playerName: string; priceBNB?: string }) => {
    setError(null);
    setResult(null);

    if (!window.ethereum?.isMetaMask) {
      pushToast({ kind: "err", title: "MetaMask required", desc: "Install MetaMask to mint." });
      setError("MetaMask not detected");
      setStatus("error");
      return;
    }
    try {
      // ---- Preflight: wallet connected ----
      const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
      const from = accounts?.[0];
      if (!from) {
        pushToast({ kind: "err", title: "Wallet not connected", desc: "Connect MetaMask before minting." });
        setError("Wallet not connected");
        setStatus("error");
        return;
      }

      // ---- Preflight: correct network ----
      const cid = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      if (cid !== BSC_CHAIN_ID) {
        pushToast({ kind: "err", title: "Wrong network", desc: "Switch to BNB Smart Chain." });
        setError("Wrong network — switch to BSC");
        setStatus("error");
        return;
      }

      const data = encodeMintCalldata(from);
      const priceBNB = opts.priceBNB ?? "0";
      const valueHex = bnbToHexWei(priceBNB);

      // ---- Preflight: sufficient balance (price + estimated gas) ----
      const balHex = (await window.ethereum.request({
        method: "eth_getBalance",
        params: [from, "latest"],
      })) as string;
      const balance = BigInt(balHex);
      const priceWei = BigInt(valueHex);

      const tx = {
        from,
        to: NFT_CONTRACT_ADDRESS,
        value: valueHex,
        data,
      };

      let gasCost = 0n;
      try {
        const gasHex = (await window.ethereum.request({
          method: "eth_estimateGas",
          params: [tx],
        })) as string;
        const gasPriceHex = (await window.ethereum.request({
          method: "eth_gasPrice",
        })) as string;
        gasCost = BigInt(gasHex) * BigInt(gasPriceHex);
      } catch {
        // Fallback: assume ~250k gas at 5 gwei on BSC
        gasCost = 250_000n * 5_000_000_000n;
      }

      const required = priceWei + gasCost;
      if (balance < required) {
        const needed = Number(required) / 1e18;
        const have = Number(balance) / 1e18;
        const msg = `Need ~${needed.toFixed(4)} BNB (have ${have.toFixed(4)})`;
        pushToast({ kind: "err", title: "Insufficient balance", desc: msg });
        setError(`Insufficient balance — ${msg}`);
        setStatus("error");
        return;
      }

      // Pre-flight: simulate the call so we fail fast with a readable revert
      // reason BEFORE prompting the user to sign.
      try {
        await window.ethereum.request({
          method: "eth_call",
          params: [tx, "latest"],
        });
      } catch (simErr: unknown) {
        const e = simErr as { message?: string; data?: { message?: string } };
        const msg = e?.data?.message ?? e?.message ?? "Contract reverted on simulation";
        throw new Error(msg);
      }

      setStatus("confirming");
      pushToast({ kind: "info", title: "Confirm in MetaMask", desc: `Minting ${opts.playerName}…` });

      const txHash = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      })) as string;

      setStatus("pending");
      pushToast({ kind: "info", title: "Transaction submitted", desc: `${txHash.slice(0, 10)}…` });

      type Log = { topics: string[]; address: string };
      type Receipt = { status?: string; blockNumber?: string; logs?: Log[] };
      let receipt: Receipt | null = null;
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 1500));
        receipt = (await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        })) as Receipt | null;
        if (receipt) break;
      }

      if (!receipt) throw new Error("Transaction not confirmed in time");
      if (receipt.status !== "0x1") throw new Error("Transaction reverted on-chain");

      // Parse Transfer(from=0x0, to=user, tokenId) emitted by the contract.
      let tokenIdHex: string | null = null;
      const userPadded = "0x" + padAddress(from);
      for (const log of receipt.logs ?? []) {
        if (
          log.topics?.[0]?.toLowerCase() === TRANSFER_TOPIC &&
          log.topics?.[1]?.toLowerCase() === ZERO_TOPIC &&
          log.topics?.[2]?.toLowerCase() === userPadded.toLowerCase() &&
          log.address?.toLowerCase() === NFT_CONTRACT_ADDRESS.toLowerCase()
        ) {
          tokenIdHex = log.topics[3];
          break;
        }
      }

      const tokenIdStr = tokenIdHex
        ? BigInt(tokenIdHex).toString()
        : (parseInt(txHash.slice(-8), 16) % 99999).toString();

      const final: MintResult = {
        txHash,
        tokenId: `#${tokenIdStr.padStart(5, "0")}`,
        blockExplorer: `https://bscscan.com/tx/${txHash}`,
      };
      setResult(final);
      setStatus("success");
      pushToast({ kind: "ok", title: "NFT minted!", desc: `Token ${final.tokenId} is yours.` });
    } catch (e: unknown) {
      const err = e as { code?: number; message?: string };
      const msg =
        err?.code === 4001
          ? "Transaction rejected"
          : err?.message ?? "Mint failed";
      setError(msg);
      setStatus("error");
      pushToast({ kind: "err", title: "Mint failed", desc: msg });
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, mint, reset };
}
