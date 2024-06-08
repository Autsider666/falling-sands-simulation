import {CellularMatrix} from "../../Cellular/CellularMatrix.ts";
import {Behavior} from "./Behavior";
import {Particle} from "../Particle/Particle.ts";

type onTick = (behavior: LimitedLife, particle: Particle) => void
type OnDeath = (behavior: LimitedLife, particle: Particle, matrix: CellularMatrix) => void

type Props = {
    onTick?: onTick,
    onDeath?: OnDeath,
}

export class LimitedLife extends Behavior {
    protected onTick: onTick;
    protected onDeath: OnDeath;
    public remainingLife: number;

    constructor(
        owner:Particle,
        public readonly lifetime: number,
        {onTick, onDeath}: Props = {},
    ) {
        super(owner);
        this.remainingLife = this.lifetime;
        this.onTick = onTick ?? (() => {
        });
        this.onDeath = onDeath ?? ((_, particle, matrix) => {
            matrix.clearIndex(particle.index);
        });
    }

    update(particle: Particle, matrix: CellularMatrix): void {
        if (this.remainingLife <= 0) {
            this.onDeath(this, particle, matrix);
        } else {
            this.remainingLife = Math.floor(this.remainingLife - 1);
        }

        this.onTick(this, particle);
        matrix.changedIndexes.add(particle.index);
    }
}
