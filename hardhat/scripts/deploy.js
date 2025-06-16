require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const TrustedBeacon = await ethers.getContractFactory('TrustedBeacon');
  const contract = await TrustedBeacon.deploy();
  await contract.deployed();

  console.log('TrustedBeacon deployed to:', contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
