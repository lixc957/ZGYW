<template>
  <div class="child-page">
    <!-- 面包屑 -->
    <MyBreadcrumb level1="参数设置" level2="开关控制" />
    <div class="child-con whiteBox" ref="conBox">
      <!-- <div class="tab_group">
            <div :class="['tab_item','first_tab', selectType===0?'actived_tab':'']" @click="changeSelectType(0)">
                <img src="" alt="">
                <span>定时控制</span>
            </div>
            <div :class="['tab_item','last_tab', selectType===1?'actived_tab':'']" @click="changeSelectType(1)">
                <img src="" alt="">
                <span>预约控制</span>
            </div>
      </div>-->
      <el-radio-group
        v-model="selectType"
        @change="changeSelectType"
        size="medium"
        style="margin-bottom:10px;"
      >
        <el-radio-button icon="el-icon-date" :label="0">定时控制</el-radio-button>
        <el-radio-button icon="el-icon-date" :label="2">实时控制</el-radio-button>
      </el-radio-group>
      <div class="con_box inner" v-if="selectType==0">
        <div class="top_box">
          <el-input
            v-model.trim="keywords"
            prefix-icon="el-icon-search"
            placeholder="任务名称"
            style="width:200px;"
            class
            clearable
            v-throttle="search"
          ></el-input>
          <div class="btn_box">
            <el-button
              size="mini"
              class="confirm"
              style="margin-left:5px;"
              icon="el-icon-plus"
              @click="showDialog('add')"
            >新建任务</el-button>
            <el-button
              size="mini"
              class="danger"
              style="margin-left:5px;"
              icon="el-icon-delete"
              @click="showDialog('delete')"
              :disabled="selectTaskIds.length?false:'disabled'"
            >批量删除</el-button>
          </div>
        </div>
        <div class="card_con">
          <!-- 表格 -->

          <el-table
            :data="taskData"
            class="task-table"
            v-loading="loading"
            border
            :max-height="conHeight"
            size="mini"
            @selection-change="handleSelectionChange"
            stripe
          >
            >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column type="index" label="序号" width="50"></el-table-column>
            <el-table-column prop="name" label="任务名称"></el-table-column>
            <el-table-column align="center" prop="renderTime" label="执行时间">
              <template slot-scope="scope">
                <span class="fl">{{scope.row.renderTime}}</span>
                <el-tooltip
                  v-show="scope.row.status==0"
                  class="item fr"
                  effect="dark"
                  offset="-10"
                  content="执行"
                  placement="top-start"
                >
                  <i @click="play(scope.row)" class="el-icon-self fr el-icon-video-play"></i>
                </el-tooltip>
                <el-tooltip
                  v-show="scope.row.status==1"
                  class="item fr"
                  effect="dark"
                  offset="-10"
                  content="暂停"
                  placement="top-start"
                >
                  <i @click="stop(scope.row)" class="el-icon-self fr el-icon-video-pause"></i>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-tooltip
                  class="item"
                  effect="dark"
                  offset="-20"
                  content="编辑"
                  placement="top-start"
                >
                  <el-button
                    class="confirm"
                    size="mini"
                    @click="editRow(scope.row)"
                    icon="el-icon-edit"
                    type
                  ></el-button>
                </el-tooltip>
                <el-tooltip
                  class="item"
                  effect="dark"
                  offset="-20"
                  content="删除"
                  placement="top-start"
                >
                  <el-button
                    class="danger"
                    @click="deleteRow(scope.row)"
                    icon="el-icon-delete"
                    size="mini"
                    type
                  ></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="block">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage+1"
              :page-sizes="[10, 20, 50]"
              :page-size="size"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalTask"
            ></el-pagination>
          </div>
        </div>
      </div>
      <SubscribeControl v-if="selectType==2"></SubscribeControl>
    </div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="80%"
      style="min-width:1450px!important;"
    >
      <el-form
        ref="groupForm"
        :inline="true"
        :rules="taskRules"
        :model="taskObj"
        label-width="auto"
      >
        <el-form-item style="width:300px;" label="任务名称：" prop="name">
          <el-input v-model.trim="taskObj.name"></el-input>
        </el-form-item>
        <el-form-item label="执行时间：" prop="date">
          <el-radio-group v-model="taskObj.type" class="fl">
            <el-radio style="margin-top:13px;" :label="1">月</el-radio>
            <el-radio style="margin-top:13px;" :label="2">周</el-radio>
            <el-radio style="margin-top:13px;" :label="3">预</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-form-item
            prop="days"
            v-if="taskObj.type==2"
            :rules="[{required:true,message:'日期不能为空',trigger:'blur'}]"
            label
            style="margin-bottom:0;"
            label-width="50px"
          >
            <el-checkbox-group v-model="taskObj.days" @change="updateDom">
              <el-checkbox
                :checked="time.checked"
                v-for="time in weeks"
                :key="time.id"
                :label="time.value"
              >{{time.title}}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item
            v-if="taskObj.type==3"
            label-width="40px"
            label="年"
            prop="year"
            style="margin-bottom:0;"
            :rules="[{required:true,message:'年不能为空',trigger:'blur'}]"
          >
            <el-date-picker
              size="mini"
              style="width:100px"
              v-model="taskObj.year"
              type="year"
              placeholder="选择年"
              value-format="yyyy"
              :picker-options="pickerOptions"
            ></el-date-picker>
          </el-form-item>
          <el-form-item
            v-if="taskObj.type==3"
            label-width="40px"
            label="月"
            prop="month"
            style="margin-bottom:0;"
            :rules="[{required:true,message:'月不能为空',trigger:'blur'}]"
          >
            <el-select
              style="width:80px;"
              @change="updateDom"
              v-model="taskObj.month"
              placeholder="选择月"
            >
              <el-option
                v-for="item in 12"
                :key="item*getUUIDInt()"
                :disabled="item<nowMonth"
                :label="item<10?'0'+item:item+''"
                :value="item+''"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="taskObj.type==1||taskObj.type==3"
            label-width="40px"
            label="日"
            prop="day"
            style="margin-bottom:0;"
            :rules="[{required:true,message:'日不能为空',trigger:'blur'}]"
          >
            <el-select style="width:80px;" @change="updateDom" v-model="taskObj.day" placeholder>
              <el-option
                v-for="item in monthDayNum"
                :key="item*getUUIDInt()"
                :disabled="item<monthDay"
                :label="item<10?'0'+item:item+''"
                :value="item+''"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            prop="hour"
            style="margin-bottom:0;"
            :rules="[{required:true,message:'时不能为空',trigger:'blur'}]"
            label-width="40px"
            label="时"
          >
            <el-select style="width:80px;" v-model="taskObj.hour" placeholder>
              <el-option v-for="item in 24" :key="item*getUUIDInt()" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            prop="minute"
            :rules="[{required:true,message:'分不能为空',trigger:'blur'}]"
            label-width="40px"
            style="margin-bottom:0;"
            label="分"
          >
            <el-select style="width:80px;" v-model="taskObj.minute" placeholder>
              <el-option
                v-for="item in 60"
                :key="item*getUUIDInt()"
                :label="item-1"
                :value="item-1"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form-item>
        <div class="line"></div>
        <el-form-item label="执行对象：" class="has_scroll_item">
          <el-form-item
            v-for="(item,index) in taskObj.invokeParam"
            style="overflow:hidden;display:block;"
            :key="item.id+''+index"
          >
            <el-form-item
              :prop="'invokeParam.'+index+'.selectIds'"
              :rules="[{required:true,message:'变量不能为空',trigger:'blur'}]"
              label
              label-width="0"
            >
              <el-cascader
                :show-all-levels="false"
                style="width:100%;"
                placeholder="选择变量"
                clearable
                v-model="item.selectIds"
                :options="options"
                :props="props"
                :key="getUUIDInt()"
              ></el-cascader>
            </el-form-item>
            <el-form-item
              :prop="'invokeParam.'+index+'.value'"
              :rules="[{required:true,message:'值不能为空',trigger:'blur'}]"
              label="设置值"
              label-width="70px"
            >
              <el-input style="width:100px;" v-model="item.value"></el-input>
            </el-form-item>
            <!-- <el-form-item :prop="'delay'+index"  label="延时" class="fl" style="width:150px" label-width="60px">
              <el-input v-model="item.delay">
                <i slot="suffix" style="padding-right:5px;">ms</i>
              </el-input>
            </el-form-item>-->
            <el-form-item style="margin-left:10px;" label>
              <el-button
                size="mini"
                @click="deleteItem(index)"
                style="margin-left:10px;"
                class="del"
                icon="el-icon-delete"
              >删除</el-button>
            </el-form-item>
            <el-form-item label label-width="0" v-if="index==(taskObj.invokeParam.length-1)">
              <el-button
                size="mini"
                @click="addItem"
                class="success"
                style="margin-left:5px;"
                icon="el-icon-plus"
              >添加</el-button>
            </el-form-item>
          </el-form-item>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button class="cancel" @click="closeDialog('dialogVisible')">取 消</el-button>
        <el-button class="confirm" @click="handleDialog('groupForm')">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="confirmVisible" width="370px">
      <div class="tips-con">
        确认删除&nbsp;
        <mark>{{selectTask.name||'选中的任务'}}&nbsp;</mark>吗？
      </div>
      <div slot="footer">
        <el-button class="cancel" @click="closeDialog('confirmVisible')">取 消</el-button>
        <el-button class="confirm" @click="deleteTask">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MyBreadcrumb from "../subcomponents/Mybreadcrumb";
