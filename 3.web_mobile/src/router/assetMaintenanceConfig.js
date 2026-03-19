import id from "date-fns/locale/id";
import { lazy } from "react";
import { permissionCodeConstant } from "../utils/permissionCodeConstant";

export const assetMaintenanceConfigStaticPath = {
  assetMaintenance: "/tai-san",
  assetMaintenanceDetail: "/tai-san/chi-tiet",
};

export const routeAssetMaintenanceConfigs = [
  {
    path: assetMaintenanceConfigStaticPath.assetMaintenance,
    exact: true,
    title: "Tài sản",
    component: lazy(() => import("../pages/assetMaintenance/assetMaintenance")),
    permisisonCode: permissionCodeConstant.asset_view_list,
  },
  {
    path: assetMaintenanceConfigStaticPath.assetMaintenanceDetail + "/:id",
    exact: true,
    title: "Chi tiết tài sản",
    component: lazy(() =>
      import("../pages/assetMaintenance/assetMaintenanceDetail")
    ),
    permisisonCode: permissionCodeConstant.asset_view_detail,
  },
];
