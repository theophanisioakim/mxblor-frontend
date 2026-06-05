import { Dimensions } from 'react-native'
import type { ChannelId } from './channel'

const TABLET_MIN_DP = 600

export type { ChannelId } from './channel'

export const getChannelId = (): ChannelId => {
  const { width, height } = Dimensions.get('screen')
  return Math.min(width, height) >= TABLET_MIN_DP ? 'CHANNEL_TABLET' : 'CHANNEL_MOBILE'
}
