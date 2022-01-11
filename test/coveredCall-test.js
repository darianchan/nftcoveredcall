const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers

describe("CoveredCall", function () {
  let coveredCallFactory;
  let coveredCall;
  let accounts;
  let testNFTFactory;
  let testNFT

  beforeEach(async function() {
    accounts = await ethers.getSigners();

    coveredCallFactory = await ethers.getContractFactory("CoveredCall");
    coveredCall = await coveredCallFactory.deploy();
    await coveredCall.deployed();

    testNFTFactory = await ethers.getContractFactory("TestNFT");
    testNFT = await testNFTFactory.deploy();
    await testNFT.deployed();

    // mint and approve the test nft
    await testNFT.mintNFT();
    await testNFT.approve(coveredCall.address, 1);
  })

  it("should deploy the coveredCall contract", async function() {
    expect(coveredCall.address).to.exist;
  });

  it("should deploy the test NFT contract", async function() {
    expect(testNFT.address).to.exist;
  });

  it("should allow a user who owns an NFT to create a call option for sale", async function() {
    await coveredCall.createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 30, ethers.utils.parseEther("5"));

    let value = BigNumber.from(await coveredCall.optionID());
    expect(value).to.eq(1)
  })

  it("should revert if a user tries to creates a coveredCall without owning the NFT", async function() {
    await expect(coveredCall.connect(accounts[1])
      .createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 30, ethers.utils.parseEther("5")))
      .to.be.reverted;
  })

  it("should revert if a user enters an expiration time longer than 1 year", async function() {
    await expect(coveredCall.createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 366, ethers.utils.parseEther("5")))
      .to.be.revertedWith("option expiration time must be less than 1 year");
  })

  it("should only allow 1 coveredCall to be created at a time per NFT", async function() {
    await coveredCall.createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 30, ethers.utils.parseEther("5"));
    await expect(coveredCall.createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 30, ethers.utils.parseEther("5")))
      .to.be.reverted;
  });

  it("should return back information about the given option requested", async function() {
    await coveredCall.createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 30, ethers.utils.parseEther("5"));
    let returnValues = await coveredCall.getOption(testNFT.address, 1)
    expect(returnValues[0]).to.eq(testNFT.address);
  })

  describe("buy and execute coveredCall (call option)", function() {
    beforeEach(async function() {
      // user 1 creates the coveredCall with strikeprice = 10 eth, expiration date = 30 days out (1 day = 86400 seconds), premium = 1 eth
      await coveredCall.createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 30, ethers.utils.parseEther("1"));
    })

    it("should let a user buy a coveredCall", async function() {  
      // user 2 buys the coveredCall
      await coveredCall.connect(accounts[1])
        .buyCallOption(testNFT.address, 1, {value: ethers.utils.parseEther("1")});
  
      let owner = await coveredCall.ownerOf(1);
      expect(owner).to.eq(accounts[1].address);
    })

    it("should revert if a user tries to buy a coveredCall, but doesn't send enough eth", async function() {
      // user 2 buys the coveredCall
      await expect(coveredCall.connect(accounts[1])
        .buyCallOption(testNFT.address, 1, {value: ethers.utils.parseEther(".1")}))
        .to.be.reverted;
    })

    it("should let a user buy and execute a coveredCall", async function() {
      // user 2 buys the coveredCall
      await coveredCall.connect(accounts[1])
        .buyCallOption(testNFT.address, 1, {value: ethers.utils.parseEther("1")});

      // user 2 executes the coveredCall
      await coveredCall.connect(accounts[1])
        .executeCallOption(testNFT.address, 1, {value: ethers.utils.parseEther("10")})
        
      let owner = await testNFT.ownerOf(1);
      expect(owner).to.eq(accounts[1].address);
    })
    
    it("should revert if a user tries to execute a coveredCall after the expiration time", async function() {
      // used 2 buys the coveredCall
      await coveredCall.connect(accounts[1])
        .buyCallOption(testNFT.address, 1, {value: ethers.utils.parseEther("1")});

      // increase time by 31 days so option expires
      await ethers.provider.send("evm_increaseTime", [86400 * 31])
      await ethers.provider.send("evm_mine")

      // user 2 executes the coveredCall
      await expect(coveredCall.connect(accounts[1])
        .executeCallOption(testNFT.address, 1, {value: ethers.utils.parseEther("10")}))
        .to.be.reverted;
    })

    describe("claim NFT from unexercised option", function() {
      
      it("should allow option creator to claim back nft from unexercised option after expiration", async function() {
        // increase time by 31 dyas so option expires
        await ethers.provider.send("evm_increaseTime", [86400 * 31])
        await ethers.provider.send("evm_mine")
        await coveredCall.withdrawNFTFromUnexercisedOption(testNFT.address, 1, 1);
        let owner = await testNFT.ownerOf(1)
        expect(owner).to.eq(accounts[0].address);
      })

      it("should not allow option creator to claim back nft before expiration", async function() {
        await expect(coveredCall.withdrawNFTFromUnexercisedOption(testNFT.address, 1, 1))
          .to.be.revertedWith("this option has not expired yet")
      })

      it("should only allow original option seller to claim back nft", async function() {        
        await ethers.provider.send("evm_increaseTime", [86400 * 31])
        await ethers.provider.send("evm_mine")

        await expect(coveredCall.connect(accounts[2]).withdrawNFTFromUnexercisedOption(testNFT.address, 1, 1))
         .to.be.revertedWith("you don't own this nft");
      })
    })
  })
});