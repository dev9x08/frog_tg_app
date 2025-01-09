import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { WagmiProvider } from "wagmi";
import { PropsWithChildren } from "react";
import { ToastContainer } from "react-toastify";
// import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { MetaMaskProvider } from "@metamask/sdk-react";

import "react-toastify/dist/ReactToastify.css";
// import { config } from "./wagmi.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function Providers({ children }: PropsWithChildren) {
  return (
    // <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "Telegram Mini App",
          url: window.location.href,
        },
      }}
    >
        {children}
        <ToastContainer
          theme="dark"
          position="top-center"
          hideProgressBar
          stacked
        />
        </MetaMaskProvider>
      </QueryClientProvider>
    // </WagmiProvider>
  );
}
