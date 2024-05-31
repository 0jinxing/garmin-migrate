import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { HeatmapChart } from "echarts/charts";
import { CalendarComponent, VisualMapComponent } from "echarts/components";

use([CanvasRenderer, HeatmapChart, CalendarComponent, VisualMapComponent]);

export {};
