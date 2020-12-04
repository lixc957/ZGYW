<template>
  <!-- 站点管理 -->
  <div id="site">
    <MyBreadcrumb level1="站点监控" level2="接入站点设置" />
    <div class="article">
      <!-- 边栏 -->
      <div class="beside whiteBox">
        <div class="list tree-box">
          <el-tree
            :data="siteTree"
            :props="defaultProps"
            node-key="id"
            ref="groupTree"
            highlight-current
            default-expand-all
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>
                <i :class="data.icon"></i>
                <!-- <i class="el-icon-edit"></i> -->
                <span>{{ node.label }}</span>
              </span>
            </span>
          </el-tree>
        </div>
      </div>
      <!-- 内容 -->
      <div class="content whiteBox" ref="conBox">
        <!-- <el-tabs v-model="activeName" @tab-click="handleClick"> -->
        <el-tabs
          type="border-card"
          class="hasBack-tab"
          v-model="activeName"
          @tab-click="handleClick"
        >
          <el-tab-pane label="基本信息" name="first">
            <div style="margin: 10px 0 0 10px" v-if="currentSiteId">
              <span>所属平台:&nbsp;</span>
              <span>{{ companyName }}</span>
            </div>
          </el-tab-pane>
          <el-tab-pane label="监控设备" name="second" v-if="currentSiteId">
            <span>{{ ' 【' + currentName + '】 ' }}</span>
            <span>站点的所有监控设备</span>
            <div
              style="height: 30px; width: 92px; float: right; margin-top: -5px"
            >
              <el-button
                class="confirm"
                type="button"
                size="mini"
                @click="addGroup"
                >+ 添加分组</el-button
              >
            </div>
            <div class="table">
              <el-table
                :data="tableData"
                style="width: 100%"
                row-key="id"
                border
                stripe
                :max-height="conHeight"
                v-loading="loading"
                @toggleRowExpansion="toggleExpand"
                :row-style="rowStyle"
                :tree-props="{
                  children: 'children',
                  hasChildren: 'hasChildren'
                }"
              >
                <el-table-column width="48"></el-table-column>
                <el-table-column prop="name" min-width="220">
                  <template slot="header">
                    <span>名称</span>
                  </template>
                  <template slot-scope="scope">
                    <div
                      style="float: left; width: 18px; height: 19px"
                      v-if="scope.row.classify"
                    ></div>
                    <i
                      class="el-icon-folder-opened"
                      v-if="!scope.row.classify"
                    ></i>
                    {{ scope.row.name }}
                  </template>
                </el-table-column>
                <!-- <el-table-column prop="id" label="编号"></el-table-column> -->
                <el-table-column
                  prop="address"
                  label="额定电压(V)"
                  min-width="220"
                ></el-table-column>
                <el-table-column label="操作" width="210">
                  <template slot-scope="scope">
                    <div v-if="!scope.row.classify">
                      <el-tooltip
                        class="item"
                        effect="dark"
                        offset="-20"
                        content="编辑"
                        placement="top-start"
                      >
                        <el-button
                          icon="el-icon-edit"
                          size="mini"
                          class="confirm"
                          @click="editGroup(scope.row)"
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
                          size="mini"
                          class="del"
                          @click="deleteGroup(scope.row)"
                        ></el-button>
                      </el-tooltip>
                      <el-tooltip
                        class="item"
                        effect="dark"
                        offset="-20"
                        content="添加子设备"
                        placement="top-start"
                      >
                        <el-button
                          icon="el-icon-document-add"
                          size="mini"
                          class="confirm"
                          @click="addEquip(scope.row)"
                        ></el-button>
                      </el-tooltip>
                      <el-tooltip
                        class="item"
                        effect="dark"
                        offset="-20"
                        content="批量删除设备"
                        placement="top-start"
                      >
                        <el-button
                          icon="el-icon-document-delete"
                          size="mini"
                          class="del"
                          @click="delMulAmmeter(scope.row)"
                        ></el-button>
                      </el-tooltip>
                    </div>
                    <div v-else>
                      <el-tooltip
                        class="item"
                        effect="dark"
                        offset="-20"
                        content="删除"
                        placement="top-start"
                      >
                        <el-button
                          icon="el-icon-delete"
                          size="mini"
                          class="del"
                          @click="deleteEquip(scope.row)"
                        ></el-button>
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <!------------------------------------------ 所有设备 -->
          <el-tab-pane label="所有设备" name="third" v-if="currentSiteId">
            <div>
              <div style="float: left">
                <span>{{ ' 【' + currentName + '】 ' }}</span>
                <span>站点的所有设备</span>
              </div>
              <div
                class="equip-edit"
                style="float: right; margin: 0px 0px 0px 50px"
              >
                <div style="float: right">
                  <el-button
                    @click="getEquipmentDetail"
                    v-show="equipmentTableMode"
                    size="mini"
                    class="confirm"
                    type="success"
                    :disabled="!$store.state.site.siteId"
                  >导入详情</el-button>
                  <el-button
                    @click="equipmentTableMode=true"
                    v-show="!equipmentTableMode"
                    size="mini"
                    class="confirm"
                    type="success"
                    :disabled="!$store.state.site.siteId"
                  >返回</el-button>

                  <el-button size="mini" class="confirm" @click="addGateway"
                    >+ 添加网关</el-button
                  >
                  <el-button
                    size="mini"
                    class="confirm"
                    icon="el-icon-upload2"
                    :disabled="exportModelLoading"
                    v-loading="exportModelLoading"
                    @click="exportModel"
                    >导出模板</el-button
                  >
                  <el-button
                    size="mini"
                    class="confirm"
                    icon="el-icon-download"
                    @click="importFile"
                    >批量导入</el-button
                  >
                  <el-button
                    size="mini"
                    class="confirm"
                    icon="el-icon-upload2"
                    :disabled="exportLoading"
                    v-loading="exportLoading"
                    element-loading-background="rgba(67, 92, 112, 0.5)"
                    @click="importEquip"
                    >导出设备</el-button
                  >
                </div>
              </div>
              <!-- 默认展示列表 -->
              <el-table
                :data="gatewayObj"
                v-loading="gatewayLoading"
                v-if="equipmentTableMode"
                style="width: 100%"
                stripe
                size="mini"
                border 
                :max-height="conHeight"
                @expand-change="expandChange"
                :expand-row-keys="expands"
                :row-key="getRowkeys"
                class="all-table"
              >
                <el-table-column type="expand">
                  <el-table
                    :data="ammeterTable"
                    border
                    stripe
                    v-loading="equipLoading"
                    style="width: 100%"
                  >
                    <el-table-column type="index"></el-table-column>
                    <el-table-column
                      prop="name"
                      label="设备描述"
                    ></el-table-column>
                    <el-table-column
                      prop="number"
                      label="设备编号"
                    ></el-table-column>
                    <el-table-column
                      prop="gatewayId"
                      label="所属网关"
                    ></el-table-column>
                    <el-table-column prop="param" label="在线状态">
                      <template slot-scope="scope">
                        <p v-if="scope.row.param == '1'" class="text-green">
                          <i
                            :class="{
                              icon: true,
                              iconfont: true,
                              'icon-zaixian': true
                            }"
                          ></i>
                        </p>
                        <p v-else class="text-gray">
                          <i
                            :class="{
                              icon: true,
                              iconfont: true,
                              'icon-lixian': true
                            }"
                          ></i>
                        </p>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作">
                      <template slot-scope="scope">
                        <!-- <el-button type="text" size="small">查看</el-button> -->
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
                            @click="editAmmeter(scope.row)"
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
                            @click="tryDelAmmeter(scope.row)"
                          ></el-button>
                        </el-tooltip>
                        <!-- <el-button @click="editAmmeter(scope.row)" type="text" size="small">编辑</el-button>
                        <el-button @click="tryDelAmmeter(scope.row)" type="text" size="small">删除</el-button>-->
                      </template>
                    </el-table-column>
                  </el-table>
                  <!-- 分页 -->
                  <div class="block">
                    <el-pagination
                      @size-change="equipSizeChange"
                      @current-change="equipCurrentChange"
                      :current-page="equipCurrentPage"
                      :page-sizes="[10, 20, 50]"
                      :page-size="equipSize"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="totalEquipment"
                    ></el-pagination>
                  </div>
                  <!-- </template> -->
                </el-table-column>
                <el-table-column
                  prop="name"
                  label="网关名称"
                  width="210"
                ></el-table-column>
                <el-table-column
                  label="ID"
                  prop="equipmentId"
                ></el-table-column>
                <el-table-column
                  label="连接电表数"
                  prop="linker"
                ></el-table-column>
                <el-table-column label="在线状态" prop="param">
                  <template slot-scope="scope">
                    <p v-if="scope.row.param == '1'" class="text-green">
                      <i
                        :class="{
                          icon: true,
                          iconfont: true,
                          iconnav_zaixianjieshou: true
                        }"
                      ></i>
                    </p>
                    <p v-else class="text-gray">
                      <i
                        :class="{
                          icon: true,
                          iconfont: true,
                          'icon-lixian': true
                        }"
                      ></i>
                    </p>
                  </template>
                </el-table-column>
                <el-table-column width="210" label="操作">
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
                        @click="editGateway(scope.row)"
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
                        size="mini"
                        class="del"
                        @click="tryDelGateway(scope.row)"
                      ></el-button>
                    </el-tooltip>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      offset="-20"
                      content="新增设备"
                      placement="top-start"
                    >
                      <el-button
                        icon="el-icon-document-add"
                        size="mini"
                        class="confirm"
                        @click="addAmmeter(scope.row)"
                      ></el-button>
                    </el-tooltip>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      offset="-20"
                      content="批量删除设备"
                      placement="top-start"
                    >
                      <el-button
                        icon="el-icon-document-delete"
                        size="mini"
                        class="del"
                        @click="delMulAmmeter1(scope.row)"
                      ></el-button>
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 导入详情 -->
              <el-table
                :data="equipDetailList"
                key="detailTable"
                class="all-table"
                stripe
                size="mini"
                v-loading="gatewayLoading"
                style="width: 100%"
                border
                v-else
              >
                <el-table-column type="index" label="序号" width="50">
                  <template slot-scope="scope">{{ scope.$index + 1 }}</template>
                </el-table-column>                                    
                <el-table-column prop="fileName" label="文件名称" key="fileName"></el-table-column>
                <el-table-column prop="recordInfo" label="导入详情" key="recordInfo"></el-table-column>
                <el-table-column prop="status" label="导入状态" key="status"></el-table-column>
                <el-table-column prop="user" label="上传人" key="user" width="80"></el-table-column>
                <el-table-column prop="time" label="导入时间" key="time"></el-table-column>
              </el-table>
            </div>
            <!-- 分页 -->
            <div class="block white-bgc">
              <el-pagination
                @size-change="gateSizeChange"
                @current-change="gateCurrentChange"
                :current-page="gatePage"
                :page-sizes="[10, 20, 50]"
                :page-size="gatePageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalGate"
              ></el-pagination>
            </div>
          </el-tab-pane>
          <!--------------------------- 电价 -->
          <el-tab-pane label="用电电价" name="forth" v-if="currentSiteId">
            <div class="count">
              <span>月结算日:</span>
              <el-select v-model="countTime" style="width: 120px">
                <el-option
                  v-for="(item, index) in countTimeOptions"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </div>
            <el-tabs
              v-model="activeEle"
              @tab-click="electricityClick"
              class="select noBack-tab"
            >
              <el-tab-pane label="电度电价" name="electricity">
                <!-- 电价 -->
                <div class="electoric">
                  <div class="ele-title">
                    <div class="item-title">电价列表</div>
                    <el-button class="confirm" @click="addElectricityRule"
                      >+ 新增</el-button
                    >
                  </div>
                  <div class="electoric-content">
                    <el-form
                      v-for="(item, index) in priceDetailArr"
                      :key="index"
                      :model="item"
                      :rules="priceRules"
                      ref="priceRef"
                      class="demo-ruleForm"
                    >
                      <div class="form-left">
                        <el-form-item label="策略名称" prop="stagePrice.name">
                          <el-input
                            v-model.trim="item.stagePrice.name"
                            style="width: 180px"
                          ></el-input>
                        </el-form-item>
                      </div>
                      <div class="form-right">
                        <!-- 需求之后补充 -->
                        <!-- <el-form-item label="设置单价" prop="resource">
                    <el-radio-group v-model="item.stagePrice.resource">
                      <el-radio label="分时电价"></el-radio>
                      <el-radio label="不分时"></el-radio>
                    </el-radio-group>
                      </el-form-item>-->
                        <el-form-item
                          label="平单价(元)"
                          prop="stagePrice.ping"
                          class="number"
                        >
                          <el-input v-model="item.stagePrice.ping"></el-input>
                        </el-form-item>
                        <el-form-item
                          label="峰单价(元)"
                          prop="stagePrice.feng"
                          class="number"
                        >
                          <el-input v-model="item.stagePrice.feng"></el-input>
                        </el-form-item>
                        <el-form-item
                          label="谷单价(元)"
                          prop="stagePrice.gu"
                          class="number"
                        >
                          <el-input v-model="item.stagePrice.gu"></el-input>
                        </el-form-item>
                        <div class="price-tab">
                          <el-table :data="item.stageSections">
                            <el-table-column
                              prop="beginTime"
                              label="开始时间"
                              width="120"
                            >
                              <template slot-scope="scope">
                                <el-select
                                  v-model="scope.row.begin"
                                  :disabled="defalutBooleanTrue"
                                  placeholder="请选择"
                                >
                                  <el-option
                                    v-for="item in timeOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                  ></el-option>
                                </el-select>
                              </template>
                            </el-table-column>
                            <el-table-column
                              prop="beginTime"
                              label="结束时间"
                              width="120"
                            >
                              <template slot-scope="scope">
                                <el-select
                                  v-model="scope.row.end"
                                  @change="endTimeChange(index, scope.$index)"
                                  placeholder="请选择"
                                  :disabled="
                                    item.stageSections.length - 1 > scope.$index
                                  "
                                >
                                  <el-option
                                    v-for="item in timeOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                  ></el-option>
                                </el-select>
                              </template>
                            </el-table-column>
                            <el-table-column
                              prop="type"
                              label="峰谷属性"
                              width="120"
                            >
                              <template slot-scope="scope">
                                <el-select
                                  v-model="scope.row.type"
                                  :disabled="
                                    item.stageSections.length - 1 > scope.$index
                                  "
                                  placeholder="请选择"
                                >
                                  <el-option
                                    v-for="item in priceOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                  ></el-option>
                                </el-select>
                              </template>
                            </el-table-column>
                            <el-table-column
                              prop="beginTime"
                              label="峰谷属性"
                              width="120"
                            >
                              <template slot="header">
                                <el-button @click="addPrice(index)" type="text"
                                  >+添加</el-button
                                >
                              </template>
                              <template slot-scope="scope">
                                <el-button
                                  class="confirm"
                                  :disabled="
                                    scope.$index !==
                                    item.stageSections.length - 1
                                  "
                                  @click="delPrice(index, scope.$index)"
                                  >删除</el-button
                                >
                              </template>
                            </el-table-column>
                          </el-table>
                        </div>
                        <el-button
                          class="confirm"
                          @click="editElectricitySubmit(index)"
                          style="float: right"
                          >保存</el-button
                        >
                        <el-popconfirm
                          @onConfirm="delElectricity(item)"
                          title="是否确定删除？"
                        >
                          <el-button
                            slot="reference"
                            class="del"
                            style="float: right; margin-right: 20px"
                            >删除</el-button
                          >
                        </el-popconfirm>
                      </div>
                    </el-form>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="电表设备" name="equipment">
                <div class="ele-equip">
                  <div class="equip-title">
                    <div class="item-title">配置列表</div>
                  </div>
                  <div class="equip-con">
                    <div class="conf-title">
                      <span>名称</span>
                      <span>监控设备</span>
                      <span>电度电价名称</span>
                      <el-button type="text" @click="addConf">+ 添加</el-button>
                    </div>
                    <div class="config-content">
                      <div
                        class="config"
                        v-for="(item, index) in equip_conf_arr"
                        :key="index"
                      >
                        <div class="conf-single">
                          <div class="input">
                            <el-input v-model="item.confName"></el-input>
                          </div>
                          <div @click="selectEquip(index)" class="dis-input">
                            <el-input
                              v-model="item.equipmentName"
                              readonly
                            ></el-input>
                          </div>
                          <div class="select">
                            <el-select
                              v-model="item.name"
                              placeholder="请选择"
                              no-data-text="无数据"
                            >
                              <el-option
                                v-for="item in ruleNameArr"
                                :key="item.name"
                                :label="item.name"
                                :value="item.name"
                              ></el-option>
                            </el-select>
                          </div>
                          <el-button
                            type="text"
                            @click="delConf(item.id, index)"
                            >- 删除</el-button
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="deal" style="margin-left: 20px">
                    <el-button class="confirm" @click="editEleConfSubmit"
                      >保存</el-button
                    >
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="其他电价" name="otherElectrovalence">
                <el-form
                  ref="basicEleForm"
                  class="basicEleForm"
                  :rules="basicEleRules"
                  :model="basicEleForm"
                  label-width
                >
                  <el-row label="基本电价">
                    <el-col class="item-title" :span="24">基本电价</el-col>
                    <el-form-item label="计费方式:">
                      <el-radio-group v-model="basicEleForm.billingType">
                        <el-radio :label="0">最大需量法</el-radio>
                        <el-radio :label="1">变压器容量</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="需量电价:" prop="demandPrice">
                      <el-row :gutter="0">
                        <el-col :span="7">
                          <el-input v-model.number="basicEleForm.demandPrice">
                            <template slot="append">元/千瓦</template>
                          </el-input>
                        </el-col>
                      </el-row>
                    </el-form-item>
                    <el-form-item label="核定需量:" prop="approvedDemand">
                      <el-row :gutter="0">
                        <el-col :span="7">
                          <el-input v-model.number="basicEleForm.approvedDemand">
                            <template slot="append">KW</template>
                          </el-input>
                        </el-col>
                      </el-row>
                    </el-form-item>
                    <el-row :gutter="0">
                      <el-col :span="8">
                        <el-form-item label="需量计费:" prop="overDemand">
                          <el-col class="item-tag" :span="2">超过</el-col>
                          <el-col :span="16">
                            <el-input suffix-icon v-model.number="basicEleForm.overDemand">
                              <template slot="append">%</template>
                            </el-input>
                          </el-col>
                        </el-form-item>
                      </el-col>
                      <el-col :span="8">
                        <el-form-item prop="overTimes">
                          <el-col class="item-tag" :span="2">部分</el-col>
                          <el-col :span="16">
                            <el-input v-model.number="basicEleForm.overTimes">
                              <template slot="append">倍</template>
                            </el-input>
                          </el-col>
                          <el-col class="item-tag" :span="2">收费</el-col>                     
                        </el-form-item>
                      </el-col>                  
                    </el-row>
                    <el-form-item label="容量电价:" prop="capacityPrice">
                      <el-row :gutter="0">
                        <el-col :span="7">
                          <el-input v-model.number="basicEleForm.capacityPrice">                                                    
                            <template slot="append">元/千伏安</template>
                          </el-input>
                        </el-col>
                      </el-row>
                    </el-form-item>
                    <el-form-item label="核定容量:" prop="approvedCapacity">
                      <el-row :gutter="0">
                        <el-col :span="7">
                          <el-input v-model.number="basicEleForm.approvedCapacity">
                            <template slot="append">KVA</template>
                          </el-input>                         
                        </el-col>
                      </el-row>
                    </el-form-item>
                  </el-row>
                  <el-row label="力率电价">
                    <el-col class="item-title" :span="24">力率电价</el-col>
                    <el-form-item label="功率因数标准值:" prop="powerFactor">
                      <el-row :gutter="0">
                        <el-col :span="5">
                          <el-cascader
                            :show-all-levels="false"
                            style="width:100%;"
                            placeholder="请选择"
                            clearable
                            @change="handlePowerOption"
                            v-model.trim="basicEleForm.powerFactor"
                            :options="powerSelectList"
                            :props="{ expandTrigger: 'hover', checkStrictly: true }"
                          ></el-cascader>
                        </el-col>
                      </el-row>
                    </el-form-item>
                  </el-row>
                  <el-row label="加征(收)电价">
                    <el-col class="item-title" :span="24">加征(收)电价</el-col>
                    <el-row style="padding-left: 42px; font-size: 12px">
                      <el-row :gutter="20" class="list-item">
                        <el-col :span="6">
                          <div class="form-th">项目名称</div>
                        </el-col>
                        <el-col :span="6">
                          <div class="form-th">电价(元)</div>
                        </el-col>
                        <el-col :span="4">
                          <div class="form-th">
                            <el-button
                              size="mini"
                              class="success"
                              type="primary"
                              @click="increaseElectricList"
                              >添加</el-button
                            >
                          </div>
                        </el-col>
                      </el-row>
                      <div v-if="isTariffForms">
                        <el-row :gutter="20" class="list-item" v-for="(item, index) in basicEleForm.additionTariffForms" :key="index">
                          <el-col :span="6">
                            <el-form-item>
                              <el-input
                                v-model="item.entryName"
                                @input="inputChange($event)"
                                placeholder="项目名称"
                              ></el-input>
                            </el-form-item>                         
                          </el-col>
                          <el-col :span="6">
                            <el-form-item>
                              <el-input
                                v-model="item.collectionPrice"
                                @input="inputChange($event)"
                                placeholder="电价"
                              >
                                <template slot="append">元</template>
                              </el-input>
                            </el-form-item>                                          
                          </el-col>
                          <el-col :span="4">
                            <el-button size="mini" 
                              class="danger" 
                              type="primary"
                              v-show="basicEleForm.additionTariffForms.length > 1" 
                              @click="delElectricList(index)" 
                              style="margin-top: 3px">删除</el-button>                                                         
                          </el-col>
                        </el-row>
                      </div>
                    </el-row>
                  </el-row>
                  <el-form-item label>
                    <el-button class="confirm" type="primary" @click="saveConfig">保存</el-button>
                    <el-button class plain type="primary" @click="cancel('basicEleForm')">取消</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
          <!--------------------------- 水费价格 -->
          <el-tab-pane label="水费价格" name="fifth" v-if="currentSiteId">
            <div class="water-box" v-if="isWaterForm">

              <el-row :gutter="20" type="flex" style="margin-bottom: 20px">
                <el-col :span="2"></el-col>
                <el-col :span="3" style="text-indent: 15px">起始</el-col>
                <el-col :span="3" style="text-indent: 15px">结束</el-col>
                <el-col :span="3" style="text-indent: 15px">价格</el-col>
              </el-row>

              <el-form ref="waterForm" :model="waterForm" v-if="waterForm.key.length">
                <el-row :gutter="20" style="line-height: 40px; margin-bottom: 10px">
                  <el-col :span="2" style="text-align: center">第一阶段</el-col>
                  <el-col :span="3">
                    <el-form-item>
                      <el-input v-model.number="waterForm.key[0].begin" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="3">
                    <el-form-item>
                      <el-input v-model.number="waterForm.key[0].end" @input="waterOneInputEndChange($event)"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="3">
                    <el-form-item>
                      <el-input v-model.number="waterForm.key[0].price">
                        <template slot="append">元</template>                      
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20" style="line-height: 40px; margin-bottom: 10px">
                  <el-col :span="2" style="text-align: center">第二阶段</el-col>
                  <el-col :span="3">
                    <el-form-item>
                      <el-input v-model.number="waterForm.key[1].begin" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="3">
                    <el-form-item>
                      <el-input v-model.number="waterForm.key[1].end" @input="waterTwoInputEndChange($event)"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="3">
                    <el-form-item>
                      <el-input v-model.number="waterForm.key[1].price">
                        <template slot="append">元</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20" style="line-height: 40px">
                  <el-col :span="2" style="text-align: center">第三阶段</el-col>
                  <el-col :span="3">
                    <el-form-item>
                      <el-input v-model.number="waterForm.key[2].begin" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="3">
                    <el-form-item>
                      <el-input v-model.number="waterForm.key[2].end"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="3">
                    <el-form-item>
                      <el-input v-model.number="waterForm.key[2].price">
                        <template slot="append">元</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20" type="flex">
                  <el-col :span="2"></el-col>
                  <el-col :span="2">
                    <el-form-item style="margin-top: 20px">
                      <el-button class="confirm" @click="saveWater">保存</el-button>               
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>            
            </div>
          </el-tab-pane>
          <!--------------------------- 污水价格 -->
          <el-tab-pane label="污水价格" name="sixth" v-if="currentSiteId">
            <el-form :model="energyPriceForm" ref="sewogePriceForm" label-width="100px" v-if="energyType">
              <el-form-item 
                label="设置单价" 
                prop="sewogePrice"
                :rules="[
                  { required: true, message: '单价不能为空', trigger: 'change'},
                  { type: 'number', message: '单价必须为数字值', trigger: 'change'}
                ]"
              >
                <el-input v-model.number="energyPriceForm.sewogePrice" size="mini" style="width: 200px;">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
              <el-form-item style="margin-top: 20px">
                <el-button class="confirm" @click="saveEnergyPrice('sewogePriceForm', energyPriceForm.sewogePrice)">保存</el-button>               
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <!--------------------------- 蒸汽价格 -->
          <el-tab-pane label="蒸汽价格" name="seventh" v-if="currentSiteId">
            <el-form :model="energyPriceForm" ref="steamPriceForm" label-width="100px" v-if="energyType">
              <el-form-item 
                label="设置单价" 
                prop="steamPrice"
                :rules="[
                  { required: true, message: '单价不能为空', trigger: 'change'},
                  { type: 'number', message: '单价必须为数字值', trigger: 'change'}
                ]"
              >
                <el-input v-model.number="energyPriceForm.steamPrice" size="mini" style="width: 200px;">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
              <el-form-item style="margin-top: 20px">
                <el-button class="confirm" @click="saveEnergyPrice('steamPriceForm', energyPriceForm.steamPrice)">保存</el-button>               
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <!--------------------------- 压缩空气价格 -->
          <el-tab-pane label="压缩空气价格" name="eighth" v-if="currentSiteId">
            <el-form :model="energyPriceForm" ref="airPriceForm" label-width="100px" v-if="energyType">
              <el-form-item 
                label="设置单价" 
                prop="airPrice"
                :rules="[
                  { required: true, message: '单价不能为空', trigger: 'change'},
                  { type: 'number', message: '单价必须为数字值', trigger: 'change'}
                ]"
              >
                <el-input v-model.number="energyPriceForm.airPrice" size="mini" style="width: 200px;">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
              <el-form-item style="margin-top: 20px">
                <el-button class="confirm" @click="saveEnergyPrice('airPriceForm', energyPriceForm.airPrice)">保存</el-button>               
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="能源配置" name="nineth" v-if="currentSiteId">
            <div class="energy-config" style="overflow: hidden; height: 100%">
              <div class="equip-title">
                <div class="item-title">配置列表</div>
              </div>
              <div class="conf-title">
                <span>设备</span>
                <span>能源类型</span>
                <el-button type="text" @click="addEnergyConf">+ 添加</el-button>
              </div>
              <div class="configBox">
                <div
                  class="config"
                  v-for="(item, index) in energyConfigList"
                  :key="index"
                >
                  <div class="conf-single">
                    <div @click="selectEnergyEquip(index)" class="dis-input">
                      <el-input
                        v-model="item.equipmentName"
                        readonly
                      ></el-input>
                    </div>
                    <div class="select">
                      <el-select
                        v-model="item.type"
                        placeholder="请选择"
                        no-data-text="无数据"
                      >
                        <el-option
                          v-for="item in energyTypeList"
                          :key="item.id"
                          :label="item.properties"
                          :value="item.id"
                        ></el-option>
                      </el-select>
                    </div>
                    <el-button type="text" @click="delEnergyConf(index)"
                      >- 删除</el-button
                    >
                  </div>
                </div>
              </div>
              <div class="deal">
                <el-button class="confirm" @click="editEnergyConfSubmit"
                  >保存</el-button
                >
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <!-------------------------- 编辑分组弹窗 -->
    <el-dialog
      title="编辑分组信息"
      :visible.sync="groupVisible"
      width="440px"
      modal
      :close-on-click-modal="false"
      @close="before_group_close"
    >
      <el-form
        :model="groupForm"
        :rules="groupRules"
        ref="groupRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="所属站点" prop="group">
          <el-select
            v-model="groupForm.group"
            placeholder="请选择所属站点"
            @visible-change="getSite"
            disabled
            style="width: 247px"
          >
            <el-option
              v-for="item in siteOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分组名称" prop="name">
          <el-input
            v-model.trim="groupForm.name"
            style="width: 247px"
          ></el-input>
        </el-form-item>
        <!-- <el-form-item label="监控画面" prop="moudle">
          <el-input v-model="groupForm.moudle" placeholder="监控画面的访问地址"></el-input>
        </el-form-item>-->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="groupVisible = false"
          >取 消</el-button
        >
        <el-button class="confirm" @click="groupSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!--------------------------------- 删除分组弹窗 -->
    <el-dialog
      title="删除分组"
      :visible.sync="groupDeleteVisible"
      width="540px"
      modal
      modal-append-to-body
      :close-on-click-modal="false"
      @close="before_del_group_close"
    >
      <div style="width: 30px; float: left; margin: -7px 8px 5px -8px">
        <i :class="{ icon: true, iconfont: true, iconjinggao1: true }"></i>
      </div>
      <span>{{ '是否确定删除' + delGroupName + '？' }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="groupDeleteVisible = false"
          >取 消</el-button
        >
        <el-button class="dang" @click="deleteGroupSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!-------------------------- 删除分组下的监控设备弹窗 -->
    <el-dialog
      title="删除设备"
      :visible.sync="equipDeleteVisible"
      width="540px"
      modal
      modal-append-to-body
      :close-on-click-modal="false"
      @close="before_del_equip_close"
    >
      <div style="width: 30px; float: left; margin: -7px 8px 5px -8px">
        <i :class="{ icon: true, iconfont: true, iconjinggao1: true }"></i>
      </div>
      <span>{{ '是否确定删除' + delEquipName + '？' }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="equipDeleteVisible = false"
          >取 消</el-button
        >
        <el-button class="dang" @click="deleteEquipSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!--------------------------------- 新增网关弹窗 -->
    <el-dialog
      title="新增网关"
      :visible.sync="addGatewayVisible"
      width="420px"
      modal
      modal-append-to-body
      :close-on-click-modal="false"
      @close="clearGatewayForm"
    >
      <el-form
        ref="gatewayRef"
        :model="gatewayForm"
        :rules="gatewayRule"
        label-width="100px"
      >
        <el-form-item label="网关名称" prop="name">
          <el-input
            v-model.trim="gatewayForm.name"
            placeholder="请输入网关名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="网关编号" prop="id">
          <el-input
            v-model.number="gatewayForm.id"
            placeholder="请输入网关编号"
          ></el-input>
        </el-form-item>
        <el-form-item label="连接数" prop="linker">
          <el-input
            v-model.trim="gatewayForm.linker"
            placeholder="请输入连接数量"
          ></el-input>
        </el-form-item>
        <el-form-item label="所属站点" prop="room">
          <el-select
            v-model="gatewayForm.room"
            placeholder="请选择所属站点"
            disabled
          >
            <el-option
              v-for="item in roomList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上报周期" prop="period">
          <el-select v-model="gatewayForm.period" placeholder="请选择周期">
            <el-option label="不上报" value="0"></el-option>
            <el-option label="五分钟" value="5"></el-option>
            <el-option label="一小时" value="60"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="采集方式：" prop="dataAreaType">
          <el-radio-group
            v-show="showRadio"
            @change="updateDom('showRadio')"
            v-model="gatewayForm.dataAreaType"
          >
            <el-radio :label="0">Modbus</el-radio>
            <el-radio :label="1">数据转发</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="addGatewayVisible = false"
          >取 消</el-button
        >
        <el-button class="confirm" @click="gatewaySubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!-------------------------------- 分组批量新增监控变量弹窗 -->
    <el-dialog
      title="新增子设备"
      :visible.sync="add_group_variable_Visible"
      :close-on-click-modal="false"
      class="config-window"
      width="500px"
      @close="gruop_add_variate_close"
    >
      <div style="margin-bottom: 10px">
        <span>分组：</span>
        <span>{{ group_add_variate_name }}</span>
      </div>
      <div style="margin-bottom: 15px">
        <!-- <el-form-item label="选择网关" class="input-block"> -->
        <span>网关：</span>
        <el-select
          v-model="gateId"
          placeholder="请选择网关"
          style="width: 300px"
        >
          <el-option
            v-for="(item, index) in gatewayOptions"
            :key="index"
            :label="item.name"
            :value="item.gatewayId"
          ></el-option>
        </el-select>
      </div>
      <div>
        <span>设备：</span>
        <el-select
          v-model="value"
          multiple
          filterable
          default-first-option
          placeholder="请选择子设备"
          class="select-variate"
          style="width: 300px"
          @visible-change="getSinEquip"
        >
          <el-option
            v-for="item in options"
            :key="item.equipmentId"
            :label="item.name"
            :value="item.equipmentId"
          ></el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="add_group_variable_Visible = false"
          >取 消</el-button
        >
        <el-button class="confirm" @click="modify">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 弹出编辑网关页面 -->
    <el-dialog
      title="编辑网关"
      :visible.sync="gatewayVisible"
      width="420px"
      modal
      :close-on-click-modal="false"
      :show-close="true"
      @close="clearEditGatewayForm"
    >
      <el-form
        :label-position="labelPosition"
        label-width="100px"
        ref="editGatewayRef"
        :rules="editGatewayRule"
        style="width: 100%"
        :model="editGatewayForm"
      >
        <el-form-item label="名称" prop="name">
          <el-input
            v-model.trim="editGatewayForm.name"
            class="eidt-input-width"
          ></el-input>
        </el-form-item>
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input
            v-model.number="editGatewayForm.id"
            disabled
            class="eidt-input-width"
          ></el-input>
        </el-form-item>
        <el-form-item label="在线状态" prop="param">
          <el-input
            v-model.trim="editGatewayForm.param"
            disabled
            class="eidt-input-width"
          ></el-input>
        </el-form-item>

        <el-form-item label="连接电表数" prop="linker">
          <el-input
            v-model.trim="editGatewayForm.linker"
            class="eidt-input-width"
          ></el-input>
        </el-form-item>
        <el-form-item label="网关编号" prop="equipmentId">
          <el-input
            v-model.trim="editGatewayForm.equipmentId"
            disabled
            class="eidt-input-width"
          ></el-input>
        </el-form-item>
        <el-form-item label="所属站点">
          <el-input
            v-model="currentName"
            disabled
            class="eidt-input-width"
          ></el-input>
        </el-form-item>
        <el-form-item label="上报周期" prop="cron">
          <el-select
            v-model.trim="editGatewayForm.cron"
            placeholder="请选择周期"
            class="eidt-input-width"
          >
            <el-option
              v-for="item in cronOptions"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="采集方式：" prop="dataAreaType">
          <el-radio-group
            v-model="editGatewayForm.dataAreaType"
            :disabled="editType == 'edit'"
          >
            <el-radio :label="0">Modbus</el-radio>
            <el-radio :label="1">数据转发</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="gatewayVisible = false"
          >取 消</el-button
        >
        <el-button class="confirm" @click="submitGatewayChange"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 删除网关 -->
    <el-dialog title="提示" :visible.sync="delGatewayVisible" width="30%">
      <div style="width: 30px; float: left; margin: -7px 8px 5px -8px">
        <i :class="{ icon: true, iconfont: true, iconjinggao1: true }"></i>
      </div>
      <span>是否确定删除网关{{ delName }}？</span>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="delGatewayVisible = false"
          >取 消</el-button
        >
        <el-button class="dang" @click="delGateway">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑电表弹窗 -->
    <el-dialog
      :visible.sync="ammeterVisible"
      width="650px"
      :title="equipmentTitle"
      modal
      :close-on-click-modal="false"
      :show-close="true"
      @close="before_ammeter_close"
      class="variate-dialog"
    >
      <el-form
        :label-position="labelPosition"
        :rules="ammeterRule"
        ref="ammeterRef"
        label-width="80px"       
        :model="editammeterForm"
        class="variate-form"
      >
        <!-- 新增设备弹框 -->
        <div class="edit-input" v-if="ifAddEquip" key="addEquip">
          <el-form-item label="设备名称" prop="name">
            <el-input
              v-model.trim="editammeterForm.name"
              class="input-width-s"
              placeholder="请输入设备名称"
            ></el-input>
          </el-form-item>
          <el-form-item label="设备编号" prop="number">
            <el-input
              v-model.number="editammeterForm.number"
              class="input-width-s"
              placeholder="请输入电表ID"
            ></el-input>
          </el-form-item>
          <el-form-item label="额定电压" prop="ratedVoltage">
            <el-input
              v-model.number="editammeterForm.ratedVoltage"
              class="input-width-s"
              placeholder="请输入额定电压"
            ></el-input>
          </el-form-item>
          <el-form-item label="所属站点" prop="siteName">
            <el-select
              v-model.trim="editammeterForm.siteName"
              class="input-width-s"
              placeholder="请选择所属站点"
              disabled
            >
              <el-option
                v-for="item in roomList2"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="所属网关" prop="gateway">
            <el-select
              v-model="editammeterForm.gatewayName"
              class="input-width-s"
              placeholder="请选择网关"
              disabled
            >
              <el-option
                v-for="item in gatewayList2"
                :key="item.equipmentId"
                :label="item.name"
                :value="item.equipmentId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备类型" prop="equipfileId">
            <el-cascader
              :show-all-levels="false"
              style="width:100%;"
              placeholder="请选择类型"
              clearable
              @visible-change="getAllFileEquip"
              v-model.trim="editammeterForm.equipfileId"
              :options="deviceTypeList"
              :props="deviceTypeProps"
            ></el-cascader>
          </el-form-item>
        </div>

        <!-- 编辑设备弹框 -->
        <div class="edit-input" v-else key="editEquip">
          <el-form-item label="设备名称" prop="name">
            <el-input
              v-model.trim="editammeterForm.name"
              @input="inputChange($event)"
              class="input-width-s"
              placeholder="请输入设备名称"
            ></el-input>
          </el-form-item>
          <el-form-item label="设备编号">
            <el-input
              v-model.number="editammeterForm.number"
              disabled
              class="input-width-s"
              placeholder="请输入电表ID"
            ></el-input>
          </el-form-item>
          <el-form-item label="额定电压" prop="ratedVoltage">
            <el-input
              v-model.number="editammeterForm.ratedVoltage"
              class="input-width-s"
              @input="inputChange($event)"
              placeholder="请输入额定电压"
            ></el-input>
          </el-form-item>
          <el-form-item label="所属站点">
            <el-select
              v-model.trim="editammeterForm.siteName"
              class="input-width-s"
              placeholder="请选择所属站点"
              disabled
            >
              <el-option
                v-for="item in roomList2"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="所属网关">
            <el-select
              v-model="editammeterForm.gatewayName"
              class="input-width-s"
              placeholder="请选择网关"
              disabled
            >
              <el-option
                v-for="item in gatewayList2"
                :key="item.equipmentId"
                :label="item.name"
                :value="item.equipmentId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备类型" prop="equipfileId">
            <el-cascader
              :show-all-levels="false"
              style="width:100%;"
              placeholder="请选择设备类型"
              clearable
              @visible-change="getAllFileEquip"
              @change="equipfileChange"
              v-model.trim="editammeterForm.equipfileId"
              :options="deviceTypeList"
              :props="deviceTypeProps"
            ></el-cascader>
          </el-form-item>

          <!-- 保养方式 -->
          <div class="health-box" v-if="editammeterForm.maintainConfigs && editammeterForm.maintainConfigs.length > 0" key="healthBox">
            <p class="data-text">保养</p>
            <el-form-item label="变量" prop="maintainCode" class="maintainCode">
              <el-select
                v-model.trim="editammeterForm.maintainCode"
                filterable
                allow-create
                default-first-option
                class="input-width-s"
                placeholder="请选择变量"
                @input="inputChange($event, 'maintainCode')"
              >
                <el-option
                  v-for="item in equipMaintainConfigs"
                  :key="item.equipmentId"
                  :label="item.name"
                  :value="item.code"
                ></el-option>
              </el-select>
              <transition name="fade"><div class="el-form-item__error" v-show="isMaintainCodeShow">请选择监控方式</div></transition>
            </el-form-item>
            <el-form-item label="值" prop="judgValue" class="judgValue">
              <el-input
                v-model.number="editammeterForm.judgValue"
                class="input-width-s"
                placeholder="请输入值"
                @input="inputChange($event, 'judgValue')"
              ></el-input>
              <transition name="fade"><div class="el-form-item__error" v-show="isJudgValueShow">请输入值</div></transition>
            </el-form-item>
          </div>
         
          <!-- 监控内容 -->
          <div class="control-box" v-if="editammeterForm.monitorConfigs && editammeterForm.monitorConfigs.length > 0" key="controlBox">
            <p class="data-text">监控</p>
            <el-row class="control-title">
              <el-col :span="6">监控内容</el-col>
              <el-col :span="6">监控规则</el-col>
              <el-col :span="6">变量</el-col>
              <el-col :span="6">值</el-col>                           
            </el-row>
            <el-row class="control-item" style="margin-top: 10px" v-for="item in editammeterForm.monitorConfigs" :key="item.id">

              <el-col :span="6">
                <el-form-item>
                  <el-input
                    v-model.trim="item.monitorContent"
                    disabled
                  ></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item>
                  <el-input
                    v-model.trim="item.monitorRules"
                    disabled
                  ></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item>
                  <el-select
                    v-model.trim="item.monitorCode"
                    filterable
                    allow-create
                    default-first-option
                    placeholder="请选择监控方式"
                    @change="inputChange($event)"
                  >
                    <el-option
                      v-for="v in equipMaintainConfigs"
                      :key="v.equipmentId"
                      :label="v.name"
                      :value="v.code"
                    ></el-option>
                  </el-select>       
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item>
                  <el-input
                    v-model="item.monitorValue"
                    placeholder="请输入值"                 
                    @input="inputChange($event)"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
                 
          </div>
        </div>
      </el-form>
      
      <!-- 编辑数据区 -->
      <div class="data-box" style="margin-top: 10px">
        <p class="data-text">编辑数据区</p>
        <div class="data-area">
          <el-form>
            <el-form-item label="编辑方式：" style="margin-bottom: 0">
              <el-radio-group
                v-model="dataAreaType"
                :disabled="editType == 'edit'"
              >
                <el-radio :label="0">自定义数据区</el-radio>
                <el-radio :label="1">指定数据区</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div v-if="dataAreaType == 0">
            <el-button @click="addArea" size="small" type="success" plain
              >+ 添加数据区</el-button
            >
            <span style="font-size: 12px; margin-top: 10px"
              >*起始地址为寄存器编号（十进制），长度为数据区所占用的寄存器个数</span
            >
          </div>
          <el-form>
            <el-form-item label="指定数据区" v-if="dataAreaType == 1">
              <el-select v-model="assignData" placeholder="选择数据区" multiple>
                <el-option
                  v-for="item in assignDataList"
                  :label="item.dataBlkName"
                  :key="item.uuid"
                  :value="item.uuid"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <el-table
            v-if="dataAreaType == 0 && showTable"
            :data="editData"
            key="editData"
            style="width: 100%; margin-top: 10px"
          >
            <el-table-column prop="areaName" label="名称" width>
              <template slot-scope="scope">
                <el-form ref="form">
                  <el-input
                    style="height: 28px"
                    v-model.trim="scope.row.areaName"
                    placeholder
                  ></el-input>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column prop="begin" label="起始地址" width>
              <template slot-scope="scope">
                <el-form ref="form">
                  <el-input
                    style="height: 28px"
                    v-model.trim="scope.row.begin"
                    placeholder
                  ></el-input>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column prop="length" label="长度" width>
              <template slot-scope="scope">
                <el-form ref="form">
                  <el-input
                    style="height: 28px"
                    v-model.trim="scope.row.length"
                    placeholder
                  ></el-input>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column label="操作" width>
              <template slot-scope="scope">
                <el-button
                  class="danger"
                  size="mini"
                  @click="del(scope.$index)"
                  type="primary"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <el-table
            v-if="dataAreaType == 1"
            key="editData2"
            :data="editData"
            style="width: 100%; margin-top: 10px"
          >
            <el-table-column prop="areaName" label="名称" width></el-table-column>
            <el-table-column
              prop="begin"
              label="起始地址"
              width
            ></el-table-column>
            <el-table-column prop="length" label="长度" width></el-table-column>
          </el-table>
        </div>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="ammeterVisible = false"
          >取 消</el-button
        >
        <el-button class="confirm" @click="submitEquipmentChange"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 删除电表 -->
    <el-dialog
      title="提示"
      :visible.sync="delAmmeterVisible"
      width="30%"
      modal
      :close-on-click-modal="false"
      :show-close="true"
    >
      <div style="width: 30px; float: left; margin: -7px 8px 5px -8px">
        <i :class="{ icon: true, iconfont: true, iconjinggao1: true }"></i>
      </div>
      <span>是否确认删除设备 {{ delName }}?</span>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="delAmmeterVisible = false"
          >取 消</el-button
        >
        <el-button class="dang" @click="delAmmeter">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 新增文件表单 --------------------->
    <el-dialog
      title="导入文件"
      :visible.sync="importFileVisible"
      :close-on-click-modal="false"
      width="500px"
      @close="beforeFileClose"
      class="file-dialog"
    >
      <!-- <el-form :model="addFileForm" label-width="100px" class="form">
        <el-form-item label="选择文件" prop="file" style="position: relative;">
          <input
            @change="selectFile($event)"
            type="file"
            ref="input1"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="importFileVisible = false">取 消</el-button>
        <el-button class="confirm" @click.prevent="fileSubmit">确 定</el-button>
      </span>-->
      <el-upload
        action="#"
        :file-list="fileList"
        :on-change="changeData"
        :http-request="handleRequest"
        :before-upload="beforeUpload"
        style="padding-top: 10px"
        :disabled="ifUpload"
      >
        <el-button class="btn upload-btn" :disabled="ifUpload"
          >上传附件</el-button
        >
        <div slot="tip" class="el-upload__tip">上传文件大小不超过50M</div>
      </el-upload>
      <div class="pro" v-if="ifUpload" style="display: flex">
        <span>上传进度</span>
        <el-progress
          style="margin-bottom: 10px; flex: 1; margin-left: 16px"
          :stroke-width="6"
          :percentage="progressPercent"
        ></el-progress>
      </div>
      <div
        style="width: 100%; height: 30px"
        v-loading="parseLoading"
        element-loading-text="服务器正在解析..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(40, 57, 70)"
      ></div>
    </el-dialog>

    <!-- 批量删除 -->
    <el-dialog
      title="批量删除监控设备"
      :visible.sync="deleteMonitorMulVisible"
      width="500px"
      class="user-dialog"
      @close="clearMonitorInfo"
    >
      <el-form
        :model="delMonitorMulForm"
        :rules="delMonitorMulRule"
        ref="delMonitorMulRef"
        label-width="110px"
        class="user-form"
      >
        <el-form-item label="删除多选项" prop="id">
          <el-select
            v-model="delMonitorMulForm.id"
            multiple
            filterable
            default-first-option
            placeholder="请选择设备"
          >
            <el-option
              v-for="item in monitorMulOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="deleteMonitorMulVisible = false"
          >取 消</el-button
        >
        <el-button class="dang" @click="delMulSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 电表配置修改设备弹窗 -->
    <el-dialog
      title="选择监控配置"
      :visible.sync="selectMonitorVisible"
      width="500px"
      class="conf-dialog"
      :close-on-click-modal="false"
      :show-close="true"
    >
      <el-cascader
        :key="casKey"
        :show-all-levels="false"
        v-model="monitorEquipId"
        :props="defaultConfProps"
        :options="group_equip_options"
        @change="monitorEquipSelect"
        ref="myCascader"
      ></el-cascader>
    </el-dialog>
  </div>
</template>

<script>
import MyBreadcrumb from '../subcomponents/Mybreadcrumb'
import GLOBAL from '../../utils/global_variable'
// 引入深拷贝
import { deepClone, findItemById } from '../../utils/index'
import { findArrIndex, isPositiveInteger } from '../../utils/index'
import { log } from 'util'
export default {
  components: {
    MyBreadcrumb
  },
  data() {
    // 新增网关、新增设备表单中的编号验证
    var checkId = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('编号不能为空'))
      }
      if (!Number.isInteger(value) || value < 1) {
        callback(new Error('请输入正整数值'))
      } else {
        callback()
      }
    }
    // 新增网关、编辑网关表单中的连接数验证
    var checkLinker = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('连接数不能为空'))
      }
      if (!Number.isInteger(parseInt(value)) || value < 1) {
        callback(new Error('请输入正整数值'))
      } else {
        callback()
      }
    }
    return {
      isJudgValueShow: false, // 所有设备下 变量值验证
      isMaintainCodeShow: false, // 所有设备下 变量验证
      equipMonitorConfigs: [], // 所有设备下 弹窗监控内容选项  
      equipMaintainConfigs: [], // 所有设备下 弹窗保养内容选项  
      equipmentTitle: '新增电表', // 所有设备下 弹窗标题    
      equipmentTableMode: true, // 所有设备下  设备表格模式    
      equipDetailList: [], // 所有设备下 导入设备详情列表     
      deviceTypeList: [],  // 弹出框设备类型下拉框选项
      deviceTypeProps: {
        children: "childrenList",
        label: "name",
        value: "id",
        emitPath: false,
        expandTrigger: "hover"
      },
      // 功率因素标准值选项列表
      powerSelectList: [
        {         
          label: 0.90,
          value: 0.90    
        }
      ],
      parseLoading: false,
      siteTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      activeName: 'first',
      tableData: [],
      companyName: null,
      // 添加设备
      ammeterVisible: false,
      ammeterForm: {},
      roomList2: [],
      gatewayList2: [],
      dataArea: [],
      dataIndex: 0, //用于记录数据区的行数索引

      // 新增分组
      siteOptions: [],
      groupForm: {
        name: ''
      },
      groupRules: {
        group: [{ required: true, message: '请选择分组', trigger: 'blur' }],
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      groupVisible: false,
      groupDeleteVisible: false,
      // ------------------------------------所有设备
      exportModelLoading: false, //导出模板加载状态
      exportLoading: false, //导出设备加载状态
      fileList: [], //导入文件列表
      ifUpload: false, //是否上传文件中
      progressPercent: 0, //文件导入百分比
      addGatewayVisible: false, //新增网关弹窗
      gatewayForm: {}, //新增网关表单
      // 新增网关表单验证
      gatewayRule: {
        name: [
          {
            required: true,
            message: '请输入网关名称',
            trigger: 'blur'
          }
        ],
        id: [
          {
            validator: checkId,
            required: true,
            // message: "请输入id",
            trigger: 'blur'
          }
        ],
        linker: [
          {
            validator: checkLinker,
            required: true,
            // message: "请输入连接数",
            trigger: 'blur'
          }
        ],
        room: [
          {
            required: true,
            message: '请选择站点',
            trigger: 'blur'
          }
        ],
        period: [
          {
            required: true,
            message: '请选择周期',
            trigger: 'blur'
          }
        ],
        dataAreaType: [
          {
            required: true,
            message: '请选择采集方式',
            trigger: 'blur'
          }
        ]
      },
      // 编辑网关表单验证
      editGatewayRule: {
        name: [
          {
            required: true,
            message: '请输入网关名称',
            trigger: 'blur'
          }
        ],
        id: [
          {
            required: true,
            message: '请输入网关编号',
            trigger: 'blur'
          }
        ],
        linker: [
          {
            validator: checkLinker,
            required: true,
            // message: "请输入连接数",
            trigger: 'blur'
          }
        ],
        room: [
          {
            required: true,
            message: '请选择站点',
            trigger: 'blur'
          }
        ],
        period: [
          {
            required: true,
            message: '请选择周期',
            trigger: 'blur'
          }
        ]
      },
      // 污水/蒸汽/压缩空气 单价
      energyPriceForm: {
        sewogePrice: '',
        steamPrice: '',
        airPrice: ''
      }, 
      // 水费价格
      waterForm: {
        key: [{
          begin: 0,
          end: '',
          type: '1',
          price: ''
        },
        {
          begin: '',
          end: '',
          type: '2',
          price: ''
        },
        {
          begin: '',
          end: '',
          type: '3',
          price: ''
        }]
      },
      roomList: [],
      linker: '',
      currentSiteId: '', //当前展示的站点
      currentName: '',
      delGroupName: '', //要删除的分组名称
      delGroupId: '', //要删除的分组id
      editGroupId: '', //编辑中的分组id
      add_group_variable_Visible: false, //分组添加变量弹窗
      watchArr: [
        {
          equip_options: [],
          index: 0,
          code: ''
        }
      ],
      modifyId: '',
      options: [], //所有设备可选项
      gatewayOptions: [], //所有网关可选项
      value: [], //设备选中项
      gateId: '', //网关选中项
      variateStr: '', //设备编号集
      group_add_variate_name: '', //分组名
      group_add_variate_Id: '', //分组id
      equipDeleteVisible: false, //删除设备
      equipDeleteId: null, //要删除的设备Id
      delEquipName: null, //要删除的设备名称
      loading: false,
      deleteMonitorMulVisible: false, //批量删除监控变量
      delMonitorMulForm: {}, //批量删除变量表单
      delMonitorMulRule: {
        id: [
          {
            required: true,
            message: '请选择设备',
            trigger: 'blur'
          }
        ]
      },
      monitorMulOptions: [], //所有能删除的变量
      // 所有设备
      getRowkeys(row) {
        return row.id
      },
      gatewayObj: [],
      gatewayLoading: false,
      ammeterTable: [],
      equipLoading: false,
      totalEquipment: 0,
      equipCurrentPage: 1,
      gatePageSize: 10,
      totalGate: 0,
      ammeterVisible: false,
      ammeterForm: {},
      expands: [],
      // gateCurrentPage: 1,
      gatewayId: null, //标记正在操作的网关id
      // equipPage: 1,
      equipSize: 10,
      gatePage: 1, //网关当前页
      delGatewayVisible: false,
      delName: null,
      gatewayVisible: false,
      editGatewayForm: {
        name: '',
        id: '',
        linker: '',
        belong: '',
        cron: '',
        equipmentId: '',
        gatewayId: '',
        dataAreaType: 0
      },
      labelPosition: 'right',
      cronOptions: [
        { label: '不上报', value: 0 },
        { label: '5分钟', value: 5 },
        { label: '60分钟', value: 60 }
      ],
      editammeterForm: {
        name: '',
        computerRoom: '',
        ratedVoltage: '', //额定电压
        gatewayId: '',
        // cron: "",
        id: '',
        equipmentId: '',
        siteName: '',
        gatewayName: '',
        equipfileId: null,
        maintainCode: '',
        judgValue: ''
      },
      existDataIdArr: [], //编辑设备时已经存在的id
      delDataIdArr: [], //编辑设备时删除已存在的id
      ammeterRule: {
        name: [{ required: true, message: '请输入设备名称', trigger: 'change' }],       
        number: [{ required: true, trigger: 'change', validator: checkId }],       
        ratedVoltage: [{ required: true, message: '请输入额定电压', trigger: 'change' }], 
      },
      ifAddEquip: false,
      // 弹窗的编辑数据区数据
      editData: [],
      editOldData: [],
      delAmmeterVisible: false,
      linker: null,
      importFileVisible: false, //批量导入设备弹窗
      addFileForm: {}, //批量导入设备文件表单
      ifMonitor: false, //是否批量删除监控设备
      fileEquipOptions: [], //编辑电表中的档案设备选项
      // ----------------------------------------------电价
      countTime: '', //月结算日
      countTimeOptions: [],
      defalutBooleanTrue: true,
      priceDetailArr: [],   
      priceForm: {},
      priceRules: {
        'stagePrice.name': [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        'stagePrice.ping': [
          { required: true, message: '请输入大于0的价格', trigger: 'blur' }
        ],
        'stagePrice.feng': [
          { required: true, message: '请输入大于0的价格', trigger: 'blur' }
        ],
        'stagePrice.gu': [
          { required: true, message: '请输入大于0的价格', trigger: 'blur' }
        ]
      },
      priceData: [
        {
          beginTime: '',
          endTime: '',
          attr: ''
        },
        {
          beginTime: '',
          endTime: '',
          attr: ''
        }
      ],
      timeOptions: [],
      priceOptions: [
        {
          label: '平',
          value: 1
        },
        {
          label: '峰',
          value: 2
        },
        {
          label: '谷',
          value: 3
        }
      ],
      activeEle: '', //用电电价的选中标签
      // 电价电表配置默认
      defaultConfProps: {
        children: 'children',
        label: 'name',
        value: 'id'
      },
      group_equip_options: [], //电价电表联级数据
      temp_options: [], //临时联级数据
      // 电表电费配置数据
      equip_conf_arr: [
        {
          confName: '1',
          equipmentId: '',
          name: 1,
          site: ''
        }
      ], //电表配置数组数据
      equipId: [],
      ruleNameArr: [], //规则名称集合
      selectMonitorVisible: false, //电表配置弹窗
      monitorEquipId: [], //弹窗选中的设备id集合
      casKey: 1, //联级key，用于刷新组件
      equipConfIndex: 0, //编辑电表配置的下标
      // --------------------------------能源配置
      energyConfigList: [], //能源配置
      energyTypeList: [], //能源类型
      energyType: '', // 污水/蒸汽/压缩空气 类型
      energyInfo: {}, // 保存的 污水/蒸汽/压缩空气 信息
      delIds: '', //要删除的电表设备的id，保存传给后端
      conHeight: 0,
      // 其他电价对象
      basicEleForm: {
        id: '', //	Integer	配置id
        demandPrice: '', //	Double	需量电价
        approvedDemand: '', //	Double	核定需量
        overDemand: '', //	Integer	超出部分
        overTimes: '', //	Integer	超出后倍数
        capacityPrice: '', //	Double	容量电价
        approvedCapacity: '', //	Double	核定容量
        billingType: 1, //	Integer	计费方式：0需量,1容量
        powerFactor: '', //	Double	功率因数标准值
        additionTariffForms: [
          {
            entryName: '',
            collectionPrice: ''
          }
        ], //	JSON数据格式	价征收电价集合      
        siteId: '' //	Integer	站点id
      },
      basicEleRules: {}, // 其他电价验证规则
      // 添加数据区类型
      editType: 0,
      dataAreaType: 0,
      //指定的数据区
      assignData: [],
      assignDataList: [],
      showRadio: true,
      showTable: true,
      timeout: null
    }
  },
  computed: {
    isTariffForms() {
      return this.basicEleForm.additionTariffForms && this.basicEleForm.additionTariffForms.constructor === Array
    },
    isWaterForm() {
      return this.waterForm.key.constructor === Array
    },
    companyId() {
      return this.$store.state.site.searchCompanyId
    }
  },
  watch: {
    countTime() {
      this.$http
        .post('equipment/site/electricityCycle', {
          siteId: this.$store.state.site.siteId,
          electricityCycle: this.countTime
        })
        .then((res) => {
          if (res.data.code === 0) {
          }
        })
    },
    progressPercent(newValue) {
      if (newValue == 100) {
        this.parseLoading = true
      }
    },
    // 类型变化
    dataAreaType(newValue, oldValue) {
      if (this.editType == 'add') {
        this.editData = []
        this.existDataIdArr = []
        this.assignData = []
        this.delDataIdArr = []
      } else if (this.editType == 'edit') {
        
      }
      if (newValue == 1) {
        this.$http
          .get('equipment/transmitConfig/findDataArea', {
            params: {
              gatewayId: this.gatewayId
            }
          })
          .then((res) => {
            if (res.data.code == 0) {
              this.assignDataList = res.data.data
            } else {
              this.assignDataList = []
            }
          })
      }
    },
    // 指定数据区变化
    assignData(newValue, oldValue) {
      if (this.dataAreaType == 1) {
        this.editData = []
        this.$http
          .get('equipment/transmitConfig/getAreaByUUID', {
            params: {
              uuids: this.assignData.join(',')
            }
          })
          .then((res) => {
            if (res.data.code == 0) {
              this.editData = res.data.data
              this.editData.forEach(item => {
                item.areaName = item.name
                item.nId = item.uuid + item.name // 添加唯一字符串
              })
            }
          })
      }
    },
    // 所有设备下 设备类型变化
    "editammeterForm.equipfileId"() {
      if (!this.editammeterForm.equipfileId) {
        this.editammeterForm.maintainConfigs = []
        this.editammeterForm.monitorConfigs = []
        this.$forceUpdate()
      }
    },
    // 所有设备下 设备表格变化
    equipmentTableMode() {
      this.equipCurrentPage = 1
      if (this.equipmentTableMode) {
        this.getGateway()
      } else {
        this.getEquipmentDetail()
      }
    },
    // 用电电价下 计费方式发生变化
    "basicEleForm.billingType"(newValue) {
      if (newValue === 0) { // 需量电价验证
        this.basicEleRules = {
          demandPrice: [{ required: true, message: '请输入需量电价', trigger: 'change' }],
          approvedDemand: [{ required: true, message: '请输入核定需量', trigger: 'change' }]
        }
      } else { // 容量电价验证
        this.basicEleRules = {
          capacityPrice: [{ required: true, message: '请输入容量电价', trigger: 'change' }],
          approvedCapacity: [{ required: true, message: '请输入核定容量', trigger: 'change' }]
        }
      }
    // 移除校验结果
     this.$nextTick(() => {
       this.$refs.basicEleForm.clearValidate()
     })
    }
  },
  methods: {
    // 嵌套太多层，导致 v-model 无法感应
    inputChange(event, ele) {
      // 所有设备tab栏下，保养内容验证
      if (ele === 'judgValue') { 
        if (this.editammeterForm.judgValue === '') { this.isJudgValueShow = true } // 显示验证
        else { this.isJudgValueShow = false }
      } 

      if (ele === 'maintainCode') {
        if (this.editammeterForm.maintainCode === '') { this.isMaintainCodeShow = true }
        else { this.isJudgValueShow = true } // 显示验证
      } 
    
      this.$forceUpdate()
    },
    // 查看导入设备详情
    async getEquipmentDetail() {
      try {
        const res = await this.$http({
          url: '/equipment/fileRecords/findStatusByType',
          params: {
            siteId: this.$store.state.site.siteId,
            type: 0,
            size: this.gatePageSize,
            page: this.gatePage - 1
          }
        })
        if (res.data.code === 0) {
          this.gatewayObj = []
          this.equipDetailList = res.data.data.fileRecordsVOList
          this.equipmentTableMode = false
          this.totalGate = res.data.data.total
        } else {
          this.$notify({
            message: res.data.msg,
            type: 'warning'
          })
        }
      } catch (error) {
        
      }
    },
    // 设备类型值更改
    equipfileChange(res) {   
      if (res) {
        this.editammeterForm.equipfileId = res
      }
      if (this.editType === 'edit' && this.editammeterForm.equipfileId) {
        this.getEquipContent()
        this.getEquipMaintain()
      }   
    },
    // 查询电表下的变量
    async getEquipMaintain() {
      const res = await this.$http({
        url: '/equipment/variable/findAllByEquipment',
        params: {
          equipmentId: this.editammeterForm.equipmentId
        }
      })
      if (res.data.code === 0) {
        this.equipMaintainConfigs = res.data.data.map(item => ({
          name: item.name,
          code: item.code,
          equipmentId: item.equipmentId
        }))
      }     
    },
    // 获取所有设备下弹窗的保养内容和监控内容
    async getEquipContent() {
      try {
        if (!this.editammeterForm.equipfileId) return
        const res = await this.$http({
          url: '/equipment/product/findByProduct',
          params: {
            productId: this.editammeterForm.equipfileId
          }
        })
        if (res.data.code === 0) {
          this.editammeterForm.maintainConfigs = res.data.data.maintainConfigs
          this.editammeterForm.monitorConfigs = res.data.data.monitorConfigs
          
          for (let i = 0; i < this.editammeterForm.monitorConfigs.length; i++) {
            this.editammeterForm.monitorConfigs[i].monitorCode = this.equipMonitorConfigs[i].monitorCode || ''
            this.editammeterForm.monitorConfigs[i].monitorValue = this.equipMonitorConfigs[i].monitorValue || ''
          }
        } else {
          this.$notify({
            title: res.data.msg,
            type: 'warning'
          })
        }
      } catch (error) {
        
      }
       this.$forceUpdate()
    },
    // 保存其他电价
    async saveOtherConfig() {
      this.basicEleForm.additionTariffForms = JSON.stringify(this.basicEleForm.additionTariffForms)
      this.basicEleForm.siteId = this.currentSiteId
      try {     
        await this.$http.post('/equipment/basicPrice/saveConfig', this.basicEleForm)     
        this.$message({
          message: '保存成功',
          type: 'success'
        }) 
      } catch (error) {}
      // this.cancel('basicEleForm')
      const isTariff = this.basicEleForm.additionTariffForms instanceof Array
      this.basicEleForm.additionTariffForms = isTariff ? this.basicEleForm.additionTariffForms : JSON.parse(this.basicEleForm.additionTariffForms)
      this.getOtherConfig()
      this.$forceUpdate()
    },
    // 保存其他电价
    saveConfig() {    
      this.$refs.basicEleForm.validate(valid => {
        if(!valid) {
          // 表单验证不通过
          this.$notify({
            message: '验证失败',
            type: "error"
          })
          return
        }
        this.basicEleForm.additionTariffForms = this.basicEleForm.additionTariffForms.filter(item => {
          return item.entryName !== '' && item.collectionPrice !== ''
        })

        if (this.basicEleForm.additionTariffForms.length === 0) {
          this.saveOtherConfig()
          return
        }

        // 如果有id，把id添加进征收电价集合
        if(this.basicEleForm.id) {
          this.basicEleForm.additionTariffForms.forEach(item => {
            item.id = this.basicEleForm.id
          })
        }

        // 把siteId添加进征收电价集合
        this.basicEleForm.additionTariffForms.forEach((item, index)  => {
          item.siteId = this.currentSiteId
        })   
        this.saveOtherConfig()    
      })
    },
    // 取消保存
    cancel(formName) {  
      this.$refs[formName].resetFields()
      // 清空征收电价集合
      if(formName === 'basicEleForm') {
        this.basicEleForm.additionTariffForms.forEach(item => {
          for(const k in item) {
            item[k] = ''
          }
        })
      }
      this.getOtherConfig()
    },
    // 获取站点下其他电价配置信息
    async getOtherConfig() {
      try {
        const res = await this.$http({
          method: 'get',
          url: '/equipment/basicPrice/getConfig',
          params: {
            siteId: this.currentSiteId
          }
        })
        let data = res.data.data
        this.basicEleForm = data.basicPrice || {billingType: 1}
        this.basicEleForm.additionTariffForms = data.additionTariffList.length ? data.additionTariffList : [{entryName: '', collectionPrice: ''}]     
      } catch (error) {}
    },
    // 选择功率因数标准值
    handlePowerOption(res) {
      this.basicEleForm.powerFactor = res ? res[0] : ''
    },
    // 添加加征电价
    increaseElectricList() {
      const electricObj = {
        // id: this.basicEleForm.additionTariffForms.length + 1,
        entryName: '',
        collectionPrice: ''
      }
      this.basicEleForm.additionTariffForms.push(electricObj)
      this.$forceUpdate()
    },
    // 删除加征电价
    delElectricList(index) {
      this.basicEleForm.additionTariffForms.splice(index, 1)
      this.$forceUpdate()
    },
    // 获取 站点下其他能源配置信息(污水，蒸汽，压缩空气)
    async getOtherEnergyInfo() {
      try {
        const res = await this.$http({
          url: '/equipment/OtherEnergyConf/findConf',
          params: {
            siteId: this.currentSiteId,
            energyType: this.energyType
          }
        })
        if (res.data.code === 0) {
          console.log(res)
          // 如果data为空
          if (!res.data.data) {
            this.energyPriceForm.sewogePrice = ''
            this.energyPriceForm.steamPrice = ''
            this.energyPriceForm.airPrice = ''
            return
          }
          if (res.data.data.energyType === 3) {
            this.energyPriceForm.sewogePrice = res.data.data.price
          } else if (res.data.data.energyType === 4) {
            this.energyPriceForm.steamPrice = res.data.data.price
          } else if (res.data.data.energyType === 5) {
            this.energyPriceForm.airPrice = res.data.data.price
          } 
          this.energyInfo = res.data.data
        }
      } catch (error) {}
    },
    // 保存 站点下其他能源单价(污水，蒸汽，压缩空气)
    async saveOtherEnergyPrice(price) {
      try {
        const res = await this.$http({
          method: 'post',
          url: '/equipment/OtherEnergyConf/newConf',
          data: {
            id: this.energyInfo.id,
            price,
            energyType: this.energyType,
            siteId: this.currentSiteId
          }
        })
        this.$message({
          message: '保存成功',
          type: 'success'
        })
        this.energyInfo = res.data.data
      } catch (error) {}
    },
    // 保存污水/蒸汽/压缩空气单价
    saveEnergyPrice(formName, price) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.saveOtherEnergyPrice(price)
        } else {
          return false
        }
      })
    },
    // 获取水费价格
    async getWaterPrice() {
      try {
        const res = await this.$http({
          url: '/equipment/waterConf/findBySite',
          params: {
            siteId: this.currentSiteId
          }
        })
        if (res.data.data.length) {
          this.waterForm.key = res.data.data
        } else {
          this.waterForm.key = [{
            begin: 0,
            end: '',
            type: '1',
            price: ''
          },
          {
            begin: '',
            end: '',
            type: '2',
            price: ''
          },
          {
            begin: '',
            end: '',
            type: '3',
            price: ''
          }]
        }   
      } catch (error) {}      
    },
    async saveWaterPrice() {
      try {
        this.waterForm.key = JSON.stringify(this.waterForm.key)
        const res = await this.$http({
          method: 'post',
          url: '/equipment/waterConf/newConf',
          data: {
            waterConf: this.waterForm.key
          }
        })   
        this.$message.success('保存成功')
        this.waterForm.key = JSON.parse(this.waterForm.key)
      } catch (error) {}          
    },
    // 改变水费价格区间
    waterTwoInputEndChange(e) {
      this.waterForm.key[2].begin = +e
    },
    waterOneInputEndChange(e) {
      this.waterForm.key[1].begin = +e
    },
    // 保存水费价格
    saveWater() {
      this.waterForm.key.forEach(item => {
        if(this.basicEleForm.id) {
          item.id = this.basicEleForm.id
        }
        item.siteId = this.currentSiteId
      })
      this.saveWaterPrice()
    },
    // 新增网关
    addGateway() {
      this.gatewayForm.room = this.currentSiteId
      this.gatewayForm.dataAreaType = 0
      this.roomList = this.$store.state.site.siteList
      this.addGatewayVisible = true
      this.editType = 'add'
    },
    // 提交新增网关
    gatewaySubmit() {
      this.$refs.gatewayRef.validate((valid) => {
        if (valid) {
          // 连接数不能超过255且为整数
          if (
            this.gatewayForm.linker - 0 > 254 ||
            this.gatewayForm.linker % 1 != 0 ||
            this.gatewayForm.linker < 1
          ) {
            this.$message({
              message: '网关连接数应为1-254',
              type: 'warning'
            })
            return
          }
          if (this.gatewayForm.id % 256 != 0 || this.gatewayForm.id < 0) {
            this.$message({
              message: '当前网关编号错误',
              type: 'warning'
            })
            return
          }
          var _this = this.gatewayForm
          // return
          this.$http
            .post('/equipment/equipment/gatewayadd', {
              equipmentId: _this.id,
              name: _this.name,
              gatewayId: _this.id,
              linker: _this.linker,
              computerRoom: _this.room,
              cron: parseInt(_this.period),
              dataAreaType: _this.dataAreaType
            })
            .then((res) => {
              if (res.data.code == 0) {
                // this.$message({
                //   message: "添加成功",
                //   type: "success"
                // });
                this.$notify({
                  title: '成功',
                  message: '添加成功',
                  type: 'success'
                })
                this.addGatewayVisible = false
                this.getGateway(this.cuurrentId)
              } else {
                this.$notify.warning({
                  title: '错误',
                  message: res.data.msg
                })
              }
            })
            .catch((res) => {})
        } else {
          return
        }
      })
    },
    handleNodeClick(data) {
      this.basicEleForm = {}
      this.loading = true
      if (data.name == '所有站点' && !data.id) {
        this.activeName = 'first'
        this.currentSiteId = null
        this.currentName = null
      } else {
        this.siteDetail(data.id)
        this.activeName = 'first'
        this.currentName = data.name
        this.currentSiteId = data.id
      }
    },
    // 标签页切换
    handleClick(tab, event) {
      switch (tab.name) {
        case 'first':
          break
        case 'second':
          this.getGroup(this.currentSiteId)
          break
        case 'third':
          this.getGateway(this.currentSiteId)
          break
        case 'forth':
          // 结算日赋值
          let arr = this.$store.state.site.siteList
          let siteId = this.$store.state.site.siteId
          let obj
          obj = arr.find((item) => {
            return item.id === siteId
          })
          if (obj) {
            this.countTime = obj.electricityCycle
          }
          this.priceDetailArr = []
          // 默认选中电价
          this.activeEle = 'electricity'
          this.getAllRuleDetail(this.currentSiteId)
          break
        case 'fifth':
          this.getWaterPrice()
          break
        case 'sixth':
          this.energyType = 3
          this.getOtherEnergyInfo()
          break
        case 'seventh':
          this.energyType = 4
          this.getOtherEnergyInfo()
          break
        case 'eighth':
          this.energyType = 5
          this.getOtherEnergyInfo()
          break
        case 'nineth':
          this.getAllGroup()
          this.searchEnergyConfig()
          this.getAllEnergyType()
          break
        default:
          break
      }
    },
    toggleExpand(row, expanded) {},
    // 添加监控设备
    addEquip(row) {
      this.group_add_variate_Id = null
      this.add_group_variable_Visible = true
      this.group_add_variate_name = row.name
      this.group_add_variate_Id = row.id
      this.gateId = ''
      this.options = []
      this.gatewayOptions = []
      this.value = []
      this.getAllGateway()
    },
    addData() {
      var obj = {
        id: this.dataIndex++
      }
      this.dataArea.push(obj)
    },
    // 数据区单行删除
    del(index) {
      if (this.editData[index].id) {
        this.delDataIdArr.push(this.editData[index].id)
      }
      this.editData.splice(index, 1)
    },
    // 获取所有站点
    getSite() {
      this.siteOptions = this.$store.state.site.siteList
    },
    // 添加分组
    addGroup() {
      this.groupVisible = true
      this.groupForm.group = this.currentSiteId
      this.siteOptions = this.$store.state.site.siteList
    },

    // 添加编辑设备关闭前
    before_ammeter_close() {
      // 重置表单验证、清空表单
      this.$refs.ammeterRef.resetFields()
      this.editammeterForm = {}
      this.editData = []
      this.delDataIdArr = []
      this.existDataIdArr = []
    },
    // 编辑分组弹窗关闭前
    before_group_close() {
      this.editGroupId = null
      this.groupForm = {
        name: '',
        group: ''
      }
      this.$refs.groupRef.resetFields()
    },

    // 分组编辑
    editGroup(row) {
      this.siteOptions = this.$store.state.site.siteList
      this.groupForm.group = this.currentSiteId
      this.groupForm.name = row.name
      // this.groupForm.name = '111111';
      // this.groupForm.id = row.id;
      this.editGroupId = row.id
      this.groupVisible = true
    },
    // 分组编辑提交
    groupSubmit() {
      this.$refs.groupRef.validate((valid) => {
        if (valid) {
          if (this.editGroupId) {
            this.$http
              .post('equipment/classify/modify', {
                id: this.editGroupId,
                name: this.groupForm.name,
                computerRoom: this.groupForm.group
              })
              .then((res) => {
                if (res.data.code == 0) {
                  this.$notify({
                    title: '成功',
                    message: '修改成功',
                    type: 'success'
                  })
                  this.groupVisible = false
                  this.getGroup(this.currentSiteId)
                } else {
                  this.$notify({
                    title: '警告',
                    message: res.data.msg,
                    type: 'warning'
                  })
                }
              })
              .then((res) => {})
          } else {
            this.$http
              .post('equipment/classify/add', {
                name: this.groupForm.name,
                computerRoom: this.groupForm.group
              })
              .then((res) => {
                if (res.data.code == 0) {
                  this.$notify({
                    title: '成功',
                    message: '提交成功',
                    type: 'success'
                  })
                  this.getGroup(this.currentSiteId)
                  this.groupVisible = false
                } else {
                  this.$notify({
                    title: '警告',
                    message: res.data.msg,
                    type: 'warning'
                  })
                }
              })
          }
        } else {
          return false
        }
      })
    },
    // 分组删除
    deleteGroup(row) {
      this.delGroupName = row.name
      this.delGroupId = row.id
      this.groupDeleteVisible = true
    },
    // 分组删除提交
    deleteGroupSubmit() {
      this.$http
        .get('equipment/classify/remove', {
          params: {
            classifyId: this.delGroupId
          }
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success'
            })
            this.groupDeleteVisible = false
            this.getGroup(this.currentSiteId)
          }
        })
        .catch((res) => {})
    },
    // 添加子分组
    addSubGroup() {
      this.groupVisible = true
    },
    // 查看站点下的分类
    getGroup(id) {
      this.loading = true
      this.$http
        .get('equipment/classify/findAllByRoom', {
          params: {
            roomId: id
          }
        })
        .then((res) => {
          if (res.data.code == 0) {
            var groupArr = res.data.data
            var str = ''
            groupArr.forEach((item) => {
              str = str + item.id + ','
            })
            if (str.length == 0) {
              this.tableData = []
              this.loading = false
              return
            }
            this.$http
              .get('equipment/classifyEquipment/findAllByClassify', {
                params: {
                  classifyIds: str.slice(0, str.length - 1)
                }
              })
              .then((res) => {
                if (res.data.code == 0) {
                  var res1 = res.data.data
                  for (var i = 0; i < groupArr.length; i++) {
                    if (res1[i].ClassifyEquipmentVO.length) {
                      for (
                        var j = 0;
                        j < res1[i].ClassifyEquipmentVO.length;
                        j++
                      ) {
                        res1[i].ClassifyEquipmentVO[j].id = -res1[i]
                          .ClassifyEquipmentVO[j].id
                      }
                      groupArr[i].children = res1[i].ClassifyEquipmentVO
                    }
                  }
                  this.tableData = groupArr
                  this.loading = false
                  this.$forceUpdate() //强制更新页面
                }
              })
              .catch((res) => {
                this.loading = false
              })
          }
        })
        .catch((res) => {})
    },
    before_del_group_close() {
      this.delGroupName = ''
      this.delGroupId = ''
    },
    // 分组新增监控设备提交
    modify() {
      var code = ''
      if (this.value.length > 0) {
        code = this.value.join(',')
      } else {
        this.$message('请务必选择至少一个设备后提交')
        return
      }
      this.$http
        .post('equipment/classifyEquipment/add', {
          classifyId: this.group_add_variate_Id,
          equipmentIds: code
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.$notify({
              title: '成功',
              message: '新增成功',
              type: 'success'
            })
            this.getGroup(this.currentSiteId)
            this.add_group_variable_Visible = false
          } else {
            this.$notify({
              title: '警告',
              message: res.data.msg,
              type: 'warning'
            })
          }
        })
        .catch((res) => {})
    },
    before_del_equip_close() {
      this.equipDeleteId = null
      this.equipDeleteName = null
    },
    // 点击删除监控设备
    deleteEquip(row) {
      this.equipDeleteVisible = true
      this.delEquipName = row.name
      this.equipDeleteId = Math.abs(row.id) //id返回原来正值
    },
    // 提交监控设备删除
    deleteEquipSubmit() {
      this.$http
        .get('equipment/classifyEquipment/removeById', {
          params: {
            id: this.equipDeleteId
          }
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success'
            })
            this.equipDeleteVisible = false
            this.getGroup(this.currentSiteId)
          }
        })
        .catch((res) => {})
    },
    gruop_add_variate_close() {
      this.value = []
    },
    // 表格展开
    expandChange(row, expandedRows) {
      //只展开一行
      if (expandedRows.length) {
        //说明展开了
        this.ammeterTable = []
        if (row) {
          this.expands.push(row.id) //只展开当前行id
        }
        this.gatewayId = row.equipmentId
        this.equipCurrentPage = 1
        this.getEquipment()
      } else {
        //说明收起了
        this.equipLoading = false
      }
    },
    equipCurrentChange(val) {
      this.equipCurrentPage = val
      this.getEquipment()
    },
    equipSizeChange(val) {
      this.equipSize = val
      this.equipCurrentPage = 1
      this.getEquipment()
    },
    // 网关每页数据大小改变
    gateSizeChange(val) {
      this.gatePageSize = val
      this.gatePage = 1
      if (this.equipmentTableMode) {
        this.getGateway()
      } else {
        this.getEquipmentDetail()
      }
    },
    // 网关页码改变
    gateCurrentChange(val) {
      this.gatePage = val
      if (this.equipmentTableMode) {
        this.getGateway()
      } else {
        this.getEquipmentDetail()
      }
    },
    // 根据站点分页获取网关
    getGateway() {
      this.expands = []
      this.gatewayLoading = true
      let timeout = setTimeout(() => {
        this.gatewayLoading = false
      }, 15000)
      this.$http
        .get('/equipment/gatewayList', {
          params: {
            roomId: this.currentSiteId,
            // roomId: val,
            size: this.gatePageSize,
            page: this.gatePage - 1
          }
        })
        .then((res) => {
          this.gatewayLoading = false
          clearTimeout(timeout)
          if (res.data.code == 0) {
            this.gatewayObj = res.data.data.gateways
            // return
            this.totalGate = res.data.data.total
            this.gatewayLoading = false
          }
        })
        .catch((res) => {
          clearTimeout(timeout)
          this.gatewayLoading = false
        })
    },
    // 获取分页设备电表
    getEquipment() {
      this.equipLoading = true
      // this.equipLoading = true

      let timeout = setTimeout(() => {
        this.equipLoading = false
      }, 15000)

      this.$http
        .get('/equipment/equipmentList', {
          params: {
            gatewayId: this.gatewayId,
            size: this.equipSize,
            page: this.equipCurrentPage - 1
          }
        })
        .then((res) => {
          this.equipLoading = false
          if (res.data.code == 0) {
            this.expands.splice(0, this.expands.length - 1)
            this.totalEquipment = res.data.data.total
            var a = res.data.data
            this.ammeterTable = a.equipments
            this.equipLoading = false
          }
        })
        .catch((res) => {
          this.equipLoading = false
        })
    },
    // 刷新dom
    updateDom(type) {
      this[type] = false
      this.$nextTick(() => {
        this[type] = true
      })
    },
    // 删除网关弹窗
    tryDelGateway(row) {
      this.delName = row.name
      this.delId = row.id
      this.delGatewayVisible = true
    },
    // 确认删除网关
    delGateway() {
      this.$http
        .get('equipment/equipmentRemove', {
          params: {
            id: this.delId
          }
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success'
            })
            this.delGatewayVisible = false
            this.gatePage = 1
            this.getGateway()
          } else {
            this.$notify.error({
              title: '错误',
              message: res.data.msg
            })
          }
        })
        .catch((res) => {})
    },
    // 编辑网关获取数据
    editGateway(row) {
      this.editType = 'edit'
      this.gatewayVisible = true
      this.gatewayId = row.gatewayId
      this.$http
        .get('/equipment/equipmentDetail', {
          params: {
            id: row.id
          }
        })
        .then((res) => {
          if (res.data.code == 0) {
            var gate = this.editGatewayForm
            var equip = res.data.data.equipment
            gate.name = equip.name || 'null'
            gate.id = equip.id
            gate.linker = equip.linker
            gate.param = equip.param
            gate.belong = equip.computerRoom
            gate.equipmentId = equip.equipmentId
            gate.gatewayId = equip.gatewayId
            gate.param = equip.param == 0 ? '不在线' : '在线' //过滤
            var sign =
              equip.cron && equip.cron > 0 ? equip.cron + '分钟' : '不上报'
            var select
            this.cronOptions.map(function (value, index) {
              if (value.label == sign) {
                select = value.value
              }
            })
            this.editGatewayForm.cron = select
            this.editGatewayForm.dataAreaType = equip.dataAreaType || 0
          }
        })
        .catch((res) => {})
    },
    // 提交网关修改
    submitGatewayChange() {
      if (
        this.$refs.editGatewayRef.validate((valid) => {
          if (valid) {
            // 连接数不能超过255且为整数
            if (
              this.editGatewayForm.linker - 0 > 254 ||
              this.editGatewayForm.linker % 1 != 0 ||
              this.editGatewayForm.linker < 1
            ) {
              this.$message({
                message: '网关连接数应为1-254',
                type: 'warning'
              })
              return
            }
            this.$http
              .post('/equipment/equipment/gatewayUpdate', {
                id: this.editGatewayForm.id,
                // 设备id应该是跟网关id同步
                equipmentId: this.editGatewayForm.equipmentId,
                name: this.editGatewayForm.name,
                gatewayId: this.editGatewayForm.equipmentId,
                linker: this.editGatewayForm.linker,
                cron: parseInt(this.editGatewayForm.cron),
                computerRoom: this.editGatewayForm.belong,
                param: this.editGatewayForm.param == '不在线' ? 0 : 1,
                dataAreaType: this.editGatewayForm.dataAreaType
              })
              .then((res) => {
                if (res.data.code == 0) {
                  this.$notify({
                    title: '成功',
                    message: '修改成功',
                    type: 'success'
                  })
                  this.gatewayVisible = false
                  this.gatePage = 1
                  this.getGateway()
                } else {
                  this.$notify({
                    title: '警告',
                    message: res.data.msg,
                    type: 'warning'
                  })
                }
              })
              .catch((res) => {})
          }
        })
      )
        this.gatewayVisible = false
    },
    // 新增设备提交
    ammeterSubmit() {
      this.$refs.ammeterRef.validate((valid) => {
        if (valid) {
          // return
          var index = this.gatewayList2.findIndex((item, index) => {
            return item.gatewayId == this.editammeterForm.gateway
          })

          this.linker = this.gatewayList2[index].linker
          var _this = this.editammeterForm
          // 验证编号范围
          if (_this.number > this.linker + 1 || _this.number < 1) {
            this.$message({
              message: '设备编号范围为' + '1 - ' + (this.linker + 1),
              type: 'warning'
            })
            return
          }
          for (var i = 0; i < this.editData.length; i++) {
            // 遍历对象属性是否为空
            if (
              !(
                this.editData[i].begin &&
                this.editData[i].areaName &&
                this.editData[i].length
              )
            ) {
              this.$message('请输入正确的变量格式')
              return
            }
            delete this.editData[i].id
          }
          this.$http
            .post('/equipment/equipment/equipmentadd', {
              number: _this.number,
              name: _this.name,
              ratedVoltage: _this.ratedVoltage,
              // cron: _this.cron,
              gatewayId: _this.gateway,
              computerRoom: this.$store.state.site.siteId,
              equipfileId: _this.equipfileId,
              dataAreaForms: JSON.stringify(this.editData),
              dataAreaUuid: this.assignData.join(','),
              dataAreaType: this.dataAreaType
            })
            .then((res) => {
              if (res.data.code == 0) {
                // this.ammeterVisible = false;
                this.$notify({
                  title: '成功',
                  message: '提交成功',
                  type: 'success'
                })
                this.ammeterVisible = false
                this.getEquipment()
              } else {
                this.$message({
                  message: res.data.msg,
                  type: 'warning'
                })
              }
            })
            .catch((res) => {})
        }
      })
    },
    // 编辑电表获取数据
    editAmmeter(row) {
      this.editType = 'edit'
      this.equipmentTitle = '编辑电表'
      this.getAllFileEquip(true)
      this.ammeterVisible = true
      this.ifAddEquip = false
      this.isJudgValueShow = false // 变量值验证清空
      this.isMaintainCodeShow = false // 变量验证清空
      this.$http
        .get('/equipment/equipmentDetail', {
          params: {
            id: row.id
          }
        })
        .then((res) => {
          if (res.data.code == 0) {
            var ammeter = this.editammeterForm
            ammeter.computerRoom = res.data.data.equipment.computerRoom
            ammeter.gatewayId = res.data.data.equipment.gatewayId
            ammeter.name = res.data.data.equipment.name
            ammeter.cron = res.data.data.equipment.cron
            ammeter.equipmentId = res.data.data.equipment.equipmentId
            ammeter.ratedVoltage = res.data.data.equipment.ratedVoltage
            ammeter.number = res.data.data.equipment.number
            ammeter.siteName = res.data.data.siteName
            ammeter.gatewayName = res.data.data.gatewayName
            ammeter.id = row.id
            ammeter.param = res.data.data.equipment.param
            ammeter.monitorStatus = res.data.data.equipment.monitorStatus
            ammeter.equipfileId = res.data.data.equipfileId
            ammeter.judgValue = res.data.data.maintain.judeValue
            ammeter.maintainCode = res.data.data.maintain.maintainCode
            this.equipMonitorConfigs = res.data.data.monitorForms // 保存监控内容数组
            this.dataAreaType = res.data.data.equipment.dataAreaType || 0
            ammeter.dataAreaUuid = res.data.data.equipment.dataAreaUuid
            this.getEquipContent() // 获取保养内容和监控内容
            this.getEquipMaintain() // 获取变量
            if (ammeter.dataAreaUuid) {
              this.assignData = ammeter.dataAreaUuid.split(',')
            } else {
              this.assignData = []
            }
            // ammeter.param = res.data.data.equipment.param == 1 ? '在线' : '不在线'
            this.editData = res.data.data.dataAreas || [] //清除掉之前操作的数据
            this.editOldData = res.data.data.dataAreas || [] // 指定数据区匹配的数据
            // nId 赋值,唯一标识符
            this.editOldData.forEach(item => {
              item.nId = item.uuid + item.name
            })
            // 清空已存在数据区id
            this.existDataIdArr = []
            // 对数组对象赋值及数据处理
            this.editData.forEach((item) => {
              item.areaName = item.name
              // 存储已存在的数据地址
              this.existDataIdArr.push(item.id)
            })
            
          } else {
            this.editData = []
            this.editOldData = []
            this.existDataIdArr = []
          }
        })
    },
    // 获取所有的档案设备
    getAllFileEquip(flag) {
      var companyId = this.$store.state.site.searchCompanyId
      if (companyId !== 0 && !companyId) {
        return
      }
      if (flag) {
        this.$http
          .get('equipment/product/getAll', {
            params: {
              companyId: this.companyId
            }
          })
          .then((res) => {
            if (res.data.code === 0) {
              this.deviceTypeList = res.data.data
              // this.fileEquipOptions = res.data.data
            }
          })
      }
    },
    // 弹窗的添加数据区按钮
    addArea() {
      this.editData.push({
        areaName: '',
        begin: '',
        length: ''
      })
    },
    // 设备编辑或新增提交
    submitEquipmentChange() {
      var ifGo = true //用于验证表单是否有空值
      this.$refs.ammeterRef.validate((valid) => {
        ifGo = valid
      })
      if (!ifGo) {
        return
      }

      if (this.editammeterForm.maintainConfigs && this.editammeterForm.maintainConfigs.length !== 0) {
        if (this.editammeterForm.maintainCode === '') { // 是否选择变量
          this.isMaintainCodeShow = true
        }
        if (this.editammeterForm.judgValue === '') { // 是否选择变量值
          this.isJudgValueShow = true 
        }
      }
      if (this.isMaintainCodeShow || this.isJudgValueShow) return // 验证保养内容是否为空
      

      for (var i = 0; i < this.editData.length; i++) {
        if (
          !(
            (this.editData[i].begin || this.editData[i].begin === '0') &&
            (this.editData[i].areaName || this.editData[i].areaName === '0') &&
            (this.editData[i].length || this.editData[i].length === '0')
          )
        ) {
          this.$message('请输入正确的非空数据格式')
          return
        }
        // 起始地址应该为正整数
        if (
          !(
            parseInt(this.editData[i].begin) === +this.editData[i].begin &&
            +this.editData[i].begin >= 0
          )
        ) {
          this.$message('数据区起始地址范围应为不小于0的整数！')
          return
        }
        // 长度应该为正整数
        if (
          !(
            parseInt(this.editData[i].length) === +this.editData[i].length &&
            +this.editData[i].length > 0
          )
        ) {
          this.$message('长度应为正整数！')
          return
        }
        // 删除掉多余的对象属性
        this.$delete(this.editData[i], 'index')
      }
      if (this.ifAddEquip) {
        // 新增
        this.ammeterSubmit()
        return
      }

      //--------------------------------------
      for (let i = 0; i < this.editData.length; i++) {
        this.editData[i].eqId = this.editammeterForm.equipmentId
        // 遍历，给每个数据区内容加 id
        let uuidIndex = this.editOldData.findIndex(item => item.nId === this.editData[i].nId)
        // 如果有id就添加
        if (uuidIndex !== -1) {
          this.editData[i].id = this.editOldData[uuidIndex].id
        }
      }

      // return

      this.$http
        .post('/equipment/equipment/equipmentUpdate', {
          id: this.editammeterForm.id,
          number: this.editammeterForm.number,
          name: this.editammeterForm.name,
          gatewayId: this.editammeterForm.gatewayId,
          equipmentId: this.editammeterForm.equipmentId,
          computerRoom: this.editammeterForm.computerRoom,
          dataAreaForms: JSON.stringify(this.editData),
          param: this.editammeterForm.param,
          rmDa: this.delDataIdArr.join(','),
          monitorStatus: this.editammeterForm.monitorStatus,
          ratedVoltage: this.editammeterForm.ratedVoltage,
          equipfileId: this.editammeterForm.equipfileId,
          dataAreaUuid: this.assignData && this.assignData.join(','),
          dataAreaType: this.dataAreaType,
          maintainCode: this.editammeterForm.maintainCode,
          judgValue: this.editammeterForm.judgValue,
          monitorConfigs: JSON.stringify(this.editammeterForm.monitorConfigs)
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.$notify({
              title: '成功',
              message: '修改成功',
              type: 'success'
            })
            this.ammeterVisible = false
          } else {
            this.$notify({
              title: '警告',
              message: res.data.msg,
              type: 'warning'
            })
          }
          this.getEquipment()
          this.getGroup(this.currentSiteId)
        })
        .catch((res) => {})
    },
    // 删除电表弹窗
    tryDelAmmeter(row) {
      this.delAmmeterVisible = true
      this.delName = row.name
      this.delId = row.id
    },
    // 电表删除
    delAmmeter() {
      this.$http
        .get('/equipment/equipmentRemove', {
          params: {
            id: this.delId
          }
        })
        .then((res) => {
          if (res.data.code == 0) {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success'
            })
            this.getEquipment()
          } else {
            this.$notify.error({
              title: '错误',
              message: res.data.msg
            })
          }
          this.getGroup(this.currentSiteId)
          this.delAmmeterVisible = false
        })
        .catch((res) => {})
    },
    // 网关新增设备
    addAmmeter(row) {
      this.editammeterForm = {
        name: '',
        computerRoom: '',
        ratedVoltage: '', //额定电压
        gatewayId: '',
        // cron: "",
        dataAreaUuid: '',
        id: '',
        equipmentId: '',
        siteName: '',
        gatewayName: ''
      }
      this.dataAreaType = 0
      this.editType = 'add' // 弹窗模式
      this.equipmentTitle = '新增电表' // 修改弹窗标题
      this.gatewayId = row.gatewayId // 拿到网关的 id
      this.ifAddEquip = true // 弹框换成新增模式
      this.roomList2 = this.$store.state.site.siteList
      this.gatewayList2 = this.gatewayObj
      this.editammeterForm.gateway = row.gatewayId
      this.ammeterVisible = true // 打开弹窗
     
      // 获取网关
      const gatewayIndex = this.gatewayList2.findIndex(item => this.gatewayId === item.gatewayId)
      this.editammeterForm.gatewayName = this.gatewayList2[gatewayIndex].name
      // 获取站点
      const siteIndex = this.roomList2.findIndex(item => this.$store.state.site.siteId === item.id)
      this.editammeterForm.siteName = this.roomList2[siteIndex].name     
    },
    // 新增网关窗口关闭前
    clearGatewayForm() {
      this.gatewayForm = {}
      // 清除表单验证
      this.$refs.gatewayRef.resetFields()
    },
    // 编辑网关窗口关闭前
    clearEditGatewayForm() {
      // 清除表单验证
      this.$refs.editGatewayRef.resetFields()
      this.gatewayForm = {}
    },
    // 导出模板
    exportModel() {
      this.exportModelLoading = true
      this.$notify({
        message: '开始导出'
      })
      this.$http({
        methods: 'GET',
        url: 'equipment/equipment/uploadModel',
        responseType: 'arraybuffer'
      })
        .then((res) => {
          const link = document.createElement('a')
          const blob = new Blob([res.data], {
            type:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          let href = window.URL.createObjectURL(blob)
          link.href = href

          let _fileName = res.headers['content-disposition']
            .split(';')[1]
            .split('=')[1]
            .split('.')[0]
          // 文件名中有中文 则对文件名进行转码
          link.download = decodeURIComponent(_fileName)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(href)
          setTimeout(() => {
            this.$notify({
              message: '模板已下载',
              type: 'success'
            })
            this.exportModelLoading = false
          }, 1000)
        })
        .catch((err) => {
          this.exportModelLoading = false
        })
    },
    // 导入文件
    async importFile() {
      const res = await this.$http({
        url: '/equipment/fileRecords/findStatus',
        params: {
          siteId: this.$store.state.site.siteId,
          user: this.$store.state.userInfo.userId
        }
      })
      if (res.data.code === 0) {
        this.importFileVisible = true
      } else {
        this.$message.error(res.data.msg)
      }
      // 重置内容

      // this.$delete(this.addFileForm, "file");      
      // this.$nextTick(() => {
      //   let file = this.$refs.input1;
      //   file.value = "";
      //   this.$delete(this.addFileForm, "file");
      //   // file.value = null
      //   // file.outerHTML = file.outerHTML;
      // });
    },
    selectFile(event) {
      this.addFileForm.file = event.target.files[0]
    },
    fileSubmit() {
      if (this.addFileForm.file) {
        let formdata = new FormData()
        formdata.append('file', this.addFileForm.file)
        formdata.append('siteId', this.$store.state.site.siteId)
        formdata.append('companyId', this.$store.state.site.searchCompanyId)
        let config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
        this.$http
          .post('equipment/equipment/importExcel', formdata, config)
          .then((res) => {
            if (res.data.code == 0) {
              this.$notify({
                title: '成功',
                message: '上传成功',
                type: 'success'
              })
              this.importFileVisible = false
            } else {
              this.$notify({
                title: '失败',
                message: res.data.msg,
                type: 'warning'
              })
            }
          })
      } else {
        // 无文件提交提醒
        this.$notify({
          message: '请选择文件',
          type: 'warning'
        })
      }
    },
    // 导出设备
    importEquip() {
      this.$notify({
        message: '开始导出'
      })
      this.exportLoading = true
      this.$http({
        methods: 'GET',
        url: 'equipment/equipment/exportExcel',
        params: {
          siteId: this.currentSiteId
        },
        responseType: 'arraybuffer'
      })
        .then((res) => {
          const link = document.createElement('a')
          const blob = new Blob([res.data], {
            type:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          let href = window.URL.createObjectURL(blob)
          link.href = href

          let _fileName = res.headers['content-disposition']
            .split(';')[1]
            .split('=')[1]
            .split('.')[0]
          // 文件名中有中文 则对文件名进行转码
          link.download = decodeURIComponent(_fileName)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(href)
          setTimeout(() => {
            this.$notify({
              message: '设备已导出',
              type: 'success'
            })
            this.exportLoading = false
          }, 1000)
        })
        .catch((err) => {
          this.exportLoading = false
        })
    },
    // --------------------------------
    //上传前对文件大小进行校验
    beforeUpload(file) {
      var arr = file.name.split('.')
      if (!(arr[arr.length - 1] === 'xlsx' || arr[arr.length - 1] === 'xls')) {
        this.$message.error('请选择表格文件')
        this.ifUpload = false
        return false
      }
      // return
      const isLt2M = file.size / 1024 / 1024 < 50
      if (!isLt2M) {
        this.$message.error('上传文件大小大小不能超过 50MB!')
        return isLt2M
      }
    },
    changeData(file, fileList) {
      this.ifUpload = true
      // 数据小于0.1M的时候按KB显示
      const size =
        file.size / 1024 / 1024 > 0.1
          ? `(${(file.size / 1024 / 1024).toFixed(1)}M)`
          : `(${(file.size / 1024).toFixed(1)}KB)`
      file.name.indexOf('M') > -1 || file.name.indexOf('KB') > -1
        ? file.name
        : (file.name += size)
    },
    // 上传文件
    handleRequest(data) {
      let formdata = new FormData()
      formdata.append('file', data.file)
      formdata.append('siteId', this.currentSiteId)
      formdata.append('companyId', this.$store.state.site.searchCompanyId)
      formdata.append('user', this.$store.state.userInfo.userId)
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          // progressEvent.loaded:已上传文件大小
          // progressEvent.total:被上传文件的总大小
          this.progressPercent = Number(
            ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2)
          )
        }
      }
      this.actionURL = 'equipment/equipment/importExcel'

      this.$http
        .post(this.actionURL, formdata, config)
        .then((res) => {
          if (res.data.code === 0) {
            // alert("成功");
            this.parseLoading = false
            this.$notify({
              title: '导入成功',
              type: 'success'
            })
            // 设置0.3秒延迟关闭弹窗
            setTimeout(() => {
              this.importFileVisible = false
            }, 300)
            this.getGateway()
          } else {
            this.parseLoading = false
            this.fileList = []
            // this.update
            this.ifUpload = false
            this.progressPercent = 0
            if (res.data.code) {
              this.$notify({
                message: res.data.msg,
                type: 'warning'
              })
            }
          }
        })
        .catch((res) => {
          this.parseLoading = false
          this.fileList = []
          // this.update
          this.ifUpload = false
          this.progressPercent = 0
        })
    },
    beforeFileClose() {
      this.gatePage = 1
      this.ifUpload = false
      this.progressPercent = 0
      this.fileList = []
    },
    // 站点详情
    siteDetail(id) {
      this.$http
        .get('equipment/siteDetail', {
          params: {
            siteId: id
          }
        })
        .then((res) => {
          this.companyName = res.data.data.companyName
        })
    },
    // 批量删除分组设备
    delMulAmmeter(row) {
      this.deleteMonitorMulVisible = true
      this.ifMonitor = true
      this.getDelMonitorVariable(row.id)
    },
    // 批量删除设备
    delMulAmmeter1(row) {
      this.deleteMonitorMulVisible = true
      this.ifMonitor = false
      this.getDelVariable(row.gatewayId)
    },
    // 提交删除批量设备或分组设备
    delMulSubmit(row) {
      this.$refs.delMonitorMulRef.validate((valid) => {
        if (!valid) {
          return
        }
        let id = this.delMonitorMulForm.id.join(',')
        if (!this.ifMonitor) {
          this.$http
            .get('equipment/equipmentRemove', {
              params: {
                id: id
              }
            })
            .then((res) => {
              if (res.data.code == 0) {
                this.$notify({
                  message: '删除成功',
                  type: 'success'
                })
                this.deleteMonitorMulVisible = false
                this.getGateway(this.currentSiteId)
              } else {
                this.$notify({
                  message: res.data.msg,
                  type: 'warning'
                })
              }
            })
        } else {
          this.$http
            .get('equipment/classifyEquipment/removeById', {
              params: {
                id: id
              }
            })
            .then((res) => {
              if (res.data.code === 0) {
                this.$notify({
                  message: '删除成功',
                  type: 'success'
                })
                this.deleteMonitorMulVisible = false
                this.getGroup(this.currentSiteId)
              } else {
                this.$notify({
                  message: res.data.msg,
                  type: 'warning'
                })
              }
            })
        }
      })
    },
    // 获取能删除的网关下的设备
    getDelVariable(id) {
      this.$http
        .get('/equipment/equipmentList', {
          params: {
            gatewayId: id,
            size: GLOBAL.max_page_size,
            page: 0
          }
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.monitorMulOptions = res.data.data.equipments
          }
        })
    },
    // 获取能删除的分组下的设备
    getDelMonitorVariable(id) {
      this.$http
        .get('equipment/classifyEquipment/findAllByClassify', {
          params: {
            classifyIds: id
          }
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.monitorMulOptions = res.data.data[0].ClassifyEquipmentVO
          }
        })
    },
    clearMonitorInfo() {
      this.delMonitorMulForm.id = []
      this.$refs.delMonitorMulRef.resetFields()
    },
    rowStyle(row, rowIndex) {},
    // 获取当前登录用户所能获取的所有站点
    getAllSites() {
      var paramsObj = {
        size: GLOBAL.max_page_size,
        page: 0,
        companyId: this.$store.state.site.companyId
      }
      this.$http
        .get('equipment/roomList', {
          params: paramsObj
        })
        .then((res) => {
          let list = res.data.data.roomList
          let param = {
            sites: list,
            companyId: this.$store.state.site.companyId
          }
          this.$store.commit('siteUpdate', param)
        })
        .catch((res) => {})
    },

    // ----------------------------------用电电价
    electricityClick(tab) {
      // 点击了其他电价
      if(tab.name === 'otherElectrovalence') {
        this.getOtherConfig()
      }
      if (this.activeEle === 'equipment') {
        // 电表配置
        this.getAllGroup()
        this.getElectricityRule()
        this.getAllEleConf()
        this.delIds = ''
      } else {
        // 电度
        this.getAllRuleDetail(this.currentSiteId)
      }
    },

    // 新增电费分段规则
    addElectricityRuleSubmit(obj) {
      this.$http
        .post('equipment/stagesection/newStagesection', {
          id: obj.stagePrice.id,
          name: obj.stagePrice.name,
          ping: obj.stagePrice.ping,
          feng: obj.stagePrice.feng,
          gu: obj.stagePrice.gu,
          site: obj.stagePrice.site,
          stageSection: obj.stageSections
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$notify({
              message: '新增成功,已刷新',
              type: 'success'
            })
            this.getAllRuleDetail(this.currentSiteId)
          } else {
            this.$notify({
              message: res.data.msg,
              type: 'warning'
            })
          }
        })
    },
    // 修改电费分段规则提交
    editElectricityRuleSubmit(obj) {
      this.$http
        .post('equipment/stagesection/modifyStagesection', {
          id: obj.stagePrice.id,
          name: obj.stagePrice.name,
          ping: obj.stagePrice.ping,
          feng: obj.stagePrice.feng,
          gu: obj.stagePrice.gu,
          site: obj.stagePrice.site,
          stageSection: obj.stageSections
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$notify({
              type: 'success',
              message: '提交成功,已刷新！'
            })
            this.getAllRuleDetail(this.currentSiteId)
          } else {
            this.$notify({
              message: res.data.msg,
              type: 'warning'
            })
          }
        })
    },
    // 查询站点所有分段规则明细
    getAllRuleDetail(id) {
      this.$http
        .get('equipment/stagesection/findBySite', {
          params: {
            site: id
            // site: 1
          }
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.priceDetailArr = res.data.data
          }
        })
    },
    // 获取时间数组
    getTimeOptions() {
      // 获取00:00到24:00（每隔三十分钟）
      var arr = []
      for (var i = 0; i < 25; i++) {
        var hour = i
        for (var j = 0; j < 60; j = j + 30) {
          var min = j < 10 ? '0' + j : j
          if (hour === 24 && j == '30') {
            break
          }
          arr.push({
            label: '' + (hour > 9 ? hour : '0' + hour) + ':' + min,
            value: parseFloat(hour + '.' + min / 6)
          })
        }
      }
      this.timeOptions = arr
    },
    // 添加时间区间
    addPrice(index) {
      var lastObj = this.priceDetailArr[index].stageSections[
        this.priceDetailArr[index].stageSections.length - 1
      ]
      // 判断结束时间和类型是否填写
      if (!(lastObj.end && lastObj.end !== 24 && lastObj.type)) {
        return
      }
      let begin = this.priceDetailArr[index].stageSections[
        this.priceDetailArr[index].stageSections.length - 1
      ].end
      var obj = {
        begin: begin,
        name: '',
        end: 24,
        type: 1,
        site: this.$store.state.site.siteId,
        user: this.$store.state.userInfo.userId
      }
      this.priceDetailArr[index].stageSections.push(obj)
    },
    // ------------------删除时间区间
    delPrice(index, index1) {
      // 两个下标分别代表第几个详情跟第几个时间段
      if (index1 === 0) {
        // 不允许删除第一个
        return
      }
      this.priceDetailArr[index].stageSections.splice(index1, 1)
      this.priceData.splice(index, 1)
      // 最后一个赋值24小时
      this.priceDetailArr[index].stageSections[index1 - 1].end = 24
    },
    // ---------------结束时间改变
    endTimeChange(index, index1) {
      // 分别表示详情下标跟表格下标
      if (this.priceDetailArr[index].stageSections.length - 1 > index1) {
        // 下面存在的话也应该修改起始值
        this.priceDetailArr[index].stageSections[
          index1 + 1
        ].begin = this.priceDetailArr[index].stageSections[index1].end
      }
    },
    // --------------点击保存单个电价详情
    editElectricitySubmit(index) {
      // 多个表单独立验证是否为空
      this.$refs.priceRef[index].validate((valid) => {
        if (!valid) {
          return
        } else {
          let arr = this.priceDetailArr[index].stageSections
          // 判断结束时间跟开始时间是否冲突
          let ifWrong = false
          for (var i = 0; i < arr.length; i++) {
            if (!(arr[i].end > arr[i].begin)) {
              ifWrong = true
              this.$notify({
                message: '请选择合理的时间格式及填满24小时',
                type: 'warning'
              })
              break
            }
          }
          if (ifWrong) {
            return
          }
          // 判断最后一个时间是否为24时
          if (
            this.priceDetailArr[index].stageSections[
              this.priceDetailArr[index].stageSections.length - 1
            ].end !== 24
          ) {
            this.$notify({
              message: '请选择合理的时间格式及填满24小时',
              type: 'warning'
            })
            return
          }
          // 遍历重新赋值name属性
          this.priceDetailArr[index].stageSections.map((item) => {
            return (item.name = this.priceDetailArr[index].stagePrice.name)
          })
          // 详情深拷贝
          let obj = deepClone(this.priceDetailArr[index])
          if (obj.stagePrice.id) {
            // 编辑
            obj.stageSections = JSON.stringify(obj.stageSections)
            // this.$http.get('equipment/')
            this.editElectricityRuleSubmit(obj)
          } else {
            // 新增
            obj.stageSections = JSON.stringify(obj.stageSections)
            this.addElectricityRuleSubmit(obj)
          }
        }
      })
    },
    // 新增规则
    addElectricityRule() {
      let obj = {
        stagePrice: {
          name: '',
          ping: '',
          feng: '',
          gu: '',
          site: this.currentSiteId
        },
        stageSections: [
          {
            begin: 0,
            name: '',
            end: 24,
            type: 1,
            site: this.currentSiteId,
            user: this.$store.state.userInfo.userId
          }
        ]
      }
      this.priceDetailArr.push(obj)
    },
    // 点击铲除规则按钮
    delElectricity(item) {
      // return
      this.$http
        .post('equipment/stagesection/removeStagesection', {
          site: item.stagePrice.site,
          name: item.stagePrice.name
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$notify({
              type: 'success',
              message: '删除成功,已刷新'
            })
            this.getAllRuleDetail(this.currentSiteId)
          } else {
            this.$notify({
              type: 'warning',
              message: res.data.msg
            })
          }
        })
        .catch((res) => {})
    },
    // -------------------电费配置
    // 新增站点电费配置
    addEleConfSubmit() {
      this.$http
        .post('equipment/electricity/newConf', {
          name: '',
          confName: '',
          equipment: '',
          site: ''
        })
        .then((res) => {})
    },
    // 删除站点电费配置
    delEleConfSubmit() {
      this.$http
        .get('equipment/electricity/removeConf', {
          id: ''
        })
        .then((res) => {})
    },
    // 修改站点电费配置提交
    editEleConfSubmit() {
      var ifNull
      for (var i = 0; i < this.equip_conf_arr.length; i++) {
        if (
          !(
            this.equip_conf_arr[i].confName &&
            this.equip_conf_arr[i].equipmentName &&
            this.equip_conf_arr[i].name
          )
        ) {
          ifNull = true
        }
      }
      if (ifNull) {
        this.$notify({
          message: '请勿输入或选择空数据',
          type: 'warning'
        })
        return
      }
      this.delIds = this.delIds.substring(0, this.delIds.lastIndexOf(','))
      this.$http
        .post('equipment/electricity/modifyConf', {
          electricityConf: JSON.stringify(this.equip_conf_arr),
          siteId: this.currentSiteId,
          delId: this.delIds
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$notify({
              message: '保存成功',
              type: 'success'
            })
            this.getAllEleConf()
            this.delIds = ''
          } else {
            this.$notify({
              message: res.data.msg,
              type: 'warning'
            })
            this.delIds = ''
          }
        })
    },
    // 查询所有电费配置
    getAllEleConf() {
      this.$http
        .get('equipment/electricity/confBySite', {
          params: {
            site: this.currentSiteId
          }
        })
        .then((res) => {
          this.equip_conf_arr = res.data.data
        })
    },
    // 查询站点下所有监控分组
    getAllGroup() {
      this.temp_options = []
      // this.equipId = [];
      this.$http
        .get('equipment/classify/findAllByRoom', {
          params: {
            roomId: this.currentSiteId
          }
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.temp_options = res.data.data
            // 分组集合数组
            var str = []
            if (this.temp_options.length > 0) {
              str = this.temp_options.map((item) => {
                return item.id
              })
              this.getEquipByGroup(str)
            } else {
              // this.isResouceShow++; //改变元素key值，重新渲染
              // this.equipId = [];
              this.group_equip_options = []
            }
          }
        })
    },
    // 根据分组集合查设备
    getEquipByGroup(str) {
      this.$http
        .get('equipment/classifyEquipment/findAllByClassify', {
          params: {
            classifyIds: str.join(',')
          }
        })
        .then((res) => {
          if (res.data.code === 0) {
            var res1 = res.data.data
            var index = 0
            for (var i = 0; i < this.temp_options.length; i++) {
              if (res1[i].ClassifyEquipmentVO.length) {
                for (var j = 0; j < res1[i].ClassifyEquipmentVO.length; j++) {
                  // id替换成设备id，用于最后取值(负值防止联级数据联级id冲突报错)
                  res1[i].ClassifyEquipmentVO[j].id = -res1[i]
                    .ClassifyEquipmentVO[j].equipmentId
                  index++
                  // 默认选中有设备的第一个分组的第一个设备
                  if (index === 1) {
                    var arr = [
                      this.temp_options[i].id,
                      res1[i].ClassifyEquipmentVO[j].id
                    ]
                  }
                }
                this.temp_options[i].children = res1[i].ClassifyEquipmentVO
              }
            }
            // 临时数据赋值
            this.group_equip_options = this.temp_options
          }
        })
    },
    // 获取站点下所有电费分段规则名称
    getElectricityRule() {
      this.$http
        .get('equipment/stagesection/getAllName', {
          params: {
            site: this.currentSiteId
          }
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.ruleNameArr = res.data.data.names
            for (var i = 0; i < this.ruleNameArr.length; i++) {
              var obj = { name: this.ruleNameArr[i] }
              this.$set(this.ruleNameArr, i, obj)
            }
          }
        })
    },
    // 新增电表配置
    addConf() {
      var obj = {
        confName: '',
        equipmentId: '',
        equipmentName: '',
        name: '',
        site: this.currentSiteId
      }
      this.equip_conf_arr.push(obj)
    },
    // 删除电表配置
    delConf(id, index) {
      if (id != undefined) {
        this.delIds = id + ',' + this.delIds
      }
      this.equip_conf_arr.splice(index, 1)
    },
    // 编辑监控单个设备
    selectEquip(index) {
      this.casKey++
      this.monitorEquipId[1] = []
      this.selectMonitorVisible = true
      this.equipConfIndex = index
    },
    // 联级数据选中
    monitorEquipSelect() {
      // 强制异步赋值
      setTimeout(() => {
        this.$nextTick(() => {
          let equipmentId = Math.abs(this.monitorEquipId[1]) //设备id
          let equipmentName = this.$refs['myCascader'].inputValue
          if (this.activeName === 'forth') {
            this.$set(
              this.equip_conf_arr[this.equipConfIndex],
              'equipmentName',
              equipmentName
            )
            this.$set(
              this.equip_conf_arr[this.equipConfIndex],
              'equipmentId',
              equipmentId
            )
          } else if (this.activeName === 'fifth') {
            this.$set(
              this.energyConfigList[this.equipConfIndex],
              'equipmentName',
              equipmentName
            )
            this.$set(
              this.energyConfigList[this.equipConfIndex],
              'equipmentId',
              equipmentId
            )
          }

          this.selectMonitorVisible = false
        })
      }, 10)
    },
    getMonthTime() {
      let arr = []
      for (var i = 1; i < 32; i++) {
        let obj = {
          label: i + '日',
          value: i
        }
        arr.push(obj)
      }
      this.countTimeOptions = arr
    },
    //----------------------------------获取能源配置列表
    searchEnergyConfig() {
      this.$http
        .get('equipment/energyBranch/getTotalEnergyByEq', {
          params: {
            siteId: this.$store.state.site.siteId
          }
        })
        .then((res) => {
          if (res.data.code === 0) {
            var arr = res.data.data
            var arrData = []
            arr.forEach((item, index) => {
              arrData[index] = {}
              arrData[index].equipmentId = item.equipment.equipmentId
              arrData[index].equipmentName = item.equipment.name
              arrData[index].type = item.type
            })
            this.energyConfigList = arrData
          }
        })
    },
    // 新增能源配置项
    addEnergyConf() {
      this.energyConfigList.push({})
    },
    // 编辑监控单个设备
    selectEnergyEquip(index) {
      this.casKey++
      this.monitorEquipId[1] = []
      this.selectMonitorVisible = true
      this.equipConfIndex = index
    },
    // 删除电表配置
    delEnergyConf(index) {
      this.energyConfigList.splice(index, 1)
    },
    // 获取所有能源类型
    getAllEnergyType() {
      this.$http
        .get('equipment/energyProperties/findAll', {
          params: {}
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.energyTypeList = res.data.data
          }
        })
    },
    editEnergyConfSubmit() {
      var arr = JSON.parse(JSON.stringify(this.energyConfigList))
      arr.map((item) => {
        ;(item.siteId = this.$store.state.site.siteId),
          this.$delete(item, 'equipmentName')
      })
      // return
      this.$http
        .post('equipment/energyBranch/setTotalEnergyByEq', {
          siteId: this.$store.state.site.siteId,
          totalEq: JSON.stringify(arr)
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$notify({
              title: '成功',
              message: '提交成功',
              type: 'success'
            })
            this.selectMonitorVisible = false
          } else {
            this.$notify({
              message: res.data.msg,
              type: 'warning'
            })
          }
        })
    },
    // 获取某一个网关下的所有设备
    getSinEquip(flag) {
      if (!flag) {
        return
      }
      if (!this.gateId) {
        this.$message({
          type: 'info',
          message: '请先选中网关'
        })
        return
      }
      this.$http
        .get('equipment/equipmentList', {
          params: {
            page: 0,
            size: GLOBAL.max_page_size,
            gatewayId: this.gateId
          }
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.options = res.data.data.equipments
          }
        })
    },
    // 获取站点下所有网关
    getAllGateway() {
      if (!this.$store.state.site.siteId) {
        return
      }
      this.$http
        .get('equipment/gatewayList', {
          params: {
            page: 0,
            size: GLOBAL.max_page_size,
            roomId: this.$store.state.site.siteId
          }
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.gatewayOptions = res.data.data.gateways
          }
        })
    }
  },
  created() {
    // 先刷新vuex里面的所有站点
    this.getAllSites()
    this.siteTree = [
      {
        name: '所有站点',
        children: this.$store.state.site.siteList,
        icon: 'el-icon-place',
        id: 0
      }
    ]
    this.$nextTick(() => {
      this.$refs.groupTree.setCurrentKey(0)
    })
    this.getTimeOptions()
    // 获取月结算所有日期
    this.getMonthTime()
  },
  mounted() {
    this.$nextTick(() => {
      this.conHeight = this.$refs.conBox ? this.$refs.conBox.offsetHeight - 158 : 0
    })
    window.addEventListener('resize', () => {
      this.$nextTick(() => {
        this.conHeight = this.$refs.conBox ? this.$refs.conBox.offsetHeight - 158 : 0
      })
    })
  }
}
</script>

