<template>
  <div class="assess">
    <Mybreadcrumb level1="电能质量" level2="评估报告" />
    <div class="content">
      <div class="select whiteBox">
        <div class="equip">
          <span>设备：</span>
          <el-cascader
            v-model="equipId"
            :props="defaultProps"
            :options="group_equip_options"
            @change="equipChange"
            :key="isResouceShow"
            :disabled="volLoading || harLoading"
          ></el-cascader>
        </div>
        <div class="month">
          <span>报告月份：</span>
          <el-date-picker
            v-model="monthSelect"
            type="month"
            placeholder="选择月"
            :picker-options="pickerOptions_month"
            :clearable="Boolean(false)"
            @change="timeChange"
            :disabled="!Boolean(this.equipId.length) || volLoading || harLoading"
          ></el-date-picker>
        </div>
      </div>
      <div class="detail">
        <div class="d-top">
          <div
            class="t-left whiteBox"
            v-loading="volLoading"
            element-loading-background="rgba(67, 92, 112, 0.5)"
            element-loading-text="加载中..."
          >
            <div class="title titleBox">
              <strong>电压质量分析</strong>
              <!-- <span>监测点数：3896 / 标准电压：220V</span> -->
              <span>监测点数：{{voltageAnalysisArr[0].total || '-'}} / 标准电压：{{voltageAnalysisArr[0].nominal|| '-'}} V</span>
            </div>
            <div class="l-total">
              <div class="l-single" v-for="(item, index) in voltageAnalysisArr" :key="index">
                <div class="box-abs">
                  <div class="box-rel hasBacBox">
                    <span>{{item.name}}</span>
                  </div>
                </div>
                <div class="sin-layout">
                  <div class="single-val hasBacBox">
                    <div class="max-value">
                      <span>最大</span>
                      <span>值:</span>
                    </div>
                    <div class="val">
                      <span>{{item.max || '-'}}V</span>
                      <span>({{item.maxB || '-'}}%)</span>
                    </div>
                    <div
                      :class="{'val-status': true, 'status-warn': item.maxB > 10? true:item.maxB< -10 ? true:false,'status-nomal': item.maxB <= 10 && item.maxB>=-10, 'status-null': !item.averageB}"
                    >
                      <span>{{!item.maxB ? '无数据' : item.maxB > 10 ? '超限' : (-10 > item.maxB ? '超限':'未超限')}}</span>
                    </div>
                  </div>
                  <div class="single-val hasBacBox">
                    <div class="max-value">
                      <span>最小</span>
                      <span>值:</span>
                    </div>
                    <div class="val">
                      <span>{{item.min || '-'}}V</span>
                      <span>({{item.minB || '-'}}%)</span>
                    </div>
                    <div
                      :class="{'val-status': true, 'status-warn': item.minB > 10?true:item.minB < -10?true:false,'status-nomal': item.minB <= 10 && item.minB>=-10,  'status-null': !item.averageB}"
                    >
                      <span>{{!item.maxB ? '无数据' : item.minB > 10 ? '超限' : (-10 > item.minB ? '超限':'未超限')}}</span>
                    </div>
                  </div>
                  <div class="single-val hasBacBox">
                    <div class="max-value">
                      <span>平均</span>
                      <span>值:</span>
                    </div>
                    <div class="val">
                      <span>{{item.average || '-'}}V</span>
                      <span>({{item.averageB || '-'}}%)</span>
                    </div>
                    <div
                      :class="{'val-status': true, 'status-warn': item.averageB > 10?true:item.averageB<-10?true:false,'status-nomal': item.averageB <= 10&&item.averageB>=-10, 'status-null': !item.averageB}"
                    >
                      <span>{{!item.maxB ? '无数据' : item.averageB > 10 ? '超限' : (-10 > item.averageB ? '超限':'未超限')}}</span>
                    </div>
                  </div>
                  <div class="block-box">
                    <div class="single-box hasBacBox">
                      <p>超限次数</p>
                      <!-- <p v-if='item.overrun==null'>{{'-'}}</p>
                      <p v-if='item.overrun != null'>{{item.overrun}}</p>-->
                      <p>{{item.overrun==0?item.overrun : (item.overrun || '-')}}</p>
                    </div>
                    <div class="single-box hasBacBox">
                      <p>合格率</p>
                      <p>{{item.qualified || '-%'}}</p>
                    </div>
                  </div>

                  <div
                    :class="{'hasBacBox':true,warn: true, 'unqualified': item.result && item.result !== '合格', 'qualified': item.result === '合格', 'null-val': !item.result}"
                  >
                    <span>{{item.result || '无结论'}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 频率质量分析 -->
          <div
            class="t-right whiteBox"
            v-loading="freLoading"
            element-loading-background="rgba(67, 92, 112, 0.5)"
            element-loading-text="加载中..."
          >
            <div class="title titleBox">
              <div style="display: inline-block;">
                <strong>频率质量分析</strong>
              </div>
              <div class="data">
                <span>监测点数：{{frequencyObj.total}}{{frequencyObj.result ? '频率' : "-"}} / 标准频率：{{frequencyObj.nominal||'-'}} Hz</span>
              </div>
            </div>
            <div class="frequency">
              <div class="box-abs">
                <div class="box-rel hasBacBox">
                  <span>频率</span>
                </div>
              </div>
              <div class="sin-layout">
                <div class="single-val hasBacBox">
                  <div class="max-value">
                    <span>最大</span>
                    <span>值:</span>
                  </div>
                  <div class="val">
                    <span>{{frequencyObj.max || '-'}}Hz</span>
                    <!-- <span>({{frequencyObj.maxB || '-'}}%)</span> -->
                  </div>
                  <div
                    :class="{'val-status hasBacBox': true, 'status-warn': frequencyObj.max > nominalMax?true:(frequencyObj.max < nominalMin?true:false),'status-nomal': frequencyObj.max<=nominalMax&&frequencyObj.max>=nominalMin,'status-null': !frequencyObj.maxB}"
                  >
                    <span>{{!frequencyObj.maxB ? '无数据' : frequencyObj.max >nominalMax? '超限' : (nominalMin > frequencyObj.max?'超限':'未超限')}}</span>
                  </div>
                </div>
                <div class="single-val hasBacBox">
                  <div class="max-value">
                    <span>最小</span>
                    <span>值:</span>
                  </div>
                  <div class="val">
                    <span>{{frequencyObj.min || '-'}}Hz</span>
                    <!-- <span>({{frequencyObj.minB || '-'}}%)</span> -->
                  </div>
                  <div
                    :class="{'val-status hasBacBox': true, 'status-warn': frequencyObj.min >nominalMax?true:(frequencyObj.min <nominalMin?true:false),'status-nomal': frequencyObj.min <= nominalMax&&frequencyObj.min>=nominalMin,'status-null': !frequencyObj.minB}"
                  >
                    <span>{{!frequencyObj.minB ? '无数据' : frequencyObj.min >nominalMax? '超限' : (nominalMin > frequencyObj.min?'超限':'未超限')}}</span>
                  </div>
                </div>
                <div class="single-val hasBacBox">
                  <div class="max-value">
                    <span>平均</span>
                    <span>值:</span>
                  </div>
                  <div class="val">
                    <span>{{frequencyObj.average || '-'}}Hz</span>
                    <!-- <span>({{frequencyObj.averageB || '-'}}%)</span> -->
                  </div>
                  <div
                    :class="{'val-status hasBacBox': true, 'status-warn': frequencyObj.average>nominalMax?true:(frequencyObj.average <nominalMin?true:false),'status-nomal': frequencyObj.average<=nominalMax&&frequencyObj.average>=nominalMin,'status-null': !frequencyObj.averageB}"
                  >
                    <span>{{!frequencyObj.averageB ? '无数据' : frequencyObj.average >nominalMax? '超限' : (nominalMin> frequencyObj.average ? '超限' : '未超限')}}</span>
                  </div>
                </div>
                <div class="block-box">
                  <div class="single-box hasBacBox">
                    <p>超限次数</p>
                    <p>{{frequencyObj.overrun==0? frequencyObj.overrun:(frequencyObj.overrun || '-')}}</p>
                  </div>
                  <div class="single-box hasBacBox">
                    <p>合格率</p>
                    <p>{{frequencyObj.qualified || '-%'}}</p>
                  </div>
                </div>
                <div
                  :class="{'hasBacBox':true,warn: true, 'unqualified': frequencyObj.result && frequencyObj.result !== '合格', 'qualified': frequencyObj.result === '合格', 'null-val': !frequencyObj.result}"
                >
                  <span>{{frequencyObj.result || '无结论'}}</span>
                </div>
              </div>
              <!-- <div class="value">
                <div class="single-val">
                  <div class="max-value">
                    <span>最大</span>
                    <span>值:</span>
                  </div>
                  <div class="val">
                    <span>{{frequencyObj.max}}Hz</span>
                    <span>({{frequencyObj.maxB}}%)</span>
                  </div>
                  <div
                    :class="{'val-status': true, 'status-warn': frequencyObj.maxB > 7,'status-nomal': frequencyObj.maxB <= 7}"
                  >
                    <span>{{frequencyObj.maxB > 7 ? '超限' : '未超限'}}</span>
                  </div>
                </div>
                <div class="single-val">
                  <div class="max-value">
                    <span>最小</span>
                    <span>值:</span>
                  </div>
                  <div class="val">
                    <span>{{frequencyObj.min}}Hz</span>
                    <span>({{frequencyObj.minB}}%)</span>
                  </div>
                  <div
                    :class="{'val-status': true, 'status-warn': frequencyObj.minB > 7,'status-nomal': frequencyObj.minB <= 7}"
                  >
                    <span>{{frequencyObj.minB > 7 ? '超限' : '未超限'}}</span>
                  </div>
                </div>
                <div class="single-val">
                  <div class="max-value">
                    <span>平均</span>
                    <span>值:</span>
                  </div>
                  <div class="val">
                    <span>{{frequencyObj.average}}Hz</span>
                    <span>({{frequencyObj.averageB}}%)</span>
                  </div>
                  <div
                    :class="{'val-status': true, 'status-warn': frequencyObj.averageB > 7,'status-nomal': frequencyObj.averageB <= 7}"
                  >
                    <span>{{frequencyObj.averageB > 7 ? '超限' : '未超限'}}</span>
                  </div>
                </div>
              </div>
              <div class="block-box">
                <div class="single-box">
                  <p>超限次数</p>
                  <p>{{frequencyObj.overrun}}</p>
                </div>
                <div class="single-box">
                  <p>合格率</p>
                  <p>{{frequencyObj.qualified}}</p>
                </div>
              </div>
              <div
                :class="{warn: true, 'unqualified': frequencyObj.result !== '合格', 'qualified': frequencyObj.result === '合格'}"
              >
                <span>{{frequencyObj.result || '无结论'}}</span>
              </div>-->
            </div>
          </div>
        </div>
        <div class="d-bottom">
          <div
            class="b-left whiteBox"
            v-loading="harLoading"
            element-loading-background="rgba(67, 92, 112, 0.5)"
            element-loading-text="加载中..."
          >
            <div class="title titleBox">
              <strong>谐波质量分析</strong>
              <!-- <span>监测点数：3896 / 标准谐波：220V</span> -->
              <span>监测点数：{{harAnalysisArr[0].total || '-'}} / 标准谐波：{{harAnalysisArr[0].nominal || '-'}}%</span>
            </div>
            <div class="l-total">
              <div class="l-single" v-for="(item, index) in harAnalysisArr" :key="index">
                <div class="box-abs">
                  <div class="box-rel hasBacBox">
                    <span>{{item.name}}</span>
                  </div>
                </div>
                <div class="sin-layout">
                  <div class="single-val hasBacBox">
                    <div class="max-value">
                      <span>最大</span>
                      <span>值:</span>
                    </div>
                    <div class="val">
                      <span>{{item.max || '-'}}%</span>
                      <!-- <span>({{item.maxB || '-'}}%)</span> -->
                    </div>
                  </div>
                  <div class="single-val hasBacBox">
                    <div class="max-value">
                      <span>最小</span>
                      <span>值:</span>
                    </div>
                    <div class="val">
                      <span>{{item.min || '-'}}%</span>
                      <!-- <span>({{item.minB || '-'}}%)</span> -->
                    </div>
                  </div>
                  <div class="single-val hasBacBox">
                    <div class="max-value">
                      <span>平均</span>
                      <span>值:</span>
                    </div>
                    <div class="val">
                      <span>{{item.average || '-'}}%</span>
                      <!-- <span>({{item.averageB || '-'}}%)</span> -->
                    </div>
                  </div>
                  <div class="block-box">
                    <div class="single-box hasBacBox">
                      <p>超限次数</p>
                      <p>{{item.overrun==0?item.overrun : (item.overrun || '-')}}</p>
                    </div>
                    <div class="single-box hasBacBox">
                      <p>合格率</p>
                      <p>{{item.qualified || '-%'}}</p>
                    </div>
                  </div>

                  <div
                    :class="{'hasBacBox':true,warn: true, 'unqualified': item.result && item.result !== '合格', 'qualified': item.result === '合格', 'null-val': !item.result}"
                  >
                    <span>{{item.result || '无结论'}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 功率因数分析 -->
          <div
            class="b-right whiteBox"
            v-loading="powLoading"
            element-loading-background="rgba(67, 92, 112, 0.5)"
            element-loading-text="加载中..."
          >
            <div class="title titleBox">
              <div style="display: inline-block;">
                <strong>功率因数分析</strong>
              </div>
              <div class="data">
                <span>监测点数：{{harmonicObj.total || '-'}} / 标准值：{{harmonicObj.nominal || '-'}}</span>
              </div>
            </div>
            <div class="frequency">
              <div class="box-abs">
                <div class="box-rel hasBacBox">
                  <span>功率因数</span>
                </div>
              </div>
              <div class="sin-layout">
                <div class="single-val hasBacBox">
                  <div class="max-value">
                    <span>最大</span>
                    <span>值:</span>
                  </div>
                  <div class="val">
                    <span>{{harmonicObj.max || '-'}}</span>
                    <!-- <span>({{harmonicObj.maxB || '-'}}%)</span> -->
                  </div>
                </div>
                <div class="single-val hasBacBox">
                  <div class="max-value">
                    <span>最小</span>
                    <span>值:</span>
                  </div>
                  <div class="val">
                    <span>{{harmonicObj.min || '-'}}</span>
                    <!-- <span>({{harmonicObj.minB || '-'}}%)</span> -->
                  </div>
                </div>
                <div class="single-val hasBacBox">
                  <div class="max-value">
                    <span>平均</span>
                    <span>值:</span>
                  </div>
                  <div class="val">
                    <span>{{harmonicObj.average || '-'}}</span>
                    <!-- <span>({{harmonicObj.averageB || '-'}}%)</span> -->
                  </div>
                </div>
                <div class="block-box">
                  <div class="single-box hasBacBox">
                    <p>超限次数</p>
                    <p>{{harmonicObj.overrun == 0? harmonicObj.overrun:(harmonicObj.overrun || '-')}}</p>
                  </div>
                  <div class="single-box hasBacBox">
                    <p>合格率</p>
                    <p>{{harmonicObj.qualified || '-%'}}</p>
                  </div>
                </div>
                <div
                  :class="{'hasBacBox':true,warn: true, 'unqualified': harmonicObj.result && harmonicObj.result !== '合格', 'qualified': harmonicObj.result === '合格', 'null-val' : !harmonicObj.result}"
                >
                  <span>{{harmonicObj.result || '无结论'}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Mybreadcrumb from "../subcomponents/Mybreadcrumb";
export default {
  components: {
    Mybreadcrumb,
  },
  data() {
    return {
      pickerOptions_month: {
        disabledDate(time) {
          return (
            time.getTime() > Date.now() || time.getTime() < new Date(2019, 9, 1)
          );
        },
      },
      isResouceShow: 1, //控制联级元素重新渲染
      options: [],
      monthSelect: new Date(),
      defaultProps: {
        children: "children",
        label: "name",
        value: "id",
      },
      group_equip_options: [], //设备选择联级数据
      temp_options: [], //临时存储联级数据
      equipId: "", //选中设备的联级id集合，equipid取下标1
      voltageAnalysisArr: [
        { name: "A相电压" },
        { name: "B相电压" },
        { name: "C相电压" },
      ], //电压质量分析
      // 频率质量分析
      frequencyObj: {
        name: "频率",
        total: "",
        nominal: "",
        overrun: "",
        qualified: "",
        max: "",
        maxB: "",
        min: "",
        minB: "",
        average: "",
        averageB: "",
        result: "",
      },
      harAnalysisArr: [
        { name: "A相电压谐波畸变率" },
        { name: "B相电压谐波畸变率" },
        { name: "C相电压谐波畸变率" },
      ], //谐波数据
      harmonicObj: {
        name: "频率",
        total: "",
        nominal: "",
        overrun: "",
        qualified: "",
        max: "",
        maxB: "",
        min: "",
        minB: "",
        average: "",
        averageB: "",
        result: "",
      },
      volLoading: false, //电压质量加载中
      harLoading: false, //谐波加载中
      freLoading: false, //频率加载中
      powLoading: false, //功率加载中
      nominalMax: "", //标准频率最大限度
      nominalMin: "", //标准频率最小限度
    };
  },
  computed: {
    siteId() {
      return this.$store.state.site.siteId;
    },
  },
  watch: {
    siteId() {
      this.getAllGroup();
    },
  },
  created() {
    this.getAllGroup();
  },
  methods: {
    // 查询站点下所有监控分组
    getAllGroup() {
      this.temp_options = [];
      this.equipId = [];
      if (!this.$store.state.site.siteId) {
        return;
      }
      this.$http
        .get("equipment/classify/findAllByRoom", {
          params: {
            roomId: this.$store.state.site.siteId,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.temp_options = res.data.data;
            // 分组集合数组
            var str = [];
            if (this.temp_options.length > 0) {
              str = this.temp_options.map((item) => {
                return item.id;
              });
              this.getEquipByGroup(str);
            } else {
              this.isResouceShow++;
              this.group_equip_options = [];
              this.getVoltageAnalysis();
              this.getFrequencyAnalysis();
              this.getHarmonicAnalysis();
              this.getFactorAnalysis();
            }
          }
        });
    },
    // 根据分组集合查设备
    getEquipByGroup(str) {
      this.$http
        .get("equipment/classifyEquipment/findAllByClassify", {
          params: {
            classifyIds: str.join(","),
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            var res1 = res.data.data;
            var index = 0;
            for (var i = 0; i < this.temp_options.length; i++) {
              if (res1[i].ClassifyEquipmentVO.length) {
                for (var j = 0; j < res1[i].ClassifyEquipmentVO.length; j++) {
                  // id替换成设备id，用于最后取值(负值防止联级数据联级id冲突报错)
                  res1[i].ClassifyEquipmentVO[j].id = -res1[i]
                    .ClassifyEquipmentVO[j].equipmentId;
                  index++;
                  // 默认选中有设备的第一个分组的第一个设备
                  if (index === 1) {
                    var arr = [
                      this.temp_options[i].id,
                      res1[i].ClassifyEquipmentVO[j].id,
                    ];
                    this.equipId = arr;
                    this.getVoltageAnalysis();
                    this.getFrequencyAnalysis();
                    this.getHarmonicAnalysis();
                    this.getFactorAnalysis();
                  }
                }
                this.temp_options[i].children = res1[i].ClassifyEquipmentVO;
              }
            }
            // 临时数据赋值
            this.group_equip_options = this.temp_options;
          }
        });
    },
    // 查电压质量分析
    getVoltageAnalysis() {
      this.volLoading = true;
      if (this.equipId.length < 2) {
        this.voltageAnalysisArr = [{}, {}, {}];
        this.volLoading = false;
        return;
      }

      this.$http
        .get("equipment/powerQuality/voltageAnalysis", {
          params: {
            equipmentId: Math.abs(this.equipId[1]),
            date: this.getTime(),
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            // this.voltageAnalysisArr = res.data.data;
            var res = res.data.data;
            // 将返回的null处理为空对象，防止报错

            var arr = [
              { name: "A相电压" },
              { name: "B相电压" },
              { name: "C相电压" },
            ];
            // 适配返回数据
            for (var i = 0; i < res.length; i++) {
              if (res[i] && res[i].name === "A相电压") {
                arr[0] = res[i];
              } else if (res[i] && res[i].name === "B相电压") {
                arr[1] = res[i];
              } else if (res[i] && res[i].name === "C相电压") {
                arr[2] = res[i];
              } else {
              }
            }
            this.voltageAnalysisArr = arr;
            this.volLoading = false;
            // var arr = [
            //   {
            //     name: "A相电压",
            //     total: "128",
            //     nominal: "220",
            //     overrun: "0",
            //     qualified: "100.00",
            //     max: "225",
            //     maxB: "11",
            //     min: "110",
            //     minB: "-50",
            //     average: "220",
            //     averageB: "0",
            //     result: "合格",
            //   },
            //   {
            //     name: "B相电压",
            //     total: "128",
            //     nominal: "220",
            //     overrun: "25",
            //     qualified: "100.00",
            //     max: "256.12",
            //     maxB: "6.21",
            //     min: "251.43",
            //     minB: "9.3",
            //     average: "235",
            //     averageB: "5.5",
            //     result: "合格",
            //   },
            //   {
            //     name: "C相电压",
            //     total: "128",
            //     nominal: "220",
            //     overrun: "25",
            //     qualified: "98.89",
            //     max: "256.12",
            //     maxB: "7.21",
            //     min: "251.43",
            //     minB: "7.3",
            //     average: "235",
            //     averageB: "8.5",
            //     result: "合格",
            //   },
            // ];
            // this.voltageAnalysisArr = arr;
          }
        });
    },
    // 当前选中设备修改
    equipChange() {
      this.getVoltageAnalysis();
      this.getFrequencyAnalysis();
      this.getHarmonicAnalysis();
      this.getFactorAnalysis();
    },
    // 报告月份改变
    timeChange() {
      this.getVoltageAnalysis();
      this.getFrequencyAnalysis();
      this.getHarmonicAnalysis();
      this.getFactorAnalysis();
    },
    // 查频率质量分析
    getFrequencyAnalysis() {
      this.freLoading = true;
      if (this.equipId.length < 2) {
        this.frequencyObj = {};
        this.freLoading = false;
        return;
      }
      this.$http
        .get("equipment/powerQuality/frequencyAnalysis", {
          params: {
            equipmentId: Math.abs(this.equipId[1]),
            date: this.getTime(),
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.frequencyObj = res.data.data ? res.data.data : {};
            // var obj = {
            //   name: "频率",
            //   total: "8910",
            //   nominal: "50",
            //   overrun: "0",
            //   qualified: "100.00",
            //   max: "50.06",
            //   maxB: "0.10",
            //   min: "49.4",
            //   minB: "-0.12",
            //   average: "79.99",
            //   averageB: "-0.02",
            //   result: "合格",
            // };
            // // var obj = {}
            // this.frequencyObj = obj;
            this.freLoading = false;
            var bool = JSON.stringify(this.frequencyObj) == "{}";
            if (!bool) {
              this.nominalMax = Number(this.frequencyObj.nominal) + 0.5;
              this.nominalMin = Number(this.frequencyObj.nominal) - 0.5;
            }
          }
        });
    },
    // 查谐波含量分析
    getHarmonicAnalysis() {
      // console.log('-----------')
      if (this.equipId.length < 2) {
        // this.frequencyObj = {};
        this.harAnalysisArr = [
          { name: "A相电压总谐波畸变率" },
          { name: "B相电压总谐波畸变率" },
          { name: "C相电压总谐波畸变率" },
        ];
        return;
      }
      this.harLoading = true;
      this.$http
        .get("equipment/powerQuality/harmonicAnalysis", {
          params: {
            equipmentId: Math.abs(this.equipId[1]),
            date: this.getTime(),
            // equipmentId: 335544932,
            // date: 202006
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            // this.harmonicObj = res.data.data ? res.data.data : {};
            var res = res.data.data;
            // 将返回的null处理为空对象，防止报错
            var arr = [
              { name: "A相电压总谐波畸变率" },
              { name: "B相电压总谐波畸变率" },
              { name: "C相电压总谐波畸变率" },
            ];
            // 适配返回数据的混乱
            for (var i = 0; i < res.length; i++) {
              if (res[i] && res[i].name === "A相电压总谐波畸变率") {
                arr[0] = res[i];
              } else if (res[i] && res[i].name === "B相电压总谐波畸变率") {
                arr[1] = res[i];
              } else if (res[i] && res[i].name === "C相电压总谐波畸变率") {
                arr[2] = res[i];
              } else {
              }
            }
            this.harAnalysisArr = arr;
            this.harLoading = false;
          }
        });
    },
    // 查功率因数分析
    getFactorAnalysis() {
      this.powLoading = true;
      if (this.equipId.length < 2) {
        this.harmonicObj = {};
        this.powLoading = false;
        return;
      }
      this.$http
        .get("equipment/powerQuality/powerFactorAnalysis", {
          params: {
            // equipmentId: 335545435,
            // date: 202007
            equipmentId: Math.abs(this.equipId[1]),
            date: this.getTime(),
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.harmonicObj = res.data.data ? res.data.data : {};
          }
          this.powLoading = false
        });
    },
    // 返回时间格式202004
    getTime() {
      let year = this.monthSelect.getFullYear().toString();
      let month = this.monthSelect.getMonth() + 1;
      return year + (month > 9 ? month : "0" + month);
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../assets/css/index.less";
@inner-border-color: #686f83;
.assess {
  height: 100%;
  color: #fff;
  @dis-flex();
  @flex-c();
  .content {
    @flex-1();
    overflow: auto;
    @dis-flex();
    @flex-c();
    .select {
      @dis-flex();
      justify-content: left;
      margin-bottom: 8px;
      box-sizing: border-box;
      padding:5px;
      .equip {
        margin-right: 50px;
      }
    }
    // 内容
    .detail {
      @flex-1();
      @dis-flex();
      @flex-c();
      .d-top {
        @flex-1();
        margin-bottom: 10px;
        @dis-flex();
        // 电压质量分析
        .t-left {
          @dis-flex();
          @flex-c();
          @flex-1();
          background-color: @content-bgc;
          margin-right: 16px;
          box-sizing: border-box;
          // padding: 10px;
          .title {
            @dis-flex();
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            background-color: rgb(84, 101, 125);
            padding: 10px 20px;
            box-sizing: border-box;
            border-bottom: 1px solid #999;
          }
          .l-total {
            @flex-1();
            @dis-flex();
            padding: 0 6px;
            // 三个ABC电压
            .l-single {
              @flex-1();
              margin-bottom: 6px;
              margin-top: 16px;
              border: 1px solid @inner-border-color;
              border-radius: 4px;
              padding: 4px;
              box-sizing: border-box;
              position: relative;
              .box-abs {
                position: absolute;
                top: -12px;
                left: 12px;

                .box-rel {
                  border: 1px solid rgb(64, 156, 249);
                  border-radius: 4px;
                  // position: ralative;
                  padding: 2px 20px;
                  box-shadow: 1px 1px 1px rgb(64, 156, 249);
                  background-color: @box-block;
                }
              }
              .sin-layout {
                height: calc(100% - 20px);
                margin-top: 20px;
                @dis-flex();
                @flex-c();
                .single-val {
                  @flex-1();
                  padding: 4px 2px;
                  @dis-flex();
                  display: flex;
                  align-items: center;
                  background-color: @box-block;
                  .max-value {
                    width: 22%;
                    @dis-flex();
                    align-items: center;
                    text-align: center;
                  }
                  .val {
                    width: 53%;
                    margin: 0 2%;
                    text-align: center;
                    word-wrap: break-word;
                  }
                  .val-status {
                    width: 21%;
                    border-radius: 4px;
                    text-align: center;
                    padding: 2px 4px;
                  }
                  .status-warn {
                    border: 1px solid rgb(228, 155, 157);
                    color: rgb(228, 155, 157);
                  }
                  .status-nomal {
                    border: 1px solid rgb(79, 207, 181);
                    color: rgb(79, 207, 181);
                  }
                  .status-null {
                    color: @whiteBox-font-color;
                    border: 1px solid @whiteBox-font-color;
                  }
                }
                .single-val:nth-child(2) {
                  margin: 3% 0;
                }
                .block-box {
                  margin-top: 3%;
                  // @flex-1();
                  flex: 2;
                  @dis-flex();
                  justify-content: center;
                  .single-box {
                    @flex-1();
                    padding: 4px 0;
                    background-color: @box-block;
                    p {
                      text-align: center;
                    }
                    p:nth-child(2) {
                      margin-top: 6px;
                      font-weight: bold;
                    }
                  }
                  .single-box:first-child {
                    margin-right: 6px;
                  }
                }
                .warn {
                  margin: 3% 0;
                  @flex-1();
                  font-size: 18px;
                  border-radius: 6px;
                  padding: 4px;
                  background-color: @box-block;
                  @dis-flex();
                  justify-content: center;
                  align-items: center;
                  &.qualified {
                    color: rgb(79, 207, 181);
                    border: 2px solid rgb(79, 207, 181);
                  }
                  &.unqualified {
                    color: rgb(228, 155, 157);
                    border: 2px solid rgb(228, 155, 157);
                  }
                  &.null-val {
                    color: @whiteBox-font-color;
                    border: 2px solid @whiteBox-font-color;
                  }
                }
              }
            }
            .l-single:nth-child(2) {
              margin: 16px 14px 6px;
            }
          }
        }
        // 频率含量分析
        .t-right {
          width: 27%;
          box-sizing: border-box;
          background-color: @content-bgc;
          padding-bottom: 4px;
          @dis-flex();
          @flex-c();
          .title {
            margin-bottom: 6px;
            overflow: hidden;
            background-color: rgb(84, 101, 125);
            padding: 10px 20px;
            box-sizing: border-box;
            border-bottom: 1px solid #999;
            .data {
              float: right;
            }
          }
          .frequency {
            @flex-1();
            border: 1px solid @inner-border-color;
            border-radius: 4px;
            padding: 4px;
            box-sizing: border-box;
            margin: 16px 6px 0;
            position: relative;
            @dis-flex();
            @flex-c();
            .box-abs {
              position: absolute;
              top: -12px;
              left: 12px;
              .box-rel {
                border: 1px solid rgb(64, 156, 249);
                border-radius: 4px;
                // position: ralative;
                padding: 2px 20px;
                box-shadow: 1px 1px 1px rgb(64, 156, 249);
                background-color: @box-block;
              }
            }
            .sin-layout {
              height: calc(100% - 20px);
              margin-top: 20px;
              @dis-flex();
              @flex-c();
              .single-val {
                @flex-1();
                padding: 4px 2px;
                @dis-flex();
                display: flex;
                align-items: center;
                background-color: @box-block;
                .max-value {
                  width: 22%;
                  @dis-flex();
                  align-items: center;
                  text-align: center;
                }
                .val {
                  width: 53%;
                  margin: 0 2%;
                  text-align: center;
                  word-wrap: break-word;
                }
                .val-status {
                  width: 21%;
                  border-radius: 4px;
                  text-align: center;
                  padding: 2px 4px;
                }
                .status-warn {
                  border: 1px solid rgb(228, 155, 157);
                  color: rgb(228, 155, 157);
                }
                .status-nomal {
                  border: 1px solid rgb(79, 207, 181);
                  color: rgb(79, 207, 181);
                }
                .status-null {
                  color: @whiteBox-font-color;
                  border: 1px solid @whiteBox-font-color;
                }
              }
              .single-val:nth-child(2) {
                margin: 3% 0;
              }
              .block-box {
                margin-top: 3%;
                // @flex-1();
                flex: 2;
                @dis-flex();
                justify-content: center;
                .single-box {
                  @flex-1();
                  padding: 4px 0;
                  background-color: @box-block;
                  p {
                    text-align: center;
                  }
                  p:nth-child(2) {
                    margin-top: 6px;
                    font-weight: bold;
                  }
                }
                .single-box:first-child {
                  margin-right: 6px;
                }
              }
              .warn {
                margin: 3% 0;
                @flex-1();
                font-size: 18px;
                border-radius: 6px;
                padding: 4px;
                background-color: @box-block;
                @dis-flex();
                justify-content: center;
                align-items: center;
                &.qualified {
                  color: rgb(79, 207, 181);
                  border: 2px solid rgb(79, 207, 181);
                }
                &.unqualified {
                  color: rgb(228, 155, 157);
                  border: 2px solid rgb(228, 155, 157);
                }
                &.null-val {
                  color: @whiteBox-font-color;
                  border: 2px solid @whiteBox-font-color;
                }
              }
            }
          }
        }
      }
      .d-bottom {
        @flex-1();
        @dis-flex();
        // 电压质量分析
        .b-left {
          @flex-1();
          background-color: @content-bgc;
          margin-right: 16px;
          box-sizing: border-box;
          @dis-flex();
          @flex-c();
          .title {
            @dis-flex();
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            background-color: rgb(84, 101, 125);
            padding: 10px 20px;
            box-sizing: border-box;
            border-bottom: 1px solid #999;
          }
          .l-total {
            @flex-1();
            @dis-flex();
            padding: 0 6px;
            // 三个ABC电压
            .l-single {
              @flex-1();
              margin-bottom: 6px;
              margin-top: 16px;
              border: 1px solid @inner-border-color;
              border-radius: 4px;
              padding: 4px;
              box-sizing: border-box;
              position: relative;
              .box-abs {
                position: absolute;
                top: -12px;
                left: 12px;
                .box-rel {
                  border: 1px solid rgb(64, 156, 249);
                  border-radius: 4px;
                  // position: ralative;
                  padding: 2px 20px;
                  box-shadow: 1px 1px 1px rgb(64, 156, 249);
                  background-color: @box-block;
                }
              }
              .sin-layout {
                height: calc(100% - 20px);
                margin-top: 20px;
                @dis-flex();
                @flex-c();
                .single-val {
                  @flex-1();
                  padding: 4px 2px;
                  @dis-flex();
                  display: flex;
                  align-items: center;
                  justify-content: space-around;
                  background-color: @box-block;
                  .max-value {
                    width: 22%;
                    @dis-flex();
                    align-items: center;
                    text-align: center;
                  }
                  .val {
                    width: 53%;
                    margin: 0 2%;
                    text-align: center;
                    word-wrap: break-word;
                  }
                  .val-status {
                    width: 21%;
                    border-radius: 4px;
                    text-align: center;
                    padding: 2px 4px;
                  }
                  .status-warn {
                    border: 1px solid rgb(228, 155, 157);
                    color: rgb(228, 155, 157);
                  }
                  .status-nomal {
                    border: 1px solid rgb(79, 207, 181);
                    color: rgb(79, 207, 181);
                  }
                  .status-null {
                    color: @whiteBox-font-color;
                    border: 1px solid @whiteBox-font-color;
                  }
                }
                .single-val:nth-child(2) {
                  margin: 3% 0;
                }
                .block-box {
                  margin-top: 3%;
                  // @flex-1();
                  flex: 2;
                  @dis-flex();
                  justify-content: center;
                  .single-box {
                    @flex-1();
                    padding: 4px 0;
                    background-color: @box-block;
                    p {
                      text-align: center;
                    }
                    p:nth-child(2) {
                      margin-top: 6px;
                      font-weight: bold;
                    }
                  }
                  .single-box:first-child {
                    margin-right: 6px;
                  }
                }
                .warn {
                  margin: 3% 0;
                  @flex-1();
                  font-size: 18px;
                  border-radius: 6px;
                  padding: 4px;
                  background-color: @box-block;
                  @dis-flex();
                  justify-content: center;
                  align-items: center;
                  &.qualified {
                    color: rgb(79, 207, 181);
                    border: 2px solid rgb(79, 207, 181);
                  }
                  &.unqualified {
                    color: rgb(228, 155, 157);
                    border: 2px solid rgb(228, 155, 157);
                  }
                  &.null-val {
                    color: @whiteBox-font-color;
                    border: 2px solid @whiteBox-font-color;
                  }
                }
              }
            }
            .l-single:nth-child(2) {
              margin: 16px 14px 6px;
            }
          }
        }
        // 频率含量分析
        .b-right {
          width: 27%;
          box-sizing: border-box;
          background-color: @content-bgc;
          padding-bottom: 4px;
          @dis-flex();
          @flex-c();
          .title {
            margin-bottom: 6px;
            overflow: hidden;
            background-color: rgb(84, 101, 125);
            padding: 10px 20px;
            box-sizing: border-box;
            border-bottom: 1px solid #999;
            .data {
              float: right;
            }
          }
          .frequency {
            border: 1px solid @inner-border-color;
            border-radius: 4px;
            padding: 4px;
            box-sizing: border-box;
            margin: 16px 6px 0;
            position: relative;
            @flex-1();
            .box-abs {
              position: absolute;
              top: -12px;
              left: 12px;

              .box-rel {
                border: 1px solid rgb(64, 156, 249);
                border-radius: 4px;
                // position: ralative;
                padding: 2px 20px;
                box-shadow: 1px 1px 1px rgb(64, 156, 249);
                background-color: @box-block;
              }
            }
            .sin-layout {
              height: calc(100% - 20px);
              margin-top: 20px;
              @dis-flex();
              @flex-c();
              @flex-1();
              .single-val {
                @flex-1();
                padding: 4px 2px;
                @dis-flex();
                display: flex;
                align-items: center;
                justify-content: space-around;
                background-color: @box-block;
                .max-value {
                  width: 22%;
                  @dis-flex();
                  align-items: center;
                  text-align: center;
                }
                .val {
                  width: 53%;
                  margin: 0 2%;
                  text-align: center;
                  word-wrap: break-word;
                }
                .val-status {
                  width: 21%;
                  border-radius: 4px;
                  text-align: center;
                  padding: 2px 4px;
                }
                .status-warn {
                  border: 1px solid rgb(228, 155, 157);
                  color: rgb(228, 155, 157);
                }
                .status-nomal {
                  border: 1px solid rgb(79, 207, 181);
                  color: rgb(79, 207, 181);
                }
                .status-null {
                  color: @whiteBox-font-color;
                  border: 1px solid @whiteBox-font-color;
                }
              }
              .single-val:nth-child(2) {
                margin: 3% 0;
              }
              .block-box {
                margin-top: 3%;
                // @flex-1();
                flex: 2;
                @dis-flex();
                justify-content: center;
                .single-box {
                  @flex-1();
                  padding: 4px 0;
                  background-color: @box-block;
                  p {
                    text-align: center;
                  }
                  p:nth-child(2) {
                    margin-top: 6px;
                    font-weight: bold;
                  }
                }
                .single-box:first-child {
                  margin-right: 6px;
                }
              }
              .warn {
                margin: 3% 0;
                @flex-1();
                font-size: 18px;
                border-radius: 6px;
                padding: 4px;
                background-color: @box-block;
                @dis-flex();
                justify-content: center;
                align-items: center;
                &.qualified {
                  color: rgb(79, 207, 181);
                  border: 2px solid rgb(79, 207, 181);
                }
                &.unqualified {
                  color: rgb(228, 155, 157);
                  border: 2px solid rgb(228, 155, 157);
                }
                &.null-val {
                  color: @whiteBox-font-color;
                  border: 2px solid @whiteBox-font-color;
                }
              }
            }
          }
        }
      }
    }
  }
}
.box-rel{
  min-height:21px;
}
</style>