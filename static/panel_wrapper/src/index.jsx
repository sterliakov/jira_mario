import {Modal} from '@forge/bridge';
import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const runGame = () => {
        setModalIsOpen(true);
        new Modal({
            resource: 'game',
            onClose: () => setModalIsOpen(false),
            size: 'max',
        }).open();
    };
    return <button onClick={runGame}>Play Jirio!</button>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
