import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HeaderTailwind from './components/Layout/HeaderTailwind';

const AppTailwind = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <HeaderTailwind />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Add more routes as needed */}
        </Routes>
      </main>
    </div>
  );
};

// Simple HomePage component for testing
const HomePage = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to PantherFinder</h1>
      <p className="text-xl mb-8">A modern platform to connect lost items with their owners.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <FeatureCard 
          title="Find Lost Items" 
          description="Search our database of found items to locate what you've lost."
          icon={
            <svg className="h-12 w-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <FeatureCard 
          title="Report Found Items" 
          description="Submit details about items you've found to help others."
          icon={
            <svg className="h-12 w-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <FeatureCard 
          title="Secure Claims" 
          description="Verify your ownership and claim your lost items securely."
          icon={
            <svg className="h-12 w-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
      </div>
    </div>
  );
};

// Feature card component
const FeatureCard = ({ title, description, icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default AppTailwind;
