/* Runs before first paint: decides whether the curtain starts closed
   (first-visit loader on the homepage, or arriving from a page transition). */
(function () {
  var d = document.documentElement;
  d.classList.add("js");
  // Deep links: we place the anchor ourselves once pins and fonts have settled.
  if (location.hash && "scrollRestoration" in history) history.scrollRestoration = "manual";
  var store;
  try {
    store = window.sessionStorage;
  } catch (e) {}
  if (!store || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    if (store.getItem("cc-nav")) {
      d.classList.add("is-covered");
      d.dataset.enter = "page";
    } else if (d.dataset.page === "home" && !store.getItem("cc-intro")) {
      d.classList.add("is-covered");
      d.dataset.enter = "loader";
      store.setItem("cc-intro", "1");
    }
  } catch (e) {}
  // Safety net: never leave the page covered if a script fails to load.
  setTimeout(function () {
    if (!window.CC || !window.CC.revealed) d.classList.remove("is-covered");
  }, 6000);
})();
