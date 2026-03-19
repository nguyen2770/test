import React, { useEffect, useRef, useState } from 'react';
import useHeader from '../../../contexts/headerContext';
import { Button, Card, Col, DatePicker, Form, Pagination, Row, Table, Tooltip } from 'antd';
import { ArrowLeftOutlined, FilterOutlined, MenuOutlined, PieChartOutlined, PrinterOutlined, RedoOutlined, SearchOutlined, SlidersOutlined } from '@ant-design/icons';
import { breakdownStatus, FORMAT_DATE, PAGINATION, priorityLevelStatus, reportView, schedulePreventiveStatus, typeReportAssetMaintenanceResquest } from '../../../utils/constant';
import dayjs from 'dayjs';
import * as _unitOfWork from "../../../api"
import ShowError from '../../../components/modal/result/errorNotification';
import { formatMillisToHHMMSS, parseDate } from '../../../helper/date-helper';
import { parseToLabel } from '../../../helper/parse-helper';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cleanEmptyValues } from '../../../helper/check-search-value';
import DrawerSearch from '../../../components/drawer/drawerSearch';
import { exportToExcel, transformColumnsForExcel } from '../exportToExcel/exportData';

const ReportAssetMaintenanceRequest = () => {
    const { t } = useTranslation();
    const { setHeaderTitle } = useHeader();
    const [form] = Form.useForm();
    const [page, setPage] = useState(1);
    const [totalRecord, setTotalRecord] = useState(0);
    const [datas, setDatas] = useState([]);
    const navigate = useNavigate();
    const [totalBreakdown, setTotalBreakdown] = useState(null)
    const [totalSchedulePreventive, setTotalSchedulePreventive] = useState(null);
    const [isOpenSearchAdvanced, setIsOpenSearchAdvanced] = useState(false);
    const [searchFilter, setSearchFilter] = useState({});
    const drawerRef = useRef();
    useEffect(() => {
        setHeaderTitle(t("report.maintenanceRequest.title"))
    }, []);

    useEffect(() => {
        if (page > 1) {
            fetchAssetMaintenanceRequests(page, searchFilter);
        } else { fetchAssetMaintenanceRequests(1, searchFilter); }
    }, [page]);

    const fetchAssetMaintenanceRequests = async (_page, searchValue) => {
        let filterValue = cleanEmptyValues(searchValue || {});
        const value = form.getFieldsValue();
        if (value.startDate === null || value.endDate === null) {
            return ShowError('topRight', t("common.notifications"), t("common.messages.fill_in_complete_date"))
        }
        let res = await _unitOfWork.reportAssetMaintenanceRequest.getReportAssetMaintenanceRequest({
            page: _page || page,
            limit: PAGINATION.limit,
            startDate: value.startDate,
            endDate: value.endDate,
            ...filterValue,
        })
        if (res && res.code === 1) {
            setDatas(res?.data);
            setTotalRecord(res?.totalResults)
            setTotalBreakdown(res?.totalBreakdown)
            setTotalSchedulePreventive(res?.totalSchedulePreventive)
        }
    }
    const resetSearch = () => {
        setSearchFilter({});
        if (drawerRef.current)
            drawerRef.current.resetForm();
        setPage(1);
        fetchAssetMaintenanceRequests(1);
    };
    const onFinish = async () => {
        setPage(1);
        fetchAssetMaintenanceRequests(1, searchFilter);
    }
    const onChangePagination = (value) => {
        setPage(value);
    };
    const handleExportExcel = async () => {
        const value = form.getFieldsValue();
        if (value.startDate === null || value.endDate === null) {
            return ShowError('topRight', t("common.notifications"), t("common.messages.fill_in_complete_date"))
        }
        try {
            const payload = {
                page: 1,
                limit: totalRecord,
                startDate: value.startDate,
                endDate: value.endDate,
                ...cleanEmptyValues(searchFilter),
            };
            const res = await _unitOfWork.reportAssetMaintenanceRequest.getReportAssetMaintenanceRequest(payload);
            const list = res?.data;

            const processedData = prepareDataForExcel(list, t);
            const excelCols = [
                { header: t("customer.export.index"), key: "stt" },
                ...transformColumnsForExcel(columns),
            ];
            exportToExcel(processedData, excelCols, "BaoCao.xlsx", t);
        } catch (error) {
            console.error("Lỗi xuất Excel: ", error);
        }
    };
    const prepareDataForExcel = (list, t) => {
        return list.map(item => {
            const priorityPreventiveName = item.type === typeReportAssetMaintenanceResquest.schedulePreventive
                ? (item?.preventive?.preventiveName || "-")
                : t(parseToLabel(priorityLevelStatus.Options, item?.priorityLevel) || "-");
            const statusLabel = item.type === typeReportAssetMaintenanceResquest.schedulePreventive
                ? schedulePreventiveStatus.Options
                : breakdownStatus.Option;
            return {
                ...item,
                type: t(parseToLabel(typeReportAssetMaintenanceResquest.Options, item?.type)),
                ["priority-preventiveName"]: priorityPreventiveName,
                status: t(parseToLabel(statusLabel, item?.status)),
            }
        });
    }

    const columns = [
        {
            title: t("report.assetMaintenanceReport.columns.index"),
            dataIndex: "id",
            key: "id",
            width: "60px",
            align: "center",
            render: (_text, _record, index) => (page - 1) * PAGINATION.limit + index + 1,
        },
        {
            title: t("report.maintenanceRequest.columns.code"),
            dataIndex: "code",
            key: "code",
        },
        {
            title: t("report.maintenanceRequest.columns.type"),
            dataIndex: "type",
            key: "type",
            render: (text) => t(parseToLabel(typeReportAssetMaintenanceResquest.Options, text))
        },
        {
            title: t("report.maintenanceRequest.columns.priority_or_name"),
            excelKey: "priority-preventiveName",
            render: (_, record) => {
                if (record.type === typeReportAssetMaintenanceResquest.schedulePreventive) {
                    return <span>{record?.preventive?.preventiveName || "-"}</span>;
                }
                return <span>{t(parseToLabel(priorityLevelStatus.Options, record?.priorityLevel) || "-")}</span>;
            }
        },
        {
            title: t("report.maintenanceRequest.columns.status"),
            dataIndex: "status",
            render: (_, record) => {
                const statusOptions = record.type === typeReportAssetMaintenanceResquest.schedulePreventive
                    ? schedulePreventiveStatus.Options
                    : breakdownStatus.Option;

                return t(parseToLabel(statusOptions, record.status));
            }
        }
        ,
        {
            title: t("report.maintenanceRequest.columns.work_order_date"),
            dataIndex: "startDate",
            align: 'center',
            render: (_, record) => parseDate(record.startDate || record.createdAt)
        },
        {
            title: t("report.maintenanceRequest.columns.closing_date"),
            dataIndex: "closingDate",
            align: 'center',
            render: (text) => parseDate(text)
        },
    ];
    const optionStatusFieldsConfig = [
        ...schedulePreventiveStatus.Options,
        ...breakdownStatus.Option,
    ]
    const fieldsConfig = [
        {
            name: "code",
            labelKey: "report.maintenanceRequest.columns.code",
            placeholderKey: "report.maintenanceRequest.columns.code",
            component: "Input",
        },
        {
            name: "type",
            labelKey: "report.maintenanceRequest.columns.type",
            placeholderKey: "report.maintenanceRequest.columns.type",
            component: "Select",
            options: [
                {
                    label: "preventiveSchedule.view.labels.breakdown",
                    value: "breakdown",
                },
                {
                    label: "modal.preventiveAssignUser.columns.task",
                    value: "schedulePreventive",
                },
            ]
        },
        {
            name: "priority",
            labelKey: "report.processingBreakdown.detail_columns.priority",
            placeholderKey: "report.processingBreakdown.detail_columns.priority",
            component: "Select",
            options: "priorityLevelStatus"
        },
        {
            name: "preventiveName",
            labelKey: "schedulePreventiveTask.columns.name",
            placeholderKey: "schedulePreventiveTask.columns.name",
            component: "Input",
        },
        {
            name: "status",
            labelKey: "report.maintenanceRequest.columns.status",
            placeholderKey: "report.maintenanceRequest.columns.status",
            component: "Select",
            options: optionStatusFieldsConfig,
        },
    ];

    return (
        <Card className='p-3'>
            <Form form={form} onFinish={onFinish}
                initialValues={{
                    startDate: dayjs().subtract(9, "day").startOf("day"),
                    endDate: dayjs().endOf("day"),
                }}
                layout="vertical"
            >
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Form.Item name="startDate" label={t("report.common.labels.from_date")} >
                            <DatePicker
                                placeholder={t("report.common.placeholders.choose_from_date")}
                                format={FORMAT_DATE}
                                style={{ width: "100%" }}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="endDate" label={t("report.common.labels.to_date")}>
                            <DatePicker
                                placeholder={t("report.common.placeholders.choose_to_date")}
                                format={FORMAT_DATE}
                                style={{ width: "100%" }}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8} style={{ textAlign: 'end', fontSize: 18, fontWeight: 600 }}>
                        {/* <Tooltip title={t("report.common.misc.add_column")} className='mr-4'>
                            <MenuOutlined />
                        </Tooltip> */}
                        <Tooltip
                            title={t("report.common.misc.export")}
                            className='mr-4'
                            onClick={() => handleExportExcel()}
                        >
                            <PrinterOutlined />
                        </Tooltip>
                        <Tooltip
                            title={t("report.common.misc.advanced_search")}
                            className='mr-4'
                            onClick={() => setIsOpenSearchAdvanced(true)}
                        >
                            <FilterOutlined />
                        </Tooltip>
                        {/* <Tooltip title={t("report.common.misc.customize_report")} className='mr-4'>
                            <SlidersOutlined />
                        </Tooltip> */}
                    </Col>
                    <Col span={16}
                        style={{ display: "flex", alignItems: "center", marginBottom: 3 }}
                    >
                        <Button
                            onClick={() => navigate(-1)}
                            icon=<ArrowLeftOutlined />>
                            {t("report.common.buttons.back")}
                        </Button>
                        <Button type="primary" icon={<SearchOutlined />} className='ml-2' htmlType='submit'>{t("report.common.buttons.search")} </Button>
                        <Button
                            className="bt-green ml-2"
                            onClick={resetSearch}
                        >
                            <RedoOutlined />
                            {t("purchase.buttons.reset")}
                        </Button>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col span={16}>
                        <Card
                            bordered
                            style={{ borderRadius: 10 }}
                            title={
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <PieChartOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                                    <span style={{ color: "#1890ff", fontWeight: "600" }}>
                                        {t("report.common.misc.summary_estimate")}
                                    </span>
                                </div>
                            }
                        >
                            <Row justify="space-between" align="middle">
                                <Col style={{ textAlign: "center" }} span={8}>
                                    <div style={{ fontSize: 14, fontWeight: 500, }}>{t("report.maintenanceRequest.summary_card.est_total")}</div>
                                    <div style={{ fontSize: 16, fontWeight: 600 }}>{totalRecord || 0}</div>
                                </Col>
                                <Col style={{ textAlign: "center" }} span={8}>
                                    <div style={{ fontSize: 14, fontWeight: 500 }}>{t("report.maintenanceRequest.summary_card.total_jobs")}</div>
                                    <div style={{ fontSize: 16, fontWeight: 600 }}>{totalSchedulePreventive || 0}</div>
                                </Col>
                                <Col style={{ textAlign: "center" }} span={8}>
                                    <div style={{ fontSize: 14, fontWeight: 500 }}>{t("report.maintenanceRequest.summary_card.total_breakdowns")}</div>
                                    <div style={{ fontSize: 16, fontWeight: 600 }}>{totalBreakdown || 0}</div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col span={24}>
                        <Table
                            rowKey="id"
                            columns={columns}
                            key="id"
                            dataSource={datas}
                            bordered
                            pagination={false}
                        />
                        <Pagination
                            className="pagination-table mt-2"
                            onChange={onChangePagination}
                            pageSize={PAGINATION.limit}
                            total={totalRecord}
                            current={page}
                        />
                    </Col>
                </Row>
                <DrawerSearch
                    isOpen={isOpenSearchAdvanced}
                    ref={drawerRef}
                    onCallBack={(value) => {
                        // searchForm.resetFields(["searchValue"]);
                        setSearchFilter(value);
                        if (!value.isClose) {
                            setPage(1);
                            fetchAssetMaintenanceRequests(1, value);
                        }
                    }}
                    onClose={() => { setIsOpenSearchAdvanced(false) }}
                    fieldsConfig={fieldsConfig}
                />
            </Form>
        </Card>
    );
};

export default ReportAssetMaintenanceRequest;