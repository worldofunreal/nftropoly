import { Actor, HttpAgent } from '@dfinity/agent'
import type { Identity } from '@dfinity/agent'

// Get canister ID from runtime config
const getDatabaseCanisterId = () => {
  // Get canister ID from environment
  return process.env.CANISTER_ID_DATABASE || 'uxrrr-q7777-77774-qaaaq-cai'
}

// Inline IDL factory for database canister (copied from generated declarations)
const databaseIdlFactory = ({ IDL }: any) => {
  const Time = IDL.Int
  const PortfolioStats = IDL.Record({
    totalValueEth: IDL.Float64,
    totalValueUsd: IDL.Float64,
    tokenPercentage: IDL.Float64,
    lastUpdated: Time,
    nftCount: IDL.Nat,
    nftPercentage: IDL.Float64,
    tokenCount: IDL.Nat,
  })
  const SocialLinks = IDL.Record({
    twitter: IDL.Opt(IDL.Text),
    instagram: IDL.Opt(IDL.Text),
    website: IDL.Opt(IDL.Text),
    discord: IDL.Opt(IDL.Text),
    telegram: IDL.Opt(IDL.Text),
  })
  const ProfileAssets = IDL.Record({
    avatarUrl: IDL.Opt(IDL.Text),
    bannerUrl: IDL.Opt(IDL.Text),
    avatarPreset: IDL.Opt(IDL.Nat),
  })
  const UserExperience = IDL.Record({
    xp: IDL.Nat,
    badges: IDL.Vec(IDL.Text),
    level: IDL.Nat,
    achievements: IDL.Vec(IDL.Text),
  })
  const PrivacySettings = IDL.Record({
    showActivity: IDL.Bool,
    showEmail: IDL.Bool,
    showPortfolio: IDL.Bool,
    profilePublic: IDL.Bool,
  })
  const WalletInfo = IDL.Record({
    ethAddress: IDL.Opt(IDL.Text),
    walletType: IDL.Text,
    connectedAt: Time,
    icpPrincipal: IDL.Text,
  })
  const UserProfile = IDL.Record({
    bio: IDL.Opt(IDL.Text),
    portfolio: PortfolioStats,
    username: IDL.Text,
    totalVolume: IDL.Float64,
    displayName: IDL.Opt(IDL.Text),
    socialLinks: SocialLinks,
    followersCount: IDL.Nat,
    lastActiveAt: Time,
    email: IDL.Opt(IDL.Text),
    followingCount: IDL.Nat,
    wallet: WalletInfo,
    totalTransactions: IDL.Nat,
    privacy: PrivacySettings,
    assets: ProfileAssets,
    createdAt: Time,
    experience: UserExperience,
    location: IDL.Opt(IDL.Text),
    isVerified: IDL.Bool,
  })
  const UserSearchResult = IDL.Record({
    principal: IDL.Principal,
    username: IDL.Text,
    displayName: IDL.Opt(IDL.Text),
    followersCount: IDL.Nat,
    avatarUrl: IDL.Opt(IDL.Text),
    isVerified: IDL.Bool,
    avatarPreset: IDL.Opt(IDL.Nat),
  })
  const RegistrationData = IDL.Record({
    bio: IDL.Opt(IDL.Text),
    displayName: IDL.Opt(IDL.Text),
    socialLinks: SocialLinks,
    walletType: IDL.Text,
    email: IDL.Opt(IDL.Text),
    privacy: PrivacySettings,
    avatarPreset: IDL.Opt(IDL.Nat),
    username: IDL.Text,
    ethAddress: IDL.Opt(IDL.Text),
  })
  const ApiError = IDL.Variant({
    UserAlreadyExists: IDL.Null,
    InvalidInput: IDL.Text,
    Unauthorized: IDL.Null,
    RateLimited: IDL.Null,
    InternalError: IDL.Text,
    AssetUploadFailed: IDL.Text,
    UserNotFound: IDL.Null,
  })
  const ApiResult = IDL.Variant({ ok: UserProfile, err: ApiError })
  const Result = IDL.Variant({ ok: UserProfile, err: IDL.Text })
  return IDL.Service({
    getMyProfile: IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    getUser: IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    getUserByUsername: IDL.Func([IDL.Text], [IDL.Opt(UserProfile)], ['query']),
    getUserCount: IDL.Func([], [IDL.Nat], ['query']),
    getUserProfile: IDL.Func(
      [IDL.Principal],
      [IDL.Opt(UserProfile)],
      ['query']
    ),
    getVerifiedUsers: IDL.Func(
      [IDL.Nat],
      [IDL.Vec(UserSearchResult)],
      ['query']
    ),
    isUsernameAvailable: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    registerUser: IDL.Func([RegistrationData], [ApiResult], []),
    searchUsers: IDL.Func(
      [IDL.Text, IDL.Nat],
      [IDL.Vec(UserSearchResult)],
      ['query']
    ),
    signup: IDL.Func([IDL.Text], [Result], []),
    updatePortfolioStats: IDL.Func(
      [IDL.Float64, IDL.Float64, IDL.Nat, IDL.Nat],
      ['query']
    ),
    updateProfile: IDL.Func(
      [
        IDL.Record({
          bio: IDL.Opt(IDL.Text),
          displayName: IDL.Opt(IDL.Text),
          socialLinks: IDL.Opt(SocialLinks),
          email: IDL.Opt(IDL.Text),
          privacy: IDL.Opt(PrivacySettings),
          avatarUrl: IDL.Opt(IDL.Text),
          bannerUrl: IDL.Opt(IDL.Text),
          avatarPreset: IDL.Opt(IDL.Nat),
          location: IDL.Opt(IDL.Text),
        }),
      ],
      [ApiResult],
      []
    ),
  })
}

