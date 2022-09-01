import { IDrop } from '../components/Drop';
import { IExplosion } from '../components/Explosion';
import { IFloor } from '../components/Bamboo';

export type Action<P = any> = {
  type: string;
  payload: P;
};

export const Type = {
  AddBuilding: 'AddBuilding',
  RemoveBuilding: 'RemoveBuilding',
  AddDrop: 'AddDrop',
  RemoveDrop: 'RemoveDrop',
  AddExplosion: 'AddExplosion',
  RemoveExplosion: 'RemoveExplosion',
  AddScore: 'AddScore',
  RemoveFloor: 'RemoveFloor',
  DestroyCloud: 'DestroyCloud'
};

export type AddBuilding = Action<IFloor[]>
export type RemoveBuilding = Action<{index: number}>
export type AddDrop = Action<IDrop>;
export type RemoveDrop = Action<{ id: string }>;
export type AddExplosion = Action<IExplosion>;
export type RemoveExplosion = Action<{ id: string }>;
export type RemoveFloor = Action<{ index: number }>;
export type DestroyCloud = Action<{}>;

