import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';

const VerifyCredentials = () => {
  const { getCredential } = useWeb3();
  const [credentialId, setCredentialId] = useState('');
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Function to extract numeric ID from CRED-XXXXXX format
  const extractNumericId = (shortId) => {
    // Remove any whitespace
    const trimmedId = shortId.trim();
    
    // If it's already a number, return it
    if (!isNaN(trimmedId) && trimmedId !== '') {
      return trimmedId;
    }
    
    // If it's in CRED-XXXXXX format
    if (trimmedId.toLowerCase().startsWith('cred-')) {
      throw new Error(
        'Please enter the numeric ID instead of the short ID format. ' +
        'You can find the numeric ID in your Student Dashboard below each credential.'
      );
    }
    
    // If it's neither a number nor a CRED- format, it's invalid
    throw new Error(
      'Invalid credential ID format. Please enter a numeric ID (e.g., 42) ' +
      'that you can find in your Student Dashboard below each credential.'
    );
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCredential(null);

    try {
      // Validate credential ID format
      if (!credentialId.trim()) {
        throw new Error('Please enter a credential ID');
      }

      // Try to extract/convert the ID
      const numericId = extractNumericId(credentialId);
      const result = await getCredential(numericId);
      setCredential(result);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Verify Credentials</h2>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How to verify
        </button>
      </div>

      {showHelp && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Verify Your Credential</h3>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-blue-100">
              <p className="font-medium text-blue-800 mb-2">Finding your Credential ID:</p>
              <ol className="list-decimal list-inside space-y-2 text-blue-700 ml-2">
                <li>Go to your Student Dashboard</li>
                <li>Look for your credential in the list</li>
                <li>Each credential shows two IDs:</li>
                <li className="ml-4">
                  • A short ID at the top (e.g., <code className="bg-blue-100 px-1 rounded">CRED-abc123</code>)
                </li>
                <li className="ml-4">
                  • A numeric ID below it (e.g., <code className="bg-blue-100 px-1 rounded">ID: 42</code>)
                </li>
                <li className="font-medium">Use the numeric ID for verification</li>
              </ol>
            </div>
            
            <div className="bg-white p-4 rounded border border-blue-100">
              <p className="font-medium text-blue-800 mb-2">Example:</p>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <span>✗</span>
                  <code className="bg-red-100 px-2 py-1 rounded">CRED-abc123</code>
                  <span className="text-red-600">(Don't use this format)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <code className="bg-green-100 px-2 py-1 rounded">42</code>
                  <span className="text-green-600">(Use this number)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleVerify} className="mb-8">
        <div className="mb-4">
          <label htmlFor="credentialId" className="block text-sm font-medium text-gray-700 mb-2">
            Credential ID
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              id="credentialId"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter the numeric ID (e.g., 42)"
              required
            />
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <svg className="h-5 w-5 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Use the numeric ID shown below the short ID in your dashboard
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : 'Verify Credential'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {credential && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Credential Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Credential ID</p>
              <p className="font-medium">{credential.shortId}</p>
              <p className="text-xs text-gray-500">ID: {credential.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Issuer</p>
              <p className="font-medium">{credential.institution}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Recipient</p>
              <p className="font-medium">{credential.student}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Document Hash</p>
              <p className="font-medium font-mono text-sm break-all" title={credential.certificateHash}>
                {credential.certificateHash.substring(0, 10)}...
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`font-medium ${credential.isRevoked ? 'text-red-600' : 'text-green-600'}`}>
                {credential.isRevoked ? 'Revoked' : 'Active'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyCredentials; 