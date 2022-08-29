import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import uuidv1 from 'uuid/v1';
import { Type } from '../store/actions';
import { StoreContextType, useStore } from '../store/store';
import plane from './../assets/images/ic_plane_f21.png';
import { getBuildingHeight } from './Building';

// Plane configuration

const SPEED = 100;
const PLANE_WIDTH = 80;
const DOWN_SPEED = 40;

type PlaneAreaProps = {
  x: number;
  y: number;
};

const PlaneStyle = styled.img<PlaneAreaProps>`
  position: absolute;
  width: ${PLANE_WIDTH}px;
  height: auto;
  object-fit: contain;
`;

const PlaneStyleAttr = styled(PlaneStyle).attrs((props: any) => ({
  style: {
    top: `${props.y}px`,
    left: `${props.x}px`,
  },
}))``;

export function Plane() {
  const store = useStore();

  const { x, y, impact } = usePosition(
    store.state.cityWidth,
    store.state.cityHeight,
    store,
  );

  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  });

  useEffect(() => {
    if (impact) {
      removeCloud(store);
      addExplosion(store, x, y);
    }
  }, [impact, store, x, y]);

  function handleKeyPress(event: any) {
    if (event.code === 'Space') {
      store.dispatch({
        type: Type.AddDrop,
        payload: {
          id: uuidv1(),
          type: 'drop1',
          initX: x + PLANE_WIDTH / 2,
          initY: y + 40,
        },
      });
    }
  }

  return <PlaneStyleAttr src={plane} x={x} y={y} />;
}

function usePosition(
  cityWidth: number,
  cityHeight: number,
  store: StoreContextType,
) {
  const planeStartX = useRef(
    window.innerWidth / 2 - cityWidth / 2 - PLANE_WIDTH,
  );
  const maxPlaneX = useRef(window.innerWidth / 2 + cityWidth / 2);
  const x = useRef(planeStartX.current);
  const y = useRef(0);
  const timeRef = useRef<number>(+new Date());
  const explosion = useRef(false);

  const currentTime = +new Date();
  const frameDiff = currentTime - timeRef.current;
  timeRef.current = currentTime;

  const displacement = (frameDiff / 1000) * SPEED;
  if (x.current > maxPlaneX.current) {
    y.current = y.current + DOWN_SPEED;
    x.current = planeStartX.current;
  } else {
    x.current = x.current + displacement;
  }

  const impact = checkBuildingImpact(
    cityHeight,
    cityWidth,
    x.current,
    y.current + 47,
    store,
  );

  return { x: x.current, y: y.current, explosion: explosion.current, impact };
}

function checkBuildingImpact(
  cityHeight: number,
  cityWidth: number,
  x: number,
  y: number,
  store: StoreContextType,
): boolean {
  const cityStartX = window.innerWidth / 2 - cityWidth / 2;
  const buildingWidth = 42;
  const buildingIndex = Math.floor((x + 50 - cityStartX) / buildingWidth);

  const building = store.state.buildings[buildingIndex];

  if (building) {
    const buildingHeight = getBuildingHeight(building);

    if (y > cityHeight - buildingHeight) {
      return true;
    }
  }
  return false;
}

function removeCloud(store: StoreContextType) {
  store.dispatch({ type: Type.DestroyCloud, payload: {} });
}

function addExplosion(store: StoreContextType, initX: number, initY: number) {
  store.dispatch({
    type: Type.AddExplosion,
    payload: {
      id: uuidv1(),
      type: 'explosion2',
      initX,
      initY,
    },
  });
}
