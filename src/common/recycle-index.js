// RecycleIndex copyright: https://github.com/hezedu/SomethingBoring/blob/master/algorithm/recycle-index.js 2020/03/21
function RecycleIndex(){
  this.index = 0;
  this.pool = [];
}
RecycleIndex.prototype.get = function(){
  if(this.pool.length){
    return this.pool.pop();
  }
  this.index = this.index + 1;
  return this.index;
}
RecycleIndex.prototype.recycle = function(index){
  this.pool.push(index);
  if(this.pool.length === this.index){
    this.pool = [];
    this.index = 0;
  }
}

module.exports = RecycleIndex;