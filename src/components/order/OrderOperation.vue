<template>
  <div class="order">
    <MyBreadcrumb level1="设备运维" level2="工单运维" />

    <!-- 头部 -->
    <div class="table-top">      
      <div class="search filter-box" id="filter-box">
        <el-input
          v-model.trim="orderName"
          suffix-icon="el-icon-search"
          placeholder="工单名称"
          v-throttle="orderSearch"
          :disabled="!$store.state.site.siteId"
        ></el-input>
        <el-checkbox v-model="checked">选择时间</el-checkbox>
        <el-date-picker
          v-model="dateValue"
          type="datetimerange"
          :clearable="false"
          @change="dateChange"
          unlink-panels
          :picker-options="pickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
      </div>

      <div class="machine-box">
        <!-- <el-button class="confirm" @click="addOrder">+ 添加订单</el-button> -->
      </div>
      
    </div>

    <div class="work-table" ref="conBox">
      <el-tabs
        type="border-card"
        class="hasBack-tab"
        v-model="activeName"
        @tab-click="handleClick"
      >
        <el-tab-pane
          v-for="(item, index) in tabOptions"
          :key="index"
          :label="item.name" :name="item.value + ''">

          <!-- 表格内容 -->
          <div class="table-content">
            <el-table
              stripe
              :data="orderList"
              border
              size="mini"
              style="width: 100%"
              :max-height="conHeight"
            >
              <el-table-column type="index" label="序号" width="50"></el-table-column>
              <el-table-column prop="name" label="基本描述"></el-table-column>
              <el-table-column label="订单级别">
                <template slot-scope="scope">{{ scope.row.level | levelShow }}</template>           
              </el-table-column>
              <el-table-column label="订单状态">
                <template slot-scope="scope">{{ scope.row.status | statusShow(that) }}</template>                                                
              </el-table-column>
              <el-table-column label="创建时间">
                <template slot-scope="scope">{{ scope.row.createTime | dateShow }}</template>
              </el-table-column>
              <el-table-column prop="info" label="备注信息"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-tooltip
                    class="item fl"
                    effect="dark"
                    content="处理"
                    offset="-20"
                    placement="top-start"
                    v-if="scope.row.status === 2"
                  >
                    <el-button
                      icon="el-icon-edit"
                      size="mini"
                      class="confirm fl"
                      @click="handleOrderClick(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip
                    class="item fl"
                    effect="dark"
                    content="详情"
                    offset="-20"
                    placement="top-start"
                  >
                    <el-button
                      icon="el-icon-share"
                      size="mini"
                      class="confirm fl"
                      @click="getOrderDetail(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip
                    class="item fl"
                    effect="dark"
                    content="接单"
                    offset="-20"
                    placement="top-start"
                    v-if="scope.row.status === 0"
                  >
                    <el-button
                      icon="el-icon-check"
                      size="mini"
                      class="confirm fl"
                      @click="acceptOrder(scope.row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip
                    class="item fl"
                    effect="dark"
                    content="驳回"
                    offset="-20"
                    placement="top-start"
                    v-if="scope.row.status < 3 && scope.row.duser"
                  >
                    <el-button
                      icon="el-icon-close"
                      size="mini"
                      class="danger fl"
                      @click="delClick(scope.row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-box">
              <el-pagination
                @size-change="workSizeChange"
                @current-change="workCurrentChange"
                :current-page="currentPage"
                :page-sizes="[10,20,50]"
                :page-size="size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
              ></el-pagination>
            </div>
        
          </div>
        </el-tab-pane>
      </el-tabs>

    </div>
    
    <!-- 详情弹窗 -->
    <dialog-detail
      ref="dialogDetail"
      :order-form="orderForm"
      :equipment-list="equipmentList"
      :order-duser-options="orderDuserOptions"
      :img-order-list="imgOrderList"
      @close="beforeDialogClose"
      @handleOrder="handleOrder"
      @submitOrder="submitOrder"
      @getBigImg="getBigImg"
     />

    <!-- 驳回订单弹窗 -->
    <dialog-reject
      ref="dialogReject"
      :order-form="orderForm"
      @rejectSubmit="delOrder"
      @close="beforeDialogClose"
    />

    <!-- 工单处理信息弹窗 -->
    <dialog-files
      ref="dialogFiles"
      :order-form="orderForm"
      :order-rule="orderRule"
      @filesSubmit="handleInfo"
      @close="beforeDialogClose"
    />

    <!-- 遮罩层 -->
    <div class="img-mask" v-show="isMask">
      <div class="img-box">
        <el-button
          class="close"
          icon="el-icon-close"
          size="mini"
          @click.stop="closeMask"
          title="关闭"
        >
        </el-button>
        <img :src="bigImgUrl" alt="">
      </div>     
    </div>

  </div>
