function debug(msg) {
  var d = new Date();
  var n = d.toLocaleTimeString().split(" ")[0];
  if (typeof msg === "string") {
    $("#debug").append("[" + n + "] " + msg + "\n");
  } else {
    $("#debug").append("[" + n + "] " + JSON.stringify(msg) + "\n");
  }
  var textarea = document.getElementById("debug");
  textarea.scrollTop = textarea.scrollHeight;
}
debug("debugging\t: enabled");

var cjs = new Castjs({
  joinpolicy: "origin_scoped",
});

cjs.on("event", (e) => {
  if (e === "statechange") {
    debug(e + "\t: " + cjs.state);
  } else if (e === "volumechange") {
    debug(e + "\t: " + cjs.volumeLevel);
  } else if (e === "timeupdate") {
    debug(e + "\t: " + cjs.timePretty + " - " + cjs.durationPretty);
  } else if (e === "playing") {
    debug(e + "\t: " + cjs.title);
  } else if (e === "connect") {
    debug(e + "\t: " + cjs.device);
  } else if (e === "available") {
    //debug(e + "\t: castjs " + cjs.version);
    debug(e + "\t: chromecast module ready");
  } else if (e === "buffering") {
    debug(e + "\t: " + cjs.timePretty);
  } else if (e === "mute") {
    debug(e + "\t\t: " + cjs.volumeLevel);
  } else if (e === "unmute") {
    debug(e + "\t: " + cjs.volumeLevel);
  } else if (e === "pause") {
    debug(e + "\t\t: " + cjs.timePretty);
  } else if (e === "disconnect") {
    debug(e + "\t: " + cjs.device);
  } else if (e === "subtitlechange") {
    for (var i in cjs.subtitles) {
      if (cjs.subtitles[i].active) {
        debug("subtitle\t: " + cjs.subtitles[i].label);
        break;
      }
    }
  } else {
    debug(e);
  }
});

cjs.on("available", () => {
  $("#cast").removeClass("disabled");
});

cjs.on("connect", () => {
  $("body").removeClass("disabled");
  $("body").addClass("connected");
  if (cjs.paused) {
    $("#play").removeClass("fa-pause").addClass("fa-play");
  } else {
    $("#play").removeClass("fa-play").addClass("fa-pause");
  }
});

cjs.on("mute", () => {
  $("#mute").removeClass("fa-volume-up").addClass("fa-volume-mute");
});

cjs.on("unmute", () => {
  $("#mute").removeClass("fa-volume-mute").addClass("fa-volume-up");
});

cjs.on("statechange", () => {
  $("#state").text(cjs.device + ": " + cjs.state);
});

cjs.on("buffering", () => {
  $("body").addClass("disabled");
});

cjs.on("playing", () => {
  $("body").removeClass("disabled");
  $("#play").removeClass("fa-play").addClass("fa-pause");
});

cjs.on("pause", () => {
  $("body").removeClass("disabled");
  $("#play").removeClass("fa-pause").addClass("fa-play");
});

cjs.on("timeupdate", () => {
  $("#time").text(cjs.timePretty);
  $("#duration").text(cjs.durationPretty);
  slider.attr("value", cjs.progress);
  slider.rangeslider("update", true);
});
cjs.on("disconnect", () => {
  $("body").addClass("disabled");
  $("body").removeClass("connected");
});
cjs.on("error", (err) => {
  debug("error\t\t: " + err);
});

var metadata = {
  poster:
    "https://cdn.sforum.vn/sforum/wp-content/uploads/2022/05/google-chromecast-google-tv-va-android-tv-cover.jpg",
  title: "POC Flutter - Chromecast",
  description:
    "POC Flutter - Chromecast support in Flutter by randriatangy@bocasay.com",
  subtitles: [
    {
      active: true,
      label: "English",
      src: "https://castjs.io/media/english.vtt",
    },
    {
      label: "Spanish",
      src: "https://castjs.io/media/spanish.vtt",
    },
  ],
};

$("#cast").on("click", () => {
  if (cjs.connected) {
    cjs.disconnect();
  } else if (cjs.available) {
    var url = new URL(window.location.href);
    var source = url.searchParams.get("video");
    var title = url.searchParams.get("title");
    if (/^https?:\/\/.*\.(mp4|mpd|m3u8)$/.test(source) == false) {
      alert("Unsupported URL");
      return;
    }
    metadata.title = title;
    cjs.cast(source, metadata);
  }
});

$(".jq-dropdown-menu").on("click", "a", function (e) {
  e.preventDefault();
  var index = $(this).attr("href");
  cjs.subtitle(index);
  $(".jq-dropdown-menu a").removeClass("active");
  $(this).addClass("active");
});

$("#mute").on("click", () => {
  if ($("#mute").hasClass("fa-volume-up")) {
    cjs.mute();
    $("#mute").removeClass("fa-volume-up").addClass("fa-volume-mute");
  } else {
    cjs.unmute();
    $("#mute").removeClass("fa-volume-mute").addClass("fa-volume-up");
  }
});

$("#play").on("click", () => {
  if ($("#play").hasClass("fa-play")) {
    cjs.play();
    $("#play").removeClass("fa-play").addClass("fa-pause");
  } else {
    cjs.pause();
    $("#play").removeClass("fa-pause").addClass("fa-play");
  }
});

$("#stop").on("click", () => {
  cjs.disconnect();
});

$("#back").on("click", () => {
  var goback = cjs.time - 30;
  if (goback < 1) {
    goback = 0;
  }
  cjs.seek(goback);
});
$("#forward").on("click", () => {
  var goforward = cjs.time + 30;
  if (goforward >= cjs.duration) {
    goforward = cjs.duration;
  }
  cjs.seek(goforward);
});

var slider = $('input[type="range"]').rangeslider({
  polyfill: false,
  onSlideEnd: function (pos, val) {
    if (cjs.connected) {
      cjs.seek(val, true);
    }
  },
});
