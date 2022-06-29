import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomCode from "../../../library/simplicity-core/directives/dom-code.js";
import MatInputContainer from "../../../library/simplicity-material/components/form/container/mat-input-container.js";
import DomLazyMultiSelect from "../../../library/simplicity-core/components/form/dom-lazy-multi-select.js";

class LazySelect extends HTMLElement {

    materials(query, callback) {
        fetch("materials.json")
            .then(response => response.json())
            .then((response) => {
                let result = response.rows.slice(query.index, query.index + query.limit);
                callback(result, response.rows.length)
            })
    }

    static get components() {
        return [DomLazyMultiSelect, MatInputContainer, DomCode]
    }

    static get template() {
        return loader("documentation/components/form/lazy-multi-select.html")
    }

}

export default customViews.define({
    name: "form-lazy-multi-select",
    class: LazySelect
})