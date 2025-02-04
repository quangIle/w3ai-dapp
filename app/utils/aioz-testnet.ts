import { type Chain } from 'viem'

export const AIOZ_TESTNET_CHAIN_ID = '0x1006'

export const aiozTestnet: Chain = {
	id: 0x1006,
	name: 'AIOZ Network Testnet',
	nativeCurrency: {
		decimals: 18,
		name: 'testAIOZ',
		symbol: 'AIOZ',
	},
	rpcUrls: { default: { http: ['https://eth-ds.testnet.aioz.network'] } },
	blockExplorers: {
		default: {
			name: 'AIOZ Network Testnet Explorer',
			url: 'https://testnet.explorer.aioz.network',
		},
	},
	testnet: true,
}
