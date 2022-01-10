// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// each call option is represented by an nft. Gets minted when offer accepted and burned when executed
// an additional feature would be to make the option nft tradeable
contract CoveredCall is ERC721 {
    uint public optionID; // keeps count of total options and used as unique id

    struct Option {
        address buyer; // use address(0) to represent null buyer on creation
        address seller;
        address nftAddress;
        uint nftID;
        uint strikePrice; // in wei
        uint expirationTime; // in seconds
        uint premiumPrice; // in wei
        bool executed;
    }

    mapping (address => mapping (uint => Option)) public optionsCreatedByUser;
    mapping(address => mapping(uint => Option)) public optionsCreatedByNFT;
    

    event CoverCallCreated(address _nftAddress, uint _nftID, uint _strikePrice, uint _expirationTime, uint _premiumPrice, uint _optionID, address _buyer, address _seller, uint _creationTime);
    event OptionBought(address _buyer, address _seller, address _nftAddress, uint _nftID, uint _premiumPrice, uint _optionID);
    event OptionExecuted(uint _optionID);

    constructor() ERC721("CoveredCall", "CALL"){}

    function createCoveredCall(address _nftAddress, uint _nftID, uint _strikePrice, uint _expirationTime, uint _premiumPrice) public returns(uint) {
        // require you to own nft and then transfer it to the contract as collateral
        require(IERC721(_nftAddress).ownerOf(_nftID) == msg.sender, "must own the NFT to sell a call option"); // this line handles the case where someone tries to create another option for the same after time is expirated. You will need to claim unexercised option first because this contract still owns the nft
        require(_expirationTime <= 86400 * 365, "option expiration must be less than 1 year"); // 1 year maximum expiration
        require(_expirationTime >= 86400 * 7, "option expiration must be greater than 1 day"); // 7 days minimum expiration
        require(IERC721(_nftAddress).getApproved(_nftID) == address(this), "must approve nft to be transfered");
        IERC721(_nftAddress).transferFrom(msg.sender, address(this), _nftID); // this contract now owns the nft

        optionID++;
        Option memory option = Option({
            buyer: address(0), // address(0) means that the call option is created, but not yet sold
            seller: msg.sender,
            nftAddress: _nftAddress,
            nftID: _nftID,
            strikePrice: _strikePrice,
            expirationTime: block.timestamp + _expirationTime,
            premiumPrice: _premiumPrice,
            executed: false
        });

        optionsCreatedByUser[msg.sender][optionID] = option;
        optionsCreatedByNFT[_nftAddress][optionID] = option;

        emit CoverCallCreated(_nftAddress, _nftID, _strikePrice, _expirationTime, _premiumPrice, optionID, option.buyer, msg.sender, block.timestamp);
        return(optionID);
    }

    function buyCallOption(address _nftAddress, uint _optionID) public payable {
        Option storage option = optionsCreatedByNFT[_nftAddress][_optionID];

        // check for conditions that let you buy
        require(msg.value >= option.premiumPrice, "please send enough eth for option premium");
        require(block.timestamp < option.expirationTime, "the option you are trying to buy is expired");
        require(option.executed == false, "option has already been executed");

        // transfer eth to seller. Could use a tracker to keep balances, and then use a withdraw function where the sell goes to claim premium. Push vs. pull pattern
        option.buyer = msg.sender;
        (bool success, ) = option.seller.call{value: msg.value}("");
        require(success);

        // the minting prevents someone from buying a call option that's already bought again. You can only mint a tokenID once
        _mint(msg.sender, optionID);
        emit OptionBought(option.buyer, option.seller, option.nftAddress, option.nftID, option.premiumPrice, optionID);
    }

    function executeCallOption(address _nftAddress, uint _optionID) public payable {
        Option storage option = optionsCreatedByNFT[_nftAddress][_optionID];

        // check for conditions that let you execute
        require(IERC721(address(this)).ownerOf(optionID) == msg.sender, "only the option holder can exercise this option");
        require(option.executed == false, "option has already been executed");
        require(block.timestamp <= option.expirationTime, "this option has expired");
        require(msg.value >= option.strikePrice, "please send enough eth to buy the nft");

        // transfer eth to seller and the nft to buyer. Executes the option
        option.executed = true; // prevents attacks of exercising again
        (bool success, ) = option.seller.call{value: msg.value}(""); // could use a tracker to keep balances, and then use a withdraw function where the sell goes to claim premium. Push vs. pull pattern
        require(success);
        IERC721(option.nftAddress).transferFrom(address(this), msg.sender, option.nftID);

        delete optionsCreatedByUser[option.seller][_optionID];
        delete optionsCreatedByNFT[_nftAddress][_optionID];
        _burn(_optionID);

        emit OptionExecuted(optionID);
    }

    function withdrawNFTFromUnexercisedOption(address _nftAddress, uint _nftID, uint _optionID) public {
        Option storage option = optionsCreatedByNFT[_nftAddress][_optionID];

        // check that the user is elegible to withdraw nft
        require(msg.sender == option.seller, "you don't own this nft");
        require(option.executed == false, "this option was already executed"); // prolly don't need bc the option gets deleted anyways after execution
        require(block.timestamp > option.expirationTime, "this option has not expired yet");

        // transfer the nft back to original seller
        IERC721(_nftAddress).transferFrom(address(this), option.seller, _nftID);

        delete optionsCreatedByUser[option.seller][_optionID];
        delete optionsCreatedByNFT[_nftAddress][_optionID];
        
        // if option was bought, (minted) then burnwi
        if (option.buyer != address(0)) {
            _burn(_optionID);
        }
    }

    // you can't return a struct in solidity because they aren't a real object
    function getOption(address _nftAddress, uint _optionID) public view  returns(address, uint, uint, uint, uint, address, address){
        Option storage option = optionsCreatedByNFT[_nftAddress][_optionID];
        return (option.nftAddress, option.nftID, option.strikePrice, option.expirationTime, option.premiumPrice, option.buyer, option.seller);
    }

    receive() external payable {}
}