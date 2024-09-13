// var curYPos = 0,
//     curXPos = 0,
//     curDown = false;

// window.addEventListener('mousemove', function(e){
//   if(curDown === true){
//     window.scrollTo(document.body.scrollLeft + (curXPos - e.pageX), document.body.scrollTop + (curYPos - e.pageY));
//   }
// });

// window.addEventListener('mousedown', function(e){ curDown = true; curYPos = e.pageY; curXPos = e.pageX; });
// window.addEventListener('mouseup', function(e){ curDown = false; });

var clicked = false,
  clickX,
  clickY;
$(document).on({
  mousemove: function (e) {
    clicked && updateScrollPos(e);
  },
  mousedown: function (e) {
    clicked = true;
    clickX = e.pageX;
    clickY = e.pageY;
  },
  mouseup: function () {
    clicked = false;
    $("html").css("cursor", "auto");
  },
});

var updateScrollPos = function (e) {
  $("html").css("cursor", "grabbing");
  $(window).scrollLeft($(window).scrollLeft() + (clickX - e.pageX));
  $(window).scrollTop($(window).scrollTop() + (clickY - e.pageY));
};
