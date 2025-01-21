import type { KlineData, PredictionResult, BacktestMetrics } from '../types';
import { PricePredictor } from './predictionService';

export class BacktestService {
  private predictor: PricePredictor;

  constructor() {
    this.predictor = new PricePredictor();
  }

  async runBacktest(data: KlineData[]): Promise<BacktestMetrics> {
    await this.predictor.initialize();
    
    const windowSize = 20;
    const results: PredictionResult[] = [];
    let correctPredictions = 0;
    let totalConfidence = 0;
    let profitLoss = 0;

    for (let i = windowSize; i < data.length - 1; i++) {
      const windowData = data.slice(i - windowSize, i);
      const prediction = await this.predictor.predict(windowData);
      const actualNextClose = parseFloat(data[i + 1].close);
      
      const wasCorrect = (prediction.direction === 'up' && actualNextClose > prediction.actualPrice) ||
                        (prediction.direction === 'down' && actualNextClose < prediction.actualPrice);
      
      if (wasCorrect) {
        correctPredictions++;
        profitLoss += Math.abs(actualNextClose - prediction.actualPrice);
      } else {
        profitLoss -= Math.abs(actualNextClose - prediction.actualPrice);
      }

      totalConfidence += prediction.confidence;
      results.push(prediction);
    }

    return {
      accuracy: correctPredictions / results.length,
      totalPredictions: results.length,
      correctPredictions,
      averageConfidence: totalConfidence / results.length,
      profitLoss,
    };
  }
}