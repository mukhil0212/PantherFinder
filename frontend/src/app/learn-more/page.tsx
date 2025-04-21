'use client';

import React from 'react';
import Link from 'next/link';
import NavbarDemo from '@/components/navbar-menu-demo';

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavbarDemo />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About PantherFinder</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            PantherFinder is Georgia State University's official lost and found platform, designed to help students, faculty, and staff reconnect with their lost items on campus.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Our mission is to simplify the process of reporting and claiming lost items, making it easier for the GSU community to recover their belongings.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How It Works</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-2">Found Something?</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              If you've found an item on campus, you can easily report it through our platform:
            </p>
            <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Sign in to your account</li>
              <li>Click on "Submit Item" in the navigation menu</li>
              <li>Fill out the form with details about the item and where you found it</li>
              <li>Upload a photo if possible</li>
              <li>Submit the form, and the item will be listed in our database</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-2">Lost Something?</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              If you've lost an item, you can search our database to see if it has been found:
            </p>
            <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Browse the "Items" section or use the search function</li>
              <li>Filter by category, location, or date</li>
              <li>If you find your item, click "Claim This Item"</li>
              <li>Provide additional details to verify ownership</li>
              <li>Once approved, you'll receive instructions on how to retrieve your item</li>
            </ol>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Campus Locations</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            PantherFinder covers the following key locations across Georgia State University's campus:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Library</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">The university's main library where students study and research.</p>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Langdale Hall</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">A major academic building housing multiple departments and classrooms.</p>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Aderhold</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">Aderhold Learning Center featuring classrooms and learning spaces.</p>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recreation Center</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">The campus fitness and recreation facility for students and staff.</p>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Student Center West</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">A hub for student activities, dining, and campus services.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you have any questions or need assistance with the PantherFinder platform, please don't hesitate to reach out to us:
          </p>
          
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Email:</span> pantherfinder@gsu.edu
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Phone:</span> (404) 555-1234
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Location:</span> Student Center West, Room 203
            </p>
          </div>
          
          <div className="mt-6">
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
