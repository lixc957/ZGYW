<template>
  <el-dialog
    :visible.sync="rejectOrderVisible"
    width="420px"
    title="驳回工单"
    modal
    :close-on-click-modal="false"
    :show-close="true"
    @close="beforeDialogClose"
    class="order-dialog"
  >
    <el-form
      ref="rejectOrderForm"
      label-width="80px"
      :model="orderForm"
      class="order-form"
    >
      <el-form-item prop="rejectInfo">
        <el-input 
          v-model.trim="orderForm.rejectInfo" 
          placeholder="请输入内容"
          type="textarea"
          :rows="5"
        ></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button class="cancel" @click="rejectOrderVisible = false">取 消</el-button>
      <el-button class="confirm" @click="submit">确 定</el-button>
    </span>
    
  </el-dialog>
</template>

<script>
export default {
  name: 'DialogReject',
  props: {
    orderForm: Object, // 表单绑定值
  },
  data() {
    return {
      rejectOrderVisible: false
    }
  },
  methods: {
    // 弹窗关闭前
    beforeDialogClose() {
      this.$emit('close')
    },
    submit() {
      this.$emit('rejectSubmit')
    }
  }
}
</script>

<style scoped lang="less">
.order-dialog /deep/ .el-form-item__content {
  margin-left: 0 !important;
}
</style>