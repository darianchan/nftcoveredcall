import React from "react";

function CreateCoveredCall(props) {
  const {
    onCreateCoveredCall,
    onChangeNftAddress,
    onChangeNftID,
    onChangeStrikePrice,
    onChangeExpirationTime,
    onChangePremiumPrice,
    onApproveTransfer,
    onMint,
  } = props;
  return (
    <div className="action">
      <form onSubmit={onCreateCoveredCall}>
        <input type="text" name="nftAddress" onChange={onChangeNftAddress} />
        <label>nftAddress</label>
        <br />

        <input type="text" name="nftID" onChange={onChangeNftID} />
        <label>nftID</label>
        <br />

        <input type="text" name="strikePrice" onChange={onChangeStrikePrice} />
        <label>strikePrice</label>
        <br />

        <input
          type="text"
          name="expirationTime"
          onChange={onChangeExpirationTime}
        />
        <label>expirationTime (in seconds)</label>
        <br />

        <input
          type="text"
          name="premiumPrice"
          onChange={onChangePremiumPrice}
        />
        <label>premiumPrice</label>
        <br />

        <input className="inputButton" type="submit" name="submit" value="Create Covered Call" />
      </form>
      <div>
        <form onSubmit={onApproveTransfer}>          
          <input type="number" name="nftID"></input>
          <label>nftID</label>
          <br/>
          <input className="inputButton" type="submit" name="submit" value="Approve nft transfer"></input>
        </form>
        {/* Minting is for demonstration purposes. Remove in future implementations to support all nfts*/}
        <button onClick={onMint}>Mint nft</button>{" "}
      </div>
    </div>
  );
}

export default CreateCoveredCall;
