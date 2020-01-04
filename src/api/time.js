
// get
module.exports = function(req, res){
  const d = new Date();
  const data = {
    timeZoneOffset: d.getTimezoneOffset(),
    time: d.getTime()
  }
  res.json(data);
}
