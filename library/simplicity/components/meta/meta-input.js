import {customComponents} from "../../simplicity.js";
import DomLazySelect from "../../../simplicity/components/form/dom-lazy-select.js";
import MatInputContainer from "../form/container/mat-input-container.js";
import {libraryLoader} from "../../util/loader.js";
import {Membrane} from "../../service/membrane.js";
import MatCheckboxContainer from "../form/container/mat-checkbox-container.js";
import DomInput from "../../directives/dom-input.js";
import MatEditor from "../form/mat-editor.js";
import {dateFormat, dateTimeFormat, Input, mix} from "../../util/tools.js";
import DomForm from "../../directives/dom-form.js";
import MetaForm from "./meta-form.js";
import MatImageUpload from "../form/mat-image-upload.js";
import DomSelect from "../../directives/dom-select.js";
import DomTextarea from "../../directives/dom-textarea.js";
import MatLike from "../form/mat-like.js";

class MetaInput extends HTMLElement {

    property;
    schema;

    container;

    category(query, callback) {
        fetch(`service/control/users/user/connections/connection/categories?index=${query.index}&limit=${query.limit}`)
            .then(response => response.json())
            .then(response => {
                callback(response.rows, response.size);
            })
    }

    load() {
        switch (this.schema.widget) {
            case "checkbox" :
                return metaInputCheckbox;
            case "editor" :
                return metaInputEditor;
            case "image" :
                return metaInputImageUpload;
            case "lazy-multi-select" :
                return metaInputLazyMultiSelect;
            case "lazy-select" :
                return metaInputLazySelect;
            case "lazy-select-name" :
                return metaInputLazySelectName;
            case "textarea" :
                return metaInputTextArea;
            case "repeat" :
                return metaInputRepeat;
            case "select" :
                return metaInputSelect;
            case "json" :
                return metaInputJson;
            case "form" :
                return metaInputForm;
            case "like" :
                return metaInputLike;
            default :
                return metaInputInput;
        }
    }

    initialize() {
        let metaForm = this.queryUpwards((element) => element.localName === "meta-form");
        this.schema = metaForm.register(this);

        let result = this.load();
        let component = new result({schema: this.schema, property: this.property});
        component.render();
        this.container.appendChild(component);
    }


    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break
            case "property" : {
                this.property = newValue;
            }
                break
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            },
            {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [DomLazySelect, MatInputContainer]
    }

    static get template() {
        return libraryLoader("simplicity/components/meta/meta-input.html")
    }


}

export default customComponents.define("meta-input", MetaInput);

class MetaInputLike extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("mat-like");

        Membrane.track(input, {
            property: "dirty",
            element: this,
            handler: (value) => {
                this.schema.dirty = value
            }
        })
    }

    likes(query, callback) {
        let link = this.schema.links.list;
        fetch(`${link.url}&index=${query.index}&limit=${query.limit}`)
            .then(response => response.json())
            .then(response => {
                callback(response.rows, response.size);
            })
    }

    onLike(event) {
        if (event.target.model) {
            fetch(this.schema.links.like.url, { method : "POST" })
        } else {
            fetch(this.schema.links.dislike.url, { method : "POST" })
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MatLike]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en" xmlns:read="http://www.w3.org/1999/xhtml">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                    <template>
                        <mat-like read:name="property" read:onLike="onLike($event)" read:items="likes"></mat-like>
                    </template>
                </body>
                </html>`
    }
}

const metaInputLike = customComponents.define("meta-input-like", MetaInputLike);


class MetaInputCheckbox extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("input");
        if (this.schema.validators.notBlank || this.schema.validators.notNull) {
            input.required = true;
        }

        Membrane.track(input, {
            property: "dirty",
            element: this,
            handler: (value) => {
                this.schema.dirty = value
            }
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MatCheckboxContainer, DomInput]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en" xmlns:read="http://www.w3.org/1999/xhtml">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                    <template>
                        <mat-checkbox-container read:placeholder="schema.title">
                            <input is="dom-input" type="checkbox" read:name="property" read:disabled="schema.readOnly">
                        </mat-checkbox-container>
                    </template>
                </body>
                </html>`
    }
}

const metaInputCheckbox = customComponents.define("meta-input-checkbox", MetaInputCheckbox);

