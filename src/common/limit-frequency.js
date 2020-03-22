// https://github.com/hezedu/SomethingBoring/blob/master/algorithm/limit-frequency.js
// 2020/03/22 16:27


function LimitFrequency(callback, dealy){
  this.go = callback;
  this.dealy = dealy;
  this.isInputing = false;
  this.inputCount = 0;
  this.inputedCount = 0;
  this.timer = null;
  this.lastTask = null;
}

LimitFrequency.prototype.trigger = function(){
  this.inputCount = this.inputCount + 1;
  if(this.isInputing){
    return;
  }
  this.isInputing = true;
  this.inputedCount = this.inputedCount + 1;
  this.process();
}

LimitFrequency.prototype._clearTimer = function () {
  this.inputedCount = this.inputCount = 0;
  clearInterval(this.timer);
  this.timer = null;
}

LimitFrequency.prototype.process = function(){
  if(this.timer){
    return;
  }
  this.timer = setInterval(() => {
    this.isInputing = false;
    if(this.inputedCount === this.inputCount){
      if(this.inputedCount !== 0){
        this.go();
      }
      this._clearTimer();
    }else{
      this.inputedCount = this.inputCount = 0;
      this.go();
    }
  }, this.dealy);
}

LimitFrequency.prototype.end = function(){
  if(this.timer){
    if(this.inputCount !== 0){
      this.go();
    }
    this._clearTimer();
    this.isInputing = false;
  }
}

module.exports = LimitFrequency;
