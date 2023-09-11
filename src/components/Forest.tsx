import { useRef } from 'react';
import { useStore } from '../store/store';
import { Bamboo, IFloor } from './Bamboo';

export function Forest(props: {}) {
  const store = useStore();
  const { x, y } = usePosition(store.forestWidth, store.forestHeight);

  return (
    <div>
      {store.buildings.map((building: IFloor[], index: number) => {
        return (
          <Bamboo
            key={index}
            {...props}
            x={x.current}
            y={y.current}
            buildingIndex={index}
            building={building}
          />
        );
      })}
    </div>
  );
}

function usePosition(forestWidth: number, forestHeight: number) {
  const forestStartX = useRef(0);
  const x = useRef(forestStartX.current);
  const y = useRef(0);
  return { x, y };
}
