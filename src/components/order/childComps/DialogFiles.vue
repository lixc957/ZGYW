<template>
  <el-dialog
    title="处理工单"
    :visible.sync="filesOrderVisible"
    width="650px"
    modal
    :close-on-click-modal="false"
    :show-close="true"
    class="editDialog"
    @close="beforeDialogClose"
  >
    <el-form
      ref="filesOrderForm"
      label-width="80px"
      :rules="orderRule"
      :model="orderForm"
      class="order-form"
    >
      <el-form-item label="处理信息" prop="msg">
        <el-input 
          v-model.trim="orderForm.msg" 
          placeholder="请输入内容"
          :autosize="{ minRows: 1, maxRows: 5 }"
          type="textarea"
        ></el-input>
      </el-form-item>

      <el-form-item label="上传图片">
        <el-upload
          action="#"
          ref="upload_img"
          list-type="picture-card"
          multiple
          :limit="9"
          name="files"
          :auto-upload="false"
          :http-request="uploadSectionFile"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button class="cancel" @click="filesOrderVisible = false">取 消</el-button>
      <el-button class="confirm" @click="submit">确 定</el-button>
    </span>
    <div class="loading" 
      v-loading="loading"
      element-loading-text="上传中"
      :class="{ isLoading: loading }"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.3)"></div>
  </el-dialog>
</template>

<script>
export default {
  name: 'DialogFiles',
  props: {
    orderForm: Object, // 表单绑定值
    orderRule: Object // 验证规则
  },
  data() {
    return {
      filesOrderVisible: false,
      dialogImageUrl: '',
      dialogVisible: false,
      fileCount: '', // 图片张数
      fileList: [], // 图片数组
      loading: false
    }
  },
  methods: {
    // 弹窗关闭前
    beforeDialogClose() {
      this.$refs.upload_img.uploadFiles = [] // 清空图片列表
      this.fileList = [] // 清空图片数组
      this.loading = false // 取消 loading 状态
      this.$emit('close')
    },
    // 清空表单
    resetFields() {
      this.$refs.filesOrderForm && this.$refs.filesOrderForm.resetFields()
    },
    // 自定义上传图片方法
    uploadSectionFile(file) {     
      this.fileCount-- // 当上传成功时,图片数量减1
      this.fileList.push(file.file)
      if (this.fileCount === 0) { // 图片全部上传完毕发射事件
        this.$emit('filesSubmit', this.fileList)
      }         
    },
    // 确定
    submit() {
      this.$refs.filesOrderForm.validate(valid => {
        if(!valid) {
          // 表单验证不通过
          this.$notify({
            message: '验证失败',
            type: "error"
          })
          return
        }  
        // 如果没有传图片
        if (this.$refs.upload_img.uploadFiles.length === 0) {   
          this.$emit('filesSubmit')
          return
        }    
        // 如果传了图片
        // 验证图片
        const fileList = this.$refs.upload_img.uploadFiles

        let reg = /\.(jpg|jpeg|png)$/
        const isImg = fileList.every(v => reg.test(v.name)) // 判断文件类型
        if (!isImg) { // 不是图片文件
          this.$message.error('上传头像图片只能是 JPG or PNG 格式!')
          return
        }

        this.fileCount = this.$refs.upload_img.uploadFiles.length // 获取图片张数
        this.$refs.upload_img.submit()  
        this.loading = true  
      })  
    },
  }
}
</script>

<style scoped lang="less">
.loading {
  position: absolute !important;
  width: 635px;
  height: calc(100% - 51px);
  top: 45px;
  left: 6px;
  z-index: -1;

  &.isLoading {
    z-index: 999;
  }
}
</style>