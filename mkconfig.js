const fs = require('fs');

var config = {
  files: []
};

function getInfo (callback) {  
  fs.readdir('./js/', (err, files) => {
    files.forEach(file => {
      if(file !== '.DS_Store' && file !== "common") {
        config.files.push(file);
      }
    });

    callback();
  });
}

function setInfo() {
  var filepath_1 = "./config.js";
  

  var fileContent_1 = 'module.exports = ' + JSON.stringify(config);

  fs.writeFile(filepath_1, fileContent_1, (err) => {
    if (err) throw err;
      console.log("The file was succesfully saved!");
  }); 

  var filepath_2 = "./dist/config.json";
  var fileContent_2 = JSON.stringify(config);


  fs.writeFile(filepath_2, fileContent_2, (err) => {
    if (err) throw err;
      console.log("The file was succesfully saved!");
  }); 

}

getInfo(setInfo);