'use client';

import React, { useState, useEffect } from 'react';
import { testCORS } from '@/lib/apiClient';

export default function CORSTestPage() {
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const runTest = async () => {
    setLoading(true);
    setResult('');
    setError('');
    
    try {
      const response = await testCORS();
      setResult(JSON.stringify(response, null, 2));
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('CORS Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CORS Test Page</h1>
      
      <button 
        onClick={runTest}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {loading ? 'Testing...' : 'Test CORS'}
      </button>
      
      {result && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Success:</h2>
          <pre className="bg-green-100 p-4 rounded">{result}</pre>
        </div>
      )}
      
      {error && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Error:</h2>
          <pre className="bg-red-100 p-4 rounded">{error}</pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside">
          <li>Make sure your backend server is running at http://localhost:5000</li>
          <li>Click the "Test CORS" button above</li>
          <li>If successful, you'll see a green box with the response</li>
          <li>If there's a CORS error, you'll see a red box with the error message</li>
          <li>Check your browser's console for more detailed error information</li>
        </ol>
      </div>
    </div>
  );
}
