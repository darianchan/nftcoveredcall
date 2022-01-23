import React from 'react';

class OptionsTable extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { currentOptions } = this.props;

        return(
        <div id="tableWrapper">
            <table id="optionsTable">
            <thead>
                <tr id="optionsTableHeader">
                    <td>Option ID</td>
                    <td>NFT Address</td>
                    <td>NFT ID</td>
                    <td>Option Strike</td>
                    <td>Option Premium</td>
                    <td>Expiration Time</td>
                    <td>Buyer</td>
                    <td>Seller</td>
                </tr>
            </thead>
            <tbody>
                {currentOptions.map((option) => {
                    return (
                    <tr id="optionsTableRow" key={option.optionID}>
                        <td>{option.optionID}</td>
                        <td>{option.nftAddress}</td>
                        <td>{option.nftID}</td>
                        <td>{option.strikePrice}</td>
                        <td>{option.premiumPrice}</td>
                        <td>{option.expirationTime}</td>
                        <td>{option.buyerAddress}</td>
                        <td>{option.sellerAddress}</td>
                    </tr>
                    )
                })}
            </tbody>
            </table>
        </div>
        )
    }
}

export default OptionsTable