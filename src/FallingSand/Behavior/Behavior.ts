import {CellularMatrix} from "../../Cellular/CellularMatrix.ts";
import {Particle} from "../Particle/Particle.ts";

export type BaseBehaviourParams = Record<string, unknown>;

export abstract class Behavior<Params extends BaseBehaviourParams = BaseBehaviourParams> {
    constructor(public readonly owner: Particle) {
    }


    abstract update(particle: Particle, matrix: CellularMatrix, params: Params): void;
}