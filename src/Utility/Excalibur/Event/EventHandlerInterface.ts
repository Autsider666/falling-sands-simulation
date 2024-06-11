import {EventMap} from "./EventHandler.ts";
import {EventEmitterInterface} from "./EventEmitterInterface.ts";
import {EventListenerInterface} from "./EventListenerInterface.ts";

export interface EventHandlerInterface<TEvents extends EventMap> extends EventListenerInterface<TEvents>, EventEmitterInterface<TEvents> {
}