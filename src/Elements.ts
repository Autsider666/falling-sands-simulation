export type ColorVarianceConfig = { min: number, max: number } | { value: number }

export type ColorVariance = {
    hue?: ColorVarianceConfig,
    saturation?: ColorVarianceConfig,
    lightness?: ColorVarianceConfig,
    alpha?: ColorVarianceConfig,
};

export interface ElementData {
    color: HexColor,
    colorVariance?: ColorVariance | false
    canDraw?: boolean,
    drawProbability?:number,
    density?: number,
    maxSpeed?: number,
    acceleration?: number,
    velocity?: number,
    duration?: number|(()=>number),
    fluidity?: number,
    burning?: boolean,
    fireSpreadSpeedModifier?: number,
    fuel?: number|(()=>number),
    chanceToIgnite?:number,
}

export type HexColor = `#${string}`;

type ElementMap = {
    Smoke: ElementData,
    Fire: ElementData,
    [key: string]: ElementData
};

export type ElementIdentifier = keyof typeof elements;

const elements = {
    Sand: {
        color: '#dcb159',
        density: 150,
        maxSpeed: 8,
        acceleration: 0.4,
        drawProbability: 0.5,
    },
    Fire: {
        color: '#e34f0f',
        burning: true,
    },
    "Liquid Fire": {
        color: '#E35D23B2',
        burning: true,
        density: 10,
        maxSpeed: 8,
        acceleration: 0.4,
        fluidity: 1, //FIXME
    },
    Oil: { //Should probably be an emitter of burnable fumes
      color: '#3B3131',
        fuel: () => 500 + 500 * Math.random(),
        chanceToIgnite: 0.025,
        density: 25,
        maxSpeed: 8,
        acceleration: 0.4,
        fluidity: 1, //FIXME
    },
    Smoke: {
        color: '#4C4A4D',
        colorVariance: {
            lightness: {min: -5, max: 5},
            saturation: {min: -5, max: 0}
        },
        canDraw: false,
        density: 1,
        maxSpeed: 0.25,
        acceleration: -0.05,
        duration: () => 400 + 400 * Math.random(),
        fireSpreadSpeedModifier: 0.5,
        drawProbability: 0.25,
    },
    Wood: {
        color: '#46281d',
        density: 500,
        fuel: () => 200 + 100 * Math.random(),
        chanceToIgnite: 0.005,
    },
    Stone: {
        color: '#8f8d8e',
        density: 500,
    },
    Water: {
        color: '#28A5EE',
        colorVariance: {
            lightness: {value: 0}
        },
        density: 100,
        maxSpeed: 8,
        acceleration: 0.4,
        fluidity: 1, //FIXME
    }
} as const satisfies ElementMap;

export const Elements: Record<ElementIdentifier, ElementData> = elements satisfies Record<ElementIdentifier, ElementData>;