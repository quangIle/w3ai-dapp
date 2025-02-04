import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type PropsWithChildren } from 'react'
import {
	WagmiProvider as BaseWagmiProvider,
	cookieStorage,
	cookieToInitialState,
	createConfig,
	createStorage,
	http,
} from 'wagmi'
import { aioz as aiozMainnet } from 'wagmi/chains'

import { AIOZ_TESTNET_CHAIN_ID, aiozTestnet } from '#app/utils/aioz-testnet'

const isTestnet = import.meta.env.VITE_AIOZ_CHAIN_ID === AIOZ_TESTNET_CHAIN_ID
const config = createConfig({
	chains: [isTestnet ? aiozTestnet : aiozMainnet],
	transports: {
		[aiozMainnet.id]: http(),
		[aiozTestnet.id]: http(),
	},
	storage: createStorage({ storage: cookieStorage }),
	ssr: true,
})

export function WagmiProvider(props: PropsWithChildren<{ initialCookie?: string }>) {
	const { children, initialCookie } = props
	const initialState = cookieToInitialState(config, initialCookie)
	// https://wagmi.sh/react/guides/tanstack-query
	const [queryClient] = useState(new QueryClient())

	return (
		<BaseWagmiProvider config={config} initialState={initialState}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</BaseWagmiProvider>
	)
}
