import React, { useEffect, useState } from "react";
import { Row, Col, Form, Select, Button, DatePicker, Drawer } from "antd";
import { dropdownRender, filterOption } from "../../../helper/search-select-helper";
import * as _unitOfWork from "../../../api";
import { FORMAT_DATE } from "../../../utils/constant";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const CardFilterSparePart = ({ open, onClose, onSearch, onReFeshFilter, valueFilter }) => {
    const { t } = useTranslation();
    const [filterForm] = Form.useForm();
    const [spareCategories, setSpareCategories] = useState([]);
    const [spareParts, setSpareParts] = useState([]);

    useEffect(() => {
        getSpareParts();
        getSpareCategories();
    }, []);

    useEffect(() => {
        filterForm.setFieldsValue({
            ...valueFilter,
            startDate: valueFilter.startDate ? dayjs(valueFilter.startDate) : null,
            endDate: valueFilter.endDate ? dayjs(valueFilter.endDate) : null,
        });
    }, [valueFilter]);

    const getSpareParts = async () => {
        const res = await _unitOfWork.sparePart.getSpareParts();
        if (res?.data) {
            setSpareParts(res.data);
        }
    };

    const getSpareCategories = async () => {
        const res = await _unitOfWork.spareCategory.getSpareCategories();
        if (res?.data) {
            setSpareCategories(res.data.results);
        }
    };

    const handleSubmit = () => {
        const values = filterForm.getFieldsValue();
        const filteredValues = Object.fromEntries(
            Object.entries(values)
                .filter(([_, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
                .map(([k, v]) => [k, v?.toDate ? v.toDate() : v])
        );
        onSearch(filteredValues);
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
                <Form className="search-form" form={filterForm} layout="vertical">
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
                        }}
                    >
                        <ArrowLeftOutlined
                            style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                            onClick={onClose}
                        />
                        <span style={{ flex: 1 }}>{t("report.filter.title")}</span>
                    </div>

                    <div style={{ padding: 16, background: '#fff' }}>
                        <Row gutter={32}>
                            <Col span={24}>
                                <Form.Item label={t("report.common.labels.spare_category")} name="spareCategoryId">
                                    <Select
                                        allowClear
                                        placeholder={t("report.common.placeholders.choose_spare_category")}
                                        showSearch
                                        options={spareCategories?.map((item) => ({
                                            value: item.id,
                                            label: item.spareCategoryName,
                                        }))}
                                        mode="multiple"
                                        dropdownStyle={dropdownRender}
                                        filterOption={filterOption}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item name="startDate" label={t("report.common.labels.from_date")}>
                                    <DatePicker
                                        placeholder={t("report.common.placeholders.choose_from_date")}
                                        format={FORMAT_DATE}
                                        style={{ width: "100%" }}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item name="endDate" label={t("report.common.labels.to_date")}>
                                    <DatePicker
                                        placeholder={t("report.common.placeholders.choose_to_date")}
                                        format={FORMAT_DATE}
                                        style={{ width: "100%" }}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={t("report.common.labels.spare_part")} name="sparePart">
                                    <Select
                                        allowClear
                                        placeholder={t("report.common.placeholders.choose_spare_part")}
                                        showSearch
                                        options={spareParts?.map((item) => ({
                                            value: item.id,
                                            label: item.sparePartsName,
                                        }))}
                                        mode="multiple"
                                        dropdownStyle={dropdownRender}
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
                            {t("report.common.buttons.reset")}
                        </Button>
                        <Button
                            block
                            onClick={handleSubmit}
                            style={{ background: '#34c38f', color: '#fff', flex: 1, height: 40, fontWeight: 500, fontSize: 16 }}
                        >
                            {t("report.common.buttons.apply")}
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </div>
    );
};

export default CardFilterSparePart;