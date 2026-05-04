'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { PDFDocument } from 'pdf-lib'
import sdk from '@farcaster/miniapp-sdk'

export default function PDFEditor() {
  const [isReady, setIsReady] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [converting, setConverting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    sdk.actions.ready()
    setIsReady(true)
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
    setStatus(`Loaded: ${file.name}`)
  }

  const handleConvert = async () => {
    if (!imageFile) return
    setConverting(true)
    setStatus('Converting...')
    try {
      const imageBytes = await imageFile.arrayBuffer()
      const pdfDoc = await PDFDocument.create()
      
      let image
      if (imageFile.type === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes)
      } else {
        image = await pdfDoc.embedJpg(imageBytes)
      }

      const page = pdfDoc.addPage([image.width, image.height])
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      })

      const pdfBytes = await pdfDoc.save()
      
     // Download - convert to base64 for Farcaster compatibility
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        const link = document.createElement('a')
        link.href = base64
        link.download = imageFile.name.replace(/\.(jpg|jpeg|png)$/i, '') + '.pdf'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      reader.readAsDataURL(blob)
      
      setStatus('✅ Downloaded!')
    } catch {
      setStatus('Error converting. Try again.')
    }
    setConverting(false)
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">🖼️ JPG to PDF</h1>
          <p className="text-xs text-gray-400">Convert images to PDF on Base</p>
        </div>
        {isConnected ? (
          <div className="text-right">
            <div className="text-xs text-green-400">● Connected</div>
            <div className="text-xs text-gray-400 font-mono">
              {address?.slice(0,6)}...{address?.slice(-4)}
            </div>
            <button onClick={() => disconnect()} className="text-xs text-red-400 mt-1">Disconnect</button>
          </div>
        ) : (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg"
          >
            Connect Wallet
          </button>
        )}
      </div>

      <div className="bg-gray-800 rounded-2xl p-5 mb-4">
        <p className="text-sm font-medium mb-3">1. Upload your image</p>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl py-6 text-center text-gray-400 hover:text-blue-400 transition-all"
        >
          {imageFile ? (
            <span className="text-green-400">✅ {imageFile.name}</span>
          ) : (
            <span>📂 Tap to upload JPG or PNG</span>
          )}
        </button>
        {imagePreview && (
          <img src={imagePreview} alt="preview" className="mt-3 rounded-xl w-full object-contain max-h-48" />
        )}
      </div>

      {imageFile && (
        <div className="bg-gray-800 rounded-2xl p-5 mb-4">
          <p className="text-sm font-medium mb-3">2. Convert & Download</p>
          <button
            onClick={handleConvert}
            disabled={converting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold mb-3"
          >
            {converting ? '⏳ Converting...' : '🔄 Convert to PDF'}
          </button>
          {status && (
            <div className="text-xs text-center py-2 bg-gray-700 rounded-lg">{status}</div>
          )}
        </div>
      )}
    </div>
  )
}