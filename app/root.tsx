import {
	data,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from 'react-router'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { useConnect } from 'wagmi'
import { metaMask } from 'wagmi/connectors'

import { type Route } from './+types/root'
import appleTouchIconAssetUrl from './assets/favicons/apple-touch-icon.png'
import faviconAssetUrl from './assets/favicons/favicon.svg'
import { GeneralErrorBoundary } from './components/error-boundary'
import { EpicProgress } from './components/progress-bar'
import { useToast } from './components/toaster'
import { Button } from './components/ui/button'
import { href as iconsHref } from './components/ui/icon'
import { EpicToaster } from './components/ui/sonner'
import { UserDropdown } from './components/user-dropdown'
import { WagmiProvider } from './components/wagmi-provider'
import { ThemeSwitch, useOptionalTheme, useTheme } from './routes/resources+/theme-switch'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { getUserId, logout } from './utils/auth.server'
import { ClientHintCheck, getHints } from './utils/client-hints'
import { prisma } from './utils/db.server'
import { getEnv } from './utils/env.server'
import { pipeHeaders } from './utils/headers.server'
import { honeypot } from './utils/honeypot.server'
import { combineHeaders, getDomainUrl } from './utils/misc'
import { useNonce } from './utils/nonce-provider'
import { getTheme, type Theme } from './utils/theme.server'
import { makeTimings, time } from './utils/timing.server'
import { getToast } from './utils/toast.server'
import { useOptionalUser } from './utils/user'

export const links: Route.LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		{ rel: 'preload', href: iconsHref, as: 'image' },
		{
			rel: 'icon',
			href: '/favicon.ico',
			sizes: '48x48',
		},
		{ rel: 'icon', type: 'image/svg+xml', href: faviconAssetUrl },
		{ rel: 'apple-touch-icon', href: appleTouchIconAssetUrl },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		},
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
	]
}

export const meta: Route.MetaFunction = ({ data }) => {
	return [
		{ title: data ? 'Epic Notes' : 'Error | Epic Notes' },
		{ name: 'description', content: `Your own captain's log` },
	]
}

export async function loader({ request }: Route.LoaderArgs) {
	const timings = makeTimings('root loader')
	const userId = await time(() => getUserId(request), {
		timings,
		type: 'getUserId',
		desc: 'getUserId in root',
	})

	const user = userId
		? await time(
				() =>
					prisma.user.findUniqueOrThrow({
						select: {
							id: true,
							name: true,
							username: true,
							image: { select: { id: true } },
							roles: {
								select: {
									name: true,
									permissions: {
										select: { entity: true, action: true, access: true },
									},
								},
							},
						},
						where: { id: userId },
					}),
				{ timings, type: 'find user', desc: 'find user in root' },
			)
		: null
	if (userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await logout({ request, redirectTo: '/' })
	}
	const { toast, headers: toastHeaders } = await getToast(request)
	const honeyProps = await honeypot.getInputProps()

	const cookie = request.headers.get('Cookie')

	const wagmiKey = `wagmi.store`
	const wagmiInitial = cookie?.split('; ').find((x) => x.startsWith(`${wagmiKey}=`))

	return data(
		{
			user,
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {
					theme: getTheme(request),
				},
			},
			ENV: getEnv(),
			toast,
			honeyProps,
			wagmiInitial,
		},
		{
			headers: combineHeaders({ 'Server-Timing': timings.toString() }, toastHeaders),
		},
	)
}

export const headers: Route.HeadersFunction = pipeHeaders

function Document({
	children,
	nonce,
	theme = 'light',
	env = {},
}: {
	children: React.ReactNode
	nonce: string
	theme?: Theme
	env?: Record<string, string | undefined>
	allowIndexing?: boolean
}) {
	const allowIndexing = ENV.ALLOW_INDEXING !== 'false'
	return (
		<html lang="en" className={`${theme} h-full overflow-x-hidden`}>
			<head>
				<ClientHintCheck nonce={nonce} />
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{allowIndexing ? null : <meta name="robots" content="noindex, nofollow" />}
				<Links />
			</head>
			<body className="h-full bg-background text-foreground">
				{children}
				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	)
}

export function Layout({ children }: { children: React.ReactNode }) {
	// if there was an error running the loader, data could be missing
	const data = useLoaderData<typeof loader | null>()
	const nonce = useNonce()
	const theme = useOptionalTheme()
	return (
		<Document nonce={nonce} theme={theme} env={data?.ENV}>
			{children}
		</Document>
	)
}

function App() {
	const data = useLoaderData<typeof loader>()
	const user = useOptionalUser()
	const theme = useTheme()

	useToast(data.toast)

	return (
		<>
			<div className="flex h-full flex-col">
				<header className="container py-6">
					<nav className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap md:gap-8">
						<Logo />
						<div className="flex items-center gap-10">
							{user ? (
								<UserDropdown />
							) : (
								<Button asChild variant="default" size="lg">
									<Link to="/login">Log In</Link>
								</Button>
							)}
						</div>
					</nav>
				</header>
				<Outlet />
				<div className="container flex justify-between pb-5">
					<Logo />
					<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
				</div>
			</div>
			<EpicToaster closeButton position="top-center" theme={theme} />
			<EpicProgress />
		</>
	)
}

function Logo() {
	return (
		<Link to="/" className="group grid leading-snug">
			<span className="font-light transition group-hover:-translate-x-1">epic</span>
			<span className="font-bold transition group-hover:translate-x-1">notes</span>
		</Link>
	)
}

function AppWithProviders() {
	const { honeyProps, wagmiInitial } = useLoaderData<typeof loader>()

	return (
		<WagmiProvider initialCookie={wagmiInitial}>
			<HoneypotProvider {...honeyProps}>
				<App />
			</HoneypotProvider>
		</WagmiProvider>
	)
}

export default AppWithProviders

// this is a last resort error boundary. There's not much useful information we
// can offer at this level.
export const ErrorBoundary = GeneralErrorBoundary
