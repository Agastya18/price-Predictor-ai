# Cryptocurrency Price Predictor with AI

An advanced cryptocurrency price prediction system that uses artificial intelligence to forecast price movements and includes a comprehensive backtesting framework.

<img width="1445" alt="Screenshot 2025-01-21 at 7 20 27 PM" src="https://github.com/user-attachments/assets/7ed008e0-3472-40f7-be70-c0e00bf84b1b" />


## Features

- 🤖 AI-powered price predictions using LSTM neural networks
- 📊 Real-time integration with Binance API
- 📈 Interactive price charts and visualization
- 🧪 Comprehensive backtesting framework
- 📉 Performance metrics and P&L tracking
- ⚡ Real-time data processing and normalization

## Technical Architecture

### 1. Data Collection Layer (`binanceService.ts`)
- Fetches historical price data from Binance API
- Supports multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d)
- Handles API rate limiting and error recovery
- Data structure includes:
  - Opening/Closing prices
  - High/Low prices
  - Volume
  - Number of trades
  - Quote asset volume

### 2. AI Prediction Engine (`predictionService.ts`)

#### LSTM Neural Network Architecture
```
Input Layer [windowSize=20, features=5]
    ↓
LSTM Layer (50 units, return sequences)
    ↓
Dropout Layer (20%)
    ↓
LSTM Layer (30 units)
    ↓
Dropout Layer (20%)
    ↓
Dense Layer (1 unit)
```

#### Data Preprocessing Pipeline
1. Feature Extraction:
   ```typescript
   const closes = data.map(d => parseFloat(d.close));
   const highs = data.map(d => parseFloat(d.high));
   const lows = data.map(d => parseFloat(d.low));
   const volumes = data.map(d => parseFloat(d.volume));
   const trades = data.map(d => d.trades);
   ```

2. Normalization:
   - Min-max scaling for each feature
   - Tensor operations using TensorFlow.js
   ```typescript
   closesTensor.sub(closesTensor.min())
              .div(closesTensor.max().sub(closesTensor.min()))
   ```

3. Tensor Reshaping:
   - Input shape: [1, windowSize=20, features=5]
   - Features order: [closes, highs, lows, volumes, trades]
   - Memory management using tf.tidy() and dispose()

#### Model Training
- Optimizer: Adam (learning rate: 0.001)
- Loss function: Mean Squared Error
- Batch size: Dynamic based on window size
- Training data: Sliding window approach

### 3. Backtesting Framework (`backtestService.ts`)

The backtesting system:
1. Takes historical data as input
2. Applies the prediction model to each time window
3. Compares predictions with actual outcomes
4. Calculates performance metrics:
   - Prediction accuracy
   - Average confidence
   - Profit/Loss simulation
   - Total number of predictions

### 4. User Interface (`App.tsx`)

Modern React-based interface with:
- Configuration panel
  - Trading pair selection
  - Timeframe selection
- Results dashboard
  - Accuracy metrics
  - Confidence scores
  - P&L tracking
- Interactive price chart
- Real-time updates
- Error handling

## How It Works

### 1. Data Flow

```
Binance API → Data Preprocessing → LSTM Model → Prediction → Backtesting → UI
```

1. User selects a trading pair and timeframe
2. System fetches historical data from Binance
3. Data is preprocessed and normalized
4. LSTM model makes predictions
5. Backtesting system validates predictions
6. Results are displayed in the UI

### 2. Prediction Process

The LSTM model:
1. Takes a 20-period window of historical data
2. Processes 5 key features:
   - Closing prices
   - High prices
   - Low prices
   - Volume
   - Number of trades
3. Outputs:
   - Price direction (up/down)
   - Confidence score
   - Predicted price value

### 3. Backtesting Process

For each prediction:
1. Model makes a prediction using historical data
2. Prediction is compared with actual future price
3. Results are recorded:
   - Correct/incorrect prediction
   - Profit/loss calculation
   - Confidence accuracy

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Usage

1. Open the application in your browser
2. Enter a valid Binance trading pair (e.g., BTCUSDT)
3. Select your preferred timeframe
4. Click "Run Prediction & Backtest"
5. View the results in the dashboard

## Technical Details

### Dependencies

- **Frontend Framework**: React with TypeScript
- **AI/ML**: TensorFlow.js
- **Data Visualization**: Chart.js with react-chartjs-2
- **API Integration**: Axios
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Key Files

- `src/services/binanceService.ts`: Binance API integration
- `src/services/predictionService.ts`: LSTM model implementation
- `src/services/backtestService.ts`: Backtesting framework
- `src/App.tsx`: Main application component
- `src/types/index.ts`: TypeScript type definitions

## Performance Considerations

- Data is preprocessed in chunks to handle large datasets
- TensorFlow.js operations use WebGL acceleration when available
- Automatic memory management for tensor operations
- Efficient data structures for historical price storage
- Tensor cleanup using dispose() and tf.tidy()

## Memory Management

The application implements careful memory management:
1. Uses tf.tidy() for automatic tensor cleanup
2. Explicitly disposes tensors after use
3. Manages WebGL memory efficiently
4. Implements proper garbage collection practices

## Limitations

- Predictions are based on technical analysis only
- Market sentiment and news are not considered
- Past performance doesn't guarantee future results
- Model requires sufficient historical data for accuracy
- Limited by browser memory constraints


