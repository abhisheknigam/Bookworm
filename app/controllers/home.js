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
var books = [];
var authors = [];
var ratings = [];
var summary = [];

var loopCount = 0;

//TODO
//". What would you like to know more about in this book? Ratings, Author or Summary ?"

var searchBookMessage = ["I can search for books based by author, genre. What do I need to search for you?", "I can help you search book by author or genre. What would you like to do ?", "Okay, So do you want to search a book by author or by the genre ?"]
var noBookSpecified = ["Sorry! I don't have the book's name. Can you tell me a book's name first ?", 'It seems you didn\'t specify a book. Can you say it again ?', 'Sorry, Which book were you talking about again ?']
var afterBookRecommend = [". I have info about it's ratings, author or summary. What would you like to know?"];
var bookAppend = ["I found % on this week's New York Times bestseller list", "The book % is highly rated on good reads", "I think you will love reading  %", " How about % . It is trending this week."]
var authorName = ["The name of the author is %", "Author's name is %", "% is the author of the book"]
var bookSummary = ["This book is about %", "A short summary of the book says %", "Summary tells that %"]
var failureMsg = ["I didn't understand that. Can you say it again?"]
var states = new Enum(['START', 'BOOKFOUND', 'SRCHBYGENRE', 'SRCHBYAUTHOR', 'BOOKNAMEKNOWN', 'BOOKNAMEUNKNOWN']);

var currentState = states.START;

var genreDict = { 'blues': 1, 'sad': 1, 'thriller': 2, 'horror': 2, 'crime': 2, 'children': 3, 'animal': 4, 'biography': 5, 'education': 6, 'Food and Fitness': 7, 'health': 8, 'Relationships': 9, 'Romance': 9, 'Business': 10, 'Business Books': 10, 'Paperback Business Books': 10, 'Political': 12, 'Biography': 24, "Combined Print and E-Book Fiction": 13, "Combined Print and E-Book Nonfiction": 14, "Hardcover Fiction": 13, "Hardcover Nonfiction": 14, "Trade Fiction Paperback": 13, "Mass Market Paperback": 13, "Paperback Nonfiction": 14, "E-Book Fiction": 13, "E-Book Nonfiction": 14, "Hardcover Advice": 15, "Paperback Advice": 15, "Advice How-To and Miscellaneous": 15, "Chapter Books": 13, "Childrens Middle Grade": 3, "Childrens Middle Grade E-Book": 3, "Childrens Middle Grade Hardcover": 3, "Childrens Middle Grade Paperback": 3, "Paperback Books": 13, "Picture Books": 17, "Series Books": 13, "Young Adult": 16, "Young Adult E-Book": 16, "Young Adult Hardcover": 16, "Young Adult Paperback": 16, "Hardcover Graphic Books": 17, "Paperback Graphic Books": 17, "Manga": 17, "Combined Print Fiction": 13, "Combined Print Nonfiction": 14, "Animals": 18, "Business Books": 10, "Celebrities": 19, "Crime and Punishment": 2, "Culture": 6, "Education": 6, "Espionage": 20, "Expeditions Disasters and Adventures": 20, "Fashion Manners and Customs": 21, "Food and Fitness": 7, "Games and Activities": 22, "Hardcover Business Books": 10, "Health": 7, "Humor": 23, "Indigenous Americans": 24, "Relationships": 25, "Paperback Business Books": 10, "Family": 11, "Hardcover Political Books": 26, "Race and Civil Rights": 26, "Religion Spirituality and Faith": 30, "Science": 27, "Sports": 28, "Travel": 29 }
var mapping = { 1: 'Advice How-To and Miscellaneous', 2: 'Crime and Punishment', 3: 'Childrens Middle Grade', 4: 'Animals', 5: 'Indigenous Americans', 6: 'Food and Fitness', 8: 'Health', 9: 'Relationships', 13: 'Combined Print and E-Book Fiction', 14: 'Combined Print and E-Book Nonfiction', 15: 'Advice How-To and Miscellaneous', 16: 'Young Adult', 17: 'Picture Books', 18: 'Animals', 19: 'Celebrities', 20: 'Expeditions Disasters and Adventures', 21: 'Fashion Manners and Customs', 22: 'Games and Activities', 23: 'Humor', 24: 'Indigenous Americans', 25: 'Relationships', 26: 'Hardcover Political Books', 27: 'Science', 28: 'Sports', 29: 'Travel', 30: 'Religion Spirituality and Faith', 11: 'Family' }
var infoDict = { 'summary': false, 'rating': false, 'author': false }

