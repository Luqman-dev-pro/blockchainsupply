// ================================
// 3. Hardhat Config & Deployment
// ================================

// Install:
// npm install --save-dev hardhat

// Create config:
// npx hardhat

// File: scripts/deploy.js

const hre = require("hardhat");

async function main() {
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const contract = await SupplyChain.deploy();
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
