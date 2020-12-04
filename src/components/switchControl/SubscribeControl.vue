<template>
  <div class="child-page">
    <div class="child-con whiteBox">
      <div class="inner config_box">
        <div class="header titleBox">
          <p class="title fl">实时任务配置</p>
          <el-button
            type="primary"
            icon="el-icon-plus"
            class="confirm fr"
            @click="showDialog('add')"
            >新建任务</el-button
          >
        </div>
        <div class="con_box" ref="conBox1">
          <div class="shadow">
            <el-table
              border
              :max-height="conHeight1"
              :data="confData"
              class="variable-table"
              v-loading="confLoading"
              style
              size="mini"
              stripe
            >
              <el-table-column
                type="index"
                label="序号"
                width="50"
              ></el-table-column>
              <el-table-column prop="name" label="任务名称"></el-table-column>
              <el-table-column
                prop="varName"
                label="变量名称"
              ></el-table-column>
              <el-table-column
                prop="classify"
                label="所属分组"
              ></el-table-column>
              <el-table-column
                prop="equipmentName"
                label="所属设备"
              ></el-table-column>
              <el-table-column prop="value" label="修改值"></el-table-column>
              <el-table-column prop="unit" label="单位"></el-table-column>
              <!-- <el-table-column prop="name" label="单位"></el-table-column> -->
              <el-table-column label="操作" width="200">
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
                      icon="el-icon-edit"
                      @click="edit(scope.row)"
                      size="mini"
                    ></el-button>
                    <!-- <i
                    style="color:#F5A623;cursor:pointer;"
                    @click="edit(scope.row)"
                    class="el-icon-self el-icon-edit"
                  ></i>-->
                  </el-tooltip>
                  <!-- <p class="icon-line"></p> -->
                  <el-tooltip
                    class="item"
                    effect="dark"
                    offset="-20"
                    content="启动"
                    placement="top-start"
                  >
                    <el-button
                      class="success"
                      icon="el-icon-video-play"
                      @click="play(scope.row)"
                      size="mini"
                    ></el-button>
                    <!-- <i
                    @click="play(scope.row)"
                    style="cursor:pointer;"
                    class="el-icon-self el-icon-video-play"
                  ></i>-->
                  </el-tooltip>
                  <!-- <p class="icon-line"></p> -->
                  <el-tooltip
                    class="item"
                    effect="dark"
                    offset="-20"
                    content="删除"
                    placement="top-start"
                  >
                    <el-button
                      class="del"
                      icon="el-icon-delete"
                      @click="del(scope.row)"
                      size="mini"
                    ></el-button>
                    <!-- <i
                    @click="del(scope.row)"
                    style="color:red;cursor:pointer;"
                    class="el-icon-self el-icon-delete"
                  ></i>-->
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="block">
              <el-pagination
                @size-change="handleConfSizeChange"
                @current-change="handleConfCurrentChange"
                :current-page="confCurrentPage + 1"
                :page-sizes="[5, 10, 20, 50]"
                :page-size="confSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalConf"
              ></el-pagination>
            </div>
          </div>
        </div>
      </div>
      <div class="inner history_box">
        <div class="header titleBox">
          <p class="title">实时任务记录</p>
        </div>
        <div class="con_box" ref="conBox2">
          <div class="shadow">
            <el-table
              border
              :max-height="conHeight2"
              :data="historyData"
              class="variable-table"
              v-loading="historyLoading"
              style
              size="mini"
              stripe
            >
              <el-table-column
                type="index"
                label="序号"
                width="50"
              ></el-table-column>
              <el-table-column
                prop="jobName"
                label="任务名称"
              ></el-table-column>
              <el-table-column
                prop="varName"
                label="执行对象"
              ></el-table-column>
              <!-- <el-table-column prop="equipmentName" label="原始值"></el-table-column> -->
              <el-table-column prop="value" label="修改值"></el-table-column>
              <el-table-column prop="unit" label="单位"></el-table-column>
              <el-table-column
                prop="started"
                label="执行时间"
              ></el-table-column>
              <el-table-column
                prop="startUser"
                label="执行人"
              ></el-table-column>
              <el-table-column prop="status" label="任务状态">
                <template slot-scope="scope">
                  <!-- el-icon-success -->
                  <i
                    style="color: #3faaa3"
                    v-show="scope.row.status == 2"
                    class="el-icon-self el-icon-success"
                  ></i>
                  <!-- el-icon-warning -->
                  <i
                    style="color: #e16a67"
                    v-show="scope.row.status == 3"
                    class="el-icon-self el-icon-warning"
                  ></i>
                  <!-- el-icon-loading -->
                  <i
                    style="color: #fff"
                    v-show="scope.row.status == 1"
                    class="el-icon-self el-icon-loading"
                  ></i>
                  <span>{{
                    scope.row.status == 1
                      ? "执行中"
                      : scope.row.status == 2
                      ? "成功"
                      : "失败"
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="msg" label="备注"></el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="block">
              <el-pagination
                @size-change="handleHistorySizeChange"
                @current-change="handleHistoryCurrentChange"
                :current-page="historyCurrentPage + 1"
                :page-sizes="[5, 10, 20, 50]"
                :page-size="historySize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalHistory"
              ></el-pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 新建任务 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="70%">
      <el-form ref="groupForm" :model="taskObj" label-width="auto">
        <el-form-item
          style="width: 300px"
          label="任务名称："
          prop="name"
          :rules="[
            { required: true, message: '请输入任务名称', trigger: 'blur' },
          ]"
        >
          <el-input v-model.trim="taskObj.name"></el-input>
        </el-form-item>
        <el-form-item label="执行对象：">
          <el-form-item
            prop="selectIds"
            :rules="[
              { required: true, message: '变量不能为空', trigger: 'blur' },
            ]"
            label
            style="width: 250px"
            class="fl"
            label-width="0"
          >
            <el-cascader
              :show-all-levels="false"
              style="width: 100%"
              placeholder="选择变量"
              clearable
              v-model="taskObj.selectIds"
              :props="props"
              :options="options"
            ></el-cascader>
          </el-form-item>
          <el-form-item
            :prop="'value'"
            :rules="[
              { required: true, message: '值不能为空', trigger: 'blur' },
            ]"
            label="设置值"
            class="fl"
            style="width: 150px"
            label-width="70px"
          >
            <el-input type="number" v-model="taskObj.value"></el-input>
          </el-form-item>
          <!-- <el-form-item :prop="'delay'+index"  label="延时" class="fl" style="width:150px" label-width="60px">
              <el-input v-model="item.delay">
                <i slot="suffix" style="padding-right:5px;">ms</i>
              </el-input>
          </el-form-item>-->
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button class="cancel" @click="closeDialog('dialogVisible')"
          >取 消</el-button
        >
        <el-button class="confirm" @click="handleDialog('groupForm')"
          >确 定</el-button
        >
      </div>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="confirmVisible" width="370px">
      <div class="tips-con">
        确认删除&nbsp;
        <mark>{{ taskObj.name }}&nbsp;</mark>吗？
      </div>
      <div slot="footer">
        <el-button class="cancel" @click="closeDialog('confirmVisible')"
          >取 消</el-button
        >
        <el-button class="confirm" @click="deleteTask">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MyBreadcrumb from "../subcomponents/Mybreadcrumb";
// 引入深拷贝
import { deepClone, getUUIDInt, findItemById } from "@/utils/index";
export default {
  components: {
    MyBreadcrumb,
  },
  data() {
    return {
      conHeight1: 0,
      conHeight2: 0,
      selectType: "0",
      confData: [],
      historyData: [],
      confLoading: false,
      confCurrentPage: 0,
      confSize: 5,
      totalConf: 0,
      historyLoading: false,
      historyCurrentPage: 0,
      historySize: 5,
      totalHistory: 0,
      options: [],
      searchObj: {},
      dialogType: "",
      dialogTitle: "新建任务",
      dialogVisible: false,
      confirmVisible: false,
      taskObj: {},
      props: {},
      isShowCascader: true,
    };
  },
  computed: {
    watchSiteChange() {
      return this.$store.state.site.siteId;
    },
  },
  watch: {
    watchSiteChange() {
      this.getOptions();
      this.searchConf();
      this.searchHistory();
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
    this.searchConf();
    this.searchHistory();
  },
  mounted() {
    this.$nextTick(() => {
      this.conHeight1 = this.$refs.conBox1.offsetHeight - 58;
      this.conHeight2 = this.$refs.conBox2.offsetHeight - 58;
    });
    window.addEventListener("resize", () => {
      this.$nextTick(() => {
        this.conHeight1 = this.$refs.conBox1.offsetHeight - 58;
        this.conHeight2 = this.$refs.conBox2.offsetHeight - 58;
      });
    });
  },
  methods: {
    // 请求所有配置
    searchConf() {
      this.$http
        .get("equipment/jobConf/findAll", {
          params: {
            site: this.watchSiteChange,
            name: this.searchKeywords,
            page: this.confCurrentPage,
            size: this.confSize,
          },
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.totalConf = res.data.data.total;
            this.confData = res.data.data.jobConfigs;
            this.$forceUpdate();
          }
        });
    },
    // 请求所有记录
    searchHistory() {
      this.$http
        .get("equipment/jobLog/getLogs", {
          params: {
            site: this.watchSiteChange,
            name: this.searchKeywords,
            page: this.historyCurrentPage,
            size: this.historySize,
            type: 1,
          },
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.totalHistory = res.data.data.total;
            this.historyData = res.data.data.jobLogs;
            this.historyData.forEach((item) => {
              if (item.jobObject) {
                item.varName = JSON.parse(item.jobObject)[0].varName || "";
                item.value = JSON.parse(item.jobObject)[0].value || "";
                item.unit = JSON.parse(item.jobObject)[0].unit || "";
              } else {
                item.varName = "";
                item.value = "";
                item.unit = "";
              }
            });
          }
        });
    },
    // 播放
    play(row) {
      this.$http
        .post("equipment/jobLog/newJob", {
          quartzId: row.id,
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$notify({
              message: "已启动",
              type: "success",
            });
            this.searchHistory();
          } else {
            this.$notify({
              message: res.data.msg,
              type: "error",
            });
          }
        });
    },
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
    // 分页大小改变
    handleConfSizeChange(val) {
      this.confSize = val;
      this.confCurrentPage = 0;
      this.searchConf();
    },
    // 分页改变
    handleConfCurrentChange(val) {
      this.confCurrentPage = val - 1;
      this.searchConf();
    },
    // 分页大小改变
    handleHistorySizeChange(val) {
      this.historySize = val;
      this.historyCurrentPage = 0;
      this.searchHistory();
    },
    // 分页改变
    handleHistoryCurrentChange(val) {
      this.historyCurrentPage = val - 1;
      this.searchHistory();
    },
    // 展示dialog
    showDialog(type) {
      this.dialogType = type;
      if (type === "add") {
        this.dialogTitle = "新建任务";
        this.dialogVisible = true;
      } else if (type === "edit") {
        this.dialogTitle = "编辑任务";
        this.dialogVisible = true;
      } else if (type === "del") {
        this.confirmVisible = true;
        this.dialogVisible = false;
      }
    },
    // 关闭dialog
    closeDialog(name) {
      this[name] = false;
      this.taskObj = {};
    },
    // 处理表单提交
    handleDialog(formName) {
      this.$refs.groupForm.validate((valid) => {
        console.log(this.taskObj);
        if (valid) {
          let group =
            findItemById(this.taskObj.selectIds[0], this.options) || {};
          let variate =
            findItemById(this.taskObj.selectIds[1], group.switchVars) || {};
          this.taskObj.gatewayId = variate.gatewayId;
          this.taskObj.classifyId = group.id;
          this.taskObj.classify = group.name;
          this.taskObj.varCode = variate.code;
          this.taskObj.gatewayName = variate.gatewayName;
          this.taskObj.equipmentId = variate.equipmentId;
          this.taskObj.equipmentName = variate.equipmentName;
          this.taskObj.varName = variate.name;
          this.taskObj.startTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
          this.taskObj.site = this.watchSiteChange;
          this.taskObj.type = 1;
          this.updateJob(deepClone(this.taskObj), this.dialogType);
        } else {
          return false;
        }
      });
    },
    updateJob(obj, type) {
      let url = "",
        message = "";
      if (type == "add") {
        url = "/jobConf/add";
        message = "新建成功";
      } else if (type == "edit") {
        url = "/jobConf/modify";
        message = "修改成功";
      } else if (type == "del") {
        url = "/jobConf/remove";
        message = "删除成功";
      }
      delete obj.selectIds;
      this.$http.post("equipment" + url, obj).then((res) => {
        if (res.data.code === 0) {
          this.$notify({
            message: message,
            type: "success",
          });
          if (type == "del") {
            this.closeDialog("confirmVisible");
          } else {
            this.closeDialog("dialogVisible");
          }
          this.searchConf();
        } else {
          this.$notify({
            message: res.data.msg,
            type: "error",
          });
        }
      });
    },
    // 编辑任务
    edit(row) {
      this.$http
        .get("equipment/jobConf/detail", {
          params: {
            id: row.id,
          },
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.taskObj = res.data.data;
            this.taskObj.selectIds = [
              this.taskObj.classifyId,
              this.taskObj.varCode,
            ];
          } else {
            this.taskObj = {};
          }
        });
      this.showDialog("edit");
    },
    // 删除任务
    del(row) {
      this.taskObj = row;
      this.showDialog("del");
    },
    deleteTask() {
      this.updateJob(this.taskObj, this.dialogType);
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../assets/css/index.less";
.child-page {
  height:calc(100% - 36px);
  .child-con {
    top: 0;
  }
  .inner {
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    bottom: 10px;
    padding: 10px;
  }
  .config_box {
    bottom: 50%;
    margin-bottom: 10px;
  }
  .history_box {
    top: 50%;
  }
  .header {
    position: absolute;
    height: 52px;
    top: 0;
    left: 0;
    right: 0;
    background: #54657d;
    .title {
      line-height: 52px;
      padding-left: 10px;
    }
    button {
      margin-right: 10px;
      margin-top: 9px;
    }
  }
  .con_box {
    position: absolute;
    top: 52px;
    bottom: 10px;
    left: 0;
    right: 0;
    // 分页
    .block {
      width: 100%;
      padding-bottom: 0;
      /deep/ .el-pagination {
        float: right;
        text-align: right;
      }
    }
  }
  .searchForm {
    padding: 0 !important;
    height: 30px;
    float: right;
    width: 60%;
    overflow: hidden;
    /deep/ .el-form-item {
      width: 22%;
      height: 100%;
      float: right;
    }
    /deep/ .el-date-editor {
      width: 100%;
    }
    /deep/ .el-input__inner {
      height: 30px !important;
      line-height: 30px !important;
    }
    /deep/ .el-form-item__content {
      height: 100%;
      line-height: 1;
    }
    /deep/ .el-input__icon {
      line-height: 1;
    }
  }
}
// .shadow{
//   margin:5px;
// }
.inner{
  box-shadow: none;
  background:#fff;
}
</style>