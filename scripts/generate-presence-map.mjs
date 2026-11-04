import fs from "node:fs";
// Source: https://github.com/johan/world.geo.json/blob/master/countries/IND.geo.json
// Projection is shared with CityPresence.tsx (600 x 640).
const geo = JSON.parse(fs.readFileSync(new URL("../public/india-outline.geo.json", import.meta.url), "utf8"));
const g = geo.features ? geo.features[0].geometry : geo.geometry;
const polygons = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
const path = polygons.map(p => p.map(r => r.map(([lon, lat], i) => `${i ? "L" : "M"}${((lon - 67) * 18).toFixed(2)},${((38 - lat) * 20).toFixed(2)}`).join(" ") + "Z").join(" ")).join(" ");
fs.writeFileSync(new URL("../public/india-presence-map.svg", import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 640"><title>India outline</title><path d="${path}" fill="#2147a8" stroke="#7693d2" stroke-width="1.3" stroke-linejoin="round"/></svg>`);
console.log("India map SVG generated.");
