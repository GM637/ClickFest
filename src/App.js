import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ResourceBar from './ResourceBar';

const ROWS = 4;
const COLS = 4;
const MOLE_APPEAR_DURATION = 200; // Milliseconds
const WHACKED_DURATION = 200; // Milliseconds
const COMBO_TIMEOUT = 1000; // Milliseconds

const whackSoundurl = 'https://www.myinstants.com/media/sounds/hitmarker_2.mp3';
const missSoundurl = 'https://www.myinstants.com/media/sounds/bamboo-hit-sound-effect.mp3';
const multiplierSoundurl = 'https://www.myinstants.com/media/sounds/critical-hit-sounds-effect.mp3';
const partyurl = 'https://www.myinstants.com/media/sounds/instant-dance-party-song.mp3';

const missSound = new Audio(missSoundurl);
const multiplierSound = new Audio(multiplierSoundurl);
const partysound = new Audio(partyurl);

const createEmptyGrid = () => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
};

const generateRandomMole = () => {
  const randomMole = Math.random() < 0.6 ? 1 : Math.random() < 0.6 ? 2 : Math.random() < 0.6 ? 3 : 4; // 60% chance of 1 point mole, 20% chance of 5 points mole, 20% chance of -3 points mole
  return randomMole;
};

const App = () => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboRequirement, setComboRequirement] = useState(10);
  const [popupMessage, setPopupMessage] = useState('');
  const [comboTimer, setComboTimer] = useState(COMBO_TIMEOUT);
  const [popupTimeout, setPopupTimeout] = useState(null);

  const whackedTimeoutRef = useRef(null);
  const whackedTilesRef = useRef([]);

  const resetMultiplier = () => {
    setComboMultiplier(1);
  };

  const resetComboRequirement = () => {
    setComboRequirement(10);
  };

  const playRandomPitch = (audioSource, minRate, maxRate) => {
    const audio = new Audio(audioSource);

    const randomRate = Math.random() * (maxRate - minRate) + minRate;
    audio.playbackRate = randomRate;

    audio.play();
  };

  const handleTileClick = (row, col) => {
    partysound.play();
    partysound.loop = true;

    if (partysound.duration - partysound.currentTime < 4) {
      partysound.volume = Math.max(0, partysound.volume - 0.04);
    } else {
      partysound.volume = 0.25;
    }

    partysound.volume = Math.max(0, partysound.volume);

    const tileType = grid[row][col];

    if (tileType > 0) {
      if (tileType !== 'whacked') {
        setGrid((prevGrid) => {
          const newGrid = [...prevGrid];
          if (tileType === 4) {
            // For type 4, decrement the value, but don't go below 0
            newGrid[row][col] = Math.max(0, tileType - 1);
          } else {
            newGrid[row][col] = 'whacked';
          }
          return newGrid;
        });

        const pointsEarned = tileType === 4 ? 1 : tileType; // Type 4 mole (takes multiple clicks) earns 1 point, other types earn their respective points
        setScore((prevScore) => prevScore + ( pointsEarned * comboMultiplier));
        setCombo((prevCombo) => {
          if (prevCombo >= comboMultiplier * 3) {
            setComboMultiplier((prevMultiplier) => prevMultiplier * 2);
            multiplierSound.play();
          }
          return prevCombo + ( pointsEarned * comboMultiplier);
        });

        playRandomPitch(whackSoundurl, 0.8, 1.2);

        if (comboTimer === null) {
          setCombo(1);
          setComboTimer(COMBO_TIMEOUT);
        } else {
          setComboRequirement(comboMultiplier * 3);
          setComboTimer(Math.round(COMBO_TIMEOUT - (comboMultiplier - 1) / 4 * 50));
        }

        if (comboTimer <= 0) {
          setCombo(0);
          resetMultiplier();
          resetComboRequirement();
          setComboTimer(COMBO_TIMEOUT);
        }

        if (whackedTimeoutRef.current) clearTimeout(whackedTimeoutRef.current);
        whackedTimeoutRef.current = setTimeout(() => {
          setGrid((prevGrid) => {
            const newGrid = [...prevGrid];
            newGrid[row][col] = 0; // Reset the tile back to the default state (null)
            return newGrid;
          });
          whackedTilesRef.current = whackedTilesRef.current.filter(
            (tile) => !(tile.row === row && tile.col === col)
          );
        }, WHACKED_DURATION);

        setPopupMessage('');
        const pointsMessage = pointsEarned > 0 ? `+${pointsEarned * comboMultiplier} points` : `${pointsEarned * comboMultiplier} points`;
        setPopupMessage(pointsMessage);

        if (popupTimeout) clearTimeout(popupTimeout);
        setPopupTimeout(
          setTimeout(() => {
            setPopupMessage('');
          }, 500)
        );
      }
    } else {
      setPopupMessage('MISSED');
      missSound.play();

      if (whackedTimeoutRef.current) clearTimeout(whackedTimeoutRef.current);
      whackedTimeoutRef.current = setTimeout(() => {
        setGrid((prevGrid) => {
          const newGrid = [...prevGrid];
          newGrid[row][col] = 0;
          return newGrid;
        });
        whackedTilesRef.current = whackedTilesRef.current.filter(
          (tile) => !(tile.row === row && tile.col === col)
        );
      }, WHACKED_DURATION);

      setCombo(0);
      resetMultiplier();
      resetComboRequirement();

      if (comboTimer <= 0) {
        setComboTimer(COMBO_TIMEOUT);
      }
    }

    if (grid[row][col] === 'whacked') {
      whackedTilesRef.current.push({ row, col });
      setTimeout(() => {
        if (whackedTilesRef.current.some((tile) => tile.row === row && tile.col === col)) {
          setGrid((prevGrid) => {
            const newGrid = [...prevGrid];
            newGrid[row][col] = 0;
            return newGrid;
          });
          whackedTilesRef.current = whackedTilesRef.current.filter(
            (tile) => !(tile.row === row && tile.col === col)
          );
        }
      }, WHACKED_DURATION);
    }
  };

  useEffect(() => {
    const placeMole = () => {
      const randomRow = Math.floor(Math.random() * ROWS);
      const randomCol = Math.floor(Math.random() * COLS);

      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        if (newGrid[randomRow][randomCol] === 0) {
          newGrid[randomRow][randomCol] = generateRandomMole();
        }
        return newGrid;
      });
    };

    placeMole();

    const moleInterval = setInterval(placeMole, MOLE_APPEAR_DURATION);

    return () => {
      clearInterval(moleInterval);
    };
  }, []);

  return (
    <div className="game-container">
      <div className="grid">
        {grid.map((row, rowIndex) =>
          row.map((col, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`tile ${col === 'whacked' ? 'mole-whacked' : col ? `mole-${col}` : ''}`}
              onClick={() => handleTileClick(rowIndex, colIndex)}
            >
              {col === 'whacked' ? 'POW!' : ''}
            </div>
          ))
        )}
      </div>
      <div className="info-container">
        <div className="score">Score: {score}</div>
        <ResourceBar
          value={combo}
          maxValue={comboRequirement}
          color="#6dbb1a"
          prefixText="Combo Progress:"
          suffixText={` (x${comboMultiplier})`}
        />
        <ResourceBar
          value={Math.round(comboTimer)}
          maxValue={Math.round(COMBO_TIMEOUT - (comboMultiplier - 1) / 4 * 50)}
          color="#1a8abd"
          prefixText="Time Left:"
          suffixText=" ms"
          animationSpeed={0.2}
          showText
        />
      </div>
      <div className={`popup-message ${popupMessage ? 'show-popup' : ''}`}>{popupMessage}</div>
    </div>
  );
};

export default App;
