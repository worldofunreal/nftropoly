import { backend } from '$lib/canisters';
import { toastsError, toastsShow } from '$lib/stores/toasts.store';
import { writable, get } from 'svelte/store';

// Types of blockchains supported
export type BlockchainType = 'IC' | 'ETH' | 'SOL' | 'BTC';

// NFT item interface
export interface NFTItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  owner: string;
  blockchain: BlockchainType;
  tokenId?: string;
  collection?: string;
  attributes?: Record<string, string | number | boolean>;
  royalties?: number;
  createdAt: number;
}

// Store for caching NFTs
export const nftStore = writable<{
  items: NFTItem[];
  loading: boolean;
  error: string | null;
}>({
  items: [],
  loading: false,
  error: null
});

/**
 * Fetch NFTs from various chains
 * Currently uses mock data, but will be replaced with actual blockchain calls
 */
export const fetchNFTs = async (blockchain?: BlockchainType): Promise<NFTItem[]> => {
  try {
    nftStore.update(state => ({ ...state, loading: true, error: null }));
    
    // Mock NFTs with NFTropoly collections and Roblox-inspired vibrant theme
    const mockNFTs: NFTItem[] = [
      {
        id: "1",
        name: "Metropoly Skyscraper #1",
        description: "A vibrant skyscraper property from the Metropoly district",
        price: 2.5,
        imageUrl: "https://placehold.co/400x400/4299e1/ffffff?text=Metropoly+Tower",
        owner: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        blockchain: 'IC',
        collection: "NFTropoly Genesis",
        attributes: {
          rarity: 'rare',
          district: 'Metropoly',
          income: 25,
          multiplier: 1.5
        },
        royalties: 5,
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000
      },
      {
        id: "2",
        name: "Tycoon Avatar",
        description: "Limited edition Tycoon avatar with gold accessories",
        price: 1.8,
        imageUrl: "https://placehold.co/400x400/FFD700/000000?text=Tycoon+Avatar",
        owner: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        blockchain: 'IC',
        tokenId: '42',
        collection: 'NFTropoly Avatars',
        attributes: {
          rarity: 'epic',
          type: 'character',
          accessory: 'gold chain',
          hat: 'top hat'
        },
        royalties: 7.5,
        createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000
      },
      {
        id: "3",
        name: "Rainbow Road Property",
        description: "A colorful road property with bonus movement speed",
        price: 3.2,
        imageUrl: "https://placehold.co/400x400/ff3864/ffffff?text=Rainbow+Road",
        owner: "renrk-eyaaa-aaaaa-aaada-cai",
        blockchain: 'IC',
        collection: "NFTropoly Genesis",
        attributes: {
          rarity: 'legendary',
          district: 'Rainbow District',
          income: 35,
          specialEffect: 'speed boost'
        },
        royalties: 5,
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
      },
      {
        id: "4",
        name: "Neon Arcade",
        description: "A futuristic arcade property that generates bonus tokens",
        price: 4.7,
        imageUrl: "https://placehold.co/400x400/00ff9f/000000?text=Neon+Arcade",
        owner: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        blockchain: 'IC',
        collection: "NFTropoly Genesis",
        attributes: {
          rarity: 'epic',
          district: 'Entertainment Zone',
          income: 42,
          specialEffect: 'token generator'
        },
        royalties: 5,
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000
      },
      {
        id: "5",
        name: "Robux Miner Avatar",
        description: "Special character with mining abilities",
        price: 2.9,
        imageUrl: "https://placehold.co/400x400/9d4edd/ffffff?text=Robux+Miner",
        owner: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        blockchain: 'IC',
        collection: "NFTropoly Avatars",
        attributes: {
          rarity: 'rare',
          type: 'character',
          ability: 'mining',
          tool: 'golden pickaxe'
        },
        royalties: 7.5,
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000
      },
      {
        id: "6",
        name: "Candy Factory",
        description: "Sweet property that produces candy resources",
        price: 5.1,
        imageUrl: "https://placehold.co/400x400/ff70a6/ffffff?text=Candy+Factory",
        owner: "renrk-eyaaa-aaaaa-aaada-cai",
        blockchain: 'IC',
        collection: "NFTropoly Genesis",
        attributes: {
          rarity: 'uncommon',
          district: 'Sugar Rush',
          income: 30,
          resource: 'candy'
        },
        royalties: 5,
        createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000
      },
      {
        id: "7",
        name: "Space Explorer",
        description: "Astronaut character with space exploration perks",
        price: 7.5,
        imageUrl: "https://placehold.co/400x400/3a86ff/ffffff?text=Space+Explorer",
        owner: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        blockchain: 'IC',
        collection: "NFTropoly Avatars",
        attributes: {
          rarity: 'mythic',
          type: 'character',
          ability: 'zero gravity',
          accessory: 'oxygen tank'
        },
        royalties: 10,
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000
      },
      {
        id: "8",
        name: "Pixel Bank",
        description: "Financial district property with interest generation",
        price: 6.3,
        imageUrl: "https://placehold.co/400x400/8338ec/ffffff?text=Pixel+Bank",
        owner: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        blockchain: 'IC',
        collection: "NFTropoly Genesis",
        attributes: {
          rarity: 'epic',
          district: 'Financial District',
          income: 50,
          specialEffect: 'interest bonus'
        },
        royalties: 5,
        createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000
      }
    ];
    
    // Filter by blockchain if specified
    const filteredNFTs = blockchain 
      ? mockNFTs.filter(nft => nft.blockchain === blockchain)
      : mockNFTs;
      
    nftStore.update(state => ({ 
      ...state, 
      items: filteredNFTs,
      loading: false 
    }));
    
    return filteredNFTs;
  } catch (error) {
    const errorMessage = `Failed to fetch NFTs: ${error instanceof Error ? error.message : String(error)}`;
    nftStore.update(state => ({ 
      ...state, 
      loading: false, 
      error: errorMessage 
    }));
    
    toastsError({
      msg: { text: 'Failed to fetch NFTs', level: 'error' },
      err: error
    });
    
    return [];
  }
};

