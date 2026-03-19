import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Form, Button, Input, Drawer, Checkbox, Spin, Pagination, message, Timeline, Radio } from 'antd';
import { ArrowLeftOutlined, PhoneOutlined, RedoOutlined, CheckSquareFilled, PhoneFilled, UserOutlined, AuditOutlined } from '@ant-design/icons';
import * as _unitOfWork from "../../../api";
import PreventiveScheduleCompleteChart from '../components/PreventiveScheduleCompleteChart';
import BreakdownCompleteChart from '../components/BreakdownCompleteChart';
import { useTranslation } from 'react-i18next';

const PreventiveScheduleAndBreakdownCompleteChartDrawer = ({ open, onClose }) => {
    const [dateRangeType, setDateRangeType] = useState('day');
    const { t } = useTranslation();

    const optionDateType = [
        { label: t('dateRange.day'), value: 'day' },
        { label: t('dateRange.week'), value: 'week' },
        { label: t('dateRange.month'), value: 'month' },
        { label: t('dateRange.year'), value: 'year' },
    ];

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
                <span style={{ flex: 1 }}>{t("schedulePreventive.history.title")}</span>
            </div>
            <div className='p-3'>
                <Radio.Group
                    block
                    options={optionDateType}
                    value={dateRangeType}
                    optionType="button"
                    buttonStyle="solid"
                    onChange={(e) => setDateRangeType(e.target.value)}
                />
                <PreventiveScheduleCompleteChart dateRangeType={dateRangeType} />
                <div className='mt-2 mb-3' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: "18px" }}>
                    <AuditOutlined className='mr-2' />
                    {t("schedulePreventive.chart.preventive_completed")}
                </div>
                <BreakdownCompleteChart dateRangeType={dateRangeType} />
                <div className='mt-2 mb-3' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: "18px" }}>
                    {t("schedulePreventive.chart.breakdown_completed")}
                </div>
            </div>
        </Drawer >
    );
};

export default React.memo(PreventiveScheduleAndBreakdownCompleteChartDrawer);