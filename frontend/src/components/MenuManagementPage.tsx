import React, { useState, useMemo, useEffect } from 'react';
import LeftNavigationBar from './LeftNavigationBar';
import MobileNavigation from './MobileNavigation';
import { OrderMode, FoodItem, MenuItemCreateRequest, MenuItemUpdateRequest } from '../types';

interface MenuManagementPageProps {
  onBack: () => void;
  onNavigateToModeSelector: () => void;
  currentMode: OrderMode;
  onNavigateToMenu?: () => void;
  onNavigateToSettings: () => void;
  foodItems: FoodItem[];
  categories: string[];
  onAddMenuItem: (item: MenuItemCreateRequest) => void;
  onUpdateMenuItem: (item: MenuItemUpdateRequest) => void;
  onDeleteMenuItem: (itemId: string) => void;
  userCanManageMenu?: boolean;
  onNavigateToMenuManagement?: () => void;
  onNavigateToPastOrders?: () => void;
}

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItemCreateRequest | MenuItemUpdateRequest) => void;
  item?: FoodItem;
  categories: string[];
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({ isOpen, onClose, onSave, item, categories }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    price: item?.price || 0,
    category: item?.category || categories[0] || '',
    description: item?.description || '',
    imageUrl: item?.imageUrl || '',
    available: item?.available ?? true,
  });

  // Update form data when the item prop changes
  useEffect(() => {
    setFormData({
      name: item?.name || '',
      price: item?.price || 0,
      category: item?.category || categories[0] || '',
      description: item?.description || '',
      imageUrl: item?.imageUrl || '',
      available: item?.available ?? true,
    });
  }, [item, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      // Edit mode
      onSave({
        id: item.id,
        ...formData,
      });
    } else {
      // Create mode
      onSave(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {item ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter item name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={3}
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                Available for order
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {item ? 'Update' : 'Add'} Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const MenuManagementPage: React.FC<MenuManagementPageProps> = ({
  onBack,
  onNavigateToModeSelector,
  currentMode,
  onNavigateToMenu,
  onNavigateToSettings,
  onNavigateToMenuManagement,
  onNavigateToPastOrders,
  foodItems,
  categories,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  userCanManageMenu = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  // Filter items based on category and search
  const filteredItems = useMemo(() => {
    return foodItems.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [foodItems, selectedCategory, searchTerm]);

  const handleAddNew = () => {
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalSave = (itemData: MenuItemCreateRequest | MenuItemUpdateRequest) => {
    if ('id' in itemData) {
      onUpdateMenuItem(itemData);
    } else {
      onAddMenuItem(itemData);
    }
  };

  const handleDelete = (itemId: string, itemName: string) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      onDeleteMenuItem(itemId);
    }
  };

  // Render function for grid view (existing layout)
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredItems.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col"
        >
          <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate flex-1">
                {item.name}
              </h3>
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${
                item.available 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {item.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 break-words">
              {item.category}
            </p>
            
            {item.description && (
              <p className="text-xs text-gray-400 mb-2 break-words flex-grow line-clamp-3">
                {item.description}
              </p>
            )}
            
            <div className="mt-auto pt-2">
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                KSh {item.price.toFixed(2)}
              </p>
            </div>
          </div>
            
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(item)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id, item.name)}
                className="flex-1 px-3 py-2 text-sm border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render function for list view
  const renderListView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{item.name}</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm text-slate-500">{item.category}</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-900">KSh {item.price.toFixed(2)}</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                    item.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-slate-500 max-w-xs truncate">
                    {item.description || '—'}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-3 justify-end">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors min-w-[70px]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="px-4 py-2 text-sm border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List View - Visible only on mobile */}
      <div className="md:hidden divide-y divide-slate-200">
        {filteredItems.map((item) => (
          <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-slate-500">{item.category}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <p className="text-lg font-bold text-slate-900">KSh {item.price.toFixed(2)}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  item.available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
            
            {item.description && (
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {item.description}
              </p>
            )}
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(item)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors text-center"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id, item.name)}
                className="flex-1 px-3 py-2 text-sm border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-center"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'All' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by adding your first menu item.'}
          </p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 transform hover:scale-105"
          >
            Add First Item
          </button>
        </div>
      )}
    </div>
  );

  if (!userCanManageMenu) {
    return (
      <div className="flex min-h-screen bg-slate-100 items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need manager or admin permissions to access Menu Management.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 md:flex-row flex-col">
      {/* Left Navigation Bar - Desktop only */}
      <div className="hidden md:block md:relative">
        <LeftNavigationBar 
          onNavigateHome={onBack}
          currentMode={currentMode}
          activeSection="menu_management"
          onSelectMenu={onNavigateToMenu || onBack}
          onNavigateToSettings={onNavigateToSettings}
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
            
            <h1 className="text-xl text-slate-700 flex-1 truncate text-center">
              Menu Management
            </h1>

            {/* Spacer for mobile to center title */}
            <div className="w-10 md:w-0"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto">
            
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
              <div className="flex flex-col gap-4">
                {/* View Toggle Row - Now at the top */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">View:</span>
                  <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewType('grid')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                        viewType === 'grid'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                      <span>Grid</span>
                    </button>
                    <button
                      onClick={() => setViewType('list')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                        viewType === 'list'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      <span>List</span>
                    </button>
                  </div>
                </div>

                {/* Search and Category Filter Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                  <div className="sm:w-56">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="block w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
                      >
                        <option value="All">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop "Add New Item" Button - Positioned after filter bar */}
            <div className="hidden md:flex justify-end mb-4"> 
              <button 
                onClick={handleAddNew}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Item
              </button>
            </div>

            {/* Items Display - Grid or List View */}
            {viewType === 'grid' ? renderGridView() : renderListView()}

            {/* Empty State for Grid View */}
            {viewType === 'grid' && filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory !== 'All' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Get started by adding your first menu item.'}
                </p>
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 transform hover:scale-105"
                >
                  Add First Item
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Create New Item Button - Fixed at bottom, above main navigation */}
        <div className="md:hidden fixed bottom-[76px] left-0 right-0 p-3 bg-white border-t border-slate-200 shadow-md z-20">
          <button 
            onClick={handleAddNew}
            className="w-full px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
          >
            Add New Item
          </button>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation
          currentView="menu"
          onNavigateTabs={onNavigateToModeSelector}
          onNavigateMenu={onNavigateToMenu || onBack}
          onNavigateToPastOrders={onNavigateToPastOrders || (() => {})}
          isMenuDisabled={false}
        />
      </div>

      {/* Modal */}
      <MenuItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        item={editingItem}
        categories={categories}
      />
    </div>
  );
};

export default MenuManagementPage; 