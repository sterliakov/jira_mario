import React, {Component} from 'react';

import BottomBtnWrapper from './components/BottomBtnWrapper';
import GameView from './components/GameView';
import StartScreen from './components/StartScreen';
import './static/css/reset.css';
import './static/css/style.css';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: 'start',
        };
    }

    render() {
        return (
            <div className="main-wrapper">
                {this.state.view === 'start' && (
                    <StartScreen
                        showGame={() => this.setState({view: 'game'})}
                    />
                )}
                {this.state.view === 'game' && (
                    <>
                        <GameView Width="1280" Height="480" />
                        <BottomBtnWrapper
                            showStart={() => this.setState({view: 'start'})}
                        />
                    </>
                )}
            </div>
        );
    }
}
