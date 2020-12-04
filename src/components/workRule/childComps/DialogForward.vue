<template>
  <el-dialog
    :visible.sync="forwardOrderVisible"
    width="420px"
    title="重新指派工单"
    modal
    :close-on-click-modal="false"
    :show-close="true"
    @close="beforeDialogClose"
    class="order-dialog"
  >
    <el-form
      ref="forwardOrderForm"
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
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button class="cancel" @click="forwardOrderVisible = false">取 消</el-button>
      <el-button class="confirm" @click="submit">确 定</el-button>
    </span>

  </el-dialog>
</template>

<script>
export default {
  name: 'DialogForward',
  props: {
    orderForm: Object, // 表单绑定值
    orderDuserOptions: Array
  },
  data() {
    return {
      forwardOrderVisible: false,
    }
  },
  methods: {
    // 弹窗关闭前
    beforeDialogClose() {
      this.$emit('close')
    },
    // 确定
    submit() {
      this.$emit('forwardSubmit')
    }
  }
}
</script>

<style scoped>

</style>