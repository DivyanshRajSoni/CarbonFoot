# 🎨 How to Add Your Logo to CarbonFoot

## 📁 Step 1: Add Your Logo File
1. Place your `logo.png` file in the following directory:
   ```
   eco-shipping-tracker/src/assets/logo.png
   ```

## 🔧 Step 2: Update the Code
Once you've added your logo.png file, make these changes in `src/App.jsx`:

### Uncomment the import line:
```javascript
// Change this:
// import logo from './assets/logo.png' // Uncomment when you add your logo.png file

// To this:
import logo from './assets/logo.png'
```

### Update the header section:
```javascript
// Comment out the placeholder:
{/* Placeholder for logo - replace with your logo.png */}
{/*
<div className="logo-placeholder">
  <i className="fas fa-globe-americas"></i>
</div>
*/}

// Uncomment the actual logo:
<img src={logo} alt="CarbonFoot Logo" className="app-logo" />
```

## 📐 Logo Specifications
For best results, your logo should be:
- **Format**: PNG (with transparent background preferred)
- **Size**: 300x300 pixels or larger (square ratio)
- **Style**: Simple, clean design that works at small sizes
- **Colors**: Should work well with the green/blue theme

## 🎯 Current Placeholder
Right now, the app shows a beautiful gradient circle with a globe icon as a placeholder. Once you add your logo, it will replace this placeholder perfectly!

## ✨ Result
Your logo will appear:
- Next to the "CarbonFoot" title in the header
- As a 60x60 pixel circular image
- With a subtle shadow effect
- Perfectly aligned with the brand design

Perfect for your Hackathon 2025 presentation! 🏆