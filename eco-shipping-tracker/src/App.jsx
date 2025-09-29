import { useState } from 'react'
import './App.css'
import CarbonCalculator from './components/CarbonCalculator'
import PackagingTracker from './components/PackagingTracker'
import RouteOptimizer from './components/RouteOptimizer'
import logo from './assets/logo.png'

function App() {
  const [activeTab, setActiveTab] = useState('carbon')

  const tabs = [
    { id: 'carbon', label: <><i className="fas fa-leaf"></i> Carbon Calculator</>, component: CarbonCalculator },
    { id: 'packaging', label: <><i className="fas fa-box"></i> Packaging Tracker</>, component: PackagingTracker },
    { id: 'routes', label: <><i className="fas fa-route"></i> Route Optimizer</>, component: RouteOptimizer }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-container">
          <img src={logo} alt="CarbonFoot Logo" className="app-logo" />
          <h1>CarbonFoot</h1>
        </div>
        <p>Sustainable Shipping & Efficiency Platform</p>
      </header>

      <nav className="app-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {ActiveComponent && <ActiveComponent />}
      </main>

      <footer className="app-footer">
        <p>Built for sustainable shipping solutions • Hackathon 2025</p>
      </footer>
    </div>
  )
}

export default App
