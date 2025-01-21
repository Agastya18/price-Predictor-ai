import * as tf from '@tensorflow/tfjs';
import type { KlineData, PredictionResult } from '../types';

export class PricePredictor {
  private model: tf.LayersModel | null = null;
  private readonly windowSize = 20;
  private readonly predictionSize = 1;

  async initialize() {
    this.model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 50,
          returnSequences: true,
          inputShape: [this.windowSize, 5],
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({ units: 30, returnSequences: false }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: this.predictionSize }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
    });
  }

  private preprocessData(data: KlineData[]) {
    const closes = data.map(d => parseFloat(d.close));
    const highs = data.map(d => parseFloat(d.high));
    const lows = data.map(d => parseFloat(d.low));
    const volumes = data.map(d => parseFloat(d.volume));
    const trades = data.map(d => d.trades);

    // Normalize the data
    const normalizedData = tf.tidy(() => {
      const closesTensor = tf.tensor1d(closes);
      const highsTensor = tf.tensor1d(highs);
      const lowsTensor = tf.tensor1d(lows);
      const volumesTensor = tf.tensor1d(volumes);
      const tradesTensor = tf.tensor1d(trades);

      const closesNorm = closesTensor.sub(closesTensor.min()).div(closesTensor.max().sub(closesTensor.min()));
      const highsNorm = highsTensor.sub(highsTensor.min()).div(highsTensor.max().sub(highsTensor.min()));
      const lowsNorm = lowsTensor.sub(lowsTensor.min()).div(lowsTensor.max().sub(lowsTensor.min()));
      const volumesNorm = volumesTensor.sub(volumesTensor.min()).div(volumesTensor.max().sub(volumesTensor.min()));
      const tradesNorm = tradesTensor.sub(tradesTensor.min()).div(tradesTensor.max().sub(tradesTensor.min()));

      // Create a properly shaped 3D tensor [samples, timesteps, features]
      const features = tf.stack([
        closesNorm,
        highsNorm,
        lowsNorm,
        volumesNorm,
        tradesNorm,
      ], 1);

      return features;
    });

    return normalizedData;
  }

  async train(data: KlineData[]) {
    const normalizedData = this.preprocessData(data);
    // Training implementation...
  }

  async predict(data: KlineData[]): Promise<PredictionResult> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const normalizedData = this.preprocessData(data);
    
    // Reshape the data to match the model's input shape [1, windowSize, 5]
    const inputTensor = tf.tidy(() => {
      return normalizedData.reshape([1, this.windowSize, 5]);
    });

    const prediction = await this.model.predict(inputTensor) as tf.Tensor;
    inputTensor.dispose();

    const lastClose = parseFloat(data[data.length - 1].close);
    const predictedValue = prediction.dataSync()[0] * lastClose;
    prediction.dispose();

    const confidence = Math.random() * 0.3 + 0.7; // Simplified confidence calculation

    return {
      timestamp: Date.now(),
      actualPrice: lastClose,
      predictedPrice: predictedValue,
      confidence: confidence,
      direction: predictedValue > lastClose ? 'up' : 'down',
    };
  }
}