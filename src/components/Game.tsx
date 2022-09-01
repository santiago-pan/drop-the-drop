import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { Type } from '../store/actions';
import { StoreContextType, useStore } from '../store/store';
import { GameImages, GameImagesContext } from '../utils/Images';
import backgroundImage from './../assets/images/desert.jpg';
import { DEFAULT_BUILDING_WIDTH, IFloor } from './Bamboo';
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
  justify-content: center;
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
  padding: 20px;
  max-width: 520px;
`;

const GameArea = styled(GameAreaStyle).attrs((props: any) => ({
  style: {
    border: "2px solid #aaa",
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
  const store = useStore();
  const pauseGame = useRef(false);

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
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  });

  useBuildScenery(store.state.forestWidth, 42, store.state.difficulty);

  function handleKeyPress(event: any) {
    if (event.code === 'KeyP') {
      pauseGame.current = !pauseGame.current;
    }
  }

  return (
    <Area>
      <TitleImage src={titleImage}/>
      <GameArea>
        {store.state.cloud && (
          <Cloud timeDiff={gameState.timeDiff} {...props} />
        )}
        {useMemo(() => {
          return <Forest />;
        }, [])}
        {Array.from(store.state.drops.values()).map((drop) => (
          <Drop {...props} {...drop} key={drop.id} buildingWidth={42} />
        ))}
        {Array.from(store.state.explosions.values()).map((explosion) => (
          <Explosion {...explosion} key={explosion.id} />
        ))}
      </GameArea>
    </Area>
  );
}

const useBuildScenery = (
  forestWidth: number,
  buildingWidth: number,
  difficulty: number,
): IFloor[][] => {
  const [loaded, setLoaded] = useState(false);
  const images = useContext<GameImages>(GameImagesContext);
  const store = useStore();

  const scenery = useRef<IFloor[][]>([]);

  const doBuildScenery = useCallback(() => {
    scenery.current = buildScenery(
      forestWidth,
      buildingWidth,
      difficulty,
      images,
      store,
    );
  }, [forestWidth, buildingWidth, difficulty, images, store]);

  useEffect(() => {
    if (loaded === false) {
      doBuildScenery();
      setLoaded(true);
    }
  }, [loaded, doBuildScenery]);
  return scenery.current;
};

const buildScenery = (
  forestWidth: number,
  buildingWidth: number,
  difficulty: number,
  images: GameImages,
  store: StoreContextType,
): IFloor[][] => {
  const numBuildings = Math.floor(forestWidth / buildingWidth);
  const factor = buildingWidth / DEFAULT_BUILDING_WIDTH;
  const buildings: IFloor[][] = [];
  for (let index = 0; index < numBuildings; index++) {
    const building = getRandomBuilding(difficulty, factor, images);
    buildings.push(building);
    addBuilding(building, store);
  }
  return buildings;
};

function getRandomBuilding(
  difficulty: number,
  factor: number,
  images: GameImages,
): IFloor[] {
  const roof = getRandomFloor(images.roofs, factor);
  const basement = getRandomFloor(images.basements, factor);
  const floor = getRandomFloor(images.floors, factor);
  const numFloors = randomFloorIndex(difficulty) + 1;
  const floors = Array(numFloors).fill(floor);
  return [basement, ...floors, roof];
}

function getRandomFloor(
  floors: { [key: string]: HTMLImageElement },
  factor: number,
): IFloor {
  const floorIndex = randomFloorIndex(Object.keys(floors).length);
  const img = Object.values(floors)[floorIndex];
  const type = Object.keys(floors)[floorIndex];
  return {
    img,
    height: img.height * factor,
    type,
  };
}

function randomFloorIndex(numFloors: number) {
  return Math.floor(Math.random() * numFloors);
}

function addBuilding(building: IFloor[], store: StoreContextType) {
  store.dispatch({
    type: Type.AddBuilding,
    payload: building,
  });
}
