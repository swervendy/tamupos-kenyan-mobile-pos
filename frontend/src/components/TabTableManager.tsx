import React, { useState } from 'react';
import { useOrder } from '../contexts/OrderContext';
import { Tab, Table } from '../types';

interface TabTableManagerProps {
  mode: 'tab' | 'table';
}

const TabTableManager: React.FC<TabTableManagerProps> = ({ mode }) => {
  const { 
    state, 
    createTab, 
    createTable, 
    switchToTab, 
    switchToTable, 
    closeTab, 
    closeTable 
  } = useOrder();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTableNumber, setNewTableNumber] = useState('');

  const handleCreate = () => {
    if (mode === 'tab' && newName.trim()) {
      createTab(newName.trim());
      setNewName('');
    } else if (mode === 'table' && newTableNumber.trim()) {
      const tableNum = parseInt(newTableNumber.trim());
      if (!isNaN(tableNum) && tableNum > 0) {
        createTable(tableNum);
        setNewTableNumber('');
      }
    }
    setShowCreateForm(false);
  };

  const handleSwitch = (item: Tab | Table) => {
    if (mode === 'tab') {
      switchToTab((item as Tab).id);
    } else {
      switchToTable((item as Table).id);
    }
  };

  const handleClose = (item: Tab | Table) => {
    if (mode === 'tab') {
      closeTab((item as Tab).id);
    } else {
      closeTable((item as Table).id);
    }
  };

  const items = mode === 'tab' ? state.tabs : state.tables;
  const currentId = mode === 'tab' ? state.currentTabId : state.currentTableId;

  const getItemDisplay = (item: Tab | Table) => {
    if (mode === 'tab') {
      return (item as Tab).customerName;
    } else {
      return `Table ${(item as Table).number}`;
    }
  };

  const getItemTotal = (item: Tab | Table) => {
    return item.cart.reduce((total, cartItem) => 
      total + (cartItem.foodItem.price * cartItem.quantity), 0
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {mode === 'tab' ? 'Customer Tabs' : 'Tables'}
        </h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New {mode === 'tab' ? 'Tab' : 'Table'}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex space-x-2">
            <input
              type={mode === 'table' ? 'number' : 'text'}
              placeholder={mode === 'tab' ? 'Customer Name' : 'Table Number'}
              value={mode === 'tab' ? newName : newTableNumber}
              onChange={(e) => mode === 'tab' ? setNewName(e.target.value) : setNewTableNumber(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreate}
              className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewName('');
                setNewTableNumber('');
              }}
              className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            {mode === 'tab' ? '👥' : '🪑'}
          </div>
          <p className="text-gray-500 text-sm">
            No {mode === 'tab' ? 'customer tabs' : 'tables'} open
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Create a new {mode} to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                item.id === currentId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleSwitch(item)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {getItemDisplay(item)}
                    </h4>
                    {item.id === currentId && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {item.cart.length} items
                    </p>
                    <p className="text-sm font-semibold text-green-600">
                      KSh {getItemTotal(item).toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose(item);
                  }}
                  className="ml-2 text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Cart Preview */}
              {item.cart.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="space-y-1">
                    {item.cart.slice(0, 2).map((cartItem) => (
                      <div key={cartItem.foodItemId} className="flex justify-between text-xs text-gray-600">
                        <span>{cartItem.quantity}x {cartItem.foodItem.name}</span>
                        <span>KSh {(cartItem.foodItem.price * cartItem.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {item.cart.length > 2 && (
                      <p className="text-xs text-gray-400">
                        +{item.cart.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TabTableManager; 