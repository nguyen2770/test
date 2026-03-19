import {
    DashboardOutlined,
} from "@ant-design/icons";
import React, { lazy } from "react";
export const staticPathUnAuthen = {
    createBreakdown: '/create-breakdown',
    showResponseCreateBreakdown: '/show-response-create-breakdown',
    scanQRCodeHome: '/scan-QR-code-home',
    detailAssetMaintenanceByScanQRCode: '/detail-asset-maintenance-by-scan-qr-code',
    sparePartDetail: '/spare-part/spare-part-detail',
    verifyApp: '/verify-app'
};

const routeUnAuthens = [
    {
        path: staticPathUnAuthen.createBreakdown,
        key: staticPathUnAuthen.createBreakdown,
        exact: true,
        title: "Tạo mới sự cố khi quét qr",
        icon: <DashboardOutlined />,
        component: lazy(() => import("../pages/scanQRCode/CreateBreakdown")),
    },
    {
        path: staticPathUnAuthen.showResponseCreateBreakdown,
        key: staticPathUnAuthen.showResponseCreateBreakdown,
        exact: true,
        title: "Thêm tập tin đính kèm",
        icon: <DashboardOutlined />,
        component: lazy(() => import("../pages/ShowResponseCreateBreakdown/ShowResponseCreateBreakdown")),
    },
    {
        path: staticPathUnAuthen.scanQRCodeHome,
        key: staticPathUnAuthen.scanQRCodeHome,
        exact: true,
        title: "Trang chủ khi quét QR code",
        icon: <DashboardOutlined />,
        component: lazy(() => import("../pages/scanQRCode/ScanQRCodeHome")),
    },
    {
        path: staticPathUnAuthen.detailAssetMaintenanceByScanQRCode,
        key: staticPathUnAuthen.detailAssetMaintenanceByScanQRCode,
        exact: true,
        title: "Chi tiết tài sản khi quét QR code",
        icon: <DashboardOutlined />,
        component: lazy(() => import("../pages/scanQRCode/DetailAssetMaintenanceByScanQRCode")),
    },
    {
        key: staticPathUnAuthen.sparePartDetail,
        path: staticPathUnAuthen.sparePartDetail,
        label: "Báo cáo",
        exact: true,
        // icon: <ApartmentOutlined />,
        component: lazy(() => import("../pages/scanQRCode/sparePartDetail")),

    },
    {
        path: staticPathUnAuthen.verifyApp,
        key: staticPathUnAuthen.verifyApp,
        exact: true,
        title: "Xác thực app",
        icon: <DashboardOutlined />,
        component: lazy(() =>
            import("../pages/auth/VerifyApp")
        ),
    },
];

function flatRouteConfig(routes) {
    let flatRoutes = [];
    Array.isArray(routes) &&
        routes.forEach((item) => {
            if (item.childrens) {
                flatRoutes.push(...item.childrens);
            } else {
                item.path && flatRoutes.push(item);
            }
        });
    return flatRoutes;
}

export const flatUnAuthenConfig = flatRouteConfig(routeUnAuthens);

export default routeUnAuthens;
