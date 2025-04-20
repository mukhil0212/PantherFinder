'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../lib/apiClient';

interface Claim {
  id: string;
  item_id: string;
  item_name: string;
  date_claimed: string;
  status: string;
  item_image_url?: string;
  item_category?: string;
  item_location?: string;
}

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchClaims = async () => {
      try {
        setLoading(true);
        const response = await api.getUserClaims();
        setClaims(response.claims || []);
      } catch (err: any) {
        console.error('Error fetching claims:', err);
        setError(err.message || 'Failed to load claims');
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Claims</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Items you have claimed from the lost and found
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {claims.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <p className="text-gray-600 dark:text-gray-300">You haven't claimed any items yet.</p>
          <button
            onClick={() => router.push('/items')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Lost Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {claim.item_image_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={claim.item_image_url}
                    alt={claim.item_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{claim.item_name}</h3>
                <div className="mt-2 space-y-1">
                  {claim.item_category && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Category:</span> {claim.item_category}
                    </p>
                  )}
                  {claim.item_location && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Location:</span> {claim.item_location}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Date Claimed:</span>{' '}
                    {new Date(claim.date_claimed).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`capitalize ${
                      claim.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                      claim.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                      claim.status === 'rejected' ? 'text-red-600 dark:text-red-400' : ''
                    }`}>
                      {claim.status}
                    </span>
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => router.push(`/items/${claim.item_id}`)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    View Item
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
