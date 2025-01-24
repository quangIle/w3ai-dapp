import { index, prefix, route, type RouteConfig } from '@react-router/dev/routes'

export default [
	index('./routes/home/index.tsx'),
	...prefix('/resources', [route('theme-switch', './routes/resources+/theme-switch.tsx')]),
] satisfies RouteConfig
