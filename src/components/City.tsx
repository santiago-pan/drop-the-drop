import React, { useRef } from 'react';
import { useStore } from '../store/store';
import { Building, IFloor } from './Building';
import { GameProps } from './Game';

type CityProps = GameProps & {
  buildingWidth: number;
};

export function City(props: CityProps) {
  const { x, y } = usePosition(props.cityWidth, props.cityHeight);
  const store = useStore();

  return (
    <div>
      {store.state.buildings.map((building: IFloor[], index: number) => {
        return (
          <Building
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

function usePosition(cityWidth: number, cityHeight: number) {
  const cityStartX = useRef(window.innerWidth / 2 - cityWidth / 2);
  const x = useRef(cityStartX.current);
  const y = useRef(window.innerHeight - cityHeight);
  return { x, y };
}
