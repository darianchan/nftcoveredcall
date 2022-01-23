import React from "react";

function CreateCoveredCall(props) {
  const {
    onCreateCoveredCall,
    onChangeNftAddress,
    onChangeNftID,
    onChangeStrikePrice,
    onChangeExpirationTime,
    onChangePremiumPrice,
    message,
    onApproveTransfer,
    onBackButton,
    onMint,
  } = props;
  return (
    <div className="action">
      <div className="modalBackground">
        <button onClick={onBackButton}> Go Back</button>
        <div className="modal">
          <form className="modalContent" onSubmit={onCreateCoveredCall}>
            <input
              type="text"
              name="nftAddress"
              onChange={onChangeNftAddress}
            />
            <label>NFT Address</label>
            <br />

            <input type="text" name="nftID" onChange={onChangeNftID} />
            <label>NFT ID</label>
            <br />

            <input
              type="text"
              name="strikePrice"
              onChange={onChangeStrikePrice}
            />
            <label>Strike Price</label>
            <br />

            <input
              type="text"
              name="expirationTime"
              onChange={onChangeExpirationTime}
            />
            <label>Expiration Time (Days From Now)</label>
            <br />

            <input
              type="text"
              name="premiumPrice"
              onChange={onChangePremiumPrice}
            />
            <label>Premium Price</label>
            <br />

            <input
              className="inputButton"
              type="submit"
              name="submit"
              value="Create Covered Call"
            />
          </form>
          <button
            id="approveButton"
            className="modalContent inputButton"
            onClick={onApproveTransfer}
          >
            {" "}
            Approve Transfer
          </button>
          {message ? <div className="message">{message}</div> : null}
        </div>
      </div>
      <div></div>
    </div>
  );
}

export default CreateCoveredCall;
