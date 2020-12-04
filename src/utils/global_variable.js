// 全局变量及常量
// 常量
const max_page_size = 100000000;      //分页大小
 // 获取所有网关
const getAllGateway=function(target,callback) {
  target.$http
    .get("equipment/gatewayList", {
      params: {
        page: 0,
        size: max_page_size,
        roomId: target.siteId,
      },
    })
    .then((res) => {
      if (res.data.code === 0) {
        if(callback instanceof Function){
          callback(res.data.data.gateways);
        }
      }
    });
};// 获取站点下所有设备
const getAllEquip=function(target,callback) {
  target.$http
    .get("equipment/getEqByRoom", {
      params: {
        page: 0,
        size: max_page_size,
        roomId: target.siteId,
      },
    })
    .then((res) => {
      if (res.data.code === 0) {
        if(callback instanceof Function){
          callback(res.data.data);
        }
      }
    });
};
export default {
  max_page_size,
  getAllGateway,
  getAllEquip
}