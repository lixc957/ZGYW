<template>
  <div class="groups">
    <!-- 面包屑 -->
    <MyBreadcrumb level1="参数设置" level2="开关分组" />
    <div class="content-main">
      <div class="left-con inner whiteBox">
        <div class="btn-box">
          <el-button
            size="mini"
            class="confirm"
            icon="el-icon-plus"
            @click="showDialog('add',1)"
          >新增分组</el-button>
          <el-button
            size="mini"
            class="confirm"
            v-show="selectedFno=='group'"
            icon="el-icon-edit"
            @click="showDialog('edit')"
            :disabled="!selectGroup.id"
          >编辑</el-button>
          <el-button
            size="mini"
            class="del"
            v-show="selectedFno=='group'"
            @click="showDialog('delete')"
            icon="el-icon-delete"
            :disabled="!selectGroup.id"
          >删除</el-button>
        </div>
        <div class="tree-box">
          <!-- <SelfTree :data="groupList" :children="'childrenClassify'" :clickAction="getDetail" :contextMenu="true"></SelfTree> -->
          <el-tree
            :data="groupList"
            ref="treeBox"
            node-key="id"
            :props="{label:'name',isLeaf:'leaf',children:'childrenClassify'}"
            :show-checkbox="isCheck"
            :check-on-click-node="true"
            :highlight-current="true"
            @node-click="nodeClick"
          >
            <div class="tree_item" slot-scope="{node}">
              <i :class="{'el-icon-folder-opened': node.level==1}"></i>
              <span :title="node.label" class="has_ellipsis">{{ node.label }}</span>
            </div>
          </el-tree>
        </div>
      </div>
      <div class="right-con inner whiteBox">
        <div class="title-box titleBox" v-show="selectedFno=='group'">
          <p class="title fl">编辑变量</p>
          <div class="btn-box fr" v-show="!isEdit">
            <el-button
              size="mini"
              class="confirm"
              icon="el-icon-edit"
              :disabled="!selectGroup.id"
              @click="changeEdit(true)"
            >编辑</el-button>
            <el-button
              v-show="!selectGroup.parentId"
              size="mini"
              class="confirm"
              icon="el-icon-plus"
              @click="showDialog('add',2)"
            >新增分组</el-button>
          </div>
          <div class="btn-box fr" v-show="isEdit">
            <el-button size="mini" class="success" @click="saveVariate">保存</el-button>
            <el-button size="mini" class="confirm" @click="changeEdit(false)">取消</el-button>
          </div>
        </div>
        <div class="var-list shadow" ref="conBox" v-show="selectedFno=='group'">
          <el-table stripe v-show="!isEdit" border :data="varList" :max-height="conHeight" style>
            <el-table-column prop="gatewayName" label="所属网关"></el-table-column>
            <el-table-column prop="equipmentName" label="所属设备"></el-table-column>
            <el-table-column prop="name" label="显示名称" width></el-table-column>
          </el-table>
          <el-form
            :style="{'max-height':conHeight+'px','overflow-y':'auto'}"
            ref="variateForm"
            v-show="isEdit"
            label-width=".5rem"
          >
            <el-form-item v-for="(item,index) in varList" :key="item.id" style="margin-top:1rem">
              <el-select
                filterable
                :disabled="!isEdit"
                v-model="item.gatewayId"
                style="width:20%"
                placeholder="选择网关"
              >
                <el-option
                  v-for="gateway in gatewayOptions"
                  :key="gateway.gatewayId+''+item.id"
                  :label="gateway.name"
                  :value="gateway.gatewayId"
                ></el-option>
              </el-select>
              <el-select
                v-model="item.equipmentId"
                style="width:20%;margin-left:5px;"
                placeholder="选择设备"
                :disabled="!isEdit"
                @change="getAllVarByEquip(item,variatesList)"
                filterable
              >
                <el-option
                  v-for="equip in equips"
                  :key="equip.equipmentId+''+item.id"
                  :label="equip.name"
                  :value="equip.equipmentId"
                ></el-option>
              </el-select>
              <el-select
                v-model="item.code"
                filterable
                :disabled="!isEdit"
                style="width:20%;margin-left:5px;"
                placeholder="选择变量"
                @change="selectCode(index)"
              >
                <el-option
                  v-for="codeItem in item.children"
                  :key="codeItem.code+''+item.id"
                  :label="codeItem.name"
                  :value="codeItem.code"
                ></el-option>
              </el-select>
              <el-input
                :disabled="!isEdit"
                style="width:20%;margin-left:5px;"
                v-model="item.name"
                placeholder="显示名称"
              ></el-input>
              <el-button
                v-show="isEdit"
                size="mini"
                style="margin-left:10px;"
                class="del"
                icon="el-icon-delete"
                @click="deleteVariate(index,item.id)"
              >删除</el-button>
            </el-form-item>
            <el-form-item label>
              <el-button
                v-show="isEdit"
                size="mini"
                class="success"
                style
                icon="el-icon-plus"
                @click="addVariate"
              >添加</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="addVisible" width="500px">
      <el-form ref="groupForm" :model="groupObj" label-width="120px">
        <el-form-item
          prop="name"
          label="分组名称："
          :rules="[{ required: true, message: '请输入分组名称', trigger: 'blur' }]"
        >
          <el-input style="width:80%;" v-model.trim="groupObj.name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button class="cancel" @click="closeDialog">取 消</el-button>
        <el-button class="confirm" @click="handleGroup">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="confirmVisible" width="370px">
      <div class="tips-con">
        确认删除&nbsp;
        <mark>{{selectGroup.name}}&nbsp;</mark>吗？
      </div>
      <div slot="footer">
        <el-button class="cancel" @click="closeDialog">取 消</el-button>
        <el-button class="confirm" @click="handleGroup">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MyBreadcrumb from "../subcomponents/Mybreadcrumb";
