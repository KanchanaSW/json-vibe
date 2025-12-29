'use client'

import { useState, useEffect, useRef } from 'react'
import { Share2, Link2, Settings, CheckCircle2, GitCompare, Check, QrCode, X, Copy } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

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
  const [showQrPopup, setShowQrPopup] = useState(false)
  const qrButtonRef = useRef<HTMLButtonElement>(null)
  const qrPopupRef = useRef<HTMLDivElement>(null)
  const qrCodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showCopiedPopup) {
      const timer = setTimeout(() => {
        setShowCopiedPopup(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showCopiedPopup])

  useEffect(() => {
    if (showQrPopup) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          qrPopupRef.current &&
          qrButtonRef.current &&
          !qrPopupRef.current.contains(event.target as Node) &&
          !qrButtonRef.current.contains(event.target as Node)
        ) {
          setShowQrPopup(false)
        }
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setShowQrPopup(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [showQrPopup])

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

  const handleQrCodeClick = () => {
    setShowQrPopup(!showQrPopup)
  }

  const handleCopyQrCode = async () => {
    if (!qrCodeRef.current) return

    try {
      // Find the SVG element within the wrapper div
      const svg = qrCodeRef.current.querySelector('svg') as SVGSVGElement
      if (!svg) return

      // Convert SVG to canvas
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      canvas.width = 200
      canvas.height = 200

      await new Promise((resolve, reject) => {
        img.onload = () => {
          ctx?.drawImage(img, 0, 0)
          resolve(null)
        }
        img.onerror = reject
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
      })

      // Copy canvas to clipboard
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          showCopyNotification()
        }
      }, 'image/png')
    } catch (error) {
      console.error('Failed to copy QR code:', error)
      // Fallback: try copying as data URL
      try {
        const svg = qrCodeRef.current.querySelector('svg') as SVGSVGElement
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg)
          const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
          await navigator.clipboard.writeText(dataUrl)
          showCopyNotification()
        }
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError)
      }
    }
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
          <div className="relative">
            <button 
              ref={qrButtonRef}
              onClick={handleQrCodeClick}
              className="size-9 flex items-center justify-center rounded-lg text-text-muted hover:text-white hover:bg-bg-surface border border-transparent hover:border-border-subtle transition-all"
              title="Share via QR Code"
            >
              <QrCode size={18} />
            </button>
            
            {/* QR Code Popup */}
            {showQrPopup && (
              <div
                ref={qrPopupRef}
                className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="bg-bg-surface border border-border-subtle rounded-lg shadow-lg p-4 flex flex-col items-center gap-3">
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-medium text-white">Scan QR Code</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyQrCode}
                        className="text-text-muted hover:text-white transition-colors p-1"
                        title="Copy QR Code"
                        aria-label="Copy QR Code"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => setShowQrPopup(false)}
                        className="text-text-muted hover:text-white transition-colors p-1"
                        aria-label="Close QR Code"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg" ref={qrCodeRef}>
                    <QRCodeSVG
                      value={typeof window !== 'undefined' ? window.location.href : ''}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-xs text-text-muted text-center max-w-[200px]">
                    Scan to open this page on another device
                  </p>
                </div>
              </div>
            )}
          </div>
          
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
            <span className="text-sm font-medium text-white">Copied to clipboard!</span>
          </div>
        </div>
      )}
    </>
  )
}

