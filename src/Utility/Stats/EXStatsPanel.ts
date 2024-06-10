import {Actor, Vector} from "excalibur";
import {DirtyCanvas} from "../DirtyCanvas.ts";
import Stats, {DefaultPanels} from "./Stats.ts";
import {PanelConfig} from "./StatsPanel.ts";

type ValueFunction = (startTime: number, endTime: number) => number;

export class EXStatsPanel extends Actor {
    private static defaultValueFunctions: { [key in DefaultPanels]: ValueFunction } = {
        FPS: () => 1,
        MS: (startTime, endTime) => endTime-startTime,
        MB: () => 1,
    };

    private readonly timer = () => (performance || Date).now(); //FIXME

    private readonly pixelRatio: number;
    private readonly textX: number;
    private readonly textY: number;
    private readonly graphX: number;
    private readonly graphY: number;
    private readonly graphWidth: number;
    private readonly graphHeight: number;
    private lowestValue: number = Infinity;
    private highestValue: number = 0;
    private readonly showMaximum: boolean;
    private readonly decimals: number;
    private readonly maxValue?: number;
    private beginTime: number;
    // @ts-expect-error This should be needed for something right? :P
    private previousTime: number;

    private initialDraw: boolean = true;

    private readonly canvas: DirtyCanvas;

    constructor(
        pos: Vector,
        anchor: Vector,
        public readonly name: string,
        private readonly foregroundColor: string,
        private readonly backgroundColor: string,
        private readonly valueFunction: ValueFunction,
        {
            width = 80,
            height = 48,
            showMaximum = false,
            decimals = 0,
            maxValue
        }: PanelConfig = {}) {
        const pixelRatio = Math.round(window.devicePixelRatio || 1);
        super({
            pos,
            anchor,
            height: height * pixelRatio,
            width: width * pixelRatio,
        });

        this.pixelRatio = pixelRatio;

        this.textX = 3 * this.pixelRatio;
        this.textY = 2 * (this.height / 48) * this.pixelRatio;

        this.graphX = 3 * this.pixelRatio;
        this.graphY = 15 * this.pixelRatio;
        this.graphWidth = (this.width - 6) * this.pixelRatio;
        this.graphHeight = (this.height - 18) * (this.height / 48) * this.pixelRatio;

        this.showMaximum = showMaximum;
        this.decimals = decimals;
        this.maxValue = maxValue;

        this.beginTime = this.timer();
        this.previousTime = this.beginTime;

        this.canvas = new DirtyCanvas({
            height: this.height,
            width: this.width,
            // cache:true,
            draw: this.draw.bind(this),
        });

        this.graphics.use(this.canvas);
    }

    private draw(ctx: CanvasRenderingContext2D): void {
        const time = this.timer();

        if (this.initialDraw) {
            // Initial Setup
            ctx.font = 'bold ' + (9 * this.pixelRatio* ((this.height/this.pixelRatio) / 48)) + 'px Helvetica,Arial,sans-serif';
            ctx.textBaseline = 'top';

            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, this.width, this.height);

            ctx.fillStyle = this.foregroundColor;
            ctx.fillText(this.name, this.textX, this.textY);
            ctx.fillRect(this.graphX, this.graphY, this.graphWidth, this.graphHeight);

            ctx.fillStyle = this.backgroundColor;
            ctx.globalAlpha = 0.9;
            ctx.fillRect(this.graphX, this.graphY, this.graphWidth, this.graphHeight);
            this.initialDraw = false;
        }

        const value = this.valueFunction(this.beginTime, time);

        this.lowestValue = Math.min(this.lowestValue, value);
        this.highestValue = Math.max(this.highestValue, value);
        const maxValue = this.maxValue ?? this.highestValue;

        ctx.fillStyle = this.backgroundColor;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, this.width, this.graphY);

        let label = `${value.toFixed(this.decimals)}${this.name} (${Math.round(this.lowestValue)}-${Math.round(this.highestValue)})`;
        if (this.showMaximum) {
            label += `/${maxValue}`;
        }

        ctx.fillStyle = this.foregroundColor;
        ctx.fillText(label, this.textX, this.textY);

        ctx.drawImage(
            this.canvas._bitmap,
            this.graphX + this.pixelRatio,
            this.graphY,
            this.graphWidth - this.pixelRatio,
            this.graphHeight,
            this.graphX,
            this.graphY,
            this.graphWidth - this.pixelRatio,
            this.graphHeight
        );

        ctx.fillRect(this.graphX + this.graphWidth - this.pixelRatio, this.graphY, this.pixelRatio, this.graphHeight);

        ctx.fillStyle = this.backgroundColor;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(
            this.graphX + this.graphWidth - this.pixelRatio,
            this.graphY,
            this.pixelRatio,
            Math.round((1 - (value / maxValue)) * this.graphHeight),
        );

        this.previousTime = time;
        this.beginTime = this.timer();
    }

    static createByDefault(type: DefaultPanels, pos: Vector = Vector.Zero, anchor:Vector = Vector.Half): EXStatsPanel {
        const {foregroundColor, backgroundColor, decimals, maxValue} = Stats.defaultConfig[type];

        return new EXStatsPanel(pos, anchor, type, foregroundColor, backgroundColor, EXStatsPanel.defaultValueFunctions[type], {
            decimals,
            maxValue
        });
    }
}