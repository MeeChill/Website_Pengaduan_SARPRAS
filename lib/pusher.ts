import Pusher from 'pusher'

const hasPusherKeys = 
  process.env.PUSHER_APP_ID && 
  process.env.NEXT_PUBLIC_PUSHER_KEY && 
  process.env.PUSHER_SECRET && 
  process.env.NEXT_PUBLIC_PUSHER_CLUSTER

// Initialize Pusher only if all keys are provided to prevent runtime errors
export const pusherServer = hasPusherKeys
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    })
  : null