<style lang="less" scoped>
@import '../../assets/css/index.less';
.water-box {
  width: 100%;
  height: 100%;
  padding-top: 30px;
}

#site {
  height: 100%;
  margin: none;
  padding: none;
  .article {
    height: calc(100% - 58px);
    display: flex;
    /* 边栏 */
    .beside {
      padding: 10px 5px;
      height: 100%;
      width: 260px;
      margin-right: 10px;
      display: inline-block;
      background-color: rgba(67, 92, 112);
      box-sizing: border-box;
      position: relative;
      .list {
        margin-top: 5px;
        padding-left: 5px;
        height: 100%;
        overflow: auto;
      }
    }
    /* 内容 */
    .content {
      width: calc(100% - 270px);
      height: 100%;
      display: inline-block;
      background-color: rgba(67, 92, 112);
      box-sizing: border-box;
      flex: 1;
      padding: 5px 0 0 15px;
      overflow: hidden;
      color: #ccc;
      margin-left: 10px;
      // 监控设备表格
      .table {
        margin-top: 12px;
        & /deep/ .el-table {
          .el-table__row {
            background-color: @board-bgc;

            /* 设置文件夹符号颜色 */
            .el-table .el-icon-folder-opened {
              color: #ddd;
            }
          }
          .el-table__empty-block {
            background-color: @board-bgc;
          }
          .el-icon-arrow-right {
            background-color: none;
          }
          th {
            padding: 6px 0;
          }
          td {
            padding: 6px 0;
          }
        }
      }
      // 表格下拉表格背景色
      .all-table {
        & /deep/ .el-table__row {
          background-color: @white-th;
          .el-icon-arrow-right {
            color: @whiteBox-font-color;
          }
        }
        // 设备表格
        & /deep/ .el-table__expanded-cell {
          background-color: @white-th;
          // background-color: none;
          .el-table--enable-row-hover .el-table__body {
            tr {
              &:hover > td {
                background-color: rgba(67, 92, 112);
              }
            }
            .el-table_1_column_2 .cell {
              text-align: right;
            }
          }
        }
        & /deep/ .el-table__empty-block {
          background-color: @white-th;
        }

        // 鼠标移入颜色
        & /deep/ .el-table__body tr.hover-row.current-row > td,
        &
          /deep/
          .el-table__body
          tr.hover-row.el-table__row--striped.current-row
          > td,
        & /deep/ .el-table__body tr.hover-row.el-table__row--striped > td,
        & /deep/ .el-table__body tr.hover-row > td {
          background-color: #64657d;
        }

        & /deep/ .el-table__expanded-cell[class*='cell'] {
          padding: 10px 10px;
        }
      }
      /* 分页 */
      .block {
        float: right;
      }
      // 用电电价
      .electoric {
        overflow: auto;
        .ele-title {
          @dis-flex();
          .el-button {
            margin-left: 500px;
          }
        }
        /deep/ .el-form {
          padding-bottom: 10px;
          border-bottom: 1px dashed #ccc;
          @dis-flex();
          // 左边
          .form-left {
            width: 200px;
            /deep/ .el-input {
              width: 180px;
            }
          }
          // 右边
          .form-right {
            // @flex-1();
            margin-left: 40px;
            width: 502px;
            // @dis-flex();
            /deep/ .el-input {
              width: 144px;
            }
            .number {
              // @flex-1();
              display: inline-block;
              padding: 0 10px;
            }
            /deep/ .el-radio {
              color: #ccc;
            }
            // 表格
            .price-tab {
              margin: 6px 0;
              padding: 10px;
              border: 1px solid #ccc;
              border-radius: 6px;

              /deep/ .el-select {
                .el-input.is-disabled .el-input__inner {
                  background-color: #4e657a;
                }
              }
              /deep/ .el-table__row .cell {
                height: 36px !important;
                padding-right: 0;
              }
              /deep/ .el-table {
                th {
                  padding: 4px 0;
                  background-color: none !important;
                }
                .el-input {
                  width: 100px;
                }
              }
            }
          }
        }
      }
      // 电表配置
      .ele-equip {
        overflow: hidden;
        padding-left: 20px;
        height: 100%;
        .equip-title {
          @dis-flex();
          margin-bottom: 16px;
          .el-button {
            margin-left: 500px;
          }
        }
        .conf-title {
          width: 600px;
          @dis-flex();
          span {
            display: block;
          }
          span:first-child {
            width: 25%;
          }
          span:nth-child(2) {
            width: 30%;
          }
          span:nth-child(3) {
            width: 30%;
          }
          .el-button {
            width: 15%;
          }
        }
        .config {
          width: 600px;
          .conf-single {
            @dis-flex();
            margin-bottom: 8px;
            align-items: center;
            .input,
            .casc,
            .dis-input {
              width: 25%;
              padding-right: 10px;
              box-sizing: border-box;
            }
            .dis-input {
              width: 30%;
              &:hover {
                cursor: pointer;
              }
              @dis-flex();

              /deep/ .el-input.is-disabled .el-input__inner {
                background-color: #4e657a;
              }
            }
            .select {
              width: 30%;
            }
            .el-button {
              width: 15%;
            }
          }
        }
      }
      // 能源配置
      .energy-config {
        overflow: auto;
        .equip-title {
          @dis-flex();
          margin-bottom: 16px;
          .el-button {
            margin-left: 500px;
          }
        }
        .conf-title {
          width: 600px;
          @dis-flex();
          span {
            display: block;
          }
          span:first-child {
            width: 25%;
          }
          span:nth-child(2) {
            width: 30%;
          }
          span:nth-child(3) {
            width: 30%;
          }
          .el-button {
            width: 15%;
          }
        }
        .config {
          width: 600px;
          .conf-single {
            @dis-flex();
            margin-bottom: 8px;
            align-items: center;
            .input,
            .casc,
            .dis-input {
              width: 25%;
              padding-right: 10px;
              box-sizing: border-box;
            }
            .dis-input {
              width: 30%;
              &:hover {
                cursor: pointer;
              }
              @dis-flex();
              // .el-icon-edit {
              //   margin-left: 4px;
              //   &:hover {
              //     cursor: pointer;
              //   }
              // }
              /deep/ .el-input.is-disabled .el-input__inner {
                background-color: #4e657a;
              }
            }
            .select {
              width: 30%;
            }
            .el-button {
              width: 15%;
            }
          }
        }
      }
    }
  }
  // 弹窗
  /* 网关窗口大小 */
  .eidt-input-width {
    width: 240px;
  }
  /* 编辑电表弹窗 */
  /* 输入框宽度 */
  .variate-dialog {
    .variate-form {
      .edit-input {
        .el-form-item {
          width: 260px;
          display: inline-block;

          .input-width-s {
            width: 160px;
          }

          .el-cascader {
            width: 160px !important;
            /deep/ input.el-input__inner {
              width: 160px;
              height: 32px !important;
            }     
          }

          &.maintainCode, &.judgValue {
            /deep/ .el-form-item__label:before {
              content: '*';
              color: #F56C6C;
              margin-right: 4px;
            }
          }

        }
      }

      .fade-enter-active, .fade-leave-active {
        transition: opacity .2s;
      }
      .fade-enter, .fade-leave-to {
        opacity: 0;
      }
     
      .el-form-item__error {
        color: #F56C6C;
        font-size: 12px;
        line-height: 1;
        padding-top: 4px;
        position: absolute;
        top: 100%;
        left: 0;
      }

      .control-box {
        .control-item {
          /deep/ .el-form-item {
            width: 90%;
            margin-bottom: 0;
            .el-form-item__content {
              margin-left: 0 !important;
            }
          }
        }
      }
    }
    /* 添加数据区按钮 */
    .data-area /deep/ .el-button--success.is-plain {
      color: #fff;
      background: @primary-btn;
      border-color: @primary-btn;
    }
    .data-text {
      color: skyblue;
      border-bottom: 1px solid #ccc;
      margin-bottom: 10px;
    }
    // 数据区
    .tb-data {
      border: 1px solid #ccc;
      border-radius: 10px;
      margin-top: 10px;
      table {
        th {
          width: 110px;
        }
        tbody > tr > td {
          text-align: center;
          padding: 4px;
          box-sizing: border-box;
          input {
            width: 95px;
            height: 20px;
            border-radius: 4px;
          }
        }
      }
      .saying {
        font-size: 18px;
        padding: 10px;
        text-align: center;
        border-top: 1px solid #ccc;
      }
    }
  }
}

