(function () {
  // Paste the link from Google Sheets: File > Share > Publish to web > "Games Completed" tab > CSV
  var CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTlOhBrk_SZ4vop6Rx6jpeitEeiJ76uVKOYnsoU1PGKZF_pINkKcfdBbxKwdZwgtw/pubhtml?gid=1187487172&single=true";

  // Maps the sheet's Platform value to the id of the <div class="games"> on the page
  var CONTAINERS = { "PC": "pc-games", "Xbox": "xbox-games" };

  function parseCSV(text) {
    var rows = [], row = [], field = "", inQuotes = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') { inQuotes = false; }
        else { field += c; }
      } else if (c === '"') { inQuotes = true; }
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); field = ""; rows.push(row); row = [];
      } else { field += c; }
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function el(tag, cls, text) {
    var d = document.createElement(tag);
    d.className = cls;
    if (text) d.textContent = text;
    return d;
  }

  function makeRow(cls, year, game, note) {
    var r = el("div", cls ? "row " + cls : "row");
    r.appendChild(el("div", "cell year", year));
    r.appendChild(el("div", "cell game", game));
    r.appendChild(el("div", "cell note", note));
    return r;
  }

  function render(container, games) {
    var header = container.querySelector(".row.header");
    container.innerHTML = "";
    if (header) container.appendChild(header);
    var lastYear = null;
    games.forEach(function (g) {
      var newYear = g.year !== lastYear;
      if (newYear && lastYear !== null) container.appendChild(makeRow("space", "", "", ""));
      var parts = [];
      if (g.complete) parts.push("100%");
      if (g.notes) parts.push(g.notes);
      if (g.hours) parts.push(g.hours + "h");
      if (g.month) parts.push(g.month);
      container.appendChild(makeRow(g.complete ? "perfect" : "", newYear ? g.year : "", g.game, parts.join(" / ")));
      lastYear = g.year;
    });
  }

  fetch(CSV_URL)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (text) {
      var rows = parseCSV(text);
      var head = rows.shift().map(function (h) { return h.trim().toLowerCase(); });
      var col = function (name) { return head.indexOf(name); };
      var byPlatform = {};
      rows.forEach(function (r) {
        var game = (r[col("game")] || "").trim();
        if (!game) return;
        var platform = (r[col("platform")] || "").trim();
        (byPlatform[platform] = byPlatform[platform] || []).push({
          year: (r[col("year")] || "").trim(),
          month: (r[col("month")] || "").trim(),
          game: game,
          notes: (r[col("notes")] || "").trim(),
          hours: (r[col("hours")] || "").trim(),
          complete: (r[col("100% complete")] || "").trim().toUpperCase() === "TRUE"
        });
      });
      Object.keys(CONTAINERS).forEach(function (p) {
        var container = document.getElementById(CONTAINERS[p]);
        if (container && byPlatform[p] && byPlatform[p].length) render(container, byPlatform[p]);
      });
    })
    .catch(function (err) {
      // Leave the existing static rows in place if the sheet can't be loaded
      console.warn("Games sheet not loaded:", err);
    });
})();
