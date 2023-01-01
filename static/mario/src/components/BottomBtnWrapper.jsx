import {Component} from 'react';
import styled from 'styled-components';

import {Images} from '../constants';
import BaseButton from './BaseButton';

const Wrapper = styled.div`
    width: 1280px;
    height: 100px;
    margin: 0 auto;
`;

const BackBtn = styled(BaseButton)`
    background: url('${Images['back-btn.png'].src}');
    margin: 10px;
`;

export default class BottomBtnWrapper extends Component {
    render() {
        return (
            <Wrapper>
                <BackBtn onClick={() => this.props.showStart()}></BackBtn>
            </Wrapper>
        );
    }
}
