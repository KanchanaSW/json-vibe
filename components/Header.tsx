'use client'

import { useState, useEffect } from 'react'
import { Share2, Link2, Settings, CheckCircle2, GitCompare, Check } from 'lucide-react'

interface HeaderProps {
  isValid?: boolean
  onFormat?: () => void
  onMinify?: () => void
  isModified?: boolean
  showDiff?: boolean
  onToggleDiff?: () => void
}

export default function Header({ 
  isValid = true, 
  onFormat, 
  onMinify, 
  isModified = false,
  showDiff = false,
  onToggleDiff 
}: HeaderProps) {
  const [showCopiedPopup, setShowCopiedPopup] = useState(false)

  useEffect(() => {
    if (showCopiedPopup) {
      const timer = setTimeout(() => {
        setShowCopiedPopup(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showCopiedPopup])

  const showCopyNotification = () => {
    setShowCopiedPopup(true)
  }

  const handleShare = () => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: 'JSON Vibe',
        text: 'Check out this JSON editor!',
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      showCopyNotification()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    showCopyNotification()
  }

  return (
    <>
      <header className="h-14 border-b border-border-subtle bg-bg-panel flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white">
            <div className="text-primary text-2xl">{"{}"}</div>
            <h1 className="font-mono text-lg font-bold tracking-tight">JSON Vibe</h1>
          </div>
          
          {/* Toolbar Actions */}
          <div className="hidden md:flex items-center h-8 bg-bg-main/50 rounded-lg p-1 border border-border-subtle">
            <button 
              onClick={onFormat}
              className="px-3 h-full rounded text-xs font-medium text-text-muted hover:text-white hover:bg-bg-surface transition-colors"
            >
              Format
            </button>
            <div className="w-px h-3 bg-border-subtle mx-1"></div>
            <button 
              onClick={onMinify}
              className="px-3 h-full rounded text-xs font-medium text-text-muted hover:text-white hover:bg-bg-surface transition-colors"
            >
              Minify
            </button>
            <div className="w-px h-3 bg-border-subtle mx-1"></div>
            <button 
              className={`px-3 h-full rounded text-xs font-medium hover:bg-bg-surface transition-colors flex items-center gap-1 ${
                isValid ? 'text-green-400' : 'text-text-muted'
              }`}
            >
              <CheckCircle2 size={14} />
              Valid
            </button>
            {isModified && (
              <>
                <div className="w-px h-3 bg-border-subtle mx-1"></div>
                <div className="px-3 h-full rounded text-xs font-medium flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </span>
                  <span className="text-yellow-400">Modified</span>
                </div>
              </>
            )}
            {isModified && onToggleDiff && (
              <>
                <div className="w-px h-3 bg-border-subtle mx-1"></div>
                <button
                  onClick={onToggleDiff}
                  className={`px-3 h-full rounded text-xs font-medium hover:bg-bg-surface transition-colors flex items-center gap-1.5 ${
                    showDiff ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-white'
                  }`}
                  title="Show Changes"
                >
                  <GitCompare size={14} />
                  <span>Show Changes</span>
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Secondary Actions */}
          <button 
            className="size-9 flex items-center justify-center rounded-lg text-text-muted hover:text-white hover:bg-bg-surface border border-transparent hover:border-border-subtle transition-all"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          
          {/* Copy Link Button */}
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 h-9 px-4 bg-bg-surface hover:bg-bg-surface/80 text-text-main text-sm font-semibold rounded-lg border border-border-subtle hover:border-border-active transition-all"
            title="Copy Link"
          >
            <Link2 size={18} />
            <span className="hidden sm:inline">Copy Link</span>
          </button>
          
          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg shadow-neon transition-all"
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* Copy Notification Popup */}
      {showCopiedPopup && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-surface border border-border-subtle rounded-lg shadow-lg">
            <Check size={18} className="text-green-400" />
            <span className="text-sm font-medium text-white">Link copied to clipboard!</span>
          </div>
        </div>
      )}
    </>
  )
}

