import React from 'react';
import { useWeb3 } from '../context/Web3Context';

const LogoutButton = () => {
  const { account, logout } = useWeb3();

  if (!account) return null;

  return (
    <button
      onClick={logout}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      Disconnect Wallet
    </button>
  );
};

export default LogoutButton; 