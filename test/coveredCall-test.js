const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers

describe("CoveredCall", function () {
  let coverCallFactory;
  let coverCall;
  let accounts;
  let testNFTFactory;
  let testNFT

  beforeEach(async function() {
    accounts = await ethers.getSigners();

    coverCallFactory = await ethers.getContractFactory("CoveredCall");
    coverCall = await coverCallFactory.deploy();
    await coverCall.deployed();

    testNFTFactory = await ethers.getContractFactory("TestNFT");
    testNFT = await testNFTFactory.deploy();
    await testNFT.deployed();

    await testNFT.mintNFT();
    await testNFT.approve(coverCall.address, 1); // aprove nft to be transfered first
  })

  it("should deploy the covercall contract", async function() {
    expect(coverCall.address).to.exist;
  });

  it("should deploy the test nft contract", async function() {
    expect(testNFT.address).to.exist;
  });

  it("should allow a user who owns an nft to create a call option for sale", async function() {
    await coverCall.createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 30, ethers.utils.parseEther("5"));

    let value = BigNumber.from(await coverCall.optionID());
    expect(value).to.eq(1)
  })

  it("should revert if a user creates a call option without owning the nft", async function() {
    await expect(coverCall.connect(accounts[1])
      .createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 30, ethers.utils.parseEther("5")))
      .to.be.reverted;
  })

  it("should revert if a user enters expiration time longer than 1 year", async function() {
    await expect(coverCall.createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 366, ethers.utils.parseEther("5")))
      .to.be.revertedWith("option expiration must be less than 1 year");
  })

  it("should only allow 1 option to be created at a time per nft", async function() {
    await coverCall.createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 30, ethers.utils.parseEther("5"));
    await expect(coverCall.createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 30, ethers.utils.parseEther("5")))
      .to.be.reverted;
  });

  it("should return back the info about the given option", async function() {
    await coverCall.createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 30, ethers.utils.parseEther("5"));
    let returnValues = await coverCall.getOption(testNFT.address, 1)
    console.log('look here:', await coverCall.optionsCreatedByNFT(testNFT.address, 1))
    expect(returnValues[0]).to.eq(testNFT.address);
  })

  describe("buy and execute call option", function() {

    beforeEach(async function() {
      // user 1 creates the option with strikeprice = 10 eth, expiration date = 30 days out, premium = 1 eth
      await coverCall.createCoveredCall(testNFT.address, 1, ethers.utils.parseEther("10"), 86400 * 30, ethers.utils.parseEther("1"));
    })

    it("should let a user buy a call option", async function() {  
      // user 2 buys the call option
      await coverCall.connect(accounts[1])
        .buyCallOption(testNFT.address, 1, {value: ethers.utils.parseEther("1")} );
  
      let owner = await coverCall.ownerOf(1);
      expect(owner).to.eq(accounts[1].address);
    })

    it("should revert if user doesn't pay enough for the option premium", async function() {
      // user 2 buys the call option
      await expect(coverCall.connect(accounts[1])
        .buyCallOption(testNFT.address, 1, {value: ethers.utils.parseEther(".1")} ))
        .to.be.reverted;
    })

    it("should let a user buy and execute a call option", async function() {
      // user 2 buys the call option
      await coverCall.connect(accounts[1])
        .buyCallOption(testNFT.address, 1, {value: ethers.utils.parseEther("1")} );

      // user 2 executes the call option
      await coverCall.connect(accounts[1])
        .executeCallOption(testNFT.address, 1, {value: ethers.utils.parseEther("10")})
        
      let owner = await testNFT.ownerOf(1);
      expect(owner).to.eq(accounts[1].address);
    })
    
    it("should revert if a user tries to execute a call option after expiration time", async function() {
      await coverCall.connect(accounts[1])
        .buyCallOption(testNFT.address, 1, {value: ethers.utils.parseEther("1")} );

      // increase time by 31 days so option expires
      await ethers.provider.send("evm_increaseTime", [86400 * 31])
      await ethers.provider.send("evm_mine")

      // user 2 executes the call option
      await expect(coverCall.connect(accounts[1])
        .executeCallOption(testNFT.address, 1, {value: ethers.utils.parseEther("10")}))
        .to.be.reverted;
    })

    describe("claim nft from unexercised option", function() {

      it("should allow option creator to claim back nft from exercised option after expiration", async function() {
        // increase time by 31 dyas so option expires
        await ethers.provider.send("evm_increaseTime", [86400 * 31])
        await ethers.provider.send("evm_mine")
        await coverCall.withdrawNFTFromUnexercisedOption(testNFT.address, 1, 1);
        let owner = await testNFT.ownerOf(1)
        expect(owner).to.eq(accounts[0].address);
      })

      it("should not allow option creator to claim back nft before expiration", async function() {
        await expect(coverCall.withdrawNFTFromUnexercisedOption(testNFT.address, 1, 1))
          .to.be.revertedWith("this option has not expired yet")
      })

      it("should only allow original option seller to claim back nft", async function() {        
        await ethers.provider.send("evm_increaseTime", [86400 * 31])
        await ethers.provider.send("evm_mine")

        await expect(coverCall.connect(accounts[2]).withdrawNFTFromUnexercisedOption(testNFT.address, 1, 1))
         .to.be.revertedWith("you don't own this nft");
      })
    })
  })
});