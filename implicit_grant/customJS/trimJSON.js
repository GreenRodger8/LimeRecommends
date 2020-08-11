//Custom filter and trim functions for JSON

/**
 * Creates a filter function that will only keep certain key/value pairs. Flattens structure
 * @param   {JSON} oldJson JSON Object to trim 
 * @param   {Array} keys Keys to keep from oldJSON 
 *                       If a key is an array then it is treated as a path to the desired value,
 *                       i.e. [key1, key2, ..., keyX] => newJson[keyX] = oldJson[key1][key2][...][keyX]
 * @returns {Function} Function that trims JSON objects passed to it
 */
function createTrimFunction(keys) {
    return function trimFunction(oldJson) {
        var newJson = {};
        for (let key of keys) {
            if (typeof key === 'string') newJson[key] = oldJson[key];
            else if (typeof key === 'object' && Array.isArray(key) && key.length > 0) {
                var currentLayer = oldJson[key[0]];
                var index = 1;
                while (key.length > index) {
                    currentLayer = currentLayer[key[index]];
                    index++;
                }
                newJson[key[index - 1]] = currentLayer;
            }
        }
        return newJson;
    }
}
exports.createTrimFunction = createTrimFunction;

/**
 * Creates a filter function that will only keep certain key/value pairs. Mantains structure
 * @param   {JSON} oldJson JSON Object to trim 
 * @param   {Array} keys Keys to keep from oldJSON 
 *                       If a key is an array then the first value of the array is used as the key,
 *                       the rest of the array is then treated as a nested JSON and recursed
 * @returns {Function} Function that trims JSON objects passed to it
 */
function createJSONFilter(keys) {
    return function trimJSON(oldJson) {
        var newJson = {};
        for (let key of keys) {
            if (typeof key === 'string') newJson[key] = oldJson[key];
            else if (typeof key === 'object' && Array.isArray(key)) {
                var recurseFilter = createJSONFilter(key.slice(1));
                newJson[key[0]] = recurseFilter(oldJson[key[0]]);
            }
        }
        return newJson;
    };
}
exports.createJSONFilter = createJSONFilter;

/**
 * Elements in array are grouped into sub arrays
 * @param {Array} array Array to be manipulated
 * @param {Number} subSize Size of sub arrays
 */
function createSubArrays(array, subSize) {
    const reducer = (accumulator, currentValue, index) => {
        var outerIndex = Math.floor(index / subSize);
        if (index % subSize === 0) accumulator.push([]);
        accumulator[outerIndex].push(currentValue);
        return accumulator;
    };
    return array.reduce(reducer, []);
}
exports.createSubArrays = createSubArrays;

/**
 * Joins subarrays in an array to form a single super array
 * @param {Array} array 
 */
function joinSubArrays(array) {
    const reducer = (accumulator, currentValue) => {
        return accumulator.concat(currentValue);
    }
    return array.reduce(reducer, []);
}
exports.joinSubArrays = joinSubArrays;
