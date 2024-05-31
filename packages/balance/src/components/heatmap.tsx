import { createSignal, onMount, createMemo, createEffect } from "solid-js";
import type { Component } from "solid-js";
import { heatmap } from "../utils";
import * as echarts from "echarts/core";
import "../echarts-register";

export type HeatmapProps = { activities: Parameters<typeof heatmap>[0] };

export const Heatmap: Component<HeatmapProps> = ({ activities }) => {
  const [ref, setRef] = createSignal<HTMLElement>();
  const [chart, setChart] = createSignal<echarts.ECharts>();

  const option = createMemo(() => {
    return heatmap(activities);
  });

  const update = () => chart()?.setOption(option());

  onMount(() => {
    setChart(echarts.init(ref()!));
    update();
  });

  createEffect(update);

  return <div class="w-96 h-96" ref={setRef}></div>;
};
