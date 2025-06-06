'use client';

import React, { useState } from 'react';
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
      console.log('Starting CORS test...');
      const response = await testCORS();
      console.log('CORS test response:', response);
      setResult(JSON.stringify(response, null, 2));
    } catch (err: unknown) {
      console.error('CORS Test Error:', err);
      // Get more detailed error information
      let errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (err instanceof Error && err.cause) {
        errorMessage += '\n\nCause: ' + JSON.stringify(err.cause);
      }
      setError(errorMessage);
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
          <li>Click the &quot;Test CORS&quot; button above</li>
          <li>If successful, you&#39;ll see a green box with the response</li>
          <li>If there&#39;s a CORS error, you&#39;ll see a red box with the error message</li>
          <li>Check your browser&#39;s console for more detailed error information</li>
        </ol>
      </div>
    </div>
  );
}
