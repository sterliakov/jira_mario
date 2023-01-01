import React, {Component} from 'react';
import styled, {createGlobalStyle} from 'styled-components';

import BottomBtnWrapper from './components/BottomBtnWrapper';
import GameView from './components/GameView';
import StartScreen from './components/StartScreen';
import './static/css/reset.css';
import font from './static/fonts/SuperMario256.ttf';

const MainWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;
const Style = createGlobalStyle`
    @font-face {
        font-family: SuperMario256;
        src: url(${font});
    }
    body {
        font-family: SuperMario256;
    }
`;

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: 'start',
        };
    }

    render() {
        return (
            <>
                <Style />
                <MainWrapper>
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
                </MainWrapper>
            </>
        );
    }
}
