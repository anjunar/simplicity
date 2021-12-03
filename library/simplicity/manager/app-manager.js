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

    get language() {
        return language;
    }
    set language(value) {
        language = value;
    }

    performance = new Performance();
}