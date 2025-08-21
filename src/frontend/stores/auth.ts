import { defineStore } from 'pinia'
import type { Ed25519KeyIdentity } from '@dfinity/identity'
import { canisterService, type User } from '@/services/CanisterService'
import { WalletRegistry } from '@/services/wallets/WalletRegistry'
import { CrossChainSeedService } from '@/services/CrossChainSeedService'
import type { WalletType } from '@/services/wallets/types'

let identity: Ed25519KeyIdentity | null = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    registered: false,
    player: null as unknown as any,
    userProfile: null as User | null,
    principal: '',
    evmAddress: '',
    solAddress: '',
    btcAddress: '',
    nativeWallet: '',
    canisterInitialized: false,
  }),
  
  actions: {
    getIdentity() {
      return identity
    },

    isAuthenticated() {
      return this.authenticated
    },

    isRegistered() {
      return this.registered
    },

    async login(walletType: WalletType) {
      try {
        // 1. Get wallet adapter
        const adapter = WalletRegistry.getAdapter(walletType)
        
        // 2. Authenticate with wallet (gets all cross-chain addresses)
        const authResult = await adapter.authenticate()
        
        // 3. Generate seed and identity
        const seed = authResult.signature 
          ? await CrossChainSeedService.fromSignature(authResult.signature)
          : await CrossChainSeedService.fromPrincipal(authResult.principal)
        
        identity = await CrossChainSeedService.toIdentity(seed)
        
        // 4. Initialize canister service
        if (walletType === 'plug') {
          // Use Plug's native agent for canister calls
          await canisterService.initializeWithPlug()
        } else {
          // Use generated identity for other wallets
          await canisterService.initialize(identity)
        }
        this.canisterInitialized = true
        
        // 5. Check if user exists in database
        const existingProfile = await canisterService.getMyProfile()
        
        if (existingProfile) {
          // User exists, load their profile
          this.userProfile = existingProfile
          this.registered = true
          this.authenticated = true
          
          // Update auth state
          this.principal = authResult.principal
          this.evmAddress = authResult.evmAddress || ''
          this.solAddress = authResult.solAddress || ''
          this.btcAddress = authResult.btcAddress || ''
          this.nativeWallet = authResult.nativeWallet
          
          // Legacy player object for compatibility
          this.player = {
            username: existingProfile.username,
            displayName: existingProfile.display_name.length > 0 ? existingProfile.display_name[0] : null,
            avatarPreset: 1, // Default avatar preset
            avatarUrl: existingProfile.avatar_url.length > 0 ? existingProfile.avatar_url[0] : null,
            bannerUrl: null, // Not available in new User type
            ethAddress: authResult.evmAddress,
            principal: authResult.principal,
            walletType: authResult.nativeWallet,
          }
          
          this.saveStateToLocalStorage()
          return { existing: true, profile: existingProfile }
        } else {
          // New user, needs registration
          this.authenticated = true
          this.registered = false
          this.userProfile = null
          
          this.principal = authResult.principal
          this.evmAddress = authResult.evmAddress || ''
          this.solAddress = authResult.solAddress || ''
          this.btcAddress = authResult.btcAddress || ''
          this.nativeWallet = authResult.nativeWallet
          
          this.saveStateToLocalStorage()
          return { existing: false, profile: null }
        }
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },

    async recover(mnemonic: string) {
      try {
        // 1. Recover all addresses from mnemonic
        const recovered = await CrossChainSeedService.fromMnemonic(mnemonic)
        
        // 2. Set identity
        identity = recovered.identity
        
        // 3. Initialize canister service
        await canisterService.initialize(identity)
        this.canisterInitialized = true
        
        // 4. Check if user exists
        const existingProfile = await canisterService.getMyProfile()
        
        if (existingProfile) {
          this.userProfile = existingProfile
          this.registered = true
          this.authenticated = true
          
          this.principal = recovered.principal
          this.evmAddress = recovered.evmAddress
          this.solAddress = recovered.solAddress
          this.nativeWallet = 'recovered'
          
          // Legacy player object
          this.player = {
            username: existingProfile.username,
            displayName: existingProfile.displayName.length > 0 ? existingProfile.displayName[0] : null,
            avatarPreset: existingProfile.assets?.avatarPreset.length > 0
              ? Number(existingProfile.assets.avatarPreset[0])
              : 1,
            avatarUrl: existingProfile.assets?.avatarUrl.length > 0 ? existingProfile.assets.avatarUrl[0] : null,
            bannerUrl: existingProfile.assets?.bannerUrl.length > 0 ? existingProfile.assets.bannerUrl[0] : null,
            ethAddress: recovered.evmAddress,
            principal: recovered.principal,
            walletType: 'recovered',
          }
          
          this.saveStateToLocalStorage()
          return { existing: true, profile: existingProfile }
        } else {
          throw new Error('No user found with this mnemonic')
        }
      } catch (error) {
        console.error('Recovery failed:', error)
        throw error
      }
    },

    async completeRegistration(profile: User) {
      this.userProfile = profile
      this.registered = true

      // Update legacy player object
      this.player = {
        username: profile.username,
        displayName: profile.display_name.length > 0 ? profile.display_name[0] : null,
        avatarPreset: 1, // Default avatar preset
        avatarUrl: profile.avatar_url.length > 0 ? profile.avatar_url[0] : null,
        bannerUrl: null, // Not available in new User type
        ethAddress: this.evmAddress,
        principal: this.principal,
        walletType: this.nativeWallet,
      }

      this.saveStateToLocalStorage()
    },

    async logout() {
      localStorage.removeItem('authStore')
      identity = null
      this.authenticated = false
      this.registered = false
      this.userProfile = null
      this.canisterInitialized = false
      this.$reset()
      window.location.href = '/'
    },

    saveStateToLocalStorage() {
      const replacer = (key: string, value: unknown) => {
        if (typeof value === 'bigint') {
          return value.toString()
        }
        return value
      }
      const serializedState = JSON.stringify(this.$state, replacer)
      localStorage.setItem('authStore', serializedState)
    },

    async loadStateFromLocalStorage() {
      const stored = localStorage.getItem('authStore')
      if (stored) {
        try {
          const parsed = JSON.parse(stored, (key: string, value: unknown) => {
            if (typeof value === 'string' && /^\d+$/.test(value)) {
              try {
                return BigInt(value)
              } catch {
                return value
              }
            }
            return value
          })
          
          this.$patch(parsed)
          
          // Try to restore identity if we have a principal
          if (parsed.principal) {
            try {
              // For now, we can't fully restore without the original seed/mnemonic
              // This would need to be enhanced to store the mnemonic securely
              console.warn('Cannot fully restore session without mnemonic')
              return false
            } catch {
              this.$reset()
              localStorage.removeItem('authStore')
              return false
            }
          }
          
          return true
        } catch {
          this.$reset()
          localStorage.removeItem('authStore')
          return false
        }
      }
      return false
    },
  },
})

export default useAuthStore
