import {view} from '@forge/bridge';
import React, {Component} from 'react';
import styled, {createGlobalStyle} from 'styled-components';

import BottomBtnWrapper from './components/BottomBtnWrapper';
import GameView from './components/GameView';
import PreferencesScreen from './components/PreferencesScreen';
import StartScreen from './components/StartScreen';
import {getCanPlay, getGameState, getLevel, getMario} from './helpers';
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
            gameLoaded: false,
            prefsLoaded: false,
            canPlay: false,
            game: null,
            mario: null,
        };
    }

    async componentDidMount() {
        await this.fetchAll();
    }

    async fetchAll() {
        (async () => this.setState({canPlay: await getCanPlay()}))();
        (async () => {
            const [game, mario] = await Promise.all([
                getGameState(),
                getMario(),
            ]);
            this.setState(
                {
                    game,
                    mario,
                    prefsLoaded: true,
                },
                async () => {
                    await getLevel(game.levelNum);
                    this.setState({gameLoaded: true});
                },
            );
        })();
    }

    destroyModal(levelFinished = false) {
        this.props.root.unmount();
        view.close({levelFinished});
    }

    async showStart() {
        this.setState({
            view: 'start',
            gameLoaded: false,
            prefsLoaded: false,
        });
        await this.fetchAll();
    }

    render() {
        return (
            <>
                <Style />
                <MainWrapper>
                    {this.state.view === 'start' && (
                        <StartScreen
                            canPlay={this.state.canPlay}
                            gameLoaded={this.state.gameLoaded}
                            prefsLoaded={this.state.prefsLoaded}
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
                                game={this.state.game}
                                mario={this.state.mario}
                            />
                            <BottomBtnWrapper
                                showStart={this.showStart.bind(this)}
                            />
                        </>
                    )}
                    {this.state.view === 'preferences' && (
                        <>
                            <PreferencesScreen
                                game={this.state.game}
                                mario={this.state.mario}
                                showStart={this.showStart.bind(this)}
                                storeGame={(g) =>
                                    this.setState({
                                        game: {...this.state.game, ...g},
                                    })
                                }
                                storeMario={(m) =>
                                    this.setState({
                                        mario: {...this.state.mario, ...m},
                                    })
                                }
                            />
                            <BottomBtnWrapper
                                showStart={this.showStart.bind(this)}
                            />
                        </>
                    )}
                </MainWrapper>
            </>
        );
    }
}
