import  { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { getHistoricalData } from './services/binanceService';
import { BacktestService } from './services/backtestService';
import type { BacktestMetrics, KlineData } from './types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1h');
  const [historicalData, setHistoricalData] = useState<KlineData[]>([]);
  const [metrics, setMetrics] = useState<BacktestMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHistoricalData(symbol, interval);
      setHistoricalData(data);
      
      const backtestService = new BacktestService();
      const backtestMetrics = await backtestService.runBacktest(data);
      setMetrics(backtestMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: historicalData.map(d => new Date(d.closeTime).toLocaleString()),
    datasets: [
      {
        label: 'Price',
        data: historicalData.map(d => parseFloat(d.close)),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Crypto Price Predictor</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Symbol</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Interval</label>
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="1m">1 minute</option>
                  <option value="5m">5 minutes</option>
                  <option value="15m">15 minutes</option>
                  <option value="1h">1 hour</option>
                  <option value="4h">4 hours</option>
                  <option value="1d">1 day</option>
                </select>
              </div>
              <button
                onClick={fetchData}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Run Prediction & Backtest'}
              </button>
            </div>
          </div>

          {metrics && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Backtest Results</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(metrics.accuracy * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Predictions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.totalPredictions}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Avg Confidence</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(metrics.averageConfidence * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">P&L</p>
                  <div className="flex items-center">
                    {metrics.profitLoss >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <p className={`text-2xl font-bold ${metrics.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${Math.abs(metrics.profitLoss).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {historicalData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Price History</h2>
            <div className="h-96">
              <Line data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;