import {customViews} from "../../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../../library/simplicity-core/processors/loader-processor.js";

class Example extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("documentation/components/modals/dialog/example.html")
    }

}

export default customViews.define({
    name: "dialog-example",
    class: Example,
    header: "Example",
    width : "320px",
    height : "200px",
    modal : true
});