import id from "date-fns/locale/id";
import { lazy } from "react";
import { permissionCodeConstant } from "../utils/permissionCodeConstant";

export const schedulePreventiveConfigStaticPath = {
  schedulePreventive: "/bao-tri",
  schedulePreventiveDetail: "/bao-tri/chi-tiet",
  preventiveHistory: "/bao-tri/lich-su",
  PreventiveWorkItems: "/cong-viec/cac-muc-cong-viec",
  AllPreventiveTasks: "/cong-viec/tat-ca-cong-viec",
  PreventiveAttachment: "/cong-viec/tep-dinh-kem",
  requestSparePartSchedulePreventive: "/bao-tri/yeu-cau-linh-kien",
};

export const routeSchedulePreventiveConfigs = [
  {
    path: schedulePreventiveConfigStaticPath.schedulePreventive,
    exact: true,
    title: "Bảo trì định kỳ",
    component: lazy(() =>
      import("../pages/schedulePreventive/schedulePreventive")
    ),
    permisisonCode: permissionCodeConstant.breakdown_view_list,
  },
  {
    path: schedulePreventiveConfigStaticPath.schedulePreventiveDetail + "/:id",
    exact: true,
    title: "Chi tiết lịch",
    component: lazy(() =>
      import("../pages/schedulePreventive/schedulePreventiveDetail")
    ),
    permisisonCode: permissionCodeConstant.breakdown_view_detail,
  },
  {
    path: schedulePreventiveConfigStaticPath.preventiveHistory + "/:id",
    exact: true,
    title: "Lịch sử",
    component: lazy(() =>
      import("../pages/schedulePreventive/PreventiveHistory")
    ),
    un_check_permission: true,
  },
  {
    path: schedulePreventiveConfigStaticPath.PreventiveAttachment + "/:id",
    exact: true,
    title: "Người dùng được chỉ định",
    component: lazy(() =>
      import(
        "../pages/mySchedulePreventive/preventiveAttachment/preventiveAttachment"
      )
    ),
    un_check_permission: true,
  },
  {
    path: schedulePreventiveConfigStaticPath.requestSparePartSchedulePreventive + "/:id",
    exact: true,
    title: "Phụ tùng thay thế",
    component: lazy(() =>
      import(
        "../pages/mySchedulePreventive/requestSparePare/RequestSparePartSchedulePreventive"
      )
    ),
    un_check_permission: true,
  },
  //chưa check permission
];
