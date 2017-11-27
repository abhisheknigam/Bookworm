var home = require('../app/controllers/home');
//you can include all your controllers

module.exports = function(app) {
    app.get('/getBestSeller', home.getBestSeller);
    app.get('/getBestSellerByDate', home.getBestSellerByDate);
    app.get('/recommendMeAbook', home.recommendMeAbook);
    app.get('/getSummary', home.getSummary);
    app.get('/getBookRecommendationByAuthor', home.getBookRecommendationByAuthor);
    app.get('/getAllGenre', home.getAllGenre);
    app.get('/getBookByGenre', home.getBookByGenre);
    app.get('/getAuthor', home.getAuthor);
    app.get('/yesInput', home.yesInput);
    app.get('/noInput', home.noInput);
}
