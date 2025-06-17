import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import AuthGuard from './components/AuthGuard';
import ModeSelector from './components/ModeSelector';
import POSInterface from './components/POSInterface';
import { useAuth } from './contexts/AuthContext';
import { OrderMode } from './types';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<OrderMode | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const { user } = useAuth();

  // Available Operating Modes Configuration
  const [tabModeEnabled, setTabModeEnabled] = useState(true);
  const [tableModeEnabled, setTableModeEnabled] = useState(true);
  const [takeAwayModeEnabled, setTakeAwayModeEnabled] = useState(true);

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleModeSelect = (mode: OrderMode) => {
    setSelectedMode(mode);
    setShowModeSelector(false);
  };

  const handleBackToModeSelection = () => {
    setShowModeSelector(true);
    setSelectedMode(null);
  };

  // Auto-select tab mode for now (skip mode selector)
  React.useEffect(() => {
    if (!selectedMode && !showModeSelector) {
      setSelectedMode('tab'); // Default to tab mode
    }
  }, [selectedMode, showModeSelector]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-4">😋TamuPOS</h1>
            <p className="text-xl text-blue-100">Mobile Point of Sale System</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
          <p className="text-white mt-4">Loading your POS system...</p>
        </div>
      </div>
    );
  }

  return (
    <OrderProvider>
      <div className="min-h-screen">
        {showModeSelector || !selectedMode ? (
          <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-600 via-purple-600 to-green-600">
            <div className="w-full">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4">😋TamuPOS</h1>
                <p className="text-xl text-blue-100 mb-2">Mobile Point of Sale System</p>
                <p className="text-lg text-white/80">Choose your service mode</p>
              </div>
              <ModeSelector 
                onModeSelect={handleModeSelect} 
                tabModeEnabled={tabModeEnabled}
                tableModeEnabled={tableModeEnabled}
                takeAwayModeEnabled={takeAwayModeEnabled}
              />
            </div>
          </div>
        ) : (
          <POSInterface 
            mode={selectedMode} 
            onNavigateToModeSelector={handleBackToModeSelection}
            tabModeEnabled={tabModeEnabled}
            setTabModeEnabled={setTabModeEnabled}
            tableModeEnabled={tableModeEnabled}
            setTableModeEnabled={setTableModeEnabled}
            takeAwayModeEnabled={takeAwayModeEnabled}
            setTakeAwayModeEnabled={setTakeAwayModeEnabled}
          />
        )}
      </div>
    </OrderProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <AppContent />
      </AuthGuard>
    </AuthProvider>
  );
}

export default App; 