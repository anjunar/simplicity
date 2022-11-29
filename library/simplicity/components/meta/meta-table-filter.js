import {customComponents} from "../../simplicity.js";
import {libraryLoader} from "../../util/loader.js";
import DomInput from "../../directives/dom-input.js";
import MatInputContainer from "../form/container/mat-input-container.js";
import DomLazySelect from "../form/dom-lazy-select.js";

class MetaTableFilter extends HTMLElement {

    schema;
    model;
    name;

    container;

    load() {
        switch (this.schema.widget) {
            case "checkbox" :
                return metaFilterCheckbox
            case "lazy-select" :
                return metaFilterLazySelect
            case "lazy-multi-select" :
                return metaFilterLazyMultiSelect
            case "datetime-local" :
                return metaFilterDuration
            case "date" :
                return metaFilterDuration
            case "number" :
                return metaFilterDuration
            default :
                return metaFilterInput
        }
    }

    initialize() {
        let result = this.load();
        let component = new result();
        component.schema = this.schema;
        component.model = this.model;
        component.name = this.name;
        component.render();
        component.addEventListener("model", () => {
            this.dispatchEvent(new CustomEvent("model"));
        })
        this.container.appendChild(component);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "model" : {
                this.model = newValue;
            }
                break;
            case "name" : {
                this.name = newValue;
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
                name: "model",
                binding: "two-way"
            }, {
                name: "name",
                binding: "input"
            }
        ]
    }

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity/components/meta/meta-table-filter.html")
    }


}

export default customComponents.define("meta-table-filter", MetaTableFilter);

class MetaFilterCheckbox extends HTMLElement {

    schema;
    model;

    onModel() {
        this.dispatchEvent(new CustomEvent("model"))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "model" : {
                this.model = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "model",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [DomInput]
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
                        <input is="dom-input" type="checkbox" bind:model="model.search" read:onmodel="onModel()" autocomplete="off">
                    </template>
                </body>
                </html>`
    }

}

const metaFilterCheckbox = customComponents.define("meta-filter-checkbox", MetaFilterCheckbox);

class MetaFilterDatetime extends HTMLElement {

    schema;
    model;

    onModel() {
        this.dispatchEvent(new CustomEvent("model"))
    }

    preInitialize() {
        let element = this.model[this.name];
        if (!element) {
            this.model[this.name] = {
                from : undefined,
                to : undefined
            }
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "model" : {
                this.model = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name : "model",
                binding : "input"
            }
        ]
    }

    static get components() {
        return [MatInputContainer, DomInput]
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
                    <div style="display: flex">
                        <mat-input-container placeholder="From" style="margin: 5px">
                            <input is="dom-input" bind:type="schema.widget" bind:model="model.search.from" step="1" read:onmodel="onModel()">
                        </mat-input-container>
                        <mat-input-container placeholder="To" style="margin: 5px">
                            <input is="dom-input" bind:type="schema.widget" bind:model="model.search.to" step="1" read:onmodel="onModel()">
                        </mat-input-container>
                    </div>
                </template>
                </body>
                </html>`
    }

}

const metaFilterDateTime = customComponents.define("meta-filter-datetime", MetaFilterDatetime);

class MetaFilterDuration extends HTMLElement {

    schema;
    model;

    onModel() {
        this.dispatchEvent(new CustomEvent("model"))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "model" : {
                this.model = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "model",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [DomInput]
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
                    <div style="display: flex; width: 100%">
                        <input is="dom-input" read:type="schema.widget" bind:model="model.search.from" step="1" read:onmodel="onModel()" style="flex: 1" autocomplete="off">
                        <input is="dom-input" read:type="schema.widget" bind:model="model.search.to" step="1" read:onmodel="onModel()" style="flex: 1" autocomplete="off">
                    </div>
                </template>
                </body>
                </html>`
    }

}

const metaFilterDuration = customComponents.define("meta-filter-duration", MetaFilterDuration);

class MetaFilterInput extends HTMLElement {

    schema;
    model;

    onModel() {
        this.dispatchEvent(new CustomEvent("model"))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "model" : {
                this.model = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "model",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [DomInput]
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
                        <input is="dom-input" read:type="schema.widget" bind:model="model.search" read:onmodel="onModel()" style="width: 100%" autocomplete="off"/>
                    </template>
                </body>
                </html>`
    }

}

const metaFilterInput = customComponents.define("meta-filter-input", MetaFilterInput);

class MetaFilterLazyMultiSelect extends HTMLElement {

    schema;
    model;

    onModel() {
        this.dispatchEvent(new CustomEvent("model"))
    }

    domLazySelect(schema) {
        let link = schema.links.list;
        return (query, callback) => {
            fetch(`${link.url}?index=${query.index}&limit=${query.limit}`, {method: link.method})
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
                break
            case "model" : {
                this.model = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "model",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [DomLazySelect]
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
                        <dom-lazy-select read:items="domLazySelect(schema)" read:label="domLazySelectLabel(schema)" bind:model="model.search" read:onmodel="onModel()" multiselect="true">
                            <div let="data">{{{domLazySelectOption(schema, data)}}}</div>
                        </dom-lazy-select>
                    </template>
                </body>
                </html>`
    }

}

const metaFilterLazyMultiSelect = customComponents.define("meta-filter-lazy-multi-select", MetaFilterLazyMultiSelect);

class MetaFilterLazySelect extends HTMLElement {

    schema;
    model;

    onModel() {
        this.dispatchEvent(new CustomEvent("model"))
    }

    domLazySelect(schema) {
        let link = schema.links.list;
        return (query, callback) => {
            fetch(`${link.url}?index=${query.index}&limit=${query.limit}`, {method: link.method})
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
            case "model" : {
                this.model = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "model",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [DomLazySelect]
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
                        <dom-lazy-select read:items="domLazySelect(schema)" read:label="domLazySelectLabel(schema)" bind:model="model.search" read:onmodel="onModel()">
                            <div let="data">{{{domLazySelectOption(schema, data)}}}</div>
                        </dom-lazy-select>
                    </template>
                </body>
                </html>`
    }

}

const metaFilterLazySelect = customComponents.define("meta-filter-lazy-select", MetaFilterLazySelect);