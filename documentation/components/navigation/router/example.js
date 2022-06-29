import {customViews} from "../../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../../library/simplicity-core/processors/loader-processor.js";

class Example extends HTMLElement {
    static get components() {
        return []
    }

    static get template() {
        return loader("documentation/components/navigation/router/example.html")
    }

}

export default customViews.define({
    name: "router-example",
    class: Example
})