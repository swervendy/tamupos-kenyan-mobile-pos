import React, { useState } from 'react';
import LeftNavigationBar from './LeftNavigationBar';
import MobileNavigation from './MobileNavigation';
import { OrderMode } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface SettingsPageProps {
  testMode: boolean;
  setTestMode: (testMode: boolean) => void;
  showMenuImages: boolean;
  setShowMenuImages: (showImages: boolean) => void;
  onBack: () => void;
  onNavigateToModeSelector: () => void;
  currentMode: OrderMode;
  onNavigateToMenu?: () => void;
  onNavigateToMenuManagement?: () => void;
  onNavigateToPastOrders?: () => void;

  // Restaurant Config Props
  restaurantName: string;
  setRestaurantName: (name: string) => void;
  restaurantAddress: string;
  setRestaurantAddress: (address: string) => void;
  restaurantPhone: string;
  setRestaurantPhone: (phone: string) => void;
  kraPin: string;
  setKraPin: (pin: string) => void;
  mpesaPaybill: string;
  setMpesaPaybill: (paybill: string) => void;

  // Available Modes Config
  tabModeEnabled: boolean;
  setTabModeEnabled: (enabled: boolean) => void;
  tableModeEnabled: boolean;
  setTableModeEnabled: (enabled: boolean) => void;
  takeAwayModeEnabled: boolean;
  setTakeAwayModeEnabled: (enabled: boolean) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  testMode,
  setTestMode,
  showMenuImages,
  setShowMenuImages,
  onBack,
  onNavigateToModeSelector,
  currentMode,
  onNavigateToMenu,
  onNavigateToMenuManagement,
  onNavigateToPastOrders,
  // Restaurant Config
  restaurantName,
  setRestaurantName,
  restaurantAddress,
  setRestaurantAddress,
  restaurantPhone,
  setRestaurantPhone,
  kraPin,
  setKraPin,
  mpesaPaybill,
  setMpesaPaybill,
  // Available Modes Config
  tabModeEnabled,
  setTabModeEnabled,
  tableModeEnabled,
  setTableModeEnabled,
  takeAwayModeEnabled,
  setTakeAwayModeEnabled,
}) => {
  // Helper for input fields
  const renderInput = (label: string, value: string, onChange: (val: string) => void, placeholder = '', type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
      />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-100 md:flex-row flex-col">
      {/* Left Navigation Bar - Desktop only */}
      <div className="hidden md:block md:relative">
        <LeftNavigationBar 
          onNavigateHome={onBack}
          currentMode={currentMode}
          activeSection="settings"
          onNavigateToModeSelector={onNavigateToModeSelector}
          onSelectMenu={onNavigateToMenu || onBack}
          onNavigateToSettings={() => {}} // Already on settings
          onNavigateToMenuManagement={onNavigateToMenuManagement}
          onNavigateToPastOrders={onNavigateToPastOrders}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-slate-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            {/* Mobile Back Button */}
            <button 
              onClick={onBack}
              className="md:hidden text-gray-600 hover:text-gray-800 mr-2 p-2 rounded-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            {/* Title - Consistent with other pages */}
            <h1 className="text-xl text-slate-700 flex-1 truncate text-center">
              Settings
            </h1>

            {/* Spacer for mobile to center title */}
            <div className="w-10 md:hidden"></div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-4 sm:p-6 pb-20 md:pb-6">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            
            {/* Interface Settings - Moved to top */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                {/* Using a sliders icon for Interface settings */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                Interface
              </h2>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Test Mode Setting - Moved to top of Interface */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-base sm:text-lg mr-2">{testMode ? '🧪' : '📱'}</span>
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">Test Mode</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {testMode 
                        ? 'Simulate payments for development and testing' 
                        : 'Real M-Pesa payments enabled (default for production)'
                      }
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={testMode}
                      onChange={(e) => setTestMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                {/* Menu Images Setting - Moved below Test Mode */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-base sm:text-lg mr-2">🖼️</span>
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">Menu Images</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Show image placeholders on menu item cards</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showMenuImages}
                      onChange={(e) => setShowMenuImages(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Restaurant Configuration Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Restaurant Details
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {renderInput('Restaurant Name', restaurantName, setRestaurantName, "e.g., Peponi's Place")}
                {renderInput('Address', restaurantAddress, setRestaurantAddress, 'e.g., Westgate Mall, 2nd Floor, Unit 43, Westlands')}
                {renderInput('Phone Number', restaurantPhone, setRestaurantPhone, 'e.g., 0722456789')}
                {renderInput('KRA PIN', kraPin, setKraPin, 'e.g., P001987654Q')}
                {renderInput('M-Pesa Paybill Number', mpesaPaybill, setMpesaPaybill, 'e.g., 400200')}
              </div>
            </div>

            {/* Available Modes Indicator */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Available Operating Modes
                </h3>
                <span className="text-xs text-gray-500">
                  {[tabModeEnabled, tableModeEnabled, takeAwayModeEnabled].filter(Boolean).length} of 3 enabled
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* Tab Mode Indicator */}
                <div className={`flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                  tabModeEnabled 
                    ? currentMode === 'tab'
                      ? 'border-green-300 bg-green-50 ring-2 ring-green-200'
                      : 'border-green-200 bg-green-25'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <span className="text-lg sm:text-xl mb-1">👥</span>
                  <span className="text-xs font-medium text-center text-gray-700">Tab Mode</span>
                  {currentMode === 'tab' && (
                    <span className="text-xs text-green-600 font-medium mt-1">Active</span>
                  )}
                </div>

                {/* Table Service Indicator */}
                <div className={`flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                  tableModeEnabled 
                    ? currentMode === 'table'
                      ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-blue-200 bg-blue-25'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <span className="text-lg sm:text-xl mb-1">🪑</span>
                  <span className="text-xs font-medium text-center text-gray-700">Table Service</span>
                  {currentMode === 'table' && (
                    <span className="text-xs text-blue-600 font-medium mt-1">Active</span>
                  )}
                </div>

                {/* Quick Takeaway Indicator */}
                <div className={`flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                  takeAwayModeEnabled 
                    ? currentMode === 'takeAway'
                      ? 'border-orange-300 bg-orange-50 ring-2 ring-orange-200'
                      : 'border-orange-200 bg-orange-25'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <span className="text-lg sm:text-xl mb-1">🥡</span>
                  <span className="text-xs font-medium text-center text-gray-700">Quick Takeaway</span>
                  {currentMode === 'takeAway' && (
                    <span className="text-xs text-orange-600 font-medium mt-1">Active</span>
                  )}
                </div>
              </div>
            </div>

            {/* Operating Modes Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18m-7.5-14L21 7.5m0 0L16.5 12M21 7.5H3" />
                </svg>
                Operating Modes
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Configure which operating modes are available for your restaurant. You can disable modes that don't apply to your business.
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Tab Mode */}
                <div className={`p-3 sm:p-4 rounded-lg border ${
                  currentMode === 'tab' 
                    ? 'bg-green-50 border-green-200 ring-2 ring-green-500 ring-opacity-20' 
                    : tabModeEnabled
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-gray-100 border-gray-300 opacity-75'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">Tab Mode</h3>
                          {currentMode === 'tab' && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          Open multiple customer tabs and manage orders separately
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                            Multiple customer tabs
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                            Switch between customers
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                            Individual billing
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tabModeEnabled}
                          onChange={(e) => setTabModeEnabled(e.target.checked)}
                          disabled={currentMode === 'tab'}
                          className="sr-only peer disabled:cursor-not-allowed"
                        />
                        <div className={`w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-cyan-500 ${
                          currentMode === 'tab' ? 'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed' : ''
                        }`}></div>
                      </label>
                    </div>
                  </div>
                  {currentMode === 'tab' && (
                    <div className="mt-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      Cannot disable the currently active mode
                    </div>
                  )}
                </div>

                {/* Table Service */}
                <div className={`p-3 sm:p-4 rounded-lg border ${
                  currentMode === 'table' 
                    ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-20' 
                    : tableModeEnabled
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-gray-100 border-gray-300 opacity-75'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">🪑</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">Table Service</h3>
                          {currentMode === 'table' && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          Assign orders to specific table numbers for dine-in service
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                            Table number assignment
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                            Dine-in service
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                            Table management
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tableModeEnabled}
                          onChange={(e) => setTableModeEnabled(e.target.checked)}
                          disabled={currentMode === 'table'}
                          className="sr-only peer disabled:cursor-not-allowed"
                        />
                        <div className={`w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-cyan-500 ${
                          currentMode === 'table' ? 'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed' : ''
                        }`}></div>
                      </label>
                    </div>
                  </div>
                  {currentMode === 'table' && (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Cannot disable the currently active mode
                    </div>
                  )}
                </div>

                {/* Quick Takeaway */}
                <div className={`p-3 sm:p-4 rounded-lg border ${
                  currentMode === 'takeAway' 
                    ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-500 ring-opacity-20' 
                    : takeAwayModeEnabled
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-gray-100 border-gray-300 opacity-75'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">🥡</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">Quick Takeaway</h3>
                          {currentMode === 'takeAway' && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          Fast orders for takeaway and delivery customers
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></div>
                            Quick ordering
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></div>
                            No table assignment
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></div>
                            Fast checkout
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={takeAwayModeEnabled}
                          onChange={(e) => setTakeAwayModeEnabled(e.target.checked)}
                          disabled={currentMode === 'takeAway'}
                          className="sr-only peer disabled:cursor-not-allowed"
                        />
                        <div className={`w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-cyan-500 ${
                          currentMode === 'takeAway' ? 'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed' : ''
                        }`}></div>
                      </label>
                    </div>
                  </div>
                  {currentMode === 'takeAway' && (
                    <div className="mt-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      Cannot disable the currently active mode
                    </div>
                  )}
                </div>

                {/* Switch Mode Button */}
                <div className="pt-2">
                  <button
                    onClick={onNavigateToModeSelector}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18m-7.5-14L21 7.5m0 0L16.5 12M21 7.5H3" />
                    </svg>
                    Switch Operating Mode
                  </button>
                </div>
              </div>
            </div>

            {/* App Info */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
                About
              </h2>
              
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>App Name:</span>
                  <span className="font-medium text-gray-900">😋TamuPOS</span>
                </div>
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-medium text-gray-900">1.2.1</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation
          currentView="menu" // Using "menu" as closest match since settings isn't a main view
          onNavigateTabs={onNavigateToModeSelector}
          onNavigateMenu={onNavigateToMenu || onBack}
          onNavigateModes={onNavigateToModeSelector}
          onNavigateToPastOrders={onNavigateToPastOrders || (() => {})}
          isMenuDisabled={false}
        />
      </div>
    </div>
  );
};

export default SettingsPage; 