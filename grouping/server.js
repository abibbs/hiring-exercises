var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var Baby = require('babyparse');
var helpers = require('./helpers.js');
var port = 3000;

// read index.html for root GET request
fs.readFile(__dirname  + '/interface/index.html', function(err,data) {
	if (err) {
		throw err;
	}

	http.createServer(function(req,res) {
		// handle POST request
		if (req.method === 'POST') {

      // parse data from POST request
      var body = '';
      req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6) {
          req.connection.destroy();
        }
      });

      req.on('end', function () {
        var post = qs.parse(body);
        // console.log(post);

        // pass params of csvFile and matchingIdentifier to our helper (to load the file and begin identity matching)
        helpers.loadFile(post.csvFile,post.matchingIdentifier);
      });

  		res.writeHead(200,{'Content-Type':'text/html'});
  		res.write('Output saved to output.csv!');
      res.end();
		} else {
      // or display index page
      res.writeHead(200,{'Content-Type':'text/html'});
      res.write(data);
      res.end();
		}

	}).listen(port);
	console.log('Listening on http://localhost:' + port);
});