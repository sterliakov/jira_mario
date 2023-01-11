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
    background-color: #080 !important;
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
                        onChange={(sexSwitch) => this.updateState({sexSwitch})}
                        checked={this.state.sexSwitch}
                        onColor="#080"
                        offColor="#080"
                        checkedIcon={false}
                        uncheckedIcon={false}
                    />
                    <SwitchLabelSpan>f</SwitchLabelSpan>
                </SwitchLabel>

                <SwitchLabel style={{left: 560, bottom: 310}}>
                    <SwitchLabelName>Sound:</SwitchLabelName>
                    <SwitchLabelSpan>Off</SwitchLabelSpan>
                    <Switch
                        onChange={(soundSwitch) =>
                            this.updateState({soundSwitch})
                        }
                        checked={this.state.soundSwitch}
                    />
                    <SwitchLabelSpan>On</SwitchLabelSpan>
                </SwitchLabel>

                <BackBtn onClick={() => this.props.showStart()}>
                    Back to menu
                </BackBtn>
            </Screen>
        );
    }

    updateState(newState) {
        // TODO: save only on BackBtn.onClick instead
        if (
            newState.sexSwitch != null &&
            newState.sexSwitch !== this.state.sexSwitch
        ) {
            const m = {
                sex: newState.sexSwitch ? 'f' : 'm',
            };
            saveMario(m);
            this.props.storeMario(m);
        }
        if (
            newState.soundSwitch != null &&
            newState.soundSwitch !== this.state.soundSwitch
        ) {
            const g = {
                soundEnabled: !!newState.soundSwitch,
            };
            saveGameState(g);
            this.props.storeGame(g);
        }
        this.setState(newState);
    }
}