import SubscribeControl from "@/components/switchControl/SubscribeControl";
// 引入深拷贝
import { deepClone, getUUIDInt, findItemById } from "@/utils/index";
import GLOBAL from "@/utils/global_variable";
export default {
  components: {
    MyBreadcrumb,
    SubscribeControl,
  },
  data() {
    return {
      selectType: 0,
      conHeight: 0,
      keywords: "",
      loading: false,
      taskData: [],
      currentPage: 0,
      size: 10,
      totalTask: 0,
      dialogType: "",
      dialogTitle: "新建任务",
      dialogVisible: false,
      confirmVisible: false,
      selectTask: {},
      selectTaskIds: [],
      taskObj: {
        jobGroup: "JobOne",
        jobName: "",
        date: "",
        type: 1,
        day: "",
        hour: "",
        minute: "",
        year: "",
        month: "",
        days: [],
        site: this.$store.state.site.siteId,
        invokeParam: [
          {
            selectIds: [],
            // delay: "",
            value: "",
            type: 2,
          },
        ],
      },
      //   任务表单验证
      taskRules: {
        name: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
      },
      //   执行对象表单验证
      renderObjRules: {
        code: [{ required: true, message: "请选择变量", trigger: "blur" }],
        value: [{ required: true, message: "请设置值", trigger: "blur" }],
      },
      nowMonth: 1,
      monthDay: 1,
      monthDayNum: 31,
      gatewayOptions: [],
      props: {},
      isShowCascader: true,
      multiSelect: false,
      options: [],
      isResourceShow: 0,
      weeks: [
        { value: "1", title: "日", id: getUUIDInt(), checked: false },
        { value: "2", title: "一", id: getUUIDInt(), checked: false },
        { value: "3", title: "二", id: getUUIDInt(), checked: false },
        { value: "4", title: "三", id: getUUIDInt(), checked: false },
        { value: "5", title: "四", id: getUUIDInt(), checked: false },
        { value: "6", title: "五", id: getUUIDInt(), checked: false },
        { value: "7", title: "六", id: getUUIDInt(), checked: false },
      ],
      pickerOptions: {
        disabledDate(time) {
          //此条为设置禁止用户选择今天之前的日期，包含今天。
          // return time.getTime() <= (Date.now()-(24 * 60 * 60 * 1000));
          //此条为设置禁止用户选择今天之前的日期，包含今天。
          return time.getTime() <= Date.now();
        },
      },
    };
  },
  computed: {
    watchSiteChange() {
      return this.$store.state.site.siteId;
    },
    getYear: function () {
      return this.taskObj.year;
    },
    getMonth: function () {
      return this.taskObj.month;
    },
  },
  watch: {
    watchSiteChange() {
      this.resetData();
      this.getData();
      this.getOptions();
    },
    getYear: {
      handler: function (newValue) {
        //do something
        console.log(newValue);
        if (newValue == new Date().getFullYear()) {
          this.nowMonth = new Date().getMonth() + 1;
          this.monthDay = new Date().getDate();
        } else {
          this.nowMonth = 1;
          this.monthDay = 1;
        }
      },
    },
  },
  created() {
    this.props = {
      children: "switchVars",
      label: "name",
      value: "id",
      emitPath: true,
      expandTrigger: "hover",
    };
    this.getOptions();
    this.getUUIDInt = getUUIDInt;
    this.resetData();
    this.getData();
  },
  mounted() {
    this.$nextTick(() => {
      this.conHeight = this.$refs.conBox.offsetHeight - 158;
    });
    window.addEventListener("resize", () => {
      this.$nextTick(() => {
        this.conHeight = this.$refs.conBox.offsetHeight - 158;
      });
    });
  },
  methods: {
    //   获取options
    getOptions() {
      this.$http
        .get("equipment/job/allVars", {
          params: {
            site: this.watchSiteChange,
          },
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.isResourceShow++;
            this.options = res.data.data;
            this.options.forEach((item) => {
              item.leaf = false;
              if (item.switchVars && item.switchVars.length) {
                item.switchVars.forEach((el) => {
                  el.id = el.code;
                  el.leaf = true;
                });
              }
            });
          } else {
            this.options = [];
          }
        });
    },
    //   清空条件
    resetData() {
      this.keywords = "";
      this.selectType = 0;
      this.taskObj = {
        jobGroup: "JobOne",
        name: "",
        date: "",
        type: 1,
        year: "",
        month: "",
        day: "",
        hour: "",
        minute: "",
        days: [],
        site: this.watchSiteChange,
        invokeParam: [
          {
            selectIds: [],
            // delay: "",
            value: "",
            type: 2, //定时任务类型
          },
        ],
      };
      this.currentPage = 0;
      this.size = 10;
    },
    //   处理按周展示时间
    handerWeek(week) {
      let str = "";
      let reg = /,$/gi;
      week.forEach((item) => {
        let num = "";
        this.weeks.forEach((el) => {
          if (el.value == item) {
            num = el.title;
            return;
          }
        });
        str += "周" + num + ",";
      });

      str = str.replace(reg, "");
      return str;
    },
    //   获取任务信息
    getData() {
      this.$http
        .get("equipment/findAll", {
          params: {
            name: this.keywords,
            site: this.watchSiteChange,
            page: this.currentPage,
            size: this.size,
          },
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.taskData = res.data.data.appQuartzVOS;
            this.totalTask = res.data.data.total;
            this.taskData.forEach((item) => {
              let hour = item.hour < 10 ? "0" + item.hour : item.hour;
              let minute = item.minute < 10 ? "0" + item.minute : item.minute;
              item.invokeParam = item.jobVOS;
              if (item.type == 1) {
                item.renderTime =
                  "每月" +
                  (item.date < 10 ? "0" + item.date : item.date) +
                  "日 " +
                  hour +
                  ":" +
                  minute +
                  ":00";
              } else if (item.type == 2) {
                item.renderTime =
                  "每周 " +
                  this.handerWeek(item.date.split(",")) +
                  " " +
                  hour +
                  ":" +
                  minute +
                  ":00";
              } else if (item.type == 3) {
                item.renderTime =
                  item.year +
                  "年" +
                  (item.month < 10 ? "0" + item.month : item.month) +
                  "月" +
                  (item.date < 10 ? "0" + item.date : item.date) +
                  "日 " +
                  hour +
                  ":" +
                  minute +
                  ":00";
              }
            });
          } else {
            this.taskData = [];
            this.totalTask = 0;
          }
        });
    },
    // 刷新dom
    updateDom() {
      console.log("刷新");
      var type = this.taskObj.type;
      this.taskObj.type = "111";
      this.$nextTick(() => {
        this.taskObj.type = type;
        this.$forceUpdate();
      });
    },
    // 播放
    play(row) {
      this.$http
        .post("equipment/resumeJob", {
          quartzIds: row.quartzId,
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$notify({
              message: "已恢复",
              type: "success",
            });
            row.status = 1;
            this.$forceUpdate();
          } else {
            this.$notify({
              message: res.data.msg,
              type: "error",
            });
          }
        });
    },
    // 暂停
    stop(row) {
      this.$http
        .post("equipment/pauseJob", {
          quartzIds: row.quartzId,
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$notify({
              message: "已暂停",
              type: "success",
            });
            row.status = 0;
            this.$forceUpdate();
          } else {
            this.$notify({
              message: res.data.msg,
              type: "error",
            });
          }
        });
    },
    //   切换tab
    changeSelectType(value) {
      this.resetData();
      this.selectType = value;
      if (this.selectType == 0) {
        this.getData();
      }
    },
    //   搜索任务
    search() {
      this.currentPage = 0;
      this.getData();
    },
    handleSelectionChange(val) {
      this.selectTaskIds = [];
      val.forEach((item) => {
        this.selectTaskIds.push(item.quartzId);
      });
    },
    // 分页大小改变
    handleSizeChange(val) {
      this.size = val;
      this.currentPage = 0;
      this.getData();
    },
    // 分页改变
    handleCurrentChange(val) {
      this.currentPage = val - 1;
      this.getData();
    },
    // ---编辑行
    editRow(row) {
      this.$http
        .get("equipment/detail", {
          params: {
            quartzId: row.quartzId,
          },
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.taskObj = res.data.data;
            this.taskObj.invokeParam = this.taskObj.jobVOS;
            if (this.taskObj.type == 1) {
              this.taskObj.day = this.taskObj.date;
              this.taskObj.days = [];
            } else if (this.taskObj.type == 2) {
              this.taskObj.days = this.taskObj.date.split(",");
              this.taskObj.day = "";
            }else if(this.taskObj.type == 3){
              this.taskObj.day = this.taskObj.date;
              this.taskObj.days = [];
            }
            this.taskObj.invokeParam.forEach((item) => {
              item.selectIds = [item.classifyId, item.code];
            });
          } else {
            this.taskObj = {
              jobGroup: "JobOne",
              name: "",
              date: "",
              type: 1,
              day: "",
              year: "",
              month: "",
              hour: "",
              minute: "",
              days: [],
              site: this.watchSiteChange,
              invokeParam: [
                {
                  selectIds: [],
                  // delay: "",
                  value: "",
                  type: 2, //定时任务类型
                },
              ],
            };
          }
        });
      this.showDialog("edit");
    },
    // 删除任务
    deleteTask() {
      this.$http
        .post("equipment/deletJob", { quartzIds: this.selectTaskIds.join(",") })
        .then((res) => {
          if (res.data.code === 0) {
            this.$notify({
              message: "删除成功",
              type: "success",
            });
            this.closeDialog("confirmVisible");

            this.search();
          } else {
            this.$notify({
              message: res.data.msg,
              type: "error",
            });
          }
          this.selectTask = {};
          this.selectTaskIds = [];
        });
    },
    // -=--删除任务行
    deleteRow(row) {
      this.selectTask = row;
      this.selectTaskIds = [row.quartzId];
      this.showDialog("delete");
    },
    // 展示dialog
    showDialog(type) {
      this.dialogType = type;
      if (type === "add") {
        this.dialogTitle = "新建任务";
        this.taskObj = {
          jobGroup: "JobOne",
          name: "",
          date: "",
          type: 1,
          day: "",
          year: "",
          month: "",
          hour: "",
          minute: "",
          days: [],
          site: this.watchSiteChange,
          invokeParam: [
            {
              selectIds: [],
              // delay: "",
              value: "",
              type: 2,
            },
          ],
        };
        this.dialogVisible = true;
      } else if (type === "edit") {
        this.dialogTitle = "编辑任务";
        this.dialogVisible = true;
      } else if (type === "delete") {
        if (!this.selectTaskIds.length) {
          this.$notify({
            message: "没有选中任务",
            type: "warning",
          });
          return;
        }
        this.confirmVisible = true;
      }
      if (this.dialogVisible) {
      }
    },
    // 关闭dialog
    closeDialog(name) {
      if (name == "dialogVisible") {
        this.taskObj = {
          jobGroup: "JobOne",
          name: "",
          date: "",
          type: 1,
          year: "",
          month: "",
          day: "",
          hour: "",
          minute: "",
          days: [],
          site: this.watchSiteChange,
          invokeParam: [
            {
              // delay: "",
              value: "",
              selectIds: [],
              type: 2,
            },
          ],
        };
        this.currentPage = 0;
        this.size = 10;
        this.getData();
      } else if (name == "confirmVisible") {
        this.selectTask = {};
      }
      this[name] = false;
    },
    // 处理表单提交
    handleDialog(formName) {
      console.log(this.$refs.groupForm);
      this.$refs.groupForm.validate((valid) => {
        if (valid) {
          if (this.taskObj.type === 1) {
            this.taskObj.date = this.taskObj.day;
          } else if (this.taskObj.type === 2) {
            this.taskObj.date = this.taskObj.days.join(",");
          } else if (this.taskObj.type === 3) {
            this.taskObj.date = this.taskObj.day;
          }

          this.taskObj.startTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
          this.taskObj.invokeParam.forEach((item, index) => {
            let group = findItemById(item.selectIds[0], this.options) || {};
            let variate =
              findItemById(item.selectIds[1], group.switchVars) || {};
            item.gatewayId = variate.gatewayId;
            item.classifyId = group.id;
            item.classify = group.name;
            item.code = variate.code;
            item.gatewayName = variate.gatewayName;
            item.equipmentId = variate.equipmentId;
            item.equipmentName = variate.equipmentName;
            item.varName = variate.name;
            delete item.selectIds;
          });
          this.updateJob(deepClone(this.taskObj), this.dialogType);
        } else {
          return false;
        }
      });
    },
    // 修改任务
    updateJob(obj, type) {
      let url = "",
        message = "";
      if (type == "add") {
        url = "/addJob";
        message = "新建成功";
      } else if (type == "edit") {
        url = "/modifyJob";
        message = "修改成功";
      }
      delete obj.jobVOS;
      delete obj.days;
      delete obj.day;
      obj.invokeParam = JSON.stringify(obj.invokeParam);
      this.$http.post("equipment" + url, obj).then((res) => {
        if (res.data.code === 0) {
          this.$notify({
            message: message,
            type: "success",
          });
          this.closeDialog("dialogVisible");
        } else {
          this.$notify({
            message: res.data.msg,
            type: "error",
          });
        }
      });
    },
    // 删除行
    deleteItem(index) {
      this.taskObj.invokeParam.splice(index, 1);
      this.$forceUpdate();
    },
    // 添加行
    addItem() {
      this.taskObj.invokeParam.push({
        selectIds: [],
        // delay: "",
        value: "",
        type: 2,
      });
      this.$forceUpdate();
    },
  },
};
</script>

