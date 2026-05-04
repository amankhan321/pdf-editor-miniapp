'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import sdk from '@farcaster/miniapp-sdk'

export default function PDFEditor() {
  const [isReady, setIsReady] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [addText, setAddText] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [status, setStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    sdk.actions.ready()
    setIsReady(true)
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfFile(file)
    const bytes = await file.arrayBuffer()
    setPdfBytes(new Uint8Array(bytes))
    setStatus(`Loaded: ${file.name}`)
  }

  const handleAddText = async () => {
    if (!pdfBytes || !addText) return
    setStatus('Adding text...')
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes)
      const pages = pdfDoc.getPages()
      const page = pages[pageNum - 1]
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      page.drawText(addText, {
        x: 50,
        y: page.getHeight() - 100,
        size: 14,
        font,
        color: rgb(0, 0, 0),
      })
      const newBytes = await pdfDoc.save()
      setPdfBytes(newBytes)
      setStatus('Text added! ✅')
    } catch {
      setStatus('Error adding text. Try again.')
    }
  }

  const handleDownload = () => {
    if (!pdfBytes) return
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `edited_${pdfFile?.name || 'document.pdf'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Loading PDF Editor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">📄 PDF Editor</h1>
          <p className="text-xs text-gray-400">Edit PDFs on Base</p>
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
        <p className="text-sm font-medium mb-3">1. Upload your PDF</p>
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl py-6 text-center text-gray-400 hover:text-blue-400 transition-all"
        >
          {pdfFile ? (
            <span className="text-green-400">✅ {pdfFile.name}</span>
          ) : (
            <span>📂 Tap to upload PDF</span>
          )}
        </button>
      </div>

      {pdfBytes && (
        <div className="bg-gray-800 rounded-2xl p-5 mb-4">
          <p className="text-sm font-medium mb-3">2. Edit your PDF</p>
          <label className="text-xs text-gray-400 mb-1 block">Add text to page {pageNum}</label>
          <input
            type="text"
            value={addText}
            onChange={(e) => setAddText(e.target.value)}
            placeholder="Type something..."
            className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-2"
          />
          <div className="flex gap-2 mb-3">
            <label className="text-xs text-gray-400">Page:</label>
            <input
              type="number"
              value={pageNum}
              onChange={(e) => setPageNum(Number(e.target.value))}
              min={1}
              className="w-16 bg-gray-700 rounded px-2 py-1 text-xs text-white"
            />
          </div>
          <button
            onClick={handleAddText}
            disabled={!addText}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium"
          >
            Add Text to PDF
          </button>
          {status && (
            <div className="text-xs text-center py-2 bg-gray-700 rounded-lg mt-3">{status}</div>
          )}
        </div>
      )}

      {pdfBytes && (
        <div className="bg-gray-800 rounded-2xl p-5">
          <p className="text-sm font-medium mb-3">3. Download edited PDF</p>
          <button
            onClick={handleDownload}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-bold"
          >
            ⬇️ Download PDF
          </button>
        </div>
      )}
    </div>
  )
}