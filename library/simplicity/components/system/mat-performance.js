import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import {appManager} from "../../manager/app-manager.js";

class MatPerformance extends HTMLElement {

    performance = appManager.performance;

    get latency() {
        return Math.round(this.performance.lifeCycle.latency[this.performance.lifeCycle.latency.length - 1])
    }

    get avgLatency() {
        return Math.round(this.performance.lifeCycle.avgLatency[this.performance.lifeCycle.avgLatency.length - 1])
    }

    get pageLoad() {
        return Math.round(this.performance.pageLoad[this.performance.pageLoad.length - 1])
    }

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/system/mat-performance.html")
    }

}

export default customComponents.define("mat-performance", MatPerformance)