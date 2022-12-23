const NODE_STATE_KEY = "STATE_KEY"
const NODE_STATE_VALUE = "STATE_VALUE"
const NODE_AT_GROUP_KEY = "NODE_AT_GROUP_KEY"
const NODE_AT_GROUP_VALUE = "NODE_AT_GROUP_VALUE"

const COMMENT = "COMMENT_START"

export const parseElement = (value, level = 1) => {
    const val = [];

    let currentVal = ""
    for (let index = 0; index < value.length; index++) {
        const element = value[index];
        if (element === ";") {
            val.push(currentVal.trim());
            currentVal = ""
        } else if (element === "@" && currentVal.trim() === "") {
            // inside an element, an at-group can create another
            //  level of nesting
            const { node, endIndex } = parseNode(value.substr(index), level + 1)
            val.push(node)
            index += endIndex;
        } else if (element === "&" && currentVal.trim() === "") {
            // if this is a nested node, parse the element
            //  as a nested node
            const { node, endIndex } = parseNode(value.substr(index), level + 1)
            val.push(node)
            index += endIndex;
        } else if ((element === "." || element === ":") && currentVal.trim() === "") {
            // if this is a nested class/selector, or a :-selected element, parse
            //  as a nested node
            const { node, endIndex } = parseNode(value.substr(index-1), level + 1)
            val.push(node)
            index += endIndex;
        } else if (element === "}") {
            if (currentVal.trim() !== "") {
                val.push(currentVal.trim());
            }
            return { val, endIndex: index - 1 }
        } else {
            currentVal += element
        }
    }

    return { val, endIndex: value.length - 1 }
}

export const parseNode = (value, level = 0) => {
    const node = {}
    // We always start with a key
    let state = NODE_STATE_KEY;
    let prevState = NODE_STATE_KEY
    let currentKey = ""
    let keyStartIndex = 0

    for (let index = 0; index < value.length; index++) {
        const element = value[index];
        if (element === "}" && level > 0) {
            // for any non-top level element, bubble up with the current node
            return { node, endIndex: index }
        } else if (state !== NODE_AT_GROUP_VALUE && element === "}") {
            // skip top level element 
            continue;
        }

        // helpers for the current scope - this might look suboptimal 
        //  (creating a function in a loop), but it seems it's inlined
        //  in all browsers, so no performance impact
        function atNode_create(element) {
            node[currentKey.trim()] = [...(node[currentKey] || []), ...(Array.isArray(element.node) ? element.node : [element.node])];
            index += element.endIndex + 1;
        }

        if (element === "/" && value[index + 1] === "*") {
            // switching to comment state if we have a /* series
            //  and continue after the *
            prevState = state
            state = COMMENT;
            index += 2
        }
        switch (state) {
            case COMMENT:
                if (element === "*" && value[index + 1] === "/") {
                    state = prevState
                    index += 2
                    keyStartIndex = index
                }
                break;
            case NODE_STATE_KEY:
                if (currentKey.trim() === "" && element.trim() === "@") {
                    // if a key is starting with an @
                    //  this is an at-group
                    state = NODE_AT_GROUP_KEY;
                    currentKey += element.trim();
                } else if (element === "{") {
                    // read the body for the key. In typical elements this 
                    //  can only be one
                    state = NODE_STATE_VALUE;
                    currentKey = currentKey.trim();
                    node[currentKey] = node[currentKey] || [];
                } else if (element === ":" && value[index + 1] === " ") {
                    // this is when we were thinking this was an object when really this is pair - can only happen in @-blocks
                    // resetting index, we have to read the key again
                    index = keyStartIndex
                    const { val, endIndex } = parseElement(value.substr(index), level + 1)
                    return { node: val, endIndex: index + endIndex }
                } else {
                    currentKey += element;
                }
                break;
            case NODE_STATE_VALUE:
                const { val, endIndex } = parseElement(value.substr(index), level + 1)
                index += endIndex;
                node[currentKey] = [...node[currentKey], ...val]
                state = NODE_STATE_KEY;
                currentKey = ""
                keyStartIndex = index;
                break;
            case NODE_AT_GROUP_KEY:
                if (element === ";") {
                    // This is for short-at-keys like '@charset "utf-8";' only
                    node[currentKey] = undefined;
                    currentKey = "";
                    keyStartIndex = index;
                    state = NODE_STATE_KEY;
                }
                else if (element === "{") {
                    currentKey = currentKey.trim();
                    atNode_create(parseNode(value.substr(index + 1), level + 1))
                    state = NODE_AT_GROUP_VALUE
                } else {
                    currentKey += element;
                }
                break;
            case NODE_AT_GROUP_VALUE:
                if (element.trim() === "") {
                    break
                }
                else if (element !== "}") {
                    // an at-group can have multiple elements
                    //  so as long as we don't have an '}' continue
                    //  to read through the nodes 
                    atNode_create(parseNode(value.substr(index), level + 1))
                } else {
                    currentKey = "";
                    keyStartIndex = index;
                    state = NODE_STATE_KEY;
                }
                break;
        }
    }
    return { node, endIndex: value.length }
}
