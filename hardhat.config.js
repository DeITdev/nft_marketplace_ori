require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

const { SEPOLIA_API_URL } = process.env;
const { PRIVATE_KEY } = process.env;

// Validate environment variables
if (!SEPOLIA_API_URL || !PRIVATE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('SEPOLIA_API_URL:', SEPOLIA_API_URL ? '✅' : '❌');
  console.error('PRIVATE_KEY:', PRIVATE_KEY ? '✅' : '❌');
  process.exit(1);
}

module.exports = {
  solidity: '0.8.4',
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: SEPOLIA_API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 11155111,
    },
  },
};
