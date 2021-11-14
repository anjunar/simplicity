let lifeCycles = 0;
let avgLatency = 0;

export function lifeCycle(scope = document.body) {

    let timeStart = new Date().getTime();

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
            if (node.attributeBindings) {
                for (const attributeBinding of node.attributeBindings) {
                    attributeBinding.process();
                }
            }
            if (node.textNodeProcessors) {
                for (const textNodeProcessor of node.textNodeProcessors) {
                    textNodeProcessor.process();
                }
            }
            if (node.attributesChanged) {
                if (node.render) {
                    node.attributesChanged = false
                    node.render();
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

    let timeEnd = new Date().getTime();
    let delta = timeEnd - timeStart;
    avgLatency = (avgLatency + delta);
    console.log(`Latency ${delta} ms - avg Latency: ${avgLatency / lifeCycles} ms`);
    lifeCycles++;
}
