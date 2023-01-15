import {Component} from 'react';
import Switch from 'react-switch';
import styled from 'styled-components';

import {Images} from '../constants';
import {saveGameState, saveMario} from '../helpers';
import BaseButton from './BaseButton';
import BaseScreen from './BaseScreen';

const Screen = styled(BaseScreen)`
    background-image: url('${Images['start-screen.png'].src}');
`;

const SwitchLabel = styled.label`
    display: flex;
    align-items: stretch;
    position: absolute;
`;
const SwitchLabelSpan = styled.span`
    padding: 9px 6px 0 6px;
`;
const SwitchLabelName = styled.span`
    padding: 9px 6px 0 16px;
`;

const BackBtn = styled(BaseButton)`
    background-color: #4646d5 !important;
    margin: 10px;
    position: absolute !important;
    bottom: 220px;
    left: 560px;
`;

export default class PreferencesScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sexSwitch: props.mario.sex === 'f',
            soundSwitch: props.game.soundEnabled,
            isLoading: false,
        };
    }

    render() {
        return (
            <Screen>
                <SwitchLabel style={{left: 488, bottom: 350}}>
                    <SwitchLabelName style={{paddingRight: 16}}>
                        Mario gender:
                    </SwitchLabelName>
                    <SwitchLabelSpan>m</SwitchLabelSpan>
                    <Switch
                        onChange={(sexSwitch) => this.setState({sexSwitch})}
                        checked={this.state.sexSwitch}
                        onColor="#BE2E7E"
                        offColor="#BE2E7E"
                        checkedIcon={false}
                        uncheckedIcon={false}
                    />
                    <SwitchLabelSpan>f</SwitchLabelSpan>
                </SwitchLabel>

                <SwitchLabel style={{left: 560, bottom: 310}}>
                    <SwitchLabelName>Sound:</SwitchLabelName>
                    <SwitchLabelSpan>Off</SwitchLabelSpan>
                    <Switch
                        onChange={(soundSwitch) => this.setState({soundSwitch})}
                        checked={this.state.soundSwitch}
                        onColor="#BE2E7E"
                        offColor="#7D7B71"
                    />
                    <SwitchLabelSpan>On</SwitchLabelSpan>
                </SwitchLabel>

                <BackBtn
                    onClick={this.savePreferences.bind(this)}
                    isLoading={this.state.isLoading}
                >
                    Save
                </BackBtn>
            </Screen>
        );
    }

    async savePreferences() {
        this.setState({isLoading: true});

        const m = {sex: this.state.sexSwitch ? 'f' : 'm'};
        const g = {soundEnabled: !!this.state.soundSwitch};
        this.props.storeMario(m);
        this.props.storeGame(g);
        await Promise.all([saveMario(m), saveGameState(g)]);

        this.setState({isLoading: false});
        this.props.showStart();
    }
}
