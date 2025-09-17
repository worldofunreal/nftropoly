export default defineEventHandler(async _event => {
  // Try to read from canister_ids.json first (for local development)
  let canisterIds: Record<string, string> = {}

  try {
    const fs = await import('fs')
    const path = await import('path')
    const canisterIdsPath = path.join(process.cwd(), 'canister_ids.json')

    if (fs.existsSync(canisterIdsPath)) {
      const canisterIdsFile = fs.readFileSync(canisterIdsPath, 'utf-8')
      const parsed = JSON.parse(canisterIdsFile)

      // Map dfx canister names to our frontend names
      canisterIds = {
        nftCollection: parsed.nft_collection?.local || parsed.nftCollection?.local,
        marketplace: parsed.marketplace?.local || parsed.marketplace?.local,
        nftropolyToken: parsed.nftropoly_token?.local || parsed.nftropolyToken?.local,
        backend: parsed.backend?.local || parsed.backend?.local,
      }
    }
  } catch (error) {
    console.warn('Failed to read canister_ids.json:', error)
  }

  // Fallback to environment variables or hardcoded values
  const defaultIds = {
    nftCollection:
      process.env.NFT_COLLECTION_CANISTER_ID || 'u6s2n-gx777-77774-qaaba-cai', // NFT collection
    marketplace:
      process.env.MARKETPLACE_CANISTER_ID || 'uzt4z-lp777-77774-qaabq-cai', // Marketplace
    nftropolyToken:
      process.env.NFTROPOLY_TOKEN_CANISTER_ID || 'umunu-kh777-77774-qaaca-cai', // Token canister
    backend: process.env.BACKEND_CANISTER_ID || 'uqqxf-5h777-77774-qaaaa-cai', // Backend
  }

  // Merge with defaults, prioritizing canister_ids.json
  const result = {
    nftCollection: canisterIds.nftCollection || defaultIds.nftCollection,
    marketplace: canisterIds.marketplace || defaultIds.marketplace,
    nftropolyToken: canisterIds.nftropolyToken || defaultIds.nftropolyToken,
    backend: canisterIds.backend || defaultIds.backend,
  }

  // Add metadata about the source
  return {
    ...result,
    _meta: {
      source: canisterIds.nftCollection
        ? 'canister_ids.json'
        : 'environment/defaults',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
  }
})
