import {customViews} from "../../../library/simplicity-core/simplicity.js";
import DomCode from "../../../library/simplicity-material/directives/dom-code.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import {appManager} from "../../../library/simplicity-core/manager/app-manager.js";

class Repeat extends HTMLElement {

    page = 0;

    materials = [];

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/basic/control/repeat.html")
    }

}

export default customViews.define({
    name: "control-structures-repeat",
    class: Repeat,
    header: "Repeat",
    guard(activeRoute) {
        return {
            materials: fetch("/" + appManager.context + "/materials.json").then(response => response.json())
        }
    }
})