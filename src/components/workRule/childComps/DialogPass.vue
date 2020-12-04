<template>
  <el-dialog
    :visible.sync="passOrderVisible"
    width="420px"
    title="转交工单"
    modal
    :close-on-click-modal="false"
    :show-close="true"
    @close="beforeDialogClose"
    class="order-dialog"
  >
    <el-form
      ref="passOrderForm"
      label-width="80px"
      :model="orderForm"
      class="order-form"
    >
      <el-form-item prop="deliverInfo" :rules="{ required: true, message: '请输入内容', trigger: 'change' }">
        <el-input 
          v-model.trim="orderForm.deliverInfo" 
          placeholder="请输入内容"
          type="textarea"
          :rows="5"
        ></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button class="cancel" @click="passOrderVisible = false">取 消</el-button>
      <el-button class="confirm" @click="submit">确 定</el-button>
    </span>
    
  </el-dialog>
</template>

<script>
export default {
  name: 'DialogPass',
  props: {
    orderForm: Object
  },
  data() {
    return {
      passOrderVisible: false
    }
  },
  methods: {
    beforeDialogClose() {
      this.$emit('close')
      this.$refs.passOrderForm.resetFields()
    },
    submit() {
      this.$refs.passOrderForm.validate(valid => {
        if(!valid) {
          // 表单验证不通过
          this.$notify({
            message: '验证失败',
            type: "error"
          })
          return
        }
        this.$emit('passSubmit')  
      })
    }
  }
}
</script>

<style scoped lang="less">
.order-dialog /deep/ .el-form-item__content {
  margin-left: 0 !important;
}
</style>