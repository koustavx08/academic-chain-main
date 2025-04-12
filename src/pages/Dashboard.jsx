import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

const Dashboard = () => {
  const { account, contract } = useWeb3();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredentials = async () => {
      if (contract && account) {
        try {
          const studentCredentials = await contract.getStudentCredentials(account);
          const credentialDetails = await Promise.all(
            studentCredentials.map(async (credentialId) => {
              const credential = await contract.getCredential(credentialId);
              return {
                id: credentialId,
                institution: credential.institution,
                certificateHash: credential.certificateHash,
                ipfsHash: credential.ipfsHash,
                metadata: JSON.parse(credential.metadata),
                isRevoked: credential.isRevoked,
              };
            })
          );
          setCredentials(credentialDetails);
        } catch (error) {
          console.error('Error fetching credentials:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCredentials();
  }, [contract, account]);

  if (!account) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Please connect your wallet to view your credentials
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your credentials...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Credentials</h1>
        
        {credentials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have any credentials yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className={`bg-white p-6 rounded-lg shadow-md ${
                  credential.isRevoked ? 'opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {credential.metadata.name}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Course: {credential.metadata.course}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Institution: {credential.institution.slice(0, 6)}...
                      {credential.institution.slice(-4)}
                    </p>
                  </div>
                  {credential.isRevoked && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Revoked
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <a
                    href={`https://ipfs.io/ipfs/${credential.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View on IPFS
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 