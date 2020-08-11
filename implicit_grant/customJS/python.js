//Custom python functions

const { spawn } = require('child_process');

/**
 * Spawn python to perform task
 * @param   {Array} arguments Array of string arguments
 * @param   {String} pythonName Name of script to spawn
 * @returns {Promise} Resolves to final string result of python script or error
 */
function spawnPython(pythonName, arguments) {
    return new Promise((resolve, reject) => {
        const python = spawn('python.exe', [pythonName + '.py', ...arguments]);
        console.log(`Python script \"${pythonName}.py\" spawned with argument(s): ${arguments}`);

        var pythonResult;
        python.stdout.on('data', (data) => {
            pythonResult = data.toString();
            console.log(`Python script \"${pythonName}.py\" returned data: ${pythonResult}`);
        });
        python.stderr.on('data', (data) => {
            console.error(`Python script \"${pythonName}.py\" stderr: ${data}`);
            reject(data);
        });
        python.on('exit', (code) => {
            console.log(`Python script \"${pythonName}.py\" exited with code: ${code}`);
            resolve(pythonResult);
        });
    });
};
exports.spawnPython = spawnPython;