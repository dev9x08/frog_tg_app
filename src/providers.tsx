import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { ToastContainer } from "react-toastify";
import { WagmiProvider } from 'wagmi'
import "react-toastify/dist/ReactToastify.css";
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { bscTestnet, bsc } from '@reown/appkit/networks'
import { createAppKit, useAppKitTheme } from '@reown/appkit/react'
const projectId = import.meta.env.VITE_APP_KIT_ID;
const networks = [bscTestnet, bsc];



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
  },
  debug: true,
  chainImages: {
    97: '/images/wallet.png'
  }
})

const queryClient = new QueryClient();


export default function Providers({ children }: PropsWithChildren) {
  const {setThemeMode } = useAppKitTheme();
  setThemeMode('dark')
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
