import {customComponents} from "../../simplicity.js";

class NativeTbody extends HTMLTableSectionElement {}

export default customComponents.define("native-tbody", NativeTbody, {extends : "tbody"})