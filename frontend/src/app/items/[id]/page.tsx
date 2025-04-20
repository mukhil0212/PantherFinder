'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function ItemDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimDescription, setClaimDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for the item
  const item = {
    id: Number(id),
    name: 'MacBook Pro',
    category: 'Electronics',
    location: 'Library - 2nd Floor',
    date: '2025-03-31',
    status: 'Found',
    description: 'Silver MacBook Pro 13" with a sticker of a mountain on the cover. Found on a study table near the windows.',
    foundBy: 'John Doe',
    contactEmail: 'john.doe@example.com',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80',
    ],
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsClaimModalOpen(false);
      // Show success message or redirect
      alert('Your claim has been submitted successfully!');
    }, 1500);
  };

  const handleClaimClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setIsClaimModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-auto object-cover"
              />
            </div>
            {item.additionalImages && item.additionalImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {item.additionalImages.map((img, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`${item.name} - additional view ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{item.name}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {item.status}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h2>
                <p className="mt-1 text-gray-900 dark:text-white">{item.category}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location Found</h2>
                <p className="mt-1 text-gray-900 dark:text-white">{item.location}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Found</h2>
                <p className="mt-1 text-gray-900 dark:text-white">{new Date(item.date).toLocaleDateString()}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h2>
                <p className="mt-1 text-gray-900 dark:text-white">{item.description}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Found By</h2>
                <p className="mt-1 text-gray-900 dark:text-white">{item.foundBy}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleClaimClick}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Claim This Item
              </button>

              <Link
                href={`mailto:${item.contactEmail}?subject=Regarding Lost Item: ${item.name}`}
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Contact Finder
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
