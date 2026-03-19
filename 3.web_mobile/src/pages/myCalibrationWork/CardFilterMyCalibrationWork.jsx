import React from 'react';
import { Row, Col, Form, Select, Button, Input, DatePicker, Drawer } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { FORMAT_DATE } from '../../utils/constant';
import { priorityType, schedulePreventiveTaskAssignUserStatus } from '../../utils/schedulePreventive.constant';
import { filterOption } from '../../helper/search-select-helper';
import { useTranslation } from 'react-i18next';

const CardFilterMyCalibrationWork = ({ open, onClose, onSearch, onReFeshFilter }) => {
    const { t } = useTranslation();
    const [filterForm] = Form.useForm();
    const handleSubmit = () => {
        const values = filterForm.getFieldsValue();
        if (values.startDate) values.startDate = values.startDate.format("YYYY-MM-DD");
        if (values.endDate) values.endDate = values.endDate.format("YYYY-MM-DD");
        onSearch(values);
        onClose();
    };
    const handleReset = () => {
        filterForm.resetFields();
        onReFeshFilter();
    };
    return (
        <div style={{ background: '#f8f8f8' }}>
            <Drawer
                placement="right"
                closable={false}
                open={open}
                width="100%"
                bodyStyle={{ padding: 0 }}
            >
                <Form
                    className="search-form"
                    form={filterForm}
                    layout="vertical"
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
                            fontSize: 20
                        }}
                    >
                        <ArrowLeftOutlined
                            style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                            onClick={onClose}
                        />
                        <span style={{ flex: 1 }}>{t("preventive.filter.title")}</span>
                    </div>

                    <div style={{ padding: 16, background: '#fff' }}>
                        <Row >
                            <Col span={24}>
                                <Form.Item label={t("myTask.myTask.search.code")} name="code">
                                    <Input placeholder={t("preventive.filter.placeholders.code")} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t("myTask.myTask.search.task_name")} name="calibrationName">
                                    <Input placeholder={t("preventive.filter.placeholders.task_name")} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t("myTask.myTask.search.serial")} name="serial">
                                    <Input placeholder={t("preventive.filter.placeholders.serial")} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t("myTask.myTask.search.model")} name="assetModelName">
                                    <Input placeholder={t("preventive.filter.placeholders.model")} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t("myTask.myTask.search.asset_name")} name="assetName">
                                    <Input placeholder={t("preventive.filter.placeholders.asset_name")} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={t("myTask.myTask.search.status")}
                                    name="schedulePreventiveTaskAssignUserStatus"
                                >
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder={t("preventive.filter.placeholders.status")}
                                        options={(schedulePreventiveTaskAssignUserStatus.Options || []).map((item) => ({
                                            value: item.value,
                                            label: t(item.label),
                                        }))}
                                        filterOption={filterOption}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item name="startDate" label={t("myTask.myTask.search.start_date_from")}>
                                    <DatePicker
                                        placeholder={t("preventive.filter.placeholders.start_date")}
                                        format={FORMAT_DATE}
                                        style={{ width: "100%" }}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="endDate" label={t("myTask.myTask.search.end_date_to")}>
                                    <DatePicker
                                        placeholder={t("preventive.filter.placeholders.end_date")}
                                        format={FORMAT_DATE}
                                        style={{ width: "100%" }}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={t("myTask.myTask.search.priority")}
                                    name="importance"
                                >
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder={t("preventive.filter.placeholders.priority")}
                                        options={(priorityType.Option || []).map((item) => ({
                                            value: item.value,
                                            label: t(item.label),
                                        }))}
                                        filterOption={filterOption}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: 16,
                            gap: 12,
                            background: '#fff',
                            position: 'sticky',
                            bottom: 0,
                        }}
                    >
                        <Button
                            block
                            onClick={handleReset}
                            style={{ background: '#34c38f', color: '#fff', flex: 1, height: 40, fontWeight: 500, fontSize: 16 }}
                        >
                            {t("preventive.filter.buttons.clear")}
                        </Button>
                        <Button
                            block
                            onClick={handleSubmit}
                            style={{ background: '#34c38f', color: '#fff', flex: 1, height: 40, fontWeight: 500, fontSize: 16 }}
                        >
                            {t("preventive.filter.buttons.apply")}
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </div>
    );
};

export default CardFilterMyCalibrationWork;