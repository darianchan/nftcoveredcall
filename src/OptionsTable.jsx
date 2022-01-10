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
                    <td>option id</td>
                    <td>nft address</td>
                    <td>nft id</td>
                    <td>option strike</td>
                    <td>option premium</td>
                    <td>expiration time</td>
                    <td>buyer</td>
                    <td>seller</td>
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