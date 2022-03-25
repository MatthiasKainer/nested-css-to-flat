import { flatten } from "./flattener.js";
import { parseNode } from "./parser.js";

export function transform(cssString) {
    return flatten(
        parseNode(cssString).node
    )
}
