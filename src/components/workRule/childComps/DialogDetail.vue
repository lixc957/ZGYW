<template>
  <el-dialog
    :title="dialogTitle"
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
      :rules="orderRule"
      style="width: 100%"
      :model="orderForm"
    >
      <el-form-item label="执行人" prop="duser" v-if="isDetailMode">
        <el-select
          v-model="orderForm.duser"
          placeholder="请选择执行人"          
          style="width: 100%"
          clearable
          :disabled="isDetailMode"
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
        <el-input v-model.trim="orderForm.name" placeholder="请输入基本描述" :disabled="isDetailMode"></el-input>
      </el-form-item>

      <el-form-item label="创建人" prop="cname" v-if="isDetailMode">
        <el-input v-model.trim="orderForm.cname" :disabled="isDetailMode"></el-input>
      </el-form-item>

      <el-form-item label="订单级别" prop="level">
        <el-select
          v-model="orderForm.level"
          placeholder="请选择订单级别"          
          style="width: 100%"
          clearable
          :disabled="isDetailMode"
        >
          <el-option
            v-for="item in orderLevelOptions"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="订单状态" prop="status" v-if="isDetailMode">
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

      <el-form-item label="所属网关" prop="gatewayId" v-if="!isDetailMode">
        <el-select
          v-model="orderForm.gatewayId"
          placeholder="请选择所属网关"          
          style="width: 100%"
          clearable
          @change="gatewayChange"
        >
          <el-option
            v-for="item in gatewayList"
            :key="item.id + 10"
            :label="item.name"
            :value="item.gatewayId"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="关联设备" prop="eqId">
        <el-select
          v-model="orderForm.eqId"
          placeholder="请选择关联设备"          
          style="width: 100%"
          clearable
          @change="$forceUpdate()"
          @visible-change="equipmentChange"
          :disabled="isDetailMode"
        >
          <el-option
            v-for="item in equipmentList"
            :key="item.id"
            :label="item.name"
            :value="item.equipmentId"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="关联告警" v-if="orderForm.alarmEvent && isDetailMode" prop="alarmEvent.name">
        <el-input v-model.trim="orderForm.alarmEvent['name']" disabled></el-input>
      </el-form-item>

      <el-form-item label="关联告警" v-if="!orderForm.alarmEvent && isDetailMode" prop="alarmEvent">
        <el-input v-model.trim="orderForm.alarmEvent" disabled></el-input>
      </el-form-item>

      <el-form-item label="驳回状态" prop="rejectStatus" v-if="isDetailMode">
        <el-select
          v-model="orderForm.rejectStatus"
          placeholder="请选择驳回状态"          
          style="width: 100%"
          clearable
          :disabled="isDetailMode"
        >
          <el-option
            v-for="item in rejectStatusOptions"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="审批信息" prop="approvalInfo" style="width: 100%" v-if="orderForm.status >= 3 && isDetailMode">
        <el-input 
          v-model.trim="orderForm.approvalInfo" 
          placeholder="请输入内容"
          :autosize="{ minRows: 1, maxRows: 5 }"
          style="width: 425px"
          type="textarea"
          :disabled="isDetailMode"
        ></el-input>
      </el-form-item>

      <el-form-item label="备注信息" prop="info" style="width: 100%">
        <el-input 
          v-model.trim="orderForm.info" 
          placeholder="请输入内容"
          :autosize="{ minRows: 1, maxRows: 5 }"
          style="width: 425px"
          type="textarea"
          :disabled="isDetailMode"
        ></el-input>
      </el-form-item>

      <div class="block" v-show="isDetailMode">
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
        <h3 style="margin-bottom: 20px">订单追踪信息</h3>
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
      <el-button class="cancel" @click="detailOrderVisible = false" v-show="!isDetailMode">取 消</el-button>
      <el-button class="confirm" @click="editSubmitForm">确 定</el-button>        
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'DialogDetail',
  props: {
    orderForm: Object, // 表单绑定值
    orderRule: Object, // 验证规则
    dispatchStatusOptions: Array, // 派单状态
    orderDuserOptions: Array, // 执行人选项
    orderLevelOptions: Array, // 订单级别选项
    orderStatusOptions: Array, // 订单状态选项
    gatewayList: Array, // 网关列表
    equipmentList: Array, // 设备列表
    rejectStatusOptions: Array, // 驳回状态
    imgOrderList: Array, // 处理信息图片列表
  },
  data() {
    return {
      detailOrderVisible: false,
      dialogTitle: '编辑工单', // 弹窗标题
      dialogMode: 'edit', // 弹窗模式
    }
  },
  methods: {
    // 弹窗关闭前
    beforeDialogClose() {
      this.$emit('close')
    },
    // 点击确定
    editSubmitForm() {
      if (this.dialogMode === 'edit') {
        this.$refs.detailOrderForm.validate(valid => {
          if(!valid) {
            // 验证不通过
            this.$notify({
              message: '验证失败',
              type: "error"
            })
            return
          }   
          this.$emit('editForm')   
        })      
      } else this.detailOrderVisible = false
      return false
    },
    // 网关值改变
    gatewayChange() {
      this.$emit('gatewayChange')
      this.$forceUpdate()
    },
    // 设备值改变
    equipmentChange(flag) {
      if (flag) {
        this.$emit('equipmentChange', true)
      }    
    },
    // 清除验证效果
    resetFields() {
      this.$refs.detailOrderForm && this.$refs.detailOrderForm.resetFields()
    },
    // 点击图片
    imgClick(index) {
      this.$emit('getBigImg', index)
    }
  },
  computed: {
    isDetailMode() {
      // 表单是否显示或者禁用
      if (this.dialogMode === 'edit') {
        return false
      } else return true
    }
  },
  filters: {
    // 过滤日期
    dateShow(val) {
      let str = val.slice(0, 19).split('T').join(' ')
      return str
    }
  }
}
</script>

<style scoped lang="less">
.editDialog {

  .block {
    max-height: 400px;
    overflow: auto;

    .img-list {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 15px;

      .img-item {
        width: 80px;
        height: 80px;
        margin-right: 10px;

        &:hover {
          cursor: pointer;
        }
        
      }
    }
  }

}


</style>