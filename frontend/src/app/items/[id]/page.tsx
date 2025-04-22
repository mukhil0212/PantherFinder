'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import * as api from '../../../lib/apiClient';

interface Item {
  id: string;
  name: string;
  category: string;
  found_location: string;
  found_date: string;
  date_lost?: string;
  status: string;
  image_url?: string;
  description?: string;
  user_id?: string;
  contact_email?: string;
  contact_phone?: string;
}

// Helper function to format image URL
const formatImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return null;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
};

// Helper function to format verification status
const formatStatus = (status?: string) => {
  if (!status) return 'Unknown';

  if (status === 'verification_status') return 'Pending Verification';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export default function ItemDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimDescription, setClaimDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const itemData = await api.getItemById(id as string);
        console.log('Fetched item:', itemData);
        setItem(itemData);
      } catch (err: any) {
        console.error('Error fetching item:', err);
        setError(err.message || 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create claim data
      const claimData = {
        item_id: id,
        proof_description: claimDescription
      };

      // Submit claim to API
      const response = await api.createClaim(claimData);
      console.log('Claim submitted:', response);

      setIsClaimModalOpen(false);
      setSuccessMessage('Your claim has been submitted successfully! We will review it and get back to you.');
      setClaimDescription('');
    } catch (err: any) {
      console.error('Error submitting claim:', err);
      setError(err.message || 'Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setIsClaimModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-800 dark:text-red-400 mb-6">
          {error}
        </div>
        <Link href="/items" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          &larr; Back to items
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md text-yellow-800 dark:text-yellow-400 mb-6">
          Item not found
        </div>
        <Link href="/items" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          &larr; Back to items
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-md bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {successMessage}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
              Home
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li>
            <Link href="/items" className="hover:text-blue-600 dark:hover:text-blue-400">
              Items
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-700 dark:text-gray-300 font-medium">
            {item.name}
          </li>
        </ol>
      </nav>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Image Gallery */}
          <div>
            <div className="mb-4 rounded-lg overflow-hidden h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              {item.image_url ? (
                <img
                  src={formatImageUrl(item.image_url) || ''}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400 dark:text-gray-500 text-center">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Item Details */}
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{item.name}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                item.status.toLowerCase() === 'found' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                item.status.toLowerCase() === 'claimed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                item.status.toLowerCase() === 'returned' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                {formatStatus(item.status)}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h2>
                <p className="mt-1 text-gray-900 dark:text-white">{item.category}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h2>
                <p className="mt-1 text-gray-900 dark:text-white">{item.found_location}</p>
              </div>

              {item.status.toLowerCase() === 'found' && item.found_date && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Found</h2>
                  <p className="mt-1 text-gray-900 dark:text-white">{new Date(item.found_date).toLocaleDateString()}</p>
                </div>
              )}

              {item.status.toLowerCase() === 'lost' && item.date_lost && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Lost</h2>
                  <p className="mt-1 text-gray-900 dark:text-white">{new Date(item.date_lost).toLocaleDateString()}</p>
                </div>
              )}

              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h2>
                <p className="mt-1 text-gray-900 dark:text-white">{item.description || 'No description available'}</p>
              </div>

              {item.contact_email && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Email</h2>
                  <p className="mt-1 text-gray-900 dark:text-white">{item.contact_email}</p>
                </div>
              )}

              {item.contact_phone && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Phone</h2>
                  <p className="mt-1 text-gray-900 dark:text-white">{item.contact_phone}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {item.status.toLowerCase() === 'found' && !['claimed', 'returned'].includes(item.status.toLowerCase()) && (
                <button
                  onClick={handleClaimClick}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Claim This Item
                </button>
              )}

              {item.user_id && user?.id !== item.user_id && (
                <button
                  onClick={() => router.push(`/messages/${item.user_id}?item_id=${item.id}`)}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Message {item.status.toLowerCase() === 'found' ? 'Finder' : 'Owner'}
                </button>
              )}

              {item.contact_email && (
                <Link
                  href={`mailto:${item.contact_email}?subject=Regarding ${item.status === 'found' ? 'Found' : 'Lost'} Item: ${item.name}`}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email {item.status.toLowerCase() === 'found' ? 'Finder' : 'Owner'}
                </Link>
              )}

              <Link
                href="/items"
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Items
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Claim Item: {item.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Please provide details to verify your ownership of this item.
                      </p>
                    </div>

                    {error && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-md">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleClaimSubmit} className="mt-4">
                      <div className="mb-4">
                        <label htmlFor="claimDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Ownership Description
                        </label>
                        <textarea
                          id="claimDescription"
                          rows={4}
                          value={claimDescription}
                          onChange={(e) => setClaimDescription(e.target.value)}
                          placeholder="Please provide specific details about the item that only the owner would know (e.g., scratches, stickers, contents, etc.)"
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsClaimModalOpen(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
