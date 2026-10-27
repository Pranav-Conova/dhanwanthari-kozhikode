// Google reviews for Dhanwanthari Ayurveda Hospital, Kozhikode.
// The page itself shows the Google rating as last checked. This file can add real review cards in
// one of two ways, and never invents any:
//
// 1. Live (recommended): in Google Cloud, enable "Maps JavaScript API" and "Places API (New)",
//    create an API key restricted to this site's address (Application restrictions → Websites),
//    and paste it into apiKey. The current rating and the 4- and 5-star reviews load from Google.
// 2. By hand: copy real reviews from the hospital's Google Maps listing into manualReviews,
//    word for word, with the reviewer's name as shown on Google. Leave apiKey empty.
(function () {
  var CONFIG = {
    apiKey: "",
    placeQuery: "Dhanwanthari Ayurveda Hospital, Chalappuram, Kozhikode",
    minRating: 4,
    maxReviews: 3,
    // Example entry: { author: "Name as on Google", rating: 5, text: "Review text, unedited.", when: "3 months ago" }
    manualReviews: []
  };

  var section = document.querySelector("[data-google-reviews]");
  if (!section) return;

  function q(sel) { return section.querySelector(sel); }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function stars(rating) {
    var full = Math.round(rating);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }
  // The JS API returns review text as a string; the REST API wraps it in { text }.
  function reviewText(review) {
    var t = review.text;
    return typeof t === "string" ? t : (t && t.text) || "";
  }

  function render(place) {
    if (place.rating) {
      q("[data-rev-score]").textContent = place.rating.toFixed(1);
      q("[data-rev-stars]").textContent = stars(place.rating);
      q("[data-rev-count]").textContent = (place.userRatingCount || 0) + " reviews on Google";
      q("[data-rev-summary]").hidden = false;
    }
    if (place.googleMapsURI) q("[data-rev-link]").href = place.googleMapsURI;
    if (place.id) q("[data-rev-write]").href = "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(place.id);
    renderCards(place.reviews || []);
  }

  function renderCards(reviews) {
    var good = reviews.filter(function (r) {
      return r.rating >= CONFIG.minRating && reviewText(r).trim();
    }).slice(0, CONFIG.maxReviews);
    if (!good.length) return;

    var list = q("[data-rev-list]");
    list.textContent = "";
    good.forEach(function (r) {
      var card = el("li", "rev-card");
      var cardStars = el("p", "rev-card-stars", stars(r.rating));
      cardStars.setAttribute("aria-label", r.rating + " out of 5 stars");
      card.appendChild(cardStars);
      card.appendChild(el("blockquote", "rev-text", reviewText(r)));

      var by = el("p", "rev-by");
      var author = r.authorAttribution || {};
      if (author.photoURI) {
        var img = el("img", "rev-avatar");
        img.src = author.photoURI;
        img.alt = "";
        img.width = 32;
        img.height = 32;
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        by.appendChild(img);
      }
      var name = el(author.uri ? "a" : "span", "rev-name", author.displayName || "Google user");
      if (author.uri) { name.href = author.uri; name.target = "_blank"; name.rel = "noopener"; }
      by.appendChild(name);
      if (r.relativePublishTimeDescription) by.appendChild(el("span", "rev-when", r.relativePublishTimeDescription));
      card.appendChild(by);
      list.appendChild(card);
    });
    list.hidden = false;
    q("[data-rev-attrib]").hidden = false;
    section.classList.add("has-reviews");
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  if (CONFIG.manualReviews.length) {
    renderCards(CONFIG.manualReviews.map(function (r) {
      return { rating: r.rating, text: r.text, authorAttribution: { displayName: r.author }, relativePublishTimeDescription: r.when };
    }));
  }
  if (!CONFIG.apiKey) return;

  window.__dhanwanthariReviews = function () {
    google.maps.importLibrary("places").then(function (lib) {
      return lib.Place.searchByText({
        textQuery: CONFIG.placeQuery,
        fields: ["id", "displayName", "rating", "userRatingCount", "reviews", "googleMapsURI"],
        maxResultCount: 1
      });
    }).then(function (res) {
      if (res.places && res.places[0]) render(res.places[0]);
    }).catch(function (err) {
      console.warn("Google reviews could not load:", err);
    });
  };

  // Load Google's script only when the section is close to view, so visitors who never scroll
  // that far don't trigger a (billed) Places request.
  function load() {
    var s = document.createElement("script");
    s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(CONFIG.apiKey) +
      "&v=weekly&loading=async&callback=__dhanwanthariReviews";
    s.async = true;
    document.head.appendChild(s);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); load(); }
    }, { rootMargin: "800px 0px" });
    io.observe(section);
  } else {
    load();
  }
})();
