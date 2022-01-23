import React from "react";
import { ethers } from "ethers";

class BuyCallOption extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nftAddress: null,
      optionID: null,
      eth: null,
      message: null,
    };

    this.onBuyOption = this.onBuyOption.bind(this);
    this.onChangeNftAddress = this.onChangeNftAddress.bind(this);
    this.onChangeOptionID = this.onChangeOptionID.bind(this);
    this.onChangeEth = this.onChangeEth.bind(this);
  }

  onChangeNftAddress(event) {
    this.setState({ nftAddress: event.target.value });
  }

  onChangeOptionID(event) {
    this.setState({ optionID: event.target.value });
  }

  onChangeEth(event) {
    this.setState({ eth: event.target.value });
  }

  async onBuyOption(event) {
    event.preventDefault();
    const { coveredCall, signer } = this.props;
    const { nftAddress, optionID, eth } = this.state;
    const formattedEth = ethers.utils.parseEther(eth);

    this.setState({ message: "EXERCISING OPTION..." });

    try {
      let tx = await coveredCall
        .connect(signer)
        .executeCallOption(nftAddress, optionID, { value: formattedEth });
      let receipt = await tx.wait();
      if (receipt.status == 1) {
        this.setState({ message: "OPTION SUCCESSFULLY EXERCISED" });
      }
    } catch (err) {
      this.setState({ message: "OPTION EXERCISE FAILED" });
      console.log("error:", err);
    }
  }

  render() {
    return (
      <div className="action">
        <div className="modalBackground">
          <button onClick={this.props.onBackButton}> Go Back</button>
          <div className="modal">
            <form className="modalContent" onSubmit={this.onBuyOption}>
              <input
                type="text"
                name="nftAddress"
                onChange={this.onChangeNftAddress}
              />
              <label>NFT Address</label>
              <br />

              <input
                type="number"
                name="optionID"
                onChange={this.onChangeOptionID}
              />
              <label>Option ID</label>
              <br />

              <input
                type="string"
                name="ethAmount"
                onChange={this.onChangeEth}
              />
              <label>ETH Amount (strike price) </label>
              <br />

              <input
                className="inputButton"
                type="submit"
                name="submit"
                value="Exercise Option"
              />
            </form>
            {this.state.message ? (
              <div className="message">{this.state.message}</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default BuyCallOption;
