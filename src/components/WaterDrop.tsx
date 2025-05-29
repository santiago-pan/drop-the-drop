import { useContext, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import uuidv1 from 'uuid/v1';
// import { Type } from '../store/actions';
import { GameStore, useStore } from '../store/store';
import { GameImagesContext } from '../utils/Images';
import { getBuildingHeight } from './Bamboo';

// Style

type DropAreaProps = {
  x: number;
  y: number;
  rotation: number;
  width: number;
};

const DropStyle = styled.img<DropAreaProps>`
  position: absolute;
  width: ${(props) => props.width}px;
  height: auto;
  object-fit: contain;
  transform: rotate(${(props) => props.rotation}deg);
`;

const DropStyleAttr = styled(DropStyle).attrs((props: any) => ({
  style: {
    top: `${props.y}px`,
    left: `${props.x}px`,
  },
}))``;

// Drop configuration
const DROP_ACCELERATION = 10;
const DROP_INITIAL_SPEED = 80;

export type IWaterDrop = {
  id: string;
  type: 'water1' | 'water2' | 'water3';
  initX: number;
  initY: number;
};

type WaterDropProps = { buildingWidth: number } & IWaterDrop;

export default function WaterDrop(props: WaterDropProps) {
  const store = useStore();

  const { x, y, rotation, impact, buildingIndex } = usePosition(
    props.initX,
    props.initY,
    store.forestHeight,
    store.forestWidth,
    store,
    props.id,
  );

  useEffect(() => {
    if (impact) {
      store.removeWaterDrop(props.id);
      addExplosion(store, x, y);
      if (buildingIndex !== null) {
        removeFloor(store, buildingIndex);
        // Check win condition after potentially destroying a mosquito
        store.checkWinCondition();
      }
    }
  }, [impact, buildingIndex, store, x, y, props.id]);

  const images = useContext(GameImagesContext);
  const waterDropImage = useMemo(() => {
    return images.waterDrops[props.type.replace('water', 'WATER')];
  }, [props.type, images]);

  return (
    <DropStyleAttr
      src={waterDropImage.src}
      x={x}
      y={y}
      width={20}
      rotation={rotation}
    />
  );
}

function usePosition(
  initX: number,
  initY: number,
  forestHeight: number,
  forestWidth: number,
  store: GameStore,
  id: string,
) {
  const timeRef = useRef<number>(+new Date());
  const x = useRef(initX);
  const y = useRef(initY);
  const speed = useRef(DROP_INITIAL_SPEED);
  const dropTime = useRef(0);
  const rotation = useRef(0);

  const currentTime = +new Date();
  const frameDiff = (currentTime - timeRef.current) / 1000;

  timeRef.current = currentTime;
  dropTime.current += frameDiff;
  speed.current += (DROP_ACCELERATION * dropTime.current ** 2) / 2;
  y.current += speed.current * frameDiff;

  const targetImpact = checkTargetImpact(
    forestHeight,
    forestWidth,
    id,
    x.current,
    y.current + 20,
    store,
  );

  return {
    x: x.current,
    y: y.current,
    rotation: rotation.current,
    impact: targetImpact.impact,
    buildingIndex: targetImpact.impact ? targetImpact.buildingIndex : null,
  };
}

type TargetImpact =
  | {
      impact: true;
      buildingIndex: number | null;
    }
  | {
      impact: false;
    };

function checkTargetImpact(
  forestHeight: number,
  forestWidth: number,
  id: string,
  x: number,
  y: number,
  store: GameStore,
): TargetImpact {
  // const cityStartX = window.innerWidth / 2 - forestWidth / 2;
  const cityStartX = 0;
  const buildingWidth = 42;
  const buildingIndex = Math.floor((x + 10 - cityStartX) / buildingWidth);

  if (y > forestHeight) {
    return { impact: true, buildingIndex: null };
  }

  const building = store.buildings[buildingIndex];

  if (building) {
    const buildingHeight = getBuildingHeight(building);

    if (y > forestHeight - buildingHeight) {
      return { impact: true, buildingIndex };
    }
  }
  return { impact: false };
}

function removeBoomb(store: GameStore, id: string) {
  store.removeWaterDrop(id);
}

function addExplosion(store: GameStore, initX: number, initY: number) {
  store.addExplosion({
    id: uuidv1(),
    type: 'explosion1',
    initX,
    initY,
  });
}

function removeFloor(store: GameStore, index: number) {
  store.removeFloor(index);
}
