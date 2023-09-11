import React, { useEffect, useRef, useState } from 'react';
import images from './../assets/images';

export const GameImagesContext = React.createContext<GameImages>({} as any);

export function ImagesProvider({ children }: { children: JSX.Element }) {
  const images = useRef<GameImages>({} as any);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded === false) {
      (async () => {
        images.current = await Images();
        setLoaded(true);
      })();
    }
  },[loaded]);
  return (
    <GameImagesContext.Provider value={images.current}>
      {loaded && children}
    </GameImagesContext.Provider>
  );
}

type ImagesSet = { [key: string]: HTMLImageElement };

export type GameImages = {
  roofs: ImagesSet;
  floors: ImagesSet;
  basements: ImagesSet;
  planes: ImagesSet;
  greens: ImagesSet;
  explosions: ImagesSet;
  drops: ImagesSet;
};

async function Images(): Promise<GameImages> {
  const roofs = await loadRoofs();
  const floors = await loadFloors();
  const basements = await loadBasements();
  const planes = await loadPlanes();
  const greens = await loadGreenBuildings();
  const explosions = await loadExplosions();
  const drops = await loadDrops();

  async function loadRoofs() {
    return {
      FLOOR_ROOF_A: await loadImage(images.ic_floor_roof_type_a),
      // FLOOR_ROOF_B: await loadImage(images.ic_floor_roof_type_b),
      // FLOOR_ROOF_C: await loadImage(images.ic_floor_roof_type_c),
      // FLOOR_ROOF_D: await loadImage(images.ic_floor_roof_type_d),
      FLOOR_ROOF_E: await loadImage(images.ic_floor_roof_type_e),
      FLOOR_ROOF_F: await loadImage(images.ic_floor_roof_type_f),
      FLOOR_ROOF_G: await loadImage(images.ic_floor_roof_type_g),
      FLOOR_ROOF_H: await loadImage(images.ic_floor_roof_type_h),
      FLOOR_ROOF_I: await loadImage(images.ic_floor_roof_type_i),
    };
  }

  async function loadFloors() {
    return {
      FLOOR_A: await loadImage(images.ic_floor_type_a),
      FLOOR_B: await loadImage(images.ic_floor_type_b),
      FLOOR_C: await loadImage(images.ic_floor_type_c),
      FLOOR_D: await loadImage(images.ic_floor_type_d),
    };
  }

  async function loadBasements() {
    return {
      FLOOR_BASEMENT_A: await loadImage(images.ic_floor_basement_type_a),
      FLOOR_BASEMENT_B: await loadImage(images.ic_floor_basement_type_b),
      FLOOR_BASEMENT_C: await loadImage(images.ic_floor_basement_type_c),
      FLOOR_BASEMENT_D: await loadImage(images.ic_floor_basement_type_d),
      FLOOR_BASEMENT_E: await loadImage(images.ic_floor_basement_type_e),
    };
  }

  async function loadPlanes() {
    return {
      // PLANE_A: await loadImage(images.ic_plane_type_a),
      PLANE_B: await loadImage(images.ic_plane_type_b),
      // PLANE_C: await loadImage(images.ic_plane_type_c),
    };
  }

  async function loadGreenBuildings() {
    return {
      GREEN_A: await loadImage(images.ic_green_church),
      GREEN_B: await loadImage(images.ic_green_hospital),
      GREEN_C: await loadImage(images.ic_green_school),
    };
  }

  async function loadExplosions() {
    return {
      EXPLOSION_1: await loadImage(images.ic_explosion_1),
      EXPLOSION_2: await loadImage(images.ic_explosion_2),
      EXPLOSION_3: await loadImage(images.ic_explosion_3),
    };
  }

  async function loadDrops() {
    return {
      DROP_1: await loadImage(images.ic_drop_1),
      DROP_2: await loadImage(images.ic_drop_2),
      DROP_3: await loadImage(images.ic_drop_3),
    };
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = function() {
        resolve(image);
      };
      image.src = src;
    });
  }

  return { roofs, floors, basements, planes, greens, explosions, drops };
}