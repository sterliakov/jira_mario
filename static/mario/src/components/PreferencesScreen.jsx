import {Component} from 'react';
import Switch from 'react-switch';
import styled from 'styled-components';

import {Images} from '../constants';
import {saveGameState, saveMario} from '../helpers';

const Screen = styled.div`
    width: 1280px;
    height: 530px;
    margin: 0 auto;
    border: 1px solid black;
    background-image: url('${Images['start-screen.png'].src}');
    position: relative;
`;
const SwitchLabel = styled.label`
    display: flex;
    align-items: stretch;
`;
const SwitchLabelSpan = styled.span`
    padding: 9px 6px 0 6px;
`;
const SwitchLabelName = styled.span`
    padding: 9px 6px 0 16px;
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
                <SwitchLabel>
                    <SwitchLabelName>Mario gender:</SwitchLabelName>
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

                <SwitchLabel>
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
            </Screen>
        );
    }

    updateState(newState) {
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
