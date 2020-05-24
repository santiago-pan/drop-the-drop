import React, { useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Type } from '../store/actions';
import { useStore } from '../store/store';
import { GameImages, GameImagesContext } from '../utils/Images';
import { GameProps } from './Game';

type ExplosionAreaProps = {
  x: number;
  y: number;
  width: number;
};

const ExplosionImageStyle = styled.div<ExplosionAreaProps>`
  position: absolute;
  width: ${(props) => props.width}px;
  height: auto;
  object-fit: contain;
  overflow: hidden;
`;

const ExplosionStyle = styled(ExplosionImageStyle as any).attrs(
  (props: ExplosionAreaProps) => ({
    style: {
      top: `${props.y}px`,
      left: `${props.x}px`,
    },
  }),
)``;

type ExplostionFrameProps = {
  frame: number;
  totalWidth: number;
  width: number;
};

const ExplosionFrame = styled.img<ExplostionFrameProps>`
  width: ${(props) => props.totalWidth}px;
  transform: translate(${(props) => -1 * props.frame * props.width}px);
`;

export type IExplosion = {
  id: string;
  type: 'explosion1' | 'explosion2' | 'explosion3';
  initX: number;
  initY: number;
};

type ExplosionProps = IExplosion & GameProps;

export function Explosion(props: ExplosionProps) {
  const store = useStore();
  const { x, y } = usePosition(props.initX, props.initY);
  const frame = useRef(0);
  const images = useContext<GameImages>(GameImagesContext);

  let explosion = null;
  let frames: number = 0;
  if (props.type === 'explosion1') {
    explosion = images.explosions.EXPLOSION_1;
    frames = 43;
  } else if (props.type === 'explosion2') {
    explosion = images.explosions.EXPLOSION_2;
    frames = 41;
  } else {
    frames = 43;
    explosion = images.explosions.EXPLOSION_1;
  }

  const totalWidth = explosion.width;

  const width = totalWidth / frames;

  frame.current += 1;

  useEffect(() => {
    if (frame.current > frames) {
      store.dispatch({ type: Type.RemoveExplosion, payload: { id: props.id } });
    }
  }, [frames, store, props.id]);

  return (
    <ExplosionStyle
      x={x.current - width / 2 + 12}
      y={y.current - width / 2}
      width={width}
    >
      <ExplosionFrame
        src={explosion.src}
        frame={frame.current}
        totalWidth={totalWidth}
        width={width}
      />
    </ExplosionStyle>
  );
}

function usePosition(initX: number, initY: number) {
  const x = useRef(initX);
  const y = useRef(initY);
  return { x, y };
}
