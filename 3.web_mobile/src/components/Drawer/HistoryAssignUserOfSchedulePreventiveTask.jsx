import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Form, Button, Input, Drawer, Checkbox, Spin, Pagination, message, Timeline } from 'antd';
import { ArrowLeftOutlined, PhoneOutlined, RedoOutlined, CheckSquareFilled, PhoneFilled, UserOutlined } from '@ant-design/icons';
import * as _unitOfWork from "../../api";
import './styles/HistoryAssignUserOfSchedulePreventiveTask.scss'
import { parseToLabel } from '../../helper/parse-helper';
import { schedulePreventiveTaskAssignUserStatus } from '../../utils/schedulePreventive.constant';
import { useTranslation } from "react-i18next";
const HistoryAssignUserOfSchedulePreventiveTask = ({ open, onClose, homeBreakdown, task, callbackAssignUser }) => {
    const { t } = useTranslation();
    const generateTimeLineItems = () => {
        const newItems = [];
        if (!task) {
            return newItems
        };
        if (task.schedulePreventiveTaskAssignUserReplacements && task.schedulePreventiveTaskAssignUserReplacements.length > 0) {
            task.schedulePreventiveTaskAssignUserReplacements.forEach(_item => {
                newItems.push({
                    children: childrenItem(_item)
                })
            })
        }
        if (task.schedulePreventiveTaskAssignUserIsActive) {
            newItems.push({
                children: childrenItem(task.schedulePreventiveTaskAssignUserIsActive)
            })
        }
        return newItems;
    }
    const childrenItem = (_item) => {
        return <div>
            <div className='schedule-preventive-task-assign-user-fullname'>
                {_item?.user?.fullName}
            </div>
            <div className={'schedule-preventive-task-assign-user-status'}>
                {t(parseToLabel(schedulePreventiveTaskAssignUserStatus.Options, _item.status))}
            </div>
        </div>
    }
    return (
        <Drawer
            placement="right"
            closable={false}
            open={open}
            width="100%"
            className='drawer-task-history-assign-user'
            bodyStyle={{ padding: 0, background: "#f8f8f8", display: "flex", flexDirection: "column", height: "100vh" }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 56,
                    background: '#23457b',
                    color: '#fff',
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: 20,
                    boxSizing: 'border-box',
                    flexShrink: 0
                }}
            >
                <ArrowLeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={onClose}
                />
                <span style={{ flex: 1 }}>{t("preventiveAssignUser.history_title", { defaultValue: "Kỹ thuật viên được chỉ định" })}</span>
            </div>
            <div className='p-3'>
                <Timeline items={generateTimeLineItems()} />
            </div>
        </Drawer >
    );
};

export default React.memo(HistoryAssignUserOfSchedulePreventiveTask);