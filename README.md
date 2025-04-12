# Academic Credentials Blockchain Platform

A decentralized platform for issuing and verifying academic credentials using blockchain technology.

## Features

- Issue academic credentials as NFTs
- Verify credentials on-chain
- View and manage credentials in a user-friendly dashboard
- Secure storage of credential data on IPFS
- Role-based access control (Institutions and Students)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask wallet
- Hardhat (for local development)
- IPFS (for storing credential data)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blockchain-education.git
cd blockchain-education
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
REACT_APP_CONTRACT_ADDRESS=your_contract_address
REACT_APP_NETWORK_ID=your_network_id
```

## Smart Contract Deployment

1. Compile the smart contract:
```bash
npx hardhat compile
```

2. Deploy the contract to your preferred network:
```bash
npx hardhat run scripts/deploy.js --network <network_name>
```

3. Update the contract address in your `.env` file with the deployed address.

## Running the Application

1. Start the development server:
```bash
npm start
```

2. Open your browser and navigate to `http://localhost:3000`

## Usage

### For Institutions

1. Connect your MetaMask wallet
2. Navigate to the "Issue Credentials" page
3. Fill in the student's wallet address and credential details
4. Upload the credential document to IPFS
5. Submit the transaction to issue the credential

### For Students

1. Connect your MetaMask wallet
2. View your credentials in the dashboard
3. Share your credential ID with verifiers
4. Access your credential documents through IPFS

### Verifying Credentials

1. Navigate to the "Verify" page
2. Enter the credential ID
3. View the verification result and credential details

## Security Considerations

- Always verify the contract address before interacting with the platform
- Keep your private keys secure
- Use a hardware wallet for large transactions
- Verify the IPFS hash of credential documents

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Ethereum Foundation
- IPFS
- MetaMask
- Hardhat

## Project Structure

```
├── contracts/           # Smart contracts
├── scripts/            # Deployment scripts
├── src/               # Frontend source code
│   ├── components/    # Vue components
│   ├── router/        # Vue router configuration
│   ├── store/         # Vuex store
│   ├── assets/        # Static assets
│   └── styles/        # Global styles
├── test/              # Test files
├── docs/              # Documentation
└── public/            # Public assets
```

## Contact

[Your Contact Information]
