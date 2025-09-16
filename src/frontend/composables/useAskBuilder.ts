import { ref, computed } from 'vue'
import type { 
  AskFeature, 
  TokenSpec, 
  Account,
  AuctionFeature,
  DutchAuctionFeature,
  AMMFeature,
  EndingType,
  BuyNowReq
} from '../../declarations/marketplace/marketplace.did'
import { textToPrincipal, parseTokenAmount } from '~/utils/marketplace'

export interface AskBuilderState {
  // Basic ask info
  askType: 'buynow' | 'auction' | 'dutch' | 'amm'
  
  // Token being sold
  askToken: {
    canisterId: string
    tokenId?: bigint
    symbol: string
  } | null
  
  // Payment token
  paymentToken: {
    canisterId: string
    symbol: string
    decimals: number
  } | null
  
  // BuyNow specific
  buyNowPrice: string
  
  // Auction specific
  auction: {
    startPrice: string
    reservePrice: string
    minIncrease: {
      type: 'amount' | 'percentage'
      value: string
    }
    endDate?: Date
    waitForQuiet?: {
      window: string
      extension: string
      fade: string
      max: string
    }
  }
  
  // Dutch auction specific
  dutch: {
    startPrice: string
    endPrice: string
    timeUnit: 'minute' | 'hour' | 'day'
    timeValue: string
    decayType: 'flat' | 'percent'
    decayValue: string
  }
  
  // AMM specific
  amm: {
    token1: TokenSpec | null
    token2: TokenSpec | null
    max: string
    min: string
    decimals: number
  }
  
  // Common options
  options: {
    ending: EndingType | null
    startDate?: Date
    allowPartial: boolean
    broker?: Account
    allowList: Account[]
    memo?: Uint8Array
    feeAccounts: Array<[string, TokenSpec, Account]>
    bidPaysFees: string[]
  }
}

