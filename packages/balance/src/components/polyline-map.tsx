import { onMount, createSignal } from "solid-js";
import type { Mesg } from "@gc/types";
import Map from "ol/Map";
import OSM from "ol/source/OSM";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import VectorSource from "ol/source/Vector";
import "ol/ol.css";

export type PolylineMapProps = { mesgs: Mesg[] };

function mesgsToPolylineLayer(mesgs: Mesg[]) {
  const coordinates: [long: number, lat: number, weight: number][] = mesgs
    .filter((r) => r.positionLat && r.positionLong)
    .map((msg) => [
      msg.positionLong! / 11930465,
      msg.positionLat! / 11930465,
      msg.heartRate,
    ]);
  const max = Math.max(...coordinates.map((c) => c[2]));
  const min = Math.min(...coordinates.map((c) => c[2]));
  const range = max - min;
  const colors = coordinates.map((c) => {
    const intensity = (c[2] - min) / range;
    const r = intensity * 255;
    const g = 255 - r;
    return `rgb(${r}, ${g}, 0)`;
  });
  const features = coordinates.slice(0, coordinates.length - 1).map((c, i) => {
    const f = new Feature(new LineString([c, coordinates[i + 1]]));
    f.setStyle(
      new Style({ stroke: new Stroke({ color: colors[i], width: 3 }) })
    );
    return f;
  });

  return new VectorLayer({ source: new VectorSource({ features }) });
}

export const PolylineMap = ({ mesgs: fit }: PolylineMapProps) => {
  const [element, setElement] = createSignal<HTMLElement>();

  onMount(() => {
    const coordinates = fit
      .filter((r) => r.positionLat && r.positionLong)
      .map((msg) => [
        msg.positionLong! / 11930465,
        msg.positionLat! / 11930465,
      ]);

    const center = coordinates[Math.floor(coordinates.length / 2)];

    const tile = new TileLayer({ source: new OSM() });
    new Map({
      layers: [tile, mesgsToPolylineLayer(fit)],
      target: element(),
      view: new View({ projection: "EPSG:4326", center, zoom: 15 }),
    });
  });

  return <div ref={setElement} class="h-96 w-96"></div>;
};
