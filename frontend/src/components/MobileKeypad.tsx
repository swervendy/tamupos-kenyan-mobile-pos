import React, { useEffect, useRef } from 'react';

interface MobileKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  onClose?: () => void; // Add close handler prop
}

const MobileKeypad: React.FC<MobileKeypadProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  maxLength = 12,
  onClose
}) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the hidden input for accessibility and to potentially allow pasting.
    // hiddenInputRef.current?.focus(); // We'll remove this to prevent mobile keyboard on demo

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault(); // Prevent default for all handled keys

      if (event.key >= '0' && event.key <= '9') {
        if (value.length < maxLength) {
          onChange(value + event.key);
        }
      } else if (event.key === 'Backspace') {
        onChange(value.slice(0, -1));
      } else if (event.key === 'Enter') {
        // Ensure onSubmit is only called if the value meets submission criteria (e.g., length)
        // This logic might need to align with the disabled state of the submit button
        if (value.length >= 9) { // Assuming 9 is the minimum length for submission
          onSubmit();
        }
      } else if (event.key === 'Escape' && onClose) {
        onClose();
      }
      // The 'clear' button on the virtual keypad doesn't have a direct standard keyboard equivalent for this demo.
      // We could map 'Escape' to clear if desired, but it's not explicitly requested.
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [value, onChange, onSubmit, maxLength, onClose]); // Add dependencies

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      onChange(value.slice(0, -1));
    } else if (key === 'clear') {
      onChange('');
    } else if (value.length < maxLength) {
      onChange(value + key);
    }
  };

  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '');
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const formatDisplayValue = (val: string) => {
    if (val.startsWith('254')) {
      return val.replace(/(\d{6})(\d{3})(\d{3})/, '$1 $2 $3');
    } else if (val.startsWith('0')) {
      return val.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return val;
  };

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'backspace']
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <input
        ref={hiddenInputRef}
        type="tel"
        value={value}
        onChange={handleHiddenInputChange}
        maxLength={maxLength}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Header with close button - only show if onClose is provided */}
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white md:hidden">
          <h2 className="text-xl font-bold text-gray-900">Customer Phone Number</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            aria-label="Close Keypad"
          >
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col p-4 min-h-0">
        {/* Title - hidden on mobile when close button is shown */}
        <div className={`text-center mb-4 pt-2 ${onClose ? 'hidden md:block' : 'block'}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Customer Phone Number</h2>
        </div>

        {/* Keypad-Display Unit Container */}
        <div className="bg-gray-100 p-2 rounded-xl mb-4 shadow flex-1 flex flex-col min-h-0">
          {/* Display - now part of the keypad unit */}
          <div className="bg-white rounded-lg shadow-sm py-[0.875rem] mb-2 flex-shrink-0">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-gray-900 mb-1 min-h-[36px] flex items-center justify-center">
                {formatDisplayValue(value) || ''}
              </div>
              <div className="text-xs text-gray-500">
                {value ? `${value.length}/${maxLength} digits` : 'Customer Safaricom number'}
              </div>
            </div>
          </div>

          {/* Keypad Grid - responsive sizing */}
          <div className="grid grid-cols-3 gap-2 flex-1">
            {keypadButtons.flat().map((key, index) => (
              <button
                key={index}
                onClick={() => handleKeyPress(key)}
                className={`
                  h-full min-h-[60px] md:h-20 rounded-lg font-semibold text-xl transition-all duration-100 active:scale-95 active:bg-opacity-80 flex items-center justify-center
                  ${key === 'clear' 
                    ? 'bg-red-400 text-white hover:bg-red-500 col-span-1' 
                    : key === 'backspace'
                    ? 'bg-gray-400 text-white hover:bg-gray-500 col-span-1'
                    : 'bg-white text-gray-800 hover:bg-gray-50 col-span-1'
                  }
                `}
              >
                {key === 'backspace' ? (
                  <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                  </svg>
                ) : key === 'clear' ? (
                  'Clear'
                ) : (
                  key
                )}
              </button>
            ))}
          </div>
        </div> {/* End of Keypad-Display Unit Container */}

        <button
          onClick={onSubmit}
          disabled={value.length < 9}
          className={`
            w-full py-4 rounded-xl font-bold text-base transition-all duration-200 shadow-md flex-shrink-0
            ${value.length >= 9
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 hover:shadow-lg transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {'Send STK Push'}
        </button>

        <div className="mt-3 text-center flex-shrink-0">
          <p className="text-xs text-gray-500">
            Enter customer's Safaricom number (0712345678 or 254712345678)
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileKeypad; 