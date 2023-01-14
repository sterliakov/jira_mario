import {Component} from 'react';
import styled from 'styled-components';

import {Images} from '../constants';

const Wrapper = styled.div`
    padding-left: 40px;
    width: 1240px;
    margin: 0 auto;
    height: 50px;
    border: 1px solid black;
    border-bottom: none;
    line-height: 50px;
    font-size: 20px;
    background-color: #add1f3;
    color: #ffffff;
`;

const CoinScore = styled.div`
    background: url('${Images['coin.png'].src}') left center no-repeat;
    width: 150px;
    float: left;
    padding-left: 40px;
`;

const LifeCount = styled.div`
    width: 150px;
    float: left;
    padding-left: ${(props) => (props.sex === 'f' ? 72 : 42)}px;
    &:before {
        background: url('${Images['mario-head.png'].src}') -${(props) =>
                props.sex === 'f' ? 32 : 0}px 4px no-repeat;
        position: absolute;
        content: '';
        width: ${(props) => (props.sex === 'f' ? 60 : 30)}px;
        height: 42px;
    }
`;
const LifeCountSpan = styled.span`
    padding-left: ${(props) => (props.sex === 'f' ? 70 : 40)}px;
`;

const LevelNum = styled.div`
    width: 150px;
    float: left;
`;
const TotalScore = styled.div`
    float: left;
`;

export default class Score extends Component {
    render() {
        return (
            <Wrapper>
                <CoinScore>Coins: {this.props.coinScore}</CoinScore>
                <TotalScore>Score: {this.props.totalScore}</TotalScore>
                <LifeCount sex={this.props.marioSex}>
                    <LifeCountSpan sex={this.props.marioSex}>
                        {this.props.lifeCount}
                    </LifeCountSpan>
                </LifeCount>
                <LevelNum>Level: {this.props.levelNum}</LevelNum>
            </Wrapper>
        );
    }
}
