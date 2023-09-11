import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useStore } from '../store/store';
import { GameImages, GameImagesContext } from '../utils/Images';
import backgroundImage from './../assets/images/desert.jpg';
import { Cloud } from './Cloud';
import Drop from './Drop';
import { Explosion } from './Explosion';
import { Forest } from './Forest';

import titleImage from './../assets/drop-the-drop.png';

const Area = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: normal;
  padding-top: 0px;
  background: #ffa50029;
`;

const GameAreaStyle = styled.div`
  height: 431px;
  min-width: 800px;
  max-width: 800px;
  background: aliceblue;
  width: 50%;
  margin: 0px auto;
  overflow: hidden;
  position: relative;
`;

const TitleImage = styled.img`
  width: 40%;
  padding: 60px 20px;
  max-width: 520px;
`;

const GameArea = styled(GameAreaStyle).attrs((props: any) => ({
  style: {
    border: '2px solid #aaa',
    borderRadius: '4px',
    backgroundImage: `url(${backgroundImage})`,
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

  const buildScene = useStore(s => s.buildScene);
  const cloud = useStore(s => s.cloud);
  const drops = useStore(s => s.drops);
  const explosions = useStore(s => s.explosions);

  const pauseGame = useRef(false);

  useEffect(() => {
    console.log('buildScene');
    buildScene(images);
  }, [images, buildScene]);

  const [gameState, setGameState] = useState<GameState>({
    timestamp: +new Date(),
    timeDiff: TICK_RATE,
    shots: 0,
    points: 0,
    totalPoints: 0,
    firePowerRelease: 0,
    impacts: 0,
    currentLevel: 0,
    status: GameStatus.GAME_ON,
  });

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

  return (
    <Area>
      <TitleImage src={titleImage} />
      <GameArea>
        {cloud && <Cloud timeDiff={gameState.timeDiff} {...props} />}
        {useMemo(() => {
          return <Forest />;
        }, [])}
        {Array.from(drops.values()).map((drop) => (
          <Drop {...props} {...drop} key={drop.id} buildingWidth={42} />
        ))}
        {Array.from(explosions.values()).map((explosion) => (
          <Explosion {...explosion} key={explosion.id} />
        ))}
      </GameArea>
    </Area>
  );
}
