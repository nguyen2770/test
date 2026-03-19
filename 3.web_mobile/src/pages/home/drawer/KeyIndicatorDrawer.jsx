import { ArrowLeftOutlined, FileUnknownOutlined, MenuOutlined } from "@ant-design/icons";
import { Col, Row, Card, Radio, Popover, Drawer } from "antd";
import { Tiny } from '@ant-design/plots';
import React, { useEffect, useState } from "react";
import * as _unitOfWork from "../../../api";
import { Column, Line } from '@ant-design/plots';
import { useTranslation } from "react-i18next";

const KeyIndicatorDrawer = ({ open, onClose }) => {
    const [keyIndicatorsType, setKeyIndicatorsType] = useState('oneMonth');
    const [schedulePreventiveCompliance, setSchedulePreventiveCompliance] = useState(null);
    const [breakdownCompliance, setBreakdownCompliance] = useState(null);
    const [upTimeAssetMaintenance, setUpTimeAssetMaintenance] = useState(null);
    const [schedulePreventiveVsAssignUser, setSchedulePreventiveVsAssignUser] = useState([]);
    const { t } = useTranslation();

    const optionKeyIndecatorsType = [
        { label: t('keyIndicators.range_one_month'), value: 'oneMonth' },
        { label: t('keyIndicators.range_three_month'), value: 'threeMonth' },
        { label: t('keyIndicators.range_six_month'), value: 'sixMonth' },
    ];

    const formulaContent = (
        <div style={{ minWidth: 250 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t("keyIndicators.formula_detail_title")}</div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span style={{ flex: 1 }}>{t("keyIndicators.formula_completed_schedules")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span style={{ flex: 1, borderBottom: "1px dashed #888", marginRight: 8 }}></span>
                <span style={{ fontWeight: 600, fontSize: 16, marginRight: 8 }}>×</span>
                <span style={{ fontWeight: 600, fontSize: 16 }}>100</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ flex: 1 }}>{t("keyIndicators.formula_created_schedules")}</span>
            </div>
        </div>
    );

    useEffect(() => {
        fetchGetSchedulePreventiveCompliance();
        fetchGetBreakdownCompliance();
        fetchGetUpTimeAssetMaintenance();
        fetchGetSchedulePreventiveVsAssignUser();
    }, [keyIndicatorsType]);

    const fetchGetSchedulePreventiveCompliance = async () => {
        let res = await _unitOfWork.report.getSchedulePreventiveCompliance({ type: keyIndicatorsType });
        if (res && res.code === 1) {
            setSchedulePreventiveCompliance(res.percentSchedulePreventive);
        }
    };
    const fetchGetBreakdownCompliance = async () => {
        let res = await _unitOfWork.report.getBreakdownCompliance({ type: keyIndicatorsType });
        if (res && res.code === 1) {
            setBreakdownCompliance(res.percentBreakdown);
        }
    };
    const fetchGetUpTimeAssetMaintenance = async () => {
        let res = await _unitOfWork.report.getUpTimeAssetMaintenance({ type: keyIndicatorsType });
        if (res && res.code === 1) {
            setUpTimeAssetMaintenance(res.data);
        }
    };
    const fetchGetSchedulePreventiveVsAssignUser = async () => {
        let res = await _unitOfWork.report.getSchedulePreventiveVsAssignUser({ type: keyIndicatorsType });
        if (res && res.code === 1) {
            let data = [];
            data.push({
                pv: res?.data?.totalSchedulePreventive,
                action: t('keyIndicators.schedule_action_schedule')
            });
            data.push({
                pv: res?.data?.totalSchedulePreventiveAssignUser,
                action: t('keyIndicators.schedule_action_assign')
            });
            setSchedulePreventiveVsAssignUser(data);
        }
    };
    const configSchedulePreventiveVsAssign = {
        data: schedulePreventiveVsAssignUser,
        xField: 'action',
        yField: 'pv',
        style: {
            maxWidth: 35,
        },
        label: {
            text: (d) => d.pv,
            textBaseline: 'bottom',
        },
        width: 300,
        height: 200,
    };
    const configSchedulePreventive = {
        percent: (schedulePreventiveCompliance / 100),
        width: 200,
        height: 200,
        color: ['#E8EFF5', '#66AFF4'],
        annotations: [
            {
                type: 'text',
                style: {
                    text: `${Number(schedulePreventiveCompliance).toFixed(2)}%`,
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 16,
                    fontStyle: 'bold',
                },
            },
        ],
    };
    const configBreakdown = {
        percent: (breakdownCompliance / 100),
        width: 200,
        height: 200,
        color: ['#E8EFF5', '#66AFF4'],
        annotations: [
            {
                type: 'text',
                style: {
                    text: `${Number(breakdownCompliance).toFixed(2)}%`,
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 16,
                    fontStyle: 'bold',
                },
            },
        ],
    };
    const configUpTimeAssetMaintenance = {
        percent: (upTimeAssetMaintenance / 100),
        width: 200,
        height: 200,
        color: ['#E8EFF5', '#66AFF4'],
        annotations: [
            {
                type: 'text',
                style: {
                    text: `${Number(upTimeAssetMaintenance).toFixed(2)}%`,
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 16,
                    fontStyle: 'bold',
                },
            },
        ],
    };
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
                <span style={{ flex: 1 }}>{t("keyIndicators.title")}</span>
            </div>
            <div className='p-3'>
                <Row gutter={[16, 16]} className=" mb-2">
                    <Col >
                        <Radio.Group
                            block
                            options={optionKeyIndecatorsType}
                            value={keyIndicatorsType}
                            optionType="button"
                            buttonStyle="solid"
                            onChange={(e) => setKeyIndicatorsType(e.target.value)}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card >
                            <Row>
                                <Col span={16}>
                                    {t("keyIndicators.preventive")}
                                </Col>
                                <Col span={8} style={{ textAlign: 'end' }}>
                                    <Popover
                                        placement="top"
                                        title={null}
                                        content={formulaContent}
                                        trigger="click"
                                    >
                                        <FileUnknownOutlined className="mr-2" style={{ cursor: "pointer" }} />
                                    </Popover>
                                    <MenuOutlined style={{ fontWeight: "bold", fontSize: 16 }} />
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Tiny.Ring className="tiny-ring" {...configSchedulePreventive} />
                            </Row>
                            <Row>
                                <Col span={24} style={{ textAlign: 'center', color: "#4680ff" }}>
                                    {t("keyIndicators.completion_rate")} - {schedulePreventiveCompliance != null
                                        ? `${Number(schedulePreventiveCompliance).toFixed(2)}`
                                        : "0.00%"}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card >
                            <Row>
                                <Col span={16}>
                                    {t("keyIndicators.breakdown")}
                                </Col>
                                <Col span={8} style={{ textAlign: 'end' }}>
                                    <Popover
                                        placement="top"
                                        title={null}
                                        content={formulaContent}
                                        trigger="click"
                                    >
                                        <FileUnknownOutlined className="mr-2" style={{ cursor: "pointer" }} />
                                    </Popover>
                                    <MenuOutlined style={{ fontWeight: "bold", fontSize: 16 }} />
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Tiny.Ring className="tiny-ring" {...configBreakdown} />
                            </Row>
                            <Row>
                                <Col span={24} style={{ textAlign: 'center', color: "#4680ff" }}>
                                    {t("keyIndicators.completion_rate")} - {breakdownCompliance != null
                                        ? `${Number(breakdownCompliance).toFixed(2)}`
                                        : "0.00%"}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card >
                            <Row>
                                <Col span={16}>
                                    {t("keyIndicators.uptime")}
                                </Col>
                                <Col span={8} style={{ textAlign: 'end' }}>
                                    <MenuOutlined style={{ fontWeight: "bold", fontSize: 16 }} />
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Tiny.Ring className="tiny-ring" {...configUpTimeAssetMaintenance} />
                            </Row>
                            <Row>
                                <Col span={24} style={{ textAlign: 'center', color: "#4680ff" }}>
                                    {t("keyIndicators.uptime_rate")} - {upTimeAssetMaintenance != null
                                        ? `${Number(upTimeAssetMaintenance).toFixed(2)}`
                                        : "0.00%"}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card >
                            <Row>
                                <Col span={18}>
                                    {t("keyIndicators.schedule_vs_assign")}
                                </Col>
                                <Col span={6} style={{ textAlign: 'end' }}>
                                    <MenuOutlined style={{ fontWeight: "bold", fontSize: 16 }} />
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <div className="mt-3 preventive-schedule-complete-chart wp-100">
                                    <Column className="wp-100" {...configSchedulePreventiveVsAssign} />
                                </div>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Drawer >
    );
};

export default React.memo(KeyIndicatorDrawer);