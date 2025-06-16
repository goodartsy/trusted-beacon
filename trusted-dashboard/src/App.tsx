// src/App.tsx

import React from 'react';
import TrustedAdBeaconDashboard from './components/TrustedAdBeaconDashboard';
import './index.css'; // Falls noch nicht, damit Tailwind greift

function App() {
  return (
    <div className="h-screen bg-gray-50">
      <TrustedAdBeaconDashboard />
    </div>
  );
}

export default App;
