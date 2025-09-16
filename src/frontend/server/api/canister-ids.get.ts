export default defineEventHandler(async (event) => {
  // In development, use local canister IDs
  if (process.env.NODE_ENV === 'development') {
    return {
      nftCollection: 'uqqxf-5h777-77774-qaaaa-cai',
      marketplace: 'u6s2n-gx777-77774-qaaba-cai',
      nftropolyToken: 'uzt4z-lp777-77774-qaabq-cai'
    }
  }
  
  // In production, these would come from environment variables or a config service
  return {
    nftCollection: process.env.NFT_COLLECTION_CANISTER_ID || 'uqqxf-5h777-77774-qaaaa-cai',
    marketplace: process.env.MARKETPLACE_CANISTER_ID || 'u6s2n-gx777-77774-qaaba-cai',
    nftropolyToken: process.env.NFTROPOLY_TOKEN_CANISTER_ID || 'uzt4z-lp777-77774-qaabq-cai'
  }
})
