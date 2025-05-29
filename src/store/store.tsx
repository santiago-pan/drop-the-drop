import { create } from 'zustand';
import { DEFAULT_BUILDING_WIDTH, IFloor } from '../components/Bamboo';
import { IWaterDrop } from '../components/WaterDrop';
import { IExplosion } from '../components/Explosion';
import { GameImages } from '../utils/Images';

export type GameStore = {
  frameRate: number;
  forestWidth: number;
  forestHeight: number;
  buildingWidth: number;
  difficulty: number;
  buildings: Array<IFloor[]>;
  waterDrops: Map<string, IWaterDrop>;
  explosions: Map<string, IExplosion>;
  cloud: boolean;
  hasWon: boolean;
  gamePaused: boolean;
  dropsLeft: number;
  maxDropsPerPass: number;
  cloudResetTrigger: number; // Incremented to trigger cloud position reset
  addBuilding: (building: IFloor[]) => void;
  removeBuilding: (index: number) => void;
  addWaterDrop: (waterDrop: IWaterDrop) => void;
  removeWaterDrop: (id: string) => void;
  addExplosion: (explosion: IExplosion) => void;
  removeExplosion: (id: string) => void;
  removeFloor: (index: number) => void;
  destroyCloud: () => void;
  resetDropsCounter: () => void;
  useDrops: () => boolean;
  buildScene: (images: GameImages) => void;
  checkWinCondition: () => void;
  resetGame: () => void;
};

export const useStore = create<GameStore>((set, get) => ({
  frameRate: 25,
  forestWidth: 800,
  forestHeight: 431,
  difficulty: 3,
  buildingWidth: 42,
  buildings: new Array<[]>(),
  waterDrops: new Map<string, IWaterDrop>(),
  explosions: new Map<string, IExplosion>(),
  cloud: true,
  hasWon: false,
  gamePaused: false,
  dropsLeft: 5,
  maxDropsPerPass: 5,
  cloudResetTrigger: 0,
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
  addWaterDrop: (waterDrop: IWaterDrop) => {
    set((state) => ({ waterDrops: new Map(state.waterDrops).set(waterDrop.id, waterDrop) }));
  },
  removeWaterDrop: (id: string) => {
    set((state) => {
      const waterDrops = new Map(state.waterDrops);
      waterDrops.delete(id);
      return { waterDrops };
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
  resetDropsCounter: () => {
    set((state) => ({ dropsLeft: state.maxDropsPerPass }));
  },
  useDrops: () => {
    const { dropsLeft } = get();
    if (dropsLeft <= 0) {
      return false; // No drops left
    }
    set((state) => ({ dropsLeft: state.dropsLeft - 1 }));
    return true; // Successfully used a drop
  },
  checkWinCondition: () => {    
    const { buildings } = get();
    console.log('Checking win condition...');
    console.log('Current buildings:', buildings);
    
    // Check if all mosquitoes have been destroyed - this is the only win condition
    const allMosquitoesDestroyed = !buildings.some(building => 
      building.some(floor => floor.type.startsWith('MOSQUITO'))
    );
    
    console.log('All mosquitoes destroyed?', allMosquitoesDestroyed);
    
    // Count mosquitoes for debugging
    let mosquitoCount = 0;
    buildings.forEach(building => {
      building.forEach(floor => {
        if (floor.type.startsWith('MOSQUITO')) {
          mosquitoCount++;
        }
      });
    });
    console.log('Mosquito count:', mosquitoCount);
    
    if (allMosquitoesDestroyed) {
      // If player won, set hasWon and pause the game
      set(() => ({ hasWon: true, gamePaused: true }));
      console.log('Game won and paused!');
    }
  },
  resetGame: () => {
    set((state) => ({
      buildings: [],
      waterDrops: new Map<string, IWaterDrop>(),
      explosions: new Map<string, IExplosion>(),
      cloud: true,
      hasWon: false,
      gamePaused: false,
      dropsLeft: state.maxDropsPerPass,
      cloudResetTrigger: state.cloudResetTrigger + 1 // Increment to trigger cloud position reset
    }));
  }
}));

function getRandomBuilding(
  difficulty: number,
  factor: number,
  images: GameImages,
): IFloor[] {
  // Randomly decide if this building should have a mosquito
  const hasMosquito = Math.random() < 0.3; // 30% chance for mosquito
  const roof = getRandomFloor(hasMosquito ? images.mosquitoes : images.roofs, factor);
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