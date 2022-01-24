import React from "react";

class ClaimNFT extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nftAddress: null,
      nftID: null,
      optionID: null,
      message: null,
    };

    this.onClaimNft = this.onClaimNft.bind(this);
    this.onChangeNftAddress = this.onChangeNftAddress.bind(this);
    this.onChangeNftID = this.onChangeNftID.bind(this);
    this.onChangeOptionID = this.onChangeOptionID.bind(this);
  }

  async onClaimNft(event) {
    event.preventDefault();
    const { coveredCall, signer } = this.props;
    const { nftAddress, nftID, optionID } = this.state;

    try {
      let tx = await coveredCall
        .connect(signer)
        .withdrawNFTFromUnexercisedOption(nftAddress, nftID, optionID);
      let receipt = await tx.wait();

      if (receipt.status == 1) {
        this.setState({ message: "CLAIM NFT SUCCESSFUL" });
      }
    } catch (err) {
      this.setState({ message: err.error.message });
      console.log("error:", err);
    }
  }

  onChangeNftAddress(event) {
    this.setState({ nftAddress: event.target.value });
  }

  onChangeNftID(event) {
    this.setState({ nftID: event.target.value });
  }

  onChangeOptionID(event) {
    this.setState({ optionID: event.target.value });
  }

  render() {
    return (
      <div className="action">
        <div className="modalBackground">
          <button onClick={this.props.onBackButton}>Back</button>
          <div className="modal">
            <form className="modalContent" onSubmit={this.onClaimNft}>
              <input
                type="text"
                name="nftAddress"
                onChange={this.onChangeNftAddress}
              />
              <label>NFT Address</label>
              <br />

              <input type="number" name="nftID" onChange={this.onChangeNftID} />
              <label>NFT ID</label>
              <br />

              <input
                type="number"
                name="optionID"
                onChange={this.onChangeOptionID}
              />
              <label>Option ID</label>
              <br />

              <input
                className="inputButton"
                type="submit"
                name="submit"
                value="Claim NFT"
              />
            </form>
            {this.state.message ? <div>{this.state.message}</div> : null}
          </div>
        </div>
      </div>
    );
  }
}

export default ClaimNFT;
