import React from 'react';
import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { account } = useWeb3();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Academic Chain
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A decentralized platform for issuing and verifying academic credentials
        </p>
        
        {!account && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please connect your wallet to interact with the platform
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">For Students</h2>
            <p className="text-gray-600 mb-4">
              View and manage your academic credentials in one secure place
            </p>
            <ul className="list-disc list-inside text-gray-600">
              <li>Access your credentials anytime, anywhere</li>
              <li>Share your credentials securely</li>
              <li>Verify the authenticity of your credentials</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">For Institutions</h2>
            <p className="text-gray-600 mb-4">
              Issue and manage academic credentials efficiently
            </p>
            <ul className="list-disc list-inside text-gray-600">
              <li>Issue credentials securely on the blockchain</li>
              <li>Manage student records efficiently</li>
              <li>Verify credentials instantly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 