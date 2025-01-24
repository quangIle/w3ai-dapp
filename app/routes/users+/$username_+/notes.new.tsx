import { requireUserId } from '#app/utils/auth.server.ts'
import { NoteEditor } from './__note-editor.tsx'
import { type Route } from './+types/notes.new.ts'

export { action } from './__note-editor.server.tsx'

export async function loader({ request }: Route.LoaderArgs) {
	await requireUserId(request)
	return {}
}

export default NoteEditor
