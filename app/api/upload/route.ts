import { v2 as cloudinary } from 'cloudinary'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL,
    })

    const { pdfBase64, filename } = await request.json()
    
    const result = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${pdfBase64}`,
      {
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      }
    )
    
    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    console.error('Cloudinary error:', error)
    return NextResponse.json({ 
      error: 'Upload failed',
      details: String(error)
    }, { status: 500 })
  }
}