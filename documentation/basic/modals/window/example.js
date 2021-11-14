import {customViews} from "../../../../library/simplicity/simplicity.js";
import {loader} from "../../../../library/simplicity/processors/loader-processor.js";

class Example extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("documentation/basic/modals/dialog/example.html")
    }

}

export default customViews.define({
    name: "window-example",
    class: Example,
    header: "Example",
    width : "320px",
    height : "200px"
});