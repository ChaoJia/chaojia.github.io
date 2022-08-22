// add custom js in this file

function initImageComparisons() {
  var cmpDivs = document.getElementsByClassName("img-cmp-div");
  var bgDivs = document.getElementsByClassName("img-cmp-bg-div");
  var bgs = document.getElementsByClassName("img-cmp-bg");
  var sliders = document.getElementsByClassName("img-cmp-slider");
  var sliderButtons = document.getElementsByClassName("img-cmp-slider-button");
  var fgDivs = document.getElementsByClassName("img-cmp-fg-div");
  var fgs = document.getElementsByClassName("img-cmp-fg");
  var activeSlider = null;
  for (var i = 0; i < fgDivs.length; i++) {
    /*once for each "overlay" element:
    pass the "overlay" element as a parameter when executing the compareImages function:*/
    compareImages(cmpDivs[i], bgDivs[i], bgs[i], sliders[i], sliderButtons[i], fgDivs[i], fgs[i]);
  }
  function compareImages(cmpDiv, bgDiv, bg, slider, sliderButton, fgDiv, fg) {
    var parentWidth = cmpDiv.parentNode.clientWidth;
    var cmpDivWidthRatio = Number(cmpDiv.getAttribute('data-width-ratio'));
    var w = Math.round(parentWidth * cmpDivWidthRatio);
    var h = Math.round(bg.naturalHeight * w / bg.naturalWidth);
    cmpDiv.style.width = w + 'px';
    cmpDiv.style.height = h + 'px';
    cmpDiv.style.left = (parentWidth - w) / 2 + "px";
    bg.style.width = w + 'px';
    bg.style.height = h + 'px';
    bgDiv.style.width = w + 'px';
    bgDiv.style.height = h + 'px';
    slider.style.height = h + 'px';
    fg.style.width = w + 'px';
    fg.style.height = h + 'px';
    fgDiv.style.width = (w / 2) + "px";
    fgDiv.style.height = h + "px";

    /*position the slider in the middle:*/
    slider.style.top = (h / 2) - (slider.offsetHeight / 2) + "px";
    slider.style.left = (w / 2) - (slider.offsetWidth / 2) + "px";

    slider.addEventListener("mousedown", slideReady);
    slider.addEventListener("touchstart", slideReady);
    window.addEventListener("mouseup", slideFinish);
    window.addEventListener("touchend", slideFinish);

    function slideReady(e) {
      /*prevent any other actions that may occur when moving over the image:*/
      e.preventDefault();
      activeSlider = slider;
      window.addEventListener("mousemove", slideMove);
      window.addEventListener("touchmove", slideMove);
    }
    function slideFinish() {
      /*the slider is no longer clicked:*/
      activeSlider = null;
    }
    function slideMove(e) {
      var pos;
      /*if the slider is no longer clicked, exit this function:*/
      if (activeSlider != slider) return false;
      /*get the cursor's x position:*/
      pos = getCursorPos(e);
      /*prevent the slider from being positioned outside the image:*/
      if (pos < 0) pos = 0;
      if (pos > w) pos = w;
      /*execute a function that will resize the overlay image according to the cursor:*/
      slide(pos);
    }
    function getCursorPos(e) {
      var a, x = 0;
      e = (e.changedTouches) ? e.changedTouches[0] : e;
      /*get the x positions of the image:*/
      a = fgDiv.getBoundingClientRect();
      /*calculate the cursor's x coordinate, relative to the image:*/
      x = e.pageX - a.left;
      /*consider any page scrolling:*/
      x = x - window.pageXOffset;
      return x;
    }
    function slide(x) {
      /*resize the image:*/
      fgDiv.style.width = x + "px";
      /*position the slider:*/
      slider.style.left = fgDiv.offsetWidth - (slider.offsetWidth / 2) + "px";
    }
  }
}

window.addEventListener('load', initImageComparisons);
window.addEventListener('resize', initImageComparisons);

var players = [];

function initYoutubePlayers() {
  var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
  const iframes = Array.from(document.getElementsByTagName('iframe')).filter( i => i.id.includes("youtube-"));
  for (var i = 0; i < iframes.length; ++i) {
    players.push(
      new YT.Player(iframes[i].id, {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      })
    );
  }
}

function onPlayerReady(event) {
  player = event.target;
  player.setVolume(30);
}

function onPlayerStateChange(event) {
  player = event.target;
}

window.addEventListener('load', initYoutubePlayers);