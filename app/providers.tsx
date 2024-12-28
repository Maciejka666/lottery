'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { State, WagmiProvider} from 'wagmi'
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";

//import { config } from '../config'  // zwykły z wagmi
import { config } from './lib/config' // config z użyciem rainbowkit


const queryClient = new QueryClient()


export function Providers({
    children, initialState 
  }: Readonly<{
    children: React.ReactNode; initialState : State | undefined;
  }>) {
    return (
      <WagmiProvider config={config} initialState ={initialState }>

       <QueryClientProvider client={queryClient}>

         <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#0E76FD",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
         >
          {children}
        </RainbowKitProvider>
       </QueryClientProvider>
     
      </WagmiProvider>
    );
  }