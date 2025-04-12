import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

const CredentialList = () => {
  const { contract, account, revokeCredential } = useWeb3();
  const [credentials, setCredentials] = useState([]);
  const [revocationFee, setRevocationFee] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (contract) {
        try {
          // Fetch revocation fee
          const fee = await contract.methods.revocationFee().call();
          setRevocationFee(ethers.utils.formatEther(fee));

          // Fetch credentials
          const credentialCount = await contract.methods.getCredentialCount().call();
          const credentialList = [];

          for (let i = 0; i < credentialCount; i++) {
            const credential = await contract.methods.credentials(i).call();
            credentialList.push({
              id: i,
              issuer: credential.issuer,
              recipient: credential.recipient,
              documentHash: credential.documentHash,
              documentType: credential.documentType,
              issueDate: new Date(credential.issueDate * 1000).toLocaleString(),
              isRevoked: credential.isRevoked
            });
          }

          setCredentials(credentialList);
        } catch (err) {
          setError(err.message);
        }
      }
    };

    fetchData();
  }, [contract]);

  const handleRevoke = async (credentialId) => {
    setLoading(true);
    setError('');

    try {
      await revokeCredential(credentialId);
      // Refresh credentials list
      const updatedCredentials = [...credentials];
      updatedCredentials[credentialId].isRevoked = true;
      setCredentials(updatedCredentials);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Credentials</h2>
      <p className="text-sm text-gray-600 mb-4">
        Revocation Fee: {revocationFee} AVAX
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Issuer
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Recipient
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Document Type
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Issue Date
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {credentials.map((credential) => (
              <tr key={credential.id}>
                <td className="px-6 py-4 border-b border-gray-200">
                  {credential.issuer}
                </td>
                <td className="px-6 py-4 border-b border-gray-200">
                  {credential.recipient}
                </td>
                <td className="px-6 py-4 border-b border-gray-200">
                  {credential.documentType}
                </td>
                <td className="px-6 py-4 border-b border-gray-200">
                  {credential.issueDate}
                </td>
                <td className="px-6 py-4 border-b border-gray-200">
                  {credential.isRevoked ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Revoked
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 border-b border-gray-200">
                  {!credential.isRevoked && credential.issuer.toLowerCase() === account.toLowerCase() && (
                    <button
                      onClick={() => handleRevoke(credential.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CredentialList; 