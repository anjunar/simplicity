import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomCode from "../../../library/simplicity-material/directives/dom-code.js";
import MetaForm from "../../../library/simplicity-material/components/meta/meta-form.js";
import MetaInput from "../../../library/simplicity-material/components/meta/meta-input.js";

class Form extends HTMLElement {

    material;

    send() {
        alert("Saved")
    }

    static get components() {
        return [MetaForm, MetaInput, DomCode]
    }

    static get template() {
        return loader("documentation/expert/meta/form.html")
    }

}

export default customViews.define({
    name: "expert-meta-form",
    class: Form,
    guard(activeRoute) {
        return {
            material : fetch("material.json").then(response => response.json())
        }
    }
})