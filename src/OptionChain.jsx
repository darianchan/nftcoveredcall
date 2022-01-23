// 0xAd62c224C1e9e9EC4601e452EDc3eCfd1Caa620c => test nft 2 address deployed through remix
require("dotenv").config();
const { REACT_APP_NFT_ADDRESS, REACT_APP_COVEREDCALL_ADDRESS } = process.env;

import Navbar from './Navbar'
import { ethers } from "ethers";
import React, { useState } from "react";
import CoveredCall from "./CoveredCall.json";
import Nft from "./TestNFT.json";
import OptionsTable from "./OptionsTable";
import BuyCallOption from "./BuyOption";
import ExerciseOption from "./ExerciseOption";
import CreateCoveredCall from "./CreateCoveredCall";
import ClaimNFT from "./ClaimNFT";


const coveredCallAddress = REACT_APP_COVEREDCALL_ADDRESS;
const nftAddress = REACT_APP_NFT_ADDRESS; // this is the starting nft address created
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const coveredCall = new ethers.Contract(
  coveredCallAddress,
  CoveredCall.abi,
  provider
);
const nft = new ethers.Contract(nftAddress, Nft.abi, provider);

class OptionChain extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nftAddress: null,
      userNft: null,
      nftID: null,
      strikePrice: null,
      expirationTime: null,
      premiumPrice: null,
      currentOptions: [],
      message: null,
      userChoice: 0,
    };

    this.onChangeNftAddress = this.onChangeNftAddress.bind(this);
    this.onChangeNftID = this.onChangeNftID.bind(this);
    this.onChangeStrikePrice = this.onChangeStrikePrice.bind(this);
    this.onChangeExpirationTime = this.onChangeExpirationTime.bind(this);
    this.onChangePremiumPrice = this.onChangePremiumPrice.bind(this);
    this.onCreateCoveredCall = this.onCreateCoveredCall.bind(this);
    this.onMint = this.onMint.bind(this);
    this.onApproveTransfer = this.onApproveTransfer.bind(this);
    this.renderNewOptionCreated = this.renderNewOptionCreated.bind(this);
    this.renderInitialOptions = this.renderInitialOptions.bind(this);
    this.onDisplayCoveredCall = this.onDisplayCoveredCall.bind(this);
    this.onDisplayBuyOption = this.onDisplayBuyOption.bind(this);
    this.onDisplayExerciseOption = this.onDisplayExerciseOption.bind(this);
    this.onDisplayCalimNFT = this.onDisplayCalimNFT.bind(this);
  }

  componentDidMount() {
    this.renderInitialOptions();
  }

  async connectToMetamask() {
    try {
      console.log("Signed in", await signer.getAddress());
    } catch (err) {
      console.log("Not signed in");
      await provider.send("eth_requestAccounts", []);
    }
  }

  onChangeNftAddress(event) {
    this.setState({ nftAddress: event.target.value });
  }

  onChangeNftID(event) {
    this.setState({ nftID: event.target.value });
  }

  onChangeStrikePrice(event) {
    this.setState({ strikePrice: event.target.value });
  }

  onChangeExpirationTime(event) {
    this.setState({ expirationTime: event.target.value });
  }

  onChangePremiumPrice(event) {
    this.setState({ premiumPrice: event.target.value });
  }

  async onCreateCoveredCall(event) {
    event.preventDefault();

    let nftAddress = this.state.nftAddress;
    let nftID = this.state.nftID;
    let expirationTime = this.state.expirationTime;
    let premiumPrice = ethers.utils.parseEther(
      this.state.premiumPrice.toString()
    );
    let strikePrice = ethers.utils.parseEther(
      this.state.strikePrice.toString()
    );

    this.onApproveTransfer();

    if (typeof window.ethereum !== "undefined") {
      try {
        this.setState({ message: "creating covered call" });
        let tx = await coveredCall
          .connect(signer)
          .createCoveredCall(
            nftAddress,
            nftID,
            strikePrice,
            expirationTime,
            premiumPrice
          );
        let receipt = await tx.wait();
        let events = receipt.events;
        let coveredCallCreatedEvent = events[2].args;
        let optionID = coveredCallCreatedEvent._optionID.toNumber();

        if (receipt.status == 1) {
          this.setState({
            message: `covered call created successfuly with id: ${optionID}`,
          });
          this.renderNewOptionCreated(nftAddress, optionID);
        } else if (receipt.status == 0) {
          this.setState({ message: "covered call creation failed" });
        }
        console.log(`call option created with id: ${optionID}`);
      } catch (err) {
        this.setState({ message: "covered call creation failed" });
        console.log("Error: ", err);
      }
    }
  }

  async onApproveTransfer() {
    // event.preventDefault();
    let nftID = this.state.nftID
    let userNft = nft.attach(this.state.nftAddress);

    if (typeof window.ethereum !== "undefined") {
      try {
        this.setState({ message: "approving nft transfer" });
        let tx = await userNft.connect(signer).approve(coveredCallAddress, nftID);
        // let tx = await nft.connect(signer).approve(coveredCallAddress, nftID); => MADE CHANGES HERE
        let receipt = await tx.wait();

        if (receipt.status == 1) {
          this.setState({ message: "successfully approved transfer" });
        }
      } catch (err) {
        this.setState({ message: "approve transfer failed" });
        console.log("Error: ", err);
      }
    }
  }

  async onMint() {
    //TODO: this is for demonstration purposes only - remove in production
    if (typeof window.ethereum !== "undefined") {
      try {
        await nft.connect(signer).mintNFT();
        console.log("nft minted");
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  async renderNewOptionCreated(nftAddress, optionID) {
    let optionValues = await coveredCall.getOption(nftAddress, optionID);
    let nftID = optionValues[1].toNumber();
    let strikePrice = ethers.utils.formatEther(optionValues[2].toString());
    let expirationTime = optionValues[3].toNumber();
    let premiumPrice = ethers.utils.formatEther(optionValues[4].toString());
    let buyerAddress = optionValues[5];
    let sellerAddress = optionValues[6];

    let joined = this.state.currentOptions.concat({
      optionID: optionID,
      nftAddress: nftAddress,
      nftID: nftID,
      expirationTime: expirationTime,
      strikePrice: strikePrice,
      premiumPrice: premiumPrice,
      buyerAddress: buyerAddress,
      sellerAddress: sellerAddress,
    });
    this.setState({ currentOptions: joined });
  }

  // renders historical data of all options ever created (including expired, bought, and exercised options)
  // TODO: for future implementations, we can filter through to only display available and active options to users
  async renderInitialOptions() {
    let eventsFilter = coveredCall.filters.CoveredCallCreated();
    let events = await coveredCall.queryFilter(eventsFilter);
    let currentOptions = [];

    for (var i = 0; i < events.length; i++) {
      let currentEvent = events[i].args;
      let nftAddress = currentEvent._nftAddress;
      let nftID = currentEvent._nftID.toNumber();
      let optionID = currentEvent._optionID.toNumber();
      let premiumPrice = ethers.utils
        .formatEther(currentEvent._premiumPrice)
        .toString();
      let strikePrice = ethers.utils
        .formatEther(currentEvent._strikePrice)
        .toString();
      let expirationTime = currentEvent._expirationTime.toNumber();
      let creationTime = currentEvent._creationTime.toNumber();
      let date = new Date((creationTime + expirationTime) * 1000); // time of creation plus seconds
      let buyer = currentEvent._buyer;
      let seller = currentEvent._seller;

      currentOptions.push({
        optionID: optionID,
        nftAddress: nftAddress,
        nftID: nftID,
        expirationTime: date.toDateString(),
        strikePrice: strikePrice,
        premiumPrice: premiumPrice,
        buyerAddress: buyer,
        sellerAddress: seller,
      });
    }

    this.setState({ currentOptions: currentOptions });
  }

  onDisplayCoveredCall() {
    this.setState({ userChoice: 1 });
  }

  onDisplayBuyOption() {
    this.setState({ userChoice: 2 });
  }

  onDisplayExerciseOption() {
    this.setState({ userChoice: 3 });
  }

  onDisplayCalimNFT() {
    this.setState({ userChoice: 4 });
  }

  render() {
    const { userChoice } = this.state;
    return (
      <div>
        {/* <Navbar/> */}
        {userChoice === 0 ? (
          <div id="buttonWrapper">
            <button onClick={this.onDisplayCoveredCall}>
              Create Covered Call
            </button>
            <button onClick={this.onDisplayBuyOption}>Buy Option</button>
            <button onClick={this.onDisplayExerciseOption}>
              Exercise Option
            </button>
            <button onClick={this.onDisplayCalimNFT}>Claim NFT</button>
          </div>
        ) : null}
        {userChoice === 1 ? (
          <CreateCoveredCall
            onCreateCoveredCall={this.onCreateCoveredCall}
            onChangeNftAddress={this.onChangeNftAddress}
            onChangeNftID={this.onChangeNftID}
            onChangeStrikePrice={this.onChangeStrikePrice}
            onChangeExpirationTime={this.onChangeExpirationTime}
            onChangePremiumPrice={this.onChangePremiumPrice}
            onApproveTransfer={this.onApproveTransfer}
            onMint={this.onMint}
          />
        ) : null}
        {userChoice === 2 ? (
          <BuyCallOption coveredCall={coveredCall} signer={signer} />
        ) : null}
        {userChoice === 3 ? (
          <ExerciseOption coveredCall={coveredCall} signer={signer} />
        ) : null}
        {userChoice === 4 ? (
          <ClaimNFT coveredCall={coveredCall} signer={signer} />
        ) : null}
        {this.state.message ? <div>{this.state.message}</div> : null}
        <OptionsTable currentOptions={this.state.currentOptions} />
        <button onClick={this.connectToMetamask}>Connect to metamask</button>
      </div>
    );
  }
}

export default OptionChain;
