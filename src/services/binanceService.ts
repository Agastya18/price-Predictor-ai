import axios from 'axios';
import type { KlineData } from '../types';

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

export async function getHistoricalData(
  symbol: string,
  interval: string,
  limit: number = 1000
): Promise<KlineData[]> {
  try {
    const response = await axios.get(`${BINANCE_API_BASE}/klines`, {
      params: {
        symbol: symbol.toUpperCase(),
        interval,
        limit,
      },
    });

    return response.data.map((kline: any[]) => ({
      openTime: kline[0],
      open: kline[1],
      high: kline[2],
      low: kline[3],
      close: kline[4],
      volume: kline[5],
      closeTime: kline[6],
      quoteVolume: kline[7],
      trades: kline[8],
      takerBaseVolume: kline[9],
      takerQuoteVolume: kline[10],
      ignored: kline[11],
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
}