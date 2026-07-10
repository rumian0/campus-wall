import { WallFeed } from '@/components/post/WallFeed'

export const dynamic = 'force-dynamic'

export default function CampusWallPage() {
  return <WallFeed wallType="campus" />
}
