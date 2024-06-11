import {EventKey, EventMap} from "./EventHandler.ts";

export interface EventEmitterInterface<TEvents extends EventMap> {
    emit<TEventName extends EventKey<TEvents>>(eventName: TEventName, event: TEvents[TEventName]): void;
    pipe(emitter: EventEmitterInterface<TEvents>) :void;
}