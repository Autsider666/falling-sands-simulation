export type Coordinate = { x: number, y: number };

export class Traversal {
    static iterateBetweenTwoCoordinates(
        start: Coordinate,
        end: Coordinate,
        callback: (step: Coordinate) => void,
        isWithingBounds?: (coordinate: Coordinate) => boolean
    ): void {
        const matrixX1 = start.x;
        const matrixY1 = start.y;
        const matrixX2 = end.x;
        const matrixY2 = end.y;

        if (matrixX1 === matrixX2 && matrixY1 === matrixY2) {
            callback(start);
            return;
        }

        let diffX = matrixX1 - matrixX2;
        let diffY = matrixY1 - matrixY2;

        const modX = diffX < 0 ? 1 : -1;
        const modY = diffY < 0 ? 1 : -1;

        diffX = Math.abs(diffX);
        diffY = Math.abs(diffY);

        const diffXIsLarger = diffX > diffY;

        const longerSideLength = diffXIsLarger ? diffX : diffY;
        const shorterSideLength = diffXIsLarger ? diffY : diffX;

        const slope = (longerSideLength === 0 || shorterSideLength === 0) ? 0 : shorterSideLength / longerSideLength;
        let increaseShorterSide: number;
        for (let i = 1; i <= longerSideLength; i++) {
            increaseShorterSide = Math.round(i * slope);
            const increaseX: number = diffXIsLarger ? i : increaseShorterSide;
            const increaseY: number = !diffXIsLarger ? i : increaseShorterSide;

            const currentCoordinate = {
                x: matrixX1 + (increaseX * modX),
                y: matrixY1 + (increaseY * modY)
            };

            if (isWithingBounds === undefined || isWithingBounds(currentCoordinate)) {
                callback(currentCoordinate);
            }
        }
    }
}