import { useState } from 'react';
import { routeAPI } from '../services/api';

const RouteOptimizer = () => {
  const [routes, setRoutes] = useState([]);
  const [origin, setOrigin] = useState('');
  const [destinations, setDestinations] = useState(['']);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [consolidationOptions, setConsolidationOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sampleRoutes = {
    'New York-Los Angeles': { distance: 4500, co2: 720, cost: 1200, time: '3-4 days' },
    'New York-Chicago': { distance: 1200, co2: 192, cost: 320, time: '1-2 days' },
    'Chicago-Los Angeles': { distance: 3200, co2: 512, cost: 850, time: '2-3 days' },
    'New York-Miami': { distance: 1900, co2: 304, cost: 480, time: '2 days' },
    'Miami-Los Angeles': { distance: 4200, co2: 672, cost: 1100, time: '3-4 days' }
  };

  const addDestination = () => {
    setDestinations([...destinations, '']);
  };

  const removeDestination = (index) => {
    const newDestinations = destinations.filter((_, i) => i !== index);
    setDestinations(newDestinations);
  };

  const updateDestination = (index, value) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);
  };

  const optimizeRoute = async () => {
    if (!origin || destinations.some(dest => !dest.trim())) return;

    const validDestinations = destinations.filter(dest => dest.trim());

    setLoading(true);
    setError(null);

    try {
      const result = await routeAPI.optimizeRoute({
        origin: origin.trim(),
        destinations: validDestinations
      });

      setOptimizedRoute(result.optimizedRoute);
      setConsolidationOptions(result.consolidationOptions);
    } catch (err) {
      setError(err.message);
      console.error('Route optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeRoutes = (locations) => {
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
  };

  const generateRouteRecommendations = (locations) => {
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
  };

  const findConsolidationOpportunities = (locations) => {
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
  };

  const getRouteVisualization = () => {
    if (!optimizedRoute) return null;

    return optimizedRoute.stops.map((stop, index) => (
      <div key={index} className="route-stop">
        <div className="stop-number">{index + 1}</div>
        <div className="stop-name">{stop}</div>
        {index < optimizedRoute.stops.length - 1 && (
          <div className="route-arrow">→</div>
        )}
      </div>
    ));
  };

  return (
    <div className="route-optimizer">
      <h2><i className="fas fa-map-marked-alt"></i> Green Route Optimizer</h2>

      <div className="route-form">
        <div className="form-group">
          <label><i className="fas fa-map-marker-alt"></i> Origin</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Starting location"
          />
        </div>

        <div className="destinations">
          <label><i className="fas fa-map-marked"></i> Destinations</label>
          {destinations.map((dest, index) => (
            <div key={index} className="destination-input">
              <input
                type="text"
                value={dest}
                onChange={(e) => updateDestination(index, e.target.value)}
                placeholder={`Destination ${index + 1}`}
              />
              {destinations.length > 1 && (
                <button
                  onClick={() => removeDestination(index)}
                  className="remove-btn"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button onClick={addDestination} className="add-destination-btn">
            <i className="fas fa-plus"></i> Add Destination
          </button>
        </div>

        <button onClick={optimizeRoute} className="optimize-btn" disabled={loading}>
          <i className="fas fa-route"></i> {loading ? 'Optimizing...' : 'Optimize Route'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p><i className="fas fa-exclamation-triangle"></i> Error: {error}</p>
        </div>
      )}

      {optimizedRoute && (
        <div className="optimization-results">
          <div className="route-visualization">
            <h3>Optimized Route</h3>
            <div className="route-path">
              {getRouteVisualization()}
            </div>
          </div>

          <div className="savings-summary">
            <h3><i className="fas fa-chart-line"></i> Environmental Impact</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">{optimizedRoute.co2Savings}</div>
                <div className="metric-label">kg CO₂ Saved</div>
                <div className="metric-change">-{optimizedRoute.efficiency}%</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{optimizedRoute.costSavings}</div>
                <div className="metric-label">$ Cost Saved</div>
                <div className="metric-change">-25%</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{optimizedRoute.timeSaved}</div>
                <div className="metric-label">Time Saved</div>
                <div className="metric-change">Faster</div>
              </div>
            </div>
          </div>

          <div className="recommendations">
            <h3><i className="fas fa-bullseye"></i> Optimization Strategies</h3>
            <div className="recommendation-list">
              {optimizedRoute.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <div className="rec-header">
                    <h4>{rec.type}</h4>
                    <span className={`difficulty ${rec.implementation.toLowerCase()}`}>
                      {rec.implementation}
                    </span>
                  </div>
                  <p>{rec.description}</p>
                  <div className="impact">{rec.impact}</div>
                </div>
              ))}
            </div>
          </div>

          {consolidationOptions.length > 0 && (
            <div className="consolidation-options">
              <h3><i className="fas fa-cubes"></i> Consolidation Opportunities</h3>
              {consolidationOptions.map((option, index) => (
                <div key={index} className="consolidation-card">
                  <h4>{option.type}</h4>
                  <p>{option.description}</p>
                  <div className="consolidation-details">
                    <div className="detail">
                      <strong>Savings:</strong> {option.savings}
                    </div>
                    <div className="detail">
                      <strong>Shipments:</strong> {option.shipments} instead of {destinations.length}
                    </div>
                    <div className="detail">
                      <strong>Timeline:</strong> {option.timeline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteOptimizer;