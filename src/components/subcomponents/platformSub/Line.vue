<template>
  <!-- 曲线图加颜色渐变 -->
  <div ref="chart" class="area"></div>
</template>

<script>
import echarts from "echarts";
export default {
  props: {
    xAxis: Array,
    values: Array,
    legendData: Array,
    title: String,
    color: Array,
  },
  data() {
    return {
      option: {},
    };
  },
  mounted() {
    this.initChart();
  },
  watch: {
    xAxis() {
      this.initChart();
    },
    values() {
      this.initChart();
    },
  },
  methods: {
    //   获取属性值集合
    getObjectValues(arr) {
      var values = [];
      arr.forEach((item) => {
        for (var property in item) values.push(item[property]);
      });
      return values;
    },
    initChart() {
      if (this.myChart) {
        this.myChart.clear();
      }
      this.myChart = echarts.init(this.$refs.chart);
      let xAxis = this.xAxis;
      let values = this.values;
      this.option = {
        color: this.color,
        title: {
          text: this.title,
          textStyle: {
            color: "#999",
          },
          left: 10,
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: this.legendData,
          type: "scroll",
          textStyle: {
            color: "#999",
          },
          itemHeight: 20,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.xAxis,
          axisLabel: {
            show: true,
            // interval: this.line_obj.trans,
            textStyle: {
              color: "#666",
              fontSize: "12",
            },
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            show: true,
            // interval: this.line_obj.trans,
            textStyle: {
              color: "#666",
              fontSize: "12",
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "rgba(100, 90, 122)",
            },
          },
        },
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 300,
          },
        ],
        series: [],
      };

      let series = [];
      this.values.forEach((item) => {
        series.push({
          name: item.variableName,
          data: this.getObjectValues(item.data),
          type: "line",
          stack: "电压电流",
          symbol:"circle",
          smooth:true,
          lineStyle: {
            normal: {
              color: item.color,
              width: 2,
              //   type: "dashed",
            },
          },
          // smooth: true,
          // areaStyle: {
          //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //     {
          //       offset: 0,
          //       color: "rgb(42, 122, 212)",
          //     },
          //     {
          //       offset: 1,
          //       color: "rgb(200, 200, 200)",
          //     },
          //   ]),
          // },
          //   markLine: {
          //     /*以下设置一行后，平均线就没有开始和结束标记了（即看不见箭头了）*/
          //     // symbol: "none",
          //     data: [
          //       {
          //         name: "平均线",
          //         // 支持 'average', 'min', 'max'
          //         type: "average",
          //         lineStyle: {
          //           normal: {
          //             color: "rgb(58, 100, 160)",
          //             width: 2,
          //             type: "dashed",
          //           },
          //         },
          //       },
          //     ],
          //   },
        });
      });
      this.$set(this.option, "series", series);
      console.log("option", this.option);
      this.myChart.setOption(this.option);
    },
  },
};
</script>

<style lang="less" scoped>
.area {
  width: 100%;
  height: 100%;
}
</style>