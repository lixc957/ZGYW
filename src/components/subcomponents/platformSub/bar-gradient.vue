<template>
  <!-- 多条柱状图带伸缩 -->
  <div class="gradient" ref="bar"></div>
</template>

<script>
import echarts from "echarts";
export default {
  props: {
    dataAxis: Array,
    data: Array,
  },
  watch: {
    dataAxis() {
      this.dataAxis = this.dataAxis;
      this.data = this.data;
      this.renderEcharts();
    },
    data() {
      this.dataAxis = this.dataAxis;
      this.data = this.data;
      this.renderEcharts();
    },
  },
  data() {
    return {};
  },
  mounted() {
    this.renderEcharts();
  },
  methods: {
    renderEcharts() {
      var dataAxis = this.dataAxis;
      var data = this.data;
      console.log(dataAxis,data)
      var yMax = 500;
      var dataShadow = [];
      let option = {
        title: {
          // text: "实时负荷趋势",
          // subtext: "Feature Sample: Gradient Color, Shadow, Click Zoom"
          textStyle: {
            color: "#ccc",
          },
        },
        tooltip: {
          // 当tooltip的trigger为‘axis’时，显示多项数据内容数组
          trigger: "axis",
        },
        grid: {
          left: "3%",
          right: "2%",
          bottom: "3%",
          top: "12%",
          containLabel: true,
          // show: true,
          // borderColor: 'rgba(200,200,200,0.3)',
        },
        xAxis: {
          data: dataAxis,
          axisLabel: {
            // inside: true,
            textStyle: {
              color: "#fff",
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          z: 10,
        },
        yAxis: {
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            textStyle: {
              color: "#999",
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "rgba(100, 90, 122)",
            },
          },
        },
        // 数据缩放
        dataZoom: [
          {
            type: "inside",
          },
        ],

        series: [
          // {
          //   type: "bar",
          //   itemStyle: {
          //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //       { offset: 0, color: "#83bff6" },
          //       { offset: 1, color: "#188df0" }
          //     ])
          //   },
          //   emphasis: {
          //     itemStyle: {
          //       color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //         { offset: 0, color: "#2378f7" },
          //         { offset: 1, color: "pink" }
          //       ])
          //     }
          //   },
          //   data: data
          // },
          // {
          //   type: 'line',
          //   smooth: true,
          //   data: data,
          // }
          {
            name: "A",
            type: "bar",
            // barGap: '20%',
            // label: labelOption,
            data: data,
          },
        ],
      };
      for (var i = 0; i < data.length; i++) {
        dataShadow.push(yMax);
      }
      let myChart = echarts.init(this.$refs.bar);
      myChart.setOption(option);
      // Enable data zoom when user click bar.
      var zoomSize = 6;
      myChart.on("click", function (params) {
        console.log(dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)]);
        myChart.dispatchAction({
          type: "dataZoom",
          startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
          endValue:
            dataAxis[
              Math.min(params.dataIndex + zoomSize / 2, data.length - 1)
            ],
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