import {customComponents} from "../../simplicity.js";

class NativeTr extends HTMLTableRowElement {}

export default customComponents.define("native-tr", NativeTr, {extends : "tr"})