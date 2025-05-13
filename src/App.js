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