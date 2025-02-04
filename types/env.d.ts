/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

interface ImportMetaEnv {
	readonly VITE_WALLET_CONNECT_PROJECT_ID: string
	readonly VITE_DAPP_CONTRACT_ADDRESS: `0x${string}`
	readonly VITE_AIOZ_CHAIN_ID: '0x1006' | '0xa8'
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
