'use client';

import { http, createStorage, cookieStorage } from 'wagmi'
import { sepolia, bscTestnet} from 'wagmi/chains'
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'

const projectId = 'b53eec7865ae0941ac8286c11d012596';

// Tworzymy własny chain dla Sepolia z customowym RPC Alchemy
const alchemySepolia: Chain = {
   ...sepolia,
   rpcUrls: {
     default: {
       http: [`https://eth-sepolia.g.alchemy.com/v2/1rTvv4V83NoAh4AETjS6r0PCsmPyODN0`], // Zamień YOUR_ALCHEMY_API_KEY na Twój klucz API z Alchemy
     },
     public: {
       http: [`https://eth-sepolia.g.alchemy.com/v2/1rTvv4V83NoAh4AETjS6r0PCsmPyODN0`], // Zamień YOUR_ALCHEMY_API_KEY na Twój klucz API z Alchemy
     },
   },
 };

//const supportedChains: Chain[] = [sepolia, bscTestnet, blastSepolia];
const supportedChains: Chain[] = [alchemySepolia, bscTestnet];

export const config = getDefaultConfig({
   appName: 'WalletConnection',
   projectId,
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   chains: supportedChains as any,
   ssr: true,
   storage: createStorage({
    storage: cookieStorage,
   }),
  transports: supportedChains.reduce((obj, chain) => ({ ...obj, [chain.id]: http() }), {})
 }); 