import GLOBAL from "../../utils/global_variable";
// 引入深拷贝
import { deepClone, getUUIDInt } from "../../utils/index";
// import SelfTree from "@/components/common/SelfTree.vue"
export default {
  components: {
    MyBreadcrumb,
  },
  inject: ["reload"], //注入依赖
  data() {
    return {
      selectedFno: "group",
      conHeight: 0,
      groupList: [],
      varList: [],
      addVisible: false,
      confirmVisible: false,
      isCheck: false,
      isEdit: false,
      selectGroup: {},
      gatewayOptions: [],
      dialogTitle: "新建分组",
      equips: [],
      handleType: "",
      groupObj: {
        name: "",
      },
      delIds: [],
      // 添加变量表达验证
      variateRules: {
        name: [{ required: true, message: "请输入变量名称", trigger: "blur" }],
        code: [{ required: true, message: "请输入变量描述", trigger: "blur" }],
        gatewayId: [{ required: true, message: "请选择网关", trigger: "blur" }],
        equipmentId: [
          { required: true, message: "请选择设备", trigger: "change" },
        ],
      },
      // 选中的变量
      selectedVariate: {},
      // 存储请求到的变量
      variatesList: {},
      // 父级分组id
      parentId: 0,
    };
  },
  computed: {
    watchSiteChange() {
      return this.$store.state.site.siteId;
    },
  },
  watch: {
    watchSiteChange() {
      this.selectGroup = {};
      this.getGroup();
    },
  },
  created() {
    this.getAllGateway(true);
    this.getAllEquip(true);
    if (this.watchSiteChange) {
      this.getGroup();
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.conHeight = this.$refs.conBox.offsetHeight - 58;
    });
    window.addEventListener("resize", () => {
      this.$nextTick(() => {
        this.conHeight = this.$refs.conBox.offsetHeight - 58;
      });
    });
  },
  methods: {
    // 获取所有网关
    getAllGateway(flag) {
      if (!flag) {
        return;
      }
      this.$http
        .get("equipment/gatewayList", {
          params: {
            page: 0,
            size: GLOBAL.max_page_size,
            roomId: this.$store.state.site.siteId,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.gatewayOptions = res.data.data.gateways;
          }
        });
    },
    // 获取站点下所有设备
    getAllEquip(flag) {
      if (!flag) {
        return;
      }
      this.$http
        .get("equipment/getEqByRoom", {
          params: {
            page: 0,
            size: GLOBAL.max_page_size,
            roomId: this.$store.state.site.siteId,
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.equips = res.data.data;
          }
        });
    },
    // 获取设备下所有变量
    getAllVarByEquip(equip, variatesList) {
      if (!variatesList[equip.equipmentId]) {
        this.$http
          .get("equipment/variable/findAllByEquipment", {
            params: {
              equipmentId: equip.equipmentId,
            },
          })
          .then((res) => {
            if (res.data.code === 0) {
              equip.children = deepClone(res.data.data);
              variatesList[equip.equipmentId] = deepClone(res.data.data);
              this.$forceUpdate();
            }
          });
      } else {
        equip.children = deepClone(variatesList[equip.equipmentId]);
      }
    },
    nodeClick(group) {
      this.isEdit = false;
      this.getDetail(group);
    },
    // 获取变量详情
    getDetail(group) {
      group.show = !group.show;
      this.selectedFno = "group";
      this.selectGroup = group || {};
      if (!group) {
        this.varList = [];
        return;
      }
      this.$http
        .get("equipment/switchClassify/detail", { params: { id: group.id } })
        .then((res) => {
          if (res.data.code == 0) {
            this.varList = res.data.data;
            if (this.isEdit) {
              this.varList.forEach((element) => {
                this.getAllVarByEquip(element, this.variatesList);
              });
            }
          }
        });
    },
    // 选择变量
    selectCode(index) {
      this.varList[index].name = this.varList[index].children.find((el) => {
        return el.code == this.varList[index].code;
      }).name;
    },
    // 改变编辑状态
    changeEdit(situ) {
      this.isEdit = situ;
      this.getDetail(this.selectGroup);
    },
    // 保存变量
    saveVariate() {
      let list = deepClone(this.varList);
      let eorrMessage = "";
      list.forEach((item) => {
        if (!item.gatewayId || !item.equipmentId || !item.code) {
          eorrMessage = "网关、设备、变量不能为空";
          return;
        }
        item.gatewayName = this.gatewayOptions.find((elem) => {
          return elem.gatewayId === item.gatewayId;
        }).name;
        item.equipmentName = this.equips.find((elem) => {
          return elem.equipmentId === item.equipmentId;
        }).name;
        delete item.children;
      });
      if (eorrMessage) {
        this.$notify({
          message: eorrMessage,
          type: "warning",
        });
        return;
      }
      this.$http
        .post("equipment/switchVar/updateVars", {
          switchVars: JSON.stringify(list),
          delId: this.delIds.join(","),
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.$notify({
              message: "保存成功",
              type: "success",
            });
            this.changeEdit(false);
            this.getGroup(true);
          } else {
            this.$notify({
              message: res.data.msg,
              type: "error",
            });
          }
        });
    },
    // 显示dialog
    showDialog(type, option) {
      this.handleType = type;
      if (type == "add") {
        this.dialogTitle = "新建分组";
        this.addVisible = true;
        this.groupObj.id = "";
        this.groupObj.name = "";
        if (option == 1) {
          this.parentId = 0;
        } else if (option == 2) {
          this.parentId = this.selectGroup.id;
        }
      } else if (type == "edit") {
        this.dialogTitle = "编辑分组";
        this.addVisible = true;
        this.groupObj.id = this.selectGroup.id;
        this.groupObj.name = this.selectGroup.name;
      } else if (type == "delete") {
        this.confirmVisible = true;
      }
      this.$nextTick(() => {
        this.$refs.groupForm.clearValidate();
      });
    },
    closeDialog() {
      this.addVisible = false;
      this.confirmVisible = false;
      this.handleType = "";
    },
    // 获取分组
    getGroup(flag) {
      this.$http
        .get("equipment/switchClassify/findAll", {
          params: { site: this.watchSiteChange },
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.groupList = res.data.data;
            this.groupList.forEach((item) => {
              item.show = false;
            });
            if (this.groupList.length) {
              this.$nextTick(() => {
                if (flag) {
                  this.getDetail(this.selectGroup);
                  if (this.selectGroup.parentId) {
                    // this.$refs.treeBox.setCurrentKey(this.selectGroup.parentId);
                    // 展开元素
                    this.$refs.treeBox.store.nodesMap[
                      this.selectGroup.parentId
                    ].expanded = true;
                  }
                  this.$refs.treeBox.setCurrentKey(this.selectGroup.id); // treeBox 元素的ref   value 绑定的node-key
                } else {
                  this.getDetail(this.groupList[0]);
                  this.$refs.treeBox.setCurrentKey(this.groupList[0].id); // treeBox 元素的ref   value 绑定的node-key
                }
              });
            } else {
              this.varList = [];
              this.isEdit = false;
            }
          }
        });
    },
    // 操作分组
    handleGroup() {
      if (this.handleType == "add") {
        this.addGroup();
      } else if (this.handleType == "edit") {
        this.updateGroup();
      } else if (this.handleType == "delete") {
        this.deleteGroup();
      }
    },
    // 添加分组
    addGroup() {
      this.$refs.groupForm.validate((valid) => {
        if (valid) {
          this.$http
            .post("equipment/switchClassify/newClassify", {
              site: this.watchSiteChange,
              name: this.groupObj.name,
              parentId: this.parentId,
            })
            .then((res) => {
              if (res.data.code == 0) {
                this.$notify({
                  message: "添加成功",
                  type: "success",
                });
                this.selectGroup = res.data.data;
                this.closeDialog();
                this.$nextTick(() => {
                  this.getGroup(true);
                });
              } else {
                this.$notify({
                  message: res.data.msg,
                  type: "error",
                });
              }
            });
        }
      });
    },
    // 修改分组
    updateGroup() {
      let group = deepClone(this.selectGroup);
      if (group.name === this.groupObj.name) {
        this.$notify({
          message: "未做修改",
          type: "warning",
        });
        return;
      }
      group.name = this.groupObj.name;
      this.$http
        .post("equipment/switchClassify/modify", this.groupObj)
        .then((res) => {
          if (res.data.code == 0) {
            this.$notify({
              message: "修改成功",
              type: "success",
            });
            this.closeDialog();
            this.getGroup();
          } else {
            this.$notify({
              message: res.data.msg,
              type: "error",
            });
          }
        });
    },
    // 删除分组
    deleteGroup() {
      this.$http
        .get("equipment/switchClassify/remove", {
          params: { id: this.selectGroup.id },
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.$notify({
              message: "删除成功",
              type: "success",
            });
            this.closeDialog();
            this.getGroup();
          } else {
            this.$notify({
              message: res.data.msg,
              type: "error",
            });
          }
        });
    },
    // 添加变量填写框
    addVariate() {
      this.varList.push({
        name: "",
        classifyId: this.selectGroup.id,
        gatewayId: "",
        equipmentId: "",
        site: this.watchSiteChange,
      });
    },
    // 记录删除变量
    deleteVariate(index, id) {
      this.varList.splice(index, 1);
      if (this.delIds.indexOf(id) <= -1) {
        this.delIds.push(id);
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../assets/css/index.less";
.groups {
  height: 100%;
  position: relative;
  .content-main {
    position: absolute;
    top: 66px;
    bottom: 0;
    left: 0;
    right: 0;
    color: @font-color;
    .left-con {
      width: 230px;
      background: @table-bgc;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      .btn-box {
        height: 2rem;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        padding: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .el-button--mini {
          padding-left: 5px !important;
          padding-right: 5px !important;
        }
      }
      .tree-box {
        position: absolute;
        left: 0;
        right: 0;
        top: 3rem;
        bottom: 0.5rem;
        overflow-y: auto;
      }
    }
    .right-con {
      background: @table-bgc;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 240px;
      right: 0;
      .title-box {
        height: 2rem;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        padding: 0.5rem;
        background: @board-title;
        border-bottom: 1px solid @table-border;
        line-height: 2rem;
      }
      .var-list {
        position: absolute;
        top: 3rem;
        left: 0;
        right: 0;
        bottom: 0.5rem;
        padding: 10px;
        .el-button--mini {
          padding-left: 5px !important;
          padding-right: 5px !important;
        }
      }
    }
  }
}
.el-tree /deep/ .el-tree-node__content {
  height: 2rem;
}
// .el-tree /deep/ .is-current > .el-tree-node__content {
//   background: #5b708b !important;
// }
.tree_item {
  display: flex;
  width: 80%;
  align-items: center;
}
/deep/ .el-form-item__label {
  font-size: 1rem;
}
.var_info /deep/ .el-form-item__content {
  margin: 5px 5px;
}
</style>