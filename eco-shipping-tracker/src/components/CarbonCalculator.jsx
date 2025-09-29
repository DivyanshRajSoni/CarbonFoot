import { useState } from 'react';
import { carbonAPI } from '../services/api';

const CarbonCalculator = () => {
  const [formData, setFormData] = useState({
    distance: '',
    weight: '',
    transportMode: 'truck',
    fuelType: 'diesel'
  });
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [carEquivalent, setCarEquivalent] = useState(null);

  const emissionFactors = {
    truck: { diesel: 0.161, electric: 0.053, hybrid: 0.095 },
    air: { jet: 0.57, biofuel: 0.34 },
    ship: { heavy: 0.014, lng: 0.008 },
    train: { diesel: 0.041, electric: 0.006 }
  };

  const calculateCarbon = async () => {
    if (!formData.distance || !formData.weight) return;

    setLoading(true);
    setError(null);

    try {
      const result = await carbonAPI.calculateCarbon({
        distance: parseFloat(formData.distance),
        weight: parseFloat(formData.weight),
        transportMode: formData.transportMode,
        fuelType: formData.fuelType
      });

      setCarbonFootprint(result.carbonFootprint);
      setCarEquivalent(result.carEquivalent);
      setSuggestions(result.suggestions);
    } catch (err) {
      setError(err.message);
      console.error('Carbon calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = (currentEmissions, mode) => {
    const suggestions = [];

    if (mode === 'truck') {
      const electricEmissions = parseFloat(formData.distance) * parseFloat(formData.weight) * emissionFactors.truck.electric;
      suggestions.push({
        type: 'Vehicle Type',
        suggestion: 'Switch to electric trucks',
        reduction: `${((currentEmissions - electricEmissions) / currentEmissions * 100).toFixed(1)}% reduction`,
        newEmissions: electricEmissions.toFixed(2)
      });
    }

    if (mode === 'air') {
      const shipEmissions = parseFloat(formData.distance) * parseFloat(formData.weight) * emissionFactors.ship.heavy;
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

    setSuggestions(suggestions);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="carbon-calculator">
      <h2><i className="fas fa-seedling"></i> Carbon Footprint Calculator</h2>

      <div className="calculator-form">
        <div className="form-group">
          <label><i className="fas fa-road"></i> Distance (km)</label>
          <input
            type="number"
            name="distance"
            value={formData.distance}
            onChange={handleInputChange}
            placeholder="Enter distance"
          />
        </div>

        <div className="form-group">
          <label><i className="fas fa-weight-hanging"></i> Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="Enter package weight"
          />
        </div>

        <div className="form-group">
          <label><i className="fas fa-shipping-fast"></i> Transport Mode</label>
          <select name="transportMode" value={formData.transportMode} onChange={handleInputChange}>
            <option value="truck"><i className="fas fa-truck"></i> Truck</option>
            <option value="air"><i className="fas fa-plane"></i> Air</option>
            <option value="ship"><i className="fas fa-ship"></i> Ship</option>
            <option value="train"><i className="fas fa-train"></i> Train</option>
          </select>
        </div>

        <div className="form-group">
          <label><i className="fas fa-gas-pump"></i> Fuel Type</label>
          <select name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
            {formData.transportMode === 'truck' && (
              <>
                <option value="diesel">⛽ Diesel</option>
                <option value="electric">🔋 Electric</option>
                <option value="hybrid">🔋⛽ Hybrid</option>
              </>
            )}
            {formData.transportMode === 'air' && (
              <>
                <option value="jet">✈️ Jet Fuel</option>
                <option value="biofuel">🌱 Biofuel</option>
              </>
            )}
            {formData.transportMode === 'ship' && (
              <>
                <option value="heavy">⛽ Heavy Fuel Oil</option>
                <option value="lng">💨 LNG</option>
              </>
            )}
            {formData.transportMode === 'train' && (
              <>
                <option value="diesel">⛽ Diesel</option>
                <option value="electric">🔋 Electric</option>
              </>
            )}
          </select>
        </div>

        <button onClick={calculateCarbon} className="calculate-btn" disabled={loading}>
          <i className="fas fa-calculator"></i> {loading ? 'Calculating...' : 'Calculate Carbon Footprint'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p><i className="fas fa-exclamation-triangle"></i> Error: {error}</p>
        </div>
      )}

      {carbonFootprint && (
        <div className="results">
          <div className="carbon-result">
            <h3>Carbon Emissions: {carbonFootprint} kg CO₂</h3>
            <p className="impact">That's equivalent to driving {carEquivalent || Math.round(carbonFootprint / 0.404)} km in an average car</p>
          </div>

          <div className="suggestions">
            <h3><i className="fas fa-lightbulb"></i> Greener Alternatives</h3>
            {suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-card">
                <h4>{suggestion.type}</h4>
                <p>{suggestion.suggestion}</p>
                <div className="reduction">
                  <span className="badge">{suggestion.reduction}</span>
                  <span className="new-emissions">New emissions: {suggestion.newEmissions} kg CO₂</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonCalculator;