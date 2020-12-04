<template>
  <!-- 能源统计 -->
  <div class="energy-statistics" style="height: 100%">
    <MyBreadcrumb level1="能源管理" level2="能源统计"></MyBreadcrumb>
    <div class="scroll layout-scroll" style>
      <div class="statistics-layout">
        <div
          class="statistics-left"
          :style="{ width: leftWidth + 'px' }"
          ref="leftBox"
        >
          <div class="select radiu-margin whiteBox" ref="topBox">
            <div class="filter" style>
              <div class="left-title titleBox" style>
                <span style>筛选条件</span>
              </div>
              <div class="label" style>
                <span>类别：</span>
                <el-radio-group v-model="energyType" size="mini">
                  <el-radio-button
                    v-for="(item, index) in energyTypeOptions"
                    :key="index"
                    :label="item.id"
                    >{{ item.properties }}</el-radio-button
                  >
                </el-radio-group>
              </div>
              <div class="label" style="margin-top: 10px">
                <span>标签：</span>
                <el-radio-group v-model="type" size="mini">
                  <el-radio-button label="branch">支路</el-radio-button>
                  <el-radio-button label="department">部门</el-radio-button>
                </el-radio-group>
              </div>
              <div class="label" style="margin-top: 10px">
                <span>{{ type == "branch" ? "支路：" : "标签：" }}</span>
                <el-select
                  v-if="type == 'branch'"
                  v-model="branch"
                  style="width: 200px"
                  size="mini"
                >
                  <el-option
                    v-for="(item, index) in selectArr"
                    :key="index"
                    :value="item"
                    :label="item"
                  ></el-option>
                </el-select>
                <el-radio-group
                  v-if="type == 'department'"
                  v-model="timeType"
                  size="mini"
                >
                  <el-radio-button label="d">日</el-radio-button>
                  <el-radio-button label="m">月</el-radio-button>
                  <el-radio-button label="y">年</el-radio-button>
                </el-radio-group>
              </div>
              <div
                class="label"
                v-show="type == 'department'"
                style="margin-top: 10px"
              >
                <span>日期：</span>
                <el-date-picker
                  v-show="timeType == 'd'"
                  size="mini"
                  v-model="selectTime"
                  type="date"
                  placeholder="选择日"
                  :picker-options="pickerOptions"
                ></el-date-picker>
                <el-date-picker
                  v-show="timeType == 'm'"
                  size="mini"
                  v-model="selectTime"
                  type="month"
                  placeholder="选择月"
                  :picker-options="pickerOptions"
                ></el-date-picker>
                <el-date-picker
                  v-show="timeType == 'y'"
                  size="mini"
                  v-model="selectTime"
                  type="year"
                  placeholder="选择年"
                  :picker-options="pickerOptions"
                ></el-date-picker>
              </div>
              <!-- <div class="label" v-show="type=='department'" style="margin-top:10px;">
                <span></span>
                <el-button
                  style="margin-left:6px;"
                  icon="el-icon-search"
                  type="primary"
                  @click="renderDepartment"
                >查询</el-button>
              </div>-->
            </div>
          </div>
          <div
            class="total-statistics radiu-margin whiteBox"
            :style="{ height: boxHeight + 'px' }"
          >
            <div class="chartsBox whiteBox" v-show="type == 'branch'">
              <div class="left-title titleBox" style>
                <span style="color: white; padding-left: 10px"
                  >本月用{{ getEnergyType }}</span
                >
              </div>
              <div
                class="whiteBox"
                style="
                  display: -webkit-flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  height: calc(100% - 30px);
                "
              >
                <label
                  class="value"
                  style="
                    color: rgba(39, 182, 205);
                    font-size: 46px;
                    padding-right: 10px;
                  "
                  >{{
                    monthEnergy >= 100000000
                      ? (monthEnergy / 1000).toFixed(2)
                      : monthEnergy
                  }}</label
                >
                <label class="value" style="font-size: 20px; color: #666">{{
                  monthEnergy >= 100000000 ? "mWh" : getEnergyUnit
                }}</label>
              </div>
            </div>
            <div class="chartsBox whiteBox" v-show="type == 'department'">
              <div class="left-title titleBox" style>
                <span style="color: white; padding-left: 10px"
                  >部门用{{ getEnergyType }}占比</span
                >
              </div>
              <div class="echarts_con" ref="ratioCharts"></div>
            </div>
          </div>
          <div
            class="top-statistics radiu-margin"
            :style="{ height: boxHeight + 'px' }"
          >
            <div class="chartsBox whiteBox" v-show="type == 'branch'">
              <div class="left-title titleBox" style>
                <span style="color: white; padding-left: 10px"
                  >今日用{{ getEnergyType }}</span
                >
              </div>
              <div
                class="whiteBox"
                style="
                  display: -webkit-flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  height: calc(100% - 40px);
                "
              >
                <!--  #4aa9e5 原本的颜色-->
                <label
                  class="value"
                  style="
                    color: rgba(39, 182, 205);
                    font-size: 46px;
                    padding-right: 10px;
                  "
                  >{{
                    dayEnergy >= 100000000
                      ? (dayEnergy / 1000).toFixed(2)
                      : dayEnergy
                  }}</label
                >
                <label class="value" style="font-size: 20px; color: #666">{{
                  dayEnergy >= 100000000 ? "mWh" : getEnergyUnit
                }}</label>
              </div>
            </div>
            <div class="chartsBox whiteBox" v-show="type == 'department'">
              <div class="left-title titleBox" style>
                <span style="color: white; padding-left: 10px"
                  >部门用{{ getEnergyType }}环比</span
                >
              </div>
              <div class="echarts_con" ref="circleCharts"></div>
            </div>
          </div>
        </div>
        <div class="statistics-right">
          <div class="statistics-right-line full_box" v-show="type == 'branch'">
            <div class="line radiu-margin whiteBox">
              <div class="left-title titleBox">
                <span style>支路今日用能曲线图</span>
              </div>
              <div style="height: calc(100% - 30px)">
                <poly_line :dataObj="dataObj"></poly_line>
              </div>
            </div>
          </div>
          <div
            class="full_box"
            style="margin-bottom: 10px"
            v-show="type == 'department'"
          >
            <div class="statistics-right-line half_box">
              <div class="chartsBox whiteBox">
                <div class="left-title titleBox" style>
                  <span style="color: white; padding-left: 10px"
                    >部门用{{ getEnergyType }}增幅前五名</span
                  >
                </div>
                <div
                  class="echarts_con whiteBox"
                  ref="amplificationCharts"
                ></div>
              </div>
            </div>
            <div class="statistics-right-line half_box">
              <div class="chartsBox whiteBox">
                <div class="left-title titleBox" style>
                  <span style="color: white; padding-left: 10px"
                    >部门用{{ getEnergyType }}前五名</span
                  >
                </div>
                <div class="echarts_con whiteBox" ref="sortCharts"></div>
              </div>
            </div>
          </div>
          <div class="statistics-right-report whiteBox">
            <div class="report radiu-margin">
              <div class="chartsBox whiteBox" v-show="type == 'branch'">
                <div class="left-title titleBox" style>
                  <span style>用能报表</span>
                </div>
                <div class="selectDiv">
                  <el-radio-group v-model="timeSelect" size="mini">
                    <el-radio-button label="day">日</el-radio-button>
                    <el-radio-button label="month">月</el-radio-button>
                    <el-radio-button label="year">年</el-radio-button>
                  </el-radio-group>
                </div>
                <div style="margin-bottom: 10px"></div>
                <div class="pole" style>
                  <Pole :dataObj="obj" :legend="legend"></Pole>
                </div>
              </div>
              <div class="chartsBox whiteBox" v-show="type == 'department'">
                <div class="left-title titleBox" style>
                  <span style>部门用{{ getEnergyType }}趋势</span>
                </div>
                <div class="echarts_con whiteBox" ref="tendencyCharts"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      ref="tip"
      class="tipname"
      :style="{ left: tipsLeft + 'px', top: tipsTop + 'px' }"
      v-show="tipsShow"
    >
      {{ tips }}
    </div>
  </div>
