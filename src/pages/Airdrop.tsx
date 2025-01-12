/* eslint-disable @typescript-eslint/no-explicit-any */
// import Price from "@/components/Price";
import UserGameDetails from "@/components/UserGameDetails";
import { $http } from "@/lib/http";
// import { cn, compactNumber } from "@/lib/utils";
// import { uesStore } from "@/store";
import { useUserStore } from "@/store/user-store";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { toast } from "react-toastify";

const isTelegramWebApp = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    window.Telegram?.WebApp &&
    (userAgent.includes("telegram") ||
      window.location.href.includes("tgWebApp") ||
      !!window.Telegram.WebApp.initData)
  );
};

export default function Airdrop() {
  const user = useUserStore();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tokenAmount, setTokenAmount] = useState<number | null>(null);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  console.log(address, isConnected, connect, connectors);
  const InjectedConnector = connectors.find(
    (connector) => connector.id === "injected"
  );
  const webApp = window.Telegram?.WebApp;

  const handleConnect = async () => {
    try {
      if (isTelegramWebApp()) {
        webApp.showPopup(
          {
            title: "Connect Wallet",
            message: "Please connect your wallet",
            buttons: [
              {
                text: "Connect MetaMask",
                type: "default",
                id: "connect_metamask",
              },
            ],
          },
          async (buttonId) => {
            if (buttonId === "connect_metamask") {
              webApp.openLink(
                `https://metamask.app.link/dapp/${window.location.href}`
              );
              if (typeof window.ethereum !== "undefined") {
                try {
                  const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                  });
                  const walletAddress = accounts[0];
                  await handleSuccessfulConnection(walletAddress);
                } catch (error) {
                  console.error("Error connecting wallet:", error);
                  webApp.showAlert(
                    "Failed to connect wallet. Please try again."
                  );
                }
              } else {
                webApp.showAlert(
                  "MetaMask not detected. Please install MetaMask first."
                );
              }
            }
          }
        );
      } else {
        if (InjectedConnector) {
          await connect({ connector: InjectedConnector });
        }
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      if (webApp) {
        webApp.showAlert("Failed to connect wallet. Please try again.");
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      if (isTelegramWebApp()) {
        await disconnect();
        webApp.showPopup({
          title: "Disconnected",
          message: "Wallet disconnected successfully",
          buttons: [{ text: "Close", type: "close" }],
        });
      } else {
        await disconnect();
      }
    } catch (error) {
      console.error("Wallet disconnection error:", error);
    }
  };

  const handleSuccessfulConnection = async (walletAddress: string) => {
    try {
      await $http.post("/clicker/set-wallet", {
        wallet: walletAddress,
      });

      if (isTelegramWebApp()) {
        webApp.showPopup({
          title: "Connected",
          message: `Connected with wallet: ${walletAddress}`,
          buttons: [{ text: "Close", type: "close" }],
        });
      }
    } catch (error) {
      console.error("Error updating wallet:", error);
    }
  };

  useEffect(() => {
    if (address && isConnected) {
      handleSuccessfulConnection(address);
    }
  }, [address, isConnected]);

  const handleClaim = async () => {
    if (!address) {
      toast.warning("Please connect your wallet first");
      return;
    }
    try {
      await $http
        .post("/clicker/claim-tokens", {
          to_address: address,
          amount: user.balance,
        })
        .then((res) => {
          if (res.data.success) {
              toast.success("Tokens claimed successfully");
              setTxHash(res.data.tx_hash);
              setTokenAmount(res.data.amount);
              user.balance = 0;
          } else {
            if (res.data.locked) {
              toast.error(res.data.message);
            } else {
              toast.error(res.data.message);
            }
          }
        })
        .catch(() => {
          toast.error("Error claiming tokens");
        });

      if (isTelegramWebApp()) {
        webApp.showPopup({
          title: "Claimed",
          message: `Claimed ${user.balance} tokens`,
          buttons: [{ text: "Close", type: "close" }],
        });
      }
    } catch (error) {
      console.error("Error claiming tokens:", error);
    }
  };

  return (
    <div className="flex flex-col justify-end bg-[url('/images/bg.png')] bg-cover flex-1">
      <div className="flex flex-col flex-1 w-full h-full px-6 pb-24 mt-12 modal-body">
        <UserGameDetails className="mt-4" />
        <div className="flex items-center justify-center mt-10 space-x-1 text-gradient">
          <img
            src="/images/coins.png"
            alt="coins"
            className="object-contain w-14 h-14"
          />
          <span className="text-3xl font-bold">
            {Math.floor(user.balance)?.toLocaleString()}
          </span>
        </div>
        <div className="mt-10">
          <div className="text-center text-2xl font-bold">
            Claim Your Tokens
          </div>
          <div className="text-center text-lg text-white">
            Tokens earned today can be claimed immediately. Claim your tokens by
            linking your wallet and joining the token access plan. Unclaimed
            tokens will expire after days specified.
          </div>

          <div className="flex items-center justify-center mt-5">
            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-10 py-2 border-2 rounded-full bg-black/20 border-white/10 mt-10"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                className="flex items-center gap-2 px-10 py-2 border-2 rounded-full bg-black/20 border-white/10 mt-10"
              >
                Connect Wallet
              </button>
            )}
          </div>

          <div className="flex items-center justify-center mt-5">
            <button
              className="flex items-center gap-2 px-10 py-2 border-2 rounded-full bg-black/20 border-white/10 mt-10"
              onClick={handleClaim}
            >
              Claim Tokens
            </button>
          </div>

          {txHash ? (
            <div className=" flex items-center justify-center flex-col mt-10">
                <p>Token Amount: {(Number(tokenAmount)/1000000000000000000).toFixed(3)} DRHM</p>
              <a
                href={txHash ? "https://testnet.bscscan.com/tx/" + txHash : ""}
                target="_blank"
                className="text-white mt-4"
              >
                Go To BSCScan
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
