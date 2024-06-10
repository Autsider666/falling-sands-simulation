/**
 * My own adapted version of Stats.js by mrdoob: https://github.com/mrdoob/stats.js
 */
import StatsPanel from "./StatsPanel.ts";
import merge from "lodash/merge";

export type DefaultPanels = 'FPS' | 'MS' | 'MB';

type PanelConfig = {
    foregroundColor: string,
    backgroundColor: string,
    maxValue: number | undefined,
    decimals: number,
};

type DefaultPanelsConfig = { [key in DefaultPanels]: PanelConfig }

type PanelIdentifier = string;

type PanelData = {
    [key: PanelIdentifier]: { value: number, maxValue?: number }
}

type StatsProps = {
    width?: number,
    height?: number,
    showMaximum?: boolean,
    timer?: () => number,
    defaultPanels?: { [key in DefaultPanels]?: Partial<PanelConfig> | false },
    showAll?:boolean,
}

export default class Stats {
    static defaultConfig: DefaultPanelsConfig = {
        FPS: {foregroundColor: '#0ff', backgroundColor: '#002', maxValue: 100, decimals: 0},
        MS: {foregroundColor: '#0f0', backgroundColor: '#020', maxValue: 200, decimals: 1},
        MB: {foregroundColor: '#f08', backgroundColor: '#201', maxValue: undefined, decimals: 0},
    };

    private currentPanel: number = -1;
    private readonly panels: Map<string, StatsPanel> = new Map<PanelIdentifier, StatsPanel>();
    public readonly dom: HTMLDivElement;
    private beginTime: number;
    private previousTime: number;
    private frames: number;

    private readonly width: number;
    private readonly height: number;
    private readonly showMaximum: boolean;
    private readonly timer: () => number;
    private readonly showAll:boolean;

    constructor({
                    width = 80,
                    height = 48,
                    showMaximum = false,
                    timer = () => (performance || Date).now(),
                    showAll = false,
                    defaultPanels = {},
                }: StatsProps) {
        this.dom = document.createElement('div');
        this.dom.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';

        if (!showAll) {
            this.dom.addEventListener('click', event => {
                event.preventDefault();
                this.showNextPanel();

            }, false);
        }

        this.width = width;
        this.height = height;
        this.showMaximum = showMaximum;
        this.showAll = showAll;
        this.timer = timer;

        this.beginTime = this.timer();
        this.previousTime = this.beginTime;
        this.frames = 0;

        const config = merge({}, Stats.defaultConfig, defaultPanels) satisfies DefaultPanelsConfig; //TODO Does Object.assign work here?
        for (const [name, panelConfig] of Object.entries(config)) {
            if (panelConfig === false) {
                continue;
            }

            const {foregroundColor, backgroundColor, decimals, maxValue} = panelConfig;
            this.addPanel(name, foregroundColor, backgroundColor, decimals, maxValue);
        }

        this.showPanel(0);
    }

    showNextPanel(): void {
        this.showPanel(++this.currentPanel % this.panels.size);
    }

    showPanel(id: number): void {
        const panelName: string | undefined = Array.from(this.panels.keys())[id];
        if (panelName === undefined) {
            return;
        }

        for (const panel of this.panels.values()) {
            panel.dom.style.display = panel.name === panelName || this.showAll ? 'block' : 'none';
        }

        this.currentPanel = id;
    }

    addPanel(name: PanelIdentifier, foregroundColor: string, backgroundColor: string, decimals: number = 0, maxValue?: number): void {
        if (this.panels.has(name)) {
            console.warn(`Panel "${name}" already exists.`);
            return;
        }

        const panel = new StatsPanel(name, foregroundColor, backgroundColor, {
            width: this.width,
            height: this.height,
            showMaximum: this.showMaximum,
            decimals,
            maxValue,
            show:this.showAll,
        });

        this.dom.appendChild(panel.dom);

        this.panels.set(name, panel);
    }

    begin(): void {
        this.beginTime = this.timer();
    }

    end(panelData: PanelData = {}): number {
        this.frames++;

        const time = this.timer();

        panelData.MS = {value: time - this.beginTime};

        if (time > this.previousTime + 1000) {

            panelData.FPS = {value: (this.frames * 1000) / (time - this.previousTime)};

            this.previousTime = time;
            this.frames = 0;

            // @ts-expect-error deprecated memory
            const memory = performance.memory;
            panelData.MB = {value: memory.usedJSHeapSize / 1048576, maxValue: memory.jsHeapSizeLimit / 1048576};
        }

        for (const [name, {value, maxValue}] of Object.entries(panelData)) {
            this.panels.get(name)?.update(value, maxValue);
        }

        return time;
    }
}
