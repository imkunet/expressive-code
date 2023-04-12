import { ExpressiveCodePlugin } from '@expressive-code/core'
import { h } from 'hastscript'
import { getCachedHighlighter } from './cache'

export function shiki(): ExpressiveCodePlugin {
	return {
		name: 'Shiki',
		hooks: {
			performSyntaxAnalysis: async ({ codeBlock, theme }) => {
				const highlighter = await getCachedHighlighter({ theme })
				const codeLines = codeBlock.getLines()
				const tokenLines = highlighter.codeToThemedTokens(codeBlock.code, codeBlock.language, theme.name)
				tokenLines.forEach((line, lineIndex) => {
					let charIndex = 0
					line.forEach((token) => {
						const tokenLength = token.content.length
						const tokenEndIndex = charIndex + tokenLength
						const tokenStyle = `color:${token.color || 'inherit'}`
						codeLines[lineIndex].addAnnotation({
							name: 'shiki-syntax-highlight',
							inlineRange: {
								columnStart: charIndex,
								columnEnd: tokenEndIndex,
							},
							render: ({ nodesToTransform }) => {
								return nodesToTransform.map((node) => {
									const transformedNode = h('span', { style: tokenStyle }, node)
									return transformedNode
								})
							},
						})
						charIndex = tokenEndIndex
					})
				})
			},
		},
	}
}