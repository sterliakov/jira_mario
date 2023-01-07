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

export default class StartScreen extends Component {
    render() {
        // FIXME: don't show btn if !canPlay
        return (
            <Screen>
                <StartBtn onClick={() => this.props.showGame()}></StartBtn>
            </Screen>
        );
    }
}
