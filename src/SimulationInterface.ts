import {ElementIdentifier} from "./Elements.ts";
import {Coordinate} from "./Utility/Traversal.ts";

type EventMap = Record<string, unknown>;
export type EventKey<T extends EventMap> = string & keyof T;
export type Handler<EventType> = (event: EventType) => void;

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

export interface SimulationInterface<TEvents extends EventMap = SimulationEvents> {
    on<TEventName extends EventKey<TEvents>>(eventName: TEventName, handler: Handler<TEvents[TEventName]>): void;

    off<TEventName extends EventKey<TEvents>>(eventName: TEventName, handler: Handler<TEvents[TEventName]>): void;

    emit<TEventName extends EventKey<TEvents>>(eventName: TEventName, event: TEvents[TEventName]): void;
}