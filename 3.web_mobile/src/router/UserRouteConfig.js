
import { DashboardOutlined, TeamOutlined, UserOutlined, HomeOutlined, UserAddOutlined, UserSwitchOutlined } from "@ant-design/icons";
import React, { lazy } from "react";

export const userStaticPath = {
    updateUserInfo: '/nguoi-dung/cap-nhat-thong-tin',
};

export const userRoutes = [
    {
        path: userStaticPath.updateUserInfo,
        exact: true,
        title: "Quản lý sim",
        icon: <DashboardOutlined />,
        component: lazy(() => import("../pages/user/updateInfo/UpdateUserInfo")),
    },
];

