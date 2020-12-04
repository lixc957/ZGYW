<template>
  <div class="maintain-content">
    <MyBreadcrumb level1="产品管理" level2="保养内容" />

    <div class="maintain-table" ref="conBox">
      <!-- 头部 -->
      <div class="table-top">
        <el-button class="confirm" @click="addMaintain">+ 添加保养内容</el-button>
        <!-- <div class="search">
          <el-input
            v-model.trim="maintainId"
            suffix-icon="el-icon-search"
            placeholder="订单编号"
            v-throttle="maintainSearch"
            :disabled="!$store.state.site.siteId"
          ></el-input>
        </div> -->
      </div>

      <!-- 表格内容 -->
      <div class="table-content">
        <el-table
          ref="maintainTable"
          stripe
          :data="maintainList"
          border
          size="mini"
          style="width: 100%"
          :max-height="conHeight"
        >
          <el-table-column type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="maintainContent" label="保养内容"></el-table-column>
          <el-table-column prop="maintainPrice" label="保养价格"></el-table-column>
          <el-table-column label="操作" width="160">
            <template slot-scope="scope">
              <el-tooltip
                class="item fl"
                effect="dark"
                content="编辑"
                offset="-20"
                placement="top-start"
              >
                <el-button
                  icon="el-icon-edit"
                  size="mini"
                  class="confirm fl"
                  @click="editMaintain(scope.row)"
                ></el-button>
              </el-tooltip>
              <el-tooltip
                class="item fl"
                effect="dark"
                content="删除"
                offset="-20"
                placement="top-start"
              >
                <el-button
                  icon="el-icon-delete"
                  size="mini"
                  class="danger fl"
                  @click="delMaintain(scope.row)"
                ></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-box">
          <el-pagination
            @size-change="maintainSizeChange"
            @current-change="maintainCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10,20,50]"
            :page-size="size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </div>
        
      </div>

      <!-- 保养内容弹窗 -->
      <el-dialog
        :visible.sync="maintainVisible"
        width="650px"
        :title="maintainTitle"
        modal
        :close-on-click-modal="false"
        :show-close="true"
        @close="beforeDialogClose"
        class="maintain-dialog"
      >
        <el-form
          :rules="maintainRule"
          ref="maintainForm"
          label-width="80px"
          :model="maintainForm"
          class="maintain-form"
        >
          <el-form-item label="保养内容" prop="maintainContent">
            <el-input v-model.trim="maintainForm.maintainContent"></el-input>
          </el-form-item>
          <el-form-item label="保养价格" prop="maintainPrice" v-if="$store.state.userInfo.roleId === 1">
            <el-input v-model.trim="maintainForm.maintainPrice" placeholder="请输入保养价格"></el-input>            
          </el-form-item>

        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button class="cancel" @click="maintainVisible = false">取 消</el-button>
          <el-button class="confirm" @click="submitForm">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 备件删除 -->
      <el-dialog
        title="保养内容删除"
        :visible.sync="delMaintainVisible"
        width="500px"
        :close-on-click-modal="false"
      >
        <div style="width: 30px;float: left;margin: -7px 8px 5px -8px;">
          <i :class="{icon: true, 'iconfont': true, 'iconjinggao1': true}"></i>
        </div>
        <span>是否确定删除保养内容?</span>
        <span slot="footer" class="dialog-footer">
          <el-button class="cancel" @click="delMaintainVisible = false">取 消</el-button>
          <el-button class="dang" @click="delMaintainSubmit">确 定</el-button>
        </span>
      </el-dialog>

    </div>
  </div>
</template>

<script>
import MyBreadcrumb from "../subcomponents/Mybreadcrumb"

