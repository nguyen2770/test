import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Form, Button, Input, Drawer, Checkbox, Spin, Pagination, message, Timeline } from 'antd';
import { ArrowLeftOutlined, PhoneOutlined, RedoOutlined, CheckSquareFilled, PhoneFilled, UserOutlined } from '@ant-design/icons';
import * as _unitOfWork from "../../api";
import './styles/SchedulePreventiveHistoryDrawer.scss'
import { parseToLabel } from '../../helper/parse-helper';
import { parseDateHH } from '../../helper/date-helper';
import { historySchedulePreventiveStatus } from '../../utils/schedulePreventive.constant';
import { useTranslation } from "react-i18next";
const SchedulePreventiveHistoryDrawer = ({ open, onClose, schedulePreventiveHistories, task, callbackAssignUser }) => {
    const { t } = useTranslation();
    const generateTimeLineItems = () => {
        const newItems = [];
        if (!schedulePreventiveHistories || schedulePreventiveHistories.length == 0) {
            return newItems
        };
        schedulePreventiveHistories.forEach(_item => {
            newItems.push({
                children: childrenItem(_item)
            })
        })
        return newItems;
    }
    const childrenItem = (_item) => {
        return <div>
            {
                _item?.schedulePreventiveTask && <div className='pb-1'>
                    <b>{t("schedulePreventiveHistoryDrawer.task_name", { defaultValue: "Tên công việc:" })} </b>
                    <span> {_item?.schedulePreventiveTask?.taskName}</span>
                </div>
            }
            <div className='pb-1'>
                <b>{t("schedulePreventiveHistoryDrawer.time", { defaultValue: "Thời điểm:" })} </b>
                <span>{parseDateHH(_item?.createdAt)}</span>
            </div>
            <div className='pb-1'>
                <b>{t("schedulePreventiveHistoryDrawer.status", { defaultValue: "Trạng thái:" })} </b>
                <span>{t(parseToLabel(historySchedulePreventiveStatus.Options, _item?.status))}</span>
            </div>
            {
                _item?.createdBy && <div className='pb-1'>
                    <b>{t("schedulePreventiveHistoryDrawer.user", { defaultValue: "Người thực hiện:" })} </b>
                    <span>{_item?.createdBy?.fullName}</span>
                </div>
            }
            {
                _item?.assignedTo && <div>
                    <b>{t("schedulePreventiveHistoryDrawer.assigned", { defaultValue: "Được chỉ định:" })} </b>
                    <span>{_item?.assignedTo?.fullName}</span>
                </div>
            }

        </div>
    }
    return (
        <Drawer
            placement="right"
            closable={false}
            open={open}
            width="100%"
            className='drawer-schedule-preventive-history'
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
                <span style={{ flex: 1 }}>{t("preventive.history.title", { defaultValue: "Nhật ký công việc" })}</span>
            </div>
            <div className='p-3'>
                <Timeline items={generateTimeLineItems()} />
            </div>
        </Drawer >
    );
};

export default React.memo(SchedulePreventiveHistoryDrawer);