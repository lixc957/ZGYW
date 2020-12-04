<template>
  <div class="child-page">
    <MyBreadcrumb level1="参数设置" level2="任务记录" />
    <div class="child-con whiteBox">
      <div class="inner">
        <div class="header">
          <el-radio-group
            v-model="selectType"
            @change="typeSelectChange"
            size="small"
            style
          >
            <el-radio-button label="2">定时任务</el-radio-button>
            <el-radio-button label="1">实时任务</el-radio-button>
          </el-radio-group>
          <el-form
            :inline="true"
            ref="searchForm"
            class="searchForm"
            :model="searchObj"
            label-width="0"
          >
            <el-form-item label>
              <el-input
                v-model="searchObj.name"
                placeholder="任务名称"
              ></el-input>
            </el-form-item>
            <el-form-item label>
              <el-input
                v-model="searchObj.startUser"
                placeholder="执行人"
              ></el-input>
            </el-form-item>
            <el-form-item label>
              <el-select v-model="searchObj.status" placeholder="执行状态">
                <el-option label="执行中" value="1"></el-option>
                <el-option label="成功" value="2"></el-option>
                <el-option label="失败" value="3"></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label>
              <el-date-picker v-model="searchObj.started" type="date" placeholder="日期"></el-date-picker>
            </el-form-item>-->
          </el-form>
        </div>
        <div class="con_box" ref="conBox">
          <div class="shadow">
            <el-table
              :max-height="conHeight"
              :data="variateData"
              class="variable-table"
              v-loading="loading"
              stripe
              style
              size="small"
              ref="table"
              border
              v-show="selectType == '1'"
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
                prop="jobObjectArr[0].varName"
                label="执行对象"
              ></el-table-column>
              <el-table-column
                prop="started"
                label="执行时间"
              ></el-table-column>
              <el-table-column
                prop="jobObjectArr[0].value"
                label="设置值"
              ></el-table-column>
              <el-table-column
                prop="jobObjectArr[0].unit"
                label="单位"
              ></el-table-column>
              <el-table-column
                prop="jobObjectArr[0].classify"
                label="分组名称"
              ></el-table-column>
              <el-table-column
                prop="startUser"
                label="执行人"
              ></el-table-column>
              <el-table-column prop="status" label="执行结果">
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
            <el-table
              :max-height="conHeight"
              :data="variateData"
              class="variable-table"
              v-loading="loading"
              stripe
              style
              size="small"
              ref="table"
              border
              v-show="selectType != '1'"
            >
              <el-table-column type="expand">
                <template slot-scope="props">
                  <el-table
                    stripe
                    class="demo-table-expand"
                    :data="props.row.jobObjectArr"
                    size="mini"
                    :border="false"
                    style="width: 100%"
                  >
                    <el-table-column
                      prop="varName"
                      label="执行对象"
                    ></el-table-column>
                    <el-table-column
                      prop="value"
                      label="设置值"
                    ></el-table-column>
                    <el-table-column prop="unit" label="单位"></el-table-column>
                    <el-table-column
                      prop="classify"
                      label="分组名称"
                    ></el-table-column>
                    <!-- <el-table-column
                    prop="delay"
                    label="延时时间(ms)">
                  </el-table-column>-->
                  </el-table>
                </template>
              </el-table-column>
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
                prop="started"
                label="执行时间"
              ></el-table-column>
              <el-table-column
                prop="startUser"
                label="执行人"
              ></el-table-column>
              <el-table-column prop="status" label="执行结果">
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
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage + 1"
                :page-sizes="[10, 20, 50]"
                :page-size="size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalVariate"
              ></el-pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MyBreadcrumb from "../subcomponents/Mybreadcrumb";
import { deepClone, getUUIDInt } from "@/utils/index";
export default {
  components: {
    MyBreadcrumb,
  },
  data() {
    return {
      conHeight: 0,
      selectType: "2",
      variateData: [],
      loading: false,
      currentPage: 0,
      size: 10,
      totalVariate: 0,
      searchObj: {},
    };
  },
  computed: {
    watchSiteChange() {
      return this.$store.state.site.siteId;
    },
  },
  watch: {
    watchSiteChange() {
      this.searchAll();
    },
    searchObj: {
      handler() {
        this.searchAll();
      },
      deep: true,
    },
  },
  created() {
    this.searchAll();
  },
  mounted() {
    this.$nextTick(() => {
      this.conHeight = this.$refs.conBox.offsetHeight - 58;
    });
    window.addEventListener("resize", () => {
      this.$nextTick(() => {
        this.conHeight = this.$refs.conBox.offsetHeight - 58;
      });
    });
  },
  methods: {
    typeSelectChange() {
      this.searchObj = {};
      this.searchAll();
    },
    // 请求所有变量数据
    searchAll() {
      if (this.watchSiteChange) {
        this.$http
          .get("equipment/jobLog/getLogs", {
            params: {
              site: this.watchSiteChange,
              name: this.searchObj.name || "",
              type: this.selectType,
              page: this.currentPage,
              size: this.size,
              status: this.searchObj.status,
              startUser: this.searchObj.startUser,
            },
          })
          .then((res) => {
            if (res.data.code == 0) {
              this.totalVariate = res.data.data.total;
              this.variateData = res.data.data.jobLogs;
              this.variateData.forEach((element) => {
                element.jobObjectArr = JSON.parse(element.jobObject);
              });
            }
            this.$refs.table.doLayout();
          });
      }
    },
    // 分页大小改变
    handleSizeChange(val) {
      this.size = val;
      this.currentPage = 0;
      this.searchAll();
    },
    // 分页改变
    handleCurrentChange(val) {
      this.currentPage = val - 1;
      this.searchAll();
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../assets/css/index.less";
.child-page {
  .inner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 10px;
  }
  .header {
    margin-bottom: 10px;
  }
  .con_box {
    position: absolute;
    top: 52px;
    bottom: 10px;
    left: 10px;
    right: 10px;
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
</style>