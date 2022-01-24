// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Test NFT for ERC721 approval methods
contract TestNFT is ERC721 {
    uint id = 0;

    constructor() ERC721("test", "test") {}

    function mintNFT() public {
        id++;
        _mint(msg.sender, id);
    }
}