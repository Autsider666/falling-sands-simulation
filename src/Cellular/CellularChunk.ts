import {BoundingBox} from "excalibur";
import {Particle} from "../FallingSand/Particle/Particle.ts";

export class CellularChunk {
    private shouldUpdate: boolean = true;
    private shouldUpdateNextFrame: boolean = true;
    private particles: Set<Particle> = new Set<Particle>();

    constructor(
        // private readonly matrix: CellularMatrix,
        public readonly bounds: BoundingBox,
    ) {
    }

    addParticle(particle: Particle): void {
        this.particles.add(particle);
    }

    removeParticle(particle: Particle): void {
        this.particles.delete(particle);
    }

    hasParticle(particle: Particle): boolean {
        return this.particles.has(particle);
    }

    getShouldUpdateNextFrame(): boolean {
        return this.shouldUpdateNextFrame;
    }

    setShouldUpdateNextFrame(value: boolean) {
        this.shouldUpdateNextFrame = value;
    }

    getShouldUpdate(): boolean {
        return this.shouldUpdate;
    }

    setShouldUpdate(value: boolean) {
        this.shouldUpdate = value;
    }

    shiftShouldUpdateAndReset(): void {
        this.shouldUpdate = this.shouldUpdateNextFrame;
        this.shouldUpdateNextFrame = false;
    }
}