var testFolder = './data';
var fs = require('fs');

fs.readdir(testFolder, fucntion(error, filelist) => {

  console.log(filelist);
});