/**
 * Purchase an NFT
 * Currently just a mock, will be replaced with actual blockchain transactions
 */
export const purchaseNFT = async (nftId: string): Promise<boolean> => {
  try {
    // Get the NFT to purchase
    const { items } = get(nftStore);
    const nftToPurchase = items.find(nft => nft.id === nftId);
    
    if (!nftToPurchase) {
      throw new Error(`NFT with ID ${nftId} not found`);
    }
    
    // TODO: Implement actual purchase logic based on blockchain type
    // This would call different methods based on the blockchain
    
    // Mock successful purchase
    toastsShow({ 
      text: `Successfully purchased ${nftToPurchase.name} for ${nftToPurchase.price} tokens`, 
      level: 'success' 
    });
    
    return true;
  } catch (error) {
    toastsError({
      msg: { text: 'Failed to purchase NFT', level: 'error' },
      err: error
    });
    
    return false;
  }
};

/**
 * List an NFT for sale
 * Currently just a mock, will be implemented with actual blockchain calls
 */
export const listNFTForSale = async (
  nftData: Omit<NFTItem, 'id' | 'createdAt'> & { id?: string }
): Promise<NFTItem | null> => {
  try {
    // Generate a random ID if none is provided
    const id = nftData.id || Math.random().toString(36).substring(2, 9);
    
    // Create the new NFT with current timestamp
    const newNFT: NFTItem = {
      ...nftData,
      id,
      createdAt: Date.now()
    };
    
    // TODO: Implement actual listing logic based on blockchain type
    
    // Add to the store
    nftStore.update(state => ({
      ...state,
      items: [...state.items, newNFT]
    }));
    
    toastsShow({ 
      text: `Successfully listed ${newNFT.name} for ${newNFT.price} tokens`, 
      level: 'success' 
    });
    
    return newNFT;
  } catch (error) {
    toastsError({
      msg: { text: 'Failed to list NFT for sale', level: 'error' },
      err: error
    });
    
    return null;
  }
};

/**
 * Get NFT details by ID
 */
export const getNFTById = (id: string): NFTItem | undefined => {
  const { items } = get(nftStore);
  return items.find(nft => nft.id === id);
};

/**
 * Get NFTs by owner
 */
export const getNFTsByOwner = (owner: string): NFTItem[] => {
  const { items } = get(nftStore);
  return items.filter(nft => nft.owner === owner);
}; 