<style scoped lang="less">
@import "~@/assets/css/index.less";
.child-con {
  .el-tabs {
    background: @content-bgc;
    .el-tabs__nav {
      border: none !important;
    }
    .el-tabs--card > .el-tabs__header .el-tabs__item {
      border: none !important;
      background-color: @table-hover!important;
    }
    .el-tabs--card > .el-tabs__header .is-active {
      border: none !important;
      background-color: @table-hover!important;
    }
  }
  .el-tabs--card > .el-tabs__header {
    border: none;
  }
  .el-tabs__content {
    padding: 10px;
  }
  .con_box {
    padding: 10px;
    .top_box {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card_con {
      padding: 10px 0;
      padding-bottom: 0;
    }
    // 分页
    .block {
      width: 100%;
      height: 40px;
      padding-bottom: 0;
      /deep/ .el-pagination {
        float: right;
        text-align: right;
      }
    }
  }
  .tab_group {
    height: 3rem;
    @flex-r();
    align-items: center;
    margin-bottom: 10px;
    transition: 200ms;
    .tab_item {
      //   position:relative;
      height: 100%;
      padding: 0 10px;
      cursor: pointer;
      background: #54657d;
      img,
      span {
        line-height: 3rem;
        text-align: center;
        vertical-align: middle;
        padding: 0 10px;
      }
      img {
        width: 1rem;
        height: 1rem;
        margin-right: 5px;
      }
    }
    .first_tab {
      border-radius: 5px 0 0 5px;
    }
    .last_tab {
      border-radius: 0 5px 5px 0;
    }
    .actived_tab {
      color: #f5a623;
      background: #435c70;
    }
  }
  /deep/ .el-icon {
    font-size: 16px;
    cursor: pointer;
    line-height: 28px;
  }
}
.line {
  width: 100%;
  height: 1px;
  background: #ccc;
  margin-bottom: 10px;
}
</style>
