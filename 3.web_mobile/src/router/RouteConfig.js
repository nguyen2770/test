import { ApartmentOutlined, DashboardOutlined } from "@ant-design/icons";
import React, { lazy } from "react";
import { routeReport, reportStaticPath } from "./reportConfig";
import { userStaticPath, userRoutes } from "./UserRouteConfig";
import {
  priventiveConfigStaticPath,
  routePriventiveConfigs,
} from "./schedulePreventiveTaskAssignUserConfig";
import {
  assetMaintenanceConfigStaticPath,
  routeAssetMaintenanceConfigs,
} from "./assetMaintenanceConfig";
import {
  calibrationPath,
  routeCalibrationWorkConfigs,
} from "./calibrationConfig";
import {
  schedulePreventiveConfigStaticPath,
  routeSchedulePreventiveConfigs,
} from "./schedulePreventiveConfig";
import { contractStaticPath, routeContract } from "./contractConfig";
import { permissionCodeConstant } from "../utils/permissionCodeConstant";
import { checkPermission } from "../helper/permission-helper";
import { STORAGE_KEY } from "../utils/constant";
import { sparePart } from "../api";
export const staticPath = {
  realtime: "/trang-chu",
  myBreakdown: "/my-breakdown",
  monitor: "/theo-doi",
  infoUser: "/thong-tin-nguoi-dung",
  solutionBankBreakdown: "/giai-phap-su-co",
  viewSolutionBankBreakdown: "/giai-phap-su-co/chi-tiet",
  selfDiagnosisBreakdown: "/self-diagnosis-breakdown",
  viewSelfDiagnosisBreakdown: "/self-diagnosis-breakdown/chi-tiet",
  breakdwonAttachment: "/breadown-attachment",
  viewMyBreakdown: "/view-my-breakdown",
  breakdownComment: "/breakdown-comment",
  requestSparePart: "/yeu-cau-phu-tung",
  testedFixed: "/da-sua-thu-nghiem",
  comfirmFixed: "/xac-nhan-da-sua",
  requestForSupport: "/yeu-cau-ho-tro",
  priventive: "/cong-viec",
  addAttahment: "/them-tap-tin-dinh-kem",
  workDiary: "/nhat-ky-cong-viec",
  createTechnicalSupportTicket: "/create-technical-support-ticket",
  scanQrCode: "/scan-qr-code",
  assetModelDocument: "/tai-lieu-huong-dan",
  breakdownSpareRequest: "/yeu-cau-thay-phu-tung",
  createBreakdownSpareRequest: "/yeu-cau-thay-phu-tung/them-moi",
  apprevedbreakdownSpareRequest: "/phe-duyet-phu-tung",
  searchBreakdownByQrCode: "/tim-kiem-bang-ma-qr",
  ...userStaticPath,
  inventory: "/inventory",
  ...priventiveConfigStaticPath,
  ...assetMaintenanceConfigStaticPath,
  ...schedulePreventiveConfigStaticPath,
  ...reportStaticPath,
  myCalendar: "/my-calendar",
  assetMaintenanceDueInspection: "/asset-maintenance-due-inspection",
  settings: "/cai-dat",
  myCalibrationWork: "/my-calibration-work",
  ...calibrationPath,
  ...contractStaticPath,
  sparePartRequestBreakdown: "/spare-part-request-breakdown",
  sparePartRequestBreakdownDetail: "/spare-part-request-breakdown-detail",
  sparePartRequestSchedulePreventive: "/spare-part-request-schedule-preventive",
  sparePartRequestSchedulePreventiveDetail: "/spare-part-request-schedule-preventive-detail",
};

