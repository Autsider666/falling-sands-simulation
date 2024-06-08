import {Array2D} from "../../Utility/Array2D.ts";
import {Particle} from "../Particle/Particle.ts";

export type BaseBehaviourParams = Record<string, unknown>;

export abstract class Behavior<Params extends BaseBehaviourParams = BaseBehaviourParams> {
    constructor(public readonly owner: Particle) {
    }


    abstract update(particle: Particle, grid: Array2D<Particle>, params: Params): void;
}