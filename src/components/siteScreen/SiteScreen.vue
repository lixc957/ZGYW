<template>
  <div class="data-view">
    <div class="site-screen" :style="scaleFun">
      <div id="header">
        <dv-border-box-7
          style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
          :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
        >
          <dv-decoration-8 class="header-left-decoration" />
          <dv-decoration-5 dur="8" class="header-center-decoration" />
          <div class="header-right-decoration">
            <dv-decoration-8 class :reverse="true" />
            <h3>电力二期，{{time}}</h3>
          </div>
          <h1 class="center-title">忠信世纪实时监测系统</h1>
        </dv-border-box-7>
      </div>
      <!-- 内容 -->
      <div id="content">
        <div class="top">
          <div class="sin">
            <dv-border-box-7
              style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
              :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
            >
              <div class="sin-layout">
                <div>网关在线数量</div>
                <div>{{siteInfo.gatewayOnlineNum}}</div>
              </div>
            </dv-border-box-7>
          </div>
          <div class="sin">
            <dv-border-box-7
              style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
              :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
            >
              <div class="sin-layout">
                <div>当前在线电表</div>
                <div>{{siteInfo.equipmentOnlineNum}}</div>
              </div>
            </dv-border-box-7>
          </div>
          <div class="sin">
            <dv-border-box-7
              style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
              :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
            >
              <div class="sin-layout">
                <div>当前离线电表</div>
                <div>{{siteInfo.equipmentOfflineNum}}</div>
              </div>
            </dv-border-box-7>
          </div>
          <div class="sin">
            <dv-border-box-7
              style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
              :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
            >
              <div class="sin-layout">
                <div>今天告警数</div>
                <div>{{siteInfo.alarmNum}}</div>
              </div>
            </dv-border-box-7>
          </div>
        </div>
        <div class="center">
          <div class="c-l">
            <!-- 今日告警事件 -->
            <div class="c-l-warn">
              <dv-border-box-7
                style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
              >
                <!-- <div class="inner"> -->
                <h4>今日告警事件</h4>
                <dv-scroll-board style="height:calc(100% - 3rem);color:#ccc;" :config="siteWarnList" />
                <!-- </div> -->
              </dv-border-box-7>
            </div>
          </div>
          <div class="c-r">
            <!-- 温度监控 -->
            <div class="c-r-tem">
              <dv-border-box-7
                style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
              >
                <h4>实时温度监控</h4>
                <dv-scroll-board style="height:calc(100% - 3rem);color:#ccc;" :config="siteTemMonitor" />
              </dv-border-box-7>
            </div>
            <div class="c-r-center">
              <div class="sin">
                <dv-border-box-7
                  style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                  :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
                >
                  <h4>今日总用电-{{todayEle[0]&&todayEle[0].equipmentName||''}}</h4>
                  <div class="numBox">
                    <div class="text">
                      <span>{{todayEle[0]&&todayEle[0].value||'-'}}</span>
                      <span class="unit">kWh</span>
                    </div>
                  </div>
                </dv-border-box-7>
              </div>
              <div class="sin">
                <dv-border-box-7
                  style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                  :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
                >
                  <h4>今日总用电-{{todayEle[1]&&todayEle[1].equipmentName||''}}</h4>
                  <div class="numBox">
                    <div class="text">
                      <span>{{todayEle[1]&&todayEle[1].value||'-'}}</span>
                      <span class="unit">kWh</span>
                    </div>
                  </div>
                </dv-border-box-7>
              </div>
            </div>
            <div class="c-r-right">
              <div class="sin">
                <dv-border-box-7
                  style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                  :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
                >
                  <h4>今日总用电-{{todayEle[2]&&todayEle[2].equipmentName||''}}</h4>
                  <div class="numBox">
                    <div class="text">
                      <span>{{todayEle[2]&&todayEle[2].value||'-'}}</span>
                      <span class="unit">kWh</span>
                    </div>
                  </div>
                </dv-border-box-7>
              </div>
              <div class="sin">
                <dv-border-box-7
                  style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                  :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
                >
                  <h4>今日总用电-{{todayEle[3]&&todayEle[3].equipmentName||''}}</h4>
                  <div class="numBox">
                    <div class="text">
                      <span>{{todayEle[3]&&todayEle[3].value||'-'}}</span>
                      <span class="unit">kWh</span>
                    </div>
                  </div>
                </dv-border-box-7>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="b-l">
            <div class="c-l-energy">
              <dv-border-box-7
                style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
              >
                <h4>今日能耗</h4>
                <div class="bar">
                  <gradientBar :dataAxis="todayEnergyName" :data="todayEnergyValue"></gradientBar>
                </div>
              </dv-border-box-7>
            </div>
            <div class="b-l-b">
              <div class="b-l-l">
                <div class="b-l-l-l">
                  <div class="b-top">
                    <dv-border-box-7
                      style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                      :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
                    >
                      <h4>{{triphaseUnbalance[0]&&triphaseUnbalance[0].equipmentName}}三相不平衡-电压</h4>
                      <div class="numBox">
                        <div class="text">
                          <span>{{triphaseUnbalance[0]&&triphaseUnbalance[0].voltageUnbalance||'-'}}</span>
                          <span class="unit">kV</span>
                        </div>
                      </div>
                    </dv-border-box-7>
                  </div>
                  <div class="b-bottom">
                    <dv-border-box-7
                      style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                      :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
                    >
                      <h4>{{triphaseUnbalance[1]&&triphaseUnbalance[1].equipmentName}}三相不平衡-电压</h4>
                      <div class="numBox">
                        <div class="text">
                          <span>{{triphaseUnbalance[1]&&triphaseUnbalance[1].voltageUnbalance||'-'}}</span>
                          <span class="unit">kV</span>
                        </div>
                      </div>
                    </dv-border-box-7>
                  </div>
                </div>
                <div class="b-l-l-r">
                  <div class="b-top">
                    <dv-border-box-7
                      style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                      :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
                    >
                      <h4>{{triphaseUnbalance[0]&&triphaseUnbalance[0].equipmentName}}三相不平衡-电流</h4>
                      <div class="numBox">
                        <div class="text">
                          <span>{{triphaseUnbalance[0]&&triphaseUnbalance[0].currentUnbalance||'-'}}</span>
                          <span class="unit"></span>
                        </div>
                      </div>
                    </dv-border-box-7>
                  </div>
                  <div class="b-bottom">
                    <dv-border-box-7
                      style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                      :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
                    >
                      <h4>{{triphaseUnbalance[1]&&triphaseUnbalance[1].equipmentName}}三相不平衡-电流</h4>
                      <div class="numBox">
                        <div class="text">
                          <span>{{triphaseUnbalance[1]&&triphaseUnbalance[1].currentUnbalance||'-'}}</span>
                          <span class="unit"></span>
                        </div>
                      </div>
                    </dv-border-box-7>
                  </div>
                </div>
              </div>
              <div class="b-l-r">
                <dv-border-box-7
                  style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                  :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
                >
                  <h4>{{percentageName}}-峰平谷电能占比</h4>
                  <pie
                    style="height:calc(100% - 3rem);"
                    :dataArr="electricEnergyPercentage"
                    :titleArr="percentageTitle"
                    :total="percentageTotal"
                  ></pie>
                </dv-border-box-7>
              </div>
            </div>
          </div>
          <div class="b-r">
            <div class="b-r-t">
              <dv-border-box-7
                style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
              >
                <h4>三相功率、合相功率</h4>
                <MyLine
                  :color="powerCurveColor"
                  :legendData="powerCurveName"
                  :xAxis="powerCurveX"
                  :values="powerCurveValue"
                  :title="powerCurveTitle"
                  style="height:calc(100% - 3rem);"
                ></MyLine>
              </dv-border-box-7>
            </div>
            <div class="b-r-b">
              <dv-border-box-7
                style="box-shadow: rgba(255, 165, 0, 0.3) 0px 0px 20px inset;"
                :color="['rgba(255, 165, 0,0.3)','rgb(255, 165, 0)']"
              >
                <h4>三相电压、电流</h4>
                <MyLine
                  :color="voltageAndCurrentCurveColor"
                  :legendData="voltageAndCurrentCurveName"
                  :xAxis="voltageAndCurrentCurveX"
                  :values="voltageAndCurrentCurveValue"
                  :title="voltageAndCurrentTitle"
                  style="height:calc(100% - 3rem);"
                ></MyLine>
              </dv-border-box-7>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gradientBar from "../subcomponents/platformSub/bar-gradient";
