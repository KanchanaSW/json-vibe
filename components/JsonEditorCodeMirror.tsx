'use client'

import { useState, useEffect, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
}

export default function JsonEditor({ value, onChange, onValidationChange }: JsonEditorProps) {
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [charCount, setCharCount] = useState(0)
  const [editorHeight, setEditorHeight] = useState(400)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const isInternalUpdateRef = useRef(false)

  // Calculate editor height
  useEffect(() => {
    const updateHeight = () => {
      if (sectionRef.current) {
        const sectionHeight = sectionRef.current.clientHeight
        const footerHeight = 24 // h-6 = 24px
        const calculatedHeight = sectionHeight - footerHeight
        if (calculatedHeight > 0) {
          setEditorHeight(calculatedHeight)
        }
      }
    }
    
    requestAnimationFrame(() => {
      updateHeight()
      setTimeout(updateHeight, 0)
      setTimeout(updateHeight, 100)
    })
    
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateHeight)
    })
    if (sectionRef.current) {
      resizeObserver.observe(sectionRef.current)
    }
    window.addEventListener('resize', () => {
      requestAnimationFrame(updateHeight)
    })
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  useEffect(() => {
    setCharCount(value.length)
  }, [value])

  const validateJson = (jsonString: string) => {
    try {
      JSON.parse(jsonString)
      onValidationChange?.(true)
    } catch {
      onValidationChange?.(false)
    }
  }

  const handleEditorChange = (newValue: string) => {
    isInternalUpdateRef.current = true
    onChange(newValue)
    validateJson(newValue)
    setCharCount(newValue.length)
  }

  // Custom theme matching your design
  const customTheme = EditorView.theme({
    '&': {
      backgroundColor: '#0f0f11',
      color: '#e4e4e7',
      height: '100%',
      width: '100%',
    },
    '.cm-content': {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      padding: '16px',
    },
    '.cm-gutters': {
      backgroundColor: '#0f0f11',
      border: 'none',
    },
    '.cm-lineNumbers': {
      color: '#a1a1aa',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 8px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
      color: '#e4e4e7',
    },
    '.cm-activeLine': {
      backgroundColor: '#9213ec10',
    },
    '.cm-selectionBackground': {
      backgroundColor: '#9213ec30',
    },
    '.cm-cursor': {
      borderLeftColor: '#ffffff',
    },
  }, { dark: true })

  const extensions = [
    json(),
    customTheme,
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.selectionSet) {
        const mainSelection = update.state.selection.main
        const line = update.state.doc.lineAt(mainSelection.head)
        setCursorPosition({
          line: line.number,
          column: mainSelection.head - line.from + 1,
        })
      }
    }),
  ]

  return (
    <section 
      ref={sectionRef}
      className="flex-1 min-w-[300px] w-full flex flex-col bg-bg-main relative group/editor"
      style={{ minHeight: 0, width: '100%', minWidth: 0 }}
      suppressHydrationWarning
    >
      <div 
        ref={editorContainerRef}
        className="flex-1 overflow-hidden relative w-full"
        style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}
      >
        <CodeMirror
          value={value}
          height={`${editorHeight}px`}
          onChange={handleEditorChange}
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
          }}
        />
      </div>
      
      <div className="h-6 border-t border-border-subtle bg-bg-main flex items-center justify-between px-4 text-xs font-mono text-text-muted select-none shrink-0">
        <div className="flex gap-4">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
          <span>UTF-8</span>
          <span>JSON</span>
        </div>
        <div className="flex gap-4">
          <span>{charCount} chars</span>
        </div>
      </div>
    </section>
  )
}

