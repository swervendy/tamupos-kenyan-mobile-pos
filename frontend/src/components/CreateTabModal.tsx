import React, { useState, useEffect } from 'react';

interface CreateTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTab: (customerName: string) => void;
}

const CreateTabModal: React.FC<CreateTabModalProps> = ({ isOpen, onClose, onCreateTab }) => {
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCustomerName(''); // Reset name when modal opens
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (customerName.trim()) {
      onCreateTab(customerName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Tab</h2>
        <input
          type="text"
          placeholder="Customer Name for New Tab"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && customerName.trim()) {
              handleSubmit();
            }
          }}
          autoFocus
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!customerName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-md disabled:bg-gray-300"
          >
            Create Tab
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTabModal; 