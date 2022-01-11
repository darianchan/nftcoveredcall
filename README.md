# Earn Yield By Creating Covered Calls on NFTs

## Project Description
 - This repo implements selling and buying call options on nfts. If you are the owner of an nft and would like to earn yield on it, you can implement a covered call strategy. For a more detailed explanation on what covered calls are, please see the info [here](https://www.investopedia.com/terms/c/coveredcall.asp).
Beware that if the other party who bought your call option decides to execute their option, then this will result in you losing (selling) your nft.
 - To demonstrate the functionality of this project, the erc721 available at address "TODO: fill in the address here" is made available for you to both mint and approve transfer. This is for demonstration purposes only on the front end and has no effect on the smart contract implementation

## Technologies Used
The solidity contract that implements the functionality is in the CoveredCall.sol file. Here, you will see how creating an option, selling an option, and executing an option is implemented. On the front end under the src file, you can find the implementation using React.js there. Data is queried from the smart contract events emitted via ethers.js and rendered within the React Components. Test cases can be found under the test folder and are written using chai and hardhat.

## Future Implementations and Challenges
 - For a future implementation to consider, the UI could be more user friendly and display options that can be filtered by options that have been bought, options that have been exercised, or options that are expired. Because the front end is currently querying for ALL events emitted when an option is created, it now displays the entire history of all options created, even those that have been bought or exercised.
 - In order to implement this in a more efficient way, we may consider setting up a centralized server and database. This will allow the option data to be more easily queried and displayed to the user. Of course, the tradeoff here is centralization, but this use case is only for the front end. The smart contract interaction and data preserved on the blockchain will still be the same.
 - Right now, it only supports the nft at address "TODO: fill in test nft address here", as a MVP of the product. In the future, this project should grow to be able to dynamically support any verified nft through etherscan.
 - For the "expiration time" input field when creating a covered call, it is currently in seconds. Instead, we can create a list of expiration dates and options in future implementations (ex. every third Friday is an option expiration date).

 ## How to Install and Run the Project
 - Clone the project to your local machine. In a .env file, set your API_URL = "your API URL here", PRIVATE_KEY = "your private key here", API_KEY = "your API KEY here", REACT_APP_NFT_ADDRESS = "TODO put address of deployed contract here from mainnet" and REACT_APP_COVEREDCALL_ADDRESS = "TODO: put the address of the deployed contract here from mainnet"
 - If you would like to contribute to experiment with this repo locally on the testnet, you can fill in the credentials above and deploy through Alchemy's api
 - Run "npm install" to install all dependencies
 - Run "npm run start" to start up the front end
 - Go to localhost 3000 and you should see the app up and running there

 ### How to mint + approve nft and create, buy, and execute a call option
 - First, you will need to click on the connect to metamask button and connect to you wallet. If you are using the repo on mainnet, please be careful before signing any transactions, as they will cost you real eth
 - Click on the create covered call button
 - Click on mint button - this will mint you an nft from the test nft deployed
 - Input the id of the nft that you just minted and click the approve button (found after you hit create covered call)
 - You now own the nft and have approved the smart contract to be able to transfer your nft on your behalf
 - Click on create covered call and fill out the nftAddress, nftID, strikeprice, expiration time (enter this in seconds from now) and premium price (cost of option). This may take a second, and after successfully creating the covered call, you can refresh the page and see your newly created option displayed
 - to buy the call option, click on the "buy option" button and enter the nftAddress and optionID (displayed on the page), along with the required amount of eth to buy the option (premium price)
 - In order to exercise the option, click on "exercise option" and input the nftAddress and optionID along with the require amount of eth to purchase the nft (option strike)