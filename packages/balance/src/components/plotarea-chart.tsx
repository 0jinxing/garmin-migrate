import type { Mesg } from "@gc/types";
import { createSignal, onMount } from "solid-js";
import { Chart, type ChartData } from "chart.js/auto";

export type PlotAreaChartProps = {
  mesgs: Mesg[];
};

export const PlotAreaChart = ({ mesgs }: PlotAreaChartProps) => {
  const [element, setElement] = createSignal<HTMLCanvasElement>();

  onMount(() => {
    const labels = mesgs.map((mesg) =>
      new Date(mesg.timestamp).toLocaleTimeString()
    );

    const data: ChartData = {
      labels: labels,
      datasets: [
        {
          label: "Heart Rate",
          data: mesgs.map((m) => m.heartRate),
        },
      ],
    };

    new Chart(element()!, {
      type: "bar",
      data,
      options: {
        layout: { autoPadding: true },
        plugins: {
          legend: { display: false },
        },
      },
    });
  });

  return (
    <div class="w-96 h-96 flex items-center justify-center p-2">
      <canvas ref={setElement}></canvas>
    </div>
  );
};
