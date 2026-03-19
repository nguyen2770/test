import { ApartmentOutlined, SolutionOutlined } from "@ant-design/icons";
import { lazy } from "react";
import { permissionCodeConstant } from "../utils/permissionCodeConstant";

export const contractStaticPath = {
    contract: '/contract',
    maintenanceContract: '/contract/maintenanceContract',
    viewMaintenanceContract: '/contract/viewMaintenanceContract',
    calibrationContract: '/contract/calibrationContract',
    viewCalibrationContract: "/contract/viewCalibrationContract",
    repairContract: "/contract/repairContract",
    viewRepairContract: "/contract/viewRepairContract",


};

export const routeContract = [
    {
        key: contractStaticPath.contract,
        path: contractStaticPath.contract,
        label: "Hợp đồng",
        exact: true,
        icon: <ApartmentOutlined />,
        component: lazy(() => import("../pages/contract")),
        un_check_permission: true,
    },
    {
        key: contractStaticPath.maintenanceContract,
        path: contractStaticPath.maintenanceContract,
        label: "Hợp đồng bảo trì",
        icon: <ApartmentOutlined />,
        component: lazy(() => import("../pages/contract/maintenanceContract")),
        un_check_permission: true,
    },
    {
        key: contractStaticPath.viewMaintenanceContract + "/:id",
        path: contractStaticPath.viewMaintenanceContract + "/:id",
        label: "Hợp đồng bảo trì",
        icon: <ApartmentOutlined />,
        component: lazy(() => import("../pages/contract/maintenanceContract/viewAmc")),
        un_check_permission: true,
    },
    {
        key: contractStaticPath.calibrationContract,
        path: contractStaticPath.calibrationContract,
        label: "Hợp đồng hiệu chuẩn",
        icon: <ApartmentOutlined />,
        component: lazy(() => import("../pages/contract/calibrationContract/index")),
        un_check_permission: true,
    },
    {
        key: contractStaticPath.viewCalibrationContract + "/:id",
        path: contractStaticPath.viewCalibrationContract + "/:id",
        label: "Hợp đồng hiệu chuẩn",
        icon: <ApartmentOutlined />,
        component: lazy(() => import("../pages/contract/calibrationContract/viewCalibrationContract")),
        un_check_permission: true,
    },

    {
        key: contractStaticPath.repairContract,
        path: contractStaticPath.repairContract,
        label: "Hợp đồng sửa chữa",
        icon: <ApartmentOutlined />,
        component: lazy(() => import("../pages/contract/repairContract")),
        un_check_permission: true,
    },
    {
        key: contractStaticPath.viewRepairContract + "/:id",
        path: contractStaticPath.viewRepairContract + "/:id",
        label: "Hợp đồng sửa chữa",
        icon: <ApartmentOutlined />,
        component: lazy(() => import("../pages/contract/repairContract/viewRepairContract")),
        un_check_permission: true,
    },
];
