import {view} from '@forge/bridge';
import React, {Component} from 'react';
import styled, {createGlobalStyle} from 'styled-components';

import BottomBtnWrapper from './components/BottomBtnWrapper';
import GameView from './components/GameView';
import PreferencesScreen from './components/PreferencesScreen';
import StartScreen from './components/StartScreen';
import {getCanPlay} from './helpers';
import './static/css/reset.css';
import font from './static/fonts/SuperMario256.ttf';

const MainWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
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

    async componentDidMount() {
        this.setState({canPlay: await getCanPlay()});
    }

    destroyModal(levelFinished = false) {
        this.props.root.unmount();
        view.close({levelFinished});
    }

    render() {
        return (
            <>
                <Style />
                <MainWrapper>
                    {this.state.view === 'start' && (
                        <StartScreen
                            canPlay={this.state.canPlay}
                            showGame={() => this.setState({view: 'game'})}
                            showPreferences={() =>
                                this.setState({view: 'preferences'})
                            }
                        />
                    )}
                    {this.state.view === 'game' && this.state.canPlay && (
                        <>
                            <GameView
                                Width="1280"
                                Height="480"
                                quitAction={this.destroyModal.bind(this)}
                            />
                            <BottomBtnWrapper
                                showStart={() => this.setState({view: 'start'})}
                            />
                        </>
                    )}
                    {this.state.view === 'preferences' && (
                        <>
                            <PreferencesScreen />
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
