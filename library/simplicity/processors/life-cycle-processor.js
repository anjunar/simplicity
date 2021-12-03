import {appManager} from "../manager/app-manager.js";

let lifeCycles = 0;
let avgLatency = 0;

export function lifeCycle(scope = document.body, event) {

    let timeStart = performance.now();

    function iterate(scope) {
        let iterator = document.createNodeIterator(scope, NodeFilter.SHOW_ELEMENT, {
            acceptNode(node) {
                if (node.preventHydration) {
                    return NodeFilter.FILTER_SKIP
                }
                return NodeFilter.FILTER_ACCEPT
            }
        });

        let node = iterator.nextNode();

        while (node !== null) {
            let component = node.component;

            if (component) {
                if (component.attributeBindings) {
                    for (const attributeBinding of component.attributeBindings) {
                        if (! attributeBinding.runOnce) {
                            attributeBinding.process();
                        }
                    }
                }
                if (component.textNodeProcessors) {
                    for (const textNodeProcessor of component.textNodeProcessors) {
                        textNodeProcessor.process();
                    }
                }
                if (component.attributesChanged) {
                    if (node.render) {
                        component.attributesChanged = false
                        node.render();
                    }
                }
            }

            if (node.update) {
                node.update();
            }

            if (node.content) {
                iterate(node.content);
            }

            node = iterator.nextNode();
        }
    }

    iterate(scope);

    let timeEnd = performance.now();
    let delta = timeEnd - timeStart;
    avgLatency = (avgLatency + delta);
    console.log(`target: ${event.detail.target.localName} with ${event.detail.event} Latency ${Math.round(delta)} ms - avg Latency: ${Math.round(avgLatency / lifeCycles)} ms`);

    let lifeCycle = appManager.performance.lifeCycle;

    lifeCycle.cycles = lifeCycles;
    lifeCycle.addAvgLatency(avgLatency / lifeCycles)
    lifeCycle.addLatency(delta);

    lifeCycles++;

}
