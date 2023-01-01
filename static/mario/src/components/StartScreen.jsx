import {Component} from 'react';

export default class StartScreen extends Component {
    render() {
        return (
            <div className="start-screen">
                <button
                    class="start-btn"
                    onClick={() => this.props.showGame()}
                ></button>
            </div>
        );
    }
}
