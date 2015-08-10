// routes/index.js
'use strict';

module.exports = function (app) {
  app.get('/', function(req, res) {
  	 res.send('Please enter ./view to enter view');
  });
  app.get('/view', function(req, res){
    res.render('view');

  });
  app.get('/controller', function(req, res){
    res.render('controller');
  });
  app.get('*', function(req, res){
    res.status(404).send('404 !');
  });
};
