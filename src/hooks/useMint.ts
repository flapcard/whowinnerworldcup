import { useCallback, useState } from "react";
import { BSC_CHAIN_ID, pushToast } from "./useMetaMask";

export type MintStatus = "idle" | "confirming" | "pending" | "success" | "error";

export interface MintResult {
  txHash: string;
  tokenId: string;
  blockExplorer: string;
}

// Simulated mint: triggers a real MetaMask popup via eth_sendTransaction
// (0 BNB self-transfer with mint payload in data) so the user sees the full
// signing UX. In production this would be a contract call to the NFT mint fn.
export function useMint() {
  const [status, setStatus] = useState<MintStatus>("idle");
  const [result, setResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mint = useCallback(async (opts: { playerName: string; priceBNB?: string }) => {
    setError(null);
    setResult(null);

    if (!window.ethereum?.isMetaMask) {
      pushToast({ kind: "err", title: "MetaMask required", desc: "Connect your wallet first." });
      setStatus("error");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
      const from = accounts?.[0];
      if (!from) {
        pushToast({ kind: "err", title: "Wallet not connected" });
        setStatus("error");
        return;
      }
      const cid = await window.ethereum.request({ method: "eth_chainId" }) as string;
      if (cid !== BSC_CHAIN_ID) {
        pushToast({ kind: "err", title: "Switch to BNB Smart Chain to mint" });
        setStatus("error");
        return;
      }

      setStatus("confirming");
      pushToast({ kind: "info", title: "Confirm in MetaMask", desc: `Minting ${opts.playerName}…` });

      // Encode a tiny payload so the tx carries mint intent on-chain.
      const payload = "0x" + Array.from(`MINT:${opts.playerName}`).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
      const valueHex = "0x" + Math.floor(parseFloat(opts.priceBNB ?? "0") * 1e18).toString(16);

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from,
          to: from, // self-transfer placeholder — replace with NFT contract address
          value: valueHex,
          data: payload,
        }],
      }) as string;

      setStatus("pending");
      pushToast({ kind: "info", title: "Transaction submitted", desc: `${txHash.slice(0, 10)}…` });

      // Poll for receipt
      type Receipt = { status?: string; blockNumber?: string };
      let receipt: Receipt | null = null;
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 1500));
        receipt = (await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        })) as Receipt | null;
        if (receipt) break;
      }

      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Transaction not confirmed");
      }

      // Derive a deterministic token id from the tx hash
      const tokenId = (parseInt(txHash.slice(-8), 16) % 99999).toString().padStart(5, "0");
      const final: MintResult = {
        txHash,
        tokenId: `#${tokenId}`,
        blockExplorer: `https://bscscan.com/tx/${txHash}`,
      };
      setResult(final);
      setStatus("success");
      pushToast({ kind: "ok", title: "NFT minted!", desc: `Token ${final.tokenId} is yours.` });
    } catch (e: unknown) {
      const err = e as { code?: number; message?: string };
      const msg = err?.code === 4001 ? "Transaction rejected" : err?.message ?? "Mint failed";
      setError(msg);
      setStatus("error");
      pushToast({ kind: "err", title: "Mint failed", desc: msg });
    }
  }, []);

  const reset = useCallback(() => { setStatus("idle"); setResult(null); setError(null); }, []);

  return { status, result, error, mint, reset };
}
