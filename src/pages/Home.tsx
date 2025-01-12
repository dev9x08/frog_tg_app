import UserTap from "../components/UserTap";
import { useUserStore } from "../store/user-store";
import { Link } from "react-router-dom";
import UserGameDetails from "@/components/UserGameDetails";
import levelConfig from "@/config/level-config";
import { uesStore } from "@/store";
import { $http } from "@/lib/http";
import { useAccount } from "wagmi";
import { useEffect } from "react";


export default function Home() {
  const { address, isConnected } = useAccount();
  const user = useUserStore();
  const { maxLevel } = uesStore();
  
  const handleSuccessfulConnection = async (walletAddress: string) => {
    try {
      await $http.post("/clicker/set-wallet", {
        wallet: walletAddress,
      });
      
    } catch (error) {
      console.error('Error updating wallet:', error);
    }
  };

  useEffect(() => {
    if (address && isConnected) {
      handleSuccessfulConnection(address);
    }
  }, [address, isConnected]);

  return (
    <div
      className="flex-1 px-5 pb-20 bg-center bg-cover"
      style={{
        backgroundImage: `url(${levelConfig.bg[user?.level?.level || 1]})`,
      }}
    >
      <header className="flex items-center justify-between mt-4 flex-wrap gap-2 sm:flex-nowrap">
        <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border-2 rounded-full bg-black/20 border-white/10">
          <img
            src="/images/avatar.png"
            alt="user-avatar"
            className="object-cover w-6 h-6 sm:w-8 sm:h-8 rounded-full"
          />
          <p className="text-xs sm:text-sm font-medium uppercase truncate max-w-[100px] sm:max-w-[150px]">
            {user?.first_name} {user?.last_name}
          </p>
        </div>
        <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border-2 rounded-full bg-black/20 border-white/10">
            <appkit-button />
        </div>
      </header>
      <UserGameDetails className="mt-6" />
      <div className="flex mt-6 space-x-1.5 justify-center items-center select-none">
        <img
          src="/images/coins.png"
          alt="coins"
          className="object-contain w-20 h-20"
        />
        <span className="text-3xl font-bold text-gradient">
          {Math.floor(user.balance)?.toLocaleString()}
        </span>
      </div>
      <div className="">
        <Link
          to={"/leaderboard"}
          className="flex items-center justify-between gap-2"
        >
          <div className="flex items-center text-xs">
            <span>{user.level?.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs">Level</span>
            <span className="font-bold">
              {user.level?.level}/{maxLevel}
            </span>
          </div>
        </Link>
        <div className="bg-[#FFDAA3]/10 border overflow-hidden border-[#FFDAA3]/10 rounded-full mt-2 h-4 w-full">
          <div
            className="bg-[linear-gradient(180deg,#FBEDE0_0%,#F7B87D_21%,#F3A155_52%,#E6824B_84%,#D36224_100%)] h-full"
            style={{
              width: `${(user.balance! / user.level!.to_balance) * 100}%`,
            }}
          ></div>
        </div>
      </div>
      <UserTap />
    </div>
  );
}
