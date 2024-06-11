import {ElementIdentifier, Elements} from "../../Elements.ts";
import {SimulationInterface} from "../../SimulationInterface.ts";
import DynamicEventListener from "../../Utility/DynamicEventListener.ts";
import {StringHelper} from "../../Utility/StringHelper.ts";

export class WorldUIManager {
    private readonly elementButtons = new Map<ElementIdentifier, HTMLButtonElement>();
    private readonly menuElement: HTMLDivElement;

    constructor(
        private readonly simulation: SimulationInterface,
        gameCanvas:HTMLCanvasElement,
        defaultElement: ElementIdentifier,
    ) {
        const menuElement = document.querySelector<HTMLDivElement>('div#menu');
        if (!menuElement) {
            throw new Error('Why no menu?');
        }

        this.menuElement = menuElement;


        this.updateMenu(defaultElement);

        DynamicEventListener.register('button#clear', 'click', () => this.simulation.emit('restart',undefined));
        DynamicEventListener.register('button#play', 'click', () => this.simulation.emit('start',undefined));
        DynamicEventListener.register('button#pause', 'click', () => this.simulation.emit('stop',undefined));

        gameCanvas.addEventListener('pointerenter', () => this.simulation.emit('onFocus',undefined));
        gameCanvas.addEventListener('pointerleave', () => this.simulation.emit('offFocus',undefined));


    }

    private updateMenu(activeElement?:ElementIdentifier): void {
        this.menuElement.innerHTML = '';

        for (const name of Object.keys(Elements) as ElementIdentifier[]) {
            const {color, canDraw} = Elements[name];
            if (canDraw === false) {
                continue;
            }

            let button = this.elementButtons.get(name);
            if (button === undefined) {
                const className = StringHelper.toClassName(name);
                button = document.createElement<'button'>('button', {});
                button.innerText = name;
                button.classList.add(className);
                button.style.background = color;

                this.elementButtons.set(name, button);

                DynamicEventListener.register(`button.${className}`, 'click', () => this.setActiveElement(name));
            }

            if (name === activeElement) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }

            this.menuElement.append(button);
        }
    }

    private setActiveElement(element: ElementIdentifier): void {
        const className = StringHelper.toClassName(element);
        for (const button of this.elementButtons.values()) {
            if (button.classList.contains(className)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }

        this.simulation.emit('changeElement', element);
    }
}