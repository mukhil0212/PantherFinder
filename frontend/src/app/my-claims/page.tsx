'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../lib/apiClient';

interface Claim {
  id: string;
  item_id: string;
  user_id: string;
  proof_description: string;
  status: string;
  created_at: string;
  updated_at: string;
  items?: {
    id: string;
    name: string;
    category: string;
    found_location: string;
    found_date: string;
    status: string;
    image_url?: string;
    description?: string;
  };
}

// Helper function to format image URL
const formatImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return null;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
};

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only fetch claims if the user is authenticated
    if (!isAuthenticated) {
      // Don't redirect immediately, let the AuthContext handle the authentication state
      setLoading(false);
      return;
    }

    const fetchClaims = async () => {
      try {
        setLoading(true);
        const response = await api.getUserClaims();
        console.log('Claims response:', response);

        // Handle different response formats
        if (response && response.claims) {
          // Format from /users/claims endpoint
          setClaims(response.claims);
        } else if (Array.isArray(response)) {
          // Format from /users/me/claims endpoint
          setClaims(response);
        } else if (response === null || response === undefined) {
          // Handle null or undefined response
          console.warn('Received null or undefined response');
          setClaims([]);
        } else if (typeof response === 'object' && Object.keys(response).length === 0) {
          // Handle empty object response
          console.warn('Received empty object response');
          setClaims([]);
        } else {
          // Handle any other unexpected format
          console.error('Unexpected response format:', response);
          setClaims([]);
        }
      } catch (err: any) {
        console.error('Error fetching claims:', err);
        setError(err.message || 'Failed to load claims');
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated, with a redirect parameter
    router.push('/auth/login?redirect=/my-claims');
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
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
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
          <p className="font-semibold">Error loading claims</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
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
          {claims.map((claim) => {
            // Handle different response formats
            let item = {};
            let itemName = 'Unknown Item';
            let itemImageUrl = null;

            if (claim.items) {
              // Handle nested items object
              item = claim.items;
              itemName = item.name || 'Unknown Item';
              itemImageUrl = item.image_url ? formatImageUrl(item.image_url) : null;
            } else if (claim.item_id) {
              // Handle flat structure with item_id
              itemName = claim.item_name || 'Unknown Item';
              itemImageUrl = claim.item_image_url ? formatImageUrl(claim.item_image_url) : null;
              item = {
                category: claim.item_category,
                found_location: claim.item_location
              };
            }

            return (
              <div key={claim.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {itemImageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={itemImageUrl}
                      alt={itemName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{itemName}</h3>
                  <div className="mt-2 space-y-1">
                    {item.category && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Category:</span> {item.category}
                      </p>
                    )}
                    {item.found_location && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Location:</span> {item.found_location}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Date Claimed:</span>{' '}
                      {new Date(claim.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`capitalize ${
                        (claim.status === 'pending' || claim.status === 'verification_status') ? 'text-yellow-600 dark:text-yellow-400' :
                        (claim.status === 'approved' || claim.status === 'verified') ? 'text-green-600 dark:text-green-400' :
                        (claim.status === 'rejected') ? 'text-red-600 dark:text-red-400' : ''
                      }`}>
                        {claim.status === 'verification_status' ? 'pending verification' : claim.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Proof Description:</span>{' '}
                      <span className="italic">"{claim.proof_description}"</span>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
