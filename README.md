# blockchainsupply
Develop a Supply Chain Project

###############################

// Blockchain-based Supply Chain Tracking Project

/**
 * Project Overview:
 * We'll create a simple supply chain tracking dApp (decentralized app)
 * where products go through different stages (Created → Packed → Shipped → Delivered).
 * Each step is recorded on a blockchain using a smart contract.
 */

// ================================
// 1. Project Structure
// ================================

// Root Directory:
// supply-chain-dapp/
// ├── contracts/             // Solidity smart contract
// │   └── SupplyChain.sol
// ├── scripts/               // Deployment scripts
// │   └── deploy.js
// ├── src/                   // Frontend in React.js
// │   ├── App.js
// │   └── components/
// ├── test/                  // Smart contract tests
// │   └── SupplyChain.test.js
// ├── package.json
// └── hardhat.config.js

// ================================
// 2. Smart Contract (Solidity)
// ================================

// File: contracts/SupplyChain.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    enum State { Created, Packed, Shipped, Delivered }

    struct Product {
        string name;
        uint timestamp;
        State state;
        address owner;
    }

    mapping(uint => Product) public products;
    uint public productCount = 0;

    event StateChanged(uint productId, State newState);

    function createProduct(string memory name) public {
        products[productCount] = Product(name, block.timestamp, State.Created, msg.sender);
        emit StateChanged(productCount, State.Created);
        productCount++;
    }

    function changeState(uint productId, State newState) public {
        require(productId < productCount, "Invalid Product ID");
        Product storage product = products[productId];
        require(product.owner == msg.sender, "Only owner can update");
        require(uint(newState) > uint(product.state), "Invalid state transition");

        product.state = newState;
        emit StateChanged(productId, newState);
    }
}

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

// ================================
// 4. React Frontend (Simplified)
// ================================

// File: src/App.js

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import SupplyChain from './artifacts/contracts/SupplyChain.sol/SupplyChain.json';

const contractAddress = "<PASTE_YOUR_DEPLOYED_ADDRESS_HERE>";

function App() {
  const [contract, setContract] = useState(null);
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const init = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, SupplyChain.abi, signer);
      setContract(contractInstance);
      fetchProducts(contractInstance);
    };
    init();
  }, []);

  const createProduct = async () => {
    const tx = await contract.createProduct(productName);
    await tx.wait();
    fetchProducts(contract);
  };

  const fetchProducts = async (instance) => {
    const count = await instance.productCount();
    const fetched = [];
    for (let i = 0; i < count; i++) {
      const prod = await instance.products(i);
      fetched.push({
        id: i,
        name: prod.name,
        timestamp: new Date(prod.timestamp * 1000).toLocaleString(),
        state: Object.keys(SupplyChain.abi.find(e => e.name === "StateChanged").inputs[1].type === 'uint8' ? {
          0: 'Created', 1: 'Packed', 2: 'Shipped', 3: 'Delivered'
        } : {})[prod.state],
        rawState: prod.state,
        owner: prod.owner
      });
    }
    setProducts(fetched);
  };

  const changeState = async (productId, currentState) => {
    const newState = parseInt(currentState) + 1;
    const tx = await contract.changeState(productId, newState);
    await tx.wait();
    fetchProducts(contract);
  };

  return (
    <div>
      <h1>Supply Chain Tracker</h1>
      <input onChange={e => setProductName(e.target.value)} placeholder="Product Name" />
      <button onClick={createProduct}>Create Product</button>

      <h2>Products</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <strong>{product.name}</strong> — State: {product.state} — Owner: {product.owner} — Created: {product.timestamp}
            {product.rawState < 3 && (
              <button onClick={() => changeState(product.id, product.rawState)}>Advance State</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

// ================================
// 5. Running the Project
// ================================

// Step-by-step:
// 1. npm install
// 2. npx hardhat compile
// 3. npx hardhat node     (run local blockchain)
// 4. npx hardhat run scripts/deploy.js --network localhost
// 5. npm start            (start React app)

// ================================
// 6. Optional Improvements
// ================================
// - Add Metamask connection logic
// - Use The Graph to fetch and filter products
// - Add QR code support for physical goods
// - Implement Role-based access for Manufacturer, Shipper, Retailer
// - Store product details (image, info) on IPFS

// Let me know if you'd like any of these features added!
