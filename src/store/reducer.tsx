import { IDrop } from '../components/Drop';
import { IFloor } from '../components/Building';
import { IExplosion } from '../components/Explosion';
import * as Actions from './actions';
import { Action } from './actions';

export type IState = {
  buildings: Array<IFloor[]>;
  drops: Map<string, IDrop>;
  explosions: Map<string, IExplosion>;
  cloud: boolean;
};

export const InitialState: IState = {
  buildings: new Array<[]>(),
  drops: new Map<string, IDrop>(),
  explosions: new Map<string, IExplosion>(),
  cloud: true,
};

const ReducerMap = {
  [Actions.Type.AddBuilding]: addBuilding,
  [Actions.Type.RemoveBuilding]: removeBuilding,
  [Actions.Type.AddDrop]: addDrop,
  [Actions.Type.RemoveDrop]: removeDrop,
  [Actions.Type.AddExplosion]: addExplosion,
  [Actions.Type.RemoveExplosion]: removeExplosion,
  [Actions.Type.RemoveFloor]: removeFloor,
  [Actions.Type.DestroyCloud]: destroyCloud,
};

export default function Reducer(
  state: IState = InitialState,
  action: Action,
): IState {
  const reducer = ReducerMap[action.type];
  return reducer(state, action);
}

function addBuilding(state: IState, { payload }: Actions.AddBuilding) {
  const buildings = [...state.buildings];
  buildings.push(payload);
  return { ...state, buildings };
}

function removeBuilding(state: IState, { payload }: Actions.RemoveBuilding) {
  const buildings = [
    ...state.buildings.slice(payload.index),
    ...state.buildings.slice(payload.index + 1),
  ];
  return { ...state, buildings };
}

function addDrop(state: IState, { payload }: Actions.AddDrop) {
  const drops = new Map(state.drops);
  drops.set(payload.id, payload);
  return { ...state, drops };
}

function removeDrop(state: IState, { payload }: Actions.RemoveDrop) {
  const drops = new Map(state.drops);
  drops.delete(payload.id);
  return { ...state, drops };
}

function addExplosion(state: IState, { payload }: Actions.AddExplosion) {
  const explosions = new Map(state.explosions);
  explosions.set(payload.id, payload);
  return { ...state, explosions };
}

function removeExplosion(state: IState, { payload }: Actions.RemoveExplosion) {
  const explosions = new Map(state.explosions);
  explosions.delete(payload.id);
  return { ...state, explosions };
}

function removeFloor(state: IState, { payload }: Actions.RemoveFloor) {
  const building = state.buildings[payload.index];
  const newBuilding = [...building];
  newBuilding.splice(newBuilding.length - 1, 1);
  const buildings = [...state.buildings];
  buildings.splice(payload.index, 1, newBuilding);

  return { ...state, buildings };
}

function destroyCloud(state: IState, { payload }: Actions.DestroyCloud) {
  return { ...state, cloud: false };
}
