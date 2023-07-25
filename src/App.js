import React, { useState, useEffect } from 'react';
import './App.css';

const ROWS = 4;
const COLS = 4;
const MOLE_APPEAR_DURATION = 400; // Milliseconds
const WHACKED_DURATION = 200; // Milliseconds
const COMBO_TIMEOUT = 3000; // Milliseconds

const createEmptyGrid = () => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
};

const App = () => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboRequirement, setComboRequirement] = useState(10);
  const [popupMessage, setPopupMessage] = useState('');
  const [comboTimer, setComboTimer] = useState(null);
  const [whackedTimeout, setWhackedTimeout] = useState(null);
  const [popupTimeout, setPopupTimeout] = useState(null);

  const resetMultiplier = () => {
    setComboMultiplier(1);
  };

  const resetComboRequirement = () => {
    setComboRequirement(10);
  };

  const handleTileClick = (row, col) => {
    if (grid[row][col] === true) {
      if (grid[row][col] !== 'whacked') {
        setGrid((prevGrid) => {
          const newGrid = [...prevGrid];
          newGrid[row][col] = 'whacked';
          return newGrid;
        });
  
        setScore((prevScore) => prevScore + comboMultiplier);
        setCombo((prevCombo) => {
          if (prevCombo >= comboRequirement) {
            setComboMultiplier((prevMultiplier) => prevMultiplier + 1);
            setComboRequirement((prevRequirement) => prevRequirement + 5);
          }
          return prevCombo + 1;
        });
  
        if (comboTimer) clearTimeout(comboTimer);
        setComboTimer(setTimeout(() => setCombo(0), COMBO_TIMEOUT));
  
        if (whackedTimeout) clearTimeout(whackedTimeout);
        setWhackedTimeout(
          setTimeout(() => {
            setGrid((prevGrid) => {
              const newGrid = [...prevGrid];
              newGrid[row][col] = null;
              return newGrid;
            });
          }, WHACKED_DURATION)
        );
  
        const pointsEarned = comboMultiplier > 1 ? `+${comboMultiplier} points` : '+1 point';
        setPopupMessage(pointsEarned);
  
        if (popupTimeout) clearTimeout(popupTimeout);
        setPopupTimeout(
          setTimeout(() => {
            setPopupMessage('');
          }, 1000)
        );
      }
    } else {
      // Combo was reset, so reset the multiplier and combo requirement
      setCombo(0)
      resetMultiplier();
      resetComboRequirement();
  
      // Clear the existing popup message, if any
      setPopupMessage('');
    }
  };
  

  useEffect(() => {
    const placeMole = () => {
      const randomRow = Math.floor(Math.random() * ROWS);
      const randomCol = Math.floor(Math.random() * COLS);

      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        if (newGrid[randomRow][randomCol] !== true) {
          newGrid[randomRow][randomCol] = true;
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
              className={`tile ${col === 'whacked' ? 'mole-whacked' : col ? 'mole' : ''}`}
              onClick={() => handleTileClick(rowIndex, colIndex)}
            >
              {col === 'whacked' ? 'POW!' : ''}
            </div>
          ))
        )}
      </div>
      <div className="info-container">
        <div className="score">Score: {score}</div>
        <div className="combo-container"> Combo: {combo} </div>
        <div className="multiplier">Multiplier: {comboMultiplier}x</div>
        <div className="combo-requirement">Next Requirement: {comboRequirement}</div>
      </div>
      <div className={`popup-message ${popupMessage ? 'show-popup' : ''}`}>{popupMessage}</div>
    </div>
  );
};

export default App;
