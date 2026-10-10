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

  var layout = document.getElementById("layout");
  var side = document.getElementById("sidebar");
  var menu = document.getElementById("menu");
  var scrim = document.getElementById("scrim");
  var KEY = "sidebar-collapsed";
  function readStore(k) { try { return localStorage.getItem(k); } catch (err) { return null; } }
  function writeStore(k, v) { try { localStorage.setItem(k, v); } catch (err) {} }

  var collapseBtn = document.getElementById("collapse");
  function setCollapsed(on) {
    layout.classList.toggle("collapsed", on);
    collapseBtn.setAttribute("aria-pressed", on ? "true" : "false");
    collapseBtn.setAttribute("aria-label", on ? "Expand sidebar" : "Collapse sidebar");
    collapseBtn.title = on ? "Expand sidebar" : "Collapse sidebar";
  }
  setCollapsed(readStore(KEY) === "1");
  collapseBtn.addEventListener("click", function () {
    var on = !layout.classList.contains("collapsed");
    setCollapsed(on);
    writeStore(KEY, on ? "1" : "0");
  });
  document.getElementById("rail-filters").addEventListener("click", function () {
    setCollapsed(false);
    writeStore(KEY, "0");
    q.focus();
  });

  function focusables() {
    return Array.prototype.slice.call(side.querySelectorAll("a[href],button,input")).filter(function (el) { return el.offsetParent !== null; });
  }
  function onKey(e) {
    if (e.key === "Escape") return closeDrawer();
    if (e.key !== "Tab") return;
    var list = focusables();
    if (!list.length) return;
    var first = list[0], last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function openDrawer() {
    layout.classList.add("drawer-open");
    scrim.hidden = false;
    menu.setAttribute("aria-expanded", "true");
    side.setAttribute("role", "dialog");
    side.setAttribute("aria-modal", "true");
    document.addEventListener("keydown", onKey);
    document.getElementById("close").focus();
  }
  function closeDrawer() {
    if (!layout.classList.contains("drawer-open")) return;
    layout.classList.remove("drawer-open");
    scrim.hidden = true;
    menu.setAttribute("aria-expanded", "false");
    side.removeAttribute("role");
    side.removeAttribute("aria-modal");
    document.removeEventListener("keydown", onKey);
    if (window.innerWidth < 1024) menu.focus();
  }
  menu.addEventListener("click", openDrawer);
  scrim.addEventListener("click", closeDrawer);
  document.getElementById("close").addEventListener("click", closeDrawer);
  document.getElementById("show").addEventListener("click", closeDrawer);
  Array.prototype.forEach.call(side.querySelectorAll(".sidenav a"), function (a) { a.addEventListener("click", closeDrawer); });
  chips.forEach(function (b) { b.addEventListener("click", closeDrawer); });
  window.addEventListener("resize", function () { if (window.innerWidth >= 1024) closeDrawer(); });

  var root = document.documentElement;
  document.getElementById("theme").addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (err) {}
  });
})();