class MetaInputEditor extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("mat-editor");
        if (this.schema.validators.notBlank || this.schema.validators.notNull) {
            input.required = true;
        }
        Membrane.track(input, {
            property: "dirty",
            element: this,
            handler: (value) => {
                this.schema.dirty = value;
                this.schema.properties.html.dirty = value;
                this.schema.properties.text.dirty = value;
            }
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MatEditor]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                    <template>
                        <mat-editor read:name="property" read:disabled="schema.readOnly"></mat-editor>
                    </template>
                </body>
                </html>`
    }

}

const metaInputEditor = customComponents.define("meta-input-editor", MetaInputEditor);

class MetaInputForm extends mix(HTMLElement).with(Input) {

    property;
    schema;
    name;

    initialize() {
        this.name = this.property;

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }

        Membrane.track(this, {
            property: "dirty",
            element: this,
            handler: (value) => {
                this.schema.dirty = value;
            }
        })
    }

    validate() {
        let metaForm = this.querySelector("meta-form");
        return metaForm.validate();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MetaForm, MetaInput]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en" xmlns:bind="http://www.w3.org/1999/xhtml">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                <template>
                    <meta-form bind:model="model">
                        <meta-input bind:for="let [key, schema] of schema.properties" bind:property="key" bind:schema="schema"></meta-input>
                    </meta-form>
                </template>
                </body>
                </html>`
    }

}

const metaInputForm = customComponents.define("meta-input-form", MetaInputForm)

class MetaInputImageUpload extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("mat-image-upload");
        if (this.schema.validators.notBlank || this.schema.validators.notNull) {
            input.required = true;
        }
        Membrane.track(input, {
            property: "dirty",
            element: this,
            handler: (value) => {
                this.schema.dirty = value
            }
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MatImageUpload]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                    <template>
                        <mat-image-upload style="width: 320px; height: 200px" read:name="property" read:disabled="schema.readOnly"></mat-image-upload>
                    </template>
                </body>
                </html>`
    }

}

const metaInputImageUpload = customComponents.define("meta-input-image-upload", MetaInputImageUpload);

class MetaInputInput extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("input");
        let validators = this.schema.validators;

        if (validators.notBlank || validators.notNull) {
            input.required = true;
        }
        if (validators.size) {
            input.maxLength = validators.size.max;
            input.minLength = validators.size.min;
        }
        if (validators.pattern) {
            input.pattern = validators.pattern.regexp
        }

        Membrane.track(input, {
            property: "dirty",
            element: this,
            handler: (value) => {
                this.schema.dirty = value;
            }
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MatInputContainer, DomInput]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en" xmlns:read="http://www.w3.org/1999/xhtml">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                <template>
                    <mat-input-container read:placeholder="schema.title">
                        <input is="dom-input" read:type="schema.widget" read:name="property" read:disabled="schema.readOnly"
                               read:step="schema.type === 'double' ? '0.0000000000001' : schema.type === 'float' ? '0.0000001' : '1'">
                        <div slot="error">
                            <div read:for="let [key, validator] of schema.validators">
                                <switch read:value="key">
                                    <case value="notNull">
                                        <span name="valueMissing">Can not be empty</span>
                                    </case>
                                    <case value="notBlank">
                                        <span name="valueMissing">Can not be empty</span>
                                    </case>
                                    <case value="size">
                                        <span name="tooShort">Must be minimum {{{validator.min}}} characters and a maximum of {{{validator.max}}} characters</span>
                                    </case>
                                    <case value="email">
                                        <span name="typeMismatch">This must be a valid Email Address</span>
                                    </case>
                                    <case value="pattern"> 
                                        <span name="patternMismatch">This must be a valid {{{validator.regexp}}}</span>
                                    </case>
                                </switch>
                            </div>
                            <span name="stepMismatch">Step miss match</span>
                        </div>
                    </mat-input-container>
                </template>
                </body>
                </html>`
    }

}


const metaInputInput = customComponents.define("meta-input-input", MetaInputInput);

class MetaInputJson extends HTMLElement {

    property;
    schema;
    model = {};

