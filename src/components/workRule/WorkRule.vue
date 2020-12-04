<template>
  <div class="work-rule">
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
        <el-button class="confirm" @click="addOrder">+ 创建工单</el-button>
      </div>
      
    </div>

    <div class="work-table" ref="conBox">
      <el-tabs
        type="border-card"
        class="hasBack-tab"
        v-model="activeName"
        @tab-click="handleTabsClick"
      >
        <el-tab-pane
          v-for="(item, index) in tabOptions"
          :key="index"
          :label="item.name" :name="item.value + ''">
          
          <!-- 表格内容 -->
          <div class="table-content">
            <el-table
              ref="workTable"
              stripe
              :data="orderList"
              border
              size="mini"
              style="width: 100%"
              :max-height="conHeight"
            >
              <el-table-column type="index" label="序号" width="50"></el-table-column>
              <el-table-column label="执行人" v-if="orderDuserOptions.length">
                <template slot-scope="scope">
                  <div class="duser-box" style="display: flex; width: 100%">
                    <div style="width: 50%">{{ scope.row.duser | duserShow(that) }}</div>
                    <el-button
                      size="mini"
                      class="confirm fl"
                      style="float: none;"
                      v-show="scope.row.status === 0"
                      @click="editDuser(scope.row)"
                    >选择执行人</el-button>
                  </div>                 
                </template>
              </el-table-column>
              <el-table-column prop="name" label="基本描述"></el-table-column>
              <el-table-column label="订单级别">
                <template slot-scope="scope">{{ scope.row.level | levelShow(that) }}</template>           
              </el-table-column>
              <el-table-column prop="status" label="订单状态">
                <template slot-scope="scope">
                  {{ scope.row.status | statusShow(that) }}
                  <el-button
                    size="mini"
                    class="confirm fl"
                    style="float: none;"
                    v-show="scope.row.status === 3"
                    @click="auditOrder(scope.row)"
                  >审核订单</el-button>
                </template>             
              </el-table-column>
              <el-table-column label="驳回状态">
                <template slot-scope="scope">
                  {{ scope.row.rejectStatus === 0 ? '正常' : '驳回单' }}
                  <el-button
                    size="mini"
                    class="confirm fl"
                    style="float: none;"
                    v-show="rejectStatus && !scope.row.duser && !scope.row.deliverStatus"
                    @click="passClick(scope.row)"
                  >转交平台</el-button>
                </template>               
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
                    content="编辑"
                    offset="-20"
                    placement="top-start"
                  >
                    <el-button
                      icon="el-icon-edit"
                      size="mini"
                      class="confirm fl"
                      v-if="scope.row.status < 1"
                      @click="editOrder(scope.row)"
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
                      @click="getDetail(scope.row)"
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
                      @click="delOrder(scope.row)"
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

    <!-- 新增弹窗 -->
    <dialog-add
      ref="dialogAdd"
      :order-form="orderForm"
      :order-rule="orderRule"
      :order-duser-options="orderDuserOptions"
      :order-level-options="orderLevelOptions"
      :gateway-list="gatewayList"
      :equipment-list="equipmentList"
      @close="beforeDialogClose"
      @addSubmit="addOrderList"
      @gatewayChange="gatewayChange"
      @equipmentChange="getEquipmentList"
    />

    <!-- 重新指派订单弹窗 -->
    <dialog-forward
      ref="dialogForward"
      :order-form="orderForm"
      :order-duser-options="orderDuserOptions"
      @close="beforeDialogClose"
      @forwardSubmit="forwardDuser"
    />

    <!-- 审核订单弹窗 -->
    <dialog-audit 
      ref="dialogAduit"
      :order-form="orderForm"
      :order-rule="orderRule"
      @aduitSubmit="aduitOrder"
      @close="beforeDialogClose"
    />

    <!-- 转交平台弹窗 -->
    <dialog-pass 
      ref="dialogPass"
      :order-form="orderForm"
      @passSubmit="passOrder"
      @close="beforeDialogClose"
    />

    <!-- 编辑、详情弹窗 -->
    <dialog-detail 
      :order-form="orderForm"
      :order-rule="orderRule"
      :dispatch-status-options="dispatchStatusOptions"
      :order-duser-options="orderDuserOptions" 
      :order-level-options="orderLevelOptions"
      :order-status-options="orderStatusOptions"
      :gateway-list="gatewayList"
      :equipment-list="equipmentList"
      :reject-status-options="rejectStatusOptions"
      :img-order-list="imgOrderList"
      ref="dialogDetail" 
      @editForm="editOrderList"
      @gatewayChange="gatewayChange"
      @equipmentChange="getEquipmentList"
      @getBigImg="getBigImg"
      @close="beforeDialogClose" />

    <!-- 订单删除弹窗 -->
    <el-dialog
      title="订单删除"
      :visible.sync="delOrderVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <div style="width: 30px;float: left;margin: -7px 8px 5px -8px;">
        <i :class="{icon: true, 'iconfont': true, 'iconjinggao1': true}"></i>
      </div>
      <span>是否确定删除订单?</span>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="delOrderVisible = false">取 消</el-button>
        <el-button class="dang" @click="delOrderList">确 定</el-button>
      </span>
    </el-dialog>

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
import MyBreadcrumb from "../subcomponents/Mybreadcrumb"
import DialogAdd from './childComps/DialogAdd'
import DialogForward from './childComps/DialogForward'
import DialogAudit from './childComps/DialogAudit'
import DialogDetail from './childComps/DialogDetail'
import DialogPass from './childComps/DialogPass'
import { mapState } from 'vuex'
import { getFullDate } from "../../utils/index"

