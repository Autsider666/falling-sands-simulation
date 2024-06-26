import {CellularMatrix} from "../../Cellular/CellularMatrix.ts";
import {LimitedLife} from "./LimitedLife.ts";
import {Particle} from "../Particle/Particle.ts";
import {Element} from "../Particle/Element.ts";

type FlammableProps = {
    fuel?: number,
    burning?: boolean,
    chanceToIgnite?: number,
    chanceToSpread?: (behavior: LimitedLife) => number,
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
    private readonly chanceToIgnite: number;
    public chancesToCatch: number;
    private readonly chanceToSpread: (behavior: LimitedLife) => number;
    private readonly chanceToExtinguish: number;

    constructor(owner: Particle, {fuel, burning, chanceToIgnite, chanceToSpread, color}: FlammableProps = {}) {
        fuel = fuel ?? 10 + 100 * (Math.random());
        super(
            owner,
            fuel,
            {
                onDeath: (_, particle, grid) => {
                    // grid.setIndex(particle.index, new Smoke(particle.index, {burning: Math.random() < 0.1})); //TODO add burning to config
                    grid.setIndex(particle.index, Element.create(particle.index, 'Smoke', {burning: Math.random() < 0.1}));
                }
            }
        );
        this.originalColor = color;
        this.burning = burning ?? false;
        this.burntColor = color ? Particle.varyColor(color, {
            lightness: {value: -10},
            saturation: {value: 0},
        }) : '#00000000';
        this.chanceToIgnite = chanceToIgnite ?? 0;
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

    updateStep(particle: Particle, matrix: CellularMatrix): void {
        // If it's not burning, do nothing
        if (!this.burning) {
            return;
        }

        const index = particle.index;

        const column = index % matrix.width;
        // const candidates = [];
        // Each of the 8 directions
        for (let dX = -1; dX <= 1; dX++) {
            for (let dY = -1; dY <= 1; dY++) {
                const dI = index + dX + dY * matrix.width;
                const x = dI % matrix.width;
                // Make sure it's in our matrix
                const inBounds = dI >= 0 && dI < matrix.length;
                // Make sure we didn't wrap to the next or previous row
                const noWrap = Math.abs(x - column) <= 1;
                if (!inBounds || !noWrap) {
                    continue;
                }

                // candidates.push(dI);
                const candidateParticle = matrix.getIndex(dI);
                if (!candidateParticle) {
                    continue;
                }

                const flammable = candidateParticle.getBehavior(Flammable);
                if (flammable) {
                    flammable.chancesToCatch += 0.5 + Math.random() * 0.5;
                    candidateParticle.dirty = true; //TODO does this really help?
                    matrix.changedIndexes.add(dI);
                }

            }
        }

        // for (const i of candidates) { //TODO check if this change is actually more/less performant
        //     const candidateParticle = matrix.getIndex(i);
        //     if (!candidateParticle) {
        //         continue;
        //     }
        //     console.log(candidateParticle);
        //     const flammable = candidateParticle.getBehavior(Flammable);
        //     if (flammable) {
        //         flammable.chancesToCatch += 0.5 + Math.random() * 0.5;
        //     }
        // }
    }

    update(particle: Particle, matrix: CellularMatrix): void {
        let dirty = false;
        if (this.chancesToCatch > 0 && !this.burning) {
            if (Math.random() < this.chanceToSpread(this) * (this.chancesToCatch * this.chanceToIgnite)) {
                this.burning = true;
            }
            this.chancesToCatch = 0;
            dirty = true;
        }
        if (this.burning) {
            super.update(particle, matrix);
        } else if (this.remainingLife < this.lifetime) {
            if (particle.color !== this.burntColor) {
                matrix.changedIndexes.add(particle.index);
            }
            particle.color = this.burntColor;
            dirty = true;
        }

        if (this.burning && Math.random() < this.chanceToExtinguish) {
            this.burning = false;
        }

        this.updateStep(particle, matrix);

        if (dirty) {
            this.owner.dirty = true;
        }
    }

    get isBurning(): boolean { //TODO just for now, but replace soon
        return this.burning;
    }
}