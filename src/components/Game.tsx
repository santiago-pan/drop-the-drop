import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useStore } from '../store/store';
import { GameImages, GameImagesContext } from '../utils/Images';
import { Cloud } from './Cloud';
import WaterDrop from './WaterDrop';
import { Explosion } from './Explosion';
import { Forest } from './Forest';

const Area = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #87CEEB;
  padding: 20px;
  box-sizing: border-box;
`;

const GameAreaStyle = styled.div`
  height: 431px;
  max-width: 800px;
  width: 100%;
  background: #8FBC8F;
  margin: 20px auto;
  overflow: hidden;
  position: relative;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  background-image: linear-gradient(to bottom, #8FBC8F, #98FB98);
`;

const GameTitle = styled.h1`
  font-family: 'Comic Sans MS', cursive, sans-serif;
  font-size: 3.5rem;
  color: #FF69B4;
  text-align: center;
  margin: 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 2px;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-20px);
    }
    60% {
      transform: translateY(-10px);
    }
  }
`;

const GameModal = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  width: 80%;
  max-width: 350px;
  border: 3px solid;
  animation: fadeIn 0.5s;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  &.win {
    border-color: #4CAF50;
    h2 {
      color: #4CAF50;
    }
  }

  &.lose {
    border-color: #FF5252;
    h2 {
      color: #FF5252;
    }
  }

  h2 {
    font-family: 'Comic Sans MS', cursive, sans-serif;
    font-size: 2rem;
    margin-bottom: 15px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
  }

  p {
    margin-bottom: 20px;
    font-family: 'Comic Sans MS', cursive, sans-serif;
    font-size: 1.1rem;
  }

  button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.3s;
    font-family: 'Comic Sans MS', cursive, sans-serif;

    &:hover {
      background: #45a049;
    }

    &.next {
      background: #2196F3;
      &:hover {
        background: #0b7dda;
      }
    }
  }
`;

const GameArea = styled(GameAreaStyle).attrs((props: any) => ({
  style: {
    border: '3px solid #FF69B4',
  },
}))``;

const TICK_RATE = 20;

type GameState = {
  timestamp: number;
  timeDiff: number;
  shots: number;
  points: number;
  totalPoints: number;
  firePowerRelease: number;
  impacts: number;
  currentLevel: number;
  status: GameStatus;
};

enum GameStatus {
  GAME_LOADING = -1,
  GAME_ON = 0,
  GAME_OVER = 1,
  GAME_WIN = 2,
  GAME_PAUSED = 3,
}

export function Game(props: {}) {
  const images = useContext<GameImages>(GameImagesContext);
  const store = useStore();
  const buildScene = useStore(s => s.buildScene);
  const cloud = useStore(s => s.cloud);
  const waterDrops = useStore(s => s.waterDrops);
  const explosions = useStore(s => s.explosions);
  const dropsLeft = useStore(s => s.dropsLeft);
  const maxDropsPerPass = useStore(s => s.maxDropsPerPass);

  const handleRestart = () => {
    // Reset the game state
    store.resetGame();
    buildScene(images);
    
    // Reset the game timer state
    setGameState({
      timestamp: +new Date(),
      timeDiff: TICK_RATE,
      shots: 0,
      points: 0,
      totalPoints: 0,
      firePowerRelease: 0,
      impacts: 0,
      currentLevel: 1,
      status: GameStatus.GAME_LOADING
    });
  };

  const pauseGame = useRef(false);

  const [gameState, setGameState] = useState<GameState>({
    timestamp: +new Date(),
    timeDiff: TICK_RATE,
    shots: 0,
    points: 0,
    totalPoints: 0,
    firePowerRelease: 0,
    impacts: 0,
    currentLevel: 1,
    status: GameStatus.GAME_LOADING
  });

  useEffect(() => {
    console.log('buildScene');
    buildScene(images);
  }, [images, buildScene]);

  useEffect(() => {
    let interval = setInterval(onTick, TICK_RATE);

    function onTick() {
      if (!pauseGame.current) {
        setGameState((gameState) => {
          return {
            ...gameState,
            timestamp: +new Date(),
            timeDiff: +new Date() - gameState.timestamp,
          };
        });
      }
    }

    return () => clearInterval(interval);
  }, []);

  const forestMemo = useMemo(() => {
    return <Forest />;
  }, []);

  useEffect(() => {
    function handleKeyPress(event: any) {
      if (event.code === 'KeyP') {
        pauseGame.current = !pauseGame.current;
      }
    }
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, []);

  // Render the game with modals overlaid when needed
  const renderGameModals = () => {
    if (store.hasWon) {
      return (
        <GameModal className="win">
          <h2>🎉 You Won! 🎉</h2>
          <p>You've successfully destroyed all the mosquitoes!</p>
          <button onClick={handleRestart} className="next">Next Level</button>
        </GameModal>
      );
    }
    
    if (!store.cloud) {
      return (
        <GameModal className="lose">
          <h2>💥 Game Over! 💥</h2>
          <p>Your cloud crashed! Try to avoid hitting buildings and the ground.</p>
          <button onClick={handleRestart}>Try Again</button>
        </GameModal>
      );
    }
    
    return null;
  }

  return (
    <Area>
      <GameTitle>Drop the Drop</GameTitle>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%', maxWidth: '800px' }}>
        <div style={{
          background: '#FF69B4',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontFamily: 'Comic Sans MS, cursive, sans-serif',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <span style={{ marginRight: '8px' }}>💧</span>
          <span>Drops Left: {dropsLeft}/{maxDropsPerPass}</span>
        </div>
      </div>
      <GameArea>
        {cloud && <Cloud timeDiff={gameState.timeDiff} {...props} />}
        {forestMemo}
        {Array.from(waterDrops.values()).map((waterDrop) => (
          <WaterDrop key={waterDrop.id} buildingWidth={42} {...waterDrop} />
        ))}
        {Array.from(explosions.values()).map((explosion) => (
          <Explosion {...explosion} key={explosion.id} />
        ))}
        {renderGameModals()}
      </GameArea>
    </Area>
  );
}
