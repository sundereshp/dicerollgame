import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import styled, { keyframes, css } from 'styled-components';

// Keyframe animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const DiceContainer = styled.div`
  font-size: 120px;
  color: #ff4444;
  text-align: center;
  animation: ${props => props.$isAnimating ? css`${spin} 0.1s linear infinite` : 'none'};
  text-shadow: 0 0 20px rgba(255, 68, 68, 0.5);
  margin: 40px 0;
  transition: transform 0.3s ease-out;
`;

const GameButton = styled.button`
  background: #4CAF50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #45a049;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
  
  &.selected {
    background: #ff9800;
    transform: scale(1.1);
  }
  
  &.restart-button {
    background: #f44336;
    
    &:hover {
      background: #d32f2f;
    }
  }
`;

// Simplified Dice component that works without 3D libraries
const Dice = memo(({ isRolling, onResult }) => {
    const [currentValue, setCurrentValue] = useState(1);
    const animationRef = useRef(null);

    // Simulate dice roll animation
    useEffect(() => {
        if (isRolling) {
            let animationCount = 0;
            const maxAnimations = 15; // Fixed number of animation frames

            const animate = () => {
                animationCount++;
                setCurrentValue(Math.floor(Math.random() * 6) + 1);

                if (animationCount < maxAnimations) {
                    animationRef.current = setTimeout(animate, 80);
                } else {
                    // Final result
                    const finalResult = Math.floor(Math.random() * 6) + 1;
                    setCurrentValue(finalResult);
                    
                    // Call onResult with the final value
                    onResult(finalResult);
                }
            };

            animate();
        }

        return () => {
            if (animationRef.current) {
                clearTimeout(animationRef.current);
            }
        };
    }, [isRolling, onResult]);

    const getDiceSymbol = (value) => {
        const symbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return symbols[value - 1];
    };

    return (
        <DiceContainer $isAnimating={isRolling}>
            {getDiceSymbol(currentValue)}
        </DiceContainer>
    );
});

export default function DiceGame() {
    const [score, setScore] = useState(100);
    const [selectedNumber, setSelectedNumber] = useState(1);
    const [message, setMessage] = useState('Select a number and roll the dice!');
    const [highScore, setHighScore] = useState(100);
    const [isRolling, setIsRolling] = useState(false);

    const handleResult = useCallback((result) => {
        // Calculate new score
        const newScore = result === selectedNumber
            ? score + (result * 10)
            : Math.max(0, score - result);

        setScore(newScore);

        // Update high score if needed
        setHighScore(prevHighScore => Math.max(prevHighScore, newScore));

        // Set appropriate message
        setMessage(result === selectedNumber
            ? `🎉 Correct! The dice shows ${result}. +${result * 10} points!`
            : `❌ Wrong! The dice shows ${result} (You selected ${selectedNumber}). -${result} points!`
        );

        // Reset rolling state after a small delay to show the final result
        setTimeout(() => {
            setIsRolling(false);
        }, 500);
    }, [selectedNumber, score]);

    const handleRoll = useCallback(() => {
        if (isRolling) return; // Prevent multiple rolls
        
        setIsRolling(true);
        setMessage('🎲 Rolling...');
    }, [isRolling]);

    const handleRestart = () => {
        setScore(100);
        setSelectedNumber(1);
        setMessage('Game restarted! Select a number and roll the dice!');
        setHighScore(100);
        setIsRolling(false);
    };

    const handleNumberSelect = (num) => {
        if (!isRolling) { // Only allow selection when not rolling
            setSelectedNumber(num);
            setMessage(`Selected ${num}. Ready to roll!`);
        }
    };

    return (
        <div style={{
            height: '100vh',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            color: 'white',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '20px' }}>🎲 Dice Game</h1>

                {/* Score and Message */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Score: {score}</h2>
                    <p style={{ margin: '0 0 10px 0', color: '#ffc107' }}>High Score: {highScore}</p>
                    <p style={{
                        color: message.includes('🎉') ? '#28a745' : message.includes('❌') ? '#dc3545' : '#17a2b8',
                        minHeight: '24px',
                        fontSize: '14px',
                        margin: '0',
                        fontWeight: 'bold'
                    }}>
                        {message}
                    </p>
                </div>

                {/* The Dice */}
                <Dice
                    isRolling={isRolling}
                    onResult={handleResult}
                />

                {/* Number Selection */}
                <div style={{ marginBottom: '2rem' }}>
                    <p style={{ marginBottom: '0.5rem', fontSize: '16px', fontWeight: 'bold' }}>
                        Select your number:
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                            <GameButton
                                key={num}
                                onClick={() => handleNumberSelect(num)}
                                disabled={isRolling}
                                className={selectedNumber === num ? 'selected' : ''}
                                style={{ minWidth: '50px', fontSize: '18px' }}
                            >
                                {num}
                            </GameButton>
                        ))}
                    </div>
                </div>

                {/* Game Controls */}
                <div style={{ marginBottom: '2rem' }}>
                    <GameButton
                        onClick={handleRoll}
                        disabled={isRolling}
                        className="roll-button"
                        style={{ 
                            margin: '0 8px', 
                            fontSize: '18px',
                            padding: '12px 24px',
                            background: '#28a745'
                        }}
                    >
                        {isRolling ? '🎲 Rolling...' : '🎲 Roll Dice'}
                    </GameButton>

                    <GameButton
                        onClick={handleRestart}
                        className="restart-button"
                        style={{ margin: '0 8px', fontSize: '16px' }}
                        disabled={isRolling}
                    >
                        🔄 Restart
                    </GameButton>
                </div>

                {/* Game Info */}
                <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '2rem' }}>
                    <p style={{ margin: '5px 0' }}>
                        ✅ Correct guess: +{selectedNumber * 10} points
                    </p>
                    <p style={{ margin: '5px 0' }}>
                        ❌ Wrong guess: -{selectedNumber} points (minimum score: 0)
                    </p>
                </div>

                {/* Game Rules */}
                <div style={{
                    fontSize: '12px',
                    color: '#999',
                    maxWidth: '400px',
                    margin: '0 auto',
                    textAlign: 'left',
                    padding: '15px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>📋 How to Play:</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.4' }}>
                        <li>Select a number from 1 to 6</li>
                        <li>Click "Roll Dice" to roll once</li>
                        <li>If you guess correctly, earn points equal to the number × 10</li>
                        <li>If you guess wrong, lose points equal to the dice result</li>
                        <li>Your score cannot go below 0</li>
                        <li>Try to achieve the highest score possible!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}