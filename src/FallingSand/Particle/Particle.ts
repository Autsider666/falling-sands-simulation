import {Random} from "excalibur";

const random = new Random();
export abstract class Particle {
    protected constructor(
        public readonly color: string,
        public empty: boolean = false,
    ) {
    }

    abstract get baseColor():string;

    static varyColor(color: string): string {
        const {h, s, l} = this.toHSL(color);
        const hue = Math.floor(h * 360);
        let saturation = (s * 100) + random.integer(-20, 0);
        saturation = Math.max(0, Math.min(100, saturation));
        let lightness = (l * 100) + random.integer(-10, 10);
        lightness = Math.max(0, Math.min(100, lightness));
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    protected static toHSL(color: string): { h: number, s: number, l: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        if (!result) {
            throw new Error('Invalid color hex: ' + color);
        }

        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;

        return {h, s, l};
    }

    update(): void {
    }
}