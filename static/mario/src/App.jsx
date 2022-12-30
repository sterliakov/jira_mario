import {useEffect} from 'react';

import MarioMaker from './MarioMaker';
import './static/css/reset.css';
import './static/css/style.css';

function Canvas(props) {
    useEffect(() => MarioMaker.getInstance().init());
    return <canvas className="game-screen"></canvas>;
}

export default function App() {
    return (
        <div className="main-wrapper">
            <Canvas />
        </div>
    );
}