export const useAskBuilder = () => {
  const state = ref<AskBuilderState>({
    askType: 'buynow',
    askToken: null,
    paymentToken: null,
    buyNowPrice: '',
    auction: {
      startPrice: '',
      reservePrice: '',
      minIncrease: { type: 'amount', value: '' },
      endDate: undefined,
      waitForQuiet: undefined
    },
    dutch: {
      startPrice: '',
      endPrice: '',
      timeUnit: 'hour',
      timeValue: '24',
      decayType: 'flat',
      decayValue: ''
    },
    amm: {
      token1: null,
      token2: null,
      max: '',
      min: '',
      decimals: 8
    },
    options: {
      ending: null,
      startDate: undefined,
      allowPartial: false,
      broker: undefined,
      allowList: [],
      memo: undefined,
      feeAccounts: [],
      bidPaysFees: []
    }
  })

  // Computed properties
  const isValid = computed(() => {
    if (!state.value.askToken || !state.value.paymentToken) return false
    
    switch (state.value.askType) {
      case 'buynow':
        return state.value.buyNowPrice !== '' && parseFloat(state.value.buyNowPrice) > 0
      case 'auction':
        return state.value.auction.startPrice !== '' && 
               state.value.auction.reservePrice !== '' &&
               parseFloat(state.value.auction.startPrice) > 0 &&
               parseFloat(state.value.auction.reservePrice) > 0
      case 'dutch':
        return state.value.dutch.startPrice !== '' && 
               state.value.dutch.endPrice !== '' &&
               state.value.dutch.timeValue !== '' &&
               parseFloat(state.value.dutch.startPrice) > parseFloat(state.value.dutch.endPrice)
      case 'amm':
        return state.value.amm.token1 !== null && 
               state.value.amm.token2 !== null &&
               state.value.amm.max !== '' &&
               state.value.amm.min !== ''
      default:
        return false
    }
  })

  const estimatedFees = computed(() => {
    // This would calculate estimated fees based on the ask configuration
    return {
      marketplace: '0.025', // 2.5%
      network: '0.001', // 0.1%
      total: '0.026' // 2.6%
    }
  })

  // Actions
  const setAskType = (type: AskBuilderState['askType']) => {
    state.value.askType = type
  }

  const setAskToken = (token: AskBuilderState['askToken']) => {
    state.value.askToken = token
  }

  const setPaymentToken = (token: AskBuilderState['paymentToken']) => {
    state.value.paymentToken = token
  }

  const setBuyNowPrice = (price: string) => {
    state.value.buyNowPrice = price
  }

  const setAuctionConfig = (config: Partial<AskBuilderState['auction']>) => {
    state.value.auction = { ...state.value.auction, ...config }
  }

  const setDutchConfig = (config: Partial<AskBuilderState['dutch']>) => {
    state.value.dutch = { ...state.value.dutch, ...config }
  }

  const setAMMConfig = (config: Partial<AskBuilderState['amm']>) => {
    state.value.amm = { ...state.value.amm, ...config }
  }

  const setOptions = (options: Partial<AskBuilderState['options']>) => {
    state.value.options = { ...state.value.options, ...options }
  }

  const addAllowListMember = (account: Account) => {
    if (!state.value.options.allowList.find(a => 
      a.owner.toString() === account.owner.toString() &&
      JSON.stringify(a.subaccount) === JSON.stringify(account.subaccount)
    )) {
      state.value.options.allowList.push(account)
    }
  }

  const removeAllowListMember = (account: Account) => {
    state.value.options.allowList = state.value.options.allowList.filter(a => 
      !(a.owner.toString() === account.owner.toString() &&
        JSON.stringify(a.subaccount) === JSON.stringify(account.subaccount))
    )
  }

  const addFeeAccount = (feeAccount: [string, TokenSpec, Account]) => {
    state.value.options.feeAccounts.push(feeAccount)
  }

  const removeFeeAccount = (index: number) => {
    state.value.options.feeAccounts.splice(index, 1)
  }

  // Build AskFeature array
  const buildAskFeatures = (): AskFeature[] => {
    const features: AskFeature[] = []

    if (!state.value.askToken || !state.value.paymentToken) {
      throw new Error('Ask token and payment token are required')
    }

    // AskToken feature
    const askTokenSpec: TokenSpec = {
      canister: textToPrincipal(state.value.askToken.canisterId),
      symbol: state.value.askToken.symbol,
      standards: [{
        ICRC37: [{
          token_id: state.value.askToken.tokenId ? [state.value.askToken.tokenId] : [],
          approval_fee: [],
          transfer_from_fee: []
        }]
      }]
    }

    features.push({
      AskToken: [[askTokenSpec]]
    })

    // Payment token spec
    const paymentTokenSpec: TokenSpec = {
      canister: textToPrincipal(state.value.paymentToken.canisterId),
      symbol: state.value.paymentToken.symbol,
      standards: [{
        ICRC1: [{
          amount: parseTokenAmount(state.value.buyNowPrice, state.value.paymentToken.decimals),
          fee: [],
          decimals: BigInt(state.value.paymentToken.decimals)
        }]
      }]
    }

    // Ask type specific features
    switch (state.value.askType) {
      case 'buynow':
        const buyNowReq: BuyNowReq = {
          token: paymentTokenSpec,
          amount: parseTokenAmount(state.value.buyNowPrice, state.value.paymentToken.decimals)
        }
        features.push({
          BuyNow: [[buyNowReq]]
        })
        break

      case 'auction':
        const auctionFeature: AuctionFeature = {
          start_price: parseTokenAmount(state.value.auction.startPrice, state.value.paymentToken.decimals),
          reserve: parseTokenAmount(state.value.auction.reservePrice, state.value.paymentToken.decimals),
          min_increase: state.value.auction.minIncrease.type === 'amount' 
            ? { amount: parseTokenAmount(state.value.auction.minIncrease.value, state.value.paymentToken.decimals) }
            : { percentage: parseFloat(state.value.auction.minIncrease.value) },
          auction_token: paymentTokenSpec,
          wait_for_quiet: state.value.auction.waitForQuiet ? [{
            window: BigInt(parseInt(state.value.auction.waitForQuiet.window) * 1000000000), // Convert to nanoseconds
            extension: BigInt(parseInt(state.value.auction.waitForQuiet.extension) * 1000000000),
            fade: parseFloat(state.value.auction.waitForQuiet.fade),
            max: parseTokenAmount(state.value.auction.waitForQuiet.max, state.value.paymentToken.decimals)
          }] : []
        }
        features.push({
          Auction: auctionFeature
        })
        break

      case 'dutch':
        const dutchFeature: DutchAuctionFeature = {
          dutch: {
            time_unit: { [state.value.dutch.timeUnit]: BigInt(parseInt(state.value.dutch.timeValue)) },
            decay_type: state.value.dutch.decayType === 'flat' 
              ? { flat: parseTokenAmount(state.value.dutch.decayValue, state.value.paymentToken.decimals) }
              : { percent: parseFloat(state.value.dutch.decayValue) }
          }
        }
        features.push({
          Dutch: dutchFeature
        })
        break

      case 'amm':
        if (!state.value.amm.token1 || !state.value.amm.token2) {
          throw new Error('Both tokens are required for AMM')
        }
        const ammFeature: AMMFeature = {
          amm: {
            token_1: state.value.amm.token1,
            token_2: state.value.amm.token2,
            max: parseTokenAmount(state.value.amm.max, state.value.amm.decimals),
            min: parseTokenAmount(state.value.amm.min, state.value.amm.decimals),
            decimals: state.value.amm.decimals
          }
        }
        features.push({
          AMM: ammFeature
        })
        break
    }

    // Common options
    if (state.value.options.ending) {
      features.push({
        Ending: state.value.options.ending
      })
    }

    if (state.value.options.startDate) {
      features.push({
        StartDate: BigInt(state.value.options.startDate.getTime() * 1000000) // Convert to nanoseconds
      })
    }

    if (state.value.options.allowPartial) {
      features.push({
        AllowPartial: null
      })
    }

    if (state.value.options.broker) {
      features.push({
        Broker: state.value.options.broker
      })
    }

    if (state.value.options.allowList.length > 0) {
      features.push({
        AllowList: state.value.options.allowList
      })
    }

    if (state.value.options.memo) {
      features.push({
        Memo: state.value.options.memo
      })
    }

    if (state.value.options.feeAccounts.length > 0) {
      features.push({
        FeeAccounts: state.value.options.feeAccounts
      })
    }

    if (state.value.options.bidPaysFees.length > 0) {
      features.push({
        BidPaysFees: [state.value.options.bidPaysFees]
      })
    }

    return features
  }

  // Reset builder
  const reset = () => {
    state.value = {
      askType: 'buynow',
      askToken: null,
      paymentToken: null,
      buyNowPrice: '',
      auction: {
        startPrice: '',
        reservePrice: '',
        minIncrease: { type: 'amount', value: '' },
        endDate: undefined,
        waitForQuiet: undefined
      },
      dutch: {
        startPrice: '',
        endPrice: '',
        timeUnit: 'hour',
        timeValue: '24',
        decayType: 'flat',
        decayValue: ''
      },
      amm: {
        token1: null,
        token2: null,
        max: '',
        min: '',
        decimals: 8
      },
      options: {
        ending: null,
        startDate: undefined,
        allowPartial: false,
        broker: undefined,
        allowList: [],
        memo: undefined,
        feeAccounts: [],
        bidPaysFees: []
      }
    }
  }

  return {
    // State
    state: readonly(state),
    isValid,
    estimatedFees,

    // Actions
    setAskType,
    setAskToken,
    setPaymentToken,
    setBuyNowPrice,
    setAuctionConfig,
    setDutchConfig,
    setAMMConfig,
    setOptions,
    addAllowListMember,
    removeAllowListMember,
    addFeeAccount,
    removeFeeAccount,
    buildAskFeatures,
    reset
  }
}
