//Custom I/O Functions 

const fs = require('fs');
const fsPromises = require('fs').promises;

/**
 * Writes data to file. Replaces file if it already exists, creates file if it does not exist
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
}
exports.writeToFile = writeToFile;

/**
 * Reads data from file
 * @param {String} path
 * @returns {Promise} Resolves to string of file data
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
}
exports.readFromFile = readFromFile;

/**
 * Creates directory
 * @param {String} path
 * @returns {Promise} Resolves to true if directory was made, false if it already exists
 */
async function createDirectory(path) {
    try {
        console.log(`Creating directory for ${path}`);
        await fsPromises.mkdir(path);
        console.log(`Finished making directory for ${path}`);
        return true;
    } catch (error) {
        console.error(error);
        if (error.code === 'EEXIST')
            return false;
        else
            throw error;
    }
}
exports.createDirectory = createDirectory;

/**
 * Checks if file or directory exists
 * @param {String} path
 * @returns {Promise} Resolves to true if file/directory exists, false otherwise
 */
async function checkPath(path) {
    try {
        fs.accessSync(path, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}
exports.checkPath = checkPath;

/**
 * Returns an array of a directory's files and subdirectories
 * @param {String} path
 */
async function getDirectoryNames(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) reject(err);
            else resolve(files);
        });
    });
}
exports.getDirectoryNames = getDirectoryNames;