const routes = [
  {
    path: staticPath.realtime,
    exact: true,
    title: "Home",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/home/Home")),
    un_check_permission: true,
  },
  ...routePriventiveConfigs,
  {
    path: staticPath.myBreakdown,
    exact: true,
    title: "My Breakdown",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/myBreakdown/MyBreakdown")),
    permisisonCodes: [
      permissionCodeConstant.breakdown_view_list,
      permissionCodeConstant.ticket_view_list,
    ],
  },
  {
    path: staticPath.monitor + "/:id",
    exact: false,
    title: "Theo dõi",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../components/modal/Monitor")),
    un_check_permission: true,
  },
  {
    path: staticPath.infoUser,
    exact: false,
    title: "Thông tin người dùng",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../components/modal/InfoUser")),
    un_check_permission: true,
  },
  {
    path: staticPath.solutionBankBreakdown + "/:id",
    key: staticPath.solutionBankBreakdown + "/:id",
    exact: true,
    title: "SolutionBank",
    icon: <DashboardOutlined />,
    component: lazy(() =>
      import("../pages/myBreakdown/solutionBank/SolutionBank")
    ),
    un_check_permission: true,
  },
  {
    path: staticPath.viewSolutionBankBreakdown + "/:id",
    key: staticPath.viewSolutionBankBreakdown + "/:id",
    exact: false,
    title: "viewSolutionBankBreakdown",
    icon: <DashboardOutlined />,
    component: lazy(() =>
      import("../pages/myBreakdown/solutionBank/ViewSolutionBack")
    ),
    un_check_permission: true,
  },
  {
    path: staticPath.selfDiagnosisBreakdown + "/:id",
    key: staticPath.selfDiagnosisBreakdown + "/:id",
    exact: true,
    title: "selfDiagnosisBreakdown",
    icon: <DashboardOutlined />,
    component: lazy(() =>
      import("../pages/myBreakdown/selfDiagnosis/SelfDiagnosisBreakdown")
    ),
    un_check_permission: true,
  },
  {
    path: staticPath.viewSelfDiagnosisBreakdown + "/:id",
    key: staticPath.viewSelfDiagnosisBreakdown + "/:id",
    exact: false,
    title: "viewSelfDiagnosisBreakdown",
    icon: <DashboardOutlined />,
    component: lazy(() =>
      import("../pages/myBreakdown/selfDiagnosis/ViewSelfDiagnosisBreakdown")
    ),
    un_check_permission: true,
  },
  {
    path: staticPath.breakdwonAttachment + "/:id",
    key: staticPath.breakdwonAttachment + "/:id",
    exact: false,
    title: "breakdwonAttachment",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/myBreakdown/BreadownAttachment")),
    un_check_permission: true,
  },
  {
    path: staticPath.viewMyBreakdown + "/:id",
    key: staticPath.viewMyBreakdown + "/:id",
    exact: true,
    title: "View breakdown",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/myBreakdown/ViewBreakdown")),
    permisisonCodes: [
      permissionCodeConstant.breakdown_view_detail,
      permissionCodeConstant.ticket_view_detail,
    ],
  },
  {
    path: staticPath.breakdownComment + "/:id",
    key: staticPath.breakdownComment + "/:id",
    exact: true,
    title: "BreakdownComment",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/myBreakdown/BreakdownComment")),
    permisisonCode: permissionCodeConstant.breakdown_comment,
  },
  {
    path: staticPath.comfirmFixed + "/:id",
    key: staticPath.comfirmFixed + "/:id",
    exact: true,
    title: "ComfirmFixed",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/myBreakdown/ComfirmFixed")),
    un_check_permission: true,
  },
  {
    path: staticPath.requestSparePart + "/:id",
    key: staticPath.requestSparePart + "/:id",
    exact: true,
    title: "RequestSparePart",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/myBreakdown/RequestSparePart")),
    un_check_permission: true,
  },
  {
    path: staticPath.requestForSupport + "/:id",
    key: staticPath.requestForSupport + "/:id",
    exact: true,
    title: "RequestForSupport",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/myBreakdown/RequestForSupport")),
    un_check_permission: true,
  },
  {
    path: staticPath.testedFixed + "/:id",
    key: staticPath.testedFixed + "/:id",
    exact: true,
    title: "TestedFixed",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/myBreakdown/TestedFixed")),
    un_check_permission: true,
  },

  {
    path: staticPath.addAttahment,
    key: staticPath.addAttahment,
    exact: true,
    title: "Thêm tập tin đính kèm",
    icon: <DashboardOutlined />,
    component: lazy(() =>
      import("../components/modal/Attachment/AddAnAttachment")
    ),
    un_check_permission: true,
  },
  {
    path: staticPath.workDiary + "/:id",
    key: staticPath.workDiary + "/:id",
    exact: true,
    title: "workDiary",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/myBreakdown/WorkDiary")),
    un_check_permission: true,
  },
  // Phiếu hỗ trợ kỹ thuật
  {
    path: staticPath.createTechnicalSupportTicket,
    key: staticPath.createTechnicalSupportTicket,
    exact: true,
    title: "Tạo phiếu hỗ trợ kỹ thuật",
    icon: <DashboardOutlined />,
    component: lazy(() =>
      import("../pages/technicalSupportTicket/CreateTechnicalSupportTicket")
    ),
    un_check_permission: true,
  },
  {
    path: staticPath.scanQrCode,
    key: staticPath.scanQrCode,
    exact: true,
    title: "Quét mã QR",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/technicalSupportTicket/ScanQrCode")),
    un_check_permission: true,
  },
  {
    path: staticPath.assetModelDocument + "/:id",
    key: staticPath.assetModelDocument + "/:id",
    exact: true,
    title: "Thêm tập tin đính kèm",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/myBreakdown/assetModelDocument")),
    un_check_permission: true,
  },
  {
    path: staticPath.breakdownSpareRequest + "/:id",
    key: staticPath.breakdownSpareRequest + "/:id",
    exact: true,
    title: "Yêu cầu thay thế phụ tùng",
    icon: <DashboardOutlined />,
    component: lazy(() =>
      import(
        "../pages/myBreakdown/breakdownSpareRequest/BreakdownSparePartRequest"
      )
    ),
    un_check_permission: true,
  },
  {
    path: staticPath.createBreakdownSpareRequest + "/:id",
    key: staticPath.createBreakdownSpareRequest + "/:id",
    exact: true,
    title: "Thêm mới yêu cầu thay thế phụ tùng",
    icon: <DashboardOutlined />,
    component: lazy(() =>
      import(
        "../pages/myBreakdown/breakdownSpareRequest/CreateBreakdownSpareRequest"
      )
    ),
    un_check_permission: true,
  },
  {
    path: staticPath.apprevedbreakdownSpareRequest + "/:id",
    key: staticPath.apprevedbreakdownSpareRequest + "/:id",
    exact: true,
    title: "Phê duyệt phụ tùng",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/myBreakdown/BreakdwonSparePart")),
    permisisonCode: permissionCodeConstant.spare_view_list,
  },
  {
    path: staticPath.searchBreakdownByQrCode,
    key: staticPath.searchBreakdownByQrCode,
    exact: true,
    title: "Tìm kiếm theo mã QR",
    icon: <DashboardOutlined />,
    component: lazy(() =>
      import("../pages/myBreakdown/SearchBreakdownByQrCode")
    ),
    un_check_permission: true,
  },
  ...userRoutes,
  {
    path: staticPath.inventory,
    key: staticPath.inventory,
    exact: true,
    title: "Tồn kho",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/inventory")),
    un_check_permission: true,
  },
  ...routeAssetMaintenanceConfigs,
  ...routeSchedulePreventiveConfigs,
  ...routeReport,
  {
    path: staticPath.myCalendar,
    key: staticPath.myCalendar,
    exact: true,
    title: "Lịch của tôi",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/home/MyCalendar")),
    un_check_permission: true,
  },
  {
    path: staticPath.assetMaintenanceDueInspection,
    key: staticPath.assetMaintenanceDueInspection,
    exact: true,
    title: "Kiểm định đến hạn",
    icon: <DashboardOutlined />,
    component: lazy(() =>
      import("../pages/home/AssetMaintenanceDueInspection")
    ),
  },
  {
    path: staticPath.settings,
    key: staticPath.settings,
    exact: true,
    title: "Cài đặt",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../components/common/Settings")),
    un_check_permission: true,
  },
  {
    path: staticPath.calibrationWork,
    key: staticPath.calibrationWork,
    exact: true,
    title: "Công việc hiệu chuẩn ",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/calibrationWork/CalibrationWork")),
    un_check_permission: true,
  },
  {
    path: staticPath.myCalibrationWork,
    key: staticPath.myCalibrationWork,
    exact: true,
    title: "Công việc hiệu chuẩn của tôi",
    icon: <DashboardOutlined />,
    component: lazy(() =>
      import("../pages/myCalibrationWork/MyCalibrationWork")
    ),
    un_check_permission: true,
  },
  ...routeCalibrationWorkConfigs,
  {
    path: staticPath.myCalendar,
    key: staticPath.myCalendar,
    exact: true,
    title: "Lịch của tôi",
    icon: <DashboardOutlined />,
    component: lazy(() => import("../pages/home/MyCalendar")),
    un_check_permission: true,
  },
  {
    path: staticPath.assetMaintenanceDueInspection,
    key: staticPath.assetMaintenanceDueInspection,
    exact: true,
    title: "Kiểm định đến hạn",
    icon: <DashboardOutlined />,
    component: lazy(() =>
      import("../pages/home/AssetMaintenanceDueInspection")
    ),
    un_check_permission: true,
  },
  {
    key: staticPath.sparePartRequestBreakdown,
    path: staticPath.sparePartRequestBreakdown,
    label: "Phụ tùng - Sự cố",
    exact: true,
    icon: <ApartmentOutlined />,
    component: lazy(() => import("../pages/sparePartRequestBreakdown")),
    un_check_permission: true,
  },
  {
    key: staticPath.sparePartRequestBreakdownDetail + "/:id",
    path: staticPath.sparePartRequestBreakdownDetail + "/:id",
    label: "Chi tiết Phụ tùng - Sự cố",
    exact: true,
    icon: <ApartmentOutlined />,
    component: lazy(() =>
      import(
        "../pages/sparePartRequestBreakdown/SparePartRequestBreakdownDetail"
      )
    ),
    un_check_permission: true,
  },
  {
    key: staticPath.sparePartRequestSchedulePreventive,
    path: staticPath.sparePartRequestSchedulePreventive,
    label: "Phụ tùng - Bảo trì",
    exact: true,
    icon: <ApartmentOutlined />,
    component: lazy(() => import("../pages/sparePartRequestSchedulePrevetive")),
    un_check_permission: true,
  },
  {
    key: staticPath.sparePartRequestSchedulePreventiveDetail + "/:id",
    path: staticPath.sparePartRequestSchedulePreventiveDetail + "/:id",
    label: "Chi tiết Phụ tùng - Bảo trì",
    exact: true,
    icon: <ApartmentOutlined />,
    component: lazy(() => import("../pages/sparePartRequestSchedulePrevetive/SparePartRequestSchedulePrevetiveDetail")),
    un_check_permission: true,
  },
  ...routeContract,
];

export const flatRoutes = (_routers = routes) => {
  let flatsRoutes = [];
  const permissions = JSON.parse(localStorage.getItem(STORAGE_KEY.PERMISSION));
  Array.isArray(routes) &&
    routes.forEach((item) => {
      if (item.childrens) {
        const _children = item.children.filter(
          (c) =>
            c.un_check_permission ||
            (c.permisisonCodes &&
              c.permisisonCodes.findIndex((pc) =>
                checkPermission(permissions, pc)
              ) > -1) ||
            checkPermission(permissions, c.permisisonCode)
        );
        flatsRoutes.push(..._children);
      } else {
        if (
          item.un_check_permission ||
          (item.permisisonCodes &&
            item.permisisonCodes.findIndex((pc) =>
              checkPermission(permissions, pc)
            ) > -1) ||
          checkPermission(permissions, item.permisisonCode)
        ) {
          item.path && flatsRoutes.push(item);
        }
      }
    });
  return flatsRoutes;
};

export default routes;
