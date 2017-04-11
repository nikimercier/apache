module.exports = {
  isArray: isArray,
  sort: sort,
  by: by
}

function isArray (value) {
    return value && 
        typeof value === 'object' && 
        typeof value.length === 'number' && 
        typeof value.splice === 'function' &&
        !(value.propertyIsEnumerable('length'))
}

function sort (arr) {
    if (isArray(arr)) {
        return arr.sort(sortArrHandler)    
    } else {
        return []
    }
}

function sortArrHandler (a, b) {
    if (a === b) {
        return 0
    }
    if (typeof a === typeof b) {
        a = typeof a === 'string'? a.toLowerCase() : a
        b = typeof b === 'string'? b.toLowerCase() : b
        return a < b ? -1 : 1
    }
    return typeof a < typeof b ? -1 : 1 
}

function by (n, m) {
    return function (o, p) {
        var a, b
        if (o && p && typeof o === 'object' && typeof p === 'object') {
            a = o[n]
            b = p[n]
            if (a === b) {
                return typeof m === 'function' ? m(o, p) : 0
            }
            if (typeof a === typeof b) {
                return a < b ? -1 : 1
            }
            return typeof a < typeof b ? -1 : 1
        } else {
            throw {
                name: 'Error',
                message: 'Expected an object when sorting by ' + n
            }
        }
    }
}