var BookInfo = function(nm, aut, rating, genre, summ) {
    this.name = nm;
    this.author = aut;
    this.rating = rating;
    this.genre = genre;
    this.summary = summ;
}

var currentBook = new BookInfo("", "", "", "", "");

// Reading list
var readingList = [];

exports.getBookTitle = function(req, res) {
    var msg = '';

    if (currentBook.name != undefined && currentBook.name != null) {
        msg = "The book which we are reffering to is" + currentBook.name;
    } else {
        randomNumber = Math.floor(Math.random() * noBookSpecified.length);
        msg = noBookSpecified[randomNumber]
    }

    return res.status(200).json(msg);
}

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

                    currentBook.name = title;
                    fillBookParams(currentBook.name);
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
    clearInfoDict();
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
                books = [];
                authors = [];
                ratings = [];
                for (var i = 0; i < results.length; i++) {
                    books.push(results[i]['title'].replace(/["]+/g, ''));
                    authors.push(results[i]['author']);
                    summary.push(results[i]['description']);
                }

                var randomRecommendation = results[Math.floor(Math.random() * results.length)];

                title = randomRecommendation['title'];
                title = title.replace(/["]+/g, '');

                currentBook.name = title;

                author = randomRecommendation['author'];
                currentBook.author = author;

                val = title + " by " + author;

                console.log("Recommend me a book " + currentBook.name)
                fillBookParams(currentBook.name);

                sentence = bookAppend[Math.floor(Math.random() * bookAppend.length)]
                sentence = sentence.replace("%", val)

                information = randomRecommendation['description'];

                var randomAppend = afterBookRecommend[Math.floor(Math.random() * afterBookRecommend.length)]
                console.log(sentence + randomAppend);

                currentState = states.BOOKFOUND;
                arr.push(sentence + randomAppend);

                res.status(200).json(sentence + randomAppend);
                console.log("-----------------Printing Result-----------------------");
                console.log(JSON.stringify(arr));
            }
        } else {
            console.log(error)
        }
    });
}

exports.getSummary = function(req, res) {
    if (currentBook.summary != null && currentBook.summary != '') {

        sentence = bookSummary[Math.floor(Math.random() * bookSummary.length)]
        sentence = sentence.replace("%", information)

        console.log(sentence);

        return res.status(200).json(sentence);
    } else if (currentBook.name != null && currentBook.name != '') {
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

            infoDict['summary'] = true;
            var count = 0;

            for (var key in infoDict) {
                if (infoDict[key] === false) {
                    if (count == 0) {
                        information += ". I can also tell you about its"
                    }
                    information = information + ", " + key;
                    count++;
                }
            }

            if (count == 2) {
                information = information + ". whenever you are satisfied you can add the book to your reading list."
            }

            return res.status(200).json(information);
        });
    } else {
        randomNumber = Math.floor(Math.random() * noBookSpecified.length);
        var utterance = noBookSpecified[randomNumber]
        console.log('No book specified');
        return res.status(200).json(utterance);
    }
}

