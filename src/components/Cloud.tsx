import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import uuidv1 from 'uuid/v1';
import { useStore } from '../store/store';
import cloud from './../assets/images/ic_cloud_1.png';
import { IFloor, getBuildingHeight } from './Bamboo';
import { IExplosion } from './Explosion';

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
    store.buildings,
    props.timeDiff,
    store.forestWidth,
    store.forestHeight,
  );

  useEffect(() => {
    function handleKeyPress(event: any) {
      if (event.code === 'Space') {
        store.addDrop({
          id: uuidv1(),
          type: 'drop1',
          initX: x + CLOUD_WIDTH / 2,
          initY: y + 40,
        });
      }
    }
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [store, x, y]);

  useEffect(() => {
    if (impact) {
      store.destroyCloud();
      store.addExplosion(newExplosion(x, y));
    }
  }, [impact, store, x, y]);

  return <CloudStyleAttr src={cloud} x={x} y={y} />;
}

function usePosition(
  buildings: Array<IFloor[]>,
  timeDiff: number,
  forestWidth: number,
  forestHeight: number,
) {
  const cloudStartX = useRef(-CLOUD_WIDTH);
  const maxCloudX = useRef(forestWidth);
  const x = useRef(cloudStartX.current);
  const y = useRef(0);
  const explosion = useRef(false);

  const displacement = (timeDiff / 1000) * SPEED;
  if (x.current > maxCloudX.current) {
    y.current = y.current + DOWN_SPEED;
    x.current = -CLOUD_WIDTH;
  } else {
    x.current = x.current + displacement;
  }

  const impact = checkImpact(
    buildings,
    forestHeight,
    forestWidth,
    x.current,
    y.current,
  );

  return { x: x.current, y: y.current, explosion: explosion.current, impact };
}

function checkImpact(
  buildings: Array<IFloor[]>,
  forestHeight: number,
  forestWidth: number,
  x: number,
  y: number,
): boolean {
  const buildingWidth = 42;
  const xOffset = buildingWidth / 2;
  const buildingIndex = Math.floor((x + CLOUD_WIDTH - xOffset) / buildingWidth);

  const building = buildings[buildingIndex];

  if (building) {
    const buildingHeight = getBuildingHeight(building);

    if (y + CLOUD_HEIGHT > forestHeight - buildingHeight) {
      return true;
    }
  }
  return false;
}

function newExplosion(initX: number, initY: number): IExplosion {
  return { id: uuidv1(), type: 'explosion2', initX, initY };
}
