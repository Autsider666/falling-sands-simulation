let canvasB: OffscreenCanvas;
let ctxWorker: OffscreenCanvasRenderingContext2D;

// Waiting to receive the OffScreenCanvas
self.onmessage = (event: MessageEvent<{
    slowdown?: boolean,
    canvas?: OffscreenCanvas
}>) => {
    console.log(event.data);
    if (event.data?.slowdown) {
        fibonacci(42);
    } else {
        const canvas = event.data?.canvas;
        const ctx = canvasB?.getContext("2d");
        if (!ctx || !canvas) {
            throw new Error('no ctx');
        }

        canvasB = canvas;
        ctxWorker = ctx;
        startCounting();
    }
};

// Fibonacci function to add some delay to the thread
function fibonacci(num: number): number {
    if (num <= 1) {
        return 1;
    }
    return fibonacci(num - 1) + fibonacci(num - 2);
}

// Start the counter for Canvas B
let counter = 0;

function startCounting() {
    setInterval(() => {
        redrawCanvasB();
        counter++;
        postMessage(counter.toString());
    }, 100);
}

// Redraw Canvas B text
function redrawCanvasB() {
    ctxWorker.clearRect(0, 0, canvasB.width, canvasB.height);
    ctxWorker.font = "24px Verdana";
    ctxWorker.textAlign = "center";
    ctxWorker.fillStyle = 'white';
    ctxWorker.fillText(counter.toString(), canvasB.width / 2, canvasB.height / 2);
}