import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

const CredentialForm = () => {
  const { contract, account, issueCredential } = useWeb3();
  const [recipient, setRecipient] = useState('');
  const [documentHash, setDocumentHash] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [issuanceFee, setIssuanceFee] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFees = async () => {
      if (contract) {
        const fee = await contract.issuanceFee();
        setIssuanceFee(ethers.utils.formatEther(fee));
      }
    };
    fetchFees();
  }, [contract]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await issueCredential(recipient, documentHash, documentType);
      // Reset form
      setRecipient('');
      setDocumentHash('');
      setDocumentType('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Issue Credential</h2>
      <p className="text-sm text-gray-600 mb-4">
        Issuance Fee: {issuanceFee} AVAX
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Document Hash
          </label>
          <input
            type="text"
            value={documentHash}
            onChange={(e) => setDocumentHash(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Document Type
          </label>
          <input
            type="text"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Issue Credential'}
        </button>
      </form>
    </div>
  );
};

export default CredentialForm; 