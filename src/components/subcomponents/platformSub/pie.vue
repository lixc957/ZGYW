
<template>
  <!--为echarts准备一个具备大小的容器dom-->
  <div id="main" style="width: 100%;height: 100%;"></div>
</template>
<script>
import echarts from "echarts";
export default {
  props: ["dataArr", "titleArr", "total"],
  name: "",
  data() {
    return {
      charts: "",
      opinion: [],
      opinionData: [],
      title: "",
      // opinion: [],
      // opinionData: []
    };
  },
  watch: {
    dataArr() {
      this.drawPie("main");
    },
    titleArr() {
      this.drawPie("main");
    },
    total() {
      this.drawPie("main");
    },
  },
  methods: {
    drawPie(id) {
      if (this.charts) {
        this.charts.clear();
      }
      this.charts = echarts.init(document.getElementById(id));
      var _this = this;
      window.addEventListener("resize", function () {
        _this.charts.resize();
      });
      this.charts.resize();
      this.charts.setOption({
        title: {
          zlevel: 0,
          text: ["{value|" + this.total + "}", "{name|总用电量}"].join("\n"),
          rich: {
            value: {
              color: "#999",
              fontSize: 30,
              fontWeight: "bold",
              lineHeight: 40,
            },
            name: {
              color: "#909399",
              lineHeight: 20,
            },
          },
          top: "center",
          left: "center",
          textStyle: {
            rich: {
              value: {
                color: "#ddd",
                fontSize: 36,
                fontWeight: "bold",
                lineHeight: 40,
              },
              name: {
                color: "#aaa",
                lineHeight: 20,
              },
            },
          },
        },
        tooltip: {
          trigger: "item",
          formatter: "{a}<br/>{b}:{c} ({d}%)",
          textStyle: {
            color: "#ddd",
          },
        },
        legend: {
          orient: "vertical",
          x: "left",
          data: this.titleArr,
          textStyle: {
            color: "#ccc",
          },
        },
        series: [
          {
            name: "能耗类型",
            type: "pie",
            radius: ["50%", "70%"],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: "right",
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: "30",
                  fontWeight: "blod",
                },
              },
            },
            labelLine: {
              normal: {
                show: false,
              },
            },
            data: this.dataArr,
            itemStyle: {
              emphasis: {},
              normal: {
                color: function (params) {
                  var colorList = [
                    "rgb(215, 215, 104)",
                    "rgb(56, 137, 252)",
                    "rgb(247, 96, 77)",
                    "rgb(168, 213, 130)",
                    "rgb(157, 102, 204)",
                  ];
                  return colorList[params.dataIndex];
                },
              },
            },
          },
        ],
      });
    },
  },
  //调用
  mounted() {
    this.$nextTick(function () {
      this.drawPie("main");
    });
  },
};
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