import pie from "../subcomponents/platformSub/pie";
import areaChart from "../subcomponents/platformSub/area";
import MyLine from "../subcomponents/platformSub/Line";
import { deepClone } from "../../utils";
export default {
  components: {
    gradientBar,
    pie,
    areaChart,
    MyLine,
  },
  data() {
    return {
      time: "", //当前时间字符串
      interval: null, //定时获取当前时间
      scale: 1, //屏幕缩放比例
      windowWidth: null, //当前屏幕宽度
      windowHeight: null, //当前屏幕高度
      // 站点告警列表
      siteWarnList: {
        header: ["时间", "设备", "类型", "事件"],
        waitTime: 3000,
        headerBGC: "rgba(100,100,100,0.4)",
        oddRowBGC: "rgba(65, 50, 138,0.4)",
        evenRowBGC: "rgba(57, 14, 65,0.4)",
        data: [
          // ["行1列3", "5", "行1列3", "5"],
          // ["行2列3", "60", "行1列3", "5"],
          // ["行3列3", "41", "行1列3", "5"],
          // ["行3列3", "35", "行1列3", "5"],
          // ["行3列3", "87", "行1列3", "5"],
          // ["行3列3", "412", "行1列3", "5ggggggdtgretwererwqqrewr"]
        ],
        index: true,
        columnWidth: [50, 200, 300, 100],
        align: ["center"],
      },
      // 温度监控列表
      siteTemMonitor: {
        header: ["设备", "温度变量类型", "温度值"],
        waitTime: 3000,
        rowNum: 11,
        headerBGC: "rgba(100,100,100,0.4)",
        oddRowBGC: "rgba(65, 50, 138,0.4)",
        color:"#ccc",
        evenRowBGC: "rgba(57, 14, 65,0.4)",
        data: [
          ["行1列3", "5", null],
          ["行2列3", "60", null],
          ["行3列3", "41", null],
          ["行3列3", "35", null],
          ["行3列3", "87", null],
          ["行3列3", "412", null],
        ],
        index: true,
        columnWidth: [50],
        align: ["center"],
      },
      siteInfo: {
        gatewayOnlineNum: 0,
        equipmentOnlineNum: 0,
        equipmentOfflineNum: 0,
        alarmNum: 0,
      },
      todayEle: [], //今日总用电
      todayEnergyName: [], //今日能耗
      todayEnergyValue: [], //今日能耗
      voltageAndCurrentCurveEquipmentName: "",
      voltageAndCurrentCurveName: [], //三相电压电流
      voltageAndCurrentCurveValue: [],
      voltageAndCurrentCurveX: [],
      voltageAndCurrentTitle: "",
      voltageAndCurrentCurveColor: [],
      powerCurveEquipmentName: "",
      powerCurveName: [], //三相功率合相功率
      powerCurveValue: [],
      powerCurveX: [],
      powerCurveTitle: "",
      powerCurveColor: [],
      electricEnergyPercentage: [], //峰平谷电能占比
      percentageTitle: [],
      percentageTotal:0,
      percentageName:"",
      triphaseUnbalance: [], //三相不平衡
    };
  },
  computed: {
    scaleFun() {
      return `transform: scale(${this.scale}); width: ${this.windowWidth}px; height: ${this.windowHeight}px`;
    },
  },
  watch: {},
  mounted() {
    window.addEventListener("resize", this.computedScale);
    this.getTimeStr();
    this.computedScale();
    this.getSiteInfo();
    this.getToDayWarn();
    this.getTempMonitor();
    this.getTodayEle();
    this.getTodayEnergy();
    this.getVoltageAndCurrentCurve();
    this.getPowerCurve();
    this.getElectricEnergyPercentage();
    this.getTriphaseUnbalance();
  },
  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
  methods: {
    // 获取时间返回实时时间
    getTimeStr() {
      if (this.interval) {
        clearInterval(this.interval);
      }
      this.interval = setInterval(() => {
        var date = new Date();
        var str = new Date(Date.parse(date) + 8 * 60 * 60 * 1000).toJSON();
        str = str.slice(0, 19);
        // console.log(str);
        var arr = str.split("T");
        this.time = arr.join(" ");
      }, 1000);
    },
    // 计算当前屏幕下的缩放比例
    computedScale() {
      var windowWidth = window.screen.width; //屏幕宽
      var pageWidth = document.getElementsByClassName("data-view")[0]
        .offsetWidth;
      this.scale = pageWidth / windowWidth;
    },
    // 网关、电表、告警查询
    getSiteInfo() {
      this.$http
        .get("equipment/largeScreen/ZhongXin2Qi/showSiteInfo", {
          params: {},
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.siteInfo = res.data.data;
          }
        });
    },
    // 获取今日告警事件
    getToDayWarn() {
      this.$http
        .get("equipment/largeScreen/ZhongXin2Qi/showTodayAlarmEvent", {
          params: {},
        })
        .then((res) => {
          let obj=deepClone(this.siteWarnList);
          if (res.data.code === 0) {
            let data = res.data.data;
            let result = [];
            data.forEach((element) => {
              result.push([
                element.time,
                element.equipmentName,
                element.alarmType,
                element.description,
              ]);
            });
            obj.data=result;
            this.siteWarnList=obj;
          }
        });
    },
    // 获取实时温度监控
    getTempMonitor() {
      this.$http
        .get("equipment/largeScreen/ZhongXin2Qi/showEquipmentTemp", {
          params: {},
        })
        .then((res) => {
          let obj = deepClone(this.siteTemMonitor);
          if (res.data.code === 0) {
            let data = res.data.data;
            let result = [];
            data.forEach((element) => {
              if (element.temps) {
                element.temps.forEach((child) => {
                  let item = [];
                  item.push(element.equipmentName);
                  item.push(child.TempType);
                  item.push(child.Value);
                  result.push(item);
                });
              }
            });
            obj.data = result;
            // 只能通过直接赋值方式才能更新到视图，文档说明
            this.siteTemMonitor = obj;
          }
        });
    },
    // 获取当前总用电
    getTodayEle() {
      this.$http
        .get("equipment/largeScreen/ZhongXin2Qi/showTodayElectricEnergy", {
          params: {},
        })
        .then((res) => {
          this.todayEle = [];
          if (res.data.code === 0) {
            this.todayEle = res.data.data;
          }
        });
    },
    //获取今日能耗
    getTodayEnergy() {
      this.$http
        .get("equipment/largeScreen/ZhongXin2Qi/showTodayEnergyConsumption", {
          params: {},
        })
        .then((res) => {
          this.todayEnergy = [];
          if (res.data.code === 0) {
            res.data.data.forEach((item) => {
              this.todayEnergyName.push(item.time);
              this.todayEnergyValue.push(item.value || 0);
            });
          }
        });
    },
    //获取三相电压电流
    getVoltageAndCurrentCurve() {
      this.$http
        .get("equipment/largeScreen/ZhongXin2Qi/showVoltageAndCurrentCurve", {
          params: {},
        })
        .then((res) => {
          this.voltageAndCurrentCurveValue = [];
          this.voltageAndCurrentCurveName = [];
          this.voltageAndCurrentTitle = "";
          this.voltageAndCurrentCurveX = [];
          this.voltageAndCurrentCurveColor = [];
          if (res.data.code === 0) {
            let xAxis = [];
            this.voltageAndCurrentTitle = res.data.data.equipmentName;
            if (res.data.data.variableCurveDataVOS) {
              res.data.data.variableCurveDataVOS.forEach((item) => {
                this.voltageAndCurrentCurveName.push(item.variableName);
                this.voltageAndCurrentCurveColor.push(item.color);
                this.voltageAndCurrentCurveValue.push(item);
                xAxis = xAxis.concat(this.getObjectKeys(item.data));
              });
              this.voltageAndCurrentCurveX = [...new Set(xAxis)];
            }
          }
        });
    },
    //获取三相功率合相功率
    getPowerCurve() {
      this.$http
        .get("equipment/largeScreen/ZhongXin2Qi/showPowerCurve", {
          params: {},
        })
        .then((res) => {
          this.powerCurveValue = [];
          this.powerCurveName = [];
          this.powerCurveTitle = "";
          this.powerCurveX = [];
          this.powerCurveColor = [];
          if (res.data.code === 0) {
            let xAxis = [];
            this.powerCurveTitle = res.data.data.equipmentName;
            if (res.data.data.variableCurveDataVOS) {
              res.data.data.variableCurveDataVOS.forEach((item) => {
                this.powerCurveName.push(item.variableName);
                this.powerCurveColor.push(item.color);
                this.powerCurveValue.push(item);
                xAxis = xAxis.concat(this.getObjectKeys(item.data));
              });
              this.powerCurveX = [...new Set(xAxis)];
            }
          }
        });
    },
    //获取三相不平衡
    getTriphaseUnbalance() {
      this.$http
        .get("equipment/largeScreen/ZhongXin2Qi/showTriphaseUnbalance", {
          params: {},
        })
        .then((res) => {
          this.triphaseUnbalance = [];
          if (res.data.code === 0) {
            // this.triphaseUnbalance = res.data.data;
            this.triphaseUnbalance = [
              {
                currentUnbalance: 16.67,
                equipmentName: "ZG101",
                voltageUnbalance: 5.41,
              },
            ];
            console.log(this.triphaseUnbalance);
            this.$forceUpdate();
          }
        });
    },
    //获取峰平谷电能占比
    getElectricEnergyPercentage() {
      this.$http
        .get("equipment/largeScreen/ZhongXin2Qi/showElectricEnergyPercentage", {
          params: {},
        })
        .then((res) => {
          this.electricEnergyPercentage = [];
          this.percentageTitle = [];
          this.percentageName="";
          this.percentageTotal=0;
          if (res.data.code === 0) {
            this.percentageName=res.data.data.equipmentName;
            for (let key in res.data.data) {
              let name = "";
              switch (key) {
                case "totalQuantity":
                  name = "";
                  break;
                case "pingQuantity":
                  name = "平时用电量";
                  break;
                case "fengQuantity":
                  name = "峰时用电量";
                  break;
                case "guQuantity":
                  name = "谷时用电量";
                  break;
              }
              if(!name){
                continue;
              }
              this.percentageTitle.push(name);
              this.electricEnergyPercentage.push({
                name: name,
                value: res.data.data[key] || 0,
              });
            }
          }
        });
    },
    // 获取对象属性名集合
    getObjectKeys(arr) {
      var keys = [];
      arr.forEach((item) => {
        for (var property in item) keys.push(property);
      });
      return keys;
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../assets/css/index.less";
.data-view {
  width: 100%;
  height: 100%;
  background-color: black;
  color: #fff;
  box-sizing: border-box;
  .site-screen {
    width: 1920px;
    height: 1080px;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    transform-origin: left top;
    z-index: 999;
    padding: 10px;
    box-sizing: border-box;
    @dis-flex();
    @flex-c();
    // 头部
    #header {
      background: rgba(40, 13, 59, 0.5);
      width: 100%;
      height: 100px;
      padding-bottom: 10px;
      box-sizing: border-box;
      .dv-border-box-7 {
        & /deep/ .border-box-content {
          position: relative;
          @dis-flex();
          justify-content: space-between;
          .header-left-decoration {
            height: 60px;
            width: 25%;
          }
          .header-center-decoration {
            width: 40%;
            height: 60px;
            margin-top: 30px;
          }
          .header-right-decoration {
            height: 60px;
            width: 25%;
            position: relative;
            h3 {
              position: absolute;
              top: 45px;
              left: -16px;
            }
          }
          .center-title {
            position: absolute;
            font-size: 30px;
            font-weight: 700;
            left: 50%;
            top: 15px;
            transform: translateX(-50%);
          }
        }
      }
    }
    #content {
      @flex-1();
      @dis-flex();
      @flex-c();
      padding-bottom: 10px;
      box-sizing: border-box;
      overflow: hidden;
      .top {
        @flex-1();
        @dis-flex();
        .sin {
          @flex-1();
          margin-left: 10px;
          background: rgba(40, 13, 59, 0.5);
          .sin-layout {
            height: 100%;
            @dis-flex();
            display: -webkit-flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 10%;
            font-size: 24px;
          }
        }
        .sin:first-child {
          margin-left: 0;
        }
      }
      .center {
        flex: 4;
        margin-top: 10px;
        @dis-flex();
        .c-l {
          @flex-1();
          @dis-flex();
          @flex-c();
          margin-right: 10px;
          .c-l-warn {
            @flex-1();
          }
        }
        .c-r {
          @flex-1();
          @dis-flex();
          .c-r-tem {
            @flex-1();
            background: rgba(40, 13, 59, 0.5);
          }
          .c-r-center {
            @flex-1();
            margin: 0 10px;
            @dis-flex();
            @flex-c();
            .sin {
              @flex-1();
              background: rgba(40, 13, 59, 0.5);
              h4 {
                text-align: center;
              }
            }
            .sin:first-child {
              margin-bottom: 10px;
            }
          }
          .c-r-right {
            @flex-1();
            @dis-flex();
            @flex-c();
            .sin {
              @flex-1();
              background: rgba(40, 13, 59, 0.5);
              h4 {
                text-align: center;
              }
            }
            .sin:first-child {
              margin-bottom: 10px;
            }
          }
        }
      }
      .bottom {
        flex: 6;
        margin-top: 10px;
        @dis-flex();
        // 左下
        .b-l {
          @flex-1();
          @dis-flex();
          @flex-c();
          margin-right: 10px;
          .c-l-energy {
            @flex-1();
            background: rgba(40, 13, 59, 0.5);
            .dv-border-box-7 {
              box-sizing: border-box;
              & /deep/ .border-box-content {
                padding: 20px;
                box-sizing: border-box;
                @dis-flex();
                @flex-c();
                .bar {
                  @flex-1();
                }
              }
            }
          }
          .b-l-b {
            @flex-1();
            @dis-flex();
            margin-top:10px;
          }
          .b-l-l {
            @flex-1();
            margin-right: 10px;
            @dis-flex();
            .b-l-l-l {
              @flex-1();
              margin-right: 10px;
              @dis-flex();
              @flex-c();
              .b-top {
                @flex-1();
                margin-bottom: 10px;
                background: rgba(40, 13, 59, 0.5);
              }
              .b-bottom {
                @flex-1();
                background: rgba(40, 13, 59, 0.5);
              }
            }
            .b-l-l-r {
              @flex-1();
              @dis-flex();
              @flex-c();
              .b-top {
                @flex-1();
                margin-bottom: 10px;
                background: rgba(40, 13, 59, 0.5);
              }
              .b-bottom {
                @flex-1();
                background: rgba(40, 13, 59, 0.5);
              }
            }
          }
          .b-l-r {
            @flex-1();
            background: rgba(40, 13, 59, 0.5);
          }
        }
        .b-r {
          @flex-1();
          @dis-flex();
          @flex-c();
          .b-r-t {
            @flex-1();
            margin-bottom: 10px;
            background: rgba(40, 13, 59, 0.5);
          }
          .b-r-b {
            @flex-1();
            background: rgba(40, 13, 59, 0.5);
          }
        }
      }
    }
  }
  h4 {
    line-height: 3rem;
    padding-left: 10px;
  }
  .numBox {
    width: 100%;
    height: calc(100% - 3rem);
    font-size: 30px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    color: turquoise;
    font-weight: bold;
    .unit {
      font-size: 16px;
      color: #ccc;
    }
  }
}
</style>