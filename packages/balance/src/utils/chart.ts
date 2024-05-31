import type { Act } from "@gc/types";
import * as echarts from "echarts/core";

export function polar(activities: Pick<Act, "beginTimestamp" | "distance">[]) {
  return {
    polar: {
      radius: [30, "80%"],
    },
    angleAxis: { max: 100, startAngle: 90 },
    radiusAxis: {
      type: "category",
      data: ["周", "月", "年"],
    },
    tooltip: {},
    series: {
      type: "bar",
      data: [100, 45, 10],
      coordinateSystem: "polar",
      label: {
        show: true,
        position: "middle",
        formatter: "{b}: {c}",
      },
    },
  };
}

export function heatmap(
  activities: Pick<Act, "beginTimestamp" | "distance">[]
) {
  const data = activities.reduce((data, { beginTimestamp, distance }) => {
    const date = echarts.time.format(
      new Date(beginTimestamp),
      "{yyyy}-{MM}-{dd}",
      false
    );

    const index = data.findIndex(([d]) => d === date);

    if (~index) {
      data[index][1] += distance;
    } else {
      data.push([date, distance]);
    }

    return data;
  }, [] as [string, number][]);

  const timestampList = activities.map((a) => a.beginTimestamp);
  const range = [
    echarts.time.format(Math.min(...timestampList), "{yyyy}-{MM}-{dd}", false),
    echarts.time.format(Math.max(...timestampList), "{yyyy}-{MM}-{dd}", false),
  ];

  const max = Math.max(...data.map(([, v]) => v), 200000);
  const min = 0;

  return {
    visualMap: { show: false, min, max },
    calendar: { range },
    series: { type: "heatmap", coordinateSystem: "calendar", data },
  };
}
