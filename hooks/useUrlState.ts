'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import LZString from 'lz-string'

const DEFAULT_JSON = `{
  "welcome": "Welcome to JSON Vibe",
  "message": "Your JSON state is stored in the URL hash",
  "features": [
    "URL-based state management",
    "Automatic compression",
    "Share your JSON via URL"
  ],
  "instructions": {
    "edit": "Edit the JSON in the editor",
    "share": "Copy the URL to share your JSON",
    "load": "The state automatically loads from the URL"
  }
}`

// Helper function to load JSON from hash
function loadFromHash(): string {
  if (typeof window === 'undefined') return DEFAULT_JSON

  const hash = window.location.hash.slice(1) // Remove the '#' prefix

  if (!hash) return DEFAULT_JSON

  try {
    // Try to decompress first (compressed format)
    const decompressed = LZString.decompressFromEncodedURIComponent(hash)
    if (decompressed) {
      return decompressed
    }
  } catch (error) {
    // Decompression failed, try plain decoding
  }

  try {
    // Try decoding as plain URI component (fallback for uncompressed)
    const decoded = decodeURIComponent(hash)
    return decoded
  } catch {
    // If all fails, use default
    return DEFAULT_JSON
  }
}

export function useUrlState() {
  // Initialize from hash if available (client-side only, avoids hydration issues in 'use client' components)
  const [jsonValue, setJsonValue] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return loadFromHash()
    }
    return DEFAULT_JSON
  })
  const [initialJson, setInitialJson] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return loadFromHash()
    }
    return DEFAULT_JSON
  })
  const [isHydrated, setIsHydrated] = useState(false)
  const isInitialLoadRef = useRef(true)

  // Mark as hydrated after mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Ensure we have the latest hash value (in case it changed)
    const hashValue = loadFromHash()
    setJsonValue(hashValue)
    setInitialJson(hashValue)
    setIsHydrated(true)
    
    // Mark initial load as complete after a short delay to allow hydration to settle
    setTimeout(() => {
      isInitialLoadRef.current = false
    }, 100)
  }, [])

  // Update URL hash when JSON changes (after hydration)
  // Use debouncing to avoid too frequent updates
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined' || isInitialLoadRef.current) return

    // Debounce hash updates to avoid excessive URL changes
    const timeoutId = setTimeout(() => {
      try {
        // Always update hash, even for invalid JSON, so user's work is preserved
        const compressed = LZString.compressToEncodedURIComponent(jsonValue)
        
        // Check if hash already contains this value to avoid unnecessary updates
        const currentHash = window.location.hash.slice(1)
        if (currentHash === compressed) {
          return // Hash already matches, no need to update
        }
        
        // Update hash without triggering navigation
        const newUrl = `${window.location.pathname}${window.location.search}#${compressed}`
        window.history.replaceState(null, '', newUrl)
      } catch (error) {
        // If compression fails, try to update hash with encoded value directly
        try {
          const encoded = encodeURIComponent(jsonValue)
          const currentHash = window.location.hash.slice(1)
          if (currentHash === encoded) {
            return // Hash already matches
          }
          const newUrl = `${window.location.pathname}${window.location.search}#${encoded}`
          window.history.replaceState(null, '', newUrl)
        } catch {
          // If encoding also fails, skip update
        }
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [jsonValue, isHydrated])

  // Check if JSON has been modified from initial
  const isModified = useMemo(() => {
    if (!isHydrated) return false
    try {
      // Normalize both JSONs for comparison
      const currentParsed = JSON.parse(jsonValue)
      const initialParsed = JSON.parse(initialJson)
      return JSON.stringify(currentParsed) !== JSON.stringify(initialParsed)
    } catch {
      // If either is invalid JSON, consider it modified if strings differ
      return jsonValue !== initialJson
    }
  }, [jsonValue, initialJson, isHydrated])

  // Custom setter that updates both state and URL
  const updateJsonValue = useCallback((value: string) => {
    setJsonValue(value)
  }, [])

  return [jsonValue, updateJsonValue, initialJson, isModified] as const
}

