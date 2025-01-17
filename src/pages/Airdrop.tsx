import UserGameDetails from "@/components/UserGameDetails";
import { $http } from "@/lib/http";
import { useUserStore } from "@/store/user-store";
import { useEffect, useState } from "react";
// import { useAccount, useConnect, useSendTransaction } from "wagmi";
import { useAccount, useConnect} from "wagmi";
import { toast } from "react-toastify";
import {  } from 'wagmi'
  // import { parseEther } from 'viem'


export default function Airdrop() {
  const user = useUserStore();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tokenAmount, setTokenAmount] = useState<number | null>(null);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const decimal = 1000000000000000000;
  // const {sendTransaction } = useSendTransaction()

  console.log(address, isConnected, connect, connectors);

  const handleSuccessfulConnection = async (walletAddress: string) => {
    try {
      await $http.post("/clicker/set-wallet", {
        wallet: walletAddress,
      });
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
      // const to = import.meta.env.VITE_ADMIN_WALLET;
      // const feeUnit = import.meta.env.VITE_FEE_PER_THOUSAND_POINTS;
      // const totalFee = (user.balance/1000) * Number(feeUnit);
      // const minFee = 0.000001;
      // const finalFee = Math.max(totalFee, minFee).toFixed(18)
      // await sendTransaction({ to, value: parseEther(finalFee.toString())});
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
              toast.info(res.data.message);
            } else {
              toast.error(res.data.message);
            }
          }
        })
        .catch(() => {
          toast.error("Error claiming tokens");
        });
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
          <div className="text-center text-xl sm:text-2xl font-bold">
            Claim Your Tokens
          </div>
          <div className="text-center text-sm sm:text-lg text-white">
              Tokens earned today can be claimed immediately. Claim your tokens by linking your wallet and joining the token access plan. Unclaimed tokens will expire after days specified.
          </div>

          <div className="flex items-center justify-center mt-5">
            <appkit-button size="md"/>
            
          </div>

          <div className="flex items-center justify-center mt-5">
            <button
              className="flex items-center gap-2 px-10 py-2 border-2 rounded-full bg-black/20 border-white/10 mt-5 bg-[linear-gradient(180deg,#EEE8E2_0%,#C6C2BE_51.99%,_#C6C2BE_52%,#A48B74_100%)] active:bg-[linear-gradient(180deg,#A48B74_0%,#C6C2BE_48%,#C6C2BE_48.01%,#EEE8E2_100%)] shadow-[0px_0px_20px_0px_rgba(255,218,163,0.27)]  /* Default state glow effect */
              active:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)_inset,_0px_0px_20px_0px_rgba(255,218,163,0.27)]  /* When pressed */ text-black font-bold"
              onClick={handleClaim}
            >
              Claim Tokens
            </button>
          </div>

          {txHash ? (
            <div className=" flex items-center justify-center flex-col mt-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-lg font-bold bg-gradient-to-r from-[#FBEDE0] via-[#F3A155] to-[#D36224] bg-clip-text text-transparent">
                    Claimed Tokens:  {"  "}
                    {(Number(tokenAmount)/decimal).toFixed(3)} DRHM
                  </div>
                  <a
                    href={txHash ? "https://bscscan.com/tx/" + txHash : ""}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    <img src="/images/bscscan.png" alt="bscscan" className="w-4 h-4" />
                    View on BSCScan
                  </a>
                </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
