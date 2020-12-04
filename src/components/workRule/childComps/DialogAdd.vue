<template>
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

      <el-form-item label="所属网关" prop="gatewayId">
        <el-select
          v-model="orderForm.gatewayId"
          placeholder="请选择所属网关"          
          style="width: 100%"
          clearable
          @change="gatewayChange"
        >
          <el-option
            v-for="item in gatewayList"
            :key="item.id"
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
          @change="equipmentChange"
          @visible-change="getEquipmentList"
        >
          <el-option
            v-for="item in equipmentList"
            :key="item.id"
            :label="item.name"
            :value="item.equipmentId"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="备注信息" prop="info">
        <el-input 
          v-model.trim="orderForm.info" 
          placeholder="请输入内容"
          :autosize="{ minRows: 1, maxRows: 5 }"
          type="textarea"
        ></el-input>
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button class="cancel" @click="addOrderVisible = false">取 消</el-button>
      <el-button class="confirm" @click="addSubmitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'DialogAdd',
  props: {
    orderForm: Object, // 表单绑定值
    orderRule: Object, // 表单验证规则
    orderDuserOptions: Array,
    orderLevelOptions: Array,
    gatewayList: Array,
    equipmentList: Array
  },
  data() {
    return {
      addOrderVisible: false
    }
  },
  methods: {
    beforeDialogClose() {
      this.$emit('close')
    },
    // 清除验证
    resetFields() {
      this.$refs.addOrderForm && this.$refs.addOrderForm.resetFields()
    },
    // 所属网关改变
    gatewayChange() {
      this.$emit('gatewayChange')
    },
    // 关联设备改变
    equipmentChange() {
      this.$forceUpdate()
    },
    // 关联设备展开
    getEquipmentList(flag) {
      if (flag) {
        this.$emit('equipmentChange', true)
      }    
    },
    // 点击新增弹窗确定
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
        this.$emit('addSubmit')       
        return false
      })        
    }
  },
}
</script>

<style scoped>

</style>