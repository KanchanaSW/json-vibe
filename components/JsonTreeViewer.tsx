'use client'

import { useState, useMemo, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, Search, Maximize2, Minimize2, Filter } from 'lucide-react'

interface TreeNode {
  key: string
  value: any
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  path: string
}

interface JsonTreeViewerProps {
  json: string
  selectedPath?: string
  onNodeSelect?: (path: string) => void
}

export default function JsonTreeViewer({ json, selectedPath, onNodeSelect }: JsonTreeViewerProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']))
  const [searchQuery, setSearchQuery] = useState('')

  const parsedData = useMemo(() => {
    try {
      return JSON.parse(json)
    } catch {
      return null
    }
  }, [json])

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedPaths(newExpanded)
  }

  const expandAll = () => {
    const allPaths = new Set<string>(['root'])
    const collectPaths = (obj: any, path: string) => {
      if (typeof obj === 'object' && obj !== null) {
        allPaths.add(path)
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            collectPaths(item, `${path}.${index}`)
          })
        } else {
          Object.keys(obj).forEach((key) => {
            collectPaths(obj[key], `${path}.${key}`)
          })
        }
      }
    }
    if (parsedData) {
      collectPaths(parsedData, 'root')
    }
    setExpandedPaths(allPaths)
  }

  const collapseAll = () => {
    setExpandedPaths(new Set(['root']))
  }

  const renderValue = (value: any, type: string): string => {
    if (type === 'string') return `"${value}"`
    if (type === 'null') return 'null'
    return String(value)
  }

  const getValueColor = (type: string): string => {
    switch (type) {
      case 'string':
        return 'text-code-string'
      case 'number':
        return 'text-code-number'
      case 'boolean':
        return 'text-code-bool'
      case 'null':
        return 'text-text-muted'
      default:
        return 'text-text-main'
    }
  }

  const getNodeType = (value: any): TreeNode['type'] => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object') return 'object'
    return typeof value as 'string' | 'number' | 'boolean'
  }

  const renderNode = (key: string, value: any, path: string, depth: number = 0): ReactNode => {
    const type = getNodeType(value)
    const isExpanded = expandedPaths.has(path)
    const isComplex = type === 'object' || type === 'array'
    const isSelected = selectedPath === path

    // Filter by search query
    if (searchQuery && !key.toLowerCase().includes(searchQuery.toLowerCase())) {
      if (isComplex) {
        // Check children
        const hasMatchingChild = isComplex && (
          Array.isArray(value)
            ? value.some((_, i) => `${path}.${i}`.includes(searchQuery))
            : Object.keys(value).some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        if (!hasMatchingChild) return null
      } else {
        return null
      }
    }

    if (!isComplex) {
      return (
        <div
          key={path}
          className={`group flex items-start gap-2 p-1.5 rounded hover:bg-bg-surface cursor-pointer border transition-all ${
            isSelected
              ? 'bg-primary/10 border-primary/20 shadow-neon-active'
              : 'border-transparent hover:border-border-subtle'
          }`}
          onClick={() => onNodeSelect?.(path)}
        >
          <div className="text-text-muted/50 mt-0.5" style={{ width: '16px' }}></div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-code-key">{key}</span>
              <span className="text-text-muted text-xs">:</span>
              <span className={`font-mono text-sm ${getValueColor(type)}`}>
                {renderValue(value, type)}
              </span>
              {isSelected && (
                <span className="ml-auto text-[10px] text-accent uppercase tracking-wider font-bold">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      )
    }

    const itemCount = Array.isArray(value) ? value.length : Object.keys(value).length
    const itemType = Array.isArray(value) ? 'Array' : 'Object'

    return (
      <div key={path} className="group flex flex-col gap-1">
        <div
          className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border transition-all ${
            isSelected
              ? 'bg-bg-surface/30 border-border-subtle shadow-sm'
              : 'hover:bg-bg-surface border-transparent hover:border-border-subtle'
          }`}
          onClick={() => {
            toggleExpand(path)
            onNodeSelect?.(path)
          }}
        >
          {isExpanded ? (
            <ChevronDown size={18} className="text-text-muted hover:text-white transition-colors" />
          ) : (
            <ChevronRight size={18} className="text-text-muted hover:text-white transition-colors" />
          )}
          <span className="font-mono text-sm text-code-key font-bold">{key}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-bg-surface text-text-muted border border-border-subtle font-mono">
            {itemType} {`{${itemCount}}`}
          </span>
        </div>

        {isExpanded && (
          <div
            className="pl-6 pt-1 flex flex-col gap-1 border-l border-border-active/50 ml-2.5"
            style={{ marginLeft: `${depth * 8 + 10}px` }}
          >
            {Array.isArray(value)
              ? value.map((item, index) => renderNode(String(index), item, `${path}.${index}`, depth + 1))
              : Object.entries(value).map(([k, v]) => renderNode(k, v, `${path}.${k}`, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const getBreadcrumbs = (): string[] => {
    if (!selectedPath || selectedPath === 'root') return ['root']
    return selectedPath.split('.').filter(Boolean)
  }

  if (!parsedData) {
    return (
      <section className="w-full lg:w-[45%] min-w-[320px] flex flex-col bg-bg-panel border-t lg:border-t-0 lg:border-l border-border-subtle">
        <div className="flex-1 flex items-center justify-center text-text-muted">
          <p>Invalid JSON</p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full lg:w-[45%] min-w-[320px] flex flex-col bg-bg-panel border-t lg:border-t-0 lg:border-l border-border-subtle shadow-xl">
      {/* Tree Toolbar */}
      <div className="h-10 border-b border-border-subtle flex items-center justify-between px-3 bg-bg-panel">
        <div className="flex items-center gap-1">
          <button
            onClick={expandAll}
            className="p-1.5 rounded hover:bg-bg-surface text-text-muted hover:text-white transition-colors"
            title="Expand All"
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={collapseAll}
            className="p-1.5 rounded hover:bg-bg-surface text-text-muted hover:text-white transition-colors"
            title="Collapse All"
          >
            <Minimize2 size={18} />
          </button>
          <div className="h-4 w-px bg-border-subtle mx-1"></div>
          <button
            className="p-1.5 rounded hover:bg-bg-surface text-text-muted hover:text-white transition-colors"
            title="Filter"
          >
            <Filter size={18} />
          </button>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-2 top-1.5 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-bg-main border border-border-subtle rounded px-2 pl-8 py-1 text-xs text-text-main focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 w-32 transition-all placeholder:text-text-muted/50"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-2 space-y-1">
        <div className="pl-2 border-l border-border-active/30 ml-2">
          {Object.entries(parsedData).map(([key, value]) =>
            renderNode(key, value, `root.${key}`)
          )}
        </div>
      </div>

      {/* Context Info / Breadcrumbs */}
      {selectedPath && (
        <div className="h-8 border-t border-border-subtle bg-bg-panel flex items-center px-4 text-xs text-text-muted overflow-hidden whitespace-nowrap">
          <div className="flex items-center">
            {getBreadcrumbs().map((crumb, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight size={14} className="text-border-active mx-1" />
                )}
                <span
                  className={`hover:text-white cursor-pointer ${
                    index === getBreadcrumbs().length - 1 ? 'text-accent font-medium' : ''
                  }`}
                >
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