exports.getAuthor = function(req, res) {

    msg = '';
    if (currentState == states.BOOKFOUND) {
        msg = 'Book is written by ' + currentBook.author;
    } else {
        randomNumber = Math.floor(Math.random() * noBookSpecified.length);
        msg = noBookSpecified[randomNumber];
    }

    infoDict['author'] = true;
    var count = 0;

    for (var key in infoDict) {
        if (infoDict[key] === false) {
            if (count == 0) {
                msg += ". I can also tell you about its"
            }
            msg = msg + ", " + key;
            count++;
        }
    }

    if (count == 2) {
        msg = msg + ". whenever you are satisfied you can add the book to your reading list."
    }

    return res.status(200).json(msg);
}

exports.getBookRecommendationByAuthor = function(req, res) {
    clearInfoDict();
    var url_parts = urll.parse(req.url, true);
    var query = url_parts.query;
    console.log(JSON.stringify(query));

    if (currentState == states.BOOKFOUND && query.name == "undefined") {
        msg = 'This Book is written by ' + currentBook.author;

        infoDict['author'] = true;
        var count = 0;

        for (var key in infoDict) {
            if (infoDict[key] === false) {
                if (count == 0) {
                    msg += ". I can also tell you about its"
                }
                msg = msg + ", " + key;
                count++;
            }
        }

        if (count == 2) {
            msg = msg + ". whenever you are satisfied you can add the book to your reading list."
        }

        console.log("Inside Undefined getBookRecommendationByAuthor" + currentBook.author);
        res.status(200).json(msg);
    } else {
        return searchBookByAuthor(req, res, query.name);
    }


}

var searchBookByAuthor = (req, res, authorName) => {

    if (authorName === 'undefined') {
        if (loopCount == 3) {
            currentState = states.BOOKNAMEUNKNOWN;
            loopCount = 0;
            return res.status(200).json("I am sorry, I am having trouble understanding you. Let's start over. Okay, So do you want to search a book by author or by the genre ?");
        }
        currentState = states.SRCHBYAUTHOR;
        loopCount++;
        return res.status(200).json('Sure. Can you please name the AUTHOR?');
    }

    console.log("Author Name is " + authorName);
    arr = [];
    url = 'https://www.goodreads.com/search/index.xml?key=ubbbkDQlV14HzjTnWaD3rQ';

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

            randomNumber = Math.floor(Math.random() * noBookSpecified.length);
            var randomRecommendation = noBookSpecified[randomNumber]

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

                    fillBookParams(currentBook.name);

                    randomRecommendation = "I found the book " + currentBook.name + " by " + currentBook.author + afterBookRecommend;
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
    clearInfoDict();
    var url_parts = urll.parse(req.url, true);
    var query = url_parts.query;
    console.log(JSON.stringify(query));

    searchBookByGenre(req, res, query.genre);
}

