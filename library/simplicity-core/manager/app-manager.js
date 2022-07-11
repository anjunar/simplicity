let language = "en";
let mode = "production"
let library = "library"
let context = "";
let shadowDom = false;
let preFetch = false

export const appManager = new class AppManager {

    constructor() {
        language = navigator.language.split("-")[0]
        if (language === "en" || language === "de") {
            // No Op
        } else {
            language = "en"
        }
    }

    get language() {
        return language;
    }
    set language(value) {
        language = value;
        window.dispatchEvent(new CustomEvent("language", {detail : language}))
    }

    get mode() {
        return mode;
    }
    set mode(value) {
        mode = value;
    }

    get library() {
        return library
    }
    set library(value) {
        library = value;
    }

    get context() {
        return context;
    }
    set context(value) {
        context = value;
    }

    get shadowDom() {
        return shadowDom;
    }
    set shadowDom(value) {
        shadowDom = value;
    }

    get preFetch() {
        return preFetch;
    }
    set preFetch(value) {
        preFetch = value;
    }


};