    initialize() {
        let form = this.queryUpwards((element) => element instanceof DomForm);
        this.model = form.model[this.property];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return []
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en" xmlns:read="http://www.w3.org/1999/xhtml">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                    <template>
                        <div>
                            <div style="font-size: small" bind:for="let [key, value] of model">
                                {{{key}}} : {{{value}}}
                            </div>
                        </div>
                    </template>
                </body>
                </html>`
    }

}

const metaInputJson = customComponents.define("meta-input-json", MetaInputJson)

class MetaInputLazyMultiSelect extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("dom-lazy-select");
        if (this.schema.validators.notBlank || this.schema.validators.notNull) {
            input.required = true;
        }
        Membrane.track(input, {
            property: "dirty",
            element: this,
            handler: (value) => {
                this.schema.dirty = value;
            }
        })
    }

    domLazyId(schema) {
        return Object
            .entries(schema.items.properties)
            .find(([name, item]) => item.id)[0];
    }

    domLazySelect(schema) {
        let link = schema.links.list;
        return (query, callback) => {
            let url = new URL(link.url, `${window.location.protocol}//${window.location.host}/`);
            url.searchParams.set("index", query.index);
            url.searchParams.set("limit", query.limit);
            url.searchParams.set("value", query.value)

            fetch(url.toString(), {method: link.method})
                .then(response => response.json())
                .then((response) => {
                    callback(response.rows, response.size)
                })
        }
    }

    domLazySelectOption(meta, data) {
        return Object
            .entries(meta.items.properties)
            .filter(([name, property]) => property.naming)
            .map(([name, property]) => data[name])
            .join(" ")
    }

    domLazySelectLabel(meta) {
        return Object
            .entries(meta.items.properties)
            .filter(([name, property]) => property.naming)
            .map(([name, property]) => name)
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MatInputContainer, DomLazySelect]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                    <template>
                        <mat-input-container read:placeholder="schema.title">
                            <dom-lazy-select read:items="domLazySelect(schema)" read:label="domLazySelectLabel(schema)" read:name="property" read:disabled="schema.readOnly" read:id="domLazyId(schema)" multiselect="true">
                                <div let="data">{{{domLazySelectOption(schema, data)}}}</div>
                            </dom-lazy-select>
                        </mat-input-container>
                    </template>
                </body>
                </html>`
    }

}

const metaInputLazyMultiSelect = customComponents.define("meta-input-lazy-multi-select", MetaInputLazyMultiSelect);

class MetaInputLazySelect extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("dom-lazy-select");
        if (this.schema.validators.notBlank || this.schema.validators.notNull) {
            input.required = true;
        }
        Membrane.track(input, {
            property: "dirty",
            element: this,
            handler: (value) => {
                this.schema.dirty = value;
            }
        })
    }

    domLazyId(schema) {
        return Object
            .entries(schema.properties)
            .find(([name, item]) => item.id)[0];
    }

    domLazySelect(schema) {
        let link = schema.links.list;
        return (query, callback) => {
            let url = new URL(link.url, `${window.location.protocol}//${window.location.host}/`);
            url.searchParams.set("index", query.index);
            url.searchParams.set("limit", query.limit);
            url.searchParams.set("value", query.value)

            fetch(url.toString(), {method: link.method})
                .then(response => response.json())
                .then((response) => {
                    callback(response.rows, response.size)
                })
        }
    }

    domLazySelectOption(meta, data) {
        return Object
            .entries(meta.properties)
            .filter(([name, property]) => property.naming)
            .map(([name, property]) => data[name])
            .join(" ")
    }

    domLazySelectLabel(meta) {
        return Object
            .entries(meta.properties)
            .filter(([name, property]) => property.naming)
            .map(([name, property]) => name)
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MatInputContainer, DomLazySelect]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                    <template>
                        <mat-input-container read:placeholder="schema.title">
                            <dom-lazy-select read:items="domLazySelect(schema)" read:label="domLazySelectLabel(schema)" 
                                             read:name="property" read:disabled="schema.readOnly" read:id="domLazyId(schema)">
                                <div let="data">{{{domLazySelectOption(schema, data)}}}</div>
                            </dom-lazy-select>
                        </mat-input-container>
                    </template>
                </body>
                </html>`
    }

}

const metaInputLazySelect = customComponents.define("meta-input-lazy-select", MetaInputLazySelect);

class MetaInputLazySelectName extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("dom-lazy-select");
        if (this.schema.validators.notBlank || this.schema.validators.notNull) {
            input.required = true;
        }
        Membrane.track(input, {
            property: "dirty",
            element: this,
            handler: (value) => {
                this.schema.dirty = value;
            }
        })
    }

    domLazyId(schema) {
        return Object
            .entries(schema.properties)
            .find(([name, item]) => item.id)[0];
    }

    domLazySelect(schema) {
        let link = schema.links.list;
        return (query, callback) => {
            let url = new URL(link.url, `${window.location.protocol}//${window.location.host}/`);
            url.searchParams.set("index", query.index);
            url.searchParams.set("limit", query.limit);
            url.searchParams.set("value", query.value)

            fetch(url.toString(), {method: link.method})
                .then(response => response.json())
                .then((response) => {
                    callback(response.rows, response.size)
                })
        }
    }

    domLazySelectOption(meta, data) {
        return Object
            .entries(meta.properties)
            .filter(([name, property]) => property.naming)
            .map(([name, property]) => data[name])
            .join(" ")
    }

    domLazySelectLabel(meta) {
        return Object
            .entries(meta.properties)
            .filter(([name, property]) => property.naming)
            .map(([name, property]) => name)
    }

    save(event) {
        let saveLink = this.schema.links.save;
        let body = JSON.stringify({form : {value : event.detail, property : this.property}});
        fetch(saveLink.url, {method : "POST", body : body, headers : {'Content-Type': 'application/json'}})
    }

    onDelete(data) {
        let deleteLink = data.links.delete;
        fetch(deleteLink.url, {method : "DELETE"})
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MatInputContainer, DomLazySelect]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                    <template>
                        <mat-input-container read:placeholder="schema.title">
                            <dom-lazy-select read:items="domLazySelect(schema)" read:label="domLazySelectLabel(schema)" 
                                             read:name="property" read:disabled="schema.readOnly" read:id="domLazyId(schema)"
                                             read:onEnter="save($event)">
                                <div let="data" style="display: flex; align-items: center">
                                    <div>{{{domLazySelectOption(schema, data)}}}</div>
                                    <div style="flex : 1"></div>
                                    <button read:if="data.links.delete" class="material-icons" read:onclick="onDelete(data)">delete</button>
                                    <img read:src="data.owner.picture.data" style="max-width: 50px; max-height: 50px">
                                </div>
                            </dom-lazy-select>
                        </mat-input-container>
                    </template>
                </body>
                </html>`
    }

}

const metaInputLazySelectName = customComponents.define("meta-input-lazy-select-name", MetaInputLazySelectName);


class MetaInputRepeat extends mix(HTMLElement).with(Input) {

    property;
    schema;
    name;
    model = [];
    dirty = false;

    addItem() {
        let chunk = {$schema: this.schema.items};
        this.model.push(chunk)
        this.dirty = true;
        this.dispatchEvent(new Event("input"))
    }

    removeItem(value) {
        let indexOf = this.model.indexOf(value);
        this.model.splice(indexOf);
        this.dirty = true;
        this.dispatchEvent(new Event("input"))
    }

    initialize() {
        this.name = this.property;

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }

        Membrane.track(this, {
            property: "dirty",
            element: this,
            handler: (value) => {
                this.schema.dirty = value;
            }
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MetaForm, MetaInput]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en" xmlns:bind="http://www.w3.org/1999/xhtml" xmlns:read="http://www.w3.org/1999/xhtml">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                    <template>
                        <div style="font-size: small; width: 100%">
                            {{{schema.title}}}
                            <div style="margin-left: 12px">
                                <div bind:for="let element of model">
                                    <div style="display: flex; width: 100%; margin: 5px">
                                        <meta-form read:model="element" style="width: 100%">
                                            <div read:for="let [key, modelt] of schema.items.properties">
                                                <meta-input  read:property="key" read:schema="modelt"></meta-input>
                                            </div>
                                        </meta-form>
                                        <button type="button" read:if="! schema.readOnly" read:onclick="removeItem(element)" style="height: 36px" class="material-icons">delete</button>
                                    </div>
                                </div>
                                <button read:if="! schema.readOnly" type="button" read:onclick="addItem()" class="material-icons">add</button>
                            </div>
                        </div>
                    </template>
                </body>
                </html>`
    }

}

