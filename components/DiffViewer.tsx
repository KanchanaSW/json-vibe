'use client'

import ReactDiffViewer from 'react-diff-viewer-continued'

interface DiffViewerProps {
  oldValue: string
  newValue: string
  className?: string
}

export default function DiffViewer({ oldValue, newValue, className = '' }: DiffViewerProps) {
  // Normalize JSON strings for better diff comparison
  const normalizeJson = (json: string): string => {
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
    <div className={`h-full w-full ${className}`}>
      <ReactDiffViewer
        oldValue={normalizedOld}
        newValue={normalizedNew}
        splitView={true}
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
  )
}

