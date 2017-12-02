var httpsRequest = require('request');
var utf8 = require('utf8');
const xml = require("xml-parse");
const fs = require('fs');
const parser = require('xml2js');
var urll = require('url');
var Enum = require('enum');

var information;
var previousIntent;
var state;
var availableGenres = [];
var author;
var book;
var bookid;
var rating;

//TODO

var noBookSpecified = ["Sorry! I don\'t have a book name. Can you please tell me the book\'s name first ?", 'It seems you didn\'t specify a book. Can you say it again ?', 'Sorry, Which book are you taking about again ?']
var afterBookRecommend = ["% .Would you like me to read a summary ?"]
var moreInfo = ["I can give you more info about it's ratings, reviews or summary. Do you want to know more", "Would you like to know more about it's ratings, reviews or summary ?"];
var bookAppend = ["I found % on this week's New York Times bestseller list", "The book % is highly rated on good reads", "I think you will love reading  %", " How about % . It is trending this week."]
var authorName = ["The name of the author is %", "Author's name is %", "% is the author of the book"]
var bookSummary = ["This book is about %", "A short summary of the book says %", "Summary tells that %"]
var states = new Enum(['START', 'SRCHBYGENRE','SRCHBYAUTHOR','BOOKFOUND', 'BOOKNAMEKNOWN', 'BOOKNAMEUNKNOWN']);

var currentState = states.START;

var genreDict = { 'blues': 1, 'sad': 1, 'thriller': 2, 'horror': 2, 'crime': 2, 'children': 3, 'animal': 4, 'biography': 5, 'education': 6, 'Food and Fitness': 7, 'health': 8, 'Relationships': 9, 'Business': 10, 'Business Books': 10, 'Paperback Business Books': 10, 'Family': 11, 'Political': 12 }
var mapping = { 1: 'Advice How-To and Miscellaneous', 2: 'Crime and Punishment', 3: 'Childrens Middle Grade', 4: 'Animals', 5: 'Indigenous Americans', 6: 'Food and Fitness', 8: 'Health', 9: 'Relationships' }

var BookInfo = function(nm, aut, rating, genre, summ) {
    this.name = nm;
    this.author = aut;
    this.rating = rating;
    this.genre = genre;
    this.summay = summ;
}

var currentBook = new BookInfo("", "", "", "", "");

// Reading list
var readingList = [];

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
                currentState == states.BOOKFOUND;
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
                val = title + " by " + author;

                sentence = bookAppend[Math.floor(Math.random() * bookAppend.length)]
                sentence = sentence.replace("%", val)

                information = randomRecommendation['description'];
                console.log(sentence);

                arr.push(sentence);

                res.status(200).json(arr);
                console.log("-----------------Printing Result-----------------------");
                console.log(JSON.stringify(arr));
            }
        } else {
            console.log(error)
        }
    });
}

