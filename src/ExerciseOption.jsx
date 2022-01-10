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

    this.setState({ message: "loading... executing option" });

    try {
      let tx = await coveredCall
        .connect(signer)
        .executeCallOption(nftAddress, optionID, { value: formattedEth });
      let receipt = await tx.wait();
      if (receipt.status == 1) {
        this.setState({ message: "option exercised success" });
      } 
    } catch (err) {
      this.setState({ message: "option exercise unsucessful" });
      console.log("error:", err);
    }
  }

  render() {
    return (
      <div className="action">
        <form onSubmit={this.onBuyOption}>
          <input
            type="text"
            name="nftAddress"
            onChange={this.onChangeNftAddress}
          />
          <label>nftAddress</label>
          <br />

          <input
            type="number"
            name="optionID"
            onChange={this.onChangeOptionID}
          />
          <label>Option ID</label>
          <br />

          <input type="string" name="ethAmount" onChange={this.onChangeEth} />
          <label>Eth Amount (strike price) </label>
          <br />

          <input
            className="inputButton"
            type="submit"
            name="submit"
            value="Exercise Option"
          />
        </form>
        {this.state.message ? <div>{this.state.message}</div> : null}
      </div>
    );
  }
}

export default BuyCallOption;
