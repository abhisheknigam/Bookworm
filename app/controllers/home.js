var httpsRequest = require('request');
var utf8 = require('utf8');

var information;
exports.getBestSeller = function(req, res) {
    body = JSON.stringify(req.body);
    arr = [];
    url = 'https://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json?api-key=94097933506e40859a56e77947d60dce';
    var options = {
        url: url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
    };
    httpsRequest(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var innerInfo = JSON.parse(body);
            if (innerInfo.status == 'OK') {
                results = innerInfo.results;
                for (var i = 0; i < 3; i++) {
                    dictionary = results[i];
                    title = dictionary['title'];
                    title = title.replace(/["]+/g, '');
                    author = dictionary['author'];
                    val = title + " by " + author;
                    console.log(val);
                    arr.push(val);
                }
                res.status(200).json(arr);
                console.log("-----------------Printing Result-----------------------");
                console.log(JSON.stringify(arr));
            }
            //console.log(innerInfo);
        } else {
            console.log(error)
        }
    });

}

exports.getBestSellerByDate = function(req, res) {
    body = JSON.stringify(req.body);
    arr = [];
    url = "https://api.nytimes.com/svc/books/v3/lists/2017-01-01/Hardcover Fiction.json?api-key=94097933506e40859a56e77947d60dce";
    var options = {
        url: url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
    };
    httpsRequest(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var innerInfo = JSON.parse(body);
            if (innerInfo.status == 'OK') {
                results = innerInfo.results.books;
                for (var i = 0; i < 3; i++) {
                    dictionary = results[i];
                    title = dictionary['title'];
                    title = title.replace(/["]+/g, '');
                    author = dictionary['author'];
                    val = title + " by " + author;
                    console.log(val);
                    arr.push(val);
                }
                res.status(200).json(arr);
                console.log("-----------------Printing Result-----------------------");
                console.log(JSON.stringify(arr));
                information = arr;
            }
            //console.log(innerInfo);
        } else {
            console.log(error)
        }
    });
}

exports.recommendMeAbook = function(req, res) {
    body = JSON.stringify(req.body);
    arr = [];
    var date = new Date().toJSON().slice(0, 10);
    console.log();
    url = "https://api.nytimes.com/svc/books/v3/lists/" + date + "/Hardcover Fiction.json?api-key=94097933506e40859a56e77947d60dce";
    var options = {
        url: url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
    };
    httpsRequest(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var innerInfo = JSON.parse(body);
            if (innerInfo.status == 'OK') {
                results = innerInfo.results.books;
                var randomRecommendation = results[Math.floor(Math.random() * results.length)];
                title = randomRecommendation['title'];
                title = title.replace(/["]+/g, '');
                author = randomRecommendation['author'];
                val = title + " by " + author + ". It is this week's New York Times bestseller ";
                information = randomRecommendation['description'];
                console.log(val);
                arr.push(val);

                res.status(200).json(arr);
                console.log("-----------------Printing Result-----------------------");
                console.log(JSON.stringify(arr));
            }
            //console.log(innerInfo);
        } else {
            console.log(error)
        }
    });
}

exports.getSummary = function(req, res) {
    if (information != null && information != '') {
        console.log(information);
        return res.status(200).json(information);
    } else {
        console.log('No book specified');
        return res.status(200).json('No book specified');
    }
}