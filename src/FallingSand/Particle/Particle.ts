import {Random} from "excalibur";
import {CellularMatrix} from "../../Cellular/CellularMatrix.ts";
import {ColorVariance} from "../../Elements.ts";
import {BaseBehaviourParams, Behavior} from "../Behavior/Behavior.ts";
import {Constructor} from "../../Utility/Type.ts";

const random = new Random();
const randomByConfig = ({value, min, max}: { value?: number, min?: number, max?: number }): number => {
    if (value !== undefined) {
        return value;
    }

    return random.integer(min ?? 0, max ?? 0);
};

type ParticleProps = {
    density?: number,
    behaviors?: Behavior[],
    maxSpeed?: number,
    acceleration?: number,
    velocity?: number,
}

export abstract class Particle {
    public readonly density: number;
    private readonly behaviors: Map<Constructor<Behavior>, Behavior>;
    public dirty: boolean = false;

    public maxSpeed: number;
    public acceleration: number;
    public velocity: number;

    protected constructor(
        private currentIndex: number,
        public color: string,
        {density, behaviors, maxSpeed, acceleration, velocity}: ParticleProps = {},
    ) {
        this.density = density ?? 0;
        this.maxSpeed = maxSpeed ?? 0;
        this.acceleration = acceleration ?? 0;
        this.velocity = velocity ?? 0;
        this.behaviors = new Map<Constructor<Behavior>, Behavior>();
        this.addBehaviors(behaviors ?? []);
    }

    get index(): number {
        return this.currentIndex;
    }

    set index(index: number) {
        this.currentIndex = index;
    }

    abstract get baseColor(): string;

    addBehaviour(behaviour: Behavior): void {
        this.behaviors.set(behaviour.constructor as Constructor<Behavior>, behaviour);
    }

    addBehaviors(behaviors: Behavior[]): void {
        behaviors.forEach(behavior => this.addBehaviour(behavior));
    }

    update(matrix: CellularMatrix, params: BaseBehaviourParams) {
        for (const behavior of this.behaviors.values()) {
            behavior.update(this, matrix, params);
        }

        if (!this.dirty) {
            return;
        }

        matrix.changedIndexes.add(this.index);
        this.dirty = false;
    }

    getBehavior<B extends Behavior>(type: Constructor<B>): B | undefined {
        // @ts-expect-error I'll fix it later
        return this.behaviors.get(type) as B | unknown; //FIXME
    }

    static varyColor(color: string, {
        hue: hueModifier = {value: 0},
        saturation: saturationModifier = {min: -20, max: 0},
        lightness: lightnessModifier = {min: -10, max: 0}, //TODO Switch to min/max config
        alpha: alphaModifier = {value: 0}, //TODO Switch to min/max config
    }: ColorVariance = {}): string { //TODO move
        const {h, s, l, a} = this.toHSLA(color);
        const hue = Math.floor(h * 360) + randomByConfig(hueModifier);
        let saturation = (s * 100) + randomByConfig(saturationModifier);
        saturation = Math.max(0, Math.min(100, saturation));
        let lightness = (l * 100) + randomByConfig(lightnessModifier);
        lightness = Math.max(0, Math.min(100, lightness));
        const alpha = Math.min(Math.max(a + randomByConfig(alphaModifier), 0), 1);
        return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha.toFixed(1)})`;
    }

    protected static toHSLA(color: string): { h: number, s: number, l: number, a: number } { //TODO move
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
        if (!result) {
            throw new Error('Invalid color hex: ' + color);
        }

        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);
        let a = parseInt(result[4] ?? 0, 16);
        r /= 255;
        g /= 255;
        b /= 255;
        a /= 255;
        if (a === 0) {
            a = 1;
        }

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;

        return {h, s, l, a};
    }
}