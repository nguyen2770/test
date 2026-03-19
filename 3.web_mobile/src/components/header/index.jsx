import { Avatar, Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";
import "./header.scss";

export default function Header({ title, rightContent, leftContent }) {
    // const { innerWidth: width, innerHeight: height } = window;
    // const navigate = useNavigate();
    // const goToMenu = (e) => {
    //     navigate(e.item.props.path);
    // }
    return (
        <div className="header-base-container">
            <div className="left-content-container">{leftContent}</div>
            <div className="header-title">{title}</div>
            <div className="right-content-container">{rightContent}</div>
        </div>
    );
}
