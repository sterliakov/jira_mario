import {Component} from 'react';
import styled from 'styled-components';

import {Images} from '../constants';
import BaseButton from './BaseButton';

const Screen = styled.div`
    width: 1280px;
    height: 530px;
    margin: 0 auto;
    border: 1px solid black;
    background-image: url('${Images['start-screen.png'].src}');
    position: relative;
`;

const ScreenBtn = styled(BaseButton)`
    position: absolute !important;
    bottom: 100px;
`;
const StartBtn = styled(ScreenBtn)`
    background-color: #e63f2b !important;
    left: 528px;
`;
const PreferencesBtn = styled(ScreenBtn)`
    background-color: #0a0aee !important;
    left: 250px;
`;

export default class StartScreen extends Component {
    render() {
        return (
            <Screen>
                <StartBtn
                    title={
                        this.props.canPlay || !this.props.gameLoaded
                            ? 'Start'
                            : 'Cannot play'
                    }
                    onClick={() => this.props.showGame()}
                    isDisabled={!this.props.canPlay}
                    isLoading={!this.props.gameLoaded}
                >
                    Start
                </StartBtn>
                <PreferencesBtn
                    title="Preferences"
                    onClick={() => this.props.showPreferences()}
                    isLoading={!this.props.prefsLoaded}
                >
                    Settings
                </PreferencesBtn>
            </Screen>
        );
    }
}
