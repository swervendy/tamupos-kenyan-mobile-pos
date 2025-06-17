import React from 'react';
import { OrderMode } from '../types';

// Define IconType to ensure type safety for icon SVGs if needed, or just use React.ReactNode
// For simplicity, we'll use React.ReactNode as icons are directly embedded SVGs.

interface NavItem {
  id: string;
  name: string;
  icon: React.ReactNode; // Changed from a specific IconType to React.ReactNode
  action?: () => void;
  disabled?: boolean;
}

interface LeftNavigationBarProps {
  onNavigateHome: () => void;
  currentMode: OrderMode;
  activeSection: 'open_tabs' | 'menu' | 'bills' | 'settings' | 'menu_management';
  onSelectMenu: () => void;
  onNavigateToSettings: () => void;
  onNavigateToMenuManagement?: () => void;
  onNavigateToPastOrders?: () => void;
}

const LeftNavigationBar: React.FC<LeftNavigationBarProps> = ({
  onNavigateHome,
  currentMode,
  activeSection,
  onSelectMenu,
  onNavigateToSettings,
  onNavigateToMenuManagement,
  onNavigateToPastOrders,
}) => {
  const isTabMode = currentMode === 'tab';

  const navItemsTop: NavItem[] = [
    isTabMode 
      ? { 
          id: 'open_tabs', 
          name: 'Manage Tabs', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          ),
          action: onNavigateHome 
        }
      : { 
          id: 'menu', // Represents the main order/menu screen when not in tab mode
          name: 'Order', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          ), 
          action: onNavigateHome 
        },
    {
      id: 'menu', // This is the direct navigation to Menu section, distinct from 'Order' or 'Open Tabs' as home
      name: 'Menu', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6">
           {/* Using a document icon for Menu */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      action: onSelectMenu,
      disabled: false,
    },
    {
      id: 'bills', // Consider renaming id to 'past_orders' for clarity if no backend dependency
      name: 'Past Orders',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6">
          {/* Using a history or receipt icon might be more suitable */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.708c-1.21-.092-2.43-.138-3.662-.138s-2.453.046-3.662.138a4.006 4.006 0 00-3.7 3.708c-.092 1.21-.138 2.43-.138 3.662s.046 2.453.138 3.662a4.006 4.006 0 003.7 3.708c1.21.092 2.43.138 3.662.138s2.453-.046 3.662-.138a4.006 4.006 0 003.7-3.708c.092-1.21.138-2.43.138-3.662zM12 6v6l4.5 2.25" /> 
        </svg>
      ),
      action: onNavigateToPastOrders,
      disabled: false, // No longer conditionally disabled
    },
    // Conditionally add Menu Management if its handler is provided
    ...(onNavigateToMenuManagement ? [{
      id: 'menu_management',
      name: 'Manage Menu',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
        </svg>
      ),
      action: onNavigateToMenuManagement,
      disabled: false,
    }] : []),
  ];

  const navItemsBottom: NavItem[] = [
    {
      id: 'settings',
      name: 'Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.78.93l-.15.893c-.09.543-.56.94-1.11.94h-1.094c-.55 0-1.019-.397-1.11-.94l-.149-.893c-.07-.425-.383-.765-.78-.93-.398-.165-.854-.143-1.204.107l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.383.93-.78.165-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.149-.893zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      action: onNavigateToSettings,
      disabled: false,
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-20 bg-white shadow-lg flex flex-col justify-between items-center py-4 z-30">
      {/* Top Navigation Icons */}
      <div className="space-y-3">
        {navItemsTop.map(item => (
          <button
            key={item.id}
            onClick={item.action}
            disabled={item.disabled}
            className={`p-3 rounded-xl flex flex-col items-center space-y-1 w-16 transition-all duration-150 ease-in-out 
                        ${activeSection === item.id 
                          ? 'text-cyan-500' // Active style: cyan text
                          : 'text-slate-500 hover:text-cyan-500'} // Inactive style: slate text, hover cyan
                        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={item.name}
          >
            {item.icon} {/* Render the SVG icon */}
            <span className="text-xs font-medium">{item.name}</span>
          </button>
        ))}
      </div>

      {/* Bottom Navigation Icons - Settings and Management */}
      <div className="space-y-3">
        {navItemsBottom.map(item => (
          <button
            key={item.id}
            onClick={item.action}
            disabled={item.disabled}
            className={`p-3 rounded-xl flex flex-col items-center space-y-1 w-16 transition-all duration-150 ease-in-out 
                        ${activeSection === item.id 
                          ? 'text-cyan-500' // Active style: cyan text
                          : 'text-slate-500 hover:text-cyan-500'} // Inactive style: slate text, hover cyan
                        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={item.name}
          >
            {item.icon} {/* Render the SVG icon */}
            <span className="text-xs font-medium">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeftNavigationBar;