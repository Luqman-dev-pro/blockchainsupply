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

    function getProduct(uint productId) public view returns (string memory name, uint timestamp, State state, address owner) {
        require(productId < productCount, "Invalid Product ID");
        Product memory product = products[productId];
        return (product.name, product.timestamp, product.state, product.owner);
    }
}
