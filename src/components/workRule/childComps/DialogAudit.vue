<template>
  <el-dialog
    :visible.sync="aduitOrderVisible"
    width="420px"
    title="审核工单"
    modal
    :close-on-click-modal="false"
    :show-close="true"
    @close="beforeDialogClose"
    class="order-dialog"
  >
    <el-form
      ref="aduitOrderForm"
      label-width="80px"
      :rules="orderRule"
      :model="orderForm"
      class="order-form"
    >
      <el-form-item label="审批信息" prop="approvalInfo">
        <el-input 
          v-model.trim="orderForm.approvalInfo" 
          placeholder="请输入内容"
          :autosize="{ minRows: 1, maxRows: 5 }"
          type="textarea"
        ></el-input>
      </el-form-item>

      <el-form-item label="审批状态" prop="radio">
        <el-radio-group v-model="orderForm.radio">
          <el-radio :label="0">不通过</el-radio>
          <el-radio :label="1">通过</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button class="cancel" @click="aduitOrderVisible = false">取 消</el-button>
      <el-button class="confirm" @click="submit">确 定</el-button>
    </span>

  </el-dialog>
</template>

<script>
export default {
  name: 'DialogAudit',
  props: {
    orderForm: Object, // 表单绑定值
    orderRule: Object // 验证规则
  },
  data() {
    return {
      aduitOrderVisible: false,
    }
  },
  methods: {
    // 弹窗关闭前
    beforeDialogClose() {
      this.$emit('close')
    },
    // 确定
    submit() {
      this.$refs.aduitOrderForm.validate(valid => {
        if(!valid) {
          // 验证不通过
          this.$notify({
            message: '验证失败',
            type: "error"
          })
          return
        }      
        this.$emit('aduitSubmit')       
        return false
      })  
    }
  }
}
</script>

<style scoped>

</style>