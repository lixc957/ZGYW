<template>
  <!-- 用于电能质量的实时监测 -->
  <div class="gradient" ref="bar"></div>
</template>

<script>
import echarts from "echarts";
export default {
  props: {
    series: Array,
    legendData: Array,
    xData: Array,
  },
  data() {
    return {
      myChart: null,
    };
  },
  watch: {
    series: {
      handler() {
        if (this.myChart) {
          this.myChart.clear();
        }
        this.initChart(this.series, this.legendData, this.xData);
      },
      deep: true,
    },
    legendData: {
      handler() {
        if (this.myChart) {
          this.myChart.clear();
        }
        this.initChart(this.series, this.legendData, this.xData);
      },
      deep: true,
    },
    legendData: {
      handler() {
        if (this.myChart) {
          this.myChart.clear();
        }
        this.initChart(this.series, this.legendData, this.xData);
      },
      deep: true,
    },
  },
  mounted() {
    // let obj = this.$refs.bar;
    // if (obj) {
    //   this.initChart();
    // }
  },
  methods: {
    initChart(series, legendData, xData) {
      this.$nextTick(() => {
        let color = [];
        legendData.forEach((item) => {
          color.push(item.color);
        });
        let myChart = echarts.init(this.$refs.bar);
        let option = {
          color: color,
          title: {
            text: xData.length ? "" : "暂无数据",
            x: "center",
            y: "center",
            textStyle: {
              color: "#999",
              fontWeight: "normal",
              fontSize: 16,
            },
          },
          grid: {
            left: "3%",
            right: "3%",
            bottom: "30",
            containLabel: true,
            lineStyle: {
              type: "solid",
              color: "#999", //左边线的颜色
              width: "1", //坐标线的宽度
            },
          },
          legend: {
            type: "scroll",
            orient: "horizontal",
            left: "center",
            bottom: 0,
            textStyle: {
              color: "#999",
            },
            data: legendData,
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            }
          },
          yAxis: {
            type: "value",
            boundaryGap: [0, 0.01],
            // name: "kwh",
            splitLine: {
              show: true,
              lineStyle: {
                color: ["#315070"],
                width: 1,
                type: "solid",
              },
            },
            axisLine: {
              lineStyle: {
                type: "solid",
                color: "#999", //左边线的颜色
                width: "1", //坐标线的宽度
              },
            },
          },
          xAxis: {
            type: "category",
            data: xData,
            axisLine: {
              lineStyle: {
                type: "solid",
                color: "#999", //左边线的颜色
                width: "1", //坐标线的宽度
              },
            },
          },
          series,

          textStyle: {
            color: "#999",
          },
        };
        myChart.setOption(option);
        this.myChart = myChart;
        window.addEventListener("resize", () => {
          this.myChart.resize();
        });
      });
    },
  },
};
</script>

<style>
.gradient {
  width: 100%;
  height: 100%;
}
</style>