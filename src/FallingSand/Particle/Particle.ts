import {Random} from "excalibur";
import {BaseBehaviourParams, Behavior} from "../Behavior/Behavior.ts";
import {Array2D} from "../../Utility/Array2D.ts";

const random = new Random();

type ParticleProps = {
    empty?: boolean,
    airy?: boolean,
    behaviours?: Behavior[],
}

export abstract class Particle {
    public readonly empty: boolean;
    public readonly airy: boolean;
    private readonly behaviors: Behavior[];
    private readonly behaviorsLookup: Record<string, Behavior>;
    public dirty: boolean = false;

    protected constructor(
        public index: number,
        public readonly color: string,
        {empty, behaviours, airy}: ParticleProps = {},
    ) {
        this.empty = empty ?? false;
        this.airy = airy ?? false;
        this.behaviors = behaviours ?? [];
        this.behaviorsLookup = Object.fromEntries(
            this.behaviors.map(
                (b) => [b.constructor.name, b]
            )
        );
    }

    abstract get baseColor(): string;

    update(grid:Array2D<Particle>,params:BaseBehaviourParams = {}) {
        this.behaviors.forEach(
            behaviour => behaviour.update(this, grid, params)
        );
    }

    getBehavior(type:string):Behavior|undefined {
        return this.behaviorsLookup[type];
    }

    static varyColor(color: string): string { //TODO move
        const {h, s, l, a} = this.toHSLA(color);
        const hue = Math.floor(h * 360);
        let saturation = (s * 100) + random.integer(-20, 0);
        saturation = Math.max(0, Math.min(100, saturation));
        let lightness = (l * 100) + random.integer(-10, 10);
        lightness = Math.max(0, Math.min(100, lightness));
        return `hsla(${hue}, ${saturation}%, ${lightness}%, ${a.toFixed(1)})`;
    }

    protected static toHSLA(color: string): { h: number, s: number, l: number, a:number } { //TODO move
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
        if (!result) {
            throw new Error('Invalid color hex: ' + color);
        }

        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);
        let a = parseInt(result[4]??0, 16);
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