import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { ToastContainer } from "react-toastify";
import { WagmiProvider } from 'wagmi'
// import { bscTestnet} from 'wagmi/chains'
// import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'
import "react-toastify/dist/ReactToastify.css";
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { bscTestnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
// import { config } from "./wagmi.ts";


// const config = createConfig({
//   chains: [bscTestnet],
//   connectors: [
//     injected(),
//     coinbaseWallet(),
//     walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
//   ],
//   transports: {
//     [bscTestnet.id]: http(),
//   },
// })

const projectId = import.meta.env.VITE_APP_KIT_ID;
const networks = [bscTestnet];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [networks[0], ...networks],
  projectId,
  features: {
    analytics: true
  }
})

const queryClient = new QueryClient();


export default function Providers({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as never}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ToastContainer
          theme="dark"
          position="top-center"
          hideProgressBar
          stacked
        />

       </QueryClientProvider>
    </WagmiProvider>
  );
}
