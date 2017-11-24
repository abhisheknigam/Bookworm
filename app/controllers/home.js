var httpsRequest = require('request');
var utf8 = require('utf8');
const xml = require("xml-parse");
const fs = require('fs');
const parser = require('xml2js');
var urll = require('url');


var information;
var previousIntent;
var state;
var availableGenres = [];

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
                console.log(results.length);
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
                val = title + " by " + author + ". It is one of this week's New York Times bestseller ";
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


exports.getBookRecommendationByAuthor = function(req, res) {
    arr = [];
    url = 'https://www.goodreads.com/search/index.xml?key=ubbbkDQlV14HzjTnWaD3rQ';

    var url_parts = urll.parse(req.url, true);
    var query = url_parts.query;
    console.log(JSON.stringify(query));

    var options = {
        url: url + "&q=" + query.q,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    httpsRequest(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            //var parsedXML = xml.parse(body);
            var parsedXML = "";
            var randomRecommendation = "No book found";
            parser.parseString(body, (err, result) => {
                parsedXML = result;
                var works = parsedXML.GoodreadsResponse.search[0].results[0].work;
                books = [];
                authors = [];
                ratings = [];
                for (var i = 0; i < works.length; i++) {
                    books.push(works[i].best_book[0].title);
                    authors.push(works[i].best_book[0].author[0].name);
                    ratings.push(works[i].average_rating);
                }
                randomNumber = Math.floor(Math.random() * books.length);

                randomBook = books[randomNumber];
                randomBookAuthor = authors[randomNumber];
                randomRatings = ratings[randomNumber];

                randomRecommendation = "I found the book " + randomBook + " by " + randomBookAuthor + ". It is rated " + randomRatings + " by readers ";
                console.log(randomRecommendation);
            });

            return res.status(200).json(randomRecommendation);
        } else {
            console.log(error)
            return res.status(200).json("ERROR");
        }
    });
}

exports.getAllGenre = function(req, res) {
    body = JSON.stringify(req.body);
    arr = [];
    url = 'https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=94097933506e40859a56e77947d60dce';
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
                console.log(results.length);
                for (var i = 0; i < results.length; i++) {
                    availableGenres.push(results[i].list_name);
                }
                res.status(200).json(availableGenres);
                console.log("-----------------Printing All Genres-----------------------");
                console.log(JSON.stringify(availableGenres));
            }
        } else {
            console.log(error)
        }
    });
}

exports.getBookByGenre = function(req, res) {
    dict = {}

    var url_parts = urll.parse(req.url, true);
    var query = url_parts.query;
    console.log(JSON.stringify(query));
    var genre = ''
    if (query.genre == 'travel') {
        genre = 'Travel';
    }

    url = 'https://api.nytimes.com/svc/books/v3/lists//' + genre + '.json?api-key=94097933506e40859a56e77947d60dce';

    var options = {
        url: url,
        method: 'GET',
    };

    httpsRequest(options, function callback(error, response, body) {
        console.log(url);
        if (!error && response.statusCode == 200) {
            var innerInfo = JSON.parse(body);
            if (innerInfo.status == 'OK') {
                results = innerInfo.results;
                console.log(results);
                console.log("length of results" + results.books.length);
                var random = Math.floor(Math.random() * results.books.length);
                recommendedBook = results.books[random];
                recommendedBook = recommendedBook.title
                console.log(recommendedBook);
                console.log("-----------------Printing Book by Genre-----------------------");
                res.status(200).json(recommendedBook);
            }
        } else {
            console.log('error:' + error);
            res.status(404);
        }
    });
}