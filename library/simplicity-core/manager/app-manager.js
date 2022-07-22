let mode = "production"
let library = "library"
let shadowDom = false;
let preFetch = false
let history = false;

export const appManager = new class AppManager {

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

    get history() {
        return history;
    }
    set history(value) {
        history = value;
    }

};