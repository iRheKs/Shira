const fs = require('fs');
module.exports = {
    //external file for reading a JSON file
 jsonReader(filePath, cb) {
    fs.readFile(filePath, (err, fileData) => {
        try {
            const object = JSON.parse(fileData);
            return cb && cb(null, object);
        } catch(err) {
            return cb && cb(err);
        }
    })
}
}