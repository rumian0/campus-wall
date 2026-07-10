import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
})

const BUCKET = process.env.S3_BUCKET_NAME!
const PREFIX = 'wall'

export interface UploadResult {
  url: string
  id: string
  filename: string
  width: number
  height: number
}

async function getImageDimensions(
  buffer: Buffer,
): Promise<{ width: number; height: number }> {
  try {
    const sharp = (await import('sharp')).default
    const meta = await sharp(buffer).metadata()
    return { width: meta.width ?? 0, height: meta.height ?? 0 }
  } catch {
    return { width: 0, height: 0 }
  }
}

export async function uploadToS3(file: File): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || 'jpg'
  const id = `${crypto.randomUUID()}.${ext}`
  const key = `${PREFIX}/${id}`

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  )

  const { width, height } = await getImageDimensions(buffer)
  const url = `${process.env.S3_PUBLIC_URL}/${key}`

  return { url, id, filename: file.name, width, height }
}

export async function uploadMultipleToS3(
  files: File[],
): Promise<UploadResult[]> {
  return Promise.all(files.map((f) => uploadToS3(f)))
}
