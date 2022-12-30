import {Component} from 'react';

export default class Score extends Component {
    render() {
        return (
            <div className="score-wrapper">
                <div className="coin-score">Coins: {this.props.coinScore}</div>
                <div className="total-score">
                    Score: {this.props.totalScore}
                </div>
                <div className="life-count">x: {this.props.lifeCount}</div>
                <div className="level-num">Level: {this.props.levelNum}</div>
            </div>
        );
    }
}
