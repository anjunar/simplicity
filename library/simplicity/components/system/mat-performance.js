import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

class MatPerformance extends HTMLElement {

    get latency() {
        return Math.round(document.system.lifeCycle.latency[document.system.lifeCycle.latency.length - 1])
    }

    get avgLatency() {
        return Math.round(document.system.lifeCycle.avgLatency[document.system.lifeCycle.avgLatency.length - 1])
    }

    get pageLoad() {
        return Math.round(document.system.pageLoad[document.system.pageLoad.length - 1])
    }

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/system/mat-performance.html")
    }

}

export default customComponents.define("mat-performance", MatPerformance)