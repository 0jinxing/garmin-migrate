import { onMount, createSignal } from "solid-js";
import type { Mesg } from "@gc/types";
import Map from "ol/Map";
import OSM from "ol/source/OSM";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Vector from "ol/source/Vector";
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import "ol/ol.css";

export type PolylineMapProps = { mesgs: Mesg[] };

export const PolylineMap = ({ mesgs: fit }: PolylineMapProps) => {
  const [element, setElement] = createSignal<HTMLElement>();

  onMount(() => {
    const mesgs = fit.filter((r) => r.positionLat && r.positionLong);

    const route = new LineString(
      mesgs.map((msg) => [
        msg.positionLong! / 11930465,
        msg.positionLat! / 11930465,
      ])
    );
    const routeFeature = new Feature({ geometry: route });

    const vectorLayer = new VectorLayer({
      source: new Vector({ features: [routeFeature] }),
    });

    const center = mesgs[Math.floor(mesgs.length / 2)];

    new Map({
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      target: element(),
      view: new View({
        projection: "EPSG:4326",
        center: [
          center.positionLong! / 11930465,
          center.positionLat! / 11930465,
        ],
        zoom: 15,
      }),
    });
  });

  return <div ref={setElement} class="h-96 w-96"></div>;
};
