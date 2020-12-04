<template>
  <!-- 使用于设备参数监控的曲线图显示 -->
  <div
    style="display: inline-block;overflow-y:auto; margin-right: 10px; margin-bottom: 10px; width: 100%; min-height: 300px; height: 100%;"
  >
    <div class="testEcharts" ref="statistics"></div>
  </div>
</template>

<script>
import echarts from "echarts";
export default {
  props: ["line_total", "unit"],
  data() {
    return {
      statistics: {
        option: null,
        chart: null,
        element: null,
      },
      option: {},
      myChart: null,
      seriesData: [],
    };
  },
  watch: {
    line_total: {
      handler(newVal, oldVal) {
        this.getSeriesData();
        this.initData();
      },
      deep: true,
    },
  },
  mounted() {
    window.addEventListener("resize", this.onWindowResize);
    this.onWindowResize();
  },
  beforeDestroy() {
    window.resize = null;
  },
  methods: {
    symbolFunctionHour(value, params) {
      if (params.dataIndex % 12 == 0) {
        return "emptyCircle";
      } else {
        return "none";
      }
    },
    symbolFunctionM(value, params) {
      return "emptyCircle";
    },
    getSeriesData() {
      let arrss = this.line_total.data;
      let data;
      this.seriesData = [];
      for (let i = 0; i < arrss.length; i++) {
        if (this.line_total.xAxisArrs[i] == 1) {
          this.seriesData.push({
            data: arrss[i].data,
            name: arrss[i].name,
            showAllSymbol: true,
            type: "line",
            smooth:true,
            symbol: this.symbolFunctionHour,
          });
        } else {
          this.seriesData.push({
            data: arrss[i].data,
            name: arrss[i].name,
            showAllSymbol: true,
            type: "line",
            smooth:true,
            symbol: this.symbolFunctionM,
          });
        }
      }
    },
    getDataValue(arr) {
      let res = arr[0].name + "<br/>";
      for (let i = 0; i < arr.length; i++) {
        if (this.line_total.xAxisArrs[arr[i].componentIndex] == 1) {
          if (arr[i].dataIndex % 12 == 0) {
            res +=
              arr[i].marker + arr[i].seriesName + ":&nbsp" + arr[i].value + "<br/>";
          }
        } else {
          res +=
            arr[i].marker + arr[i].seriesName + ":&nbsp" + arr[i].value + "<br/>";
        }
      }
      return res;
    },
    onWindowResize() {
      this.getSeriesData();
      this.initData();
      this.myChart.resize();
    },
    initData() {
      if (this.myChart) {
        this.myChart.clear();
      }
      this.option = {
        color: this.line_total.color,
        title: {
          // text: this.line_obj.name,
          subtext: this.unit,
          show: true,
          left: 38,
          top: 20,
        },
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            let res = this.getDataValue(params);
            return res;
          },
        },
        legend: {
          data: this.line_total.code,
          textStyle: {
            color: "#666",
          },
          itemHeight: 20,
          type: "scroll",
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        calculable: false,
        xAxis: {
          type: "category",
          boundaryGap: false,
          axisLabel: {
            show: true,
            textStyle: {
              color: "#999",
              fontSize: "12",
            },
          },
          data: this.line_total.xData,
        },
        yAxis: {
          type: "value",
          axisLabel: {
            show: true,
            textStyle: {
              color: "#999",
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
        series: this.seriesData,
      };
      console.log("option", this.option);
      this.myChart = echarts.init(this.$refs.statistics);
      if (this.myChart) {
        // this.$nextTick( () => {
        this.myChart.clear();
        // })
      }
      this.myChart.setOption(this.option);
    },
    // 删除单个图表传值给父组件
    delete_line() {
      this.$emit("delete_line", this.line_obj.id);
    },
    check_line() {
      this.$emit("check_line", this.line_obj.id);
    },
  },
};
</script>
<style scoped>
.title {
  height: 50px;
  position: relative;
}

.title .el-tooltip {
  margin-top: 10px;
  width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: none;
}

.title span {
  font-size: 26px;
}

.title .btn {
  right: 20px;
  position: absolute;
  top: 10px;
}

.testEcharts {
  border-right: 0;
  border-left: 0;
  /* width: 700px;
  height: 350px; */
  width: 100%;
  height: 100%;
}
</style>
