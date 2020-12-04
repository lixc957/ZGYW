<template>
  <div class="component">
    <MyBreadcrumb level1="产品管理" level2="备件管理" />
    <div class="content whiteBox">
      <div class="top">
        <el-button class="confirm" @click="addComponent">+ 添加备件</el-button>
        <div class="input">
          <el-input
            v-model.trim="component_input"
            suffix-icon="el-icon-search"
            placeholder="配件名称或厂家或类型"
            style
            v-throttle="componentSearch"
            :disabled="!$store.state.site.siteId"
          ></el-input>
        </div>
      </div>
      <div class="data-show" ref="conBox">
        <el-table 
          :data="tableData" 
          stripe 
          size="mini"
          :max-height="conHeight"
          @expand-change="toggleSpareParts" 
          ref="attachmentTable"
          border 
          style="width: 100%"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-table :data="props.row.sparePartsList" border stripe size="mini">
                <el-table-column type="index" label="序号" width="50"></el-table-column>
                <el-table-column prop="partsModel" label="备件型号"></el-table-column>
                <el-table-column prop="partsName" label="备件名称"></el-table-column>
                <el-table-column prop="partsFactory" label="厂家"></el-table-column>
                <el-table-column prop="partsClassify" label="备件分类"></el-table-column>
                <el-table-column prop="partsType" label="备件类型"></el-table-column>
                <el-table-column label="操作" width="70">
                  <template slot-scope="scope">
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
                        @click="delComponentItem(scope.row, props.row)"
                      ></el-button>
                       <!-- @click="toggleConfirm(scope.row,true,2,props.row)" -->
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column type="index" width="50">
            <template slot="header">序号</template>
          </el-table-column>
          <el-table-column prop="partsModel" label="备件型号"></el-table-column>
          <el-table-column prop="partsName" label="配件名称"></el-table-column>
          <el-table-column prop="partsFactory" label="厂家"></el-table-column>
          <el-table-column prop="partsClassify" label="备件分类"></el-table-column>
          <el-table-column prop="partsType" label="备件类型"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-tooltip
                class="item"
                effect="dark"
                offset="-20"
                content="编辑"
                placement="top-start"
              >
                <el-button
                  icon="el-icon-edit"
                  class="confirm"
                  size="mini"
                  @click="editComponent(scope.row.id)"
                ></el-button>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                offset="-20"
                content="删除"
                placement="top-start"
              >
                <el-button
                  icon="el-icon-delete"
                  class="del"
                  size="mini"
                  @click="delComponent(scope.row)"
                ></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <div class="block">
          <el-pagination
            @size-change="componentSizeChange"
            @current-change="componentCurrentChange"
            :current-page="component_currentPage"
            :page-sizes="[10,20,50]"
            :page-size="component_size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="component_total"
          ></el-pagination>
        </div>
      </div>
    </div>
    <!-- 编辑产品弹窗 -->
    <el-dialog
      :visible.sync="componentVisible"
      width="750px"
      :title="dialogTitle"
      modal
      :close-on-click-modal="false"
      :show-close="true"
      @close="beforeComponentClose"
      class="component-dialog"
    >
      <el-form
        :label-position="labelPosition"
        :rules="componentRule"
        ref="componentRef"
        label-width="80px"
        :model="editComponentForm"
        class="component-form"
      >
        <el-form-item label="备件分类" prop="partsClassify">
          <el-select
            v-model="editComponentForm.partsClassify"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            @change="classChange"
          >
            <el-option
              v-for="item in component_type_all"
              :key="item.id"
              :label="item.partsClassify"
              :value="item.partsClassify"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备件类型" prop="partsType">
          <el-select
            v-model.trim="editComponentForm.partsType"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
          >
            <el-option
              v-for="item in component_type_data"
              :key="item.id"
              :label="item.type"
              :value="item.type"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="厂家" prop="partsFactory">
          <el-select
            v-model.trim="editComponentForm.partsFactory"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
          >
            <el-option
              v-for="item in factory_data"
              :key="item.id"
              :label="item.factory"
              :value="item.factory"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备件名称" prop="partsName">
          <el-select
            v-model="editComponentForm.partsName"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
          >
            <el-option
              v-for="item in partsNameArr"
              :key="item.id"
              :label="item.partsName"
              :value="item.partsName"
            ></el-option>
          </el-select>
        </el-form-item>       
        <el-form-item label="备件型号" prop="partsModel">
          <el-input v-model.trim="editComponentForm.partsModel"></el-input>
        </el-form-item>
        <el-form-item label="备件">
          <el-cascader
            :show-all-levels="false"
            style="width:100%;"
            placeholder="选择备件"
            clearable
            v-model.trim="editComponentForm.spareIds"
            :options="sparePart"
            :props="spareProps"
          ></el-cascader>
        </el-form-item>
        <p class="data-text">保养</p>
        <el-button type="success" @click="increaseMaintainConfigList">添加保养内容</el-button>
         <!-- 保养内容区域 -->
        <div class="health-box" v-if="isMaintainShow">
          <el-row :gutter="10" class="health-title health-item" type="flex" align="middle">
            <el-col :span="5">保养内容</el-col>
            <el-col :span="4">保养周期(小时)</el-col>
            <el-col :span="5">保养方式</el-col>
            <el-col :span="3">保养价格</el-col>   
            <el-col :span="3">备件数量</el-col>         
            <el-col :span="4"></el-col>                    
          </el-row>
          <el-row :gutter="10" class="health-item" v-for="(item, index) in editComponentForm.maintainConfigList" :key="item.id">
            <el-col :span="5">

              <el-form-item>
                <el-select 
                  v-model.number="item.maintainId" 
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择或输入" 
                  @change="maintainContentChange">
                  <el-option
                    v-for="v in maintainContentOpations"
                    :key="v.maintainId"
                    :label="v.maintainContent"
                    :value="v.maintainId">
                  </el-option>
                </el-select>              
              </el-form-item>    

            </el-col>

            <el-col :span="4">
              <el-form-item>
                <el-input v-model.trim="item.maintainCycle"></el-input>              
              </el-form-item>                         
            </el-col>

            <el-col :span="5">
              <el-form-item>
                <el-select 
                  v-model.number="item.maintainType" 
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择或输入">
                  <el-option
                    v-for="v in maintainTypeOpations"
                    :key="v.id"
                    :label="v.name"
                    :value="v.name">
                  </el-option>
                </el-select>
              </el-form-item>                         
            </el-col>

            <el-col :span="3">
              <el-form-item>
                <el-input v-model.trim.number="item.maintainPrice" disabled></el-input>                
              </el-form-item>                         
            </el-col>

            <el-col :span="3">
              <el-form-item>
                <el-input v-model.trim.number="item.partNumber"></el-input>              
              </el-form-item>                         
            </el-col>

            <el-col :span="4">
              <el-button type="danger" style="margin-top: 3px" @click="delMaintainConfigList(index)">删除</el-button>                      
            </el-col>
          </el-row>
          <el-row v-if="editComponentForm.maintainConfigList.length === 0" class="no-data">暂无数据</el-row>
        </div>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="componentVisible = false">取 消</el-button>
        <el-button class="confirm" @click="editcomponentSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 备件删除 -->
    <el-dialog
      title="备件删除"
      :visible.sync="delComponentVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <div style="width: 30px;float: left;margin: -7px 8px 5px -8px;">
        <i :class="{icon: true, 'iconfont': true, 'iconjinggao1': true}"></i>
      </div>
      <span>是否确定删除备件 {{delComponentName}} ?</span>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="delComponentVisible = false">取 消</el-button>
        <el-button class="dang" @click="delComponentSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MyBreadcrumb from "../subcomponents/Mybreadcrumb";
