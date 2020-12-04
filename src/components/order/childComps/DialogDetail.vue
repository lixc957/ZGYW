<template>
  <el-dialog
    title="工单详情"
    :visible.sync="detailOrderVisible"
    width="650px"
    modal
    :close-on-click-modal="false"
    :show-close="true"
    class="editDialog"
    @close="beforeDialogClose"
  >
    <el-form
      label-width="100px"
      ref="detailOrderForm"
      style="width: 100%"
      :model="orderForm"
    >
      <el-form-item label="执行人" prop="duser">
        <el-select
          v-model="orderForm.duser"
          placeholder="请选择执行人"          
          style="width: 100%"
          clearable
          disabled
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
        <el-input v-model.trim="orderForm.name" placeholder="请输入基本描述" disabled></el-input>
      </el-form-item>

      <el-form-item label="创建人" prop="cname">
        <el-input v-model.trim="orderForm.cname" disabled></el-input>
      </el-form-item>

      <el-form-item label="订单级别" prop="level">
        <el-select
          v-model="orderForm.level"
          placeholder="请选择订单级别"          
          style="width: 100%"
          clearable
          disabled
        >
          <el-option
            v-for="item in orderLevelOptions"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="订单状态" prop="status">
        <el-select
          v-model="orderForm.status"
          placeholder="请选择订单状态"          
          style="width: 100%"
          disabled
        >
          <el-option
            v-for="item in orderStatusOptions"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="关联设备" prop="eqId">
        <el-select
          v-model="orderForm.eqId"
          placeholder="请选择关联设备"          
          style="width: 100%"
          clearable
          disabled
        >
          <el-option
            v-for="item in equipmentList"
            :key="item.equipmentId"
            :label="item.name"
            :value="item.equipmentId"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="关联告警" v-if="orderForm.alarmEvent" prop="alarmEvent.name">
        <el-input v-model.trim="orderForm.alarmEvent['name']" disabled></el-input>
      </el-form-item>

      <el-form-item label="关联告警" v-else prop="alarmEvent">
        <el-input v-model.trim="orderForm.alarmEvent" disabled></el-input>
      </el-form-item>

      <el-form-item label="驳回状态" prop="rejectStatus">
        <el-select
          v-model="orderForm.rejectStatus"
          placeholder="请选择驳回状态"          
          style="width: 100%"
          clearable
          disabled
        >
          <el-option
            v-for="item in rejectStatusOptions"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="审批信息" prop="approvalInfo" style="width: 100%" v-if="orderForm.status >= 3">
        <el-input 
          v-model.trim="orderForm.approvalInfo" 
          placeholder="请输入内容"
          :autosize="{ minRows: 1, maxRows: 5 }"
          style="width: 425px"
          type="textarea"
          disabled
        ></el-input>
      </el-form-item>

      <el-form-item label="备注信息" prop="info" style="width: 100%">
        <el-input 
          v-model.trim="orderForm.info" 
          placeholder="请输入内容"
          :autosize="{ minRows: 1, maxRows: 5 }"
          style="width: 425px"
          type="textarea"
          disabled
        ></el-input>
      </el-form-item>

      <div class="block">
        <div class="handle-box">
          <el-button
            size="mini"
            class="confirm fl"
            v-if="orderForm.status === 1"
            :style="{ marginBottom: '15px' }"
            @click="handleClick(1)"
          >处理订单</el-button>
          <el-button
            size="mini"
            class="confirm fl"
            :style="{ marginBottom: '15px' }"
            v-if="orderForm.status === 2"
            @click="handleClick(2)"
          >提交审核</el-button>
        </div>
        <div class="img-list" v-if="imgOrderList.length">
          <img 
            :src="item" 
            alt="" 
            v-for="(item, index) in imgOrderList" 
            :key="index" 
            class="img-item"
            title="点击放大" 
            @click="imgClick(index)">
        </div>
        <h3 style="margin: 15px 0">订单追踪信息</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in orderForm.orderTrails"
            :key="index"
            :type="activity.type"
            :timestamp="activity.time | dateShow">
            {{activity.infoMes}}
          </el-timeline-item>
        </el-timeline>
      </div>
        
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button class="confirm" @click="detailOrderVisible = false">确 定</el-button>        
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'DialogDetail',
  props: {
    orderForm: Object,
    equipmentList: Array,
    orderDuserOptions: Array,
    imgOrderList: Array
  },
  data() {
    return {
      detailOrderVisible: false, // 弹框绑定值,默认关闭
      rejectStatusOptions: [ // 驳回状态选项
        { value: 0, name: '正常' },
        { value: 1, name: '驳回单' }
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
    }
  },
  methods: {
    // 弹窗关闭前
    beforeDialogClose() {
      this.$emit('close')
    },
    // 清空表单验证
    resetFields() {
      this.$refs.detailOrderForm && this.$refs.detailOrderForm.resetFields()
    },
    // 点击处理按钮
    handleClick(res) {
      if (res === 1) {
        // 处理订单
        this.$emit('handleOrder')
      } else if (res === 2) {
        // 提交审核
        this.$emit('submitOrder')
      }
    },
    // 点击图片
    imgClick(index) {
      this.$emit('getBigImg', index)
    }
  },
  filters: {
    // 创建时间
    dateShow(val) {
      let str = val.slice(0, 19).split('T').join(' ')
      return str
    },
  }
}
</script>

<style scoped lang="less">

.editDialog {
  .el-form-item {
    width: 260px;
    display: inline-block;
    .input-width-s {
      width: 160px;
    }
  }

  .block {
    max-height: 400px;
    overflow: auto;

    .handle-box::after {
      content: '';
      clear: both;
      display: block;
    }

    .handle-box {
      zoom: 1;
    }

    .img-list {
      display: flex;
      flex-wrap: wrap;

      .img-item {
        width: 80px;
        height: 80px;
        margin-right: 10px;

        &:hover {
          cursor: pointer;
        }
      }
    }

    .el-timeline {
      .el-timeline-item {
        padding-bottom: 15px;
      }
    }
    
  }

}

</style>