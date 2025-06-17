import React, { useState, useMemo } from 'react';
import { FoodItem, OrderMode, CartItem } from '../types';

// Helper function to get emoji for category
const getCategoryEmoji = (categoryName: string): string => {
  switch (categoryName.toLowerCase()) {
    case 'burgers': return '🍔';
    case 'pizza': return '🍕';
    case 'drinks':
    case 'beverages':
    case 'appetizers':
    case 'main course':
      return '🍽️';
    case 'desserts': return '🍰';
    case 'salads': return '🥗';
    case 'sides': return '🍟';
    default: return '🍲';
  }
};

interface MenuSectionProps {
  categories: string[];
  foodItems: FoodItem[];
  currentOperatingMode: OrderMode;
  hasActiveOrder: boolean;
  activeCart: CartItem[];
  onAddToCart: (item: FoodItem, quantity?: number, notes?: string) => void;
  updateCartItem: (foodItemId: string, quantity: number, notes?: string) => void;
  removeFromCart: (foodItemId: string) => void;
  showMenuImages: boolean;
}

const MenuSection: React.FC<MenuSectionProps> = ({
  categories,
  foodItems,
  currentOperatingMode,
  hasActiveOrder,
  activeCart,
  onAddToCart,
  updateCartItem,
  removeFromCart,
  showMenuImages,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return foodItems;
    return foodItems.filter(item => item.category === selectedCategory);
  }, [foodItems, selectedCategory]);

  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-3 sm:p-4">
      {/* Category Filters */}
      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">Categories</h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button 
            onClick={() => setSelectedCategory('')} 
            className={`flex items-center px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === '' 
                ? 'bg-gradient-to-r from-cyan-50 to-teal-50 text-gray-900 border-2 border-cyan-500' 
                : 'bg-white text-gray-700 border border-slate-300 hover:border-gray-400'
            }`}
          >
            <span className="mr-1 sm:mr-2 text-base sm:text-lg lg:text-xl">🌟</span>All Items
          </button>
          {categories.map((category) => (
            <button 
              key={category} 
              onClick={() => setSelectedCategory(category)} 
              className={`flex items-center px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category 
                  ? 'bg-gradient-to-r from-cyan-50 to-teal-50 text-gray-900 border-2 border-cyan-500' 
                  : 'bg-white text-gray-700 border border-slate-300 hover:border-gray-400'
              }`}
            >
              <span className="mr-1 sm:mr-2 text-base sm:text-lg lg:text-xl">{getCategoryEmoji(category)}</span>{category}
            </button>
          ))}
        </div>
      </div>

      {/* Food items */}
      <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{selectedCategory || 'All Items'} Menu</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => {
          const cartItem = activeCart.find(ci => ci.foodItemId === item.id);
          const quantityInCart = cartItem ? cartItem.quantity : 0;
          const canInteract = item.available && !(currentOperatingMode === 'tab' && !hasActiveOrder);

          return (
            <div 
              key={item.id} 
              className={`bg-white rounded-lg shadow-sm border border-slate-200 p-3 flex flex-col justify-between transition-shadow relative ${canInteract ? 'hover:shadow-md cursor-pointer' : 'opacity-70'}`}
              onClick={() => {
                if (!canInteract) return;
                if (quantityInCart === 0) {
                  onAddToCart(item, 1);
                } else {
                  updateCartItem(item.id, quantityInCart + 1);
                }
              }}
            >
              {/* Image placeholder - conditionally rendered */}
              {showMenuImages && (
                <div className="mb-3 w-full h-32 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-center text-gray-400 ${item.imageUrl ? 'hidden' : ''}`}>
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 mx-auto mb-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                      <span className="text-xs">No Image</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Content area - restructured for consistent price positioning */}
              <div className="flex flex-col flex-grow">
                {/* Item details */}
                <div className="flex-grow">
                  <h3 className="menu-item-name">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 break-words">{item.category}</p>
                  {item.description && (
                    <p className="text-xs text-gray-400 mb-2 break-words">{item.description}</p>
                  )}
                </div>
                
                {/* Price - always at bottom */}
                <div className="mt-auto pt-2">
                  <p className="menu-item-price">
                    KSh {item.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Quantity Controller - with more spacing from price */}
              <div className="mt-4 flex items-center justify-center w-full">
                {canInteract ? (
                  <div className="flex items-center justify-between w-full space-x-2 bg-gray-50 p-1.5 rounded-md border border-gray-200">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (quantityInCart === 0) return;
                        quantityInCart === 1 ? removeFromCart(item.id) : updateCartItem(item.id, quantityInCart - 1);
                      }}
                      className={`w-8 h-8 rounded flex items-center justify-center text-lg font-normal transition-colors ${
                        quantityInCart === 0 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      disabled={quantityInCart === 0}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="text-base font-medium text-gray-800 min-w-[1.5rem] text-center">{quantityInCart}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCartItem(item.id, quantityInCart + 1);
                      }}
                      className="w-8 h-8 rounded flex items-center justify-center text-lg font-normal text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  // Disabled state
                  <div className="flex items-center justify-between w-full space-x-2 bg-gray-100 p-1.5 rounded-md border border-gray-200 opacity-50">
                    <div className="w-8 h-8 rounded flex items-center justify-center text-lg font-normal text-gray-400">−</div>
                    <span className="text-base font-medium text-gray-400 min-w-[1.5rem] text-center">0</span>
                    <div className="w-8 h-8 rounded flex items-center justify-center text-lg font-normal text-gray-400">+</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuSection; 