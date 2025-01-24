/** @type {import("prettier").Options} */
export default {
	bracketSameLine: false,
	bracketSpacing: true,
	embeddedLanguageFormatting: 'auto',
	endOfLine: 'lf',
	htmlWhitespaceSensitivity: 'css',
	insertPragma: false,
	jsxSingleQuote: false,
	printWidth: 100,
	proseWrap: 'always',
	quoteProps: 'as-needed',
	requirePragma: false,
	semi: false,
	singleAttributePerLine: false,
	singleQuote: true,
	tabWidth: 2,
	trailingComma: 'all',
	useTabs: true,
	overrides: [
		// formatting the package.json with anything other than spaces will cause
		// issues when running install...
		{
			files: ['**/package.json'],
			options: {
				useTabs: false,
			},
		},
	],
	importOrder: [
		'<BUILTIN_MODULES>',
		'<THIRD_PARTY_MODULES>',
		'',
		'^#(.*)$',
		'@/icon-name',
		'^~(/.*)$',
		'^[.]',
	],
	importOrderTypeScriptVersion: '5.0.0',
	plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
	tailwindFunctions: ['clsx'],
}