const metaInputRepeat = customComponents.define("meta-input-repeat", MetaInputRepeat)

class MetaInputSelect extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("select");
        if (this.schema.validators.notBlank || this.schema.validators.notNull) {
            input.required = true;
        }
        Membrane.track(input, {
            property: "dirty",
            element: this,
            handler: (value) => {
                this.schema.dirty = value;
            }
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [DomSelect, MatInputContainer]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en" xmlns:read="http://www.w3.org/1999/xhtml">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                <template>
                    <select is="dom-select" read:name="property">
                        <option read:for="let option of schema.enum" read:value="option">{{option}}</option>
                    </select>
                </template>
                </body>
                </html>`
    }

}

const metaInputSelect = customComponents.define("meta-input-select", MetaInputSelect)

class MetaInputTextarea extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("textarea");
        if (this.schema.validators.notBlank || this.schema.validators.notNull) {
            input.required = true;
        }
        Membrane.track(input, {
            property: "dirty",
            element: this,
            handler: (value) => {
                this.schema.dirty = value;
            }
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [DomTextarea]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en" xmlns:read="http://www.w3.org/1999/xhtml">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                </head>
                <body>
                <template>
                    <textarea is="dom-textarea" read:name="property" read:placeholder="schema.title"></textarea>
                </template>
                </body>
                </html>`
    }

}

