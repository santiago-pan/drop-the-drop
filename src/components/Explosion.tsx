import { useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
// import { Type } from '../store/actions';
import { useStore } from '../store/store';
import { GameImages, GameImagesContext } from '../utils/Images';

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

const ExplosionImageStyleAttr = styled(ExplosionImageStyle).attrs(
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

const ExplosionFrameStyle = styled.img<ExplostionFrameProps>``;

const ExplosionFrameStyleAttr = styled(ExplosionFrameStyle).attrs(
  (props: ExplostionFrameProps) => ({
    style: {
      width: `${props.totalWidth}px`,
      transform: `translate(${-1 * props.frame * props.width}px)`,
    },
  }),
)``;

export type IExplosion = {
  id: string;
  type: 'explosion1' | 'explosion2' | 'explosion3';
  initX: number;
  initY: number;
};

type ExplosionProps = IExplosion;

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
      store.removeExplosion(props.id);
    }
  }, [frames, store, props.id]);

  return (
    <ExplosionImageStyleAttr
      x={x.current - width / 2 + 12}
      y={y.current - width / 2}
      width={width}
    >
      <ExplosionFrameStyleAttr
        src={explosion.src}
        frame={frame.current}
        totalWidth={totalWidth}
        width={width}
      />
    </ExplosionImageStyleAttr>
  );
}

function usePosition(initX: number, initY: number) {
  const x = useRef(initX);
  const y = useRef(initY);
  return { x, y };
}
