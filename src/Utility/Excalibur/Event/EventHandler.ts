/**
 * Taken from Excalibur.js, because I couldn't use it in a worker.
 * https://github.com/excaliburjs/Excalibur/blob/main/src/engine/EventEmitter.ts
 */
import {EventEmitterInterface} from "./EventEmitterInterface.ts";
import {EventHandlerInterface} from "./EventHandlerInterface.ts";

export type EventMap = Record<string, unknown>;
export type EventKey<T extends EventMap> = string & keyof T;
export type Handler<EventType> = (event: EventType) => void;

/**
 * Interface that represents a handle to a subscription that can be closed
 */
export interface Subscription {
    close(): void;
}

type ListenerStore<TEventMap extends EventMap> = {
    [K in keyof TEventMap]?: Array<Handler<TEventMap[K]>>
}

/**
 * Excalibur's typed event emitter, this allows events to be sent with any string to Type mapping
 */
export class EventHandler<TEventMap extends EventMap> implements EventHandlerInterface<TEventMap>{
    private _paused = false;
    private _listeners: ListenerStore<TEventMap> = {};
    private _listenersOnce: ListenerStore<TEventMap> = {};
    private _pipes: EventEmitterInterface<TEventMap>[] = [];

    clear() {
        this._listeners = {};
        this._listenersOnce = {};
        this._pipes.length = 0;
    }

    on<TEventName extends EventKey<TEventMap>>(eventName: TEventName, handler: Handler<TEventMap[TEventName]>): Subscription {
        this._listeners[eventName] = this._listeners[eventName] ?? [];
        this._listeners[eventName]?.push(handler);
        return {
            close: () => this.off(eventName, handler)
        };
    }

    once<TEventName extends EventKey<TEventMap>>(eventName: TEventName, handler: Handler<TEventMap[TEventName]>): Subscription {
        this._listenersOnce[eventName] = this._listenersOnce[eventName] ?? [];
        this._listenersOnce[eventName]?.push(handler);
        return {
            close: () => this.off(eventName, handler)
        };
    }

    off<TEventName extends EventKey<TEventMap>>(eventName: TEventName, handler: Handler<TEventMap[TEventName]>): void {
        this._listeners[eventName] = this._listeners[eventName]?.filter((h) => h !== handler);

        this._listenersOnce[eventName] = this._listenersOnce[eventName]?.filter((h) => h !== handler);
    }

    emit<TEventName extends EventKey<TEventMap>>(eventName: TEventName, event: TEventMap[TEventName]): void {
        if (this._paused) {
            return;
        }

        this._listeners[eventName]?.forEach((fn) => fn(event));
        const onces = this._listenersOnce[eventName];
        this._listenersOnce[eventName] = [];
        if (onces) {
            onces.forEach((fn) => fn(event));
        }

        this._pipes.forEach((pipe) => {
            pipe.emit(eventName, event);
        });
    }

    pipe(emitter: EventEmitterInterface<TEventMap>): Subscription {
        if (this === emitter) {
            throw Error('Cannot pipe to self');
        }

        this._pipes.push(emitter);
        return {
            close: () => {
                const i = this._pipes.indexOf(emitter);
                if (i > -1) {
                    this._pipes.splice(i, 1);
                }
            }
        };
    }

    unpipe(emitter: EventEmitterInterface<TEventMap>): void {
        const i = this._pipes.indexOf(emitter);
        if (i > -1) {
            this._pipes.splice(i, 1);
        }
    }

    pause(): void {
        this._paused = true;
    }

    unpause(): void {
        this._paused = false;
    }
}