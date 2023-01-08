import {Component} from 'react';
import styled from 'styled-components';

import BaseButton from './BaseButton';

const Wrapper = styled.div`
    width: 1280px;
    height: 100px;
    margin: 0 auto;
`;

const BackBtn = styled(BaseButton)`
    background-color: #e63f2b !important;
    margin: 10px;
`;

export default class BottomBtnWrapper extends Component {
    render() {
        return (
            <Wrapper>
                <BackBtn onClick={() => this.props.showStart()}>
                    Back to menu
                </BackBtn>
            </Wrapper>
        );
    }
}