</template>

<script scoped>
import poly_line from "../subcomponents/polyline";
import MyBreadcrumb from "../subcomponents/Mybreadcrumb";
import Pole from "../subcomponents/pole";
import { formatEnergyData, rgb } from "../../utils/index";
import echarts from "echarts";
export default {
  components: {
    poly_line,
    MyBreadcrumb,
    Pole, //柱状图组件
  },
  props: [],
  data() {
    return {
      dataObj: {},
      type: "branch",
      energyType: "",
      energyTypeOptions: [],
      selectArr: [],
      branch: "",
      monthEnergy: "",
      dayEnergy: "",
      time: new Date(),
      timeSelect: null,
      tableData: [],
      historyData: [],
      table_data: {},
      obj: {},
      legend: ["今日", "昨日"],
      xNum: [],
      // 部门时间条件
      selectTime: Date.now(),
      timeType: "d",
      // 下面图的高度
      boxHeight: 0,
      leftWidth: 300,
      charts: [],
      pickerOptions: {
        disabledDate(time) {
          //此条为设置禁止用户选择今天之前的日期，包含今天。
          // return time.getTime() <= (Date.now()-(24 * 60 * 60 * 1000));
          //此条为设置禁止用户选择今天之前的日期，不包含今天。
          return time.getTime() >= Date.now();
        },
      },
      // 溢出鼠标提示
      tips: "",
      tipsLeft: 0,
      tipsTop: 0,
      tipsShow: false,
    };
  },
  computed: {
    watchSiteChange() {
      return this.$store.state.site.siteId;
    },
    // 获取显示类型
    getEnergyType() {
      if (this.energyTypeOptions.length === 0) {
        return "电";
      }
      var index = this.energyTypeOptions.findIndex((item) => {
        return item.id === this.energyType;
      });
      return this.energyTypeOptions[index].properties.split("").pop();
    },
    // 获取显示单位
    getEnergyUnit() {
      if (this.energyTypeOptions.length === 0) {
        return "kWh";
      }
      var index = this.energyTypeOptions.findIndex((item) => {
        return item.id === this.energyType;
      });
      return this.energyTypeOptions[index].unit;
    },
  },
  watch: {
    energyType(newValue, oldValue) {
      this.getSelectList();
      if (this.type == "department") {
        this.renderDepartment();
      }
    },
    type(newValue, oldValue) {
      this.getSelectList();
      this.$nextTick(() => {
        this.boxHeight =
          (this.$refs.leftBox.offsetHeight -
            this.$refs.topBox.offsetHeight -
            23) /
          2;
      });
      if (newValue == "department") {
        this.leftWidth = 400;
        setTimeout(() => {
          this.renderDepartment();
        });
      } else if (newValue == "branch") {
        this.leftWidth = 300;
      }
    },
    timeType(newValue, oldValue) {
      if (this.type == "department") {
        this.leftWidth = 400;
        setTimeout(() => {
          this.renderDepartment();
        });
      } else if (this.type == "branch") {
        this.leftWidth = 300;
      }
    },
    selectTime(newValue) {
      console.log(newValue);
      this.renderDepartment();
    },
    branch(newValue, oldValue) {
      // alert('branch')
      // return
      //
      // if(!newValue) {
      //   return
      // }
      this.getMonthEnergy();
      this.getDayEnergy();
      // this.getLineValue();
      this.getReportValue();
    },
    watchSiteChange(newValue, oldValue) {
      this.branch = null;
      this.getEnergyOptions_inSite();
      this.getSelectList();
      // this.getReportValue();
      // this.getHistoryValue();
      // this.getMonthEnergy();
      // this.getDayEnergy();
    },
    timeSelect(newValue, oldValue) {
      let arr = [];
      if (this.timeSelect === "day") {
        for (var i = 0; i < 24; i++) {
          arr.push(i < 10 ? "0" + i : i);
        }
        this.legend = ["今日", "昨日"];
      } else if (this.timeSelect === "month") {
        for (var i = 1; i < 32; i++) {
          arr.push(i < 10 ? "0" + i : i);
        }
        this.legend = ["本月", "上月"];
      } else {
        for (var i = 1; i < 13; i++) {
          arr.push(i < 10 ? "0" + i : i);
        }
        this.legend = ["今年", "去年"];
      }
      this.xNum = arr;
      this.getReportValue();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.boxHeight =
        (this.$refs.leftBox.offsetHeight -
          this.$refs.topBox.offsetHeight -
          30) /
        2;
    });
    window.addEventListener("resize", () => {
      this.$nextTick(() => {
        if (this.$refs.leftBox && this.$refs.topBox) {
          this.boxHeight =
            (this.$refs.leftBox.offsetHeight -
              this.$refs.topBox.offsetHeight -
              30) /
            2;
          setTimeout(() => {
            this.charts.forEach((item) => {
              if (item) {
                item.resize();
              }
            });
          });
        }
      });
    });
  },
  methods: {
    // 获取站点的所有能源类型
    getEnergyOptions_inSite() {
      if (!this.$store.state.site.siteId) {
        return;
      }
      this.$http
        .get("equipment/energyBranch/getAllType", {
          params: {
            siteId: this.$store.state.site.siteId,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.energyTypeOptions = res.data.data;
            if (this.energyTypeOptions.length > 0) {
              this.energyType = this.energyTypeOptions[0].id;
            } else {
              // 初始化值
              this.dataObj = formatEnergyData(this.time, "day", []);
              this.dataObj.areaStyle = true;
            }
          }
        });
    },
    // 渲染部门各数据表格
    renderDepartment() {
      this.charts.forEach((item) => {
        if (item) {
          item.clear();
        }
      });
      this.getHuanbiByDepartment();
      this.getEnergyRank();
      this.getAmplification();
      this.getTop5ByDepartment();
      this.getTrendByDepartment();
    },
    //  格式化时间
    getTb(time) {
      // let time = new Date(this.selectTime);
      if (this.timeType == "y") {
        return "year_" + time.getFullYear();
      } else if (this.timeType == "m") {
        return (
          "month_" +
          time.getFullYear() +
          (time.getMonth() < 9
            ? "0" + (time.getMonth() + 1)
            : time.getMonth() + 1)
        );
      } else if (this.timeType == "d") {
        return (
          "day_" +
          time.getFullYear() +
          (time.getMonth() < 9
            ? "0" + (time.getMonth() + 1)
            : time.getMonth() + 1) +
          (time.getDate() < 10 ? "0" + time.getDate() : time.getDate())
        );
      }
    },
    //获取部门用电占比数据
    getEnergyRank() {
      this.$http
        .get("equipment/energyDepartment/energyRankByDepartment", {
          params: {
            energyType: this.energyType,
            site: this.watchSiteChange,
            tb: this.getTb(new Date(this.selectTime)),
            type: this.timeType,
          },
        })
        .then((res) => {
          let legendData = [];
          let series = [];
          if (res.data.code == 0) {
            if (res.data.data) {
              res.data.data.forEach((item) => {
                legendData.push(item.department);
                series.push({ value: item.value, name: item.department });
              });
            }
          }
          this.renderRatioCharts(series, legendData);
        });
    },
    // 渲染占比图
    renderRatioCharts(series, legendData) {
      this.$nextTick(() => {
        let myChart = echarts.init(this.$refs.ratioCharts);
        let total = 0;
        let color = [];
        series.forEach((item) => {
          total += item.value;
          color.push(rgb());
        });
        let option = {
          color: color,
          tooltip: {
            trigger: "item",
            formatter: "{a} <br/>{b}: {c} ({d}%)",
          },
          legend: {
            type: "scroll",
            orient: "horizontal",
            left: "center",
            bottom: 0,
            textStyle: {
              color: "#666",
            },
            data: legendData,
          },
          series: [
            {
              name: "",
              type: "pie",
              radius: ["50%", "70%"],
              avoidLabelOverlap: false,
              label: {
                show: true,
                position: "center",
                formatter: total + "\nkWh",
                fontSize: "18",
                fontWeight: "bold",
                color: "#666",
              },
              emphasis: {
                label: {
                  show: false,
                  fontSize: "30",
                  fontWeight: "bold",
                  formatter: " {c} ",
                },
              },
              labelLine: {
                show: false,
              },
              data: series,
            },
          ],
        };
        myChart.setOption(option);
        if (this.charts.indexOf(myChart) < 0) {
          this.charts.push(myChart);
        }
      });
    },
    //获取部门用电环比数据
    getHuanbiByDepartment() {
      this.$http
        .get("equipment/energyDepartment/huanbiByDepartment", {
          params: {
            energyType: this.energyType,
            site: this.watchSiteChange,
            tb: this.getTb(new Date(this.selectTime)),
            type: this.timeType,
          },
        })
        .then((res) => {
          let legendData = [];
          let series = {};
          series.now = [];
          series.last = [];
          if (res.data.code == 0) {
            if (res.data.data) {
              res.data.data.forEach((item) => {
                legendData.push(item.department);
                series.now.push(item.value1);
                series.last.push(item.value2);
              });
            }
          }
          this.renderCircleCharts(series, legendData);
        });
    },
    // 渲染环比图
    renderCircleCharts(series, legendData) {
      var _this = this;
      this.$nextTick(() => {
        let myChart = echarts.init(this.$refs.circleCharts);
        let option = {
          color: ["#5FBFD2", "#DFCC3A"],
          title: {
            text: "",
            subtext: "",
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
          },
          legend: {
            data: ["本期", "上期"],
            left: "center",
            bottom: 0,
            textStyle: {
              color: "#666",
            },
          },
          grid: {
            top: 20,
            left: 10,
            right: 30,
            bottom: 25,
            containLabel: true,
            borderColor: "#ccc",
          },
          xAxis: {
            type: "value",
            boundaryGap: [0, 0.01],

            axisLine: {
              lineStyle: {
                type: "solid",
                color: "#666", //左边线的颜色
                width: "2", //坐标线的宽度
              },
            },
          },
          yAxis: {
            type: "category",
            data: legendData,
            axisLine: {
              lineStyle: {
                type: "solid",
                color: "#666", //左边线的颜色
                width: "2", //坐标线的宽度
              },
            },
            axisLabel: {
              show: true,
              interval: 0, //强制所有标签显示
              formatter: function (params) {
                //标签输出形式 ---请开始你的表演
                var newstr = params;
                if (newstr.length > 3) return newstr.substring(0, 3) + "...";
                else return "\n" + newstr;
              },
            },
            triggerEvent: true,
          },
          series: [
            {
              name: "本期",
              type: "bar",
              data: series.now,
            },
            {
              name: "上期",
              type: "bar",
              data: series.last,
            },
          ],

          textStyle: {
            color: "#666",
          },
        };
        myChart.setOption(option);
        if (this.charts.indexOf(myChart) < 0) {
          this.charts.push(myChart);
        }
        myChart.on("mouseover", function (params) {
          //鼠标经过图表时候判断参数  ---请开始你的表演
          if (params.componentType == "yAxis") {
            _this.tips = params.value;
            _this.tipsLeft = params.event.event.clientX + 10;
            _this.tipsTop = params.event.event.clientY + 10;
            _this.tipsShow = true;
            _this.$forceUpdate();
          }
        });
        myChart.on("mouseout", function (params) {
          _this.tips = "";
          _this.tipsLeft = 0;
          _this.tipsTop = 0;
          _this.tipsShow = false;
        });
      });
    },
    //获取部门增幅前五名数据
    getAmplification() {
      this.$http
        .get("equipment/energyDepartment/amplificationByDepartment", {
          params: {
            energyType: this.energyType,
            site: this.watchSiteChange,
            tb: this.getTb(new Date(this.selectTime)),
            type: this.timeType,
          },
        })
        .then((res) => {
          let legendData = [];
          let series = [];
          if (res.data.code == 0) {
            if (res.data.data) {
              res.data.data.forEach((item) => {
                legendData.push(item.department);
                series.push(item.amplification);
              });
            }
          }
          this.renderAmplificationCharts(series, legendData);
        });
    },

    // 渲染增幅图
    renderAmplificationCharts(series, xAxisData) {
      var _this = this;
      var labelRight = {
        position: "right",
      };
      this.$nextTick(() => {
        let myChart = echarts.init(this.$refs.amplificationCharts);
        let option = {
          title: {
            text: "",
            subtext: "",
            sublink: "",
          },
          //可计算特性
          calculable: true,
          color: ["#5FBFD2", "#DFCC3A"],
          tooltip: {
            trigger: "axis",
            axisPointer: {
              // 坐标轴指示器，坐标轴触发有效
              type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
            },
          },
          grid: {
            top: 20,
            left: 10,
            right: 30,
            bottom: 25,
            containLabel: true,
            borderColor: "#ccc",
          },
          xAxis: {
            type: "value",
            position: "top",

            splitLine: {
              lineStyle: {
                type: "dashed",
              },
            },
            axisLabel: {
              formatter: "{value}%",
            },
            axisLine: {
              lineStyle: {
                type: "solid",
                color: "#666", //左边线的颜色
                width: "2", //坐标线的宽度
              },
            },
          },
          yAxis: {
            type: "category",
            axisLine: { show: false },
            axisLabel: {
              show: true,
              interval: 0, //强制所有标签显示
              formatter: function (params) {
                //标签输出形式 ---请开始你的表演
                var newstr = params;
                if (newstr.length > 3) return newstr.substring(0, 3) + "...";
                else return "\n" + newstr;
              },
            },
            triggerEvent: true,
            axisTick: { show: false },
            splitLine: { show: false },
            position: "left",
            data: xAxisData,
            axisLine: {
              lineStyle: {
                type: "solid",
                color: "#666", //左边线的颜色
                width: "2", //坐标线的宽度
              },
            },
          },
          series: [
            {
              name: "",
              type: "bar",
              stack: "总量",
              label: {
                show: true,
                formatter: "{c}%",
                position: "insideRight",
              },
              data: series,
            },
          ],
        };
        myChart.setOption(option);
        if (this.charts.indexOf(myChart) < 0) {
          this.charts.push(myChart);
        }
        myChart.on("mouseover", function (params) {
          //鼠标经过图表时候判断参数  ---请开始你的表演
          if (params.componentType == "yAxis") {
            _this.tips = params.value;
            _this.tipsLeft = params.event.event.clientX + 10;
            _this.tipsTop = params.event.event.clientY + 10;
            _this.tipsShow = true;
          }
        });
        myChart.on("mouseout", function (params) {
          _this.tips = "";
          _this.tipsLeft = 0;
          _this.tipsTop = 0;
          _this.tipsShow = false;
        });
      });
    },
    //获取部门前五名数据
    getTop5ByDepartment() {
      this.$http
        .get("equipment/energyDepartment/top5ByDepartment", {
          params: {
            energyType: this.energyType,
            site: this.watchSiteChange,
            tb: this.getTb(new Date(this.selectTime)),
            type: this.timeType,
          },
        })
        .then((res) => {
          let legendData = [];
          let series = [];
          if (res.data.code == 0) {
            if (res.data.data) {
              res.data.data.forEach((item) => {
                legendData.push(item.department);
                series.push(item.value1);
              });
            }
          }
          this.renderSortCharts(series, legendData);
        });
    },
    // 渲染前五名图
    renderSortCharts(series, xAxisData) {
      let _this = this;
      this.$nextTick(() => {
        let myChart = echarts.init(this.$refs.sortCharts);
        let option = {
          color: ["#5FBFD2"],
          title: {
            text: "",
            subtext: "",
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
          },
          yAxis: {
            type: "value",
            boundaryGap: [0, 0.01],
            name: "kwh",
            axisLine: {
              lineStyle: {
                type: "solid",
                color: "#666", //左边线的颜色
                width: "2", //坐标线的宽度
              },
            },
          },
          xAxis: {
            type: "category",
            data: xAxisData,
            axisLine: {
              lineStyle: {
                type: "solid",
                color: "#666", //左边线的颜色
                width: "2", //坐标线的宽度
              },
            },
            axisLabel: {
              show: true,
              interval: 0, //强制所有标签显示
              formatter: function (params) {
                //标签输出形式 ---请开始你的表演
                var newstr = params;
                if (newstr.length > 3) return newstr.substring(0, 3) + "...";
                else return "\n" + newstr;
              },
            },
            triggerEvent: true,
          },
          series: [
            {
              name: "",
              type: "bar",
              data: series,
            },
          ],

          textStyle: {
            color: "#666",
          },
        };
        myChart.setOption(option);
        if (this.charts.indexOf(myChart) < 0) {
          this.charts.push(myChart);
        }
        myChart.on("mouseover", function (params) {
          //鼠标经过图表时候判断参数  ---请开始你的表演
          if (params.componentType == "xAxis") {
            _this.tips = params.value;
            _this.tipsLeft = params.event.event.clientX + 10;
            _this.tipsTop = params.event.event.clientY + 10;
            _this.tipsShow = true;
          }
        });
        myChart.on("mouseout", function (params) {
          _this.tips = "";
          _this.tipsLeft = 0;
          _this.tipsTop = 0;
          _this.tipsShow = false;
        });
      });
    },
    // 获取部门趋势图数据
    getTrendByDepartment() {
      this.$http
        .get("equipment/energyDepartment/trendByDepartment", {
          params: {
            energyType: this.energyType,
            site: this.watchSiteChange,
            tb: this.getTb(new Date(this.selectTime)),
            type: this.timeType,
          },
        })
        .then((res) => {
          let legendData = [];
          let series = [];
          if (res.data.code == 0) {
            if (res.data.data) {
              res.data.data.forEach((item) => {
                legendData.push(item.department);
                series.push({
                  name: item.department,
                  type: "bar",
                  data: item.values,
                  barGap: "-100%",
                });
              });
            }
          }
          this.renderTrendencyCharts(series, legendData);
        });
    },
    // 渲染趋势图
    renderTrendencyCharts(series, legendData) {
      this.$nextTick(() => {
        let xData = [];
        let time = new Date(this.selectTime);
        let nowTime = new Date();
        let year = time.getFullYear();
        let month = time.getMonth();
        let day = time.getDate();
        let nowYear = nowTime.getFullYear();
        let nowMonth = nowTime.getMonth();
        let nowDay = nowTime.getDate();
        let hour = new Date().getHours();
        if (this.timeType == "y") {
          xData = [];
          if (
            this.getTb(time).split("_")[1] < this.getTb(nowTime).split("_")[1]
          ) {
            month = 11;
          } else {
            month = nowMonth;
          }
          for (let i = 1; i <= month + 1; i++) {
            xData.push(i < 10 ? "0" + i + "月" : i + "月");
          }
        } else if (this.timeType == "m") {
          xData = [];
          if (
            this.getTb(time).split("_")[1] < this.getTb(nowTime).split("_")[1]
          ) {
            day = new Date(year, month + 1, 0).getDate();
          } else {
            day = nowDay;
          }
          for (let i = 1; i <= day; i++) {
            xData.push(i < 10 ? "0" + i + "日" : i + "日");
          }
        } else if (this.timeType == "d") {
          xData = [];
          if (
            this.getTb(time).split("_")[1] < this.getTb(nowTime).split("_")[1]
          ) {
            hour = 24;
          }
          for (let i = 0; i < hour; i++) {
            xData.push(i < 10 ? "0" + i + "时" : i + "时");
          }
        }
        let color = [];
        legendData.forEach((item) => {
          // item.color = rgb();
          color.push(rgb());
        });
        let myChart = echarts.init(this.$refs.tendencyCharts);
        let option = {
          color: color,
          title: {
            text: xData.length ? "" : "暂无数据",
            x: "center",
            y: "center",
            textStyle: {
              color: "#666",
              fontWeight: "normal",
              fontSize: 16,
            },
          },
          legend: {
            type: "scroll",
            orient: "horizontal",
            left: "center",
            bottom: 0,
            textStyle: {
              color: "#666",
            },
            data: legendData,
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
          },
          yAxis: {
            type: "value",
            boundaryGap: [0, 0.01],
            name: "kwh",
            axisLine: {
              lineStyle: {
                type: "solid",
                color: "#666", //左边线的颜色
                width: "2", //坐标线的宽度
              },
            },
          },
          xAxis: {
            type: "category",
            data: xData,
            axisLine: {
              lineStyle: {
                type: "solid",
                color: "#666", //左边线的颜色
                width: "2", //坐标线的宽度
              },
            },
          },
          series: series,

          textStyle: {
            color: "#666",
          },
        };
        myChart.setOption(option);
        if (this.charts.indexOf(myChart) < 0) {
          this.charts.push(myChart);
        }
      });
    },
    // 获取站点下的所有能源部门或能源分支
    getSelectList() {
      // 清空当前数据，防止重复影响数据监听
      this.branch = null;
      this.selectArr = [];
      if (!this.energyType) {
        return;
      }
      if (this.type === "department") {
      } else {
        this.$http
          .get("equipment/energyBranch/getAllBranch", {
            params: {
              siteId: this.$store.state.site.siteId,
              energyType: this.energyType,
            },
          })
          .then((res) => {
            if (res.data.code === 0) {
              this.selectArr = res.data.data;
              if (this.selectArr.length > 0) {
                this.branch = this.selectArr[0];
              }
            }
          });
      }
    },
    getMonthEnergy() {
      let year = this.time.getFullYear();
      let month =
        this.time.getMonth() + 1 < 10
          ? "0" + (this.time.getMonth() + 1)
          : this.time.getMonth() + 1;

      if (!this.branch) {
        this.monthEnergy = null;
        return;
      }
      this.$http
        .get("equipment/energyBranch/totalBranchEnergy", {
          params: {
            branch: this.branch,
            type: "month",
            tb: "month_" + year + month,
            property: this.energyType,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.monthEnergy = res.data.data;
          }
        });
    },
    getDayEnergy() {
      let year = this.time.getFullYear();
      let month =
        this.time.getMonth() + 1 < 10
          ? "0" + (this.time.getMonth() + 1)
          : this.time.getMonth() + 1;
      let day =
        this.time.getDate() < 10
          ? "0" + this.time.getDate()
          : this.time.getDate();
      if (!this.branch) {
        this.dayEnergy = null;
        return;
      }
      this.$http
        .get("equipment/energyBranch/totalBranchEnergy", {
          params: {
            branch: this.branch,
            type: "day",
            tb: "day_" + year + month + day,
            // tb: 'day_20200304',
            property: this.energyType,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.dayEnergy = res.data.data;
          }
        });
    },
    getReportValue() {
      // if(!this.branch){
      //   return
      // }
      let obj = {};
      if (this.timeSelect == "day") {
        let year = this.time.getFullYear();
        let month =
          this.time.getMonth() + 1 < 10
            ? "0" + (this.time.getMonth() + 1)
            : this.time.getMonth() + 1;
        let day =
          this.time.getDate() < 10
            ? "0" + this.time.getDate()
            : this.time.getDate();
        obj = {
          branch: this.branch,
          type: this.timeSelect,
          tb: "day_" + year + month + day,
          // tb: 'day_20200304'
        };
      } else if (this.timeSelect == "month") {
        let year = this.time.getFullYear();
        let month =
          this.time.getMonth() + 1 < 10
            ? "0" + (this.time.getMonth() + 1)
            : this.time.getMonth() + 1;
        obj = {
          branch: this.branch,
          type: this.timeSelect,
          tb: "month_" + year + month,
        };
      } else {
        let year = this.time.getFullYear();
        obj = {
          branch: this.branch,
          type: this.timeSelect,
          tb: "year_" + year,
        };
      }
      obj.property = this.energyType;
      if (!this.branch) {
        this.tableData = formatEnergyData(this.time, this.timeSelect, []).arr;
        this.getHistoryValue();
        return;
      }
      this.$http
        .get("equipment/energyBranch/branchDataByDate", {
          params: obj,
        })
        .then((res) => {
          if (res.data.code == 0) {
            if (this.timeSelect == "day") {
              this.dataObj = formatEnergyData(
                this.time,
                "day",
                res.data.data.data
              );
              this.dataObj.areaStyle = true;
              this.tableData = this.dataObj.arr;
            } else if (this.timeSelect == "month") {
              this.tableData = formatEnergyData(
                this.time,
                "month",
                res.data.data.data
              ).arr;
            } else {
              this.tableData = formatEnergyData(
                this.time,
                "year",
                res.data.data.data
              ).arr;
            }
            this.getHistoryValue();
          }
        });
    },
    getHistoryValue() {
      let obj = {};
      if (this.timeSelect == "day") {
        // var day1 = this.time
        // 前24小时的时间撮
        var day1 = new Date();
        day1.setTime(day1.getTime() - 24 * 60 * 60 * 1000);
        let day = day1.getDate() < 10 ? "0" + day1.getDate() : day1.getDate();
        let month =
          day1.getMonth() < 9
            ? "0" + (day1.getMonth() + 1)
            : day1.getMonth() + 1;
        let year = day1.getFullYear();
        obj = {
          branch: this.branch,
          type: "day",
          tb: "day_" + year + month + day,
          // tb: 'day_20200303'
        };
      } else if (this.timeSelect == "month") {
        let month = this.time.getMonth();
        let year;
        if (month == 0) {
          month = 12;
          year = this.time.getFullYear() - 1;
        } else {
          month = month < 10 ? "0" + month : month;
          year = this.time.getFullYear();
        }
        obj = {
          branch: this.branch,
          type: "month",
          tb: "month_" + year + month,
        };
      } else {
        let year = this.time.getFullYear() - 1;
        obj = {
          branch: this.branch,
          type: "year",
          tb: "year_" + year,
        };
      }
      obj.property = this.energyType;
      if (!this.branch) {
        this.historyData = formatEnergyData(this.time, this.timeSelect, []).arr;
        this.obj = {
          series: [
            {
              data: this.tableData,
            },
            {
              data: this.historyData,
            },
          ],
          xNum: this.xNum,
        };
        return;
      }
      // return
      this.$http
        .get("equipment/energyBranch/branchDataByDate", {
          params: obj,
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.historyData = formatEnergyData(
              this.time,
              this.timeSelect,
              res.data.data.data
            ).arr;
            this.obj = {
              series: [
                {
                  data: this.tableData,
                },
                {
                  data: this.historyData,
                },
              ],
              xNum: this.xNum,
            };
            // let obj = {};
            // obj.name =
            //   this.timeSelect === "day"
            //     ? ["今日", "昨日"]
            //     : this.timeSelect === "month"
            //     ? ["本月", "上月"]
            //     : ["今年", "去年"];
            // obj.series = [];
            // obj.series[0] = this.dataObj.arr;
            // obj.series[1] = this.historyData;
            // obj.tableHead = this.dataObj.arrX;
            // // this.table_data = obj;
            // this.table_data = {
            //   name: [1, 2],
            //   series: {
            //     data: [1, 3, 4]
            //   },
            //   tableHead: [1, 2, 3]
            // };
          }
        });
    },
  },
  created() {
    this.timeSelect = "day";
    this.getEnergyOptions_inSite();
    this.getReportValue();
    this.getHistoryValue();
  },
};
</script>

