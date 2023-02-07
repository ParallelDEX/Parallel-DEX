import { UNLIMITED_ALLOWANCE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { getEthereumAddress, MsgSendToEth } from '@injectivelabs/sdk-ts'
import { Erc20Token, Token } from '@injectivelabs/token-metadata'
import {
  msgBroadcastClient,
  web3Broadcaster,
  web3Composer
} from '@/app/Services'
import { backupPromiseCall } from '@/app/utils/async'
import { BalanceWithToken } from '~~/types'

export const transfer = async ({
  amount,
  token
}: {
  amount: BigNumberInBase
  token: Token
}) => {
  const bankStore = useBankStore()

  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()
  const { gasPrice, fetchGasPrice, queue } = useAppStore()

  if (!address || !isUserWalletConnected) {
    return
  }

  await fetchGasPrice()
  await validate()
  await queue()

  const ethDestinationAddress = getEthereumAddress(injectiveAddress)
  const actualAmount = new BigNumberInBase(
    amount.toFixed(3, BigNumberInBase.ROUND_DOWN)
  )
    .toWei(token.decimals)
    .toFixed()

  const tx = await web3Composer.getPeggyTransferTx({
    address,
    gasPrice,
    denom: token.denom,
    amount: actualAmount,
    destinationAddress: ethDestinationAddress
  })

  await web3Broadcaster.sendTransaction({
    tx,
    address
  })

  await backupPromiseCall(() => bankStore.fetchBalances())
}

export const withdraw = async ({
  amount,
  bridgeFee,
  token
}: {
  amount: BigNumberInBase
  bridgeFee: BigNumberInBase
  token: Token
}) => {
  const appStore = useAppStore()
  const bankStore = useBankStore()

  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!address || !isUserWalletConnected) {
    return
  }

  await validate()
  await appStore.queue()

  const amountToFixed = amount.toWei(token.decimals).toFixed(0)
  const actualBridgeFee = new BigNumberInWei(
    bridgeFee.toWei(token.decimals).toFixed(0)
  ).toFixed()

  const actualAmount = new BigNumberInBase(amountToFixed)
    .minus(actualBridgeFee)
    .toFixed(0)

  const message = MsgSendToEth.fromJSON({
    address,
    injectiveAddress,
    amount: {
      denom: token.denom,
      amount: actualAmount
    },
    bridgeFee: {
      denom: token.denom,
      amount: actualBridgeFee
    }
  })

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })

  await backupPromiseCall(() => bankStore.fetchBalances())
}

export const setTokenAllowance = async (tokenWithBalance: BalanceWithToken) => {
  const tokenStore = useTokenStore()

  const { address, validate } = useWalletStore()
  const { gasPrice, fetchGasPrice, queue } = useAppStore()

  const tokenAddress = tokenWithBalance.token.erc20Address as keyof Erc20Token

  await queue()
  await fetchGasPrice()
  await validate()

  const tx = await web3Composer.getSetTokenAllowanceTx({
    address,
    gasPrice,
    tokenAddress,
    amount: UNLIMITED_ALLOWANCE.toFixed()
  })

  await web3Broadcaster.sendTransaction({
    tx,
    address
  })

  const token = tokenStore.tradeableErc20TokensWithBalanceAndPrice.find(
    (token) => {
      const erc20Token = token as Erc20Token

      return (
        erc20Token.erc20Address.toLowerCase() === tokenAddress.toLowerCase()
      )
    }
  )
  const index = tokenStore.tradeableErc20TokensWithBalanceAndPrice.findIndex(
    (token) => {
      const erc20Token = token as Erc20Token

      return (
        erc20Token.erc20Address.toLowerCase() === tokenAddress.toLowerCase()
      )
    }
  )

  if (!token || index < 0) {
    return
  }

  const tradeableErc20TokensWithBalanceAndPriceWithUpdatedAllowance = [
    ...tokenStore.tradeableErc20TokensWithBalanceAndPrice
  ]
  tradeableErc20TokensWithBalanceAndPriceWithUpdatedAllowance[index] = {
    ...token,
    allowance: UNLIMITED_ALLOWANCE.toString()
  }

  tokenStore.$patch({
    tradeableErc20TokensWithBalanceAndPrice:
      tradeableErc20TokensWithBalanceAndPriceWithUpdatedAllowance
  })
}
