import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import LogoutButton from './LogoutButton';

const Navbar = () => {
  const { account, connectWallet, isInstitution, isOwner, provider } = useWeb3();
  const [balance, setBalance] = useState('0');
  const [network, setNetwork] = useState('');
  const [showWalletInfo, setShowWalletInfo] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchBalance = async () => {
      if (provider && account) {
        try {
          const balance = await provider.getBalance(account);
          setBalance(ethers.formatEther(balance));
          
          const network = await provider.getNetwork();
          setNetwork(network.name);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);

    return () => clearInterval(interval);
  }, [provider, account]);

  const toggleWalletInfo = () => {
    setShowWalletInfo(!showWalletInfo);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-white">
                Academic Chain
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/')
                    ? 'border-white text-white'
                    : 'border-transparent text-indigo-100 hover:text-white hover:border-white'
                }`}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'border-white text-white'
                    : 'border-transparent text-indigo-100 hover:text-white hover:border-white'
                }`}
              >
                Dashboard
              </Link>
              {isInstitution && (
                <>
                  <Link
                    to="/issue"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/issue')
                        ? 'border-white text-white'
                        : 'border-transparent text-indigo-100 hover:text-white hover:border-white'
                    }`}
                  >
                    Issue Credentials
                  </Link>
                  <Link
                    to="/institution-dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/institution-dashboard')
                        ? 'border-white text-white'
                        : 'border-transparent text-indigo-100 hover:text-white hover:border-white'
                    }`}
                  >
                    Institution Dashboard
                  </Link>
                </>
              )}
              {!isInstitution && (
                <Link
                  to="/student-dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/student-dashboard')
                      ? 'border-white text-white'
                      : 'border-transparent text-indigo-100 hover:text-white hover:border-white'
                  }`}
                >
                  Student Dashboard
                </Link>
              )}
              {isOwner && (
                <Link
                  to="/institutions"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/institutions')
                      ? 'border-white text-white'
                      : 'border-transparent text-indigo-100 hover:text-white hover:border-white'
                  }`}
                >
                  Manage Institutions
                </Link>
              )}
              <Link
                to="/verify"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/verify')
                    ? 'border-white text-white'
                    : 'border-transparent text-indigo-100 hover:text-white hover:border-white'
                }`}
              >
                Verify Credentials
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-indigo-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Wallet Button */}
          <div className="hidden sm:flex items-center">
            {account ? (
              <div className="relative">
                <button
                  onClick={toggleWalletInfo}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-sm font-medium text-white">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-white transform transition-transform duration-200 ${
                      showWalletInfo ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showWalletInfo && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Wallet Address</div>
                      <div className="text-sm text-gray-500 break-all">{account}</div>
                    </div>
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Network</div>
                      <div className="text-sm text-gray-500">{network}</div>
                    </div>
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Balance</div>
                      <div className="text-sm text-gray-500">
                        {parseFloat(balance).toFixed(4)} AVAX
                      </div>
                    </div>
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Role</div>
                      <div className="flex space-x-2">
                        {isOwner && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Owner
                          </span>
                        )}
                        {isInstitution && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Institution
                          </span>
                        )}
                        {!isInstitution && !isOwner && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            Student
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-2">
                      <LogoutButton />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/')
                  ? 'bg-indigo-700 border-white text-white'
                  : 'border-transparent text-indigo-100 hover:bg-indigo-700 hover:border-white hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/dashboard')
                  ? 'bg-indigo-700 border-white text-white'
                  : 'border-transparent text-indigo-100 hover:bg-indigo-700 hover:border-white hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            {isInstitution && (
              <>
                <Link
                  to="/issue"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/issue')
                      ? 'bg-indigo-700 border-white text-white'
                      : 'border-transparent text-indigo-100 hover:bg-indigo-700 hover:border-white hover:text-white'
                  }`}
                >
                  Issue Credentials
                </Link>
                <Link
                  to="/institution-dashboard"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/institution-dashboard')
                      ? 'bg-indigo-700 border-white text-white'
                      : 'border-transparent text-indigo-100 hover:bg-indigo-700 hover:border-white hover:text-white'
                  }`}
                >
                  Institution Dashboard
                </Link>
              </>
            )}
            {!isInstitution && (
              <Link
                to="/student-dashboard"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/student-dashboard')
                    ? 'bg-indigo-700 border-white text-white'
                    : 'border-transparent text-indigo-100 hover:bg-indigo-700 hover:border-white hover:text-white'
                }`}
              >
                Student Dashboard
              </Link>
            )}
            {isOwner && (
              <Link
                to="/institutions"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/institutions')
                    ? 'bg-indigo-700 border-white text-white'
                    : 'border-transparent text-indigo-100 hover:bg-indigo-700 hover:border-white hover:text-white'
                }`}
              >
                Manage Institutions
              </Link>
            )}
            <Link
              to="/verify"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/verify')
                  ? 'bg-indigo-700 border-white text-white'
                  : 'border-transparent text-indigo-100 hover:bg-indigo-700 hover:border-white hover:text-white'
              }`}
            >
              Verify Credentials
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-indigo-700">
            {account ? (
              <div className="px-4">
                <div className="text-base font-medium text-white">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                <div className="text-sm font-medium text-indigo-200">
                  {parseFloat(balance).toFixed(4)} AVAX
                </div>
                <div className="mt-3 space-x-2">
                  {isOwner && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Owner
                    </span>
                  )}
                  {isInstitution && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Institution
                    </span>
                  )}
                  {!isInstitution && !isOwner && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      Student
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-4">
                <button
                  onClick={connectWallet}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 