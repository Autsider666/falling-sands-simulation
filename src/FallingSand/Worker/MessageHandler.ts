import { EventEmitterInterface } from "../../Utility/Excalibur/Event/EventEmitterInterface.ts";
import {EventHandler, EventKey, EventMap, Handler} from "../../Utility/Excalibur/Event/EventHandler.ts";
import {EventHandlerInterface} from "../../Utility/Excalibur/Event/EventHandlerInterface.ts";
import {MessageFormat, MessageIdentifier} from "./WorkerMessage.ts";

export class MessageHandler<TMessages extends EventMap> implements EventHandlerInterface<TMessages> {
    private readonly events = new EventHandler<TMessages>();
    private readonly worker?: Worker;

    constructor(worker?: Worker) {
        // @ts-expect-error No clue why PhpStorm doesn't understand the scopes
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            self.onmessage = (message: MessageEvent<MessageFormat<TMessages>>) => {
                if (typeof message !== 'object') {
                    console.error('Invalid message received:', message);
                    return;
                }

                const messageData = message.data;
                if (messageData === undefined) {
                    console.error('Invalid message received', message);
                    return;
                }

                const type = messageData.type satisfies MessageIdentifier<TMessages>;
                // noinspection SuspiciousTypeOfGuard
                if (typeof type !== 'string') {
                    console.error('Message does not contain a type:', message); //TODO
                    return;
                }

                this.handle(type, messageData.data);
            };
        } else {
            this.worker = worker;
        }
    }

    handle<TMessageIdentifier extends EventKey<TMessages>>(
        type: TMessageIdentifier,
        data: TMessages[TMessageIdentifier]
    ): void {
        this.events.emit(type, data);
    }

    emit<TMessageIdentifier extends EventKey<TMessages>>(
        type: TMessageIdentifier,
        data: TMessages[TMessageIdentifier],
        transferables: Transferable[] = [],
    ): void {
        this.worker?.postMessage({type, data}, transferables);
    }

    on<TEventName extends EventKey<TMessages>>(eventName: TEventName, handler: Handler<TMessages[TEventName]>): void {
        this.events.on(eventName, handler);
    }

    off<TEventName extends EventKey<TMessages>>(eventName: TEventName, handler: Handler<TMessages[TEventName]>): void {
        this.events.off(eventName, handler);
    }

    pipe(emitter: EventEmitterInterface<TMessages>): void {
        this.events.pipe(emitter);
    }
}