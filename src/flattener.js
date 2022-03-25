const isObject = (subject) => typeof subject === 'object' && subject !== null

export const flatten = (data, parent = "") => {
    const atRule = {}
    const innerFlatten = (data, parent = "") => {
        // This creates an :is block if there are multiple keys in the 
        //  parent. This query is not robust and can be improved
        parent = (parent.indexOf(",") > -1 && parent.indexOf(":is") !== 0) ? `:is(${parent})` : parent
        return Object.entries(data).map(([key, values]) => {
            // we support nest because we don't disallow arbitrary positions for & yet
            //  so it's more accidentaly. Remove it without taking action
            key = key.replace(/\@nest/gi, "")
            // Replace any occurence of & with the parent in the key
            key = key.replace(/\&/gi, parent)
            if (key.indexOf("@media") === 0) {
                atRule[key] = atRule[key] || ""
                atRule[key] += values
                    ? values.filter(isObject).reduce((result, element) =>
                        (result += `${innerFlatten(element, parent)} `, result),
                        "")
                    : null
                return ""
            }
            if (key.indexOf("@") === 0) {
                // at blocks are special as they can have
                //  nested blocks in css already. In our
                //  default case, we have to create new 
                //  keys for every object
                return ` ${key} { ${values
                    .filter(v => !isObject(v))
                    .join(";")
                    }${values
                        .filter(isObject)
                        .map(element => innerFlatten(element, key))
                        .join(" ")
                    } }`
            }
            if (!values) {
                return `${key.trim()};`
            }
            return `${key} { ${values
                .filter(v => !isObject(v))
                .join(";")
                } } ${
                // move all objects out of the key and flatten the keys
                values
                    .filter(isObject)
                    .map(element => innerFlatten(element, key))
                    .join(" ")
                }`
        }).join("").trim()
    }
    const innerFun = innerFlatten(data, parent)
    return innerFun + Object
        .entries(atRule)
        .reduce((prev, [key, value]) =>
            prev += value ? `${key} { ${value.trimEnd()} }` : `${key};`, " ")
        .trimEnd()

}