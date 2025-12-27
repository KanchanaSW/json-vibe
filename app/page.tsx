'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import JsonEditor from '@/components/JsonEditor'
import JsonTreeViewer from '@/components/JsonTreeViewer'
import DiffViewer from '@/components/DiffViewer'
import { useUrlState } from '@/hooks/useUrlState'

export default function Home() {
  const [jsonValue, setJsonValue, initialJson, isModified] = useUrlState()
  const [isValid, setIsValid] = useState(true)
  const [selectedPath, setSelectedPath] = useState<string>('root.settings.autoSave')
  const [showDiff, setShowDiff] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Only render after client-side hydration to prevent mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleJsonChange = (value: string) => {
    setJsonValue(value)
  }

  const handleValidationChange = (valid: boolean) => {
    setIsValid(valid)
  }

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonValue)
      setJsonValue(JSON.stringify(parsed, null, 2))
    } catch (e) {
      // Invalid JSON, can't format
    }
  }

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(jsonValue)
      setJsonValue(JSON.stringify(parsed))
    } catch (e) {
      // Invalid JSON, can't minify
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header 
        isValid={isValid}
        onFormat={handleFormat}
        onMinify={handleMinify}
        isModified={isModified}
        showDiff={showDiff}
        onToggleDiff={() => setShowDiff(!showDiff)}
      />
      <main className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        {isClient ? (
          <>
            <div className="flex-1 min-w-[300px] w-full lg:w-auto relative">
              <JsonEditor
                value={jsonValue}
                onChange={handleJsonChange}
                onValidationChange={handleValidationChange}
              />
              {/* Diff View Overlay */}
              {showDiff && isModified && (
                <div className="absolute inset-0 z-50 bg-bg-main border border-primary/30 shadow-2xl">
                  <div className="h-full flex flex-col">
                    <div className="h-10 border-b border-border-subtle bg-bg-panel flex items-center justify-between px-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-main">Changes</span>
                        <span className="text-xs text-text-muted">Comparing initial vs current</span>
                      </div>
                      <button
                        onClick={() => setShowDiff(false)}
                        className="text-xs px-3 py-1.5 rounded bg-bg-surface hover:bg-bg-surface/80 text-text-muted hover:text-white border border-border-subtle transition-colors"
                      >
                        Close
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <DiffViewer oldValue={initialJson} newValue={jsonValue} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full lg:w-1 h-1 lg:h-full bg-bg-main hover:bg-primary/50 cursor-row-resize lg:cursor-col-resize flex items-center justify-center border-t lg:border-t-0 border-l lg:border-l border-r lg:border-r border-border-subtle z-10 transition-colors">
              <div className="w-8 lg:w-0.5 h-0.5 lg:h-8 rounded-full bg-border-active"></div>
            </div>
            <JsonTreeViewer
              json={jsonValue}
              selectedPath={selectedPath}
              onNodeSelect={setSelectedPath}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            Loading...
          </div>
        )}
      </main>
    </div>
  )
}

