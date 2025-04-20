'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as api from '../../lib/apiClient';
import { ItemCard } from '@/components/ui/card';
import NavbarDemo from '@/components/navbar-menu-demo';

interface Item {
  id: string;
  name: string;
  category: string;
  location: string;
  date_found: string;
  status: string;
  image_url?: string;
  description?: string;
}

export default function ItemsListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await api.getItems();
        setItems(response.items || []);
      } catch (err: any) {
        console.error('Error fetching items:', err);
        setError(err.message || 'Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Get unique categories and locations for filters
  const categories = [...new Set(items.map(item => item.category))];
  const locations = [...new Set(items.map(item => item.location))];

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    const matchesLocation = locationFilter === '' || item.location === locationFilter;
    const matchesDate = dateFilter === '' ||
      (item.date_found && item.date_found.substring(0, 10) === dateFilter);

    return matchesSearch && matchesCategory && matchesLocation && matchesDate;
  });

  return (
    <div className="w-full">
      <NavbarDemo />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lost & Found Items</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Browse through items that have been found on campus.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, category, or location"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <select
              id="location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Found
            </label>
            <input
              type="date"
              id="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-800 dark:text-red-400 mb-6">
          {error}
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.name}
                description={item.description || "No description available"}
                category={item.category}
                location={item.location}
                date={item.date_found}
                status={item.status.toLowerCase()}
                imageUrl={item.image_url}
                href={`/items/${item.id}`}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No items found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
