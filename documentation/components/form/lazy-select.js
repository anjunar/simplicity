import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/util/loader.js";
import DomSelect from "../../../library/simplicity/components/form/dom-lazy-select.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import MatInputContainer from "../../../library/simplicity/components/form/container/mat-input-container.js";

class LazySelect extends HTMLElement {

    selected = {
        position: 1,
        name: "Hydrogen",
        weight: 1.0079,
        symbol: "H"
    }

    materials(query, callback) {
        fetch("materials.json")
            .then(response => response.json())
            .then((response) => {
                let filtered = response.rows.filter(item => item.name.toLowerCase().startsWith(query.value.toLowerCase()))
                let result = filtered.slice(query.index, query.index + query.limit);
                callback(result, response.rows.length)
            })
    }

    static get components() {
        return [DomSelect, MatInputContainer, DomCode]
    }

    static get template() {
        return loader("documentation/components/form/lazy-select.html")
    }

}

export default customViews.define({
    name: "form-lazy-select",
    class: LazySelect
})