<template>
  <div class="product">
    <MyBreadcrumb level1="产品管理" level2="产品库" />
    <div class="content whiteBox" ref="conBox">
      <!-- <el-tabs type="border-card" v-model="activeName" @tab-click="tabChange"> -->
      <!-- 产品 -->
      <!-- <el-tab-pane label="产品" name="first"> -->
      <div class="product-branch">
        <div class="top">
          <el-button class="confirm" @click="addProduct">+ 添加产品</el-button>
          <div class="input">
            <el-input
              v-model.trim="product_input"
              suffix-icon="el-icon-search"
              placeholder="产品或厂家或类型"
              style
              v-throttle="productSearch"
              :disabled="!$store.state.site.siteId"
            ></el-input>
          </div>
        </div>
        <div class="table">
          <el-table
            ref="productTable"
            stripe
            size="mini"
            @expand-change="toggleSpareParts"
            :data="product_data"
            border
            style="width: 100%"
            :max-height="conHeight"
          >
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-table :data="props.row.spareParts" border stripe size="mini">
                  <el-table-column type="index" label="序号" width="50"></el-table-column>
                  <el-table-column prop="partsModel" label="备件型号"></el-table-column>
                  <el-table-column prop="partsName" label="备件名称"></el-table-column>
                  <el-table-column prop="partsFactory" label="厂家"></el-table-column>
                  <el-table-column prop="partsClassify" label="备件分类"></el-table-column>
                  <el-table-column prop="partsType" label="备件类型"></el-table-column>
                  <!-- <el-table-column prop="partsType" label="分类 / 类型">
                    <template
                      slot-scope="scope"
                    >{{scope.row.partsClassify}} / {{scope.row.partsType}}</template>
                  </el-table-column> -->
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
                          @click="toggleConfirm(scope.row,true,2,props.row)"
                        ></el-button>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="50"></el-table-column>
            <el-table-column prop="model" label="产品型号"></el-table-column>
            <el-table-column prop="providerName" label="厂家"></el-table-column>
            <el-table-column prop="productType" label="类型"></el-table-column>
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <!-- <el-button @click="editProduct(scope.row)" type="text" size="small">编辑</el-button> -->
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
                    @click="editProduct(scope.row)"
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
                    @click="toggleConfirm(scope.row,true,1)"
                  ></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
          <div class="block">
            <el-pagination
              @size-change="productSizeChange"
              @current-change="productCurrentChange"
              :current-page="product_currentPage"
              :page-sizes="[10,20,50]"
              :page-size="product_size"
              layout="total, sizes, prev, pager, next, jumper"
              :total="product_total"
            ></el-pagination>
          </div>
        </div>
      </div>
    </div>
    <!-- --------------------------产品 -->
    <!-- 编辑产品弹窗 -->
    <el-dialog
      :visible.sync="productVisible"
      width="750px"
      :title="dialogTitle"
      modal
      :close-on-click-modal="false"
      :show-close="true"
      @close="beforeProductClose"
      class="product-dialog"
    >
      <el-form
        :label-position="labelPosition"
        :rules="productRule"
        ref="productRef"
        label-width="80px"
        :model="editProductForm"
        class="product-form"
      >
        <el-form-item label="型号" prop="model">
          <el-input v-model.trim="editProductForm.model"></el-input>
        </el-form-item>
        <el-form-item label="厂家" prop="providerName">
          <el-select
            filterable
            allow-create
            default-first-option
            v-model.trim="editProductForm.providerName"
            placeholder="请选择厂家"
            @visible-change="searchFactoryChange"
            @change="setInfo"
          >
            <el-option
              v-for="item in factory_data"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品类型" prop="productType">
          <el-select
            filterable
            allow-create
            default-first-option
            v-model.trim="editProductForm.productType"
            @visible-change="searchTypeChange"
          >
            <el-option
              v-for="item in product_type_data"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input
            @change="changeInput"
            v-model.trim="editProductForm.factoryName"
            placeholder="请输入厂家联系人"
          ></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model.trim="editProductForm.factoryPhone" placeholder="请输入厂家联系电话"></el-input>
        </el-form-item>
        <el-form-item label="备件">
          <el-cascader
            :show-all-levels="false"
            style="width:100%;"
            placeholder="选择备件"
            clearable
            v-model.trim="editProductForm.spareIds"
            :options="sparePart"
            :props="spareProps"
          ></el-cascader>
          <!-- <el-select
            filterable
            allow-create
            default-first-option
            v-model.trim="editProductForm.spareId"
            @visible-change="searchTypeChange"
          >
            <el-option v-for="item in sparePart" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>-->
        </el-form-item>

        <!-- 保养内容 -->
        <div class="health-bigbox" v-if="isMaintainShow">
          <p class="data-text">保养</p>
          <el-button type="success" @click="inMaintainConfigList">添加保养内容</el-button>
          <!-- 保养内容区域 -->
          <div class="health-box">
            <el-row :gutter="10" class="health-title health-item" type="flex" align="middle">
              <el-col :span="5">保养内容</el-col>
              <el-col :span="4">保养周期(小时)</el-col>
              <el-col :span="5">保养方式</el-col>
              <el-col :span="3">保养价格</el-col>   
              <el-col :span="3">备件数量</el-col>         
              <el-col :span="4"></el-col>                   
            </el-row>
            <el-row :gutter="10" class="health-item" v-for="(item, index) in editProductForm.maintainConfigs" :key="item.maintainId">

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
                <el-button type="danger" style="margin-top: 3px" @click="delConfigList(index, 'maintainConfigs')">删除</el-button>                      
              </el-col>
            </el-row>
            <el-row v-if="editProductForm.maintainConfigs.length === 0" class="no-data">暂无数据</el-row>
          </div>
        </div>

        <!-- 监控内容 -->
        <div class="health-bigbox" style="margin-top: 25px" v-if="isMonitorShow">
          <p class="data-text">监控</p>
          <el-button type="success" @click="inMonitorConfigList">添加监控内容</el-button>
          <!-- 监控内容区域 -->
          <div class="health-box">
            <el-row :gutter="10" class="health-title health-item" type="flex" align="middle">
              <el-col :span="10">监控内容</el-col>
              <el-col :span="10">监控规则</el-col>  
              <el-col :span="4"></el-col>                    
            </el-row>
            <el-row :gutter="10" class="health-item" v-for="(item, index) in editProductForm.monitorConfigs" :key="item.id">
              <el-col :span="10">
                <el-form-item>
                  <el-input v-model.trim="item.monitorContent"></el-input>              
                </el-form-item>                         
              </el-col>

              <el-col :span="10">
                <el-form-item>
                  <el-select v-model.number="item.monitorRules" placeholder="请选择">
                    <el-option
                      v-for="v in monitorTypeOpations"
                      :key="v.id"
                      :label="v.name"
                      :value="v.name">
                    </el-option>
                  </el-select>
                </el-form-item>                         
              </el-col>

              <el-col :span="4">
                <el-button type="danger" style="margin-top: 3px" @click="delConfigList(index, 'monitorConfigs')">删除</el-button>                      
              </el-col>
            </el-row>
            <el-row v-if="editProductForm.monitorConfigs.length === 0" class="no-data">暂无数据</el-row>
          </div>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="productVisible = false">取 消</el-button>
        <el-button class="confirm" @click="editProductSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- --------------------------类型 -->
    <!-- 编辑类型弹窗 -->
    <el-dialog
      :visible.sync="typeVisible"
      width="500px"
      title="编辑类型"
      modal
      :close-on-click-modal="false"
      :show-close="true"
      @close="beforeTypeClose"
      class="type-dialog"
    >
      <el-form
        :label-position="labelPosition"
        :rules="typeRule"
        ref="typeRef"
        label-width="80px"
        :model="editTypeForm"
        class="type-form"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model.trim="editTypeForm.name" placeholder="产品类型名称"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="typeVisible = false">取 消</el-button>
        <el-button class="confirm" @click="editTypeSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- --------------------------厂家 -->
    <!-- 编辑厂家弹窗 -->
    <el-dialog
      :visible.sync="factoryVisible"
      width="500px"
      title="编辑厂家"
      modal
      :close-on-click-modal="false"
      :show-close="true"
      @close="beforeFactoryClose"
      class="factory-dialog"
    >
      <el-form
        :label-position="labelPosition"
        :rules="factoryRule"
        ref="factoryRef"
        label-width="80px"
        :model="editFactoryForm"
        class="factory-form"
      >
        <el-form-item label="厂家名称" prop="name">
          <el-input v-model.trim="editFactoryForm.name" placeholder="公司全称"></el-input>
        </el-form-item>
        <el-form-item label="名称缩写" prop="simpleName">
          <el-input v-model.trim="editFactoryForm.simpleName" placeholder="公司简介"></el-input>
        </el-form-item>
        <el-form-item label="官方网址" prop="url">
          <el-input v-model.trim="editFactoryForm.url" placeholder="格式：http://xxxxx"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model.trim="editFactoryForm.contactPerson" placeholder="请输入厂家联系人"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model.trim="editFactoryForm.contactPhone" placeholder="请输入厂家联系电话"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="factoryVisible = false">取 消</el-button>
        <el-button class="confirm" @click="editFactorySubmit">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="confirmVisible" width="370px">
      <div class="tips-con">
        确认删除&nbsp;
        <mark>{{selectedRowType==1?selectedRow.model:selectedRow.partsName}}&nbsp;</mark>吗？
      </div>
      <div slot="footer">
        <el-button class="cancel" @click="toggleConfirm({},false)">取 消</el-button>
        <el-button class="confirm" @click="deleteAction">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MyBreadcrumb from "../subcomponents/Mybreadcrumb";
