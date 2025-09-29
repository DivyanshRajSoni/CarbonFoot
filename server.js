const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://carbon-foot.vercel.app', 'https://carbon-foot-divyanshrajsoni.vercel.app']
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const emissionFactors = {
  truck: { diesel: 0.161, electric: 0.053, hybrid: 0.095 },
  air: { jet: 0.57, biofuel: 0.34 },
  ship: { heavy: 0.014, lng: 0.008 },
  train: { diesel: 0.041, electric: 0.006 }
};

const packagingOptions = {
  cardboard: {
    name: 'Recycled Cardboard',
    sustainability: 85,
    cost: 'Low',
    recyclable: true,
    biodegradable: true,
    co2Impact: 0.5,
    bestFor: ['electronics', 'clothing', 'documents']
  },
  biodegradable: {
    name: 'Biodegradable Plastic',
    sustainability: 75,
    cost: 'Medium',
    recyclable: false,
    biodegradable: true,
    co2Impact: 0.8,
    bestFor: ['food', 'cosmetics', 'fragile']
  },
  mushroom: {
    name: 'Mushroom Packaging',
    sustainability: 95,
    cost: 'High',
    recyclable: true,
    biodegradable: true,
    co2Impact: 0.2,
    bestFor: ['fragile', 'electronics', 'luxury']
  },
  recyclePaper: {
    name: 'Recycled Paper Padding',
    sustainability: 80,
    cost: 'Low',
    recyclable: true,
    biodegradable: true,
    co2Impact: 0.3,
    bestFor: ['clothing', 'documents', 'lightweight']
  },
  cornstarch: {
    name: 'Cornstarch Packing Peanuts',
    sustainability: 90,
    cost: 'Medium',
    recyclable: false,
    biodegradable: true,
    co2Impact: 0.4,
    bestFor: ['fragile', 'electronics', 'irregular']
  }
};

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CarbonFoot API'
  });
});

