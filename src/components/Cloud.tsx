import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import uuidv1 from 'uuid/v1';
import { Type } from '../store/actions';
import { StoreContextType, useStore } from '../store/store';
import cloud from './../assets/images/ic_cloud_1.png';
import { getBuildingHeight } from './Bamboo';

// Cloud configuration
const SPEED = 100;
const CLOUD_WIDTH = 80;
const CLOUD_HEIGHT = 50;
const DOWN_SPEED = 40;

type CloudAreaProps = {
  x: number;
  y: number;
};

const CloudStyle = styled.img<CloudAreaProps>`
  position: absolute;
  width: ${CLOUD_WIDTH}px;
  height: auto;
  object-fit: contain;
`;

const CloudStyleAttr = styled(CloudStyle).attrs(
  (props: { x: number; y: number }) => ({
    style: {
      top: `${props.y}px`,
      left: `${props.x}px`,
    },
  }),
)``;

type CloudProps = {
  timeDiff: number;
};

export function Cloud(props: CloudProps) {
  const store = useStore();

  const { x, y, impact } = usePosition(
    props.timeDiff,
    store.state.forestWidth,
    store.state.forestHeight,
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
          initX: x + CLOUD_WIDTH / 2,
          initY: y + 40,
        },
      });
    }
  }

  return <CloudStyleAttr src={cloud} x={x} y={y} />;
}

function usePosition(
  timeDiff: number,
  forestWidth: number,
  forestHeight: number,
  store: StoreContextType,
) {
  const cloudStartX = useRef(-CLOUD_WIDTH);
  const maxCloudX = useRef(forestWidth);
  const x = useRef(cloudStartX.current);
  const y = useRef(180);
  const explosion = useRef(false);

  const displacement = (timeDiff / 1000) * SPEED;
  if (x.current > maxCloudX.current) {
    y.current = y.current + DOWN_SPEED;
    x.current = -CLOUD_WIDTH;
  } else {
    x.current = x.current + displacement;
  }

  const impact = checkImpact(
    forestHeight,
    forestWidth,
    x.current,
    y.current,
    store,
  );

  return { x: x.current, y: y.current, explosion: explosion.current, impact };
}

function checkImpact(
  forestHeight: number,
  forestWidth: number,
  x: number,
  y: number,
  store: StoreContextType,
): boolean {
  const buildingWidth = 42;
  const xOffset = buildingWidth / 2;
  const buildingIndex = Math.floor((x + CLOUD_WIDTH - xOffset) / buildingWidth);

  const building = store.state.buildings[buildingIndex];

  if (building) {
    const buildingHeight = getBuildingHeight(building);

    if (y + CLOUD_HEIGHT > forestHeight - buildingHeight) {
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
