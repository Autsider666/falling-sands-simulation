/**
 * Two PI constant
 */
export const TwoPI: number = Math.PI * 2;

/**
 * Clamps a value between a min and max inclusive
 */
export function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(min, val), max);
}

/**
 * Convert an angle to be the equivalent in the range [0, 2PI]
 */
export function canonicalizeAngle(angle: number): number {
    let tmpAngle = angle;
    if (angle > TwoPI) {
        while (tmpAngle > TwoPI) {
            tmpAngle -= TwoPI;
        }
    }

    if (angle < 0) {
        while (tmpAngle < 0) {
            tmpAngle += TwoPI;
        }
    }
    return tmpAngle;
}