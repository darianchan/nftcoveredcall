const { ethers } = require("hardhat");

async function main() {
  // deploy the coveredCall contract
  const nftFactory = await ethers.getContractFactory("TestNFT")
  const nft = await nftFactory.deploy()
  console.log("test nft deployed to:", nft.address);

  // deploy the test nft contract
  const coveredCallFactory = await ethers.getContractFactory("CoveredCall")
  const coveredCall = await coveredCallFactory.deploy();
  console.log("coveredCall contract deployed to:", coveredCall.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
