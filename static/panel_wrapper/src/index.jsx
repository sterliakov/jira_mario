import Avatar from '@atlaskit/avatar';
import Button from '@atlaskit/button';
import DynamicTable from '@atlaskit/dynamic-table';
import InlineMessage from '@atlaskit/inline-message';
import Spinner from '@atlaskit/spinner';
import {Modal, invoke} from '@forge/bridge';
import React, {Component} from 'react';
import ReactDOM from 'react-dom/client';
import styled from 'styled-components';

const NameHolder = styled.span`
    display: flex;
    align-items: center;
    padding-left: 8px;
`;

class LeaderBoard extends Component {
    head = {
        cells: [
            {content: 'Username', key: 'username', isSortable: true},
            {content: 'Score', key: 'score', isSortable: true},
            {content: 'Life count', key: 'lifecount', isSortable: true},
            {content: 'Current level', key: 'levelnum', isSortable: true},
        ],
    };

    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            isLoading: true,
        };
    }

    async componentDidMount() {
        const data = await invoke('getLeaderboard');
        this.setState({
            isLoading: false,
            rows: data.map((r, i) => ({
                key: `row-${i}-${r.user.displayName}`,
                cells: [
                    {
                        key: `user-${i}-${r.user.displayName}`,
                        content: (
                            <div style={{display: 'flex'}}>
                                <Avatar
                                    appearance="circle"
                                    src={r.user.avatarUrls['48x48']}
                                    size="medium"
                                    name={r.user.displayName}
                                />
                                <NameHolder>{r.user.displayName}</NameHolder>
                            </div>
                        ),
                    },
                    {
                        key: `score-${i}-${r.user.displayName}`,
                        content: r.game.totalScore,
                    },
                    {
                        key: `lifecount-${i}-${r.user.displayName}`,
                        content: r.game.lifeCount,
                    },
                    {
                        key: `levelnum-${i}-${r.user.displayName}`,
                        content: r.game.levelNum,
                    },
                ],
            })),
        });
    }
    render() {
        return (
            <DynamicTable
                head={this.head}
                rows={this.state.rows}
                rowsPerPage={10}
                defaultPage={1}
                loadingSpinnerSize="large"
                caption="Leaderboard"
                isRankable
                isFixedSize
                isLoading={this.state.isLoading}
                sortKey="score"
            />
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
            canPlay: null,
            loaded: false,
        };
    }

    openGame() {
        this.setState({modalOpen: true});
        new Modal({
            resource: 'game',
            onClose: async (payload) =>
                this.setState({
                    modalOpen: false,
                    canPlay:
                        payload && payload.levelFinished
                            ? 'ALREADY_PLAYED'
                            : 'OK',
                    loaded: true,
                }),
            size: 'max',
        }).open();
    }

    async componentDidMount() {
        this.setState({
            canPlay: await invoke('canPlay'),
            loaded: true,
        });
    }

    render() {
        if (this.state.loaded)
            return (
                <>
                    {this.renderAction()}
                    <LeaderBoard key={Math.random()} />
                </>
            );
        else return <Spinner size="large" />;
    }

    renderAction() {
        switch (this.state.canPlay) {
            case 'OK':
                return (
                    <Button
                        appearance="primary"
                        onClick={this.openGame.bind(this)}
                    >
                        Play Jirio!
                    </Button>
                );
            case 'ALREADY_PLAYED':
                return (
                    <InlineMessage title="You already played">
                        <p>You have already played this level.</p>
                    </InlineMessage>
                );
            case 'NOT_OWNER':
                return (
                    <InlineMessage title="Not your issue">
                        <p>This issue is not assigned to you.</p>
                    </InlineMessage>
                );
            case 'NOT_COMPLETED':
                return (
                    <InlineMessage title="Issue not completed">
                        <p>This issue is not completed yet.</p>
                    </InlineMessage>
                );
            default:
                return null;
        }
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