exports.getSummary = function(req, res) {
    if (information != null && information != '') {

        sentence = bookSummary[Math.floor(Math.random() * bookSummary.length)]
        sentence = sentence.replace("%", information)

        console.log(sentence);

        return res.status(200).json(sentence);
    } else if (book != null && book != '') {
        arr = [];
        url = 'https://www.goodreads.com/book/title.xml?key=ubbbkDQlV14HzjTnWaD3rQ';

        if (author != null && author != '') {
            url = url + '&author=' + author
        }

        var options = {
            url: url + "&title=" + book,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        httpsRequest(options, function callback(error, response, body) {
            if (response.statusCode == 200) {
                var parsedXML = "";
                var randomRecommendation = "No book found";
                parser.parseString(body, (err, result) => {
                    parsedXML = result;
                    bookid = parsedXML.GoodreadsResponse.book[0].id[0];
                    information = parsedXML.GoodreadsResponse.book[0].description[0];

                    information = information.replace('//<![CDATA[', '');
                    information = information.replace('//]]>', '');
                    var rex = /(<([^>]+)>)/ig;
                    information = information.replace(rex, "")

                    console.log(bookid);
                    console.log(information);
                });
            }
            return res.status(200).json(information);
        });
    } else {
        console.log('No book specified');
        return res.status(200).json('No book specified');
    }
}

exports.getAuthor = function(req, res) {

    msg = '';
    if (currentState == states.BOOKFOUND) {
        msg = 'Book is written by ' + currentBook.author;
    } else {
        msg = 'Sorry! I don\'t have book name. Can you please tell me the book\'s name first';
    }
    return res.status(200).json(msg);
}

exports.getBookRecommendationByAuthor = function(req, res) {
    arr = [];
    url = 'https://www.goodreads.com/search/index.xml?key=ubbbkDQlV14HzjTnWaD3rQ';

    var url_parts = urll.parse(req.url, true);
    var query = url_parts.query;
    console.log(JSON.stringify(query));

    if (query.name === 'undefined') {
      currentState = states.SRCHBYAUTHOR;
      return res.status(200).json ('Sure. Can you please name the AUTHOR?');
    }

    return searchBookByAuthor (req, res, query.name);
}

var searchBookByAuthor = (req, res, authorName) => {

    var options = {
        url: url + "&q=" + authorName,
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
                if (works != undefined) {
                    for (var i = 0; i < works.length; i++) {
                        books.push(works[i].best_book[0].title);
                        authors.push(works[i].best_book[0].author[0].name);
                        ratings.push(works[i].average_rating);
                    }
                    console.log(books);
                    randomNumber = Math.floor(Math.random() * books.length);

                    currentBook.name = books[randomNumber];
                    currentBook.author = authors[randomNumber];
                    currentBook.rating = ratings[randomNumber];

                    randomRecommendation = "I found the book " + currentBook.name + " by " + currentBook.author + ".";
                    currentState = states.BOOKFOUND;
                }
                console.log(randomRecommendation);
            });

            //Fill rating, summary information of the book
            fillBookParams(currentBook.name);
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
    var url_parts = urll.parse(req.url, true);
    var query = url_parts.query;
    console.log(JSON.stringify(query));
    keys = Object.keys(genreDict);

    longestIndex = -1;
    idx = -1;
    genre = query.genre;

    if (genre === 'undefined') {
      currentState = states.SRCHBYGENRE;
      return res.status(200).json ('Sure. Which genre\'s book do you prefer?');
    }

    console.log(JSON.stringify(keys));
    for (var i = 0; i < keys.length; i++) {
        var longest = longestCommonSubstring(genre, keys[i]);
        if (parseInt(longest) > longestIndex) {
            longestIndex = longest;
            idx = genreDict[keys[i]];
        }
    }

    if (idx != undefined && idx != '') {
        realGenre = mapping[idx];
        console.log(realGenre);
        url = 'https://api.nytimes.com/svc/books/v3/lists//' + realGenre + '.json?api-key=94097933506e40859a56e77947d60dce';

        var options = {
            url: url,
            method: 'GET',
        };

        httpsRequest(options, function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var innerInfo = JSON.parse(body);
                if (innerInfo.status == 'OK') {
                    results = innerInfo.results;
                    console.log("length of results" + results.books.length);
                    var random = Math.floor(Math.random() * results.books.length);
                    recommendedBook = results.books[random];
                    recommendedBook = recommendedBook.title

                    currentBook.name = results.books[random];
                    fillBookParams(currentBook.name);

                    console.log(recommendedBook);
                    console.log("-----------------Printing Book by Genre-----------------------");
                    res.status(200).json(recommendedBook);
                }
            } else {
                console.log('error:' + error);
                res.status(404);
            }
        });
    } else {
        res.status(200).json('I couldnt find books in the genre ' + genre);
    }
}

exports.getAnotherBook = (req, res) => {
    idx = books.indexOf(currentBook.name);
    delete books[idx];
    delete authors[idx];
    delete ratings[idx];

    if (books.length != 0) {
        randomNumber = Math.floor(Math.random() * books.length);
        console.log(books[randomNumber]);
        currentBook.name = books[randomNumber];
        currentBook.author = authors[randomNumber];
        currentBook.rating = ratings[randomNumber];
        fillBookParams(currentBook.name);
        msg = 'How about ' + currentBook.name + '?';
    }
    res.status(200).json(msg);
}

exports.finished = (req, res) => {
    // readingList.push(currentBook.name);
    res.status(200).json('GoodBye. Have a nice day!');
    setStart();
}

exports.getBookRating = function(req, res) {
    console.log('book rating intent');
    msg = '';
    if (currentState == states.BOOKFOUND) {
        msg = 'The book ' + currentBook.name + 'is rated ' + currentBook.rating;
    } else {
        msg = 'Sorry! I don\'t have book name. Could you please tell me the book\'s name?';
    }
    res.status(200).json(msg);
}

exports.sessionEnd = function(req, res) {
    console.log('Session end request');
    setStart();
    res.status(200).json('');
}

var setStart = () => {
    console.log('setting the state to START state and removing all book information');
    currentState = states.START;
    currentBook.name = "";
    currentBook.author = "";
    currentBook.rating = "";
    currentBook.genre = "";
    currentBook.summary = "";
    readingList = [];
}

exports.noInput = function(req, res) {
    if (currentState == states.START) {
        console.log('Changing state to BOOKNAMEUNKNOWN');
        currentState = states.BOOKNAMEUNKNOWN;
        res.status(200).json('I can search for books based by author, genre. What do I need to search for you?');
    } else if (currentState == states.BOOKFOUND) {
        console.log('BOOKFOUND STATE')
        msg = res.status(200).json('Should I add this book to your reading list or do you want to search another book?');
    }
}

