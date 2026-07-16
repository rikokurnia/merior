import { type WalletClient, type PublicClient } from 'viem'
import { BrowserProvider, JsonRpcSigner, JsonRpcProvider } from 'ethers'

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient
  if (!account) return undefined
  const network = {
    chainId: chain?.id || 11155111,
    name: chain?.name || 'sepolia',
  }
  const provider = new BrowserProvider(transport, network)
  const signer = new JsonRpcSigner(provider, account.address)
  return signer
}

export function publicClientToProvider(publicClient: PublicClient) {
  const { chain, transport } = publicClient
  const network = {
    chainId: chain?.id || 11155111,
    name: chain?.name || 'sepolia',
  }
  return new JsonRpcProvider(transport.url, network)
}

import { useWalletClient, usePublicClient } from 'wagmi'
import { useMemo } from 'react'

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId })
  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient],
  )
}

export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
  const publicClient = usePublicClient({ chainId })
  return useMemo(() => (publicClient ? publicClientToProvider(publicClient) : undefined), [publicClient])
}
