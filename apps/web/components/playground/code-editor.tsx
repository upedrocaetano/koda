'use client'

import { useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { OnMount, BeforeMount } from '@monaco-editor/react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-matrix-bg">
      <p className="text-matrix-green-dim text-sm animate-pulse">Carregando editor...</p>
    </div>
  ),
})

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
}

const MATRIX_THEME = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: '', foreground: '00FF41', background: '0D0D0D' },
    { token: 'comment', foreground: '006618', fontStyle: 'italic' },
    { token: 'keyword', foreground: '00D4FF' },
    { token: 'string', foreground: 'FFD700' },
    { token: 'number', foreground: '00FF41' },
    { token: 'type', foreground: '00CC33' },
    { token: 'function', foreground: '00FF41' },
    { token: 'variable', foreground: 'E0E0E0' },
    { token: 'operator', foreground: '00D4FF' },
    { token: 'delimiter', foreground: '00CC33' },
  ],
  colors: {
    'editor.background': '#0D0D0D',
    'editor.foreground': '#00FF41',
    'editor.lineHighlightBackground': '#1A1A2E',
    'editor.selectionBackground': '#00FF4130',
    'editorCursor.foreground': '#00FF41',
    'editorLineNumber.foreground': '#006618',
    'editorLineNumber.activeForeground': '#00FF41',
    'editor.inactiveSelectionBackground': '#00FF4115',
    'editorIndentGuide.background': '#1A1A2E',
    'editorBracketMatch.background': '#00FF4120',
    'editorBracketMatch.border': '#00FF41',
    'scrollbarSlider.background': '#00661850',
    'scrollbarSlider.hoverBackground': '#00A02850',
  },
}

const DEFAULT_CODE = `// Bem-vindo ao Playground do Koda! 🐍
// Escreva seu código JavaScript aqui e clique "Executar"

console.log("Olá, mundo!")

// Experimente:
// const nome = "Pedro"
// console.log(\`Meu nome é \${nome}\`)
`

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('matrix', MATRIX_THEME)
  }

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor
    editor.focus()
  }

  return (
    <MonacoEditor
      height="100%"
      language="javascript"
      theme="matrix"
      value={value || DEFAULT_CODE}
      onChange={(val) => onChange(val ?? '')}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={{
        fontSize: 14,
        fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
        fontLigatures: true,
        minimap: { enabled: typeof window !== 'undefined' && window.innerWidth > 768 },
        wordWrap: 'on',
        bracketPairColorization: { enabled: true },
        autoIndent: 'full',
        tabSize: 2,
        scrollBeyondLastLine: false,
        padding: { top: 12, bottom: 12 },
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
      }}
    />
  )
}

export { DEFAULT_CODE }
