import {customComponents} from "../../simplicity.js";

class NativeTfoot extends HTMLTableSectionElement {}

export default customComponents.define("native-tfoot", NativeTfoot, {extends : "tfoot"})