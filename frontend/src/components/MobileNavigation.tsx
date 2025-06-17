import React from 'react';

export type MobileNavView = 'tabs' | 'menu' | 'past_orders';

interface MobileNavigationProps {
  currentView: MobileNavView;
  onNavigateTabs: () => void;
  onNavigateMenu: () => void;
  onNavigateToPastOrders: () => void;
  isMenuDisabled?: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  onNavigateTabs,
  onNavigateMenu,
  onNavigateToPastOrders,
  isMenuDisabled = false,
}) => {
  const buttonBaseStyle = "flex flex-col items-center justify-center p-2 rounded-md flex-1";
  const activeStyle = "text-cyan-600";
  const inactiveStyle = "text-slate-700 hover:text-cyan-600";
  const disabledStyle = "opacity-50 cursor-not-allowed";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-md p-2 flex justify-around items-center z-50">
      {/* Tabs Button */}
      <button
        onClick={onNavigateTabs}
        className={`${buttonBaseStyle} ${currentView === 'tabs' ? activeStyle : inactiveStyle}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6 mb-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <span className="text-xs font-medium">Tabs</span>
      </button>

      {/* Menu Button */}
      <button
        onClick={onNavigateMenu}
        disabled={isMenuDisabled}
        className={`${buttonBaseStyle} ${isMenuDisabled ? disabledStyle : (currentView === 'menu' ? activeStyle : inactiveStyle)}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6 mb-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <span className="text-xs font-medium">Menu</span>
      </button>

      {/* Past Orders Button - Always show */}
      <button
        onClick={onNavigateToPastOrders}
        className={`${buttonBaseStyle} ${currentView === 'past_orders' ? activeStyle : inactiveStyle}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6 mb-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.708c-1.21-.092-2.43-.138-3.662-.138s-2.453.046-3.662.138a4.006 4.006 0 00-3.7 3.708c-.092 1.21-.138 2.43-.138 3.662s.046 2.453.138 3.662a4.006 4.006 0 003.7 3.708c1.21.092 2.43.138 3.662.138s2.453-.046 3.662-.138a4.006 4.006 0 003.7-3.708c.092-1.21.138-2.43.138-3.662zM12 6v6l4.5 2.25" />
        </svg>
        <span className="text-xs font-medium">History</span>
      </button>
    </div>
  );
};

export default MobileNavigation; 