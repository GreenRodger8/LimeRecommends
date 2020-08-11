//Custom I/O Functions 

const fsPromises = require('fs').promises;

/**
 * Writes data to file. Replaces file if it already exists
 * @param {String} path Path of file to write to. Also includes file name and extension
 * @param {String|Buffer|Uint8Array} data Data to write to file
 * @returns {Promise} Resolves once writeStream ends
 */
async function writeToFile(path, data) {
    let fileHandle;
    try {
        fileHandle = await fsPromises.open(path, 'w');
    } catch (error) {
        console.error(error);
        return false;
    } finally {
        if (fileHandle !== undefined) {
            await fileHandle.writeFile(data, 'utf8');
            await fileHandle.close();
            return true;
        }
    }
    //return new Promise((resolve, reject) => {
    //    const writeStream = fs.createWriteStream(path);
    //    writeStream.write(data);
    //    console.log(`Writing to path: ${path}`);
    //    writeStream.end();
    //    writeStream.on('close', () => {
    //        console.log(`Finished writing to path: ${path}`);
    //        resolve();
    //    })
    //    writeStream.on('error', (error) => {
    //        reject(error);
    //    })
    //});
}
exports.writeToFile = writeToFile;

/**
 * Reads data from file
 * @param {any} path
 */
async function readFromFile(path) {
    let fileHandle;
    let fileContent;
    try {
        fileHandle = await fsPromises.open(path, 'r');
    } catch (error) {
        console.error(error);
        return null;
    } finally {
        if (fileHandle !== undefined) {
            fileContent = await fileHandle.readFile('utf8');
            await fileHandle.close();
            return fileContent;
        }
    }
    //return new Promise((resolve, reject) => {
    //    const readStream = fs.createReadStream(path, { encoding: "utf8" });
    //    console.log(`Created read stream to path: ${path}`);
    //    var data = '';
    //    readStream.on('readable', () => {
    //        console.log(`Reading from path: ${path}`);
    //        var chunk;
    //        while (null !== (chunk = readable.read())) {
    //            data += chunk;
    //        }
    //    });
    //    readStream.on('end', () => {
    //        console.log(`Finished reading from path: ${path}`);
    //        resolve(data);
    //    });
    //    readStream.on('error', (error) => {
    //        reject(error);
    //    });
    //});
}
exports.readFromFile = readFromFile;
