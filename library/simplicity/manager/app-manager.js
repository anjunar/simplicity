const threshold = 10;

class LifeCycle {
    cycles = 0;
    latency = [];
    avgLatency = [];

    addLatency(value) {
        this.latency.push(value);
        if (this.latency.length > threshold) {
            this.latency.shift();
        }
    }

    addAvgLatency(value) {
        this.avgLatency.push(value);
        if (this.avgLatency.length > threshold) {
            this.avgLatency.shift();
        }
    }
}

class Performance {
    pageLoad = []
    lifeCycle = new LifeCycle();

    addPageLoad(value) {
        this.pageLoad.push(value);
        if (this.pageLoad.length > threshold) {
            this.pageLoad.shift();
        }
    }
}

let language = "en";

export const appManager = new class AppManager {

    constructor() {
        language = navigator.language.split("-")[0]
        if (language === "en" || language === "de") {
            // No Op
        } else {
            language = "en"
        }
    }

    get language() {
        return language;
    }
    set language(value) {
        language = value;
    }

    performance = new Performance();
}