exports.yesInput = function(req, res) {
    var url_parts = urll.parse(req.url, true);
    var query = url_parts.query;
    console.log(JSON.stringify(query));
    var param = query.param;
    switch (currentState) {
        case states.START:
            if (param === 'undefined') {
                // if book's name is not provided set the state to BOOKNameKNOWN else set it to BOOKFOUND
                console.log('Changing state to BOOKNAMEKNOWN');
                currentState = states.BOOKNAMEKNOWN;
                msg = 'which one?'
            } else {
                currentBook.name = param;
                currentState = states.BOOKFOUND;
                fillBookParams(param);
                console.log('Books name specified by user ' + param);
                msg = 'Okay, I can help you with info like summary, ratings, reviews. what would you like to know?';
            }
            break;

        case states.BOOKNAMEKNOWN:
            if (param != 'undefined') {
                currentBook.name = param;
                currentState = states.BOOKFOUND;
                fillBookParams(param);
                console.log('Books name specified by user ' + param);
                msg = 'Okay, I can help you with info like summary, ratings, reviews. what would you like to know?';
            }
            break;

        case states.BOOKFOUND:
            msg = 'Okay, I can help you with info like summary, ratings, reviews. what would you like to know?';
            break;

        case states.SRCHBYGENRE:
          console.log('searchBookByGenre ');
          //TODO: put the code for search by genre
          break;
        case states.SRCHBYAUTHOR:
          console.log('searchBookByAuthor: authorName ' + param);
          searchBookByAuthor (req, res, param);
          break;
    }
    res.status(200).json(msg);
}

// get all the information about the book.
var fillBookParams = (bookName) => {
    url = 'https://www.goodreads.com/book/title.xml?key=ubbbkDQlV14HzjTnWaD3rQ';
    var options = {
        url: url + "&title=" + bookName,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    httpsRequest(options, function callback(error, response, body) {
        if (response.statusCode == 200) {
            var parsedXML = "";
            var randomRecommendation = "No book found";
            parser.parseString(body, (err, result) => {
                parsedXML = result;
                bookid = parsedXML.GoodreadsResponse.book[0].id[0];
                information = parsedXML.GoodreadsResponse.book[0].description[0];
                currentBook.rating = parsedXML.GoodreadsResponse.book[0].average_rating[0];
                currentBook.author = parsedXML.GoodreadsResponse.book[0].authors[0].author[0].name[0];
                information = information.replace('//<![CDATA[', '');
                information = information.replace('//]]>', '');
                var rex = /(<([^>]+)>)/ig;
                information = information.replace(rex, "")

                console.log(bookid);
                console.log(information);
                currentBook.summary = information;
            });
        }
        //      return res.status(200).json(information);
    });
}

exports.addToReadingList = (req, res) => {
    readingList.push(currentBook.name);
    console.log("Adding book " + currentBook.name + " to reading list");
    res.status(200).json('Done. Do you want to search another book or are you finished?');
}

exports.getReadingList = (req, res) => {
    if (readingList.length == 0) {
        msg = 'Right now you have nothing in your reading list. Let\'s take you there.';
    } else {
        msg = '';
        for (i = 0; i < readingList.length; i++) {
            console.log(readingList[i]);
            msg += readingList[i];
            msg += ', ';
        }
        msg = 'you have ' + msg;
    }
    res.status(200).json(msg);
}

exports.catchAll = function(req, res) {
    var url_parts = urll.parse(req.url, true);
    var query = url_parts.query;
    console.log(JSON.stringify(query));
    var istring = query.string;
    var msg = '';
    console.log('incoming string in catch all is ' + istring);
    switch (currentState) {
        case states.BOOKNAMEKNOWN:
            currentBook.name = istring;
            msg = 'Good choice. I can help you with information like rating, review, summary. What do you want to know?';
            break;
    }

    res.status(200).json(msg);
}

function longestCommonSubstring(string1, string2) {
    // init max value
    var longestCommonSubstring = 0;
    // init 2D array with 0
    var table = [],
        len1 = string1.length,
        len2 = string2.length,
        row, col;
    for (row = 0; row <= len1; row++) {
        table[row] = [];
        for (col = 0; col <= len2; col++) {
            table[row][col] = 0;
        }
    }
    // fill table
    var i, j;
    for (i = 0; i < len1; i++) {
        for (j = 0; j < len2; j++) {
            if (string1[i] === string2[j]) {
                if (table[i][j] === 0) {
                    table[i + 1][j + 1] = 1;
                } else {
                    table[i + 1][j + 1] = table[i][j] + 1;
                }
                if (table[i + 1][j + 1] > longestCommonSubstring) {
                    longestCommonSubstring = table[i + 1][j + 1];
                }
            } else {
                table[i + 1][j + 1] = 0;
            }
        }
    }
    return longestCommonSubstring;
}
