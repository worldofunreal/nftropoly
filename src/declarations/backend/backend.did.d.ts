import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CompactProfile {
  'id' : Principal,
  'bio' : [] | [string],
  'username' : string,
  'avatar_url' : [] | [string],
  'is_following_me' : boolean,
  'display_name' : [] | [string],
  'am_following_them' : boolean,
  'is_verified' : boolean,
}
export type Error = { 'InvalidInput' : string } |
  { 'UsernameTaken' : null } |
  { 'Unauthorized' : null } |
  { 'InternalError' : string } |
  { 'UserNotFound' : null };
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<[string, string]>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<[string, string]>,
  'status_code' : number,
}
export interface PersonalUser {
  'id' : Principal,
  'bio' : [] | [string],
  'updated_at' : bigint,
  'username' : string,
  'evm_address' : [] | [string],
  'bitcoin_address' : [] | [string],
  'banner_url' : [] | [string],
  'avatar_url' : [] | [string],
  'following_count' : number,
  'is_following_me' : boolean,
  'created_at' : bigint,
  'website' : [] | [string],
  'display_name' : [] | [string],
  'am_following_them' : boolean,
  'is_verified' : boolean,
  'solana_address' : [] | [string],
  'followers_count' : number,
  'location' : [] | [string],
}
export interface User {
  'id' : Principal,
  'bio' : [] | [string],
  'updated_at' : bigint,
  'username' : string,
  'evm_address' : [] | [string],
  'bitcoin_address' : [] | [string],
  'banner_url' : [] | [string],
  'avatar_url' : [] | [string],
  'following_count' : number,
  'created_at' : bigint,
  'website' : [] | [string],
  'display_name' : [] | [string],
  'is_verified' : boolean,
  'solana_address' : [] | [string],
  'followers_count' : number,
  'location' : [] | [string],
}
export type UserResult = { 'Ok' : User } |
  { 'Err' : Error };
export interface UserUpdate {
  'bio' : [] | [string],
  'evm_address' : [] | [string],
  'bitcoin_address' : [] | [string],
  'banner_url' : [] | [string],
  'avatar_url' : [] | [string],
  'website' : [] | [string],
  'display_name' : [] | [string],
  'solana_address' : [] | [string],
  'location' : [] | [string],
}
export interface _SERVICE {
  /**
   * Delete account (requires signed call, owner only)
   */
  'delete_account' : ActorMethod<[], { 'Ok' : null } | { 'Err' : Error }>,
  /**
   * token_name, token_description, token_image_url, token_attributes, mint_price
   */
  'faucet_tokens' : ActorMethod<[bigint], { 'Ok' : null } | { 'Err' : Error }>,
  /**
   * chunk_id, chunk_data, file_path
   */
  'finalize_upload' : ActorMethod<
    [string],
    { 'Ok' : string } |
      { 'Err' : Error }
  >,
  /**
   * Follow/Unfollow functionality
   */
  'follow_user' : ActorMethod<[Principal], UserResult>,
  /**
   * Get all usernames for sitemap generation
   */
  'get_all_usernames' : ActorMethod<[], Array<string>>,
  'get_followers' : ActorMethod<[Principal], Array<CompactProfile>>,
  /**
   * Get following and followers lists
   */
  'get_following' : ActorMethod<[Principal], Array<CompactProfile>>,
  /**
   * username, evm_address, bitcoin_address, solana_address
   * Get user by principal
   */
  'get_user' : ActorMethod<[Principal], UserResult>,
  /**
   * Get user by username
   */
  'get_user_by_username' : ActorMethod<[string], UserResult>,
  /**
   * Get total user count
   */
  'get_user_count' : ActorMethod<[], bigint>,
  /**
   * Personal user lookup with follow state
   */
  'get_user_personal' : ActorMethod<
    [Principal, Principal],
    { 'Ok' : PersonalUser } |
      { 'Err' : Error }
  >,
  /**
   * file_path -> url
   * HTTP request handler for serving assets
   */
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  /**
   * Asset upload functions (requires signed call, registered users only)
   */
  'init_upload' : ActorMethod<
    [string, bigint, [] | [bigint], string],
    { 'Ok' : null } |
      { 'Err' : Error }
  >,
  /**
   * Check if user is following another user
   */
  'is_following' : ActorMethod<[Principal, Principal], boolean>,
  /**
   * Check if username is available
   */
  'is_username_available' : ActorMethod<[string], boolean>,
  /**
   * NFT Minting API (requires signed call, registered users only)
   */
  'mint_on_behalf' : ActorMethod<
    [
      string,
      [] | [string],
      [] | [string],
      [] | [Array<[string, string]>],
      bigint,
    ],
    { 'Ok' : bigint } |
      { 'Err' : Error }
  >,
  /**
   * Search users
   */
  'search_users' : ActorMethod<
    [string, number],
    { 'Ok' : Array<CompactProfile> } |
      { 'Err' : Error }
  >,
  /**
   * Personal search with follow state
   */
  'search_users_personal' : ActorMethod<
    [string, number, Principal],
    { 'Ok' : Array<CompactProfile> } |
      { 'Err' : Error }
  >,
  /**
   * User registration (requires signed call)
   */
  'signup' : ActorMethod<
    [string, [] | [string], [] | [string], [] | [string]],
    UserResult
  >,
  /**
   * file_path, file_size, chunk_size, file_hash
   */
  'store_chunk' : ActorMethod<
    [bigint, Uint8Array | number[], string],
    { 'Ok' : null } |
      { 'Err' : Error }
  >,
  'unfollow_user' : ActorMethod<[Principal], UserResult>,
  'update_avatar' : ActorMethod<[string], UserResult>,
  'update_banner' : ActorMethod<[string], UserResult>,
  'update_bio' : ActorMethod<[string], UserResult>,
  'update_bitcoin_address' : ActorMethod<[string], UserResult>,
  /**
   * Individual field updates (requires signed call, owner only)
   */
  'update_display_name' : ActorMethod<[string], UserResult>,
  'update_evm_address' : ActorMethod<[string], UserResult>,
  'update_location' : ActorMethod<[string], UserResult>,
  /**
   * Update user profile (requires signed call, owner only)
   */
  'update_profile' : ActorMethod<[UserUpdate], UserResult>,
  'update_solana_address' : ActorMethod<[string], UserResult>,
  'update_website' : ActorMethod<[string], UserResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
