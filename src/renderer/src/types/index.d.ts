import type { Store } from 'pinia'

export interface LocalizedString {
  [key: string]: string;
}



export interface User {
    userId?: number;
    email: string;
    username: string;
    roleId: number;
    birthday?: Date;
    bio?: string;
    profilePictureUrl?: string;
    hash?: string;
    token?: string;
}

export interface AuthState {
  token: string;
  isLoggedIn: boolean;
  error?: string;
}

export interface GameType {
    game_type_id: number;
    name: string;
}
  
export interface Game {
    game_id: number;
    name: LocalizedString;
    description?: LocalizedString;
    price: object;
    banner_url?: string;
    release_date: Date;
    developer_id: number;
    game_type_id: number;
    game_type: GameType;
    game_Path: string;
    isInstalled?: boolean;
}

export interface Achievement {
  id: number
  achievement_code: string
  name: {
    en: string
    es: string
  }
  description: {
    en: string
    es: string
  }
  unlock_requirement: number
  type: string
  secret: boolean
  gameId: number
  icon_url?: string
  progress?: number
}

export interface AchievementStoreState {
  inspectedGame: Partial<Game>
  achievements: Achievement[]
  loading: boolean
}

export type AchievementStore = AchievementStoreState & {
  fetchAchievements(gameId: number, auth: { token: string }): Promise<void>
  updateAchievements(auth: { token: string }): Promise<{ message: string, error: string }>
  fetchUserProgress(gameId: number, auth: { token: string }): Promise<any>
}

export interface UserUpdateRequest {
  username: string;
  email: string;
  birthday?: string;
  bio?: string;
  profile_picture_url?: string;
}

export interface PasswordUpdateRequest {
  oldpass: string;
  pass: string;
}

export interface SubscriptionState {
  subscriptions: Subscription[]
  loading: boolean
  error: string | null
}

export interface Subscription {
  subscription_id: number
  user_id: number
  plan_id: number
  is_active: number
  active_until: Date
}

export interface SubscriptionResponse {
  subscription: Subscription | Subscription[]
  message?: string
}

export interface AuthToken {
  token: string
}

export interface PaymentState {
  token: string;
  hostUrl: string;
  transactionUrl: string | null;
  orderId: string;
  sessionId: string;
  discount: number;
  totalPrice: number;
  order: number[];
  orderResult: Record<string, any>;
  discount_code: string;
  isCodeValid: boolean;
  isCodeInvalid: boolean;
  loading: boolean;
  error: string | null;
}

export interface WishlistItem {
  user_id: number;
  game_game_id: number;
}

export interface Developer {
  developer_id: number
  name: string
  web_url?: string
  picture_url?: string
  banner_url?: string
  description?: Record<string, string>
}

export interface Auth {
  token: string
  isLoggedIn: boolean
}
