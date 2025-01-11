import UserTap from "../components/UserTap";
import { useUserStore } from "../store/user-store";
import { Link } from "react-router-dom";
import UserGameDetails from "@/components/UserGameDetails";
import levelConfig from "@/config/level-config";
import { uesStore } from "@/store";
// import { useSDK } from "@metamask/sdk-react";
// import { useState } from "react";
import { $http } from "@/lib/http";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect } from "react";
// import { Web3Button } from "@web3modal/react";
// import { useState } from "react";


const isTelegramWebApp = () => {
  // Check if we're in Telegram WebApp
  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    window.Telegram?.WebApp &&
    (userAgent.includes('telegram') || // Check user agent
    window.location.href.includes('tgWebApp') || // Check URL
    !!window.Telegram.WebApp.initData) // Check initData
  );
};



export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  console.log(address, isConnected, connect, connectors);
  // const [webApp, setWebApp] = useState();
  const user = useUserStore();
  const { maxLevel } = uesStore();
  const InjectedConnector = connectors.find((connector) => connector.id === 'injected');
  const webApp = window.Telegram?.WebApp;
  // const [account, setAccount] = useState<string | null>(null);
  // const tgApp = window.Telegram?.WebApp;
  // setWebApp(tgApp);
  // const { sdk, connected } = useSDK();

  // const webApp = window.Telegram?.WebApp;

  // const connect = async () => {
  //   console.log(account);

  //   const accounts = await sdk?.connect();
  //   console.log(accounts);
  //   if (accounts?.[0]) {
  //     // $http.post("/clicker/transfertoken", {
  //     //   to_address: accounts[0],
  //     //   amount: 20
  //     // })
  //     // .then(res=> {console.log(res,"res in transfer")});

  //     $http
  //       .post("/clicker/set-wallet", {
  //         wallet: accounts[0],
  //       })
  //       .then((res) => {
  //         console.log(res);
  //       });

  //     setAccount(accounts[0]);
  //     webApp?.showPopup({
  //       title: "Connected",
  //       message: `Connected to MetaMask with account: ${accounts[0]}`,
  //       buttons: [{ text: "Close", type: "close" }],
  //     });
  //   }
  // };

  // const disconnect = async () => {
  //   await sdk?.terminate();
  //   setAccount(null);
  //   webApp?.showPopup({
  //     title: "Disconnected",
  //     message: `Disconnected from MetaMask`,
  //     buttons: [{ text: "Close", type: "close" }],
  //   });
  // };


  const handleConnect = async () => {
    try {
      console.log(webApp,"************");
      if (isTelegramWebApp()) {
        // Telegram-specific wallet connection
        webApp.showPopup({
          title: "Connect Wallet",
          message: "Please connect your wallet",
          buttons: [
            {
              text: "Connect MetaMask",
              type: "default",
              id: "connect_metamask"
            }
          ]
        }, async (buttonId) => {
          if (buttonId === "connect_metamask") {
            // Open MetaMask in external browser and request account access
            webApp.openLink(`https://metamask.app.link/dapp/${window.location.href}`);
            
            // Listen for MetaMask connection events
            if (typeof window.ethereum !== 'undefined') {
              try {
                // Request account access
                const accounts = await window.ethereum.request({ 
                  method: 'eth_requestAccounts' 
                });
                console.log(accounts,"*******accounts*****");
                // Get the connected wallet address
                const walletAddress = accounts[0];
                
                // Handle the successful connection
                await handleSuccessfulConnection(walletAddress);
              } catch (error) {
                console.error('Error connecting wallet:', error);
                webApp.showAlert('Failed to connect wallet. Please try again.');
              }
            } else {
              webApp.showAlert('MetaMask not detected. Please install MetaMask first.');
            }
          }
        });
      } else {
        // Regular web browser wallet connection
        if (InjectedConnector) {
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
      if (isTelegramWebApp()) {
        await disconnect();
        webApp.showPopup({
          title: "Disconnected",
          message: "Wallet disconnected successfully",
          buttons: [{ text: "Close", type: "close" }]
        });
      } else {
        await disconnect();
      }
    } catch (error) {
      console.error('Wallet disconnection error:', error);
    }
  };

  // Handle successful connection
  const handleSuccessfulConnection = async (walletAddress: string) => {
    try {
      // Update wallet address in your backend
      await $http.post("/clicker/set-wallet", {
        wallet: walletAddress,
      });
      
      if (isTelegramWebApp()) {
        webApp.showPopup({
          title: "Connected",
          message: `Connected with wallet: ${walletAddress}`,
          buttons: [{ text: "Close", type: "close" }]
        });
      }
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
      <header className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 px-3 py-2 border-2 rounded-full bg-black/20 border-white/10">
          <img
            src="/images/avatar.png"
            alt="user-avatar"
            className="object-cover w-8 h-8 rounded-full"
          />
          <p className="text-sm font-medium uppercase">
            {user?.first_name} {user?.last_name}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 border-2 rounded-full bg-black/20 border-white/10">
        {isConnected ? (
            <button onClick={handleDisconnect}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
            >
              Connect
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
            className="bg-[linear-gradient(180deg,#
            
            %,#F7B87D_21%,#F3A155_52%,#E6824B_84%,#D36224_100%)] h-full"
            // style={{
            //   width: `${(user.balance! / user.level!.to_balance) * 100}%`,
            // }}
          ></div>
        </div>
      </div>
      <UserTap />
    </div>
  );
}