app.post('/api/calculate-carbon', (req, res) => {
  try {
    const { distance, weight, transportMode, fuelType } = req.body;

    if (!distance || !weight || !transportMode || !fuelType) {
      return res.status(400).json({
        error: 'Missing required fields: distance, weight, transportMode, fuelType'
      });
    }

    const factor = emissionFactors[transportMode]?.[fuelType];
    if (!factor) {
      return res.status(400).json({
        error: 'Invalid transport mode or fuel type combination'
      });
    }

    const emissions = parseFloat(distance) * parseFloat(weight) * factor;

    const suggestions = generateCarbonSuggestions(emissions, transportMode, distance, weight);

    res.json({
      carbonFootprint: parseFloat(emissions.toFixed(2)),
      carEquivalent: Math.round(emissions / 0.404),
      suggestions,
      calculatedAt: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error during carbon calculation' });
  }
});

function generateCarbonSuggestions(currentEmissions, mode, distance, weight) {
  const suggestions = [];

  if (mode === 'truck') {
    const electricEmissions = distance * weight * emissionFactors.truck.electric;
    suggestions.push({
      type: 'Vehicle Type',
      suggestion: 'Switch to electric trucks',
      reduction: `${((currentEmissions - electricEmissions) / currentEmissions * 100).toFixed(1)}% reduction`,
      newEmissions: electricEmissions.toFixed(2)
    });
  }

  if (mode === 'air') {
    const shipEmissions = distance * weight * emissionFactors.ship.heavy;
    suggestions.push({
      type: 'Transport Mode',
      suggestion: 'Consider sea freight for non-urgent shipments',
      reduction: `${((currentEmissions - shipEmissions) / currentEmissions * 100).toFixed(1)}% reduction`,
      newEmissions: shipEmissions.toFixed(2)
    });
  }

  suggestions.push({
    type: 'Route Optimization',
    suggestion: 'Consolidate shipments and optimize routes',
    reduction: '15-25% potential reduction',
    newEmissions: (currentEmissions * 0.8).toFixed(2)
  });

  return suggestions;
}

app.post('/api/packaging-recommendations', (req, res) => {
  try {
    const { dimensions, weight, itemType, fragility } = req.body;

    if (!dimensions || !weight || !itemType || !fragility) {
      return res.status(400).json({
        error: 'Missing required fields: dimensions, weight, itemType, fragility'
      });
    }

    const volume = dimensions.length * dimensions.width * dimensions.height;

    const suitable = Object.entries(packagingOptions).filter(([key, option]) =>
      option.bestFor.includes(itemType)
    );

    const scored = suitable.map(([key, option]) => ({
      ...option,
      key,
      score: calculatePackagingScore(option, volume, weight, fragility),
      estimatedCost: calculatePackagingCost(option, volume, weight)
    }));

    scored.sort((a, b) => b.score - a.score);

    res.json({
      recommendations: scored.slice(0, 3),
      volume: Math.round(volume),
      calculatedAt: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error during packaging calculation' });
  }
});

function calculatePackagingScore(option, volume, weight, fragility) {
  let score = option.sustainability;

  if (fragility === 'high' && option.name.includes('Mushroom')) score += 10;
  if (volume > 1000 && option.cost === 'Low') score += 5;
  if (weight > 5 && option.name.includes('Cardboard')) score += 5;

  return score;
}

function calculatePackagingCost(option, volume, weight) {
  const baseCosts = { Low: 2, Medium: 5, High: 12 };
  const volumeFactor = Math.max(1, volume / 1000);
  const weightFactor = Math.max(1, weight / 2);

  return (baseCosts[option.cost] * volumeFactor * weightFactor).toFixed(2);
}

app.post('/api/optimize-route', (req, res) => {
  try {
    const { origin, destinations } = req.body;

    if (!origin || !destinations || !Array.isArray(destinations)) {
      return res.status(400).json({
        error: 'Missing required fields: origin, destinations (array)'
      });
    }

    const validDestinations = destinations.filter(dest => dest && dest.trim());
    const allLocations = [origin, ...validDestinations];

    const routeAnalysis = analyzeRoutes(allLocations);
    const consolidationOptions = findConsolidationOpportunities(allLocations);

    res.json({
      optimizedRoute: routeAnalysis,
      consolidationOptions,
      totalLocations: allLocations.length,
      calculatedAt: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error during route optimization' });
  }
});

function analyzeRoutes(locations) {
  const totalLocations = locations.length;
  const estimatedDistance = totalLocations * 800;
  const currentCO2 = estimatedDistance * 0.16;
  const optimizedCO2 = currentCO2 * 0.75;
  const savings = currentCO2 - optimizedCO2;

  return {
    originalDistance: estimatedDistance,
    optimizedDistance: Math.round(estimatedDistance * 0.75),
    originalCO2: Math.round(currentCO2),
    optimizedCO2: Math.round(optimizedCO2),
    co2Savings: Math.round(savings),
    costSavings: Math.round(savings * 2.5),
    timeSaved: '0.5-1 day',
    efficiency: Math.round((savings / currentCO2) * 100),
    stops: locations,
    recommendations: generateRouteRecommendations(locations)
  };
}

function generateRouteRecommendations(locations) {
  const recommendations = [];

  if (locations.length > 3) {
    recommendations.push({
      type: 'Hub Consolidation',
      description: 'Use regional distribution hubs to reduce individual trips',
      impact: '30-40% emission reduction',
      implementation: 'Medium'
    });
  }

  recommendations.push({
    type: 'Load Optimization',
    description: 'Combine multiple shipments going to nearby locations',
    impact: '20-25% emission reduction',
    implementation: 'Easy'
  });

  recommendations.push({
    type: 'Route Sequencing',
    description: 'Optimize stop order to minimize backtracking',
    impact: '15-20% emission reduction',
    implementation: 'Easy'
  });

  if (locations.length > 2) {
    recommendations.push({
      type: 'Multi-Modal Transport',
      description: 'Use rail or sea freight for long-distance segments',
      impact: '50-60% emission reduction',
      implementation: 'Hard'
    });
  }

  return recommendations;
}

function findConsolidationOpportunities(locations) {
  return [
    {
      type: 'Regional Grouping',
      description: `Group ${locations.length - 1} destinations by region`,
      savings: '25% cost reduction, 30% CO₂ reduction',
      shipments: Math.ceil(locations.length / 2),
      timeline: 'Add 1 day for consolidation'
    },
    {
      type: 'Carrier Partnership',
      description: 'Partner with other shippers for shared routes',
      savings: '40% cost reduction, 35% CO₂ reduction',
      shipments: 1,
      timeline: 'Add 2-3 days for coordination'
    }
  ];
}

app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🌍 CarbonFoot API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;