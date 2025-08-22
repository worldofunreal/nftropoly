import { Actor, HttpAgent } from '@dfinity/agent'
import type { Identity } from '@dfinity/agent'
import { idlFactory } from '../../declarations/backend'
import type { _SERVICE as BackendService, User, UserResult, UserUpdate, CompactProfile, UsersResult } from '../../declarations/backend/backend.did'

// Get canister ID from runtime config
const getBackendCanisterId = () => {
  // Get canister ID from environment
  return process.env.CANISTER_ID_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai'
}

// Export types from the backend canister
export type { User, UserResult, UserUpdate, CompactProfile, UsersResult } from '../../declarations/backend/backend.did'

// Helper function to handle UserResult
const handleUserResult = (result: UserResult): User => {
  if ('Ok' in result) {
    return result.Ok
  } else {
    throw new Error(`Backend error: ${JSON.stringify(result.Err)}`)
  }
}

// Helper function to handle UsersResult
const handleUsersResult = (result: UsersResult): User[] => {
  if ('Ok' in result) {
    return result.Ok
  } else {
    throw new Error(`Backend error: ${JSON.stringify(result.Err)}`)
  }
}

class CanisterService {
  private agent: HttpAgent | any = null
  private backendActor: BackendService | null = null
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

      // Create backend actor
      this.backendActor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: getBackendCanisterId(),
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

      // Use Plug's createActor method to create the backend actor
      this.backendActor = await window.ic.plug.createActor({
        canisterId: getBackendCanisterId(),
        interfaceFactory: idlFactory,
      })

      console.log('CanisterService initialized with Plug createActor')
      return true
    } catch (error) {
      console.error('Failed to initialize CanisterService with Plug:', error)
      throw error
    }
  }

  // Check if user exists by querying their profile
  async getMyProfile(): Promise<User | null> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      // Get the caller's principal
      let caller = this.identity?.getPrincipal()
      if (!caller && this.agent) {
        caller = this.agent.getPrincipal()
      }
      if (!caller) {
        throw new Error('No principal available')
      }

      console.log('Calling get_user with principal:', caller.toText())
      const result = await this.backendActor.get_user(caller)
      return handleUserResult(result)
    } catch (error) {
      // If user not found, return null (this is expected for new users)
      if (error instanceof Error && (error.message.includes('UserNotFound') || error.message.includes('{"UserNotFound":null}'))) {
        return null
      }
      
      // Only log actual errors
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  // Sign up a new user
  async signup(
    username: string,
    evmAddress?: string,
    bitcoinAddress?: string,
    solanaAddress?: string
  ): Promise<User> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.signup(
        username,
        evmAddress ? [evmAddress] : [],
        bitcoinAddress ? [bitcoinAddress] : [],
        solanaAddress ? [solanaAddress] : []
      )
      return handleUserResult(result)
    } catch (error) {
      console.error('Error signing up user:', error)
      throw error
    }
  }

  // Check if username is available
  async isUsernameAvailable(username: string): Promise<boolean> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.is_username_available(username)
      return result
    } catch (error) {
      console.error('Error checking username availability:', error)
      throw error
    }
  }

  // Update user profile
  async updateProfile(update: UserUpdate): Promise<User> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.update_profile(update)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Individual update methods
  async updateDisplayName(displayName: string): Promise<User> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.update_display_name(displayName)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error updating display name:', error)
      throw error
    }
  }

  async updateBio(bio: string): Promise<User> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.update_bio(bio)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error updating bio:', error)
      throw error
    }
  }

  async updateAvatar(avatarUrl: string): Promise<User> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.update_avatar(avatarUrl)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error updating avatar:', error)
      throw error
    }
  }

  async updateLocation(location: string): Promise<User> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.update_location(location)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error updating location:', error)
      throw error
    }
  }

  async updateWebsite(website: string): Promise<User> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.update_website(website)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error updating website:', error)
      throw error
    }
  }

  async updateEvmAddress(evmAddress: string): Promise<User> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.update_evm_address(evmAddress)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error updating EVM address:', error)
      throw error
    }
  }

  async updateBitcoinAddress(bitcoinAddress: string): Promise<User> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.update_bitcoin_address(bitcoinAddress)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error updating Bitcoin address:', error)
      throw error
    }
  }

  async updateSolanaAddress(solanaAddress: string): Promise<User> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.update_solana_address(solanaAddress)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error updating Solana address:', error)
      throw error
    }
  }

  // Following/Followers methods
  async followUser(target: string): Promise<User> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const { Principal } = await import('@dfinity/principal')
      const targetPrincipal = Principal.fromText(target)
      const result = await this.backendActor.follow_user(targetPrincipal)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error following user:', error)
      throw error
    }
  }

  async unfollowUser(target: string): Promise<User> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const { Principal } = await import('@dfinity/principal')
      const targetPrincipal = Principal.fromText(target)
      const result = await this.backendActor.unfollow_user(targetPrincipal)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error unfollowing user:', error)
      throw error
    }
  }

  async getFollowing(user: string): Promise<CompactProfile[]> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const { Principal } = await import('@dfinity/principal')
      const userPrincipal = Principal.fromText(user)
      const result = await this.backendActor.get_following(userPrincipal)
      return result
    } catch (error) {
      console.error('Error getting following list:', error)
      throw error
    }
  }

  async getFollowers(user: string): Promise<CompactProfile[]> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const { Principal } = await import('@dfinity/principal')
      const userPrincipal = Principal.fromText(user)
      const result = await this.backendActor.get_followers(userPrincipal)
      return result
    } catch (error) {
      console.error('Error getting followers list:', error)
      throw error
    }
  }

  // Search users
  async searchUsers(searchTerm: string, limit: number = 10): Promise<User[]> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.search_users(searchTerm, limit)
      return handleUsersResult(result)
    } catch (error) {
      console.error('Error searching users:', error)
      throw error
    }
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<User | null> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.get_user_by_username(username)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error getting user by username:', error)
      // If user not found, return null
      if (error instanceof Error && error.message.includes('UserNotFound')) {
        return null
      }
      throw error
    }
  }

  // Get user by principal
  async getUser(principal: string): Promise<User | null> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const { Principal } = await import('@dfinity/principal')
      const userPrincipal = Principal.fromText(principal)
      const result = await this.backendActor.get_user(userPrincipal)
      return handleUserResult(result)
    } catch (error) {
      console.error('Error getting user:', error)
      // If user not found, return null
      if (error instanceof Error && error.message.includes('UserNotFound')) {
        return null
      }
      throw error
    }
  }

  // Get user count
  async getUserCount(): Promise<bigint> {
    if (!this.backendActor) {
      throw new Error('CanisterService not initialized')
    }

    try {
      const result = await this.backendActor.get_user_count()
      return result
    } catch (error) {
      console.error('Error getting user count:', error)
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
