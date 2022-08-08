
export function escapedHTML(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function arrayEqual(arr1, arr2): boolean {
    if (!arr1 || !arr2) {
        return false;
    }

    // compare lengths - can save a lot of time 
    if (arr1.length != arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        // Check if we have nested arrays
        if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!arrayEqual(arr1[i], arr2[i])) {
                return false;
            }

        }
        else if (arr1[i] instanceof Object && arr2[i] instanceof Object) {
            // recurse into another objects
            //console.log("Recursing to compare ", this[propName],"with",object2[propName], " both named \""+propName+"\"");
            if (!objectEqual(arr1[i], arr2[i])) {
                return false;
            }
        }
        else if (!!arr1[i] && !!arr2[i] && arr1[i] != arr2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

export function objectEqual(obj1, obj2) {
    //For the first loop, we only check for types
    for (const key in obj1) {
        //Check for inherited methods and properties - like .equals itself
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
        //Return false if the return value is different
        if (obj1.hasOwnProperty(key) != obj2.hasOwnProperty(key)) {
            return false;
        }
        //Check instance type
        else if (typeof obj1[key] != typeof obj2[key]) {
            //Different types => not equal
            return false;
        }
    }
    //Now a deeper check using other objects property names
    for (const key in obj2) {
        //We must check instances anyway, there may be a property that only exists in obj2
        //I wonder, if remembering the checked values from the first loop would be faster or not 
        if (obj1.hasOwnProperty(key) != obj2.hasOwnProperty(key)) {
            return false;
        }
        else if (typeof obj1[key] != typeof obj2[key]) {
            return false;
        }
        //If the property is inherited, do not check any more (it must be equa if both objects inherit it)
        if (!obj1.hasOwnProperty(key))
            continue;

        //Now the detail check and recursion

        //obj1 returns the script back to the array comparing
        /**REQUIRES Array.equals**/
        if (obj1[key] instanceof Array && obj2[key] instanceof Array) {
            // recurse into the nested arrays
            if (!arrayEqual(obj1[key], obj2[key]))
                return false;
        }
        else if (obj1[key] instanceof Object && obj2[key] instanceof Object) {
            // recurse into another objects
            //console.log("Recursing to compare ", obj1[key],"with",obj2[key], " both named \""+key+"\"");
            if (!objectEqual(obj1[key], obj2[key]))
                return false;
        }
        //Normal value comparison for strings and numbers
        else if (!!obj1[key] && !!obj2[key] && obj1[key] != obj2[key]) {
            return false;
        }
    }
    //If everything passed, let's say YES
    return true;
}