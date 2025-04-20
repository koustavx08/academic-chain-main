# Academic Credentials Blockchain Platform

A decentralized platform for issuing and verifying academic credentials using blockchain technology.

## Features

- Issue academic credentials as NFTs
- Verify credentials on-chain
- View and manage credentials in a user-friendly dashboard
- Secure storage of credential data on IPFS
- Role-based access control (Institutions and Students)

## Prerequisites

- Node.js (>=18.0.0)
- npm or yarn
- MetaMask wallet
- Avalanche Fuji Testnet configured in MetaMask
- IPFS (for storing credential data)

## Network Configuration

1. Add Avalanche Fuji Testnet to MetaMask:
```
Network Name: Avalanche Fuji Testnet
New RPC URL: https://api.avax-test.network/ext/bc/C/rpc
Chain ID: 43113
Symbol: AVAX
Explorer: https://testnet.snowtrace.io/
```

2. Get test AVAX from faucet:
- Visit https://faucet.avax.network/
- Enter your wallet address
- Select "Fuji (C-Chain)" network
- Request test tokens

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blockchain-education.git
cd blockchain-education
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```
PRIVATE_KEY=your_wallet_private_key
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
SNOWTRACE_API_KEY=your_snowtrace_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

## Smart Contract Deployment

1. Compile the smart contract:
```bash
npx hardhat compile
```

2. Deploy to Fuji Testnet:
```bash
npx hardhat run scripts/deploy.js --network fuji
```

3. Update the `VITE_CONTRACT_ADDRESS` in your `.env` file with the deployed address

## Running the Application

1. Start the backend server:
```bash
npm run server
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Development Mode

To run both frontend and backend concurrently:
```bash
npm run dev:all
```

## Testing

1. Run local hardhat node:
```bash
npx hardhat node
```

2. Run tests:
```bash
npx hardhat test
```

## Project Structure

```
├── contracts/           # Smart contracts
├── scripts/            # Deployment scripts
├── src/
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── context/       # React context
│   ├── utils/         # Utility functions
│   ├── assets/        # Static assets
│   └── styles/        # CSS styles
├── test/              # Test files
└── hardhat.config.js  # Hardhat configuration
```

## Troubleshooting

1. If npm install fails:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

2. If MetaMask connection fails:
- Ensure you're connected to Fuji Testnet
- Reset MetaMask account (Settings > Advanced > Reset Account)

## Security Considerations

- Never commit your `.env` file
- Use environment variables for sensitive data
- Keep your private keys secure
- Verify smart contract on Snowtrace after deployment

## License

MIT License

## Contact

[Your Contact Information]
