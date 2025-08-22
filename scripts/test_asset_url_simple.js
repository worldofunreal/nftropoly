// Simple test for asset URL construction
const getBackendCanisterId = () => {
  return '3z2ve-waaaa-aaaab-qacmq-cai'
}

const getAssetUrl = (filePath) => {
  const backendCanisterId = getBackendCanisterId()
  const host = 'https://icp0.io'
  return `${host}/?canisterId=${backendCanisterId}&id=${backendCanisterId}${filePath}`
}

// Test asset URL construction
console.log('🧪 Testing Asset URL Construction\n')

// Test with a sample file path
const filePath = '/assets/avatar/test-user.webp'
const assetUrl = getAssetUrl(filePath)

console.log(`File path: ${filePath}`)
console.log(`Generated URL: ${assetUrl}`)

// Expected format for mainnet
const expectedUrl = `https://icp0.io/?canisterId=3z2ve-waaaa-aaaab-qacmq-cai&id=3z2ve-waaaa-aaaab-qacmq-cai${filePath}`

console.log(`Expected URL: ${expectedUrl}`)
console.log(`URLs match: ${assetUrl === expectedUrl ? '✅' : '❌'}`)

// Test with different file paths
const testPaths = [
  '/assets/banner/test-banner.webp',
  '/assets/avatar/user123.png',
  '/assets/avatar/user456.jpg'
]

console.log('\n📋 Testing multiple paths:')
testPaths.forEach(path => {
  const url = getAssetUrl(path)
  console.log(`${path} -> ${url}`)
})
