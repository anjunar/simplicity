import {customViews} from "../../../../library/simplicity/simplicity.js";
import {loader} from "../../../../library/simplicity/processors/loader-processor.js";

class Example extends HTMLElement {
    static get components() {
        return []
    }

    static get template() {
        return loader("documentation/basic/navigation/router/example.html")
    }

}

export default customViews.define({
    name: "router-example",
    class: Example
})