export default {
  name: 'MaintainContent',
  components: {
    MyBreadcrumb
  },
  data() {
    return {      
      maintainId: '', // 保养内容 id
      refreshMaintainList: null, // 重置列表,用于监听站点切换
      //分页器属性
      currentPage: 1, // 当前页
      size: 10, // 页容量
      total: 0, // 总数
      maintainList: [], // 表格数据
      conHeight: 0, // 表格最大高度
      maintainTitle: '新增保养内容', // 弹窗标题
      maintainVisible: false, // 默认弹窗关闭
      maintainForm: {},
      delMaintainVisible: false, // 删除弹窗关闭
      maintainRule: { // 表单校验规则
        maintainContent: [{ required: true, message: "请输入保养内容", trigger: "blur" }],         
        maintainPrice: [{ required: true, message: "请输入保养内容", trigger: "blur" }]
      } 
    }
  },
  created() {
    this.getMaintainList() // 查询保养内容列表
    // 注册事件
    this.refreshMaintainList = () => {
      this.currentPage = 1
      this.getMaintainList()
    }
    this.$root.Bus.$on('siteChange', this.refreshMaintainList) // 监听全局事件
  },
  methods: {
    // 查询保养内容列表
    async getMaintainList() {
      const res = await this.$http({
        url: '/equipment/maintain/findAll',
        params: {
          companyId: this.companyId,
          page: this.currentPage - 1,
          size: this.size
        }
      })
      this.total = res.data.data.total
      this.maintainList = res.data.data.maintainConfigs
    },
    // 新增保养内容
    async addMaintainList() {
      const res = await this.$http({
        method: 'post',
        url: '/equipment/maintain/save',
        data: {
          companyId: this.companyId,
          maintainContent: this.maintainForm.maintainContent,
          maintainPrice: this.maintainForm.maintainPrice
        }
      })
      if (res.data.code === 0) {       
        this.$notify({
          message: '新增成功',
          type: 'success'
        })
        this.getMaintainList()
        this.maintainVisible = false
      } else {
        this.$notify({
          message: res.data.msg,
          type: 'warning'
        })
      }
    },
    // 编辑保养内容
    async editMaintainList() {
      const res = await this.$http({
        method: 'post',
        url: '/equipment/maintain/modify',
        data: {
          maintainId: this.maintainId,
          companyId: this.companyId,
          maintainContent: this.maintainForm.maintainContent,
          maintainPrice: this.maintainForm.maintainPrice
        }
      })
      if (res.data.code === 0) {
        this.$notify({
          title: "编辑成功",
          type: "success"
        })
        this.getMaintainList()
        this.maintainVisible = false
      } else {
        this.$notify({
          title: res.data.msg,
          type: "warning",
        })
      }
    },
    // 确定删除
    async delMaintainSubmit() {
      const res = await this.$http({
        url: '/equipment/maintain/remove',
        params: {
          id: this.maintainId
        }     
      })
      if (res.data.code === 0) {
        this.$notify({
          title: '删除成功',
          type: 'success'
        })
        if (this.maintainList.length === 1 && this.total > 1) {
          this.currentPage--
        }
        this.getMaintainList() // 重新拿数据渲染页面
      } else {
        this.$notify({
          title: '删除失败',
          type: 'warning'
        })
      }
      this.delMaintainVisible = false // 关闭弹窗
    },
    // 查询保养内容详情
    async getMaintainDetail() {
      const res = await this.$http({
        url: '/equipment/maintain/detail',
        params: {
          id: this.maintainId
        }
      })
      if (res.data.code === 0) {
        this.maintainForm = res.data.data
      }
    },
    // 产品分页容量改变
    maintainSizeChange(size) {
      this.size = size
      this.getMaintainList()
    },
    // 产品页码改变
    maintainCurrentChange(page) {
      this.currentPage = page
      this.getMaintainList()
    },
    // 编辑按钮
    editMaintain(row) {
      this.maintainTitle = '编辑保养内容' // 更改标题内容
      this.maintainVisible = true // 打开弹窗
      this.maintainId = row.maintainId // 赋值 id
      this.getMaintainDetail() // 调用详情接口
    },
    // 添加保养内容
    addMaintain() {
      this.maintainTitle = '新增保养内容'
      this.maintainVisible = true
    },
    // 删除按钮
    delMaintain(row) {
      this.delMaintainVisible = true
      this.maintainId = row.maintainId
    },
    // 弹窗关闭的回调
    beforeDialogClose() {
      this.maintainForm = {}
      this.$refs.maintainForm.resetFields()
    },
    // 提交表单
    submitForm() {
      this.$refs.maintainForm.validate(valid => {
        if (valid) {
          // 验证通过
          if (this.maintainTitle === '新增保养内容') {
            // 新增
            this.addMaintainList()
            return
          }
          this.editMaintainList()
        } else {
          // 验证不通过
          this.$notify({
            title: '验证失败',
            type: "error"
          })
        }
        return false
      })
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.conHeight = this.$refs.conBox && this.$refs.conBox.offsetHeight - 100       
    })
    window.addEventListener("resize", () => {
      this.$nextTick(() => {
        this.conHeight = this.$refs.conBox && this.$refs.conBox.offsetHeight - 100          
      })
    })
  },
  destroyed() {
    this.$root.Bus.$off('siteChange', this.refreshMaintainList) // 销毁全局事件
  },
  computed: {
    // 公司 id
    companyId() {
      return this.$store.state.site.searchCompanyId
    }
  }
}
</script>

<style scoped lang="less">
@import "../../assets/css/index.less";

#filter-box .el-select .el-input__inner {
  background: #fff;
}

.maintain-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.maintain-table {
  background: #ffffff;
  flex: 1;
  padding: 10px;

  .table-top {
    display: flex;
    justify-content: space-between;
  }

  .table-content {
    margin-top: 10px;

    .pagination-box {
      float: right;
      margin-top: 15px;
    }
  }
}

</style>