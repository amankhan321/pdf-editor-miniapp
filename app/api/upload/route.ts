import { v2 as cloudinary } from 'cloudinary'
import { NextRequest, NextResponse } from 'next/server'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const { pdfBase64, filename } = await request.json()
    
    const result = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${pdfBase64}`,
      {
        resource_type: 'raw',
        public_id: filename,
        format: 'pdf',
      }
    )
    
    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}