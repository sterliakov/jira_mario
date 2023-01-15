import {Component} from 'react';
import styled from 'styled-components';

import {Images} from '../constants';
import BaseButton from './BaseButton';
import BaseScreen from './BaseScreen';

const Screen = styled(BaseScreen)`
    background-image: url('${Images['start-screen.png'].src}');
`;

const ScreenBtn = styled(BaseButton)`
    position: absolute !important;
    bottom: 300px;
`;
const StartBtn = styled(ScreenBtn)`
    background-color: #be2e7e !important;
    left: 700px;
`;
const PreferencesBtn = styled(ScreenBtn)`
    background-color: #4646d5 !important;
    right: 700px;
`;

export default class StartScreen extends Component {
    render() {
        return (
            <Screen>
                <PreferencesBtn
                    title="Preferences"
                    onClick={() => this.props.showPreferences()}
                    isLoading={!this.props.prefsLoaded}
                >
                    Settings
                </PreferencesBtn>
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
            </Screen>
        );
    }
}
