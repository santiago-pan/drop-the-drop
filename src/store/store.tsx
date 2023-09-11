import { create } from 'zustand';
import { DEFAULT_BUILDING_WIDTH, IFloor } from '../components/Bamboo';
import { IDrop } from '../components/Drop';
import { IExplosion } from '../components/Explosion';
import { GameImages } from '../utils/Images';

export type GameStore = {
  frameRate: number;
  forestWidth: number;
  forestHeight: number;
  buildingWidth: number;
  difficulty: number;
  buildings: Array<IFloor[]>;
  drops: Map<string, IDrop>;
  explosions: Map<string, IExplosion>;
  cloud: boolean;
  addBuilding: (building: IFloor[]) => void;
  removeBuilding: (index: number) => void;
  addDrop: (drop: IDrop) => void;
  removeDrop: (id: string) => void;
  addExplosion: (explosion: IExplosion) => void;
  removeExplosion: (id: string) => void;
  removeFloor: (index: number) => void;
  destroyCloud: () => void;
  buildScene: (images: GameImages) => void;
};

export const useStore = create<GameStore>((set, get) => ({
  // Default State (From your InitialState)
  frameRate: 25,
  forestWidth: 800,
  forestHeight: 431,
  difficulty: 3,
  buildingWidth: 42,
  buildings: new Array<[]>(),
  drops: new Map<string, IDrop>(),
  explosions: new Map<string, IExplosion>(),
  cloud: true,

  buildScene: (images: GameImages) => {
    const { forestWidth, buildingWidth, difficulty } = get();

    const numBuildings = Math.floor(forestWidth / buildingWidth);
    const factor = buildingWidth / DEFAULT_BUILDING_WIDTH;
    const buildings: IFloor[][] = [];
    for (let index = 0; index < numBuildings; index++) {
      const building = getRandomBuilding(difficulty, factor, images);
      buildings.push(building);
    }
    set(() => ({ buildings }));
  },
  // Actions
  addBuilding: (building: IFloor[]) => {
    set((state) => ({ buildings: [...state.buildings, building] }));
  },
  removeBuilding: (index: number) => {
    set((state) => ({
      buildings: state.buildings.filter((_, i) => i !== index),
    }));
  },
  addDrop: (drop: IDrop) => {
    set((state) => ({ drops: new Map(state.drops).set(drop.id, drop) }));
  },
  removeDrop: (id: string) => {
    set((state) => {
      const drops = new Map(state.drops);
      drops.delete(id);
      return { drops };
    });
  },
  addExplosion: (explosion: IExplosion) => {
    set((state) => ({
      explosions: new Map(state.explosions).set(explosion.id, explosion),
    }));
  },
  removeExplosion: (id: string) => {
    set((state) => {
      const explosions = new Map(state.explosions);
      explosions.delete(id);
      return { explosions };
    });
  },
  removeFloor: (index: number) => {
    set((state) => {
      const building = state.buildings[index];
      const newBuilding = [...building];
      newBuilding.splice(newBuilding.length - 1, 1);
      const buildings = [...state.buildings];
      buildings.splice(index, 1, newBuilding);
      return { buildings };
    });
  },
  destroyCloud: () => {
    set(() => ({ cloud: false }));
  },
}));

function getRandomBuilding(
  difficulty: number,
  factor: number,
  images: GameImages,
): IFloor[] {
  const roof = getRandomFloor(images.roofs, factor);
  const basement = getRandomFloor(images.basements, factor);
  const floor = getRandomFloor(images.floors, factor);
  const numFloors = randomFloorIndex(difficulty) + 1;
  const floors = Array(numFloors).fill(floor);
  return [basement, ...floors, roof];
}

function getRandomFloor(
  floors: { [key: string]: HTMLImageElement },
  factor: number,
): IFloor {
  const floorIndex = randomFloorIndex(Object.keys(floors).length);
  const img = Object.values(floors)[floorIndex];
  const type = Object.keys(floors)[floorIndex];
  return {
    img,
    height: img.height * factor,
    type,
  };
}

function randomFloorIndex(numFloors: number) {
  return Math.floor(Math.random() * numFloors);
}