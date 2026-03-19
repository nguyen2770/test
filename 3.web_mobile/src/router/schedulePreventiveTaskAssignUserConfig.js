import id from "date-fns/locale/id";
import { lazy } from "react";
import { permissionCodeConstant } from "../utils/permissionCodeConstant";

export const priventiveConfigStaticPath = {
  priventive: "/cong-viec",
  PreventiveDetail: "/cong-viec/chi-tiet",
  PreventiveDocuments: "/cong_viec/tai-lieu",
  PreventiveWorkItems: "/cong-viec/cac-muc-cong-viec",
  PreventiveAttachment: "/cong-viec/tep-dinh-kem",
  scheulePreventiveTaskAssignUserDetail: "/cong-viec/chi-tiet",
};

export const routePriventiveConfigs = [
  {
    path: priventiveConfigStaticPath.priventive,
    exact: true,
    title: "Công việc",
    component: lazy(() =>
      import("../pages/mySchedulePreventive/MySchedulePreventive")
    ),
    permisisonCode:
      permissionCodeConstant.schedule_preventive_my_task_view_list,
  },
  {
    path: priventiveConfigStaticPath.PreventiveWorkItems + "/:id",
    exact: true,
    title: "Các mục công việc",
    component: lazy(() =>
      import(
        "../pages/mySchedulePreventive/PreventiveWorkItems/PreventiveWorkItems"
      )
    ),
    un_check_permission: true,
  },
  {
    path: priventiveConfigStaticPath.PreventiveDocuments + "/:id",
    exact: true,
    title: "Tài liệu",
    component: lazy(() =>
      import("../pages/mySchedulePreventive/PreventiveDocuments")
    ),
    un_check_permission: true,
  },
  {
    path: priventiveConfigStaticPath.PreventiveAttachment + "/:id",
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
    path:
      priventiveConfigStaticPath.scheulePreventiveTaskAssignUserDetail + "/:id",
    exact: true,
    title: "Chi tiết công việc",
    component: lazy(() =>
      import(
        "../pages/mySchedulePreventive/SchedulePreventiveTaskAssignUserDetail"
      )
    ),
    permisisonCode:
      permissionCodeConstant.schedule_preventive_my_task_checkin_checkout,
  },
];
