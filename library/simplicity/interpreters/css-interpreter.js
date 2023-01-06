import {toCamelCase} from "../util/tools.js";

function process(cssRules) {
    return cssRules.reduce((prev, cssRule) => {
        if (cssRule instanceof CSSImportRule) {
            prev["@import"] = cssRule.href;
            return prev;
        }
        if (cssRule instanceof CSSMediaRule) {
            prev["@media " + cssRule.conditionText] = process(Array.from(cssRule.cssRules));
            return prev;
        }
        if (cssRule instanceof CSSKeyframeRule) {
            prev[cssRule.keyText] = Array.from(cssRule.style)
                .reduce((prev, current) => {
                    let style = toCamelCase(current);
                    prev[style] = cssRule.style[style];
                    return prev
                }, {});
            return prev
        }
        if (cssRule instanceof CSSKeyframesRule) {
            prev["@keyframes " + cssRule.name] = process(Array.from(cssRule.cssRules))
            return prev;
        }
        if (cssRule instanceof CSSRule) {
            prev[cssRule.selectorText] = Array.from(cssRule.style)
                .reduce((prev, current) => {
                    let style = toCamelCase(current);
                    prev[style] = cssRule.style[style];
                    return prev
                }, {});
            return prev
        }
    }, {})
}

export function parse(styleElement) {
    let cssRules = Array.from(styleElement.sheet.cssRules);
    return function(context) {
        return process(cssRules);
    }
}