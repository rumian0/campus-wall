import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { uploadMultipleToS3 } from '@/lib/image'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll('file') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: '请选择图片' }, { status: 400 })
    }

    const results = await uploadMultipleToS3(files)
    return NextResponse.json({ data: results })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '上传失败' },
      { status: 500 },
    )
  }
}
