
// $$common$$
exports.preventUnxhr = function(req, res, next){
  if(!req.xhr) {
    res.status(400).end("xhr only");
  } else {
    next();
  }
}

//404
// $$common$$
exports.notFound = function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}

//errHandle
// $$common$$
exports.errHandle = function(err, req, res, next) {

  let msg = `${err.name}: ${err.message}`;
  let data;
  if(!err.isCodeError){
    var status = err.status || 500;
    res.status(status);
    data = msg;
    // if(status === 500){
    //   console.error(err);
    // }
  }else{
    data = {
      code: err.code,
      msg
    }
  }

  res.send(data);
  //util.errLog(msg, req);
};
