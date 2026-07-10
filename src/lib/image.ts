/**
 * Cloudflare Images 上传处理
 * 上传图片到 Cloudflare Images API，返回可直接使用的 URL
 * Cloudflare 自动处理 WebP 转换、多尺寸适配和 CDN 缓存
 */

const CF_API = 'https://api.cloudflare.com/client/v4/accounts'

export interface UploadResult {
  url: string
  id: string
  filename: string
  width: number
  height: number
}

export async function uploadToCloudflareImages(
  file: File,
): Promise<UploadResult> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_IMAGES_TOKEN

  if (!accountId || !apiToken) {
    throw new Error('Cloudflare Images 未配置')
  }

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${CF_API}/${accountId}/images/v1`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiToken}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Cloudflare Images 上传失败: ${err}`)
  }

  const data = await res.json()
  const result = data.result

  return {
    url: result.variants[0] ?? result.url,
    id: result.id,
    filename: result.filename,
    width: result.meta?.width ?? 0,
    height: result.meta?.height ?? 0,
  }
}

export async function uploadMultipleToCloudflare(
  files: File[],
): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  for (const file of files) {
    const result = await uploadToCloudflareImages(file)
    results.push(result)
  }
  return results
}