// 引入深拷贝
import { deepClone, getUUIDInt, findItemById } from "@/utils/index";
export default {
  components: {
    MyBreadcrumb,
  },
  data() {
    return {
      conHeight: 0,
      activeName: "first",
      confirmVisible: false,
      selectedRow: {},
      selectedRowType: 0,
      option: [],
      // 弹窗
      dialogTitle: "添加产品",
      // ----------------产品
      product_data: [],
      product_size: 10,
      product_total: 0,
      product_currentPage: 1,
      product_input: "",
      productVisible: false,
      productRule: {
        model: [
          {
            required: true,
            message: "请输入名称",
            trigger: "blur",
          },
        ],
        providerName: [
          {
            required: true,
            message: "请选择厂家",
            trigger: "change",
          },
        ],
        productType: [
          {
            required: true,
            message: "请选择类型",
            trigger: "change",
          },
        ],
      },
      editProductForm: {
        model: null,
        providerId: null,
        typeId: null,
        // 保养内容选项
        maintainConfigs: [], 
        // 监控内容选项
        monitorConfigs: [],
        monitorTypeOpations: [{
          id: 1, name: '>'
        }, {
          id: 2, name: '<'
        }, {
          id: 3, name: '='
        }]
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
      // 监控规则选项
      monitorTypeOpations: [
        {
          id: 1, name: ">"
        },
        {
          id: 2, name: "<"
        },
        {
          id: 3, name: "="
        }
      ],
      maintainContentOpations: [], // 保养内容下拉框选项
      labelPosition: "right",
      // ------------产品类型
      product_type_data: [],
      type_size: 10,
      type_total: 0,
      type_currentPage: 1,
      type_input: "",
      typeVisible: false,
      typeRule: {
        name: [
          {
            required: true,
            message: "请输入名称",
            trigger: "blur",
          },
        ],
      },
      editTypeForm: {
        name: null,
      },
      // ----------------厂家
      factory_data: [],
      factory_size: 10,
      factory_total: 0,
      factory_currentPage: 1,
      factory_input: "",
      factoryVisible: false,
      factoryRule: {
        name: [
          {
            required: true,
            message: "请输入名称",
            trigger: "blur",
          },
        ],
      },
      editFactoryForm: {
        name: null,
        url: null,
        contactPerson: null,
        contactPhone: null,
        companyId: this.$store.state.site.searchCompanyId,
        simpleName: null,
        spareIdsArr: [],
        factoryName: "",
        factoryPhone: "",
      },
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
      // 选中的产品
      selectedProduct: {},
    };
  },
  computed: {
    watchSiteChange() {
      return this.$store.state.site.siteId;
    },
    // 保养内容是否显示
    isMaintainShow() {
      return this.editProductForm.maintainConfigs && this.editProductForm.maintainConfigs.constructor === Array
    },
    // 监控内容是否显示
    isMonitorShow() {
      return this.editProductForm.monitorConfigs && this.editProductForm.monitorConfigs.constructor === Array
    },
    // 公司 id
    companyId() {
       return this.$store.state.site.searchCompanyId;
    },
  },
  watch: {
    // 初始化数据
    watchSiteChange(newVal, oldVal) {
      this.product_input = this.type_input = this.factory_input = "";
      this.product_currentPage = this.type_currentPage = this.factory_currentPage = 1;
      this.product_size = this.type_size = this.factory_size = 10;
      switch (this.activeName) {
        case "first":
          this.productInfoSearch();
          break;
        case "second":
          this.typeInfoSearch();
          break;
        case "third":
          this.factoryInfoSearch();
          break;
      }
    },
  },
  created() {
    this.productInfoSearch();
    this.getSparePart();
  },
  mounted() {
    this.$nextTick(() => {
      this.conHeight =
        this.$refs.conBox && this.$refs.conBox.offsetHeight - 100;
    });
    window.addEventListener("resize", () => {
      this.$nextTick(() => {
        this.conHeight =
          this.$refs.conBox && this.$refs.conBox.offsetHeight - 100;
      });
    });
  },
  methods: {
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
      const indey = this.editProductForm.maintainConfigs.findIndex(item => item.maintainId === res)
      // 修改对应的价格
      this.editProductForm.maintainConfigs[indey].maintainPrice = this.maintainContentOpations[index].maintainPrice
      // 修改对应的保养内容
      this.editProductForm.maintainConfigs[indey].maintainContent = this.maintainContentOpations[index].maintainContent
    },
    // 添加保养内容
    inMaintainConfigList() {
      const obj = {
        maintainContent: '', // 保养内容
        maintainCycle: '', // 保养周期
        maintainType: '', // 保养方式
        maintainPrice: '', // 保养价格,
        partNumber: '' // 备件数量
      }
      this.editProductForm.maintainConfigs.push(obj)
      this.$forceUpdate()
    },
    // 添加监控内容
    inMonitorConfigList() {
      const obj = {
        monitorContent: '', // 监控内容
        monitorRules: '' // 监控规则 
      }
      this.editProductForm.monitorConfigs.push(obj)
      this.$forceUpdate()
    },
    // 删除监控内容
    delConfigList(index, element) {
      
      if (element === 'maintainConfigs') { // 保养内容
        // 拿到删除选项的id
        this.editProductForm.rvMainIds = this.editProductForm.rvMainIds ? [...this.editProductForm.rvMainIds] : []  // 保养内容选项删除的id数组
        const maintainId = this.editProductForm.maintainConfigs[index].id
        if (maintainId) { // 如果存在则添加
          this.editProductForm.rvMainIds.push(maintainId)
        }
      }

      if (element === 'monitorConfigs') { // 监控内容
        // 拿到删除选项的id
        this.editProductForm.rvMonIds = this.editProductForm.rvMonIds ? [...this.editProductForm.rvMonIds] : []  // 监控内容选项删除的id数组
        const monitorId = this.editProductForm.monitorConfigs[index].id
        if (monitorId) { // 如果存在则添加
          this.editProductForm.rvMonIds.push(monitorId)
        }
      }
      
      this.editProductForm[element].splice(index, 1)
      this.$forceUpdate()
    },
    changeInput(val) {
      // console.log(val);
    },
    // 设置联系人和联系方式
    setInfo(value) {
      let factory = findItemById(value, this.factory_data) || {};
      // vue 添加新属性需要双向绑定用this.$set(obj,propert,value)
      this.$set(this.editProductForm, "factoryName", factory.contactPerson);
      this.$set(this.editProductForm, "factoryPhone", factory.contactPhone);
    },
    // 打开/关闭删除弹窗
    toggleConfirm(row, tag, type, product) {
      this.selectedRow = row;
      this.selectedProduct = product || {};
      this.selectedRowType = type || 0;
      this.confirmVisible = tag;
    },
    // 展开、关闭备件列表
    toggleSpareParts(row, expandedRows) {
      if (row.id == this.selectedRow.id) {
        return;
      }
      if (findItemById(row.id, expandedRows).id) {
        this.selectedRow = row;
        // 展开
        this.$http
          .get("equipment/partList/findAll", {
            params: {
              productId: row.id,
            },
          })
          .then((res) => {
            if (res.data.code == 0) {
              let data = this.product_data;
              data.forEach((item) => {
                if (item.id == row.id) {
                  item.spareParts = res.data.data.sparePartsList;
                  return;
                }
              });
              this.$nextTick(() => {
                this.$refs.productTable.toggleRowExpansion(
                  findItemById(row.id, this.product_data),
                  false
                );
                this.$refs.productTable.toggleRowExpansion(
                  findItemById(row.id, this.product_data),
                  true
                );
                this.$forceUpdate();
              });
            }
          });
      } else {
        this.selectedRow = {};
      }
    },
    // 删除产品\备件
    deleteAction() {
      let url = "",
        obj = {};
      if (this.selectedRowType == 1) {
        // 产品
        url = "equipment/product/remove";
        obj = { params: { id: this.selectedRow.id } };
      } else if (this.selectedRowType == 2) {
        // 备件
        url = "equipment/product/deleteParts";
        obj = {
          params: {
            partsId: this.selectedRow.id,
            productId: this.selectedProduct.id,
          },
        };
      }
      this.$http.get(url, obj).then((res) => {
        if (res.data.code == 0) {
          this.$notify({
            message: "删除成功",
            type: "success",
          });
          if (this.selectedRowType == 1) {
            this.productInfoSearch();
          } else if (this.selectedRowType == 2) {
            this.$refs.productTable.toggleRowExpansion(
              findItemById(this.selectedProduct.id, this.product_data),
              false
            );
            this.$refs.productTable.toggleRowExpansion(
              findItemById(this.selectedProduct.id, this.product_data),
              true
            );
          }
        } else {
          this.$notify({
            message: res.data.message,
            type: "error",
          });
        }
        this.toggleConfirm({}, false);
      });
    },
    // 获取备件
    getSparePart() {
      this.$http
        .get("equipment/spareParts/findClassify", {
          params: {
            companyId: this.companyId,
          },
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.sparePart = res.data.data;
          } else {
            this.sparePart = [];
          }
          this.$forceUpdate();
        });
    },
    // 标签切换
    tabChange(tab) {
      var activeTab = tab.label;
      switch (activeTab) {
        case "产品":
          this.productInfoSearch();
          break;
        case "产品类型":
          this.typeInfoSearch();
          break;
        case "厂家":
          this.factoryInfoSearch();
          break;
      }
    },
    // ------------------------------------产品
    // 查看产品信息列表
    productInfoSearch() {
      var companyId = this.$store.state.site.searchCompanyId;
      if (companyId !== 0 && !companyId) {
        return;
      }
      this.$http
        .get("equipment/product/findAll", {
          params: {
            name: this.product_input,
            page: this.product_currentPage - 1,
            size: this.product_size,
            companyId: companyId,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.product_data = res.data.data.data;
            this.product_total = res.data.data.total;
          }
        });
    },
    // 添加产品
    addProduct() {
      this.dialogTitle = "添加产品";
      this.getMaintainList()
      this.productVisible = true;
    },
    // 产品分页大小改变
    productSizeChange(size) {
      this.product_size = size;
      this.productInfoSearch();
    },
    // 产品页码改变
    productCurrentChange(page) {
      this.product_currentPage = page;
      this.productInfoSearch();
    },
    // 编辑产品
    editProduct(row) {
      this.dialogTitle = "编辑产品";
      this.productVisible = true;
      this.$http
        .get("equipment/product/detail", {
          params: {
            id: row.id,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.typeInfoSearch(true);
            this.factoryInfoSearch(true);
            this.editProductForm = res.data.data;

            this.getMaintainList()
            this.editProductForm.spareIds = [];
            this.editProductForm.sparePartsList &&
              this.editProductForm.sparePartsList.forEach((item) => {
                this.editProductForm.spareIds.push(item.id + '');
              });
          }
        });
    },
    // 输入框值改变
    productSearch() {
      this.product_currentPage = 1;
      this.productInfoSearch();
    },
    beforeProductClose() {
      this.editProductForm = {
        model: null,
        providerId: null,
        typeId: null,
        // 保养内容选项
        maintainConfigs: [], 
        // 监控内容选项
        monitorConfigs: [],
        monitorTypeOpations: [{
          id: 1, name: '>'
        }, {
          id: 2, name: '<'
        }, {
          id: 3, name: '='
        }],
        spareIds: []
      };
      this.$refs.productRef.resetFields();
    },
    // 新增、编辑成功提交
    editProductSubmit() {
      this.$refs.productRef.validate(async (valid) => {
        if (valid) {
          // 验证通过
          this.editProductForm.maintainConfigs = this.editProductForm.maintainConfigs.filter(item => {
            return item.maintainContent !== '' && item.maintainCycle !== '' && item.maintainPrice !== '' && item.maintainType !== ''
          })

          // 如果备件数量为空，则删掉
          this.editProductForm.maintainConfigs.forEach(item => {
            if (item.partNumber === '') {
              delete item['partNumber']
            }
          })   

          this.editProductForm.monitorConfigs = this.editProductForm.monitorConfigs.filter(item => {
            return Object.values(item).every(v => v !== '')
          })
          
          this.editProductForm.spareIds = this.editProductForm.spareIds && this.editProductForm.spareIds.join(',') // 备件数组
          this.editProductForm.rvMainIds = this.editProductForm.rvMainIds && this.editProductForm.rvMainIds.join(',') // 删除保养内容数组
          this.editProductForm.rvMonIds = this.editProductForm.rvMonIds && this.editProductForm.rvMonIds.join(',') // 删除监控内容数组

          this.editProductForm.maintainConfigs = JSON.stringify(this.editProductForm.maintainConfigs)
          this.editProductForm.monitorConfigs = JSON.stringify(this.editProductForm.monitorConfigs)
          if (this.dialogTitle === '编辑产品') {
            // 编辑           
            try {
              const res = await this.$http({
                url: '/equipment/product/modify',
                method: 'post',
                data: this.editProductForm
              })
              if (res.data.code === 0) {
                this.$notify({
                  title: "编辑成功",
                  type: "success"
                })
                this.productInfoSearch()
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
            this.editProductForm.companyId = this.$store.state.site.companyId
            this.siteId = this.$store.state.site.siteId
            // const providerNameIndex = this.factory_data.findIndex(item => item.id === this.editProductForm.providerId)
            // this.editProductForm.providerName = this.factory_data[providerNameIndex].name

            // const productTypeIndex = this.product_type_data.findIndex(item => item.id === this.editProductForm.typeId)
            // this.editProductForm.productType = this.product_type_data[productTypeIndex].name
            
            try {
              const res = await this.$http({
                url: '/equipment/product/add',
                method: 'post',
                data: this.editProductForm
              })
              if (res.data.code === 0) {
                this.$notify({
                  title: "新增成功",
                  type: "success"
                })
                this.productInfoSearch()
              } else {
                this.$notify({
                  title: res.data.msg,
                  type: "warning",
                })
              }
            } catch (error) {
              
            }
          }
          this.productVisible = false

          const isMaintain = this.editProductForm.maintainConfigs instanceof Array
          this.editProductForm.maintainConfigs = isMaintain ? this.editProductForm.maintainConfigs : JSON.parse(this.editProductForm.maintainConfigs)

          const isMonitor = this.editProductForm.monitorConfigs instanceof Array
          this.editProductForm.monitorConfigs = isMonitor ? this.editProductForm.monitorConfigs : JSON.parse(this.editProductForm.monitorConfigs)
        }
      })
    },
    // 下拉刷新厂家
    searchFactoryChange(flag) {
      if (flag) {
        this.factoryInfoSearch(true);
        this.$forceUpdate();
      }
    },
    // 下拉刷新类型
    searchTypeChange(flag) {
      if (flag) {
        this.typeInfoSearch(true);
        this.$forceUpdate();
      }
    },
    // ---------------------------------产品类型
    // 获取产品类型列表
    typeInfoSearch(data) {
      // data布尔类型用于判断是否获取所有的内容
      var companyId = this.$store.state.site.searchCompanyId;
      if (companyId !== 0 && !companyId) {
        return;
      }
      this.$http
        .get("equipment/productType/findAll", {
          params: {
            name: data ? "" : this.type_input,
            page: data ? 0 : this.type_currentPage - 1,
            size: data ? 999 : this.type_size,
            companyId: companyId,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.product_type_data = res.data.data.data;
            this.type_total = res.data.data.total;
          }
        });
    },
    // 输入后更新产品列表
    typeSearch() {
      this.type_currentPage = 1;
      this.typeInfoSearch();
    },
    // 类型分页大小改变
    typeSizeChange(size) {
      this.type_size = size;
      this.typeInfoSearch();
    },
    // 类型页码改变
    typeCurrentChange(page) {
      this.type_currentPage = page;
      this.typeInfoSearch();
    },
    beforeTypeClose() {
      this.editTypeForm = {
        name: null,
      };
      this.$refs.typeRef.resetFields();
    },
    // 编辑类型
    addType() {
      this.typeVisible = true;
    },
    editType(row) {
      this.typeVisible = true;
      this.$http
        .get("equipment/productType/detail", {
          params: {
            id: row.id,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.editTypeForm = res.data.data;
          }
        });
    },
    // 类型新增编辑提交
    editTypeSubmit() {
      this.$refs.typeRef.validate((valid) => {
        if (valid) {
          if (this.editTypeForm.id) {
            // 编辑
            this.$http
              .post("equipment/productType/modify", {
                id: this.editTypeForm.id,
                name: this.editTypeForm.name,
                companyId: this.editTypeForm.companyId,
              })
              .then((res) => {
                if (res.data.code === 0) {
                  this.$notify({
                    title: "成功",
                    type: "success",
                  });
                  this.typeVisible = false;
                  this.typeInfoSearch();
                } else {
                  this.$notify({
                    title: "警告",
                    message: res.data.msg,
                    type: "warning",
                  });
                }
              });
          } else {
            // 新增
            this.$http
              .post("equipment/productType/add", {
                name: this.editTypeForm.name,
                companyId: this.$store.state.site.searchCompanyId,
              })
              .then((res) => {
                if (res.data.code === 0) {
                  this.$notify({
                    title: "成功",
                    type: "success",
                  });
                  this.typeVisible = false;
                  this.typeInfoSearch();
                } else {
                  this.$notify({
                    title: "警告",
                    message: res.data.msg,
                    type: "warning",
                  });
                }
              });
          }
        }
      });
    },
    // ------------------------------------厂家
    // 获取厂家列表
    factoryInfoSearch(data) {
      var companyId = this.$store.state.site.searchCompanyId;
      if (companyId !== 0 && !companyId) {
        return;
      }
      // data布尔类型用于分页最大情况
      this.$http
        .get("equipment/provider/findAll", {
          params: {
            name: this.factory_input,
            page: data ? 0 : this.factory_currentPage - 1,
            size: data ? 999 : this.factory_size,
            companyId: companyId,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.factory_data = res.data.data.data;
            this.factory_total = res.data.data.total;
          }
        });
    },
    // 输入框值改变跟新列表
    factorySearch() {
      this.factory_currentPage = 1;
      this.factoryInfoSearch();
    },
    // 厂家分页大小改变
    factorySizeChange(size) {
      this.factory_size = size;
      this.factoryInfoSearch();
    },
    // 厂家页码改变
    factoryCurrentChange(page) {
      this.factory_currentPage = page;
      this.factoryInfoSearch();
    },
    beforeFactoryClose() {
      this.editFactoryForm = {
        name: null,
        url: null,
        contactPerson: null,
        contactPhone: null,
        companyId: this.$store.state.site.searchCompanyId,
        simpleName: null,
      };
      this.$refs.factoryRef.resetFields();
    },
    addFactory() {
      if (this.$refs.factoryRef) {
        this.$refs.factoryRef.resetFields();
      }
      this.factoryVisible = true;
    },
    // 编辑厂家
    editFactory(row) {
      this.factoryVisible = true;
      this.$http
        .get("equipment/provider/detail", {
          params: {
            id: row.id,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.editFactoryForm = res.data.data;
          }
        });
    },
    // 编辑新增厂家提交
    editFactorySubmit() {
      this.$refs.factoryRef.validate((valid) => {
        if (valid) {
          if (this.editFactoryForm.id) {
            // 编辑
            this.$http
              .post("equipment/provider/modify", {
                id: this.editFactoryForm.id,
                name: this.editFactoryForm.name,
                url: this.editFactoryForm.url,
                contactPerson: this.editFactoryForm.contactPerson,
                contactPhone: this.editFactoryForm.contactPhone,
                companyId: this.editFactoryForm.companyId,
                simpleName: this.editFactoryForm.simpleName,
              })
              .then((res) => {
                if (res.data.code === 0) {
                  this.$notify({
                    title: "成功",
                    type: "success",
                  });
                  this.factoryVisible = false;
                  this.factoryInfoSearch();
                } else {
                  this.$notify({
                    title: "警告",
                    message: res.data.msg,
                    type: "warning",
                  });
                }
              });
          } else {
            // 新增
            this.$http
              .post("equipment/provider/add", this.editFactoryForm)
              .then((res) => {
                if (res.data.code === 0) {
                  this.$notify({
                    title: "成功",
                    type: "success",
                  });
                  this.factoryVisible = false;
                  this.factoryInfoSearch();
                } else {
                  this.$notify({
                    title: "警告",
                    message: res.data.msg,
                    type: "warning",
                  });
                }
              });
          }
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../assets/css/index.less";
.product {
  width: 100%;
  height: 100%;
  @dis-flex();
  @flex-c();
  .content {
    @flex-1();
    background-color: rgba(67, 92, 112);
    height: 0;
    padding: 10px;
    overflow: auto;
    /* 四个标签样式 */
    /deep/ .el-tabs--border-card {
      background: none;
      border: none;
      box-shadow: 0 0 4px #aaa;
    }
    /deep/ .el-tabs--border-card > .el-tabs__header {
      background: none;
      border: none;
    }
    /deep/ .el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
      color: @radio-bgc;
      border-right-color: rgba(67, 92, 112);
      border-left-color: rgba(67, 92, 112);
      background: none;
    }
    /deep/ .el-tabs--border-card > .el-tabs__header .el-tabs__item {
      color: @radio-bgc;
      border-right-color: rgba(67, 92, 112);
      border-left-color: rgba(67, 92, 112);
      background: rgba(84, 101, 125);
    }
    .product-branch {
      @dis-flex();
      @flex-c();
      .top {
        @dis-flex();
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .table {
        @flex-1();
        .block {
          float: right;
        }
      }
    }
    .product-type {
      @dis-flex();
      @flex-c();
      .top {
        @dis-flex();
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .table {
        @flex-1();
        .block {
          float: right;
        }
      }
    }
  }
  // 弹窗
  .product-dialog {
    /deep/ .el-select {
      width: 100%;
    }

    .health-bigbox {
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
          width: 100%;
          background: #ffffff;
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
  .type-dialog {
    /deep/ .el-select {
      width: 100%;
    }
  }
  .factory-dialog {
    /deep/ .el-select {
      width: 100%;
    }
  }
}
</style>