import GLOBAL from "../../utils/global_variable";
import { findItemById } from "@/utils/index";
export default {
  components: {
    MyBreadcrumb,
  },
  data() {
    return {
      mode: 'add', // 模式，确定是新增还是编辑
      conHeight: 0,
      component_input: "", //搜索配件输入值
      tableData: [], //配件列表
      component_currentPage: 1, //分页总数
      component_size: 10, //分页大小
      component_total: 0, //总数
      componentVisible: false, //编辑新增备件弹窗
      labelPosition: "right", //表单label对齐方式
      selectedRow: {}, // 列表当前展开的行信息
      componentRule: {
        partsName: [
          {
            required: true,
            message: "请输入配件名称",
            trigger: "blur",
          },
        ],
        partsFactory: [
          {
            required: true,
            message: "请选择厂家",
            trigger: "change",
          },
        ],
        partsClassify: [
          {
            required: true,
            message: "请选择分类",
            trigger: "change",
          },
        ],
        partsType: [
          {
            required: true,
            message: "请选择类型",
            trigger: "change",
          },
        ],
        partsModel: [
          {
            required: true,
            message: "请输入型号",
            trigger: "change",
          }
        ]
      },
      // 新增编辑配件表单
      editComponentForm: {
        id: '',
        companyId: this.$store.state.site.companyId,
        partsName: "",
        partsFactory: "",
        partsClassify: "",
        partsType: "",
        partsModel: '',
        // 保养内容选项
        maintainConfigList: [],
      },
      // 保养方式选项
      maintainTypeOpations: [
        {
          id: 1, name: "自巡"
        },
        {
          id: 2, name: "外协"
        },
        {
          id: 3, name: "更换"
        }
      ],
      maintainContentOpations: [], // 保养内容选项
      factory_data: [], //所有厂家数据
      partsNameArr: [], // 弹框所有备件名称集合
      component_type_all: [], //所有备件分类
      component_type_data: [], //所有备件类型数据
      delComponentVisible: false, //配件的删除弹窗
      delComponentName: null, //将要删除的配件名称
      delComponentId: null, //将要删除配件id
      partItemId: '',// 将要备件列表二级id
      partMode: 'part', // 删除模式，part 是删除父级， item 是删除子级
      // 备件
      sparePart: [],
      spareProps: {
        children: "childrenList",
        label: "name",
        value: "id",
        emitPath: false,
        expandTrigger: "hover",
        multiple: true,
      },
    }
  },
  computed: {
    // 站点 id
    getSite() {
      return this.$store.state.site.siteId;
    },
    // 公司 id
    companyId() {
       return this.$store.state.site.searchCompanyId;
    },
    // 编辑还是新增
    dialogTitle() {
      if (this.mode === 'add') {
        return '添加备件'
      } else return '编辑备件'
    },
    // 保养内容是否显示
    isMaintainShow() {
      return this.editComponentForm.maintainConfigList && this.editComponentForm.maintainConfigList.constructor === Array
    },
  },
  watch: {
    getSite() {
      this.component_input = "";
      this.component_currentPage = 1;
      this.getComponent();
    },
  },
  created() {
    this.getComponent();
  },
  mounted() {
    this.$nextTick(() => {
      this.conHeight = this.$refs.conBox ? this.$refs.conBox.offsetHeight - 58 : 0
    });
    window.addEventListener("resize", () => {
      this.$nextTick(() => {
        this.conHeight = this.$refs.conBox ? this.$refs.conBox.offsetHeight - 58 : 0
      });
    });
  },
  methods: {
     // 展开、关闭备件列表
    async toggleSpareParts(row, expandedRows) {
      if (row.id === this.selectedRow.id) {
        return
      }
      if (findItemById(row.id, expandedRows).id) {
        this.selectedRow = row
        const res = await this.$http({
          url: '/equipment/spareParts/getByPartId',
          params: {
            partId: row.id
          }
        })
        let data = this.tableData
        data.forEach((item) => {
          if (item.id === row.id) {
            item.sparePartsList = res.data.data.sparePartsList
            return
          }
        })
        this.$nextTick(() => {
          this.$refs.attachmentTable.toggleRowExpansion(findItemById(row.id, this.tableData), false) // 切换某一行的选中状态, false 为不选中
          this.$refs.attachmentTable.toggleRowExpansion(findItemById(row.id, this.tableData), true)  // 展开表格与树形表格     
          this.$forceUpdate()
        })
      } else {
        this.selectedRow = {}
      }
    },
    // 节流获取备件列表
    componentSearch() {
      this.component_currentPage = 1
      this.getComponent()
    },
    // 获取备件列表
    getComponent() {
      this.$http
        .get("equipment/spareParts/findAll", {
          params: {
            page: this.component_currentPage - 1,
            size: this.component_size,
            name: this.component_input,
            companyId: this.$store.state.site.searchCompanyId,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.tableData = res.data.data.data;
            this.component_total = res.data.data.total;
          }
        });
    },
    // 新增配件
    addComponent() {
      this.mode = 'add'
      this.componentVisible = true
      this.getComponentAllType() // 调用备件分类接口
      this.getAllFactory() // 调用厂家接口    
      this.getClassify() // 备件下拉框详情     
      this.getPartsName() // 获取备件名称     
      // this.getMaintainType() // 获取保养方式
      this.getMaintainList() // 获取保养内容
    },
    // 分页大小改变
    componentSizeChange(size) {
      this.component_size = size
      this.component_currentPage = 1
      this.getComponent()
    },
    // 当前页改变
    componentCurrentChange(page) {
      this.component_currentPage = page
      this.getComponent()
    },
    // 查看备件
    editComponent(id) {
      this.mode = 'edit'
      this.componentVisible = true
      this.getComponentDetail(id)
    },
    // 备件详情
    getComponentDetail(id) {
      this.getAllFactory();
      this.getComponentAllType().then((val) => {
        this.detailRequest(id)
      })
    },
    // 备件下拉框详情
    async getClassify() {
      const res = await  this.$http({
        url: '/equipment/spareParts/findClassify',
        params: {
          companyId: this.companyId
        }
      })
      this.sparePart = res.data.data
    },
    // 详情请求
    async detailRequest(id) {
      const res = await this.$http
        .get("equipment/spareParts/detail", {
          params: {
            id,
          },
        })
        if (res.data.code === 0) {
          this.editComponentForm = res.data.data
          this.editComponentForm.companyId = this.$store.state.site.searchCompanyId
          var index = this.component_type_all.findIndex((item) => {
            return item.id == this.editComponentForm.classifyId
          })
          if (index >= 0) {
            this.editComponentForm.partsClassify = this.component_type_all[index].partsClassify
          }
          this.editComponentForm.spareIds = []   
          this.editComponentForm.sparePartsList &&
            this.editComponentForm.sparePartsList.forEach((item) => {
              this.editComponentForm.spareIds.push(item.id + '');
            })
        }
      // 备件下拉框详情
      this.getClassify()
      // 获取备件名称
      this.getPartsName()
      // 获取保养方式
      this.getMaintainList()
    },
    // 获取保养内容
    async getMaintainList() {
      try {
        const res = await this.$http({
          url: '/equipment/maintain/findAll',
          params: {
            companyId: this.companyId,
            page: 0,
            size: 100000000
          }
        })
        if (res.data.code === 0) {
          this.maintainContentOpations = res.data.data.maintainConfigs
        }
      } catch (error) {
        
      }
    },
    // 保养内容选项改变
    maintainContentChange(res) {
      const index = this.maintainContentOpations.findIndex(item => item.maintainId === res)
      const indey = this.editComponentForm.maintainConfigList.findIndex(item => item.maintainId === res)
      // 修改对应的价格
      this.editComponentForm.maintainConfigList[indey].maintainPrice = this.maintainContentOpations[index].maintainPrice
      // 修改对应的保养内容
      this.editComponentForm.maintainConfigList[indey].maintainContent = this.maintainContentOpations[index].maintainContent
    },
    // 获取备件名称
    async getPartsName() {
      const res = await this.$http({
        url: '/equipment/spareParts/findPartsName',
        params: {
          companyId: this.companyId
        }
      })
      this.partsNameArr = res.data.data
      this.$forceUpdate()
    },
    // 获取所有厂家
    getAllFactory() {
      this.$http
        .get("equipment/spareParts/findFactory", {
          params: {
            companyId: this.$store.state.site.searchCompanyId,
          },
        })
        .then((res) => {
          this.factory_data = res.data.data;
        })
    },
    // 获取所有的备件分类
    getComponentAllType() {
      return new Promise((resolve, reject) => {
        this.$http
          .get("/equipment/spareParts/findPartsClassify", {
            params: {
              companyId: this.companyId
            },
          })
          .then((res) => {
            if (res.data.code === 0) {
              this.component_type_all = res.data.data;
              resolve();
            }
          });
      });
    },
    // 备件分类修改
    classChange() {
      this.editComponentForm.partsType = "";
      this.getAllType(true);
    },
    // 获取所有类型
    getAllType(flag) {
      if (!flag) {
        return;
      }
      if (!this.editComponentForm.partsClassify) {
        this.$message("请先选中备件分类");
        return;
      }
      this.$http
        .get("equipment/spareParts/findType", {
          params: {
            companyId: this.companyId,
            partsClassify: this.editComponentForm.partsClassify,
          },
        })
        .then((res) => {
          this.component_type_data = res.data.data;
        });
    },
    // 新增或修改配件提交
    editcomponentSubmit() {
      this.$refs.componentRef.validate(async (valid) => {
        if (valid) {
          // 过滤数组
          this.editComponentForm.maintainConfigList = this.editComponentForm.maintainConfigList.filter(item => {
            return item.maintainContent !== '' && item.maintainCycle !== '' && item.maintainPrice !== '' && item.maintainType !== ''
          })
          // 如果备件数量为空，则删掉
          this.editComponentForm.maintainConfigList.forEach(item => {
            if (item.partNumber === '') {
              delete item['partNumber']
            }
          })

          this.editComponentForm.spareIds = this.editComponentForm.spareIds && this.editComponentForm.spareIds.join(',') // 备件数组
          this.editComponentForm.rmIds = this.editComponentForm.rmIds && this.editComponentForm.rmIds.join(',') // 删除保养内容数组

          if (this.editComponentForm.id) {
            // 编辑
            this.editComponentForm.maintainConfigList.forEach(item => item.bindId = this.editComponentForm.id)    
            this.editComponentForm.maintainConfigList = JSON.stringify(this.editComponentForm.maintainConfigList)    
            try {
              const res = await this.$http.post("equipment/spareParts/modify", this.editComponentForm)
              if (res.data.code === 0) {
                this.$notify({
                  title: "编辑成功",
                  type: "success"
                })
                this.getComponent()
              } else {
                this.$notify({
                  title: res.data.msg,
                  type: "warning",
                })
              }
            } catch (error) {
              
            }
          } else {
            // 新增
            this.editComponentForm.maintainConfigList = JSON.stringify(this.editComponentForm.maintainConfigList)
            try {
              const res = await this.$http.post("equipment/spareParts/saveParts", this.editComponentForm)
              if (res.data.code === 0) {
                this.$notify({
                  title: "新增成功",
                  type: "success"
                })
                this.getComponent()
              } else {
                this.$notify({
                  title: res.data.msg,
                  type: "warning",
                })
              }
            } catch (error) {
              
            }
            
          }
          this.componentVisible = false

          const isMaintain = this.editComponentForm.maintainConfigList instanceof Array
          this.editComponentForm.maintainConfigList = isMaintain ? this.editComponentForm.maintainConfigList : JSON.parse(this.editComponentForm.maintainConfigList)
        } else {
          this.$notify({
            title: '验证失败',
            type: "error"
          })
          return false
        }
      })
    },
    // 编辑备件弹窗关闭前
    beforeComponentClose() {
      this.editComponentForm = {
        companyId: this.companyId,
        partsClassify: "",
        partsName: "",
        partsFactory: "",
        partsType: "",
        partsModel: '',
        maintainConfigList: [],
        spareIds: []
      }      
      this.$refs.componentRef.resetFields();
    },
    // 删除配件
    delComponent(row) {
      this.delComponentVisible = true
      this.partMode = 'part'
      this.delComponentName = row.partsName
      this.delComponentId = row.id
    },
    // 删除二级配件
    delComponentItem(row, propRow) {
      this.delComponentVisible = true;
      this.partMode = 'item'
      this.delComponentName = row.partsName;
      this.delComponentId = propRow.id
      this.partItemId = row.id
    },
    // 删除配件提交
    async delComponentSubmit() {
      if (this.partMode === 'part') {
        this.$http
        .get("equipment/spareParts/remove", {
          params: {
            id: this.delComponentId,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$notify({
              title: "删除成功",
              type: "success",
            });
            if (this.tableData.length === 1 && this.component_currentPage > 1) {
              this.component_currentPage--;
            }
            this.delComponentId = null;
            this.getComponent();
          }
        })
      } else if (this.partMode === 'item') {
        try {
          const res = await this.$http({
            url: '/equipment/spareParts/deleteParts',
            params: {
              partId: this.delComponentId,
              delId: this.partItemId
            }
          })

          if (res.data.code === 0) {
            this.$notify({
              title: "删除成功",
              type: "success"
            })
          }
          const index = this.tableData.findIndex(item => this.delComponentId === item.id)
          const itemIndex = this.tableData[index].sparePartsList.findIndex(item => this.partItemId === item.id)
          this.tableData[index].sparePartsList.splice(itemIndex, 1)
          this.$forceUpdate()
        } catch (error) {}            
      } 
      this.delComponentVisible = false       
    },
    // 添加保养内容选项
    increaseMaintainConfigList() {
      const obj = {
        maintainContent: '', // 保养内容
        maintainCycle: '', // 保养周期
        maintainType: '', // 保养方式
        maintainPrice: '', // 保养价格
        partNumber: '' // 备件数量
      }
      this.editComponentForm.maintainConfigList.push(obj)
      this.$forceUpdate()
    },
    // 删除保养内容选项
    delMaintainConfigList(index) {
      // 拿到删除选项的id
      this.editComponentForm.rmIds = this.editComponentForm.rmIds ? [...this.editComponentForm.rmIds] : []  // 保养内容选项删除的id数组
      const maintainId = this.editComponentForm.maintainConfigList[index].id
      if (maintainId) { // 如果存在则添加
        this.editComponentForm.rmIds.push(maintainId)
      }
      this.editComponentForm.maintainConfigList.splice(index, 1)
      this.$forceUpdate()
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../assets/css/index.less";
.component {
  height: 100%;
  @dis-flex();
  @flex-c();
  .content{
        flex: 1;
    -webkit-box-flex: 1;
    -moz-box-flex: 1;
    background-color: rgba(67, 92, 112);
    height: 0;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
  .top {
    @dis-flex();
    justify-content: space-between;
  }
  .data-show {
    box-shadow: -2px 0 3px -1px #999, 0 2px 3px -1px #aaa, 2px 0 3px -1px #999;
    margin: 3px;
    padding: 8px;
    @flex-1();
    height: 0;
    overflow: hidden;
    .block {
      float: right;
    }
  }
  .component-dialog {
    /deep/ .el-select {
      width: 100%;
    }
    .data-text {
      color: skyblue;
      padding-bottom: 5px;
      border-bottom: 1px solid #ccc;
      margin-bottom: 10px;
    }
    .health-box {
      margin-top: 15px;
      color: #fff;
      font-size: 14px;
      overflow: hidden;

      .health-item {
        &.health-title {
          background: @table-th-bgc;
          border-bottom: none;
        }
        background: #ffffff;
        width: 100%;
        padding: 10px;
        padding-left: 25px;
        margin-left: 0 !important;
        border-bottom: 2px solid #ebeef5;
        /deep/ .el-form-item {
          margin-bottom: 0 !important;

          .el-form-item__content {
            margin-left: 0 !important;

            .el-input__inner::placeholder {
              font-size: 12px;
            }

          }
        }
      }

      .no-data {
        height: 62px;
        line-height: 62px;
        text-align: center;
        color: #9093a6;
        border-bottom: 2px solid #ebeef5;
      }
    }
  }
}
</style>