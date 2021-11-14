import {customViews} from "../../../library/simplicity/simplicity.js";
import {jsonClient} from "../../../library/simplicity/services/client.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomSelect from "../../../library/simplicity/components/form/dom-lazy-select.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import MatInputContainer from "../../../library/simplicity/components/form/container/mat-input-container.js";

class LazySelect extends HTMLElement {

    materials(query, callback) {
        jsonClient.get("materials.json")
            .then((response) => {
                let result = response.slice(query.index, query.index + query.limit);
                callback(result, response.length)
            })
    }

    static get components() {
        return [DomSelect, MatInputContainer, DomCode]
    }

    static get template() {
        return loader("documentation/basic/form/lazy-select.html")
    }

}

export default customViews.define({
    name: "form-lazy-select",
    class: LazySelect
})