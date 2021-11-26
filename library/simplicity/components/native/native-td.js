import {customComponents} from "../../simplicity.js";

class NativeTd extends HTMLTableCellElement {}

export default customComponents.define("native-td", NativeTd, {extends : "td"})