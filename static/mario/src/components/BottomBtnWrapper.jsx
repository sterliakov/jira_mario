import {Component} from 'react';

export default class BottomBtnWrapper extends Component {
    render() {
        return (
            <div className="btn-wrapper">
                <button
                    class="back-btn"
                    onClick={() => this.props.showStart()}
                ></button>
            </div>
        );
    }
}
