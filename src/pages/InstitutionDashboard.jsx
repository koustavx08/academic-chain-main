import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

const InstitutionDashboard = () => {
  const { contract, account, getInstitutionCredentials, getCredential } = useWeb3();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalIssued: 0,
    totalRevoked: 0,
    activeCredentials: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (contract && account) {
        try {
          const credentialIds = await getInstitutionCredentials(account);
          const credentialList = [];
          let revokedCount = 0;

          for (const id of credentialIds) {
            try {
              const credential = await getCredential(id);
              credentialList.push({
                id,
                shortId: credential.shortId,
                student: credential.student,
                certificateHash: credential.certificateHash,
                issueDate: new Date(Number(credential.timestamp) * 1000).toLocaleString(),
                isRevoked: credential.isRevoked
              });
              if (credential.isRevoked) revokedCount++;
            } catch (err) {
              console.error(`Error fetching credential ${id}:`, err);
              // Continue with other credentials even if one fails
            }
          }

          setCredentials(credentialList);
          setStats({
            totalIssued: credentialList.length,
            totalRevoked: revokedCount,
            activeCredentials: credentialList.length - revokedCount
          });
        } catch (err) {
          setError('Failed to fetch credentials');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [contract, account, getInstitutionCredentials, getCredential]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Institution Dashboard</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Credentials Issued</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalIssued}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Credentials</h3>
          <p className="text-3xl font-bold text-green-600">{stats.activeCredentials}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Revoked Credentials</h3>
          <p className="text-3xl font-bold text-red-600">{stats.totalRevoked}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Recent Credentials</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credential ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : credentials.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No credentials found
                  </td>
                </tr>
              ) : (
                credentials.map((credential) => (
                  <tr key={credential.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono" title={credential.id}>
                      {credential.shortId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {credential.student}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" title={credential.certificateHash}>
                      {credential.certificateHash}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {credential.issueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        credential.isRevoked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {credential.isRevoked ? 'Revoked' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard; 