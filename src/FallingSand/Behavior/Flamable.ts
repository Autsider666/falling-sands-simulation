import {LimitedLife} from "./LimitedLife.ts";
import {Particle} from "../Particle/Particle.ts";
import {Smoke} from "../Particle/Smoke.ts";
import {Array2D} from "../../Utility/Array2D.ts";

type FlammableProps = {
    fuel?: number,
    burning?: boolean,
    chanceToCatch?: number,
    chanceToSpread?: (behavior:LimitedLife) => number,
    color?: string,
}

export class Flammable extends LimitedLife {
    static colors: string[] = [
        '#541e1e',
        '#ff9b03',
        '#ea5a00',
        '#ff6900',
        '#eecc09',
    ];

    private readonly originalColor?: string;
    private burning: boolean;
    private readonly burntColor: string;
    private readonly chanceToCatch: number;
    public chancesToCatch: number;
    private readonly chanceToSpread: (behavior:LimitedLife) => number;
    private readonly chanceToExtinguish: number;

    constructor(owner:Particle,{fuel, burning, chanceToCatch, chanceToSpread, color}: FlammableProps = {}) {
        fuel = fuel ?? 10 + 100 * (Math.random());
        super(
            owner,
            fuel,
            {
                onDeath: (_, particle, grid) => {
                    grid.setIndex(particle.index, new Smoke(particle.index, {burning: Math.random() < 0.1}));
                }
            }
        );
        this.originalColor = color;
        this.burning = burning ?? false;
        this.burntColor = color ? Particle.varyColor(color, {
            lightnessModifier: () => -10,
            saturationModifier: () => 0
        }) : '#00000000';
        this.chanceToCatch = chanceToCatch ?? 0;
        this.chancesToCatch = 0;
        this.chanceToSpread = chanceToSpread ?? (() => 1.0);
        this.chanceToExtinguish = 0.0;

        this.onTick = (behavior, particle) => {
            if (this.originalColor && Math.random() < 0.5) {
                particle.color = this.originalColor;
                return;
            }
            const colors = Flammable.colors;
            const frequency = Math.sqrt(behavior.lifetime / behavior.remainingLife);
            const period = frequency * colors.length;
            particle.color = colors[Math.floor(behavior.remainingLife / period) % colors.length];
        };
    }

    updateStep(particle:Particle, grid:Array2D<Particle>):void {
        // If it's not burning, do nothing
        if (!this.burning) { return; }
        const index = particle.index;

        const column = index % grid.width;
        const candidates = [];
        // Each of the 8 directions
        for (let dX = -1; dX <= 1; dX ++) {
            for (let dY = -1; dY <= 1; dY ++) {
                const dI = index + dX + dY * grid.width;
                const x = dI % grid.width;
                // Make sure it's in our grid
                const inBounds = dI >= 0 && dI < (grid.height * grid.height);
                // Make sure we didn't wrap to the next or previous row
                const noWrap = Math.abs(x - column) <= 1;
                if (inBounds && noWrap) {
                    candidates.push(dI);
                }
            }
        }

        candidates.forEach((i) => {
            const p = grid.getIndex(i);
            const flammable = p.getBehavior(Flammable);
            if (flammable) {
                flammable.chancesToCatch += 0.5 + Math.random() * 0.5;
            }
        });
    }

    update(particle:Particle, grid:Array2D<Particle>) {
        if (this.chancesToCatch > 0 && !this.burning) {
            if (Math.random() < this.chanceToSpread(this) * (this.chancesToCatch * this.chanceToCatch)) {
                this.burning = true;
            }
            this.chancesToCatch = 0;
        }
        if (this.burning) {
            super.update(particle, grid);
        } else if (this.remainingLife < this.lifetime) {
            if (particle.color !== this.burntColor) {
                grid.changedIndexes.add(particle.index);
            }
            particle.color = this.burntColor;
        }

        if (this.burning && Math.random() < this.chanceToExtinguish) {
            this.burning = false;
        }

        this.updateStep(particle, grid);
    }
}