(function () {
  "use strict";
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var q = document.getElementById("q");
  var count = document.getElementById("count");
  var none = document.getElementById("none");
  var group = "";

  function apply() {
    var term = (q.value || "").trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (!group || c.getAttribute("data-group") === group) && (!term || c.getAttribute("data-search").indexOf(term) !== -1);
      c.hidden = !ok;
      if (ok) shown++;
    });
    count.textContent = "Showing " + shown + " of " + cards.length;
    none.hidden = shown !== 0;
  }
  chips.forEach(function (b) {
    b.addEventListener("click", function () {
      group = b.getAttribute("data-g");
      chips.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      apply();
    });
  });
  q.addEventListener("input", apply);

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".copy");
    if (!b) return;
    var text = b.getAttribute("data-copy");
    var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1500); };
    try {
      navigator.clipboard.writeText(text).then(done, function () { b.textContent = "Select it"; });
    } catch (err) { b.textContent = "Select it"; }
  });

  var root = document.documentElement;
  document.getElementById("theme").addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (err) {}
  });
})();
