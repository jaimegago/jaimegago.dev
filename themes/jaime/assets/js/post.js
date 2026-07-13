/* Post enhancements: ToC scroll-spy, right-margin collision yield, image lightbox. */
(function () {
  "use strict";

  /* ---- ToC rail: scroll spy + yield ----
     The sticky ToC and margin/breakout figures share the right-margin lane.
     Whenever a figure's rect intersects the ToC's rect (16px padding), the
     rail fades out and ignores pointers; it returns once the figure passes. */
  var rail = document.querySelector(".toc-rail");
  if (rail) {
    var toc = rail.querySelector(".toc");
    var links = Array.prototype.slice.call(rail.querySelectorAll("a[href^='#']"));
    var headings = Array.prototype.slice.call(document.querySelectorAll(".post-content h2[id]"));
    var obstacles = Array.prototype.slice.call(document.querySelectorAll(".figure-margin, .figure-breakout"));

    var update = function () {
      var current = headings.length ? headings[0] : null;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top <= 130) current = headings[i];
      }
      links.forEach(function (a) {
        a.classList.toggle("is-active", !!current && a.getAttribute("href") === "#" + current.id);
      });

      var t = toc.getBoundingClientRect();
      var pad = 16;
      var overlap = obstacles.some(function (el) {
        var r = el.getBoundingClientRect();
        return r.width > 0 &&
          r.top < t.bottom + pad && r.bottom > t.top - pad &&
          r.left < t.right + pad && r.right > t.left - pad;
      });
      rail.classList.toggle("toc-rail--yield", overlap);
    };

    var ticking = false;
    var request = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    update();
  }

  /* ---- Lightbox ---- */
  if (document.querySelector("a.lightbox-link")) {
    var dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close image">&#10005;</button>' +
      '<img alt="">';
    document.body.appendChild(dlg);
    var img = dlg.querySelector("img");

    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a.lightbox-link") : null;
      if (!a) return;
      e.preventDefault();
      img.src = a.getAttribute("href");
      var thumb = a.querySelector("img");
      img.alt = thumb ? thumb.alt : "";
      dlg.showModal();
      document.documentElement.classList.add("lightbox-open");
    });

    dlg.querySelector(".lightbox-close").addEventListener("click", function () {
      dlg.close();
    });
    /* Backdrop clicks dispatch to the dialog element itself; clicks on the
       image or close button target those elements instead. */
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
    dlg.addEventListener("close", function () {
      document.documentElement.classList.remove("lightbox-open");
      img.removeAttribute("src");
    });
  }
})();
