import './style.css';
import {Color, Engine} from "excalibur";
import {World} from "./FallingSand/World.ts";

const worldWidth = 200;
const worldHeight = 100;
const particleSize = 5;

const game = new Engine({
    width: worldWidth * particleSize,
    height: worldHeight * particleSize,
    maxFps: 60,
    backgroundColor: Color.Transparent,
    // displayMode: DisplayMode.FitScreenAndFill
});

await game.start();

const world = new World(worldHeight, worldWidth, particleSize);

game.add(world);

// const maxX = width / particleSize;
// const maxY = height / particleSize;

// let grid = new Map2D<number>();
//
// const canvas = new Canvas({
//     width,
//     height,
//     cache: true,
//     draw: (ctx: CanvasRenderingContext2D) => {
//         ctx.fillStyle = "black";
//         ctx.fillRect(0, 0, width, height);
//
//         for (let x = 0; x < maxX; x++) {
//             for (let y = 0; y < maxY; y++) {
//                 if (grid.get(x, y) !== 1) {
//                     continue;
//                 }
//                     ctx.fillStyle = "white";
//
//                 ctx.fillRect(x * particleSize, y * particleSize, particleSize, particleSize);
//             }
//         }
//     }
// });
//
// const actor = new Actor({pos: game.screen.center});
// actor.graphics.use(canvas);
//
// const random = new Random();
//
// function calculateNextGrid(grid: Map2D<number>, maxX: number, maxY: number): Map2D<number> {
//     const nextGrid = new Map2D<number>();
//     for (let x = 0; x < maxX; x++) {
//         for (let y = 0; y < maxY; y++) {
//             const value = grid.get(x, y);
//             if (value !== 1) {
//                 continue;
//             }
//
//             if ((y + 1) === maxY) {
//                 nextGrid.set(x, y, value);
//                 continue;
//             }
//
//             const below = grid.get(x, y + 1);
//             if (below !== 1) {
//                 nextGrid.set(x, y + 1, value);
//                 continue;
//             }
//
//             const dir = random.bool() ? -1 : 1;
//             const dirPrimary = x + dir;
//             const dirSecondary = x - dir;
//             if (dirPrimary >= 0 && dirPrimary < maxX && grid.get(dirPrimary, y + 1) !== 1) {
//                 nextGrid.set(dirPrimary, y + 1, value);
//             } else if (dirSecondary >= 0 && dirSecondary < maxX && grid.get(dirSecondary, y + 1) !== 1) {
//                 nextGrid.set(dirSecondary, y + 1, value);
//             } else {
//                 nextGrid.set(x, y, value);
//             }
//         }
//     }
//
//     return nextGrid;
// }
//
// actor.on<'preupdate'>('preupdate', () => {
//     if (drawing) {
//         draw(game.input.pointers.primary.lastWorldPos);
//     }
//
//     grid = calculateNextGrid(grid, maxX, maxY);
//     canvas.flagDirty();
// });
//
// let drawing: boolean = false;
//
//
// const draw = (pos: Vector) => {
//     const x = Math.floor(pos.x / particleSize);
//     const y = Math.floor(pos.y / particleSize);
//     grid.set(x, y, 1);
// };
//
// actor.on<'pointerdown'>('pointerdown', () => drawing = true);
// actor.on<'pointerup'>('pointerup', () => drawing = false);
//
// game.add(actor);