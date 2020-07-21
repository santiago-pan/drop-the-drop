import React, { useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import uuidv1 from 'uuid/v1';
import { Type } from '../store/actions';
import { StoreContextType, useStore } from '../store/store';
import { GameImagesContext } from '../utils/Images';
import { getBuildingHeight } from './Building';

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

const DropStyleAttr = styled(DropStyle as any).attrs((props: any) => ({
  style: {
    top: `${props.y}px`,
    left: `${props.x}px`,
  },
}))``;

// Drop configuration
const DROP_ACCELERATION = 10;
const DROP_INITIAL_SPEED = 80;

export type IDrop = {
  id: string;
  type: 'drop1' | 'drop2' | 'drop3';
  initX: number;
  initY: number;
};

type DropProps = { buildingWidth: number } & IDrop;

export default function Drop(props: DropProps) {
  const store = useStore();

  const { x, y, rotation, impact, buildingIndex } = usePosition(
    props.initX,
    props.initY,
    store.state.cityHeight,
    store.state.cityWidth,
    store,
    props.id,
  );

  useEffect(() => {
    if (impact) {
      removeBoomb(store, props.id);
      addExplosion(store, x, y);
      if (buildingIndex) {
        removeFloor(store, buildingIndex);
      }
    }
  }, [impact, buildingIndex, store, x, y, props.id]);

  const images = useContext(GameImagesContext);

  return (
    <DropStyleAttr
      src={images.drops.DROP_1.src}
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
  cityHeight: number,
  cityWidth: number,
  store: StoreContextType,
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

  const { impact, buildingIndex } = checkBuildingImpact(
    cityHeight,
    cityWidth,
    id,
    x.current,
    y.current + 20,
    store,
  );

  return {
    x: x.current,
    y: y.current,
    rotation: rotation.current,
    impact,
    buildingIndex,
  };
}

function checkBuildingImpact(
  cityHeight: number,
  cityWidth: number,
  id: string,
  x: number,
  y: number,
  store: StoreContextType,
): { impact: boolean; buildingIndex?: number } {
  const cityStartX = window.innerWidth / 2 - cityWidth / 2;
  const buildingWidth = 42;
  const buildingIndex = Math.floor((x + 10 - cityStartX) / buildingWidth);

  if (y > cityHeight) {
    return { impact: true };
  }

  const building = store.state.buildings[buildingIndex];

  if (building) {
    const buildingHeight = getBuildingHeight(building);

    if (y > cityHeight - buildingHeight) {
      return { impact: true, buildingIndex };
    }
  }
  return { impact: false };
}

function removeBoomb(store: StoreContextType, id: string) {
  store.dispatch({ type: Type.RemoveDrop, payload: { id } });
}

function addExplosion(store: StoreContextType, initX: number, initY: number) {
  store.dispatch({
    type: Type.AddExplosion,
    payload: {
      id: uuidv1(),
      type: 'explosion1',
      initX,
      initY,
    },
  });
}

function removeFloor(store: StoreContextType, index: number) {
  store.dispatch({
    type: Type.RemoveFloor,
    payload: {
      index,
    },
  });
}
