import React, {useEffect, useState} from 'react';
import './App.css';
import {StartGameResponseInterface} from "./types/StartGameResponseInterface";
import {GuessRequestInterface} from "./types/GuessRequestInterface";
import {GuessResponseInterface} from "./types/GuessResponseInterface";

function App() {
    const [score, setScore] = useState(Number(process.env.REACT_APP_MAX_SCORE));
    const [highscore, setHighscore] = useState(0);
    const [userInput, setUserInput] = useState('');

    const [data, setData] = useState<StartGameResponseInterface | undefined>(undefined);
    const [message, setMessage] = useState('Start guessing...');
    const [isGuessed, setIsGuessed] = useState(false);

    const fetchData = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/start_game`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result: StartGameResponseInterface = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching start game data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (isGuessed) {
            document.body.style.backgroundColor = '#60b347';

            if (score > highscore) {
                setHighscore(score);
            }
        }
    }, [isGuessed]);


    const fetchGuess = async (guess: number) => {
        try {
            const request: GuessRequestInterface = {
                guess: guess
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/guess`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result: GuessResponseInterface = await response.json();
            setMessage(result.message);
            setIsGuessed(result.isGuessed);
        } catch (error: any) {
            alert('Error fetching guess:\n' + error + `\nStatus: ${error.status}`);
            console.error('Error fetching guess:', error);
        }
    }

    const handleCheck = (e: any) => {
        e.preventDefault();

        let guess = userInput;
        if (!guess) {
            setMessage('⛔️ No number!')
        } else {
            if (score > 1) {
                fetchGuess(Number(guess));

                if (!isGuessed) {
                    let newScore = score - 1;
                    setScore(newScore);
                }
            } else {
                setMessage('💥 You lost the game!');
                setScore(0);
            }
        }
    }

    const handleNewGame = (e: any) => {
        e.preventDefault();

        fetchData();

        setScore(Number(process.env.REACT_APP_MAX_SCORE));
        setUserInput('');
        setMessage('Start guessing...');
        setIsGuessed(false);
        document.body.style.backgroundColor = '#222';
    }

    return (
        <>
            <header>
                <h1>Guess My Number!</h1>
                {data &&
                    <p className="between">(Between {data.min} and {data.max})</p>
                }
                <div className="number">?</div>
            </header>
            <main>
                <section className="left">
                    <input className="guess" type="number" value={userInput} max={data?.max} min={data?.min}
                           onChange={event => setUserInput(event.target.value)}/>

                    <div className="buttons">
                        <button className="btn check" onClick={handleCheck} disabled={isGuessed}>Check!</button>
                        <button className="btn again" onClick={handleNewGame}>New game!</button>
                    </div>
                </section>
                <section className="right">
                    <p className="message">{message}</p>
                    <p className="label-score">💯 Score: <span className="score">{score}</span></p>
                    <p className="label-highscore">
                        🥇 Highscore: <span className="highscore">{highscore}</span>
                    </p>
                </section>
            </main>
        </>
    );
}

export default App;
