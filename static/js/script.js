$(function(){
  var s = new EventSource('/e/lmao');
  s.onmessage = function(e) {
    console.log(e.data);
    $("#sse").append(e.data + '<br><br>');
  };
});