// Types from the canister interface
export interface UserProfile {
  bio: [] | [string]
  portfolio: PortfolioStats
  username: string
  totalVolume: number
  displayName: [] | [string]
  socialLinks: SocialLinks
  followersCount: bigint
  lastActiveAt: bigint
  email: [] | [string]
  followingCount: bigint
  wallet: WalletInfo
  totalTransactions: bigint
  privacy: PrivacySettings
  assets: ProfileAssets
  createdAt: bigint
  experience: UserExperience
  location: [] | [string]
  isVerified: boolean
}

export interface PortfolioStats {
  totalValueEth: number
  totalValueUsd: number
  tokenPercentage: number
  lastUpdated: bigint
  nftCount: bigint
  nftPercentage: number
  tokenCount: bigint
}

export interface SocialLinks {
  twitter: [] | [string]
  instagram: [] | [string]
  website: [] | [string]
  discord: [] | [string]
  telegram: [] | [string]
}

export interface ProfileAssets {
  avatarUrl: [] | [string]
  bannerUrl: [] | [string]
  avatarPreset: [] | [bigint]
}

export interface UserExperience {
  xp: bigint
  badges: string[]
  level: bigint
  achievements: string[]
}

export interface PrivacySettings {
  showActivity: boolean
  showEmail: boolean
  showPortfolio: boolean
  profilePublic: boolean
}

export interface WalletInfo {
  ethAddress: [] | [string]
  walletType: string
  connectedAt: bigint
  icpPrincipal: string
}

export interface RegistrationData {
  bio: [] | [string]
  displayName: [] | [string]
  socialLinks: SocialLinks
  walletType: string
  email: [] | [string]
  privacy: PrivacySettings
  avatarPreset: [] | [bigint]
  username: string
  ethAddress: [] | [string]
}

export interface ApiError {
  UserAlreadyExists?: null
  InvalidInput?: string
  Unauthorized?: null
  RateLimited?: null
  InternalError?: string
  AssetUploadFailed?: string
  UserNotFound?: null
}

export type ApiResult<T> = { ok: T } | { err: ApiError }

class CanisterService {
  private agent: HttpAgent | any = null
  private databaseActor: any = null
  private identity: Identity | null = null

  // Initialize the service with an identity
  async initialize(identity?: Identity) {
    try {
      this.identity = identity || null

      // Create HTTP agent with proper configuration
      this.agent = new HttpAgent({
        host: process.env.NODE_ENV === 'development' 
          ? 'http://127.0.0.1:4943'  // Use 127.0.0.1:4943 for local development
          : 'https://ic0.app',
        identity: this.identity || undefined,
      })

      // Fetch root key for local development
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching root key for local development...')
        await this.agent.fetchRootKey()
      }

      // Create database actor
      this.databaseActor = Actor.createActor(databaseIdlFactory, {
        agent: this.agent,
        canisterId: getDatabaseCanisterId(),
      })

      console.log('CanisterService initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize CanisterService:', error)
      throw error
    }
  }

  // Initialize the service with Plug's createActor method
  async initializeWithPlug() {
    try {
      // Check if Plug is available and connected
      if (!window.ic?.plug?.createActor) {
        throw new Error('Plug createActor not available')
      }

      // Debug: Check what agent Plug is using
      if (window.ic?.plug?.agent) {
        console.log('Plug agent host:', window.ic.plug.agent._host)
        console.log('Plug agent identity:', window.ic.plug.agent._identity)
      }

      // Use Plug's createActor method to create the database actor
      this.databaseActor = await window.ic.plug.createActor({
        canisterId: getDatabaseCanisterId(),
        interfaceFactory: databaseIdlFactory,
      })

      console.log('CanisterService initialized with Plug createActor')
      return true
    } catch (error) {
      console.error('Failed to initialize CanisterService with Plug:', error)
      throw error
    }
  }

  // Check if user exists by querying their profile
  async getMyProfile(): Promise<UserProfile | null> {
    if (!this.databaseActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.databaseActor.getMyProfile()
      return result.length > 0 ? result[0] : null
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  // Register a new user
  async registerUser(data: RegistrationData): Promise<ApiResult<UserProfile>> {
    if (!this.databaseActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.databaseActor.registerUser(data)
      return result
    } catch (error) {
      console.error('Error registering user:', error)
      throw error
    }
  }

  // Check if username is available
  async isUsernameAvailable(username: string): Promise<boolean> {
    if (!this.databaseActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.databaseActor.isUsernameAvailable(username)
      return result
    } catch (error) {
      console.error('Error checking username availability:', error)
      throw error
    }
  }

  // Update user profile
  async updateProfile(update: any): Promise<ApiResult<UserProfile>> {
    if (!this.databaseActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.databaseActor.updateProfile(update)
      return result
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Search users
  async searchUsers(searchTerm: string, limit: number = 10): Promise<any[]> {
    if (!this.databaseActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.databaseActor.searchUsers(searchTerm, limit)
      return result
    } catch (error) {
      console.error('Error searching users:', error)
      throw error
    }
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<UserProfile | null> {
    if (!this.databaseActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.databaseActor.getUserByUsername(username)
      return result.length > 0 ? result[0] : null
    } catch (error) {
      console.error('Error getting user by username:', error)
      throw error
    }
  }

  // Update identity (for when user switches wallets)
  async updateIdentity(identity: Identity) {
    this.identity = identity
    await this.initialize(identity)
  }
}

// Export a singleton instance
export const canisterService = new CanisterService()
export default canisterService