</template>

<script>
import MyBreadcrumb from '../subcomponents/Mybreadcrumb'
import DialogDetail from './childComps/DialogDetail'
import DialogReject from './childComps/DialogReject'
import DialogFiles from './childComps/DialogFiles'
import { mapState } from 'vuex'
import { getFullDate } from "../../utils/index"

export default {
  name: 'OrderOperation',
  components: {
    MyBreadcrumb,
    DialogDetail,
    DialogReject,
    DialogFiles
  },
  data() {
    return {
      that: this, // filters 无法使用 this，可定义好传过去
      activeName: '5', // tab 栏绑定值
      orderId: '', // 订单编号
      orderForm: {}, // 表单绑定值
      orderRule: { // 表单验证规则
        msg: [{ required: true, message: '请输入处理信息', trigger: 'change' }],
      },
      refreshOrderList: null, // 重置列表,用于监听站点切换
      conHeight: 0, // 表格最大高度
      //分页器属性
      currentPage: 1, // 当前页
      size: 10, // 页容量
      total: 0, // 总数
      orderName: '', // 工单名称
      dateValue: [], // 时间段数组
      begin: null, // 开始时间
      end: null, // 结束时间
      checked: false, // 是否选择时间段
      pickerOptions: { // 设置禁用状态，参数为当前日期
        disabledDate(time) {
          return (
            time.getTime() > Date.now() || time.getTime() < new Date(2019, 9, 1)
          )
        }
      },
      orderList: [], // 表格数据
      orderStatus: 0, // 订单状态
      dispatchStatus: 0, // 派单状态， 0 为未指派
      orderStatusOptions: [ // 订单状态选项
        { value: 0, name: '待接单' },
        { value: 1, name: '已接单' },
        { value: 2, name: '处理中' },
        { value: 3, name: '待审核' },
        { value: 4, name: '已完结' }
      ], 
      tabOptions: [ // tab 选项
        { value: '5', name: '未指派' },
        { value: '0', name: '待接单' },
        { value: '1', name: '已接单' },
        { value: '2', name: '处理中' },
        { value: '3', name: '待审核' },
        { value: '4', name: '已完结' }
      ],
      dispatchStatusOptions: [ // 派单状态选项
        { value: 0, name: '未指派' },
        // { value: 1, name: '指派' }
      ], 
      equipmentList: [], // 关联设备列表
      orderDuserOptions: [], // 执行人选项   
      imgPathList: [], // 工单处理图片路径
      imgOrderList: [], // 工单处理图片列表
      isMask: false, // 遮罩层是否显示
      bigImgUrl: '', // 大图链接地址
    }
  },
  methods: {
    // 查询手下订单列表
    async getOrderList() {
      try {
        const res = await this.$http({
          url: '/equipment/RepairOrder/orderList',
          params: {
            // duser: this.userInfo.userId, // 执行人ID
            duser: 6467695,
            status: this.orderStatus, // 订单状态
            site: this.site.siteId, // 站点 id
            size: this.size, // 页容量
            page: this.currentPage - 1, // 页码
            name: this.orderName, // 工单名称
            begin: this.begin, // 开始时间
            end: this.end // 结束时间
          }
        })
        if (res.data.code === 0) {
          this.orderList = res.data.data.repairOrders
          this.total = res.data.data.total
        } else {
          this.$notify({
            message: res.data.msg,
            type: 'warning'
          })
        }
      } catch (error) {
        
      }
    },
    // 查询站点下所有未指派运维订单
    async getDispatchList() {
      const res = await this.$http({
        url: '/equipment/RepairOrder/dispatchOrder',
        params: {
          site: this.site.siteId, // 站点 id
          dispatchStatus: this.dispatchStatus, // 派单状态
          page: this.currentPage - 1,
          size: this.size,
          name: this.orderName, // 工单名称
          begin: this.begin, // 开始时间
          end: this.end // 结束时间
        }
      })
      if (res.data.code === 0) {
        this.orderList = res.data.data.repairOrders
        this.total = res.data.data.total
      }
    },
    // 运维接单
    async acceptOrder(row) {
      const res = await this.$http({
        url: '/equipment/RepairOrder/getOrder',
        params: {
          orderId: row.id,
          // duser: this.userInfo.userId // 执行人ID
          duser: 6467695,
        }
      })
      if (res.data.code === 0) {
        this.$notify({
          message: res.data.msg,
          type: "success"
        })
        this.getList()
      } else {
        this.$notify({
          message: res.data.msg,
          type: "warning"
        })
      }
    },
    // 驳回订单
    async delOrder() {
      const res = await this.$http({
        url: '/equipment/RepairOrder/rejectOrder',
        params: {
          orderId: this.orderId,
          user: this.orderForm.duser, // 驳回人编号
          rejectInfo: this.orderForm.rejectInfo || '' // 驳回信息
        }
      })
      if (res.data.code === 0) {
        this.$notify({
          message: res.data.msg,
          type: "success"
        })
        if (this.orderList.length === 1 && this.total > 1) {
          this.currentPage--
        }
        this.getOrderList()
        this.$refs.dialogReject.rejectOrderVisible = false
      } else {
        this.$notify({
          message: res.data.msg,
          type: "warning"
        })
      }
    }, 
    // 提交审核
    async submitOrder() {
      const res = await this.$http({
        url: '/equipment/RepairOrder/submitOrder',
        params: { orderId: this.orderId }
      })
      if (res.data.code === 0) {
        this.$notify({
          message: res.data.msg,
          type: "success"
        })
        this.getOrderList()
        this.$refs.dialogDetail.detailOrderVisible = false
      } else {
        this.$notify({
          message: res.data.msg,
          type: "warning"
        })
      }
    },
    // 处理订单
    async handleOrder() {
      const res = await this.$http({
        url: '/equipment/RepairOrder/handleOrder',
        params: { orderId: this.orderId }
      })
      if (res.data.code === 0) {
        this.$notify({
          message: res.data.msg,
          type: "success"
        })
        this.getOrderList()
        this.$refs.dialogDetail.detailOrderVisible = false
      } else {
        this.$notify({
          message: res.data.msg,
          type: "warning"
        })
      }
    },
    // 工单处理信息
    async handleInfo(fileList) {
      const fd = new FormData()
      fd.append('orderId', this.orderId)
      fd.append('msg', this.orderForm.msg)

      if (fileList) { // 传了图片
        fileList.forEach((item, index) => {
          fd.append('files', item)
        })
      }

      const res = await this.$http({
        method: 'post',
        url: '/equipment/RepairOrder/handleInfo',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: fd
      })

      if (res.data.code === 0) {        
        this.$notify({
          message: res.data.msg,
          type: "success"
        })
        this.$refs.dialogFiles.filesOrderVisible = false     
        this.$refs.dialogFiles.loading = false   
      } else {
        this.$refs.dialogFiles.fileList = [] // 清空图片列表
        this.$notify({
          message: res.data.msg,
          type: "warning"
        })       
      }
    },
    // 获取工单资源信息
    async getResources() {
      const res = await this.$http({
        url: '/equipment/RepairOrder/getResources',
        params: { orderId: this.orderId }
      })
      // 如果没有照片，直接return
      if (res.data.data.length === 0) return
      if (res.data.code === 0) {
        this.imgPathList = res.data.data
      }    
      // 拿到照片信息发送请求
      this.imgPathList.forEach(item => {
        this.getOrderImages(item)
      })
    },  
    // 获取工单照片信息
    async getOrderImages(url) {
      const res = await this.$http({
        url: '/equipment/RepairOrder/getImages',
        params: { url }
      })
      this.imgOrderList.push(res.request.responseURL)
    },
    // 点击查看详情
    async getOrderDetail(row) {
      this.orderId = row.id
      this.$refs.dialogDetail.detailOrderVisible = true
      const res = await this.$http({
        url: '/equipment/RepairOrder/detail',
        params: { orderId: this.orderId }
      })
      if (res.data.code === 0) {
        res.data.data.orderTrails.reverse()
        this.orderForm = res.data.data
        this.orderForm.orderTrails[0].type = 'success'
        // 清空原来的设备列表
        this.equipmentList = []
        if (this.orderForm.eqId) {
          this.orderForm.eqId = +this.orderForm.eqId // 关联设备 id 转成数字
        }
        if (res.data.data.equipment) { // 如果有关联设备，就添加
          this.equipmentList.push(res.data.data.equipment)
        }
        
        this.getResources() // 获取工单资源信息
      }
    },
    // 查询站点下运维人员
    async getRepairUser() {
      const res = await this.$http({
        url: '/sysmanage/sys/findRepairUser',
        params: {
          site: this.site.siteId
        }
      })
      if (res.data.code === 0) {
        this.orderDuserOptions = res.data.data
      }
    }, 
    // 判断调用哪个接口
    getList() {
      if (this.activeName === '5') {
        // 调用未指派接口
        this.getDispatchList()
      } else {
        // 调用查询所有订单接口
        this.getOrderList()
      }
    }, 
    // tab 栏切换
    handleClick() {
      this.currentPage = 1 // 页码归1
      this.dateValue = getFullDate(new Date()) // 刷新时间
      // 未指派栏
      if (this.activeName === '5') {
        this.dispatchStatus = 0
        this.getDispatchList()
        return
      }
      this.orderStatus = +this.activeName
      this.orderList = []
      this.getOrderList()   
    },
    // 过滤时间选择器
    formatTime(date) {
      return new Date(date.getTime() + 8 * 60 * 60 * 1000)
        .toJSON()
        .replace("T", " ")
        .replace("Z", "")
        .replace(".", ":")
    },
    // 搜索订单
    orderSearch() {
      this.currentPage = 1
      this.getList()
    },
    // 时间选择器改变
    dateChange() {
      this.currentPage = 1
      this.isTimeChecked()
    },
    // 是否确定选择时间段
    isTimeChecked() {
      if (this.checked) {
        this.begin = this.formatTime(this.dateValue[0]) // 时间段改变
        this.end = this.formatTime(this.dateValue[1]) // 时间段改变
      } else {
        this.begin = null
        this.end = null
      }
      this.getList() 
    },
    // 点击驳回按钮
    delClick(row) {
      this.orderId = row.id
      this.orderForm.duser = row.duser // 驳回人编号
      this.$refs.dialogReject.rejectOrderVisible = true
    },
    // 点击处理订单按钮
    handleOrderClick(row) {
      this.orderId = row.id
      this.$refs.dialogFiles.filesOrderVisible = true
    },
    // 产品分页容量改变
    workSizeChange(size) {
      this.size = size
      this.getList()
    },
    // 产品页码改变
    workCurrentChange(page) {
      this.currentPage = page
      this.getList()
    },
    // 弹窗关闭前
    beforeDialogClose() {
      this.orderForm = {}     
      this.imgOrderList = [] // 清空图片数组
      this.$refs.dialogDetail && this.$refs.dialogDetail.resetFields() // 编辑、详情弹框清空
      this.$refs.dialogFiles && this.$refs.dialogFiles.resetFields() // 处理信息弹窗清空
    },
    // 图片放大
    getBigImg(index) {
      this.isMask = true // 打开遮罩层
      this.bigImgUrl = this.imgOrderList[index] // 拿到地址
    },
    // 关闭遮罩
    closeMask() {
      this.isMask = false // 关闭遮罩层
      this.bigImgUrl = '' // 清空地址
    }
  },
  computed: {
    ...mapState(['userInfo', 'site'])
  },
  created() {
    this.dateValue = getFullDate(new Date()) // 时间选择器设置默认时间
    this.getRepairUser() // 查询站点下运维人员
    this.getDispatchList() // 获取未指派的订单
    // 注册事件
    this.refreshOrderList = () => {
      this.currentPage = 1
      this.getList()
      this.getRepairUser() // 查询站点下运维人员
    }
    this.$root.Bus.$on('siteChange', this.refreshOrderList) // 监听全局事件
  },
  watch: {
    // 监听是否选择了时间段
    checked() {
      this.isTimeChecked()
    }
  },
  filters: {
    // 订单级别
    levelShow(val) {
      switch (val) {
        case 1:
          return '一级'
          break;
        
        case 2:
          return '二级'
          break;

        case 3:
          return '三级'
          break;

        case 4:
          return '四级'
          break;

        case 5:
          return '五级'
          break;
      
        default:
          return '一级'
          break;
      }
    },
    // 创建时间
    dateShow(val) {
      let str = val.slice(0, 19).split('T').join(' ')
      return str
    },
    // 订单状态
    statusShow(val, that) {
      const index = that.orderStatusOptions.findIndex(item => item.value === val)
      const str = that.orderStatusOptions[index].name
      return str
    }
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
    this.$root.Bus.$off('siteChange', this.refreshOrderList) // 销毁全局事件
  }
}
</script>

