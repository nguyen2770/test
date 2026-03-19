import id from "date-fns/locale/id";
import { lazy } from "react";
import { permissionCodeConstant } from "../utils/permissionCodeConstant";

export const calibrationPath = {
  myCalibrationWorkDetail: "/my-calibration-work/detail",
  calibrationWork: "/calibration-work",
  calibrationWorkDetail: "/calibration-work/detail",
};

export const routeCalibrationWorkConfigs = [
  {
    path: calibrationPath.myCalibrationWorkDetail + "/:id",
    exact: true,
    title: "Chi tiết Công việc hiệu chuẩn của tôi",
    component: lazy(() =>
      import("../pages/myCalibrationWork/MyCalibrationWorkDetail")
    ),
    un_check_permission: true,
    //chưa check permission
  },
  {
    path: calibrationPath.calibrationWorkDetail + "/:id",
    exact: true,
    title: "Chi tiết Công việc hiệu chuẩn",
    component: lazy(() =>
      import("../pages/calibrationWork/CalibrationWorkDetail")
    ),
    un_check_permission: true,
    //chưa check permission
  },
];
