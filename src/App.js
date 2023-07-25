import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ResourceBar from './ResourceBar';


const ROWS = 4;
const COLS = 4;
const MOLE_APPEAR_DURATION = 400; // Milliseconds
const WHACKED_DURATION = 200; // Milliseconds
const COMBO_TIMEOUT = 1000; // Milliseconds

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
          if (prevCombo >= comboMultiplier * 3) {
            setComboMultiplier((prevMultiplier) => prevMultiplier * 2);
          }
          return prevCombo + 1;
        });
  
        if (comboTimer === null) {
          setCombo(1);
          setComboTimer(COMBO_TIMEOUT); // Set the combo timer to 5000ms (5 seconds) if comboTimer is null
        } else {
          // Calculate the new combo timer duration based on the offset
          setComboRequirement(comboMultiplier * 3); // Increase combo requirement for the next multiplier
          setComboTimer(COMBO_TIMEOUT-(comboMultiplier-1)/2*50);
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
            newGrid[row][col] = null;
            return newGrid;
          });
          whackedTilesRef.current = whackedTilesRef.current.filter(
            (tile) => !(tile.row === row && tile.col === col)
          );
        }, WHACKED_DURATION);

        setPopupMessage('');
  
        const pointsEarned = comboMultiplier > 1 ? `+${comboMultiplier} points` : '+1 point';
        setPopupMessage(pointsEarned);
  
        if (popupTimeout) clearTimeout(popupTimeout);
        setPopupTimeout(
          setTimeout(() => {
            setPopupMessage('');
          }, 500)
        );
      }
    } else {
      // Combo was reset, so reset the multiplier and combo requirement
      setCombo(0);
      resetMultiplier();
      resetComboRequirement();
  
      // Clear the existing popup message, if any
      setPopupMessage('MISSED');

    // Clear the whackedTimeout if a new tile is clicked
    if (whackedTimeoutRef.current) clearTimeout(whackedTimeoutRef.current);

    // Clear the whackedTimeoutRef.current after a small delay to avoid race condition
    setTimeout(() => {
      whackedTimeoutRef.current = null;
    }, 100);
  }

  // Check if the tile was previously whacked but not clicked again
  if (grid[row][col] === 'whacked') {
    // Add the whacked tile to the ref to track it
    whackedTilesRef.current.push({ row, col });

    // Reset the tile to grey after a certain duration (e.g., 500ms)
    setTimeout(() => {
      if (whackedTilesRef.current.some((tile) => tile.row === row && tile.col === col)) {
        setGrid((prevGrid) => {
          const newGrid = [...prevGrid];
          newGrid[row][col] = null;
          return newGrid;
        });
        whackedTilesRef.current = whackedTilesRef.current.filter(
          (tile) => !(tile.row === row && tile.col === col)
        );
      }
    }, 500);
  }
};
  // Update the combo timer every millisecond
  useEffect(() => {
    if (comboTimer !== null) {
      const interval = setInterval(() => {
        setComboTimer((prevTimer) => Math.max(0, prevTimer - 1));
      }, 1);

      return () => clearInterval(interval);
    }
  }, [comboTimer]);

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
        <ResourceBar
          value={combo}
          maxValue={comboRequirement}
          color="#6dbb1a"
          prefixText="Combo Progress:" // Optional prefix text
          suffixText={` (x${comboMultiplier})`}
        />
        <ResourceBar
          value={comboTimer}
          maxValue={COMBO_TIMEOUT-(comboMultiplier-1)/2*50}
          color="#1a8abd"
          prefixText="Time Left:" // Optional prefix text
          suffixText=" s" // Optional suffix text
          animationSpeed={0.2} // Set the animation speed to 1.5 seconds
          showText // Display the text inside the bar
        />
      </div>
      <div className={`popup-message ${popupMessage ? 'show-popup' : ''}`}>{popupMessage}</div>
    </div>
  );
};

export default App;
