import { ArrowLeftOutlined, FileUnknownOutlined, MenuOutlined, RetweetOutlined, SwapOutlined } from "@ant-design/icons";
import { Col, Row, Card, Radio, Popover, Drawer, Form, Select, Button } from "antd";
import { Tiny } from '@ant-design/plots';
import React, { useEffect, useState } from "react";
import * as _unitOfWork from "../../../api";
import { Column, Line } from '@ant-design/plots';
import { formatMillisToHHMM } from "../../../helper/date-helper";
import { parseToLabel } from "../../../helper/parse-helper";
import { ticketSchedulePreventiveStatus } from "../../../utils/schedulePreventive.constant";
import { filterOption } from "../../../helper/search-select-helper";
import { useTranslation } from "react-i18next";

const ComparisonDashbroardDrawer = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const [customers, setCustomers] = useState([]);
    const [dateRangeType, setDateRangeType] = useState('day');
    const [tabKeyPreventiveAndBreakdown, setTabKeyPreventiveAndBreakdown] = useState("1");
    const [dataConpareSchedules, setDataConpareSchedules] = useState([]);
    const [dataConpareBreakdowns, setDataConpareBreakdowns] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        if (open) {
            fetchGetAllCustomer();
        }
    }, [open]);

    const fetchCompare = async () => {
        let values = form.getFieldsValue();
        let res = await _unitOfWork.report.compareStatusSchedulePreventiveAndBreakdownByCustomer({
            customer1: values.customer1,
            customer2: values.customer2,
        });
        if (res && res.code === 1) {
            const { customer1ScheduleData, customer2ScheduleData } = res.data?.dataSchedule;
            const { customer1BreakdownData, customer2BreakdownData } = res.data?.dataBreakdown;
            if (customer1ScheduleData.name === customer2ScheduleData.name) {
                customer1ScheduleData.name = customer1ScheduleData.name + `(1)`;
                customer2ScheduleData.name = customer2ScheduleData.name + `(2)`;
            }
            if (customer1BreakdownData.name === customer2BreakdownData.name) {
                customer1BreakdownData.name = customer1BreakdownData.name + `(1)`;
                customer2BreakdownData.name = customer2BreakdownData.name + `(2)`;
            }
            const dataScheduleCustomer1Map = [{
                customerName: customer1ScheduleData.name,
                value: customer1ScheduleData.new,
                type: t(parseToLabel(ticketSchedulePreventiveStatus.Options, 'new'))
            }, {
                customerName: customer1ScheduleData.name,
                value: customer1ScheduleData.inProgress,
                type: t(parseToLabel(ticketSchedulePreventiveStatus.Options, 'inProgress'))
            }, {
                customerName: customer1ScheduleData.name,
                value: customer1ScheduleData.overdue,
                type: t(parseToLabel(ticketSchedulePreventiveStatus.Options, 'overdue'))
            }];
            const dataScheduleCustomer2Map = [{
                customerName: customer2ScheduleData.name,
                value: customer2ScheduleData.new,
                type: t(parseToLabel(ticketSchedulePreventiveStatus.Options, 'new'))
            }, {
                customerName: customer2ScheduleData.name,
                value: customer2ScheduleData.inProgress,
                type: t(parseToLabel(ticketSchedulePreventiveStatus.Options, 'inProgress'))
            }, {
                customerName: customer2ScheduleData.name,
                value: customer2ScheduleData.overdue,
                type: t(parseToLabel(ticketSchedulePreventiveStatus.Options, 'overdue'))
            }];
            const dataBreakdownCustomer1Map = [{
                customerName: customer1BreakdownData.name,
                value: customer1BreakdownData.new,
                type: t(parseToLabel(ticketSchedulePreventiveStatus.Options, 'new'))
            }, {
                customerName: customer1BreakdownData.name,
                value: customer1BreakdownData.inProgress,
                type: t(parseToLabel(ticketSchedulePreventiveStatus.Options, 'inProgress'))
            }, {
                customerName: customer1BreakdownData.name,
                value: customer1BreakdownData.overdue,
                type: t(parseToLabel(ticketSchedulePreventiveStatus.Options, 'overdue'))
            }];
            const dataBreakdownCustomer2Map = [{
                customerName: customer2BreakdownData.name,
                value: customer2BreakdownData.new,
                type: t(parseToLabel(ticketSchedulePreventiveStatus.Options, 'new'))
            }, {
                customerName: customer2BreakdownData.name,
                value: customer2BreakdownData.inProgress,
                type: t(parseToLabel(ticketSchedulePreventiveStatus.Options, 'inProgress'))
            }, {
                customerName: customer2BreakdownData.name,
                value: customer2BreakdownData.overdue,
                type: t(parseToLabel(ticketSchedulePreventiveStatus.Options, 'overdue'))
            }];
            setDataConpareBreakdowns([...dataBreakdownCustomer1Map, ...dataBreakdownCustomer2Map]);
            setDataConpareSchedules([...dataScheduleCustomer1Map, ...dataScheduleCustomer2Map]);
        }
    };

    const fetchGetAllCustomer = async () => {
        let res = await _unitOfWork.customer.getAllCustomer();
        if (res && res.code === 1) {
            setCustomers(res?.data);
        }
    };
    const onFinish = () => {
        fetchCompare();
    };
    const configSchedule = (_data) => {
        return {
            data: _data,
            xField: 'customerName',
            yField: 'value',
            stack: true,
            colorField: 'type',
            style: {
                maxWidth: 100,
            },
            label: {
                text: 'value',
                textBaseline: 'bottom',
                position: 'inside',
            },
        };
    };
    const onClickReset = () => {
        form.setFieldsValue({
            customer1: null,
            customer2: null,
        });
        setDataConpareBreakdowns([]);
        setDataConpareSchedules([]);
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
                <span style={{ flex: 1 }}>{t("dashboardComparison.title")}</span>
            </div>
            <div className='p-3'>
                <Form
                    className="search-form"
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item id="" label={t("dashboardComparison.customer1_label")} name="customer1"
                                rules={[
                                    {
                                        required: true,
                                        message: t("dashboardComparison.customer1_required"),
                                    },
                                ]}
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t("dashboardComparison.customer1_placeholder")}
                                    options={(customers || []).map((item) => ({
                                        key: item.id,
                                        value: item.id,
                                        label: item.customerName,
                                    }))}
                                    filterOption={filterOption}
                                ></Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item id="" label={t("dashboardComparison.customer2_label")} name="customer2" rules={[
                                {
                                    required: true,
                                    message: t("dashboardComparison.customer2_required"),
                                },
                            ]}>
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t("dashboardComparison.customer2_placeholder")}
                                    options={(customers || []).map((item) => ({
                                        key: item.id,
                                        value: item.id,
                                        label: item.customerName,
                                    }))}
                                    filterOption={filterOption}
                                ></Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Button
                                type="default"
                                onClick={() => onClickReset()}
                                className="ml-2 bt-green"
                            >
                                <RetweetOutlined />
                                {t("common.reset")}
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="ml-2"
                            >
                                <SwapOutlined />
                                {t("common.compare")}
                            </Button>
                        </Col>
                    </Row>
                    {dataConpareSchedules.length > 0 && dataConpareBreakdowns.length > 0 && (
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Card title={t("dashboardComparison.schedule_status_title")}>
                                    <Row className="mt-3">
                                        <Column {...configSchedule(dataConpareSchedules)} />
                                    </Row>
                                </Card>
                            </Col>
                            <Col span={24}>
                                <Card title={t("dashboardComparison.breakdown_status_title")}>
                                    <Row className="mt-3">
                                        <Column {...configSchedule(dataConpareBreakdowns)} />
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Form>
            </div>
        </Drawer >
    );
};

export default React.memo(ComparisonDashbroardDrawer);