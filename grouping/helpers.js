var fs = require('fs');
var Baby = require('babyparse');

var identityMatchPhone = function(list,twoPhones) {

    var uniques = {};
    var item;

    if (!twoPhones) {
      for (var i = 0; i < list.length; i++) {
          
        // make phone numbers uniform (extract 1 from the beginning)
        item = list[i][0].Phone.replace(/^(1)/,"");

        // disregard blank phone numbers
        if (!item) {
          continue;
        }

          // console.log('item: ',item);
          // found duplicate
          if (uniques[item]) {

            // assign matching Identifier to item if one isn't present
            if (!list[i][0].Identifier) {
              list[i][0].Identifier = uniques[item];
              console.log('current list: ',list[i][0]);
            }
          } else {
              // found unique item, assigned ID to it
              uniques[item] = list[i][0].ID;
          }
      }
    } else {
      // two separate phone fields found
      for (var i = 0; i < list.length; i++) {
        item1 = list[i][0].Phone1.replace(/^(1)/,"");
        item2 = list[i][0].Phone2.replace(/^(1)/,"");

        // console.log('item1: ',item1);
        // console.log('item2: ',item2);

        // found duplicate
        if (uniques[item1]) {

          // assign matching Identifier to item if one isn't present
          if (!list[i][0].Identifier) {
            list[i][0].Identifier = uniques[item1];
            console.log('current list: ',list[i][0]);
          }
          // found duplicate
        } else if (uniques[item2]) {

          // assign matching Identifier to item if one isn't present
          if (!list[i][0].Identifier) {
            list[i][0].Identifier = uniques[item2];
            console.log('current list: ',list[i][0]);
          }
        } else {
          // found unique item, assigned ID to it (if phone field isn't blank)
          if (item1) {
            uniques[item1] = list[i][0].ID;
          }
          if (item2) {
            uniques[item2] = list[i][0].ID;
          }
        }
      }
    }
  };

  var identityMatchEmail = function(list,twoEmails) {

    var uniques = {};
    var item;

    // only one email field found
    if (!twoEmails) {
      for (var i = 0; i < list.length; i++) {
          
        item = list[i][0].Email;

        // disregard blank emails
        if (!item) {
          continue;
        }

          // console.log('item: ',item);
          // found duplicate
          if (uniques[item]) {

            // assign matching Identifier to item if one isn't present
            if (!list[i][0].Identifier) {
              list[i][0].Identifier = uniques[item];
              console.log('current list: ',list[i][0]);
            }
          } else {
              // found unique item, assigned ID to it
              uniques[item] = list[i][0].ID;
          }
      }
    } else {

      // two separate email fields found
      for (var i = 0; i < list.length; i++) {
        item1 = list[i][0].Email1;
        item2 = list[i][0].Email2;

        // console.log('item1: ',item1);
        // console.log('item2: ',item2);

        // found duplicate
        if (uniques[item1]) {

          // assign Identifier to item if one isn't present
          if (!list[i][0].Identifier) {
            list[i][0].Identifier = uniques[item1];
            console.log('current list: ',list[i][0]);
          }
        // found duplicate
        } else if (uniques[item2]) {
            
          // assign Identifier to item if one isn't present
          if (!list[i][0].Identifier) {
            list[i][0].Identifier = uniques[item2];
            console.log('current list: ',list[i][0]);
          }
        } else {
          // found unique item, assigned ID to it (if email isn't blank)
          if (item1) {
            uniques[item1] = list[i][0].ID;
          }
          if (item2) {
            uniques[item2] = list[i][0].ID;
          }
        }
      }
    }
};

var loadFile = function(filename,identifier) {
  	var content = [];
  	var count = 1;
  	var twoPhoneFields = false;
  	var twoEmailFields = false;

  	fs.readFile(__dirname + '/' + filename, 'utf8',function(err,data) {
  		if (err) {
  			throw err;
  		}

  		Baby.parse(data, {
  			header: true,
  			step: function(results,parser) {
  				// console.log("Row data:", results.data);

  				// filter phone numbers for uniformity (remove non-numerical numbers)
  				if (results.data[0]['Phone']) {
  					results.data[0]['Phone'] = results.data[0]['Phone'].replace(/\D/g,'');
  				}
  				if (results.data[0]['Phone1']) {
  					twoPhoneFields = true;
  					results.data[0]['Phone1'] = results.data[0]['Phone1'].replace(/\D/g,'');
  				}
  				if (results.data[0]['Phone2']) {
  					results.data[0]['Phone2'] = results.data[0]['Phone2'].replace(/\D/g,'');
  				}

  				// check for two email fields
  				if (results.data[0]['Email1']) {
  					twoEmailFields = true;
  				}

  				// add ID to data
  				results.data[0].ID = ++count;

  				//add Identifier field to data
  				results.data[0].Identifier = '';

          // console.log('RESULTS: ',results.data[0]);
  				content.push(results.data);
  			},
        skipEmptyLines: true,
  			complete: function() {
          if (identifier === 'samePhoneNumber') {
            // call function to identity-match via phone field(s)
            // then output the new marked data
            identityMatchPhone(content,twoPhoneFields);
            writeData(content);
          } else if (identifier === 'sameEmail') {
            // call function to identity-match via email field(s)
            // then output the new marked data
            identityMatchEmail(content,twoEmailFields);
            writeData(content);
          }
            console.log('content :',content);
  			}
      });

  	});
}; 

var writeData = function(content) {

  // remove array wrapping our JSON object
  var cleanedArr = [];

  for (var i = 0; i < content.length; i++) {
  	cleanedArr.push(content[i][0]);
  }

  	fs.writeFile('output.csv', Baby.unparse(cleanedArr), function(err) {
  		if (err) {
  			throw err;
  		}
  	});

  console.log('cleanedArr: ',cleanedArr);
  console.log('File saved to output.csv');
};

module.exports = {
  identityMatchPhone: identityMatchPhone,
  identityMatchEmail: identityMatchEmail,
  loadFile: loadFile,
  writeData: writeData
};