const metaInputTextArea = customComponents.define("meta-input-textarea", MetaInputTextarea);

class MetaInputView extends HTMLElement {

    property;
    schema;
    model;
    name;

    preInitialize() {
        this.name = this.property

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }
    }

    multiSelect(model, meta) {
        return model.map((item) => Object
            .entries(meta.items.properties)
            .filter(([name, property]) => property.naming)
            .map(([name, property]) => item[name])
            .join(" ")
        ).join(" ")
    }

    select(model, meta) {
        return Object
            .entries(meta.properties)
            .filter(([name, property]) => property.naming)
            .map(([name, property]) => model[name])
            .join(" ")
    }

    dateTime(value, meta) {
        if (value) {
            return dateTimeFormat(value, this.app.language)
        }
        return "";
    }

    date(value, meta) {
        if (value) {
            return dateFormat(value, this.app.language)
        }
        return "";
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "property" : {
                this.property = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get template() {
        return `<!DOCTYPE html>
                <html lang="en" xmlns:read="http://www.w3.org/1999/xhtml" xmlns:read="http://www.w3.org/1999/xhtml">
                <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                    <style>
                        meta-input-view .placeholder {
                            font-size: xx-small;
                            color: var(--main-grey-color);
                            opacity: 1;
                        }
                    </style>
                </head>
                <body>
                <template>
                    <div class="placeholder">
                            <span>{{schema.title}}</span>
                    </div>
                    <div style="font-size: small; color: var(--main-grey-color)">
                        <div style="min-height: 15px">
                            <switch read:value="schema.type">
                                <case value="image">
                                    <img read:if="model" style="max-width: 160px; max-height: 100px" read:src="model.data"/>
                                </case>
                                <case value="array">
                                    <div style="overflow: hidden;white-space: nowrap; text-overflow: ellipsis; max-width: 400px">
                                        {{{multiSelect(model, schema)}}}
                                    </div>
                                </case>
                                <case value="object">
                                    <switch read:value="schema.widget">
                                        <case value="image">
                                            <img read:if="model" style="max-width: 160px; max-height: 100px" read:src="model.data">
                                        </case>
                                        <case value="default">
                                            <div style="overflow: hidden;white-space: nowrap; text-overflow: ellipsis; max-width: 400px">
                                                {{{select(model, schema)}}}
                                            </div>
                                        </case>
                                    </switch>
                                </case>
                                <case value="default">
                                    <switch read:value="schema.format">
                                        <case value="date-time">
                                            <div>{{{dateTime(model)}}}</div>
                                        </case>
                                        <case value="date">
                                            <div>{{{date(model)}}}</div>
                                        </case>
                                        <case value="default">
                                            <div style="overflow: hidden;white-space: nowrap; text-overflow: ellipsis; max-width: 400px">{{{model}}}</div>
                                        </case>
                                    </switch>
                                </case>
                            </switch>
                        </div>
                    </div>
                    <hr style="color: var(--main-dark1-color); background-color: var(--main-dark1-color)"/>
                    <div style="height: 6px"></div>
                </template>
                </body>
                </html>`
    }

}

const metaInputView = customComponents.define("meta-input-view", MetaInputView)