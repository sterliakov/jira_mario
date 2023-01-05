import {Modal, invoke} from '@forge/bridge';
import React, {Component} from 'react';
import ReactDOM from 'react-dom/client';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
            canPlay: false,
        };
    }

    openGame() {
        this.setState({modalOpen: true});
        new Modal({
            resource: 'game',
            onClose: () => this.setState({modalOpen: false}),
            size: 'max',
        }).open();
    }

    async componentDidMount() {
        this.setState({
            canPlay: await invoke('canPlay'),
        });
    }

    render() {
        // TODO: need styling here
        if (this.state.canPlay)
            return (
                <button onClick={this.openGame.bind(this)}>Play Jirio!</button>
            );
        else return <p>Cannot play:(</p>;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
