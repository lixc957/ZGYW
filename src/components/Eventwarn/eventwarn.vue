<template>
  <!-- 事件告警 -->
  <div class="event-warn child-page" style>
    <!-- 面包屑 -->
    <MyBreadcrumb level1="告警管理" level2="告警处理" />
    <!-- 顶部下拉选项 -->
    <div class="child-con whiteBox">
      <div class="sel whiteBox" style="padding:10px 0;">
        <!-- 所有设备 -->
        <el-select
          v-model="equipment"
          clearable
          @visible-change="getEquip"
          @change="equipChange"
          filterable
          placeholder="设备"
          size="mini"
          style="width: 150px"
          :disabled="loading == true || !$store.state.site.siteId"
        >
          <el-option
            v-for="item in optionsEquip"
            :key="item.equipmentId"
            :label="item.name"
            :value="item.equipmentId"
          ></el-option>
        </el-select>
        <el-select
          v-model="warnType"
          clearable
          filterable
          placeholder="警告类型"
          size="mini"
          style="width: 150px; margin-right: 10px"
          @visible-change="getType"
          @change="typeChange"
          :disabled="loading == true"
        >
          <el-option
            v-for="item in warnTypeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
        <el-checkbox
          v-model="warnChecked"
          @change="checkboxChange"
          :disabled="loading == true"
          >已确认</el-checkbox
        >
        <!-- 时间选项 -->
        <div class="" style="display:inline-block;">
          <el-date-picker
            v-model="value3"
            type="datetimerange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd HH:mm:ss"
            @change="dateChange"
            :picker-options="pickerOptions"
            :disabled="loading == true"
            :clearable="false"
          ></el-date-picker>
        </div>
        <div class="edit-btn" style>
          <el-button
            class="confirm"
            icon="el-icon-upload2"
            size="small"
            :disabled="!Boolean(warnOptions.length) || exportLoading"
            v-loading="exportLoading"
            @click="exportFile"
            >导出事件</el-button
          >
        </div>
      </div>
      <div class="warn-block whiteBox" ref="conBox">
        <div class="shadow" style>
          <el-table
            :data="warnOptions"
            style
            stripe
            size="mini"
            border
            :max-height="conHeight"
            v-loading="loading"
          >
            <el-table-column prop="time" label="时间" width="210">
              <template slot-scope="scope">{{ scope.row.time }}</template>
            </el-table-column>
            <el-table-column prop="name" label="事件" width="180"></el-table-column>                                                
            <el-table-column prop="roomName" label="所属站点"></el-table-column>
            <el-table-column prop="equipmentName" label="所属设备"></el-table-column>
            <el-table-column prop="maintainInfo" label="保养信息"></el-table-column>                          
            <el-table-column prop="alarmTypeName" label="告警类型"></el-table-column> 
            <el-table-column prop="alarmValue" label="告警值"></el-table-column>                                    
            <el-table-column prop="level" label="告警级别">
              <template slot-scope="scope">
                <button class="one-type warn-btn" v-if="scope.row.level == 1">
                  一级
                </button>
                <button
                  class="two-type warn-btn"
                  v-else-if="scope.row.level == 2"
                >
                  二级
                </button>
                <button
                  class="three-type warn-btn"
                  v-else-if="scope.row.level == 3"
                >
                  三级
                </button>
                <button
                  class="four-type warn-btn"
                  v-else-if="scope.row.level == 4"
                >
                  四级
                </button>
                <button
                  class="five-type warn-btn"
                  v-else-if="scope.row.level == 5"
                >
                  五级
                </button>
                <button
                  class="six-type warn-btn"
                  v-else-if="scope.row.level == 6"
                >
                  六级
                </button>
              </template>
            </el-table-column>
            <el-table-column prop="handleStatus" label="处理状态">
              <template slot-scope="scope">
                <span v-if="scope.row.handleStatus == 0">未处理</span>
                <span v-if="scope.row.handleStatus == 1">处理中</span>
                <span v-if="scope.row.handleStatus == 2">已处理</span>
              </template>
            </el-table-column>
            <el-table-column prop="handleInfo" label="处理信息">
              <template slot-scope="scope">
                <span>{{ scope.row.handleInfo }}</span>
                <div style="display: inline-block">
                  <span v-if="scope.row.handleUser">&nbsp;-&nbsp;</span>
                  <span style="color: skyblue">{{ scope.row.handleUser }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="confirmStatus" label="确认状态">
              <template slot-scope="scope">
                <span v-if="scope.row.confirmStatus == 0">未确认</span>
                <span v-if="scope.row.confirmStatus == 1">已确认</span>
              </template>
            </el-table-column>
            <el-table-column label="详情" width="65">
              <template slot-scope="scope">
                <el-tooltip
                  class="item"
                  effect="dark"
                  offset="-20"
                  content="编辑"
                  placement="top-start"
                >
                  <el-button
                    icon="el-icon-edit"
                    class="confirm"
                    size="mini"
                    @click="searchDetail(scope.row)"
                  ></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template slot-scope="scope">
                <div class="handle-col" :style="{ display: 'flex' }">
                  <el-tooltip
                  class="item"
                  effect="dark"
                  offset="-20"
                  content="确认"
                  placement="top-start"
                >
                  <el-button
                    v-if="scope.row.confirmStatus == 0"
                    class="confirm"
                    icon="el-icon-check"
                    size="mini"
                    @click="affirm(scope.row)"
                  >
                    <!-- <i class="icon iconfont iconconfirm1"></i> -->
                  </el-button>
                </el-tooltip>

                <el-button
                  v-if="scope.row.confirmStatus !=0"
                  type="info"
                  size="mini"
                  disabled
                  >已确认</el-button>

                  <button 
                    class="warn-btn" 
                    @click="addClick(scope.row)" 
                    v-if="scope.row.handleStatus === 0"
                    :style="{ backgroundColor: '#f5a623', marginLeft: '10px' }">+ 创建工单</button>
                </div>            
              </template>
            </el-table-column>
          </el-table>
            <!-- 分页 -->
            <div class="block">
              <el-pagination
                class="page-float"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-sizes="[10, 20, 50]"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalWarn"
              ></el-pagination>
            </div>
        </div>
      </div>
    </div>

    <!-- 详情框 -->
    <el-dialog
      class="warn-detail-dialog"
      :visible.sync="warnDetailVisible"
      title="告警详情"
      width="800px"
    >
      <div class="section">
        <p class="test-left">发生时间</p>
        <span class="test-right">{{ searchWarnObject.time }}</span>
      </div>
      <div class="section">
        <p class="test-left">事件</p>
        <span class="test-right">{{ searchWarnObject.name }}</span>
      </div>
      <div class="section">
        <p class="test-left">站点-设备</p>
        <span class="test-right"
          >{{ searchWarnObject.roomName }} -
          {{ searchWarnObject.equipmentName }}</span
        >
      </div>
      <div class="section">
        <p class="test-left">保养信息</p>
        <span class="test-right">{{ searchWarnObject.maintainInfo }}</span>
      </div>
      <div class="section">
        <p class="test-left">告警级别</p>
        <span class="test-right" v-if="searchWarnObject.level == 1">一级</span>
        <span class="test-right" v-if="searchWarnObject.level == 2">二级</span>
        <span class="test-right" v-if="searchWarnObject.level == 3">三级</span>
        <span class="test-right" v-if="searchWarnObject.level == 4">四级</span>
        <span class="test-right" v-if="searchWarnObject.level == 5">五级</span>
      </div>
      <div class="section">
        <p class="test-left">告警值</p>
        <span class="test-right">{{ searchWarnObject.alarmValue }}</span>
      </div>
      <!-- 确认 -->
      <div
        class="section sec-block"
        v-if="searchWarnObject.confirmStatus == 1"
        style="border-top: 1px solid #d5cdbf"
      >
        <p class="test-left" style="position: absolute">确认信息</p>
        <el-input
          type="textarea"
          disabled
          v-model.trim="searchWarnObject.confirmInfo"
          cols="40"
          rows="3"
          class="input-area"
          style
        ></el-input>
      </div>
      <div class="section">
        <p class="test-left">确认人</p>
        <span class="test-right">{{ searchWarnObject.confirmUser }}</span>
      </div>
      <div class="section sec-block">
        <p class="test-left" style="position: absolute">处理信息</p>
        <el-input
          v-if="active == 3"
          disabled
          type="textarea"
          v-model.trim="searchWarnObject.handleInfo"
          cols="40"
          rows="3"
          class="input-area"
        ></el-input>
        <el-input
          v-else
          disabled
          type="textarea"
          class="input-area"
          v-model.trim="searchWarnObject.handleInfo"
          cols="40"
          rows="3"
        ></el-input>
      </div>
      <div class="section" v-if="active > 1">
        <p class="test-left">处理人</p>
        <span class="test-right">{{ searchWarnObject.handleUser }}</span>
      </div>
      <div class="section" v-if="active > 1">
        <p class="test-left">处理时间</p>
        <span class="test-right">{{ searchWarnObject.handleTime }}</span>
        <!-- <span class="test-right">{{searchWarnObject.handleTime }}</span> -->
      </div>
      <!-- <div class="section">
        <span class="test-left">处理进度</span>
        <div class="test-right" style>
          <el-steps
            :active="searchWarnObject.handleStatus"
            finish-status="success"
          >
            <el-step title="未处理"></el-step>
            <el-step title="处理中"></el-step>
            <el-step title="已处理"></el-step>
            <el-button
              size="mini"
              style="height: 30px; margin: 15px 0 0 30px"
              @click="next"
              >下一步</el-button
            >
          </el-steps>
        </div>

        <el-button style="margin-top: 12px;" @click="next">下一步</el-button>
      </div> -->
      <div class="submit" style>
        <el-button @click="handleWarn" class="confirm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 确认框 -->
    <el-dialog
      :visible.sync="affirmVisible"
      width="400px"
      title="确认警告"
      custom-class="arrirm-bgc"
      style="backcoground-color: skyblue"
      modal
      modal-append-to-body
      :close-on-click-modal="false"
      :show-close="true"
      @close="clear_confirm"
    >
      <div style="padding: 6px">
        <el-input
          type="textarea"
          name
          id
          v-model.trim="warnText"
          cols="45"
          rows="6"
          style="resize: vertical; background-color: #3b57664f"
          placeholder="请输入确认信息"
        ></el-input>
      </div>
      <el-button
        style="
          background: rgba(245, 166, 35);
          border: none;
          color: #fff;
          margin-left: 124px;
        "
        @click="warnSubmit"
        >确 定</el-button
      >
    </el-dialog>

    <!-- 新增框 -->
    <el-dialog
      :visible.sync="addOrderVisible"
      width="420px"
      title="创建工单"
      modal
      :close-on-click-modal="false"
      :show-close="true"
      @close="beforeDialogClose"
      class="order-dialog"
    >
      <el-form
        :rules="orderRule"
        ref="addOrderForm"
        label-width="80px"
        :model="orderForm"
        class="order-form"
      >
        <el-form-item label="执行人" prop="duser">
          <el-select
            v-model="orderForm.duser"
            placeholder="请选择执行人"          
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="item in orderDuserOptions"
              :key="item.userId"
              :label="item.userName"
              :value="item.userId"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="基本描述" prop="name">
          <el-input v-model.trim="orderForm.name" placeholder="请输入基本描述"></el-input>
        </el-form-item>

        <el-form-item label="订单级别" prop="level">
          <el-select
            v-model="orderForm.level"
            placeholder="请选择订单级别"          
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="item in orderLevelOptions"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="备注信息" prop="info">
          <el-input 
            v-model.trim="orderForm.info" 
            placeholder="请输入内容"
            autosize
            type="textarea"
          ></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="addOrderVisible = false">取 消</el-button>
        <el-button class="confirm" @click="addSubmitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getFullDate } from "../../utils/index";
import MyBreadcrumb from "../subcomponents/Mybreadcrumb";
import GLOBAL from "../../utils/global_variable";
export default {
  components: {
    MyBreadcrumb,
  },
  inject: ["reload"], //注入依赖
  data() {
    return {
      conHeight: 0,
      pickerOptions: {
        disabledDate(time) {
          return (
            time.getTime() > Date.now() || time.getTime() < new Date(2019, 9, 1)
          );
        },
      },
      currentPage: 1,
      totalWarn: 1,
      pageSize: 10,
      equipment: "", // 设备
      warnType: "", //告警类型
      warnHandle: 1, //告警处理
      warnChecked: false, //是否确认
      warnOptions: [],
      optionsEquip: [],
      warnTypeOptions: [],
      warnHandleOptions: [],
      value3: [], //事件段数组
      warnDetailVisible: false,
      affirmVisible: false,
      searchWarnObject: {},
      warnText: "", //确认的信息
      affirmId: "", //确认的id
      active: 1, //记录处理前的状态
      loading: false,
      exportLoading: false,
      addOrderVisible: false, // 新增框是否显示
      orderForm: {}, // 新增框绑定的表单值
      orderRule: {
        name: [{ required: true, message: '请输入基本描述', trigger: 'blur' }],
        level: [{ required: true, message: '请选择订单级别', trigger: 'change' }],
        info: [{ required: true, message: '请输入备注信息', trigger: 'blur' }],
      }, // 验证规则
      orderDuserOptions: [], // 执行人选项
      orderLevelOptions: [ // 订单级别选项
        { value: 1, name: '一级' },
        { value: 2, name: '二级' },
        { value: 3, name: '三级' },
        { value: 4, name: '四级' },
        { value: 5, name: '五级' }
      ], 
    }
  },
  computed: {
    watchSiteChange() {
      return this.$store.state.site.siteId;
    },
    // 计算文本框的值
    watchmsgChange() {
      return this.searchWarnObject.handleInfo;
    },
  },
  watch: {
    watchSiteChange(newVal, oldVal) {
      // this.$router.go(0)
      // this.reload()
      this.searchAllWarn()
    },
    // 监控站点值变化，对设备选项和值清空处理
    site: function (old) {
      this.equipment = "";
      this.optionsEquip = [];
    },
    // 监听文本框的值
    watchmsgChange() {
      if (
        this.searchWarnObject.handleStatus == this.active &&
        this.active == 1 &&
        this.searchWarnObject.handleInfo
      ) {
        this.searchWarnObject.handleStatus++;
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.conHeight = this.$refs.conBox && this.$refs.conBox.offsetHeight - 48;
    });
    window.addEventListener("resize", () => {
      this.$nextTick(() => {
        this.conHeight =
          this.$refs.conBox && this.$refs.conBox.offsetHeight - 48;
      });
    });
  },
  methods: {
    // ------------------分页大小改变----------------
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.searchAllWarn();
    },
    // ------------------当前页改变----------------------
    handleCurrentChange(val) {
      this.currentPage = val;
      this.searchAllWarn();
    },
    // 查询单个事件详情
    searchDetail(row) {
      this.$http
        .get("equipment/alarmEvent/findOne", {
          params: {
            id: row.id,
          },
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.searchWarnObject = res.data.data;
            if (this.searchWarnObject.monitorContent) {
               this.searchWarnObject.maintainInfo = `保养内容：${this.searchWarnObject.monitorContent}
               - 保养类型：${this.searchWarnObject.maintainType} - 保养价格：${this.searchWarnObject.maintainPrice}`
            }
            this.searchWarnObject.handleStatus++;
            this.active = this.searchWarnObject.handleStatus;
          }
        });
      this.warnDetailVisible = true;
    },
    // 弹出确认框
    affirm(row) {
      this.affirmId = row.id;
      this.affirmVisible = true;
    },
    // --------------------查询初始化时间数据-------------
    searchAllWarn() {
      this.getEvent();
    },
    formatTime(date) {
      return new Date(date.getTime() + 8 * 60 * 60 * 1000)
        .toJSON()
        .replace("T", " ")
        .replace("Z", "")
        .replace(".", ":");
    },
    // -------------------获取表格数据----------------------
    getEvent() {
      // 当前站点不存在，不发请求
      if (!this.$store.state.site.siteId) {
        return;
      }
      this.loading = true;
      // console.log(this.value3[0].toJSON().replace('T', ' '))
      var obj = {
        roomId: this.$store.state.site.siteId,
        confirmStatus: this.warnChecked ? 1 : 0,
        page: this.currentPage - 1,
        size: this.pageSize,
        begin: this.formatTime(this.value3[0]),
        end: this.formatTime(this.value3[1]),
      };
      // 动态添加筛选条件
      if (this.equipment != "") {
        obj.equipmentId = this.equipment;
      }
      if (this.warnType != "") {
        obj.alarmType = this.warnType;
      }
      let timeout = setTimeout(() => {
        this.loading = false;
      }, 15000);
      this.$http
        .get("equipment/alarmEvent/findAll", {
          params: obj,
        })
        .then((res) => {
          this.loading = false;
          if (res.data.code == 0) {
            this.warnOptions = res.data.data.alarmEventVOS
            if (!res.data.data.total) { 
              this.$forceUpdate()
              return // 没有数据，直接return
            } 
            this.warnOptions.forEach(item => { // 拼接保养信息
              if (item.monitorContent) {
                item.maintainInfo = `保养内容：${item.monitorContent}-保养类型：${item.maintainType}-保养价格：${item.maintainPrice}`
              }
            })
            this.totalWarn = res.data.data.total;
            // 通过中央事件刷新布局页面刷新当前告警数量
            this.$root.Bus.$emit("freshTotalWarn");
          }
        })
        .catch((res) => {
          this.loading = false;
        });
        this.$forceUpdate()
    },
    // 查询站点下运维人员
    async getRepairUser() {
      const res = await this.$http({
        url: '/sysmanage/sys/findRepairUser',
        params: {
          site: this.watchSiteChange
        }
      })
      if (res.data.code === 0) {
        this.orderDuserOptions = res.data.data
      }
    }, 
    // 创建运维订单
    async addOrderList() {
      const { duser, alarmId, info, level, name, site, eqId } = this.orderForm
      const res = await this.$http({
        method: 'post',
        url: '/equipment/RepairOrder/newOrder',
        data: { duser, alarmId, info, level, name, site, eqId }
      })
      if (res.data.code === 0) {
        this.$notify({
          message: res.data.msg,
          type: 'success'
        })
        this.getEvent()
        this.addOrderVisible = false
      } else {
        this.$notify({
          message: res.data.msg,
          type: 'warning'
        })
      }
    },
    //---------------确认告警-----------------------
    warnSubmit() {
      this.$http
        .get("equipment/alarmEvent/confirm", {
          params: {
            id: this.affirmId,
            confirmInfo: this.warnText,
          },
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.$notify({
              message: "告警确认成功！",
              type: "success",
            });
            this.affirmVisible = false;
            this.currentPage = 1;
            this.getEvent();
          }
        });
    },
    // -------------------------------时间段改变-------------
    dateChange() {
      this.currentPage = 1;
      this.getEvent();
    },
    // --------------------根据站点获取设备-----------------------
    getEquip(flag) {
      this.$http
        .get("/equipment/getEqByRoom", {
          params: {
            roomId: this.$store.state.site.siteId,
          },
        })
        .then((res) => {
          this.optionsEquip = res.data.data;
        });
    },
    // ------------------设备改变--------------------------
    equipChange() {
      this.currentPage = 1;
      this.getEvent();
    },
    // 获取告警类型
    getType(flag) {
      if (flag) {
        this.$http
          .get("equipment/alarm/alarmTypes", {
            params: {
              siteId: this.$store.state.site.siteId,
              page: 0,
              size: GLOBAL.max_page_size,
            },
          })
          .then((res) => {
            this.warnTypeOptions = res.data.data.alarmTypes;
          });
      }
    },
    // ---------------告警类型改变-------------------------
    typeChange() {
      this.currentPage = 1;
      this.getEvent();
    },
    // 确认状态改变
    checkboxChange(val) {
      this.currentPage = 1;
      this.getEvent();
    },
    // 进度处理
    next() {
      if (this.searchWarnObject.handleStatus++ > 2)
        this.searchWarnObject.handleStatus = 3;
    },
    // 处理告警
    handleWarn() {
      this.warnDetailVisible = false
      // 判断处理进度是否发生改变
      /* if (
        this.searchWarnObject.handleStatus != this.active ||
        (this.searchWarnObject.handleInfo &&
          this.searchWarnObject.handleStatus == 2)
      ) {
        // 提交处理进度前先判断确认状态是否为已确认
        if (this.searchWarnObject.confirmStatus == 0) {
          this.$notify({
            title: "提醒",
            message: "处理告警前请先确认告警！否组无法处理当前告警进度",
            type: "warning",
          });
          return
        }
        this.$http
          .get("equipment/alarmEvent/handle", {
            params: {
              id: this.searchWarnObject.id,
              handleInfo: this.searchWarnObject.handleInfo,
              handleStatus: this.searchWarnObject.handleStatus - 1,
            },
          })
          .then((res) => {
            if (res.data.code == 0) {
              this.$notify({
                message: "操作成功",
                type: "success",
              });
              this.searchAllWarn();
              this.warnDetailVisible = false;
            }
          });
      } else {
        this.warnDetailVisible = false;
      } */
    },
    clear_confirm() {
      this.warnText = null;
    },
    // 导出事件列表
    exportFile() {
      this.$notify({
        message: "开始导出",
      });
      this.exportLoading = true;
      let obj = {
        siteId: this.$store.state.site.siteId,
        begin: this.formatTime(this.value3[0]),
        end: this.formatTime(this.value3[1]),
        confirmStatus: this.warnChecked ? 1 : 0,
      };
      // 动态添加筛选条件
      if (this.equipment != "") {
        obj.equipmentId = this.equipment;
      }
      if (this.warnType != "") {
        obj.alarmType = this.warnType;
      }
      this.$http({
        methods: "GET",
        url: "equipment/alarmEvent/exportExcel",
        params: obj,
        responseType: "arraybuffer",
      })
        .then((res) => {
          const link = document.createElement("a");
          const blob = new Blob([res.data], {
            type:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          let href = window.URL.createObjectURL(blob);
          link.href = href;

          let _fileName = res.headers["content-disposition"]
            .split(";")[1]
            .split("=")[1]
            .split(".")[0];
          // 文件名中有中文 则对文件名进行转码
          link.download = decodeURIComponent(_fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(href);
          setTimeout(() => {
            this.$notify({
              message: "事件导出成功",
              type: "success",
            });
            this.exportLoading = false;
          }, 1000);
        })
        .catch((err) => {
          this.exportLoading = false;
        });
    },
    // 点击添加按钮
    addClick(row) {
      this.orderForm.alarmId = row.id // 关联告警编号
      this.orderForm.site = this.watchSiteChange // 所属站点
      this.orderForm.eqId = row.equipmentId // 关联设备
      this.addOrderVisible = true // 打开新增框
    },
    // 弹框关闭前
    beforeDialogClose() {
      this.orderForm = {}
      this.$refs.addOrderForm && this.$refs.addOrderForm.resetFields()
    },
    // 新增框确定提交
    addSubmitForm() {
      this.$refs.addOrderForm.validate(valid => {
        if(!valid) {
          // 验证不通过
          this.$notify({
            message: '验证失败',
            type: "error"
          })
          return
        }      
        this.addOrderList()
        return false
      }) 
    }
  },
  created() {
    // 返回时间对象，需要格式话成字符串
    this.value3 = getFullDate(new Date())
    this.searchAllWarn()
    this.getRepairUser() // 查询站点下运维人员
  },
};
</script>

<style lang="less" scoped>
@import "../../assets/css/index.less";
.event-warn {
  height: 100%;
  @dis-flex();
  @flex-c();
  .sel {
    .block {
      display: inline-block;
      margin-left: 20px;
      margin-right: 20px;
    }
    .edit-btn {
      float: right;
    }
  }
  .warn-block {
    width: 100%;
    height: calc(100% - 48px);
    margin-top: 8px;
    padding: 8px;
    box-sizing: border-box;
    .shadow {
      box-shadow: rgb(202, 198, 198) 0px 0px 4px;
      padding: 4px;
      .page-float {
        float: right;
      }
    }
  }
  // 弹窗
  .warn-detail-dialog {
    .sec-block {
      margin-top: 6px;
      margin-bottom: 10px;
      border-top: 1px solid #d5cdbf;
      text-align: top;
      position: relative;
      padding-top: 6px;
    }
    .section {
      padding-left: 15px;
      font-size: 16px;
      .test-left {
        width: 140px;
        text-align: center;
        display: inline-block;
        padding: 6px;
      }
      .test-right {
        width: calc(100% - 167px);
        display: inline-block;
        /deep/ .el-step__title.is-process {
          color: skyblue;
        }
      }
      /deep/ .input-area {
        margin-left: 152px;
        resize: none;
        font-size: 16px;
        width: auto;
      }
    }
    .submit {
      border-top: 1px solid pink;
      padding-top: 6px;
      @dis-flex();
      @flex-pc();
    }
  }
}
</style>
