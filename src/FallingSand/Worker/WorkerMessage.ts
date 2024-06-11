import {EventKey, EventMap} from "../../Utility/Excalibur/Event/EventHandler.ts";
import {Coordinate} from "../../Utility/Traversal.ts";

export type WorkerMessage = {
    init: {
        canvas: OffscreenCanvas,
        particleSize:number,
        worldWidth:number,
        worldHeight:number,
    },
    start: undefined,
    stop: undefined,
    create: Coordinate,
}

export type MessageMap<TMessages extends WorkerMessage = WorkerMessage> = {
    [K in keyof TMessages]?: TMessages[K]
}

export type MessageFormat<TMessages extends EventMap = WorkerMessage> = {
    type: EventKey<TMessages>,
    data: TMessages[EventKey<TMessages>],
}

export type MessageIdentifier<TMessages extends EventMap = WorkerMessage> = keyof TMessages;