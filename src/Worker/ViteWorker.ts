import {CellularMatrix} from "../Cellular/CellularMatrix.ts";

const matrix = new CellularMatrix(100,100);

postMessage(matrix.length.toString());