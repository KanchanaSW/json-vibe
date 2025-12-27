'use client'

import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
}

export default function JsonEditor({ value, onChange, onValidationChange }: JsonEditorProps) {
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [charCount, setCharCount] = useState(0)
  const [editorHeight, setEditorHeight] = useState(400)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const isInternalUpdateRef = useRef(false)

  // Calculate editor height
  useEffect(() => {
    const updateHeight = () => {
      if (sectionRef.current) {
        const sectionHeight = sectionRef.current.clientHeight
        const footerHeight = 24 // h-6 = 24px
        const calculatedHeight = Math.max(400, sectionHeight - footerHeight)
        setEditorHeight(calculatedHeight)
      }
    }
    
    updateHeight()
    const resizeObserver = new ResizeObserver(updateHeight)
    if (sectionRef.current) {
      resizeObserver.observe(sectionRef.current)
    }
    window.addEventListener('resize', updateHeight)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  useEffect(() => {
    setCharCount(value.length)
  }, [value])

  // Only update editor when value changes externally
  useEffect(() => {
    if (editorRef.current && !isInternalUpdateRef.current) {
      const editor = editorRef.current
      const model = editor.getModel()
      if (model) {
        const currentValue = model.getValue()
        if (currentValue !== value) {
          const position = editor.getPosition()
          model.setValue(value)
          setCharCount(value.length)
          if (position) {
            editor.setPosition(position)
          }
        }
      }
    }
    isInternalUpdateRef.current = false
  }, [value])

  const validateJson = (jsonString: string) => {
    try {
      JSON.parse(jsonString)
      onValidationChange?.(true)
    } catch {
      onValidationChange?.(false)
    }
  }

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      isInternalUpdateRef.current = true
      onChange(newValue)
      validateJson(newValue)
      setCharCount(newValue.length)
    }
  }

  const handleEditorMount = (editorInstance: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editorInstance
    
    // Set initial value
    const model = editorInstance.getModel()
    if (model && value) {
      model.setValue(value)
      setCharCount(value.length)
    }
    
    // Make absolutely sure editor is editable
    editorInstance.updateOptions({
      readOnly: false,
      domReadOnly: false,
    })
    
    // Ensure the editor can receive input
    const editorElement = editorInstance.getContainerDomNode()
    if (editorElement) {
      editorElement.setAttribute('tabindex', '0')
      editorElement.style.outline = 'none'
    }

    // Force focus multiple times to ensure it works
    const focusEditor = () => {
      editorInstance.focus()
      const container = editorInstance.getContainerDomNode()
      const textarea = container?.querySelector('textarea')
      if (textarea) {
        textarea.focus()
        textarea.click()
      }
    }
    
    // Try focusing immediately and after delays
    focusEditor()
    setTimeout(focusEditor, 100)
    setTimeout(focusEditor, 500)
    
    // Also focus on any click in the container
    const container = editorInstance.getContainerDomNode()
    if (container) {
      container.addEventListener('click', focusEditor, true)
      container.addEventListener('mousedown', focusEditor, true)
    }

    // Configure theme
    monaco.editor.defineTheme('json-vibe-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'string', foreground: 'ce9178' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'keyword', foreground: '569cd6' },
        { token: 'type', foreground: '569cd6' },
      ],
      colors: {
        'editor.background': '#0f0f11',
        'editor.foreground': '#e4e4e7',
        'editorLineNumber.foreground': '#a1a1aa',
        'editorLineNumber.activeForeground': '#e4e4e7',
        'editor.selectionBackground': '#9213ec30',
        'editor.lineHighlightBackground': '#9213ec10',
        'editorCursor.foreground': '#ffffff',
        'editorCursor.background': '#0f0f11',
      },
    })
    monaco.editor.setTheme('json-vibe-dark')

    // Track cursor
    editorInstance.onDidChangeCursorPosition((e: any) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      })
    })
  }

  const handleContainerClick = () => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  return (
    <section 
      ref={sectionRef}
      className="flex-1 min-w-[300px] w-full lg:w-auto flex flex-col bg-bg-main relative group/editor"
      onClick={handleContainerClick}
      onMouseDown={handleContainerClick}
      style={{ minHeight: 0 }}
      suppressHydrationWarning
    >
      <div 
        ref={editorContainerRef}
        className="flex-1 overflow-hidden relative" 
        style={{ minHeight: 400 }}
      >
        <Editor
          height={editorHeight}
          language="json"
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            readOnly: false,
            formatOnPaste: false,
            formatOnType: false,
            cursorBlinking: 'blink',
            cursorStyle: 'line',
            cursorWidth: 2,
            renderLineHighlight: 'line',
            selectOnLineNumbers: true,
            glyphMargin: false,
            folding: true,
            disableLayerHinting: false,
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
