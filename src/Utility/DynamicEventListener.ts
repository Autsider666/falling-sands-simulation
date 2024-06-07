type EventCallback<T extends HTMLElement = HTMLElement> = (element: T) => void;

class DynamicEventListener {
  private readonly eventListeners = new Map<
    keyof HTMLElementEventMap,
    Map<EventCallback, string>
  >();

  register<T extends HTMLElement = HTMLElement>(
    selector: string,
    elementEvent: keyof HTMLElementEventMap,
    callback: EventCallback<T>,
  ): void {
    if (!this.eventListeners.has(elementEvent)) {
      document.body.addEventListener(elementEvent, (event) => {
        const eventListeners = this.eventListeners.get(elementEvent);
        if (eventListeners === undefined) {
          return;
        }

        for (const [callback, selector] of eventListeners) {
          const element = event.target as T;
          if (element.matches(selector)) {
            callback(element);
          }
        }
      });
      this.eventListeners.set(elementEvent, new Map());
    }

    const elementListeners = this.eventListeners.get(elementEvent);
    if (elementListeners === undefined) {
      throw new Error("Why?");
    }

    elementListeners.set(callback as EventCallback<HTMLElement>, selector);
  }
}

const instance = new DynamicEventListener();

export default instance;