/* 四个标签样式 */
.content /deep/ .el-tabs--border-card {
  background: none;
  border: none;
  box-shadow: 0 0 4px #aaa;
  margin-right: 15px;
}

.content /deep/ .el-tabs--border-card > .el-tabs__header {
  background: none;
  border: none;
}

.content
  /deep/
  .el-tabs--border-card
  > .el-tabs__header
  .el-tabs__item.is-active {
  color: @radio-bgc;
  border-right-color: rgba(67, 92, 112);
  border-left-color: rgba(67, 92, 112);
  background: none;
}
.content /deep/ .el-tabs--border-card > .el-tabs__header .el-tabs__item {
  color: @radio-bgc;
  border-right-color: rgba(67, 92, 112);
  border-left-color: rgba(67, 92, 112);
  background: rgba(84, 101, 125);
}

.content .el-button {
  margin-left: 0;
  margin-bottom: 5px;
}

.content /deep/ .el-tabs__item {
  color: #ccc;
}

.content /deep/ .el-tabs__item.is-active {
  color: #409eff;
}

.block /deep/ .el-icon-arrow-right {
  color: #c0c4cc;
}
/deep/ .el-radio {
  color: #ccc;
}
.basicEleForm /deep/ .el-form-item {
  margin-bottom: 20px;
  .el-form-item__label-wrap {
    margin-left: 42px;
  }
}
.list-item {
  width: calc(100% - 42px);
  &:nth-of-type(1) {
    margin-top: 10px;
  }
}
.item-title {
  position: relative;
  font-size: 16px;
  line-height: 3rem;
  padding-left: 15px;
  &::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 12px;
    top: 50%;
    left: 2px;
    transform: translateY(-50%);
    background: rgb(161, 237, 240);
  }
}
.item-tag {
  font-size: 12px;
  color: cadetblue;
  text-align: right;
  padding-right: 5px;
}
.tree-box {
  position: absolute;
  left: 0;
  right: 0;
  top: 10px;
  bottom: 0.5rem;
  overflow-y: auto;
}
.hasBack-tab {
  height: 100%;
  /deep/ .el-tabs__content {
    height: calc(100% - 40px);
    /deep/ .el-tab-pane {
      height: 100%;
      /deep/ .select {
        height: calc(100% - 86px);
        overflow: hidden;
        /deep/ .el-tabs__content {
          height: calc(100% - 86px);
          overflow: auto;
          .electoric {
            height: 100%;
            padding-left: 20px;
          }
          /deep/ .electoric-content {
            height: calc(100% - 50px);
            padding-left: 42px;
            overflow: auto;
          }
        }
      }
    }
  }
}
.configBox {
  height: calc(100% - 175px);
  overflow: auto;
}
.deal {
  margin-top: 10px;
}
.basicEleForm {
  box-sizing: border-box;
  padding-left: 20px;
  .el-form-item {
    padding-left: 42px;
  }
}
.equip-con {
  box-sizing: border-box;
  padding-left: 42px;
  height: calc(100% - 108px);
  .config-content {
    height: calc(100% - 40px);
    overflow: auto;
  }
}
</style>
