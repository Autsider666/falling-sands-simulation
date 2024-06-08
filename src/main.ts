import './style.css';
import {Color, Engine} from "excalibur";
import {ElementIdentifier, Elements} from "./Elements.ts";
import {World} from "./FallingSand/World.ts";
import DynamicEventListener from "./Utility/DynamicEventListener.ts";

const worldWidth = 350;
const worldHeight = 250;
const particleSize = 3;

const game = new Engine({
    width: worldWidth * particleSize,
    height: worldHeight * particleSize,
    maxFps: 40,
    backgroundColor: Color.Transparent,
});

await game.start();

let selectedElement: ElementIdentifier = 'Sand';
const elementButtons = new Map<ElementIdentifier, HTMLButtonElement>();

function setActiveElement(name: ElementIdentifier, force: boolean = false): void {
    if (name === selectedElement && !force) {
        return;
    }

    elementButtons.get(selectedElement)?.classList.remove('active');
    elementButtons.get(name)?.classList.add('active');
    selectedElement = name;

    world.setCurrentParticle(name);
}

const world = new World(worldHeight, worldWidth, particleSize, selectedElement);

game.add(world);

const menu = document.getElementById('menu');
if (!menu) {
    throw new Error('Why no menu?');
}

for (const name of Object.keys(Elements) as ElementIdentifier[]) {
    const {color, canDraw} = Elements[name];
    if (canDraw === false) {
        continue;
    }

    const button = document.createElement<'button'>('button', {});
    button.innerText = name;
    button.id = name;
    button.style.background = color;

    menu.append(button);

    elementButtons.set(name, button);

    DynamicEventListener.register(`button#${name}`, 'click', () => setActiveElement(name));
}

setActiveElement(selectedElement, true);

DynamicEventListener.register('button#clear', 'click', () => world.clear());
DynamicEventListener.register('button#play', 'click', () => world.setSimulationSpeed(1));
DynamicEventListener.register('button#pause', 'click', () => world.setSimulationSpeed(0));
DynamicEventListener.register('button#toggle-wraparound', 'click', () => world.toggleDimensionalWraparound());
