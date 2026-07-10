import { WallFeed } from '@/components/post/WallFeed'

export const dynamic = 'force-dynamic'

export default function FriendWallPage() {
  return <WallFeed wallType="friend" />
}
