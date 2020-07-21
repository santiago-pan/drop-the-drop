import React, { useEffect, useRef, useState, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { useStore, StoreContextType } from '../store/store';
import backgroundImage from './../assets/images/desert.jpg';
import Drop from './Drop';
import { City } from './City';
import { Explosion } from './Explosion';
import { Plane } from './Plane';
import { IFloor, DEFAULT_BUILDING_WIDTH } from './Building';
import { GameImages, GameImagesContext } from '../utils/Images';
import { Type } from '../store/actions';

const Area = styled.div`
  height: 100%;
  width: 100%;
  padding-top: 0px;
  background: orange;
`;

const GameAreaStyle = styled.div`

  height: 431px;
  min-width: 800px;
  max-width: 800px;
  background: aliceblue;
  width: 50%;
  margin: 0px auto;
  overflow: hidden;
`;

const GameArea = styled(GameAreaStyle as any).attrs((props: any) => ({
  style: {
    backgroundImage: `url(${backgroundImage})`,
  },
}))``;

const TICK_RATE = 20;

type GameState = {
  timestamp: number;
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
    shots: 0,
    points: 0,
    totalPoints: 0,
    firePowerRelease: 0,
    impacts: 0,
    currentLevel: 0,
    status: GameStatus.GAME_ON,
  });

  useEffect(() => {
    let interval = 0;

    const onTick = () => {
      if (!pauseGame.current) {
        setGameState({ ...gameState, timestamp: +new Date() });
      }
    };

    interval = setInterval(onTick, TICK_RATE);

    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  });

  useBuildCity(
    store.state.cityWidth,
    42,
    store.state.difficulty,
  );

  function handleKeyPress(event: any) {
    if (event.code === 'KeyP') {
      pauseGame.current = !pauseGame.current;
      console.log(pauseGame.current);
    }
  }

  return (
    <Area>
      <GameArea>
        {store.state.cloud && <Plane {...props} />}
        {useMemo(() => {
          return <City />
        },[])}
        {Array.from(store.state.drops.values()).map((drop) => (
          <Drop {...props} {...drop} key={drop.id} buildingWidth={42} />
        ))}
        {Array.from(store.state.explosions.values()).map((explosion) => (
          <Explosion {...props} {...explosion} key={explosion.id} />
        ))}
      </GameArea>
    </Area>
  );
}

const useBuildCity = (
  cityWidth: number,
  buildingWidth: number,
  difficulty: number,
): IFloor[][] => {
  const [loaded, setLoaded] = useState(false);
  const images = useContext<GameImages>(GameImagesContext);
  const store = useStore();

  const city = useRef<IFloor[][]>([]);

  useEffect(() => {
    if (loaded === false) {
      (async () => {
        city.current = buildCity(
          cityWidth,
          buildingWidth,
          difficulty,
          images,
          store,
        );

        setLoaded(true);
      })();
    }
  });
  return city.current;
};

const buildCity = (
  cityWidth: number,
  buildingWidth: number,
  difficulty: number,
  images: GameImages,
  store: StoreContextType,
): IFloor[][] => {
  const numBuildings = Math.floor(cityWidth / buildingWidth);
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