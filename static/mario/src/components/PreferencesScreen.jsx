import {Component} from 'react';
import Switch from 'react-switch';
import styled from 'styled-components';

import {Images} from '../constants';
import {getGameState, getMario, saveGameState, saveMario} from '../helpers';

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
        this.state = {sexSwitch: false, soundSwitch: false};
    }

    async componentDidMount() {
        const [{sex}, {soundEnabled}] = await Promise.all([
            getMario(),
            getGameState(),
        ]);
        this.setState({
            sexSwitch: sex === 'f',
            soundSwitch: soundEnabled,
        });
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
        )
            saveMario({
                sex: newState.sexSwitch ? 'f' : 'm',
            });
        if (
            newState.soundSwitch != null &&
            newState.soundSwitch !== this.state.soundSwitch
        )
            saveGameState({
                soundEnabled: !!newState.soundSwitch,
            });
        this.setState(newState);
    }
}
