import {debounce} from "../services/tools.js";
import {appManager} from "../manager/app-manager.js";

let lifeCycles = 0;
let avgLatency = 0;

export const lifeCycle = debounce(function lifeCycle() {

    let timeStart = performance.now();

    let iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);
    let node = iterator.nextNode();

    while (node !== null) {

        if (Reflect.has(node, "cycle")) {
            node.cycle();
        }

        if (Reflect.has(node, "render")) {
            if (node.attributesChanged) {
                node.render();
            }
        }

        node.attributesChanged = false;

        if (Reflect.has(node, "update")) {
            node.update();
        }

        node = iterator.nextNode();
    }

    let timeEnd = performance.now();
    let delta = timeEnd - timeStart;
    avgLatency = (avgLatency + delta);
    console.log(`Latency ${Math.round(delta)} ms - avg Latency: ${Math.round(avgLatency / lifeCycles)} ms`);

    let lifeCycle = appManager.performance.lifeCycle;

    lifeCycle.cycles = lifeCycles;
    lifeCycle.addAvgLatency(avgLatency / lifeCycles)
    lifeCycle.addLatency(delta);

    lifeCycles++;


}, 30);