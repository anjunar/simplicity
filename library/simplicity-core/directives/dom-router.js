import {customComponents} from "../simplicity.js";
import {viewManager} from "../manager/view-manager.js";
import {appManager} from "../manager/app-manager.js";

class DomRouter extends HTMLElement {

    level = 0

    handler = (event) => {
        this.dispatchEvent(new CustomEvent("load"))

        let appElement = this.app;
        let baseElement = document.querySelector("base")
        let routes = appElement.constructor.routes;
        let urlSegments;
        if (appManager.history) {
            if (window.location.pathname.indexOf("/") > -1) {
                urlSegments = window.location.pathname.replace(baseElement.getAttribute("href"), "").split("/");
            } else {
                urlSegments = ["index"];
            }
        } else {
            if (window.location.hash.indexOf("#") > -1) {
                urlSegments = window.location.hash.split("#")[1].split("/").slice(1)
            } else {
                urlSegments = ["index"];
            }
        }
        let files = [];
        let cursor = routes;
        let queryParams = {};

        function *segmentsIterator () {
            for (const urlSegment of urlSegments) {
                yield urlSegment;
            }
        }

        function process(urlSegment, cursor, index) {
            let path = urlSegment.split("?")[0];
            let cursorSegments = Object.keys(cursor.children);
            let cursorRegex = cursorSegments.map(segment => {
                let splitElement = segment.split("/")[index];
                let regexVariable = /{(\w+)}/;
                let regexVariableResult = regexVariable.exec(splitElement);
                if (regexVariableResult) {
                    queryParams[regexVariableResult[1]] = path;
                    return new RegExp(".*");
                }
                return new RegExp(splitElement);
            });
            let regex = cursorRegex.find(regex => regex.test(path));
            if (regex) {
                let indexOfSegment = cursorRegex.indexOf(regex);
                return cursorSegments[indexOfSegment];
            } else {
                throw new Error(`no route found for ${urlSegment}. existing routes: ${cursorSegments}`)
            }
        }

        let iterator = segmentsIterator();
        let next = iterator.next();

        while (! next.done) {
            let urlSegment = next.value;
            let cursorSegment = process(urlSegment, cursor, 0);

            let missingSegments = cursorSegment.split("/").slice(1)
            missingSegments.forEach((segment, index) => {
                urlSegment = iterator.next().value
                process(urlSegment, cursor, index + 1)
            })

            cursor = cursor.children[cursorSegment];
            if (cursor.file) {
                if (cursor.override) {
                    files[files.length - 1] = cursor.file
                } else {
                    files.push(cursor.file)
                }

                // urlSegment = window.location.search;
                let indexOf = urlSegment.indexOf("?");
                let hashes;
                if (indexOf === -1) {
                    hashes = [urlSegment]
                } else {
                    hashes = [urlSegment.substring(0, indexOf), urlSegment.substring(indexOf + 1)];
                }

                if (hashes[1]) {
                    let rawQueryParams = hashes[1].split("&");
                    for (const rawQueryParam of rawQueryParams) {
                        let queryParamRegex = /(\w+)=([\w\d\-/?=%]*)/g;
                        let queryParameterRegexResult = queryParamRegex.exec(rawQueryParam);
                        queryParams[queryParameterRegexResult[1]] = queryParameterRegexResult[2]
                    }
                }

            }
            next = iterator.next();
        }

        let file = files[this.level]

        if (file) {
            viewManager.load(file, queryParams)
                .then((view) => {
                    view.app = this.app;
                    for (const child of Array.from(this.children)) {
                        child.remove();
                    }
                    this.appendChild(view);
                    let nextLevelRouter = this.querySelector("dom-router");
                    if (nextLevelRouter) {
                        nextLevelRouter.addEventListener("loadend", () => {
                            this.dispatchEvent(new CustomEvent("loadend"))
                        })
                    } else {
                        this.dispatchEvent(new CustomEvent("loadend"))
                    }
                })
        }
    }

    destroy() {
        window.removeEventListener("popstate", this.handler);
    }

    initialize() {
        this.style.display = "block"
        window.addEventListener("popstate", this.handler);
        this.handler();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "level" : {
                this.level = Number.parseInt(newValue);
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "level",
                binding: "input"
            }
        ]
    }

}

export default customComponents.define("dom-router", DomRouter);