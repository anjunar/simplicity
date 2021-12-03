class LifeCycle {
    cycles = 0;
    latency = [];
    avgLatency = [];
}

class Performance {
    pageLoad = []
    lifeCycle = new LifeCycle();
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