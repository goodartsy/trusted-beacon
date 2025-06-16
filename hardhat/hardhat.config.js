require('@nomicfoundation/hardhat-ethers');
require('dotenv').config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: {
          viaIR: true,                // ← hier IR aktivieren
          optimizer: {
            enabled: true,            // Optimizer an
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    mumbai: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};