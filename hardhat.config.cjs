// Import required Hardhat plugins and environment configuration
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({ path: '.env', override: true });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // Solidity compiler configuration
  solidity: {
    version: "0.8.19",    // Solidity version to use
    settings: {
      optimizer: {
        enabled: true,    // Enable the Solidity optimizer
        runs: 200         // Number of optimizer runs
      }
    }
  },

  // Network configurations for deployment and testing
  networks: {
    // Local Hardhat network configuration
    hardhat: {
      chainId: 1337      // Chain ID for local network
    },
    // Local Ganache network configuration
    localhost: {
      url: "http://127.0.0.1:7545",  // Ganache RPC URL
      chainId: 1337,                 // Chain ID matching Ganache
    },
    // Fuji testnet configuration
    fuji: {
      url: 'https://avalanche-fuji-c-chain.publicnode.com',
      accounts: [process.env.PRIVATE_KEY],
      chainId: 43113,
      network_id: 43113,
      gas: 8000000,
      gasPrice: 225000000000,
      timeout: 60000
    }
  },

  // Etherscan configuration for verification
  etherscan: {
    apiKey: {
      fuji: 'routescan' // Using routescan as the API key
    },
    customChains: [
      {
        network: 'fuji',
        chainId: 43113,
        urls: {
          apiURL: 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan',
          browserURL: 'https://testnet.snowtrace.io'
        }
      }
    ]
  },

  // Project structure paths
  paths: {
    sources: "./contracts",     // Smart contract source files
    tests: "./test",           // Test files
    cache: "./cache",          // Compilation cache
    artifacts: "./artifacts"   // Compiled contract artifacts
  }
};

