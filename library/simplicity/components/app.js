import {customComponents} from "../simplicity.js";

export class App extends HTMLElement {}

customComponents.define("native-a", class NativeA extends HTMLAnchorElement {}, {extends : "a"})
customComponents.define("native-button", class NativeButton extends HTMLButtonElement {}, {extends : "button"})
customComponents.define("native-div", class NativeDiv extends HTMLDivElement {}, {extends : "div"})
customComponents.define("native-h1", class NativeH1 extends HTMLHeadingElement {}, {extends : "h1"})
customComponents.define("native-h2", class NativeH2 extends HTMLHeadingElement {}, {extends : "h2"})
customComponents.define("native-h3", class NativeH3 extends HTMLHeadingElement {}, {extends : "h3"})
customComponents.define("native-h4", class NativeH4 extends HTMLHeadingElement {}, {extends : "h4"})
customComponents.define("native-h5", class NativeH5 extends HTMLHeadingElement {}, {extends : "h5"})
customComponents.define("native-h6", class NativeH6 extends HTMLHeadingElement {}, {extends : "h6"})
customComponents.define("native-hr", class NativeHr extends HTMLHRElement {}, {extends : "hr"})
customComponents.define("native-img", class NativeImg extends HTMLImageElement  {}, {extends : "img"})
customComponents.define("native-p", class NativeP extends HTMLParagraphElement {}, {extends : "p"})
customComponents.define("native-span", class NativeSpan extends HTMLSpanElement {}, {extends: "span"})
customComponents.define("native-strong", class NativeStrong extends HTMLElement {}, {extends : "strong"})
customComponents.define("native-tbody", class NativeTbody extends HTMLTableSectionElement {}, {extends : "tbody"})
customComponents.define("native-td", class NativeTd extends HTMLTableCellElement {}, {extends : "td"})
customComponents.define("native-tfoot", class NativeTfoot extends HTMLTableSectionElement {}, {extends : "tfoot"})
customComponents.define("native-thead", class NativeThead extends HTMLTableSectionElement {}, {extends : "thead"})
customComponents.define("native-tr", class NativeTr extends HTMLTableRowElement {}, {extends : "tr"})