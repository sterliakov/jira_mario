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

const LifeCount = styled(CoinScore)`
    background-image: url('${Images['mario-head.png'].src}');
    width: 150px;
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
                <LifeCount>x: {this.props.lifeCount}</LifeCount>
                <LevelNum>Level: {this.props.levelNum}</LevelNum>
            </Wrapper>
        );
    }
}
