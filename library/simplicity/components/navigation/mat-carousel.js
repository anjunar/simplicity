import {customComponents} from "../../simplicity.js";
import {libraryLoader} from "../../util/loader.js";
import {compileHTML, proxyFactory} from "../../interpreters/json-interpreter.js";
import {Membrane} from "../../service/membrane.js";

class MatCarousel extends HTMLElement {

    index = {
        cursor : 0,
        sub : 0,
    }

    limit = 5;

    items = () => {};
    window = [];
    size;

    initialize() {
        let handler = (value, oldValue) => {
            if (this.index.cursor > 2 && ! this.window[this.index.sub + 1]) {
                this.load();
            }

            if (this.index.cursor > 4) {
                this.index.resolve.cursor = 0;
                this.index.resolve.sub++;
            }

            if (this.index.cursor < 0) {
                this.index.resolve.cursor = 4;
                this.index.resolve.sub--;
            }


            let implicit = this.window[this.index.sub][this.index.cursor];
            let content = this.content(implicit);
            let context = proxyFactory({$scope : [this]});
            let container = this.querySelector(".container");
            let fragment = compileHTML(this, content, context);
            for (const child of fragment.children) {
                child.style.position = "absolute";
                if (value - oldValue < 0) {
                    child.classList.add("left-added");
                } else {
                    child.classList.add("right-added");
                }
            }
            let lastElementChild = container.lastElementChild;
            if (lastElementChild) {
                lastElementChild.classList.remove("left-added");
                lastElementChild.classList.remove("right-added");
                if (value - oldValue < 0) {
                    lastElementChild.classList.add("left-removed");
                } else {
                    lastElementChild.classList.add("right-removed");
                }
                lastElementChild.addEventListener("animationend",() => {
                    lastElementChild.remove();
                })
            }
            container.appendChild(fragment);

            this.dispatchEvent(new CustomEvent("change", {detail : this.window[this.index.sub][this.index.cursor]}));
        };

        Membrane.track(this.index, {
            property : "cursor",
            element : this,
            handler : handler
        })

        this.load();
    }

    onWheel(event) {
        event.stopPropagation();
        event.preventDefault();

        if (event.deltaY > 0) {
            if (this.index.sub * this.limit + this.index.cursor + 1 < this.size) {
                this.index.cursor++;
            }
        } else {
            if (! (this.index.sub === 0 && this.index.cursor === 0)) {
                this.index.cursor--;
            }
        }

        return false;
    }

    load() {
        let number;
        if (this.index.cursor > 2) {
            number = ( this.index.sub + 1 ) * this.limit;
        } else {
            number = this.index.sub * this.limit;
        }

        this.items({index : number, limit : this.limit}, (rows, size) => {
            this.window.push(rows);
            this.size = size;
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "items" : {
                this.items = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "items",
                binding: "input"
            }
        ]
    }

    static get template() {
        return libraryLoader("simplicity/components/navigation/mat-carousel.html")
    }

}

export default customComponents.define("mat-carousel", MatCarousel)