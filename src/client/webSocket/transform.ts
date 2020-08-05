import * as restResponse from '../../types/rest/response';
import * as webSocketResponse from '../../types/webSocket/response';
import {
  InternalAuthenticatedSubscription,
  Subscription,
  InternalSubscription,
} from '../../types/webSocket/request';

const transformTickersMessage = (
  ticker: webSocketResponse.TickerShort,
): restResponse.Ticker => ({
  market: ticker.m,
  time: ticker.t,
  open: ticker.o,
  high: ticker.h,
  low: ticker.l,
  close: ticker.c,
  closeQuantity: ticker.Q,
  baseVolume: ticker.v,
  quoteVolume: ticker.q,
  percentChange: ticker.P,
  ...(ticker.n && { numTrades: ticker.n }),
  ask: ticker.a,
  bid: ticker.b,
  sequence: ticker.u,
});

const transformTradesMessage = (
  trade: webSocketResponse.TradeShort,
): webSocketResponse.TradeLong => ({
  market: trade.m,
  fillId: trade.i,
  price: trade.p,
  quantity: trade.q,
  quoteQuantity: trade.Q,
  time: trade.t,
  makerSide: trade.s,
  sequence: trade.u,
});

const transformCandlesMessage = (
  candle: webSocketResponse.CandleShort,
): webSocketResponse.CandleLong => ({
  market: candle.m,
  time: candle.t,
  interval: candle.i,
  start: candle.s,
  end: candle.e,
  open: candle.o,
  high: candle.h,
  low: candle.l,
  close: candle.c,
  volume: candle.v,
  numTrades: candle.n,
  sequence: candle.u,
});

const transformL1orderbooksMessage = (
  l1orderbook: webSocketResponse.L1OrderBookShort,
): webSocketResponse.L1OrderBookLong => ({
  market: l1orderbook.m,
  time: l1orderbook.t,
  bidPrice: l1orderbook.b,
  bidQuantity: l1orderbook.B,
  askPrice: l1orderbook.a,
  askQuantity: l1orderbook.A,
});

const transformL2orderbooksMessage = (
  l2orderbook: webSocketResponse.L2OrderBookShort,
): webSocketResponse.L2OrderBookLong => ({
  market: l2orderbook.m,
  time: l2orderbook.t,
  sequence: l2orderbook.u,
  ...(l2orderbook.b && { bids: l2orderbook.b }),
  ...(l2orderbook.a && { asks: l2orderbook.a }),
});

const transformBalancesMessage = (
  balance: webSocketResponse.BalanceShort,
): webSocketResponse.BalanceLong => ({
  wallet: balance.w,
  asset: balance.a,
  quantity: balance.q,
  availableForTrade: balance.f,
  locked: balance.l,
  usdValue: balance.d,
});

const transformOrderFill = (
  fill: webSocketResponse.OrderFillShort,
): restResponse.OrderFill => ({
  fillId: fill.i,
  price: fill.p,
  quantity: fill.q,
  quoteQuantity: fill.Q,
  time: fill.t,
  makerSide: fill.s,
  sequence: fill.u,
  fee: fill.f,
  feeAsset: fill.a,
  ...(fill.g && { gas: fill.g }),
  liquidity: fill.l,
  ...(fill.T && { txId: fill.T }),
  txStatus: fill.S,
});

const transformOrdersMessage = (
  order: webSocketResponse.OrderShort,
): webSocketResponse.OrderLong => ({
  market: order.m,
  orderId: order.i,
  clientOrderId: order.c,
  wallet: order.w,
  time: order.t,
  timeOfOriginalOrder: order.T,
  executionType: order.x,
  status: order.X,
  ...(order.u && { orderBookSequenceNumber: order.u }),
  type: order.o,
  side: order.S,
  originalQuantity: order.q,
  ...(order.Q && { originalQuoteQuantity: order.Q }),
  executedQuantity: order.z,
  cumulativeQuoteQuantity: order.Z,
  ...(order.v && { avgExecutionPrice: order.v }),
  ...(order.p && { limitOrderPrice: order.p }),
  ...(order.P && { stopOrderPrice: order.P }),
  timeInForce: order.f,
  selfTradePrevention: order.V,
  ...(order.F && { fills: order.F.map(transformOrderFill) }),
});

export const transformMessage = (
  message:
    | webSocketResponse.ErrorResponse
    | webSocketResponse.SubscriptionsResponse
    | webSocketResponse.SubscriptionMessageShort,
): webSocketResponse.Response => {
  if (message.type === 'error' || message.type === 'subscriptions') {
    return message;
  }
  switch (message.type) {
    case 'candles':
      return { ...message, data: transformCandlesMessage(message.data) };
    case 'tickers':
      return { ...message, data: transformTickersMessage(message.data) };
    case 'l1orderbook':
      return { ...message, data: transformL1orderbooksMessage(message.data) };
    case 'l2orderbook':
      return { ...message, data: transformL2orderbooksMessage(message.data) };
    case 'trades':
      return { ...message, data: transformTradesMessage(message.data) };
    case 'balances':
      return { ...message, data: transformBalancesMessage(message.data) };
    case 'orders':
      return { ...message, data: transformOrdersMessage(message.data) };

    default:
      return message;
  }
};

/*
 * Wallet is used only to generate user's wallet auth token
 * After we got token, we don't want to send wallet to the server
 */
export const removeWalletFromSdkSubscription = (
  subscription:
    | InternalAuthenticatedSubscription
    | (InternalSubscription & { wallet?: string }),
): Subscription => {
  const subscriptionWithoutWallet = { ...subscription };
  if (subscriptionWithoutWallet.wallet) {
    delete subscriptionWithoutWallet.wallet;
  }
  return subscriptionWithoutWallet;
};