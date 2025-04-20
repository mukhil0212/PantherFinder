'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const featuredItems = [
    {
      id: 1,
      name: 'MacBook Pro',
      category: 'Electronics',
      location: 'Library',
      date: '2025-03-31',
      status: 'Found',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      name: 'Notebook',
      category: 'Stationery',
      location: 'Classroom Building',
      date: '2025-04-02',
      status: 'Found',
      image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      name: 'Water Bottle',
      category: 'Personal',
      location: 'Recreation Center',
      date: '2025-03-29',
      status: 'Found',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
        <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-24 lg:py-32 lg:px-24 text-white">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover Lost &amp; Found, Reimagined
          </h1>
          <p className="mt-6 max-w-lg text-xl sm:max-w-3xl">
            A modern platform to connect lost items with their owners. Effortlessly search, submit, and track your items.
          </p>
          <div className="mt-10">
            <Link
              href={isAuthenticated ? '/items' : '/auth/register'}
              className="inline-block rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-blue-600 hover:bg-gray-100 hover:text-blue-800 transition-colors"
            >
              {isAuthenticated ? 'Explore Items' : 'Join Now'}
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            Our intuitive platform bridges the gap between lost items and their owners.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Search"
            description="Quickly find lost items using our smart filters."
            icon={
              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <FeatureCard
            title="Submit"
            description="Share found items with clear photos and details."
            icon={
              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <FeatureCard
            title="Locate"
            description="Easily find nearby drop-off points to retrieve your items."
            icon={
              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <FeatureCard
            title="Notify"
            description="Get real-time alerts when matching items are found."
            icon={
              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Recently Found Items Section */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl text-center mb-12">
          Recently Found Items
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((item) => (
            <Link key={item.id} href={`/items/${item.id}`} className="group">
              <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                  <div className="mt-4 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{item.location}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl my-12 py-12 px-6 sm:px-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Join our community to help reunite lost items with their owners.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={isAuthenticated ? '/submit-item' : '/auth/register'}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-5 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {isAuthenticated ? 'Submit Found Item' : 'Sign Up Now'}
            </Link>
            <Link
              href="/items"
              className="inline-flex items-center justify-center rounded-md border border-blue-600 bg-transparent px-5 py-3 text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              Browse Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="inline-flex items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30 p-3 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}


