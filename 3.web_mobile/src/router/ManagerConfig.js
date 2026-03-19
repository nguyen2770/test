
import { DashboardOutlined, TeamOutlined, UserOutlined, HomeOutlined, UserAddOutlined, UserSwitchOutlined } from "@ant-design/icons";
import React, { lazy } from "react";

export const staticPath = {
    sim: 'quan-ly/sim',
};

const routes = [
    {
        path: staticPath.sim,
        exact: true,
        title: "Quản lý sim",
        icon: <DashboardOutlined />,
        component: lazy(() => import("../pages/managers/sim/index")),
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

export const flatConfig = flatRouteConfig(routes);

export default routes;
