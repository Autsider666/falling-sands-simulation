import {ElementIdentifier} from "./Elements.ts";
import {EventHandlerInterface} from "./Utility/Excalibur/Event/EventHandlerInterface.ts";
import {Coordinate} from "./Utility/Traversal.ts";

type ModifyParticlesEvent = {
    coordinate:Coordinate,
    element: ElementIdentifier,
    radius?: number,
    probability?: number,
    force?: boolean,
}

export type CreateParticlesEvent = ModifyParticlesEvent;
export type RemoveParticlesEvent = Omit<ModifyParticlesEvent, 'element'>;

export type SimulationEvents = {
    changeElement: ElementIdentifier,
    restart: undefined, //FIXME `on` can't handle unneeded event data yet
    start: undefined,
    stop: undefined,
    onFocus: undefined,
    offFocus: undefined,
    createParticles: CreateParticlesEvent,
    removeParticles: RemoveParticlesEvent,
};

export interface SimulationInterface extends EventHandlerInterface<SimulationEvents> {
}