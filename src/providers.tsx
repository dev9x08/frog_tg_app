import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { PropsWithChildren } from "react";
import { ToastContainer } from "react-toastify";


import "react-toastify/dist/ReactToastify.css";
import { config } from "./wagmi.ts";
// import { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});


export default function Providers({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
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
