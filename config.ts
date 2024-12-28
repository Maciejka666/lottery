import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'



export const config = createConfig({
  chains: [mainnet, sepolia],
  ssr : true,
  connectors: [
    injected(),
    walletConnect({ projectId: 'b53eec7865ae0941ac8286c11d012596' }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
}) 