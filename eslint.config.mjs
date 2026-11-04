import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import noOnlyTestsPlugin from 'eslint-plugin-no-only-tests'
import nextTypescript from 'eslint-config-next/typescript'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import queryPlugin from '@tanstack/eslint-plugin-query'
import perfectionist from 'eslint-plugin-perfectionist'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import promisePlugin from 'eslint-plugin-promise'
import tsParser from '@typescript-eslint/parser'
import * as espree from 'espree'

// Configuration commune des règles (les règles Next.js viennent de eslint-config-next)
const baseRules = {
	// Règles du compilateur React arrivées avec eslint-plugin-react-hooks 7 : elles signalent
	// l'API Rive (on écrit dans input.value, objet renvoyé par useStateMachineInput) et les
	// setState lancés dans les effets de RiveLoader, qui fonctionnent tels quels.
	'react-hooks/set-state-in-effect': 'off',
	'react-hooks/immutability': 'off',
	'react-hooks/exhaustive-deps': 'off',
	'promise/always-return': 'off',
	'prettier/prettier': 'error',
	'no-only-tests/no-only-tests': 'error',
	'no-console': ['error', { allow: ['warn', 'error', 'info', 'debug'] }],
	'jsx-a11y/anchor-has-content': 'off',
	'jsx-a11y/alt-text': 'off',
	'@next/next/no-img-element': 'off',
}

// Configuration commune des règles perfectionist
const perfectionistRules = {
	'perfectionist/sort-objects': [
		'warn',
		{
			type: 'natural',
			order: 'desc',
		},
	],
	'perfectionist/sort-imports': [
		'error',
		{
			type: 'line-length',
			order: 'desc',
			newlinesBetween: 1,
			internalPattern: ['@/app/.*', '@/components/.*', '@/lib/.*', '@/models/.*', '@/services/.*', '@/constants/.*'],
			groups: [
				'type',
				'react',
				'nanostores',
				['builtin', 'external'],
				'type-internal',
				'internal',
				['type-parent', 'type-sibling', 'type-index'],
				['parent', 'sibling', 'index'],
				'side-effect',
				'style',
				'unknown',
			],
			customGroups: [
				{ groupName: 'react', elementNamePattern: ['^react$', '^react-.+'] },
				{ groupName: 'nanostores', elementNamePattern: '^@nanostores/' },
			],
		},
	],
	'perfectionist/sort-enums': [
		'error',
		{
			type: 'natural',
			order: 'desc',
		},
	],
}

// Plugins communs (sans @next/next, déjà fourni par eslint-config-next)
const basePlugins = {
	reactHooks: reactHooksPlugin,
	perfectionist,
	'no-only-tests': noOnlyTestsPlugin,
	jsxA11y: jsxA11yPlugin,
}

// Options communes du parser
const baseParserOptions = {
	sourceType: 'module',
	ecmaVersion: 'latest',
	ecmaFeatures: { jsx: true },
}

const eslintConfig = [
	...nextCoreWebVitals,
	...nextTypescript,
	{
		ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
	}, //	perfectionist.configs['recommended-natural'],
	eslintPluginPrettierRecommended,
	...queryPlugin.configs['flat/recommended'],
	promisePlugin.configs['flat/recommended'], // Configuration pour JavaScript
	{
		rules: {
			...baseRules,
			...perfectionistRules,
		},
		plugins: basePlugins,
		languageOptions: {
			parserOptions: baseParserOptions,
			parser: espree,
		},
		files: ['**/*.{js,jsx,mjs,cjs}'],
	}, // Configuration pour TypeScript
	{
		rules: {
			...baseRules,
			...perfectionistRules,
			// Règles TypeScript spécifiques
			...tsPlugin.configs.recommended.rules,
			...tsPlugin.configs['recommended-type-checked'].rules,
			'@typescript-eslint/strict-boolean-expressions': 'error',
			'@typescript-eslint/prefer-optional-chain': 'error',
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/no-unsafe-member-access': 'error',
			'@typescript-eslint/no-unsafe-assignment': 'error',
			'@typescript-eslint/no-unsafe-argument': 'error',
			'@typescript-eslint/no-unnecessary-type-assertion': 'error',
			'@typescript-eslint/no-explicit-any': 'error',
		},
		// Le plugin @typescript-eslint est déjà déclaré par eslint-config-next/typescript
		plugins: basePlugins,
		languageOptions: {
			parserOptions: {
				...baseParserOptions,
				project: './tsconfig.json',
			},
			parser: tsParser,
		},
		files: ['**/*.{ts,tsx}'],
	},
]

export default eslintConfig
