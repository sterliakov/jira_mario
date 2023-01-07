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

const StartBtn = styled(BaseButton)`
    background-image: url('${Images['start-btn.png'].src}');
    position: absolute;
    bottom: 100px;
    left: 530px;
`;
// FIXME: need style
const PreferencesBtn = styled(BaseButton)`
    background-image: url('${Images['start-btn.png'].src}');
    position: absolute;
    bottom: 100px;
    left: 230px;
`;

export default class StartScreen extends Component {
    render() {
        return (
            <Screen>
                {this.props.canPlay && (
                    <StartBtn
                        title="Start"
                        onClick={() => this.props.showGame()}
                    ></StartBtn>
                )}
                <PreferencesBtn
                    title="Preferences"
                    onClick={() => this.props.showPreferences()}
                ></PreferencesBtn>
            </Screen>
        );
    }
}
