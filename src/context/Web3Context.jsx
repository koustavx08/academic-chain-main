import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AcademicCredentialsArtifact from '../../artifacts/contracts/AcademicCredentials.sol/AcademicCredentials.json';
import { sessionManager } from '../utils/sessionManager';
import { institutionService } from '../services/institutionService';

const FUJI_TESTNET = {
  chainId: '0xa869', // 43113 in decimal
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/']
};

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [isInstitution, setIsInstitution] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isInitializationInProgress, setIsInitializationInProgress] = useState(false);

  // Check session timeout
  useEffect(() => {
    const checkSessionTimeout = () => {
      if (account && sessionManager.isSessionExpired()) {
        logout();
      }
    };

    const interval = setInterval(checkSessionTimeout, 1000);
    return () => clearInterval(interval);
  }, [account]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionManager.cleanup();
    };
  }, []);

  // Handle page reload and session restoration
  useEffect(() => {
    const restoreSession = async () => {
      const session = sessionManager.getSession();
      if (session && session.account) {
        try {
          await initializeWeb3();
          setAccount(session.account);
          setIsInstitution(session.isInstitution);
          setIsOwner(session.isOwner);
          if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
          }
        } catch (error) {
          console.error('Error restoring session:', error);
          logout();
        }
      }
    };

    restoreSession();
  }, []);

  const logout = () => {
    // Clear all state
    setAccount('');
    setBalance('0');
    setIsInstitution(false);
    setIsOwner(false);
    setProvider(null);
    setContract(null);
    setError('');
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }

    // Clear session
    sessionManager.clearSession();
  };

  useEffect(() => {
    // Check if MetaMask is installed
    const checkMetaMask = () => {
      const hasMetaMask = typeof window.ethereum !== 'undefined';
      setIsMetaMaskInstalled(hasMetaMask);
      if (!hasMetaMask) {
        setError('Please install MetaMask to use this application');
        setIsInitializing(false);
      }
    };

    checkMetaMask(); 
  }, []);

  const initializeWeb3 = async () => {
    if (isInitializationInProgress) {
      console.log('Web3 initialization already in progress, skipping...');
      return;
    }

    setIsInitializationInProgress(true);
    setIsInitializing(true);
    setError('');

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Get network
      const network = await provider.getNetwork();
      
      // Check if we're on the correct network
      if (network.chainId.toString() !== FUJI_TESTNET.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: FUJI_TESTNET.chainId }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [FUJI_TESTNET],
              });
            } catch (addError) {
              throw new Error('Failed to add network to MetaMask');
            }
          } else {
            throw switchError;
          }
        }
      }

      // Create contract instance
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      const contract = new ethers.Contract(
        contractAddress,
        AcademicCredentialsArtifact.abi,
        signer
      );

      // Get balance
      const balance = await provider.getBalance(account);
      const formattedBalance = ethers.formatEther(balance);

      // Check if account is institution or owner
      const [isInstitution, isOwner] = await Promise.all([
        contract.isInstitution(account),
        contract.owner() === account
      ]);

      // Update state
      setAccount(account);
      setBalance(formattedBalance);
      setIsInstitution(isInstitution);
      setIsOwner(isOwner);
      setProvider(provider);
      setContract(contract);
      setError('');

      // Save session
      sessionManager.saveSession({
        account,
        isInstitution,
        isOwner
      });

    } catch (error) {
      console.error('Error initializing Web3:', error);
      setError(error.message || 'Failed to initialize Web3');
      logout();
    } finally {
      setIsInitializing(false);
      setIsInitializationInProgress(false);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      logout();
    } else {
      await initializeWeb3();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connectWallet = async () => {
    try {
      await initializeWeb3();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
    }
  };

  const registerInstitution = async (address) => {
    if (!isOwner) {
      throw new Error('Only the contract owner can register institutions');
    }

    try {
      // First register on the blockchain
      const tx = await contract.registerInstitution(address);
      await tx.wait();

      // Then register in the backend
      await institutionService.registerInstitution(address, account);
      
      // Update local state
      setIsInstitution(true);
      
      // Update session
      const session = sessionManager.getSession();
      if (session) {
        session.isInstitution = true;
        sessionManager.saveSession(session);
      }

      return true;
    } catch (error) {
      console.error('Error registering institution:', error);
      throw error;
    }
  };

  const removeInstitution = async (address) => {
    if (!isOwner) {
      throw new Error('Only the contract owner can remove institutions');
    }

    try {
      const tx = await contract.removeInstitution(address);
      await tx.wait();
      await institutionService.removeInstitution(address);
      return true;
    } catch (error) {
      console.error('Error removing institution:', error);
      throw error;
    }
  };

  const issueCredential = async (recipient, documentHash, ipfsHash, metadata) => {
    if (!contract || !isInstitution) {
      throw new Error('Only institutions can issue credentials');
    }
    const tx = await contract.issueCredential(recipient, documentHash, ipfsHash, metadata);
    await tx.wait();
  };

  const revokeCredential = async (credentialId) => {
    if (!contract || !isInstitution) {
      throw new Error('Only institutions can revoke credentials');
    }
    const tx = await contract.revokeCredential(credentialId);
    await tx.wait();
  };

  const getCredential = async (credentialId) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    const credential = await contract.getCredential(credentialId);
    
    // Create a new object with all the credential properties
    const credentialData = {
      institution: credential.institution,
      student: credential.student,
      certificateHash: credential.certificateHash,
      ipfsHash: credential.ipfsHash,
      timestamp: credential.timestamp,
      isRevoked: credential.isRevoked,
      metadata: credential.metadata
    };
    
    // Try to extract shortId from metadata if available
    try {
      if (credentialData.metadata) {
        const metadata = JSON.parse(credentialData.metadata);
        if (metadata.shortId) {
          credentialData.shortId = metadata.shortId;
        } else {
          // Generate a short ID if not found in metadata
          credentialData.shortId = generateShortId(credentialId);
        }
      } else {
        // Generate a short ID if metadata is not available
        credentialData.shortId = generateShortId(credentialId);
      }
    } catch (err) {
      console.error('Error parsing metadata:', err);
      // Generate a short ID if there's an error parsing metadata
      credentialData.shortId = generateShortId(credentialId);
    }
    
    return credentialData;
  };

  // Function to generate a short ID from a credential ID
  const generateShortId = (credentialId) => {
    // Convert credentialId to string if it's a number
    const idString = String(credentialId);
    
    // If the ID is already short (less than 10 chars), return it as is
    if (idString.length < 10) return idString;
    
    // Otherwise, take the first 6 characters and last 4 characters
    return `${idString.substring(0, 6)}...${idString.substring(idString.length - 4)}`;
  };

  const getStudentCredentials = async (studentAddress) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    return await contract.getStudentCredentials(studentAddress);
  };

  const getInstitutionCredentials = async (institutionAddress) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    return await contract.getInstitutionCredentials(institutionAddress);
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        balance,
        isInstitution,
        isOwner,
        provider,
        contract,
        isInitializing,
        error,
        isMetaMaskInstalled,
        connectWallet,
        logout,
        registerInstitution,
        removeInstitution,
        issueCredential,
        revokeCredential,
        getCredential,
        getStudentCredentials,
        getInstitutionCredentials,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};