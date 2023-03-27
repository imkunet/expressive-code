import { describe, expect, test } from 'vitest'
import fs from 'fs'
import path from 'path'
import type { IShikiTheme } from 'shiki'
import dracula from 'shiki/themes/dracula.json'
import githubLight from 'shiki/themes/github-light.json'
import { ExpressiveCodeTheme, loadTheme, loadThemeFromObject } from '../src/common/theme'

describe('ExpressiveCodeTheme', () => {
	describe('Throws on invalid themes', () => {
		test('Empty color value', () => {
			expect(() => loadThemeFromJsonObject('invalid-1.json')).toThrow()
		})
		test('Invalid color value', () => {
			expect(() => loadThemeFromJsonObject('invalid-2.json')).toThrow()
		})
		test('Unsupported CSS theme', () => {
			expect(() => loadThemeFromJsonObject('css.json')).toThrow()
		})
	})

	describe('Can load local themes', () => {
		test('empty-dark.json', () => {
			const theme = loadThemeFromJsonObject('empty-dark.json')
			expect(theme.name).toBe('empty-dark')

			// Expect the correct default colors to be set
			expect(theme.colors['editor.background']).toBe('#1e1e1e')
			expect(theme.colors['editor.foreground']).toBe('#bbbbbb')

			// Expect color lookups to have the correct values
			expect(theme.colors['menu.foreground']).toBe('#f0f0f0')

			// Expect multi-level color lookups to work, too:
			//    'editorHoverWidget.foreground'
			// -> 'editorWidget.foreground'
			// -> 'foreground'
			expect(theme.colors['editorHoverWidget.foreground']).toBe('#cccccc')

			// Expect colors with "transparent" transform to have the correct values
			expect(theme.colors['editorInlayHint.background']).toBe('#4d4d4dcc')

			// Expect colors with "lighten" transform to have the correct values
			expect(theme.colors['toolbar.activeBackground']).toBe('#63666750')

			// Expect colors with "lessProminent" transform to have the correct values
			expect(theme.colors['editor.selectionHighlightBackground']).toBe('#1d3b5a99')

			// Expect `null` colors to remain `null`
			expect(theme.colors['contrastBorder']).toBeNull()
			// ...also if they are referenced by other colors
			expect(theme.colors['button.border']).toBeNull()
		})
		test('empty.json', () => {
			const theme = loadThemeFromJsonObject('empty.json')
			expect(theme.name).toBe('empty')

			// Expect the guessed theme type to be correct (defaults to dark if no colors are set)
			expect(theme.type).toBe('dark')

			// Expect the same default colors as in empty-dark.json
			expect(theme.colors['editor.background']).toBe('#1e1e1e')
			expect(theme.colors['editor.foreground']).toBe('#bbbbbb')
		})
		test('empty-light.json', () => {
			const theme = loadThemeFromJsonObject('empty-light.json')
			expect(theme.name).toBe('empty-light')

			// Expect the correct default colors to be set
			expect(theme.colors['editor.background']).toBe('#ffffff')
			expect(theme.colors['editor.foreground']).toBe('#333333')

			// Expect color lookups to have the correct values
			// (this is a multi-level lookup in light themes, too)
			expect(theme.colors['menu.foreground']).toBe('#616161')

			// Expect colors with "transparent" transform to have the correct values
			expect(theme.colors['editorInlayHint.background']).toBe('#c4c4c499')

			// Expect colors with "darken" transform to have the correct values
			expect(theme.colors['toolbar.activeBackground']).toBe('#a6a6a650')

			// Expect colors with "lessProminent" transform to have the correct values
			expect(theme.colors['editor.selectionHighlightBackground']).toBe('#dbedff99')

			// Expect `null` colors to remain `null`
			expect(theme.colors['contrastBorder']).toBeNull()
			// ...also if they are referenced by other colors
			expect(theme.colors['button.border']).toBeNull()
		})
		describe('dark-plus.json', () => {
			test('loaded by passing an object to loadThemeFromObject()', () => {
				const theme = loadThemeFromJsonObject('dark-plus.json')
				expectDarkPlus(theme)
			})
			test('loaded by passing an object to loadTheme()', async () => {
				const jsonTheme = fs.readFileSync(path.join(__dirname, 'themes', 'dark-plus.json'), 'utf8')
				const themeObject = JSON.parse(jsonTheme) as IShikiTheme
				const theme = await loadTheme(themeObject)
				expectDarkPlus(theme)
			})
			test('loaded by passing a path to loadTheme()', async () => {
				const theme = await loadTheme(path.join(__dirname, 'themes', 'dark-plus.json'))
				expectDarkPlus(theme)
			})
		})
		function expectDarkPlus(theme: ExpressiveCodeTheme) {
			expect(theme.name).toBe('Dark+ (default dark)')

			// Expect the correct default colors to be set
			expect(theme.colors['editor.background']).toBe('#222225')
			expect(theme.colors['editor.foreground']).toBe('#d4d4d4')

			// Expect color lookups to have the correct values
			expect(theme.colors['menu.foreground']).toBe('#cccccc')

			// Expect colors with "transparent" transform to have the correct values
			expect(theme.colors['editorInlayHint.background']).toBe('#4d4d4dcc')

			// Expect colors with "lighten" transform to have the correct values
			expect(theme.colors['editorHoverWidget.statusBarBackground']).toBe('#2c2c2d')

			// Expect colors with "lessProminent" transform to have the correct values
			expect(theme.colors['editor.selectionHighlightBackground']).toBe('#add6ff26')
		}
	})

	describe('Can load themes from NPM package imports', () => {
		test('dracula', () => {
			const theme = loadThemeFromObject(dracula)

			// Expect the guessed theme type to be correct (it's not contained in most Shiki themes)
			expect(theme.type).toBe('dark')

			// Expect some colors to match the ones from the loaded JSON file
			expect(theme.colors['editor.background']).toBe(dracula.colors?.['editor.background'].toLowerCase())
			expect(theme.colors['editor.foreground']).toBe(dracula.colors?.['editor.foreground'].toLowerCase())
			expect(theme.colors['tab.activeBorderTop']).toBe(dracula.colors?.['tab.activeBorderTop'].toLowerCase())
		})
		test('github-light', () => {
			const theme = loadThemeFromObject(githubLight)

			// Expect the guessed theme type to be correct (it's not contained in most Shiki themes)
			expect(theme.type).toBe('light')

			// Expect some colors to match the ones from the loaded JSON file
			expect(theme.colors['editor.background']).toBe(githubLight.colors?.['editor.background'].toLowerCase())
			expect(theme.colors['editor.foreground']).toBe(githubLight.colors?.['editor.foreground'].toLowerCase())
			expect(theme.colors['tab.activeBorderTop']).toBe(githubLight.colors?.['tab.activeBorderTop'].toLowerCase())
		})
	})

	describe('Can load themes bundled with Shiki by name', () => {
		test('dracula', async () => {
			const theme = await loadTheme('dracula')

			// Expect the guessed theme type to be correct (it's not contained in most Shiki themes)
			expect(theme.type).toBe('dark')

			// Expect some colors to match the ones from our import
			expect(theme.colors['editor.background']).toBe(dracula.colors?.['editor.background'].toLowerCase())
			expect(theme.colors['editor.foreground']).toBe(dracula.colors?.['editor.foreground'].toLowerCase())
			expect(theme.colors['tab.activeBorderTop']).toBe(dracula.colors?.['tab.activeBorderTop'].toLowerCase())
		})
	})
})

function loadThemeFromJsonObject(fileName: string) {
	const jsonTheme = fs.readFileSync(path.join(__dirname, 'themes', fileName), 'utf8')
	const themeObject = JSON.parse(jsonTheme) as Partial<IShikiTheme>
	return loadThemeFromObject(themeObject)
}