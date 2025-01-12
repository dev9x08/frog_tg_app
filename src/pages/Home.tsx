import UserTap from "../components/UserTap";
import { useUserStore } from "../store/user-store";
import { Link } from "react-router-dom";
import UserGameDetails from "@/components/UserGameDetails";
import levelConfig from "@/config/level-config";
import { uesStore } from "@/store";
import { $http } from "@/lib/http";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect } from "react";


const isTelegramWebApp = () => {

  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    window.Telegram?.WebApp &&
    (userAgent.includes('telegram') || 
    window.location.href.includes('tgWebApp') || 
    !!window.Telegram.WebApp.initData) 
  );
};



export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  console.log(address, isConnected, connect, connectors);
  const user = useUserStore();
  const { maxLevel } = uesStore();
  const InjectedConnector = connectors.find((connector) => connector.id === 'injected');
  const webApp = window.Telegram?.WebApp;

  const handleConnect = async () => {
    try {
        const hasWallet = typeof window.ethereum !== "undefined";  
        if (!hasWallet) {
          if (isTelegramWebApp()) {
            webApp.showPopup({
              title: "Wallet Required",
              message: "Please install MetaMask or another Web3 wallet to continue",
              buttons: [
                {
                  text: "Install MetaMask",
                  type: "default",
                  id: "install_metamask"
                },
                {
                  text: "Close",
                  type: "close"
                }
              ]
            }, (buttonId) => {
              if (buttonId === "install_metamask") {
                window.open("https://metamask.io/download/", "_blank");
              }
            });
          } else {
            window.open("https://metamask.io/download/", "_blank");
          }
          return;
        }
        else {
          if(InjectedConnector) {
            await connect({ connector: InjectedConnector });
          }
        }
    } catch (error) {
      console.error('Wallet connection error:', error);
      if (webApp) {
        webApp.showAlert('Failed to connect wallet. Please try again.');
      }
    }
  };

  const handleDisconnect = async () => {
    try {
        await disconnect();
    } catch (error) {
      console.error('Wallet disconnection error:', error);
    }
  };

  const handleSuccessfulConnection = async (walletAddress: string) => {
    try {
      await $http.post("/clicker/set-wallet", {
        wallet: walletAddress,
      });
      
      // if (isTelegramWebApp()) {
      //   webApp.showPopup({
      //     title: "Connected",
      //     message: `Connected with wallet: ${walletAddress}`,
      //     buttons: [{ text: "Close", type: "close" }]
      //   });
      // }
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
        {isConnected ? (
            <button onClick={handleDisconnect} className="h-6 sm:h-8 text-xs sm:text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              className="h-6 sm:h-8 text-xs sm:text-sm"
            >
              Connect Wallet
            </button>
          )}
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
