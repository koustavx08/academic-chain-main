import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { institutionService } from '../services/institutionService';

const Institutions = () => {
  const { account, isOwner, registerInstitution: registerOnChain, removeInstitution: removeFromChain } = useWeb3();
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const data = await institutionService.getInstitutions();
      setInstitutions(data);
    } catch (err) {
      setError('Failed to fetch institutions');
      console.error(err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // First register on blockchain
      await registerOnChain(institutionAddress);
      
      // Then store in MongoDB
      await institutionService.registerInstitution(institutionAddress, account);
      
      setSuccess('Institution registered successfully!');
      setInstitutionAddress('');
      fetchInstitutions(); // Refresh the list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (address) => {
    if (!window.confirm('Are you sure you want to remove this institution?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // First remove from blockchain
      await removeFromChain(address);
      
      // Then update in MongoDB
      await institutionService.removeInstitution(address);
      
      setSuccess('Institution removed successfully!');
      fetchInstitutions(); // Refresh the list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Please connect your wallet to manage institutions
        </h2>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Only the contract owner can manage institutions
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Institutions</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Register New Institution
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label
                  htmlFor="institutionAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Institution Wallet Address
                </label>
                <input
                  type="text"
                  id="institutionAddress"
                  value={institutionAddress}
                  onChange={(e) => setInstitutionAddress(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0x..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Processing...' : 'Register Institution'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Registered Institutions
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {institutions.length === 0 ? (
                <li className="px-4 py-4">
                  <p className="text-sm text-gray-500">No institutions registered yet.</p>
                </li>
              ) : (
                institutions.map((institution) => (
                  <li key={institution.address} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {`${institution.address.slice(0, 6)}...${institution.address.slice(-4)}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          Registered on: {new Date(institution.registeredAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(institution.address)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Institutions; 