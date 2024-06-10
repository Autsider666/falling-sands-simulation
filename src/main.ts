import './style.css';
import {Color, Engine} from "excalibur";
import {ElementIdentifier, Elements} from "./Elements.ts";
import {World} from "./FallingSand/World.ts";
import {WorldInputManager} from "./FallingSand/WorldInputManager.ts";
import dynamicEventListener from "./Utility/DynamicEventListener.ts";
import DynamicEventListener from "./Utility/DynamicEventListener.ts";
import {StringHelper} from "./Utility/StringHelper.ts";
import {URLParams} from "./Utility/URLParams.ts";


const screenWidth = Math.min(window.innerWidth);
const screenHeight = Math.min(window.innerHeight);

const particleSize = Math.max(URLParams.get('particleSize','number') ?? 4, 1);
const worldWidth = Math.round(screenWidth / particleSize);
const worldHeight = Math.round(screenHeight / particleSize);

// const portrait = window.matchMedia("(orientation: portrait)"); //TODO let's translate matrix on mobile phone turn
// portrait.addEventListener("change", function(e) {
//     console.log(e);
// });

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

    pointer.changeElement(name);
}

const world = new World(worldHeight, worldWidth, particleSize);

game.add(world);

const pointer = new WorldInputManager(world, selectedElement, particleSize);
game.add(pointer);

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
    button.id = StringHelper.toClassName(name);
    button.style.background = color;

    menu.append(button);

    elementButtons.set(name, button);

    DynamicEventListener.register(`button#${StringHelper.toClassName(name)}`, 'click', () => setActiveElement(name));
}

setActiveElement(selectedElement, true);
DynamicEventListener.register('button#clear', 'click', () => world.clear());
DynamicEventListener.register('button#play', 'click', () => world.setSimulationSpeed(1));
DynamicEventListener.register('button#pause', 'click', () => world.setSimulationSpeed(0));
DynamicEventListener.register('button#toggle-wraparound', 'click', () => world.toggleDimensionalWraparound());

dynamicEventListener.register('#menu, #menu button', 'mouseover', () => pointer.toggleVisible(false));
dynamicEventListener.register('canvas', 'mouseover', () => pointer.toggleVisible(true));
dynamicEventListener.register('#menu, #menu button', 'mouseleave', () => pointer.toggleVisible(true));
