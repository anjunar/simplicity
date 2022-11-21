import {customViews} from "../../../../library/simplicity/simplicity.js";
import {loader} from "../../../../library/simplicity/util/loader.js";

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