export default {
  name: 'WorkRule',
  components: {
    MyBreadcrumb,
    DialogAdd,
    DialogForward,
    DialogAudit,
    DialogDetail,
    DialogPass
  },
  data() {
    return {    
      that: this, // filters 无法使用 this，可定义好传过去
      refreshOrderList: null, // 重置列表,用于监听站点切换
      activeName: '6',
      orderId: '', // 搜索的订单编号
      //分页器属性
      currentPage: 1, // 当前页
      size: 10, // 页容量
      total: 0, // 总数
      orderList: [], // 表格数据
      conHeight: 0, // 表格最大高度
      orderStatus: '', // 订单状态
      dispatchStatus: '', // 派单状态
      rejectStatus: '', // 驳回状态
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
      dispatchStatusOptions: [
        { value: 0, name: '未指派' },
        { value: 1, name: '指派' }
      ], // 派单状态选项
      gatewayList: [], // 所属网关列表
      equipmentList: [], // 关联设备列表
      tabOptions: [ // tab 选项
        { value: '6', name: '所有订单' },
        { value: '5', name: '未指派' },
        { value: '7', name: '驳回单' },
        { value: '0', name: '待接单' },
        { value: '1', name: '已接单' },
        { value: '2', name: '处理中' },
        { value: '3', name: '待审核' },
        { value: '4', name: '已完结' }
      ],
      orderLevelOptions: [ // 订单级别选项
        { value: 1, name: '一级' },
        { value: 2, name: '二级' },
        { value: 3, name: '三级' },
        { value: 4, name: '四级' },
        { value: 5, name: '五级' }
      ], 
      orderStatusOptions: [ // 订单状态选项
        { value: 0, name: '待接单' },
        { value: 1, name: '已接单' },
        { value: 2, name: '处理中' },
        { value: 3, name: '待审核' },
        { value: 4, name: '已完结' }
      ], 
      rejectStatusOptions: [ // 驳回状态选项
        { value: 0, name: '正常' },
        { value: 1, name: '驳回单' }
      ], 
      orderDuserOptions: [], // 执行人选项     
      orderRule: { // 新增弹窗验证规则
        name: [{ required: true, message: '请输入基本描述', trigger: 'blur' }],
        level: [{ required: true, message: '请选择订单级别', trigger: 'change' }],
        // gatewayId: [{ required: true, message: '请选择所属网关', trigger: 'change' }],
        // eqId: [{ required: true, message: '请选择关联设备', trigger: 'change' }],
        info: [{ required: true, message: '请输入备注信息', trigger: 'blur' }],
        radio: [{ required: true, message: '请选择审批状态', trigger: 'blur' }]
      }, 
      orderForm: {}, // 弹窗绑定值
      delOrderVisible: false, // 删除弹窗，默认关闭
      imgPathList: [], // 工单处理图片路径
      imgOrderList: [], // 工单处理图片列表
      isMask: false, // 遮罩层是否显示
      bigImgUrl: '', // 大图链接地址
    }
  },
  created() {
    this.dateValue = getFullDate(new Date()) // 时间选择器设置默认时间
    this.getRepairUser() // 查询站点下运维人员
    this.getOrderList() // 获取创建的订单
    // 注册事件
    this.refreshOrderList = () => {
      this.currentPage = 1
      this.getOrderList()
      this.getRepairUser() // 查询站点下运维人员
    }
    this.$root.Bus.$on('siteChange', this.refreshOrderList) // 监听全局事件
  },
  methods: {
    // 获取创建的订单
    async getOrderList() {
      try {
        const res = await this.$http({
          url: '/equipment/RepairOrder/findByCreate',
          params: {
            user: this.userInfo.userId, // 管理员编号
            status: this.orderStatus, // 订单状态
            dispatchStatus: this.dispatchStatus, // 派单状态 
            rejectStatus: this.rejectStatus, // 驳回状态
            name: this.orderName, // 工单名称
            begin: this.begin, // 开始时间
            end: this.end, // 结束时间
            site: this.site.siteId, // 站点 id
            size: this.size, // 页容量
            page: this.currentPage - 1 // 页码
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
    // 新增订单
    async addOrderList() {
      this.orderForm.site = this.site.siteId // 添加站点 id
      const { duser, alarmId, info, level, name, site, eqId } = this.orderForm
      const res = await this.$http({
        method: 'post',
        url: '/equipment/RepairOrder/newOrder',
        data: { duser, alarmId, info, level, name, site, eqId: eqId || '' }
      })
      if (res.data.code === 0) {
        this.$notify({
          message: res.data.msg,
          type: 'success'
        })
        this.dateValue = getFullDate(new Date(Date.now() + 5000)) // 重新设置默认时间
        this.getOrderList()
        this.$refs.dialogAdd.addOrderVisible = false
      } else {
        this.$notify({
          message: res.data.msg,
          type: 'warning'
        })
      }
    },
    // 编辑订单
    async editOrderList() {
      const { id, name, level, eqId, cuser, ruser, duser,
        approvalUser, approvalTime, approvalInfo, dispatchStatus,
        site, alarmId, status, rejectStatus, info, createTime
      } = this.orderForm

      const res  = await this.$http({
        method: 'post',
        url: '/equipment/RepairOrder/baseModify',
        data: { id, name, level, eqId, cuser, ruser, duser,
          approvalUser, approvalTime, approvalInfo, dispatchStatus,
          site, alarmId, status, info, rejectStatus, createTime
        }
      })

      if (res.data.code === 0) {
        this.$notify({
          title: "编辑成功",
          type: "success"
        })
        this.dateValue = getFullDate(new Date(Date.now() + 5000)) // 重新设置默认时间
        this.getOrderList()
        this.$refs.dialogDetail.detailOrderVisible = false
      } else {
        this.$notify({
          title: res.data.msg,
          type: "warning",
        })
      }
    },
    // 删除订单
    async delOrderList() {
      const res = await this.$http({
        url: '/equipment/RepairOrder/removeOrder',
        params: {
          orderId: this.orderId
        }
      })
      if (res.data.code === 0) {
        this.$notify({
          message: '删除成功',
          type: 'success'
        })
        if (this.orderList.length === 1 && this.total > 1) {
          this.currentPage--
        }        
        this.getOrderList() 
      } else {
        this.$notify({
          message: res.data.msg,
          type: 'warning'
        })
      }
      this.delOrderVisible = false
    },
    // 重新指派订单
    async forwardDuser() {
      if (!this.orderForm.duser) {
        this.$refs.dialogForward.forwardOrderVisible = false
        return
      }

      const res = await this.$http({
        url: '/equipment/RepairOrder/forwardOrder',
        params: {
          orderId: this.orderId,
          reUser: this.orderForm.duser
        }
      })
      
      if (res.data.code === 0) {
        this.$notify({
          message: res.data.msg,
          type: "success"
        })
        this.$refs.dialogForward.forwardOrderVisible = false // 关闭弹窗
        this.getOrderList()
      } else {
        this.$notify({
          message: res.data.msg,
          type: "warning"
        })
      }
    },
    // 查看订单详情
    async getOrderDetail() {
      const res = await this.$http({
        url: '/equipment/RepairOrder/detail',
        params: {
          orderId: this.orderId
        }
      })
      if (res.data.code === 0) {
        res.data.data.orderTrails.reverse()
        this.orderForm = res.data.data
        this.orderForm.orderTrails[0].type = 'success'
       this.orderForm.gatewayId = res.data.data.gateway ? res.data.data.gateway.gatewayId : '' // 添加所属网关   

        if (this.orderForm.eqId) {
          this.orderForm.eqId = +this.orderForm.eqId // 关联设备 id 转成数字
        }
        if (res.data.data.equipment) { // 如果有关联设备，就添加
          this.equipmentList.push(res.data.data.equipment)
        }
       
        this.getResources() // 获取工单资源信息
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
    // 查询所属网关列表
    async getGatewayList() {
      const res = await this.$http({
        url: '/equipment/gatewayList',
        params: {
          page: 0,
          size: 100000000,
          roomId: this.site.siteId
        }
      })
      if (res.data.code === 0) {
        this.gatewayList = res.data.data.gateways
      }
    },
    // 查询关联设备列表
    async getEquipmentList(flag) {
      if (flag) {
        // 下拉框出现
        if (!this.orderForm.gatewayId) {    
          // this.$message.error('请先选中网关')
          return
        }      
        const res = await this.$http({
          url: '/equipment/equipmentList',
          params: {
            page: 0,
            size: 100000000,
            gatewayId: this.orderForm.gatewayId
          }
        })
        if (res.data.code === 0) {
          this.equipmentList = res.data.data.equipments
        }      
      }     
    },
    // 审核订单
    async aduitOrder() {
      const res = await this.$http({
        url: '/equipment/RepairOrder/approvalOrder',
        params: {
          orderId: this.orderId,
          approvalInfo: this.orderForm.approvalInfo || '', // 审批信息
          pass: this.orderForm.radio // 通过状态
        }
      })
      if (res.data.code === 0) {
        this.$notify({
          message: res.data.msg,
          type: "success"
        })
        this.$refs.dialogAduit.aduitOrderVisible = false // 关闭弹窗
        this.getOrderList()
      } else {
        this.$notify({
          message: res.data.msg,
          type: "warning"
        })
      }
    },
    // 订单转交平台
    async passOrder() {
      const res = await this.$http({
        url: '/equipment/RepairOrder/deliver',
        params: {
          orderId: this.orderId,
          deliverInfo: this.orderForm.deliverInfo
        }
      })
      if (res.data.code === 0) {
        this.$notify({
          message: res.data.msg,
          type: "success"
        })
        this.$refs.dialogPass.passOrderVisible = false // 关闭弹窗
        this.getOrderList()
      } else {
        this.$notify({
          message: res.data.msg,
          type: "warning"
        })
      }
    },
    // 所属网关改变
    gatewayChange() {
      this.orderForm.eqId = ''
      this.equipmentList = []
    },
    // tab 栏切换
    handleTabsClick() {
      this.currentPage = 1 // 页码归1
      this.dateValue = getFullDate(new Date()) // 刷新时间
      // 清空全部状态码
      this.orderStatus = ''
      this.dispatchStatus = ''
      this.rejectStatus = ''
      
      if (this.activeName === '5') { // 未指派栏,调用未指派接口
        this.dispatchStatus = 0
        this.getOrderList()
        return
      }

      if (this.activeName === '7') { // 驳回栏,调用驳回单接口
        this.rejectStatus = 1
        this.getOrderList()
        return
      }
      
      if (this.activeName !== '6') { // 所有订单     
        this.orderStatus = +this.activeName
      }
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
      this.getOrderList()
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
      this.getOrderList() 
    },
    // 产品分页容量改变
    workSizeChange(size) {
      this.size = size
      this.getOrderList()
    },
    // 产品页码改变
    workCurrentChange(page) {
      this.currentPage = page
      this.getOrderList()
    },
    // 点击添加按钮
    addOrder() {
      this.$refs.dialogAdd.addOrderVisible = true // 打开弹窗
      this.getGatewayList() // 查询所属网关列表 
    },
    // 点击编辑按钮
    editOrder(row) {
      this.orderId = row.id // 赋值订单编号
      this.$refs.dialogDetail.dialogMode = 'edit'
      this.$refs.dialogDetail.dialogTitle = '编辑工单'
      this.$refs.dialogDetail.detailOrderVisible = true // 打开弹窗
      this.getGatewayList() // 查询所属网关列表 
      this.getOrderDetail() // 调用详情接口
    },
    // 点击重新指派
    editDuser(row) {
      this.orderId = row.id // 赋值订单编号
      this.$refs.dialogForward.forwardOrderVisible = true // 打开弹窗
    },
    // 点击详情按钮
    getDetail(row) {
      this.orderId = row.id // 赋值订单编号
      this.$refs.dialogDetail.dialogMode = 'detail'
      this.$refs.dialogDetail.dialogTitle = '工单详情'
      this.$refs.dialogDetail.detailOrderVisible = true // 打开详情弹窗
      this.getOrderDetail() // 调用详情接口
    },
    // 点击审核订单按钮
    auditOrder(row) {
      this.orderId = row.id // 赋值订单编号
      this.$refs.dialogAduit.aduitOrderVisible = true // 打开审核订单弹窗
    },
    // 点击删除按钮
    delOrder(row) {
      this.delOrderVisible = true
      this.orderId = row.id
    },
    // 点击转交平台按钮
    passClick(row) {
      this.orderId = row.id
      this.$refs.dialogPass.passOrderVisible = true // 打开审核订单弹窗
    },
    // 弹窗关闭前
    beforeDialogClose() {
      this.orderForm = {}
      this.imgOrderList = []
      this.$refs.dialogAdd && this.$refs.dialogAdd.resetFields() // 新增弹框清空
      this.$refs.dialogDetail && this.$refs.dialogDetail.resetFields() // 编辑、详情弹框清空
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
  },
  computed: {
    ...mapState(['userInfo', 'site'])
  },
  watch: {
    // 监听所属网关的值
    "orderForm.gatewayId"() {
      if (!this.orderForm.gatewayId) {
        this.orderForm.eqId = ''
        this.equipmentList = []
      }
    },
    // 监听是否选择了时间段
    checked() {
      this.isTimeChecked()
    }
  },
  filters: {
    // 过滤日期
    dateShow(val) {
      let str = val.slice(0, 19).split('T').join(' ')
      return str
    },
    // 订单级别
    levelShow(val, that) {
      const index = that.orderLevelOptions.findIndex(item => item.value === val)
      const str = that.orderLevelOptions[index].name
      return str
    },
    // 订单状态
    statusShow(val, that) {
      const index = that.orderStatusOptions.findIndex(item => item.value === val)
      const str = that.orderStatusOptions[index].name
      return str
    },
    // 执行人
    duserShow(val, that) {
      const index = that.orderDuserOptions.findIndex(item => item.userId === val)
      if (index === -1) {
        return ''
      } else {
        const str = that.orderDuserOptions[index].userName
        return str
      }
    }
  }
}
</script>

<style scoped lang="less">
@import "../../assets/css/index.less";

.work-rule {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .editDialog {
    /deep/ .el-form-item {
      width: 260px;
      display: inline-block;
      .input-width-s {
        width: 160px;
      }
    }

    .el-timeline {
      .el-timeline-item {
        padding-bottom: 15px;
      }
    }

  }

}

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

</style>