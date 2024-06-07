import './style.css';
import {Color, Engine} from "excalibur";
import {World} from "./FallingSand/World.ts";
import DynamicEventListener from "./Utility/DynamicEventListener.ts";
import {Sand} from "./FallingSand/Particle/Sand.ts";
import {Air} from "./FallingSand/Particle/Air.ts";
import {Wood} from "./FallingSand/Particle/Wood.ts";
import {Water} from "./FallingSand/Particle/Water.ts";
import {Smoke} from "./FallingSand/Particle/Smoke.ts";
import {Fire} from "./FallingSand/Particle/Fire.ts";

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

const world = new World(worldHeight, worldWidth, particleSize);

game.add(world);

DynamicEventListener.register('button#clear','click', () => world.clear());
DynamicEventListener.register('button#play','click', () => world.setSimulationSpeed(1));
DynamicEventListener.register('button#pause','click', () => world.setSimulationSpeed(0));
DynamicEventListener.register('button#toggle-wraparound','click', () => world.toggleDimensionalWraparound());
DynamicEventListener.register('button#sand','click', () => world.setCurrentParticle(Sand));
DynamicEventListener.register('button#wood','click', () => world.setCurrentParticle(Wood));
DynamicEventListener.register('button#water','click', () => world.setCurrentParticle(Water));
DynamicEventListener.register('button#smoke','click', () => world.setCurrentParticle(Smoke));
DynamicEventListener.register('button#fire','click', () => world.setCurrentParticle(Fire));
DynamicEventListener.register('button#air','click', () => world.setCurrentParticle(Air));
