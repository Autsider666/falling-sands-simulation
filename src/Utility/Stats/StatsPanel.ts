export type PanelConfig = {
    width?: number,
    height?: number,
    showMaximum?: boolean,
    decimals?: number,
    maxValue?: number,
    show?: boolean,
}

export default class StatsPanel {
    private readonly width: number;
    private readonly height: number;
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

    public readonly dom: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;

    constructor(
        public readonly name: string,
        private readonly foregroundColor: string,
        private readonly backgroundColor: string,
        {
            width = 80,
            height = 48,
            showMaximum = false,
            decimals = 0,
            maxValue,
            show = false,
        }: PanelConfig = {}) {

        this.pixelRatio = Math.round(window ? window.devicePixelRatio : 1);

        this.width = width * this.pixelRatio;
        this.height = height * this.pixelRatio;

        this.textX = 3 * this.pixelRatio;
        this.textY = 2 * (height / 48) * this.pixelRatio;

        this.graphX = 3 * this.pixelRatio;
        this.graphY = 15 * (height / 48) * this.pixelRatio;
        this.graphWidth = (width - 6) * this.pixelRatio;
        this.graphHeight = 30 * (height / 48) * this.pixelRatio;

        this.showMaximum = showMaximum;
        this.decimals = decimals;
        this.maxValue = maxValue;

        this.dom = document.createElement('canvas');
        this.dom.width = this.width;
        this.dom.height = this.height;
        this.dom.style.display = show ? 'block' : 'none';

        const context = this.dom.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2d dom');
        }

        this.context = context;

        context.font = 'bold ' + (9 * this.pixelRatio * (height / 48)) + 'px Helvetica,Arial,sans-serif';
        context.textBaseline = 'top';

        context.fillStyle = this.backgroundColor;
        context.fillRect(0, 0, this.width, this.height);

        context.fillStyle = this.foregroundColor;
        context.fillText(name, this.textX, this.textY);
        context.fillRect(this.graphX, this.graphY, this.graphWidth, this.graphHeight);

        context.fillStyle = this.backgroundColor;
        context.globalAlpha = 0.9;
        context.fillRect(this.graphX, this.graphY, this.graphWidth, this.graphHeight);
    }

    update(value: number, maxValue?: number): void {
        this.lowestValue = Math.min(this.lowestValue, value);
        this.highestValue = Math.max(this.highestValue, value);

        maxValue = maxValue ?? this.maxValue ?? this.highestValue;

        this.context.fillStyle = this.backgroundColor;
        this.context.globalAlpha = 1;
        this.context.fillRect(0, 0, this.width, this.graphY);

        let label = `${value.toFixed(this.decimals)}${this.name} (${Math.round(this.lowestValue)}-${Math.round(this.highestValue)})`;
        if (this.showMaximum) {
            label += `/${maxValue}`;
        }
        this.context.fillStyle = this.foregroundColor;
        this.context.fillText(label, this.textX, this.textY);

        this.context.drawImage(
            this.dom,
            this.graphX + this.pixelRatio,
            this.graphY,
            this.graphWidth - this.pixelRatio,
            this.graphHeight,
            this.graphX,
            this.graphY,
            this.graphWidth - this.pixelRatio,
            this.graphHeight
        );

        this.context.fillRect(this.graphX + this.graphWidth - this.pixelRatio, this.graphY, this.pixelRatio, this.graphHeight);

        this.context.fillStyle = this.backgroundColor;
        this.context.globalAlpha = 0.9;
        this.context.fillRect(
            this.graphX + this.graphWidth - this.pixelRatio,
            this.graphY,
            this.pixelRatio,
            Math.round((1 - (value / maxValue)) * this.graphHeight),
        );


        // if (this.name === 'MS') {
        //     console.log(value, maxValue,Math.round((1 - (value / maxValue)) * this.graphHeight), this.graphHeight);
        // }
    }
}