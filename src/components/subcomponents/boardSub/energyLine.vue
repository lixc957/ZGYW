<template>
  <div class="wrapper hasBacBox">
    <!-- 能耗曲线 -->
    <div class="config" v-show="ifEdit">
      <el-button size="mini" @click="editBoard" type="text">配置</el-button>
      <el-button size="mini" @click="delBoard" type="text">删除</el-button>
    </div>
    <div
      class="titleBox"
      style="height: 20px; background-color: #54657D; padding: 5px; color: #fff; font-weight: bold; border-bottom: 1px solid #ccc;"
    >
      <span>
        <i class="icon iconfont iconzhexiantu" style="color: #0eceec"></i>
        <span>{{JSON.parse(item.param).title}}</span>
      </span>
    </div>

    <div class="chart whiteBox" id="line-chart" ref="chart"></div>
  </div>
</template>

<script>
import Echart from "Echarts";

export default {
  props: ["i", "item", "ifEdit"],
  data() {
    return {
      lineObj: {
        series: [],
        timeX: [],
      },
      timeSelect: "",
    };
  },
  watch: {
    item: {
      handler(newValue) {
        this.timeSelect = JSON.parse(this.item.param).timeType;
      },
      deep: true,
    },
    timeSelect() {
      this.getLine();
    },
  },
  created() {
    this.getLine();
  },
  methods: {
    editBoard() {
      this.$emit("editBoard", this.i, this.item);
    },
    delBoard() {
      this.$emit("delBoard", this.i, this.item);
    },
    // 获取曲线数据
    getLine() {
      let tb = "";
      let year = new Date().getFullYear();
      let month =
        new Date().getMonth() > 8
          ? new Date().getMonth() + 1
          : "0" + (new Date().getMonth() + 1);
      let day =
        new Date().getDate() > 9
          ? new Date().getDate()
          : "0" + new Date().getDate();
      if (JSON.parse(this.item.param).timeType === "day") {
        tb = year + '-' + month + '-' + day;
      } else if (JSON.parse(this.item.param).timeType === "month") {
        tb = year + '-' + month 
      } else {
        tb = year;
      }
      this.$http
        .get("equipment/energyBranch/siteFeesByDate", {
          params: {
            siteId: this.$store.state.site.siteId,
            type: JSON.parse(this.item.param).timeType,
            time: tb,
            // tb: "day_20200623",
            // type: "day"
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            var obj = this.getSeries(
              JSON.parse(this.item.param).timeType,
              res.data.data
            );

            this.lineObj.series = obj.series
            this.lineObj.timeX = obj.arr
            // 重绘图表
            this.drawChart()
          }
        });
    },
    // 获取数据格式
    getSeries(type, data) {
      var arr = [];
      var scale = 1; //显示缩放
      if (type === "month") {
        for (var i = 1; i <= 31; i++) {
          arr.push(i);
        }
        scale = 2;
      } else if (type === "day") {
        for (var i = 0; i <= 23; i++) {
          // 修改匹配规则
          var i1;
          if (i < 10) {
            i1 = "0" + i;
          } else {
            i1 = i + "";
          }
          arr.push(i1);
        }
        scale = 2;
      } else if (type === "year") {
        for (var i = 1; i <= 12; i++) {
          arr.push(i);
        }
        scale = 1;
      }
      // return
      var series = [
        {
          data: [],
          type: "line",
          smooth:true,
          symbol: "circle",
        },
      ];
      // 赋空值
      for (let i = 0; i < arr.length; i++) {
        series[0].data.push(null);
      }
      // 赋值
      for (let i = 0; i < data.length; i++) {
        series[0].data[parseInt(data[i].time)] = data[i].value;
      }
      var obj = {
        series: series,
        arr: arr,
      };
      return obj;
    },
    // 绘图
    drawChart() {
      if (this.chart) {
        this.chart.clear();
      }
      let chart = Echart.init(this.$refs.chart);
      this.chart = chart;

      // 监听屏幕变化自动缩放图表
      window.addEventListener("resize", function () {
        chart.resize();
      });
      chart.resize();

      // 绘制图表
      chart.setOption({
        // title: {
        //   text: "折线图堆叠"
        // },
        // color: ["#32A8E6", "#FF954A", "#45E2CF", "#EE5196", "#Eaf"], //默认颜色
        color: JSON.parse(this.item.param).color, //默认颜色
        tooltip: {
          trigger: "axis",
        },
        // legend: {
        //   // data: ["邮件营销", "联盟广告", "视频广告", "直接访问", "搜索引擎"]
        //   // data: this.code.split(",")
        //   data: this.codeName.split(","),
        //   textStyle: {
        //     color: "#fff"
        //   }
        //   // data: ['aaa']
        // },
        grid: {
          top: "25",
          left: "3%",
          right: "4%",
          bottom: "1%",
          containLabel: true,
        },
        toolbox: {
          feature: {
            // saveAsImage: {}
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          // data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
          data: this.lineObj.timeX,
          axisLine: {
            lineStyle: {
              color: "#666",
            },
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            lineStyle: {
              color: "#666",
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
        series: this.lineObj.series,
        // series: [
          //   {
          //     data: [120, 132, 101, 134, 90, 230, 210],
          //     name: "邮件营销",
          //     type: "line"
          //   }
          // ]
      });
      setTimeout(() => {
        chart.resize();
      }, 10);
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../../assets/css/index.less";
.wrapper {
  width: 100%;
  height: 100%;
  background-color: #4e657a;
  .config {
    float: right;
    cursor: pointer;
  }
  .chart {
    height: calc(100% - 30px);
    background-size: 100% 100%;
  }
}
</style>