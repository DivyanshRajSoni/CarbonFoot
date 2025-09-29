import { useState } from 'react';
import { packagingAPI } from '../services/api';

const PackagingTracker = () => {
  const [packageInfo, setPackageInfo] = useState({
    dimensions: { length: '', width: '', height: '' },
    weight: '',
    itemType: 'electronics',
    fragility: 'medium'
  });
  const [recommendations, setRecommendations] = useState([]);
  const [currentPackaging, setCurrentPackaging] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const calculateVolume = () => {
    const { length, width, height } = packageInfo.dimensions;
    return parseFloat(length) * parseFloat(width) * parseFloat(height);
  };

  const generateRecommendations = async () => {
    const { length, width, height } = packageInfo.dimensions;
    const weight = parseFloat(packageInfo.weight);

    if (!length || !width || !height || !weight) return;

    setLoading(true);
    setError(null);

    try {
      const result = await packagingAPI.getRecommendations({
        dimensions: {
          length: parseFloat(length),
          width: parseFloat(width),
          height: parseFloat(height)
        },
        weight: weight,
        itemType: packageInfo.itemType,
        fragility: packageInfo.fragility
      });

      setRecommendations(result.recommendations);
    } catch (err) {
      setError(err.message);
      console.error('Packaging recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (option, volume, weight) => {
    let score = option.sustainability;

    if (packageInfo.fragility === 'high' && option.name.includes('Mushroom')) score += 10;
    if (volume > 1000 && option.cost === 'Low') score += 5;
    if (weight > 5 && option.name.includes('Cardboard')) score += 5;

    return score;
  };

  const calculateCost = (option, volume, weight) => {
    const baseCosts = { Low: 2, Medium: 5, High: 12 };
    const volumeFactor = Math.max(1, volume / 1000);
    const weightFactor = Math.max(1, weight / 2);

    return (baseCosts[option.cost] * volumeFactor * weightFactor).toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('dimensions.')) {
      const dimension = name.split('.')[1];
      setPackageInfo({
        ...packageInfo,
        dimensions: {
          ...packageInfo.dimensions,
          [dimension]: value
        }
      });
    } else {
      setPackageInfo({
        ...packageInfo,
        [name]: value
      });
    }
  };

  const selectPackaging = (option) => {
    setCurrentPackaging(option);
  };

  return (
    <div className="packaging-tracker">
      <h2><i className="fas fa-box-open"></i> Eco-Friendly Packaging Tracker</h2>

      <div className="package-form">
        <div className="form-row">
          <div className="form-group">
            <label>Length (cm)</label>
            <input
              type="number"
              name="dimensions.length"
              value={packageInfo.dimensions.length}
              onChange={handleInputChange}
              placeholder="Length"
            />
          </div>
          <div className="form-group">
            <label>Width (cm)</label>
            <input
              type="number"
              name="dimensions.width"
              value={packageInfo.dimensions.width}
              onChange={handleInputChange}
              placeholder="Width"
            />
          </div>
          <div className="form-group">
            <label>Height (cm)</label>
            <input
              type="number"
              name="dimensions.height"
              value={packageInfo.dimensions.height}
              onChange={handleInputChange}
              placeholder="Height"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={packageInfo.weight}
              onChange={handleInputChange}
              placeholder="Package weight"
            />
          </div>
          <div className="form-group">
            <label>Item Type</label>
            <select name="itemType" value={packageInfo.itemType} onChange={handleInputChange}>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="fragile">Fragile Items</option>
              <option value="food">Food</option>
              <option value="documents">Documents</option>
              <option value="cosmetics">Cosmetics</option>
              <option value="luxury">Luxury Goods</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fragility</label>
            <select name="fragility" value={packageInfo.fragility} onChange={handleInputChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <button onClick={generateRecommendations} className="analyze-btn" disabled={loading}>
          <i className="fas fa-search"></i> {loading ? 'Analyzing...' : 'Get Packaging Recommendations'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p><i className="fas fa-exclamation-triangle"></i> Error: {error}</p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h3><i className="fas fa-recycle"></i> Recommended Eco-Friendly Options</h3>
          <div className="packaging-options">
            {recommendations.map((option, index) => (
              <div key={option.key} className={`packaging-card ${index === 0 ? 'best-choice' : ''}`}>
                {index === 0 && <div className="best-badge">Best Choice</div>}

                <h4>{option.name}</h4>

                <div className="sustainability-meter">
                  <div className="meter-label">Sustainability Score</div>
                  <div className="meter">
                    <div
                      className="meter-fill"
                      style={{ width: `${option.sustainability}%` }}
                    ></div>
                  </div>
                  <span className="meter-value">{option.sustainability}/100</span>
                </div>

                <div className="packaging-details">
                  <div className="detail-item">
                    <span className="label">Cost:</span>
                    <span className="value">${option.estimatedCost}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">CO₂ Impact:</span>
                    <span className="value">{option.co2Impact} kg CO₂</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Recyclable:</span>
                    <span className={`badge ${option.recyclable ? 'yes' : 'no'}`}>
                      {option.recyclable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Biodegradable:</span>
                    <span className={`badge ${option.biodegradable ? 'yes' : 'no'}`}>
                      {option.biodegradable ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => selectPackaging(option)}
                  className="select-btn"
                >
                  <i className="fas fa-check"></i> Select This Option
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentPackaging && (
        <div className="selected-packaging">
          <h3><i className="fas fa-check-circle"></i> Selected Packaging</h3>
          <div className="selection-summary">
            <h4>{currentPackaging.name}</h4>
            <p>Estimated Cost: ${currentPackaging.estimatedCost}</p>
            <p>CO₂ Impact: {currentPackaging.co2Impact} kg</p>
            <p className="sustainability-note">
              This choice will save approximately {(1.2 - currentPackaging.co2Impact).toFixed(1)} kg CO₂
              compared to traditional plastic packaging!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagingTracker;