<template>
  <div class="child-page">
    <!-- 面包屑 -->
    <MyBreadcrumb level1="开关控制" :level2="selectType==0?'定时控制':'预约控制'" />
    <div class="child-con" ref="conBox">
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
        <el-radio-button icon="el-icon-date" :label="1">预约控制</el-radio-button>
      </el-radio-group>
      <div class="con_box inner">
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
          <el-button
            size="mini"
            class="confirm"
            style="margin-left:5px;"
            icon="el-icon-plus"
            @click="showDialog('add')"
          >新建任务</el-button>
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
          >
            <el-table-column type="index" label="序号" width="50"></el-table-column>
            <el-table-column prop="name" label="任务名称"></el-table-column>
            <el-table-column prop="time" label="执行时间">
              <template slot-scope="scope">
                <span>{{scope.row.time}}&nbsp;&nbsp;&nbsp;</span>
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
                    icon="el-icon-edit"
                    size="mini"
                    class="confirm"
                    @click="editRow(scope.row)"
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
                    icon="el-icon-delete"
                    size="mini"
                    class="del"
                    @click="deleteRow(scope.row)"
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
              :current-page="currentPage"
              :page-sizes="[10, 20, 50]"
              :page-size="size"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalTask"
            ></el-pagination>
          </div>
        </div>
      </div>
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="70%">
      <el-form ref="groupForm" :rules="taskRules" :model="taskObj" label-width="auto">
        <el-form-item style="width:300px;" label="任务名称：" prop="jobName">
          <el-input v-model.trim="taskObj.jobName"></el-input>
        </el-form-item>
        <el-form-item label="执行时间：" prop="date">
          <el-radio class="fl" style="margin-top:13px;" v-model="taskObj.type" :label="1">月</el-radio>
          <el-radio class="fl" style="margin-top:13px;" v-model="taskObj.type" :label="2">周</el-radio>
          <el-form-item
            class="fl"
            prop="days"
            v-show="taskObj.type==2"
            :rules="[{required:taskObj.type==2,message:'日期不能为空',trigger:'blur'}]"
            label
            label-width="20px"
          >
            <el-checkbox-group v-model="taskObj.days">
              <el-checkbox label="1" name="days">一</el-checkbox>
              <el-checkbox label="2" name="days">二</el-checkbox>
              <el-checkbox label="3" name="days">三</el-checkbox>
              <el-checkbox label="4" name="days">四</el-checkbox>
              <el-checkbox label="5" name="days">五</el-checkbox>
              <el-checkbox label="6" name="days">六</el-checkbox>
              <el-checkbox label="7" name="days">日</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item
            v-show="taskObj.type==1"
            style="width:120px;"
            label-width="50px"
            label="日"
            class="fl"
            prop="day"
            :rules="[{required:taskObj.type===1,message:'日不能为空',trigger:'blur'}]"
          >
            <el-select v-model="taskObj.day" placeholder>
              <el-option v-for="item in 31" :key="item*getUUIDInt()" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            prop="hour"
            style="width:120px;"
            :rules="[{required:true,message:'时不能为空',trigger:'blur'}]"
            label-width="50px"
            label="时"
            class="fl"
          >
            <el-select v-model="taskObj.hour" placeholder>
              <el-option v-for="item in 24" :key="item*getUUIDInt()" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            prop="minute"
            :rules="[{required:true,message:'分不能为空',trigger:'blur'}]"
            style="width:120px;"
            label-width="50px"
            label="分"
            class="fl"
          >
            <el-select v-model="taskObj.minute" placeholder>
              <el-option
                v-for="item in 60"
                :key="item*getUUIDInt()"
                :label="item-1"
                :value="item-1"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form-item>
        <el-form-item label="执行对象：">
          <div v-for="(item,index) in taskObj.invokeParam" style="overflow:hidden;" :key="item.id">
            <el-form-item
              :prop="'invokeParam.'+index+'.code'"
              :rules="[{required:true,message:'变量不能为空',trigger:'blur'}]"
              label
              style="width:250px;"
              class="fl"
              label-width="0"
            >
              <el-cascader
                style="width:100%;"
                placeholder="选择变量"
                clearable
                v-model="item.code"
                :props="props"
                v-if="isShowCascader"
              ></el-cascader>
            </el-form-item>
            <el-form-item
              :prop="'invokeParam.'+index+'.value'"
              :rules="[{required:true,message:'值不能为空',trigger:'blur'}]"
              label="设置值"
              class="fl"
              style="width:150px"
              label-width="70px"
            >
              <el-input v-model="item.value"></el-input>
            </el-form-item>
            <!-- <el-form-item :prop="'delay'+index"  label="延时" class="fl" style="width:150px" label-width="60px">
              <el-input v-model="item.delay">
                <i slot="suffix" style="padding-right:5px;">ms</i>
              </el-input>
            </el-form-item>-->
            <el-form-item class="fl" style="margin-left:10px;" label>
              <el-button
                size="mini"
                @click="deleteItem(index)"
                style="margin-left:10px;"
                class="del"
                icon="el-icon-delete"
              >删除</el-button>
            </el-form-item>
          </div>
          <el-form-item label label-width="0">
            <el-button
              size="mini"
              @click="addItem"
              class="success"
              style="margin-left:5px;"
              icon="el-icon-plus"
            >添加</el-button>
          </el-form-item>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button class="cancel" @click="closeDialog">取 消</el-button>
        <el-button class="confirm" @click="handleDialog('groupForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MyBreadcrumb from "../subcomponents/Mybreadcrumb";
// 引入深拷贝
import { deepClone, getUUIDInt } from "@/utils/index";
import GLOBAL from "@/utils/global_variable";
export default {
  components: {
    MyBreadcrumb,
  },
  data() {
    return {
      selectType: 0,
      conHeight: 0,
      keywords: "",
      loading: false,
      taskData: [],
      currentPage: 1,
      size: 10,
      totalTask: 0,
      dialogType: "",
      dialogTitle: "新建任务",
      dialogVisible: false,
      taskObj: {
        jobGroup: "JobOne",
        jobName: "",
        date: "",
        type: 1,
        day: "",
        hour: "",
        minute: "",
        days: [],
        invokeParam: [
          {
            code: "",
            // delay: "",
            value: "",
            gatewayId: this.$store.state.site.siteId,
            type: 2,
          },
        ],
      },
      //   任务表单验证
      taskRules: {
        jobName: [
          { required: true, message: "请输入任务名称", trigger: "blur" },
        ],
      },
      //   执行对象表单验证
      renderObjRules: {
        code: [{ required: true, message: "请选择变量", trigger: "blur" }],
        value: [{ required: true, message: "请设置值", trigger: "blur" }],
      },
      gatewayOptions: [],
      props: {
        lazy: true,
        expandTrigger: "hover",
        siteId: this.$store.state.site.siteId,
        $http: this.$http,
        emitPath: false,
        lazyLoad(node, resolve) {
          const { level } = node;
          let nodes = [];
          if (level === 0) {
            this.$http
              .get("equipment/switchClassify/findAll", {
                params: {
                  site: this.siteId,
                },
              })
              .then((res) => {
                if (res.data.code === 0) {
                  nodes = res.data.data.map((item) => ({
                    value: item.id,
                    label: item.name,
                    leaf: level >= 1,
                  }));
                  // 通过调用resolve将子节点数据返回，通知组件数据加载完成
                  resolve(nodes);
                }
              });
          } else if (level === 1) {
            this.$http
              .get("equipment/switchClassify/detail", {
                params: {
                  id: node.value,
                },
              })
              .then((res) => {
                if (res.data.code === 0) {
                  nodes = res.data.data.map((item) => ({
                    value: item.code,
                    label: item.name,
                    leaf: level >= 1,
                  }));
                  // 通过调用resolve将子节点数据返回，通知组件数据加载完成
                  resolve(nodes);
                }
              });
          } else {
            resolve(nodes);
          }
        },
      },
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
      this.getData();
    },
  },
  created() {
    this.getUUIDInt = getUUIDInt;
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
    //   获取任务信息
    getData() {},
    //   切换tab
    changeSelectType(value) {
      this.selectType=value;
      this.taskData = [];
      this.keywords = "";
    },
    //   搜索任务
    search() {},
    //   新建任务
    addWork() {},
    // 分页大小改变
    handleSizeChange(val) {
      this.size = val;
      this.currentPage = 1;
    },
    // 分页改变
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    // ---编辑行
    editRow(row) {},
    // -=--删除行
    deleteRow(row) {},
    // 展示dialog
    showDialog(type) {
      this.dialogType = type;
      if (type === "add") {
        this.dialogTitle = "新建任务";
      } else if (type === "edit") {
        this.dialogTitle = "编辑任务";
      }
      this.dialogVisible = true;
    },
    // 关闭dialog
    closeDialog() {
      this.dialogVisible = false;
      this.taskObj = {
        jobGroup: "jobOne",
        jobName: "",
        date: "",
        type: 1,
        day: "",
        hour: "",
        minute: "",
        days: [],
        invokeParam: [
          {
            code: "",
            // delay: "",
            value: "",
            gatewayId: this.$store.state.site.siteId,
            type: 2,
          },
        ],
      };
    },
    // 处理表单提交
    handleDialog(formName) {
      this.$refs.groupForm.validate((valid) => {
        console.log(this.taskObj);
        if (valid) {
          if (this.taskObj.type === 1) {
            this.taskObj.date = this.taskObj.day;
          } else {
            this.taskObj.date = this.taskObj.days.join(",");
          }
          this.taskObj.startTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
          this.addTask(deepClone(this.taskObj));
        } else {
          return false;
        }
      });
    },
    // 添加任务
    addTask(obj) {
      obj.invokeParam = JSON.stringify(obj.invokeParam);
      this.$http.post("equipment/addJob", obj).then((res) => {
        if (res.data.code === 0) {
          this.$notify({
            message: "新建成功",
            type: "success",
          });
          this.closeDialog();
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
    },
    // 添加行
    addItem() {
      this.taskObj.invokeParam.push({
        code: "",
        // delay: "",
        value: "",
        gatewayId: this.watchSiteChange,
        type: 2,
      });
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
}
</style>
