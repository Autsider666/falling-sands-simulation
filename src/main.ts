import './style.css';
import {Color, Engine} from "excalibur";
import {World} from "./FallingSand/World.ts";
import DynamicEventListener from "./Utility/DynamicEventListener.ts";
import {Sand} from "./FallingSand/Particle/Sand.ts";
import {Air} from "./FallingSand/Particle/Air.ts";

const worldWidth = 200;
const worldHeight = 100;
const particleSize = 5;

const game = new Engine({
    width: worldWidth * particleSize,
    height: worldHeight * particleSize,
    maxFps: 60,
    backgroundColor: Color.Transparent,
});

await game.start();

const world = new World(worldHeight, worldWidth, particleSize);

game.add(world);

DynamicEventListener.register('button#clear','click', () => world.clear());
DynamicEventListener.register('button#play','click', () => world.setSimulationSpeed(1));
DynamicEventListener.register('button#pause','click', () => world.setSimulationSpeed(0));
DynamicEventListener.register('button#toggle-wraparound','click', () => world.toggleDimensionalWraparound());
DynamicEventListener.register('button#sand','click', () => world.setCurrentParticle(Sand));
DynamicEventListener.register('button#air','click', () => world.setCurrentParticle(Air));
