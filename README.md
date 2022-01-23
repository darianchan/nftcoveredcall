# Earn Yield By Creating Covered Calls on NFTs

## Project Description
This repo implements selling and buying call options on NFTs. If you are the owner of an NFT and would like to earn yield on it, you can implement a covered call. Beware that this may result in your losing your NFT if the other party decides to exercise the call option

 ## Covered Call Explanation
 Please see the info [here](https://www.investopedia.com/terms/c/coveredcall.asp)
 Example [here](https://corporatefinanceinstitute.com/resources/knowledge/trading-investing/covered-call/)

 ## How Options Are Priced
 The pricing of and NFT can be determined based off of the floor price for that collection from a marketplace like Opensea. 
 
 This holds true for floor NFTs that can be priced according to the floor of the collection, but for NFTs with more rare traits, the pricing becomes arbitrary. 

 The pricing of NFTs with more rare traits then becomes up to the owner of the NFT to define a strike price and premium. This strike price should however ALWAYS be above the floor price of a collection if the NFT is considered to be more rare. At this point, the option premium also becomes arbitrary and is solely up to the owner of the NFT to decide how much premium they would like to collect to make creating a covered call worth it (since creating a covered call can always result in an owner losing an NFT).
 
 For example, if you bought an NFT for 100 ETH and the current floor price of the collection if 60 ETH, then you may define a strike price of 102 ETH and an option premium of 8 ETH. Once someone buys your covered call, you will collect 8 ETH regardless of the price movement of the NFT. This would be a win if the price of the NFT doesn't move much or even drops slightly. However, if the perceived price of the NFT goes up to 200 ETH, then the buyer of the covered call would exercise his call option and be able to buy your NFT for 102 ETH.

## Future Implementations and Challenges
 - Improve UI to only display available and active options
 - We can consider writing a subgraph so that we can query for specific covered calls that have been bought, sold, active, etc...
 - Use an oracle to update floor prices of top NFT collections and use that to price options

 ## How to Install and Run the Project
 - Clone the project to your local machine. In a .env file, set your API_URL = "your API URL here", PRIVATE_KEY = "your private key here", API_KEY = "your API KEY here", REACT_APP_NFT_ADDRESS = "0x498cD934C7c2f713f453EB17caE001EE3E468D1e" and REACT_APP_COVEREDCALL_ADDRESS = "0x46b7350BCdc199248c1d3f98c33A15c92f5D3Aaf"
 - Run `npm install` to install all dependencies
 - Run `npm run start` to start up the front end
 - Go to localhost 3000 and you should see the app up and running there
 - The Dapp is also deployed using vercel and can be found here: https://nftcoveredcall.vercel.app/

 ### How to create, buy, and execute a call option
 - Click the "connect to metamask" button and connect to your wallet
 - Click on the create covered call button
 - Fill in the information and first approve the NFT, then after that is done, you can create a covered call
 - To buy the call option, click on the "buy option" button and enter the NFT Address and Option ID (displayed on the page), along with the required amount of ETH to buy the option (premium price)
 - In order to exercise the option, click on "exercise option" and input the NFT Address and Option ID along with the required amount of ETH to purchase the NFT (option strike)