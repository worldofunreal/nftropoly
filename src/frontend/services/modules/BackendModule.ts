import { Principal } from '@dfinity/principal'
import type { 
  _SERVICE as BackendService,
  User,
  UserResult,
  UserUpdate,
  CompactProfile,
  PersonalUser,
  Error as BackendError
} from '../../../declarations/backend/backend.did'

export class BackendModule {
  constructor(private backendActor: BackendService) {}

  // User Management Methods
  async signup(
    username: string,
    evmAddress?: string,
    bitcoinAddress?: string,
    solanaAddress?: string
  ): Promise<UserResult> {
    return await this.backendActor.signup(
      username,
      evmAddress ? [evmAddress] : [],
      bitcoinAddress ? [bitcoinAddress] : [],
      solanaAddress ? [solanaAddress] : []
    )
  }

  async getUser(principal: Principal): Promise<UserResult> {
    return await this.backendActor.get_user(principal)
  }

  async getUserByUsername(username: string): Promise<UserResult> {
    return await this.backendActor.get_user_by_username(username)
  }

  async updateProfile(update: UserUpdate): Promise<UserResult> {
    return await this.backendActor.update_profile(update)
  }

  async updateDisplayName(displayName: string): Promise<UserResult> {
    return await this.backendActor.update_display_name(displayName)
  }

  async updateBio(bio: string): Promise<UserResult> {
    return await this.backendActor.update_bio(bio)
  }

  async updateAvatar(avatarUrl: string): Promise<UserResult> {
    return await this.backendActor.update_avatar(avatarUrl)
  }

  async updateBanner(bannerUrl: string): Promise<UserResult> {
    return await this.backendActor.update_banner(bannerUrl)
  }

  async updateLocation(location: string): Promise<UserResult> {
    return await this.backendActor.update_location(location)
  }

  async updateWebsite(website: string): Promise<UserResult> {
    return await this.backendActor.update_website(website)
  }

  async updateEvmAddress(evmAddress: string): Promise<UserResult> {
    return await this.backendActor.update_evm_address(evmAddress)
  }

  async updateBitcoinAddress(bitcoinAddress: string): Promise<UserResult> {
    return await this.backendActor.update_bitcoin_address(bitcoinAddress)
  }

  async updateSolanaAddress(solanaAddress: string): Promise<UserResult> {
    return await this.backendActor.update_solana_address(solanaAddress)
  }

  async deleteAccount(): Promise<{ Ok: null } | { Err: BackendError }> {
    return await this.backendActor.delete_account()
  }

  // Search and Discovery
  async searchUsers(query: string, limit: number): Promise<{ Ok: CompactProfile[] } | { Err: BackendError }> {
    return await this.backendActor.search_users(query, limit)
  }

  async searchUsersPersonal(
    query: string, 
    limit: number, 
    caller: Principal
  ): Promise<{ Ok: CompactProfile[] } | { Err: BackendError }> {
    return await this.backendActor.search_users_personal(query, limit, caller)
  }

  async getUserPersonal(
    target: Principal, 
    caller: Principal
  ): Promise<{ Ok: PersonalUser } | { Err: BackendError }> {
    return await this.backendActor.get_user_personal(target, caller)
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    return await this.backendActor.is_username_available(username)
  }

  async getUserCount(): Promise<bigint> {
    return await this.backendActor.get_user_count()
  }

  async getAllUsernames(): Promise<string[]> {
    return await this.backendActor.get_all_usernames()
  }

  // Following/Followers
  async followUser(target: Principal): Promise<UserResult> {
    return await this.backendActor.follow_user(target)
  }

  async unfollowUser(target: Principal): Promise<UserResult> {
    return await this.backendActor.unfollow_user(target)
  }

  async getFollowing(user: Principal): Promise<CompactProfile[]> {
    return await this.backendActor.get_following(user)
  }

  async getFollowers(user: Principal): Promise<CompactProfile[]> {
    return await this.backendActor.get_followers(user)
  }

  async isFollowing(follower: Principal, following: Principal): Promise<boolean> {
    return await this.backendActor.is_following(follower, following)
  }

  // Asset Upload Methods
  async initUpload(
    filePath: string,
    fileSize: bigint,
    chunkSize?: bigint,
    fileHash?: string
  ): Promise<{ Ok: null } | { Err: BackendError }> {
    return await this.backendActor.init_upload(
      filePath,
      fileSize,
      chunkSize ? [chunkSize] : [],
      fileHash || ''
    )
  }

  async storeChunk(
    chunkId: bigint,
    chunkData: number[],
    filePath: string
  ): Promise<{ Ok: null } | { Err: BackendError }> {
    return await this.backendActor.store_chunk(chunkId, chunkData, filePath)
  }

  async finalizeUpload(filePath: string): Promise<{ Ok: string } | { Err: BackendError }> {
    return await this.backendActor.finalize_upload(filePath)
  }

  // NFT Minting Methods
  async mintOnBehalf(
    tokenName: string,
    tokenDescription?: string,
    tokenImageUrl?: string,
    tokenAttributes?: Array<[string, string]>,
    mintPrice: bigint = 10000000000n // 100 tokens with 8 decimals
  ): Promise<{ Ok: bigint } | { Err: BackendError }> {
    return await this.backendActor.mint_on_behalf(
      tokenName,
      tokenDescription ? [tokenDescription] : [],
      tokenImageUrl ? [tokenImageUrl] : [],
      tokenAttributes ? [tokenAttributes] : [],
      mintPrice
    )
  }

  async faucetTokens(amount: bigint = 100000000000n): Promise<{ Ok: null } | { Err: BackendError }> {
    return await this.backendActor.faucet_tokens(amount)
  }

  // Helper methods
  handleUserResult(result: UserResult): User {
    if ('Ok' in result) {
      return result.Ok
    } else {
      throw new Error(`Backend error: ${JSON.stringify(result.Err)}`)
    }
  }
}
