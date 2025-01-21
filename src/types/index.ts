export interface KlineData {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteVolume: string;
    trades: number;
    takerBaseVolume: string;
    takerQuoteVolume: string;
    ignored: string;
  }
  
  export interface PredictionResult {
    timestamp: number;
    actualPrice: number;
    predictedPrice: number;
    confidence: number;
    direction: 'up' | 'down';
  }
  
  export interface BacktestMetrics {
    accuracy: number;
    totalPredictions: number;
    correctPredictions: number;
    averageConfidence: number;
    profitLoss: number;
  }