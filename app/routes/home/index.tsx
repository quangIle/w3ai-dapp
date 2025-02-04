import { type Route } from './+types/index.ts'

export const meta: Route.MetaFunction = () => [{ title: 'Epic Notes' }]

export default function Index() {
	return (
		<main className="flex flex-1 flex-col overflow-hidden">
			<div className="flex flex-1 flex-col overflow-auto">
				<div className="flex flex-1 flex-col gap-3"></div>
			</div>
			<div className="h-96"></div>
		</main>
	)
}