<style scoped lang="less">

.order {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .table-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    padding: 10px;
    background: #ffffff;

    .filter-box {
      display: flex;
      padding: 5px 0;

      .el-checkbox {
        margin-left: 15px;
        margin-right: -10px;
        line-height: 36px;
      }

      >.el-input {
        width: 240px;
      }

      /deep/ .el-date-editor {
        margin-left: 20px;

        .el-range__icon {
          line-height: 28px;
        }

        .el-range-separator {
          line-height: 28px;
        }
      }

    }

    .machine-box {
      display: flex;
      align-items: center;
    }
  }

  .work-table {
    background: #ffffff;
    flex: 1;
    padding: 10px;

    .hasBack-tab {
      height: 100%;
      /deep/ .el-tabs__header {
        background-color: #fff;
        margin-top: 10px;
        margin-left: 15px;
        border-bottom: none;

        .el-tabs__nav {
          .el-tabs__item {
            height: 34px;
            line-height: 34px;
            margin-top: 0;
            margin-left: -1px;
            border: 1px solid #d9d9d9;
            color: #333 !important;
            font-size: 14px !important;

            &:first-of-type {
              margin-left: 0 !important;
            }

            &.is-active {
              position: relative;
              z-index: 10;
              color: #1890ff !important;
              border: 1px solid #1890ff;
            }
            
          }
        }
      }
    }

    .table-content {
      margin-top: 10px;

      .pagination-box {
        float: right;
        margin-top: 15px;
      }
    }
  }

  .img-mask {
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.7);
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    .img-box {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      .close {
        position: absolute;
        top: 0;
        right: 0;
        width: 40px;
        height: 40px;
        transform: translate(50%, -50%);
        border-radius: 50%;
        color: #ffffff;
        background: #606266;
        text-indent: -3px;
        font-size: 21px;
        font-weight: 700;
        border: 1px solid #606266;
      }
    }
  }
}
</style>