var searchBookByGenre = (req, res, genre) => {
    keys = Object.keys(genreDict);
    longestIndex = -1;
    idx = -1;

    if (genre === 'undefined') {
        currentState = states.SRCHBYGENRE;
        return res.status(200).json('Sure. Which genre\'s book do you prefer?');
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
        console.log("real Genre" + realGenre);
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
                    books = [];
                    authors = [];
                    ratings = [];
                    for (var i = 0; i < results.length; i++) {
                        books.push(results.book[i]['title'].replace(/["]+/g, ''));
                        authors.push(results.book[i]['author']);
                        summary.push(results.book[i]['description']);
                    }

                    var random = Math.floor(Math.random() * results.books.length);
                    currentBook.name = results.books[random]['title'].replace(/["]+/g, '');
                    //currentBook.author = authors[random];
                    //currentBook.summary = summary[random];

                    currentState = states.BOOKFOUND;
                    fillBookParams(currentBook.name);

                    msg = "I found the book " + currentBook.name + " by " + currentBook.author + " in " + genre + " Genre. "+ afterBookRecommend ?;

                    console.log(msg);
                    console.log("-----------------Printing Book by Genre-----------------------");
                    res.status(200).json(msg);
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

var clearInfoDict = () => {
    for (var key in infoDict) {
        infoDict[key] = false;
    }
}

exports.getAnotherBook = (req, res) => {
    clearInfoDict();
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

        sentence = bookAppend[Math.floor(Math.random() * bookAppend.length)];
        sentence = sentence.replace("%", currentBook.name + " by " + currentBook.author);

        var randomAppend = afterBookRecommend[Math.floor(Math.random() * afterBookRecommend.length)];
        msg = sentence + randomAppend;
    }
    res.status(200).json(msg);
}

exports.finished = (req, res) => {
    // readingList.push(currentBook.name);
    res.status(200).json('GoodBye. Have a nice day!');
    setStart();
}

exports.startOver = (req, res) => {
    clearInfoDict();
    currentState = states.START;
    currentBook.name = "";
    currentBook.author = "";
    currentBook.rating = "";
    currentBook.genre = "";
    currentBook.summary = "";
    res.status(200).json('Okay, I can give you information about a book or I can recommend you one. So, What would you like to do?');
}

exports.getBookRating = function(req, res) {
    console.log('book rating intent');
    msg = '';
    if (currentState == states.BOOKFOUND) {
        msg = 'The book ' + currentBook.name + 'is rated ' + currentBook.rating;
    } else {
        randomNumber = Math.floor(Math.random() * noBookSpecified.length);
        var msg = noBookSpecified[randomNumber]
    }

    infoDict['rating'] = true;
    var count = 0;

    for (var key in infoDict) {
        if (infoDict[key] === false) {
            if (count == 0) {
                msg += ". I can also tell you about its"
            }
            msg = msg + ", " + key;
            count++;
        }
    }

    if (count == 2) {
        msg = msg + ". whenever you are satisfied you can add the book to your reading list."
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
    loopCount = 0;
}

exports.noInput = function(req, res) {
    var url_parts = urll.parse(req.url, true);
    var query = url_parts.query;
    console.log(JSON.stringify(query));
    var param = query.param;
    var param2 = query.param2;
    var param3 = query.param3;

    console.log(currentState);
    console.log("param  is " + param);
    console.log("param 2 is " + param2);
    console.log("param 3 is " + param3);

    if (currentState == states.START) {
        console.log('Changing state to BOOKNAMEUNKNOWN');
        currentState = states.BOOKNAMEUNKNOWN;

        var randomNumber = Math.floor(Math.random() * searchBookMessage.length);
        var msg = searchBookMessage[randomNumber]
        res.status(200).json(msg);

    } else if (currentState == states.BOOKFOUND) {
        console.log('BOOKFOUND STATE')
        msg = res.status(200).json('Should I add this book to your reading list or, I can give you another book? You can also start over a new search');
    } else if (currentState == states.SRCHBYGENRE) {
        console.log('searchBookByGenre: Genre ' + param3);
        searchBookByGenre(req, res, param3)
    } else if (currentState == states.SRCHBYAUTHOR) {
        console.log('searchBookByAuthor: authorName ' + param2);
        searchBookByAuthor(req, res, param2);
    } else if (currentState == states.BOOKNAMEKNOWN) {
        if (param != 'undefined') {
            currentBook.name = param;
            currentState = states.BOOKFOUND;
            fillBookParams(param);
            console.log('Books name specified by user ' + param);
            randomNumber = Math.floor(Math.random() * afterBookRecommend.length);
            msg = afterBookRecommend[randomNumber];
            res.status(200).json(msg);
        } else {
            res.status(200).json(failureMsg[0]);
        }
    } else {
        res.status(200).json(failureMsg[0]);
    }
}

exports.yesInput = function(req, res) {
    var url_parts = urll.parse(req.url, true);
    var query = url_parts.query;
    console.log(JSON.stringify(query));
    var param = query.param;
    var param2 = query.param2;
    var param3 = query.param3;

    console.log("param  is " + param);
    console.log("param 2 is " + param2);
    console.log("param 3 is " + param3);

    switch (currentState) {
        case states.START:
            if (param === 'undefined') {
                // if book's name is not provided set the state to BOOKNameKNOWN else set it to BOOKFOUND
                console.log('Changing state to BOOKNAMEKNOWN');
                currentState = states.BOOKNAMEKNOWN;
                msg = 'which one?'
                res.status(200).json(msg);
            } else {
                currentBook.name = param;
                currentState = states.BOOKFOUND;
                fillBookParams(param);
                console.log('Books name specified by user ' + param);
                randomNumber = Math.floor(Math.random() * afterBookRecommend.length);
                msg = afterBookRecommend[randomNumber];
                res.status(200).json(msg);
            }
            break;

        case states.BOOKNAMEKNOWN:
            if (param != 'undefined') {
                currentBook.name = param;
                currentState = states.BOOKFOUND;
                fillBookParams(param);
                console.log('Books name specified by user ' + param);
                randomNumber = Math.floor(Math.random() * afterBookRecommend.length);
                msg = afterBookRecommend[randomNumber];
                res.status(200).json(msg);
            } else {
                res.status(200).json(failureMsg[0]);
            }
            break;

        case states.BOOKFOUND:
            randomNumber = Math.floor(Math.random() * afterBookRecommend.length);
            msg = afterBookRecommend[randomNumber];
            res.status(200).json(msg);
            break;

        case states.SRCHBYGENRE:
            console.log('searchBookByGenre ');
            searchBookByGenre(req, res, param3)
            break;

        case states.SRCHBYAUTHOR:
            console.log('searchBookByAuthor: authorName ' + param2);
            searchBookByAuthor(req, res, param2);
            break;

        default:
            res.status(200).json(failureMsg[0]);
    }
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

                var index = getPosition(information, '.', 3);
                if (index != -1) {
                    information = str.substring(1, index);
                }

                console.log(bookid);
                console.log(information);

                currentBook.summary = information;
            });
        }
        //      return res.status(200).json(information);
    });
}

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}

exports.addToReadingList = (req, res) => {
    readingList.push(currentBook.name);
    console.log("Adding book " + currentBook.name + " to reading list");
    res.status(200).json('Done. Are you finished or do you want to start over?');
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
            randomNumber = Math.floor(Math.random() * afterBookRecommend.length);
            msg = afterBookRecommend[randomNumber];
            break;

        default:
            res.status(200).json(failureMsg[0]);
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

exports.getBookByName = function(req, res) {
    clearInfoDict();
    var url_parts = urll.parse(req.url, true);
    var query = url_parts.query;
    console.log(JSON.stringify(query));

    if (currentState == states.BOOKFOUND && query.name == "undefined") {
        msg = 'This Book is written by ' + currentBook.author;
        res.status(200).json(msg);
    } else {
        return searchBookByName(req, res, query.name);
    }


}

var searchBookByName = (req, res, authorName) => {

    if (authorName === 'undefined') {
        if (loopCount == 3) {
            currentState = states.BOOKNAMEUNKNOWN;
            loopCount = 0;
            return res.status(200).json("I am sorry, I am having trouble understanding you. Let's start over. Okay, So do you want to search a book by author or by the genre ?");
        }
        currentState = states.SRCHBYAUTHOR;
        loopCount++;
        return res.status(200).json('Sure. Can you please name the Book again?');
    }

    arr = [];
    url = 'https://www.goodreads.com/search/index.xml?key=ubbbkDQlV14HzjTnWaD3rQ';

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

            randomNumber = Math.floor(Math.random() * noBookSpecified.length);
            var randomRecommendation = noBookSpecified[randomNumber]

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

                    fillBookParams(currentBook.name);

                    randomRecommendation = "I found the book " + currentBook.name + " by " + currentBook.author + ". Would you like to know more ?";
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
