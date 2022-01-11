import React from 'react';
import OptionChain from './OptionChain';
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