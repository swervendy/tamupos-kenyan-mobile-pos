import React from 'react';
// import { OrderMode } from '../App'; // Will use global OrderMode
import { OrderMode } from '../types';

interface ModeSelectorProps {
  onModeSelect: (mode: OrderMode) => void;
  tabModeEnabled?: boolean;
  tableModeEnabled?: boolean;
  takeAwayModeEnabled?: boolean;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ 
  onModeSelect, 
  tabModeEnabled = true, 
  tableModeEnabled = true, 
  takeAwayModeEnabled = true 
}) => {
  const allModes = [
    {
      id: 'tab' as OrderMode,
      title: 'Tab Mode',
      description: 'Open multiple customer tabs and manage orders separately',
      icon: '👥',
      color: 'from-green-500 to-emerald-600',
      hoverColor: 'hover:from-green-600 hover:to-emerald-700',
      features: ['Multiple customer tabs', 'Switch between customers', 'Individual billing'],
      enabled: tabModeEnabled
    },
    {
      id: 'table' as OrderMode,
      title: 'Table Service',
      description: 'Assign orders to specific table numbers for dine-in service',
      icon: '🪑',
      color: 'from-blue-500 to-indigo-600',
      hoverColor: 'hover:from-blue-600 hover:to-indigo-700',
      features: ['Table number assignment', 'Dine-in service', 'Table management'],
      enabled: tableModeEnabled
    },
    {
      id: 'takeAway' as OrderMode,
      title: 'Quick Takeaway',
      description: 'Fast orders for takeaway and delivery customers',
      icon: '🥡',
      color: 'from-orange-500 to-red-600',
      hoverColor: 'hover:from-orange-600 hover:to-red-700',
      features: ['Quick ordering', 'No table assignment', 'Fast checkout'],
      enabled: takeAwayModeEnabled
    }
  ];

  // Filter to only show enabled modes
  const availableModes = allModes.filter(mode => mode.enabled);

  // If no modes are enabled, show a message
  if (availableModes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Operating Modes Available</h2>
          <p className="text-gray-600 text-lg mb-6">
            All operating modes have been disabled. Please enable at least one mode in Settings to continue.
          </p>
          <div className="text-sm text-gray-500">
            Contact your administrator to configure available operating modes.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
        <div className={`grid grid-cols-1 ${availableModes.length === 1 ? 'max-w-md mx-auto' : availableModes.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
          {availableModes.map((mode) => (
            <div
              key={mode.id}
              onClick={() => onModeSelect(mode.id)}
              className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-105 p-4"
            >
              <div className="text-4xl sm:text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                {mode.icon}
              </div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2 text-white/95">
                {mode.title}
              </h3>
              <p className="text-sm text-white/75 mb-3 leading-relaxed">
                {mode.description}
              </p>
              <p className="text-xs text-white/60 font-medium">
                Use {mode.id === 'takeAway' ? 'Takeout' : mode.id === 'table' ? 'Table' : 'Tab'} mode
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModeSelector; 