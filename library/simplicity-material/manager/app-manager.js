let language = "en";

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

};