import React from 'react';
import OptionChain from './OptionChain'; // the create option form (sell covered call)
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return(
            <div>
                <OptionChain/>
            </div>
        )
    }
}

export default App;