<style lang="less" scoped>
@import "../../assets/css/index.less";

.energy-statistics {
  height: 100%;
  .layout-scroll {
    height: calc(100% - 62px);
    overflow: auto;
    .statistics-layout {
      min-height: 500px;
      height: 100%;
      width: 100%;
      display: -webkit-flex;
      /* 左边 */
      .statistics-left {
        width: 300px;
        height: 100%;
        overflow: hidden;
        // 标题背景色--公用
        .left-title {
          height: 30px;
          background-color: @board-title;
          display: -webkit-flex;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          border-bottom: 1px solid #ccc;
        }
        /* 边角下边距 */
        .radiu-margin {
          border-radius: 6px;
          box-sizing: border-box;
          margin: 1px;
        }
        & > .select {
          height: auto;
          padding-bottom: 10px;
          background-color: @table-bgc;
          margin-bottom: 10px;
          box-shadow: 0 0 4px #cac6c6;
          .filter {
            color: @whiteBox-font-color;
            .left-title {
              margin-bottom: 10px;
              span {
                color: white;
                padding-left: 10px;
              }
            }
            .label {
              margin-left: 15px;
              span {
                display: inline-block;
                width: 48px;
              }
              .el-select {
                margin-left: 6px;
              }
            }
            /* 用能报表的日月年组件往内缩进6px */
            & /deep/ .el-radio-group,
            /deep/ .el-date-editor {
              padding-left: 6px;
            }
            /deep/ .el-input--mini .el-input__icon {
              line-height: 36px;
            }
          }
        }
        // 本月用电
        .total-statistics {
          // height: 35%;
          background-color: @table-bgc;
          margin-bottom: 10px;
          box-shadow: 0 0 4px #cac6c6;
        }
        // 今日用电
        .top-statistics {
          // height: calc(65% - 204px);
          background-color: @table-bgc;
          margin-bottom: none;
          box-shadow: 0 0 4px #cac6c6;
        }
      }
      .statistics-right {
        flex: 1;
        height: 100%;
        overflow: hidden;
        width: 60%;
        box-shadow: 0px 13px 8px -15px #cac6c6;
        .left-title {
          height: 30px;
          background-color: @board-title;
          display: -webkit-flex;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          border-bottom: 1px solid #ccc;
        }
        /* 边角下边距 */
        .radiu-margin {
          border-radius: 6px;
          box-sizing: border-box;
          margin: 1px;
        }
        // 曲线图
        .statistics-right-line {
          flex: 1;
          height: calc(50%);
          overflow: hidden;
          margin: 0.5px 0px 10px 12px;
          box-shadow: 0 0 4px #cac6c6;
          .line {
            height: calc(100%);
            background-color: @table-bgc;
            box-shadow: 0 0 4px #cac6c6;
            .left-title {
              span {
                color: white;
                padding-left: 10px;
              }
            }
          }
        }
        .full_box {
          width: auto;
          flex: 1;
          height: calc(50%);
          overflow: hidden;
          .half_box {
            float: left;
          }
        }
        .half_box {
          width: calc(50% - 14px) !important;
          height: calc(100% - 4px) !important;
        }
        // 柱状图
        .statistics-right-report {
          height: calc(50% - 12px);
          overflow: hidden;
          border-radius: 6px;
          margin: 0.5px 0px 0px 12px;
          box-shadow: 0 0 4px #cac6c6;
          .report {
            height: calc(100%);
            margin-bottom: none;
            background-color: @table-bgc;
            box-shadow: 0 0 4px #cac6c6;
            .left-title {
              margin-bottom: 10px;
              span {
                color: white;
                padding-left: 10px;
              }
            }
            .echarts_con {
              height: calc(100% - 41px) !important;
            }
            .selectDiv {
              margin-left: 8px;
            }
            .pole {
              height: calc(100% - 69px);
            }
          }
        }
      }
    }
  }
  .chartsBox {
    height: 100%;
    width: 100%;
    background: @table-bgc;
    .echarts_con {
      width: 100%;
      height: calc(100% - 31px);
    }
  }
}
</style>