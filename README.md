# Academic Chain - Blockchain Education Platform

A decentralized platform for managing academic credentials on the Avalanche Fuji Testnet.

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

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask wallet
- Avalanche Fuji Testnet configured in MetaMask

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Create environment files:
```bash
cp .env.example .env
cp .env.production.example .env.production
```

4. Update environment variables in `.env` and `.env.production`

## Development

1. Start local development server:
```bash
npm run dev
```

2. Deploy smart contracts:
```bash
npx hardhat run scripts/deploy.js --network fuji
```

## Deployment

The project is configured for deployment on Cloudflare Pages. See `cloudflare.toml` for configuration details.

## Testing

```bash
# Run smart contract tests
npx hardhat test

# Run frontend tests
npm run test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your License Here]

## Contact

[Your Contact Information]
