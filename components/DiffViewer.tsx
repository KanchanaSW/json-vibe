'use client'

import { useState } from 'react'
import ReactDiffViewer from 'react-diff-viewer-continued'
import { X } from 'lucide-react'

interface DiffViewerProps {
  oldValue: string
  newValue: string
  className?: string
  onClose?: () => void
}

export default function DiffViewer({ oldValue, newValue, className = '', onClose }: DiffViewerProps) {
  const [splitView, setSplitView] = useState(true)
  const [formatJson, setFormatJson] = useState(true)

  // Normalize JSON strings for better diff comparison
  const normalizeJson = (json: string): string => {
    if (!formatJson) return json
    try {
      const parsed = JSON.parse(json)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return json
    }
  }

  const normalizedOld = normalizeJson(oldValue)
  const normalizedNew = normalizeJson(newValue)

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      <div className="flex justify-end gap-2 mb-2 shrink-0">
        <button
          onClick={() => setFormatJson(!formatJson)}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            formatJson
              ? 'bg-[#1e3a1e] text-[#4ade80]'
              : 'bg-[#1a1a1c] text-[#e4e4e7] hover:bg-[#27272a]'
          }`}
        >
          {formatJson ? 'Formatted' : 'Raw'}
        </button>
        <button
          onClick={() => setSplitView(!splitView)}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            splitView
              ? 'bg-[#1e3a1e] text-[#4ade80]'
              : 'bg-[#1a1a1c] text-[#e4e4e7] hover:bg-[#27272a]'
          }`}
        >
          {splitView ? 'Split' : 'Unified'}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 px-2 py-1 text-xs font-medium rounded transition-colors bg-[#1a1a1c] text-[#e4e4e7] hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto rounded-md border border-[#1a1a1c] bg-[#0f0f11]">
      <ReactDiffViewer
        oldValue={normalizedOld}
        newValue={normalizedNew}
        splitView={splitView}
        showDiffOnly={false}
        useDarkTheme={true}
        styles={{
          variables: {
            dark: {
              diffViewerBackground: '#0f0f11',
              diffViewerColor: '#e4e4e7',
              addedBackground: '#1e3a1e',
              addedColor: '#4ade80',
              removedBackground: '#3a1e1e',
              removedColor: '#f87171',
              wordAddedBackground: '#2d5a2d',
              wordRemovedBackground: '#5a2d2d',
              addedGutterBackground: '#1e3a1e',
              removedGutterBackground: '#3a1e1e',
              gutterBackground: '#1a1a1c',
              gutterBackgroundDark: '#0f0f11',
              highlightBackground: '#9213ec20',
              highlightGutterBackground: '#9213ec30',
            },
          },
          contentText: {
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '14px',
          },
          gutter: {
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '14px',
          },
        }}
      />
    </div>
  </div>
  )
}
