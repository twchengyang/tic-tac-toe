import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button
            className={"square " + props.highlight}
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return <Square
            key={i}
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
            highlight={this.props.highlights.includes(i) ? 'highlight' : ''}
        />;
    }

    render() {
        const rows = [];
        for (let i = 0; i < 3; i++) {
            const cols = [];
            for (let j = 0; j < 3; j++) {
                cols.push(this.renderSquare(i * 3 + j))
            }
            rows.push(<div key={"row" + i} className="board-row">{cols}</div>)
        }
        return (<div>{rows}</div>);
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                position: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            selectedStep: null,
            order: "asc",
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (Game.calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{squares: squares, position: i}]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            selectedStep: null,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
            selectedStep: step,
        });
    }

    static stepPos(step) {
        const col = step.position % 3 + 1;
        const row = Math.floor(step.position / 3 + 1);
        return {
            col: col,
            row: row,
        }
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = Game.calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const pos = Game.stepPos(step);
            const description = move ? 'go to move #' + move + ' (' + pos.col + ',' + pos.row + ')' : 'go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}
                            className={this.state.selectedStep === move ? 'selected' : ''}>{description}</button>
                </li>
            )
        });

        if (this.state.order === "asc") {
            moves.reverse();
        }

        let status;
        if (winner) {
            status = 'Winner: ' + winner.player;
        } else if (this.state.stepNumber === 9) {
            status = 'Draw!'
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board squares={current.squares} highlights={winner ? winner.highlights : []} onClick={(i) => {
                        this.handleClick(i)
                    }}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ToggleButton order={this.state.order} onClick={() => {
                        this.switchToggle()
                    }}/>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }

    switchToggle() {
        this.setState({
            order: (this.state.order === "asc" ? "desc" : "asc"),
        });
    }

    static calculateWinner(squares) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return {player: squares[a], highlights: lines[i]};
            }
        }
        return null;
    }
}

class ToggleButton extends React.Component {
    render() {
        const order = this.props.order;
        const title = order === "asc" ? "DESC" : "ASC";
        return <button className="toggle" onClick={() => this.props.onClick()}>{title}</button>
    }
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

