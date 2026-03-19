import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, message, Form, Select, Button, Input, DatePicker, Divider, Drawer } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import * as _unitOfWork from "../../api";
import { assetType, priorityLevelStatus } from '../../utils/constant';
import { dropdownRender, filterOption } from '../../helper/search-select-helper';
import { useTranslation } from 'react-i18next';

const CardFilter = ({ open, onClose, onSearch, onReFeshFilter }) => {
    const [filterForm] = Form.useForm();
    const [customers, setCustomers] = useState([]);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [serviceSubCategorys, setServiceSubCategorys] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [categorys, setCategorys] = useState([]);
    const [assets, setAssets] = useState([]);
    const [assetMaintenances, setAssetMaintenances] = useState([]);
    const [assetModels, setAssetModels] = useState([]);
    const { t } = useTranslation()

    useEffect(() => {
        fetchGetAllCustomer();
        fetchGetAllServiceCategory();
        fetchGetAllManfacturers();
        fetchGetAllCategory();
        fetchGetAllAsset();
        fetchGetAllAssetMaintenance();
        fetchGetAllAssetModel();
        fetchGetAllServiceSubCategory();
    }, [])

    const fetchGetAllCategory = async () => {
        let res = await _unitOfWork.category.getAllCategory();
        if (res && res.code === 1) {
            setCategorys(res.data);
        }
    }
    const fetchGetAllAssetModel = async () => {
        let res = await _unitOfWork.assetModel.getAllAssetModel();
        if (res && res.code === 1) {
            setAssetModels(res.data);
        }
    }
    const fetchGetAllAssetMaintenance = async () => {
        let res = await _unitOfWork.assetMaintenance.getAllAssetMaintenance();
        if (res && res.code === 1) {
            setAssetMaintenances(res.data);
        }
    }
    const fetchGetAllAsset = async () => {
        let res = await _unitOfWork.asset.getAllAsset();
        if (res && res.code === 1) {
            setAssets(res.data);
        }
    }
    const fetchGetAllCustomer = async () => {
        let res = await _unitOfWork.customer.getAllCustomer();
        if (res && res.code === 1) {
            setCustomers(res.data);
        }
    }
    const fetchGetAllServiceCategory = async () => {
        let res = await _unitOfWork.serviceCategory.getAllServiceCategories();
        if (res && res.code === 1) {
            setServiceCategories(res.data);
        }
    }
    const fetchGetAllServiceSubCategory = async () => {
        let res = await _unitOfWork.serviceSubCategory.getAllServiceSubCategories();
        if (res && res.code === 1) {
            setServiceSubCategorys(res.data);
        }
    }
    const fetchGetAllManfacturers = async () => {
        let res = await _unitOfWork.manufacturer.getAllManufacturer();
        if (res && res.code === 1) {
            setManufacturers(res.data);
        }
    };

    const handleSubmit = () => {
        const values = filterForm.getFieldsValue();
        if (values.startDate) values.startDate = values.startDate.format("YYYY-MM-DD");
        if (values.endDate) values.endDate = values.endDate.format("YYYY-MM-DD");
        onSearch(values); // Gửi về cha
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
                            fontSize: 20,
                            boxSizing: 'border-box',
                        }}
                    >
                        <ArrowLeftOutlined
                            style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                            onClick={onClose}
                        />
                        <span style={{ flex: 1 }}>{t("modal.assetSelect.filter")}</span>
                    </div>

                    {/* Chọn ngày */}
                    <div style={{ padding: 16, background: '#fff' }}>
                        <Row >
                            <Col span={24}>
                                <Form.Item
                                    id=""
                                    labelAlign="left"
                                    label={t("modal.assetSelect.search.asset_style")}
                                    name="assetStyles"
                                >
                                    <Select
                                        size='large'
                                        showSearch
                                        allowClear
                                        placeholder={t("modal.assetSelect.search.asset_style_placeholder")}
                                        options={(assetType.Options || []).map((item) => ({
                                            key: item.value,
                                            value: item.value,
                                            label: t(item.label),
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                        dropdownStyle={dropdownRender}
                                    ></Select>

                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={t("modal.assetSelect.search.customer_name")}
                                    name="customers"
                                    labelAlign="left"
                                >
                                    <Select
                                        size='large'
                                        placeholder={t("modal.assetSelect.search.customer_name_placeholder")}
                                        showSearch
                                        allowClear
                                        options={(customers || []).map((item) => ({
                                            value: item.id,
                                            label:
                                                item.customerName +
                                                (item.contactNumber
                                                    ? ` - ( ${item.contactNumber} )`
                                                    : ""),
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                        dropdownStyle={dropdownRender}
                                    />
                                </Form.Item>
                            </Col>
                            {/* <Col span={24}>
                                <Form.Item
                                    label="Tình trạng công việc kỹ sư"
                                    name="breakdownAssignUserStatuses"
                                    labelAlign="left"
                                >
                                    <Select
                                        showSearch
                                        allowClear
                                        size='large'
                                        placeholder="Chọn tình trạng công việc"
                                        options={(progressStatus.Option || []).map((item) => ({
                                            value: item.value,
                                            label: item.label,
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                        dropdownStyle={dropdownRender}
                                    />
                                </Form.Item>
                            </Col> */}
                            <Col span={24}>
                                <Form.Item
                                    name="serviceCategory"
                                    label={t("breakdown.create.fields.service_category")}
                                >
                                    <Select
                                        size='large'
                                        allowClear
                                        placeholder={t("modal.assetSelect.search.service_category_placeholder")}
                                        showSearch
                                        options={serviceCategories?.map((item) => ({
                                            value: item.id,
                                            label: item.serviceCategoryName,
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                        dropdownStyle={dropdownRender}
                                    ></Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={t("modal.assetSelect.search.service_sub_category")}
                                    name="subServiceCategorys"
                                    labelAlign="left"
                                >
                                    <Select
                                        size='large'
                                        placeholder={t("modal.assetSelect.search.sub_category_placeholder")}
                                        showSearch
                                        allowClear
                                        options={(serviceSubCategorys || []).map((item) => ({
                                            value: item.id,
                                            label: item.serviceSubCategoryName,
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                        dropdownStyle={dropdownRender}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    id=""
                                    labelAlign="left"
                                    label={t("modal.assetSelect.search.manufacturer")}
                                    name="manufacturers"
                                >
                                    <Select
                                        size='large'
                                        allowClear
                                        placeholder={t("modal.assetSelect.search.manufacturer_placeholder")}
                                        showSearch
                                        options={manufacturers?.map((item) => ({
                                            value: item.id,
                                            label: item.manufacturerName,
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                    ></Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    id=""
                                    labelAlign="left"
                                    label={t("modal.assetSelect.search.category")}
                                    name="categorys"
                                >
                                    <Select
                                        size='large'
                                        allowClear
                                        placeholder={t("modal.assetSelect.search.category_placeholder")}
                                        showSearch
                                        options={categorys?.map((item) => ({
                                            value: item.id,
                                            label: item.categoryName,
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                    ></Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    id=""
                                    labelAlign="left"
                                    label={t("modal.assetSelect.search.asset")}
                                    name="assets"
                                >
                                    <Select
                                        size='large'
                                        allowClear
                                        placeholder={t("modal.assetSelect.search.asset_placeholder")}
                                        showSearch
                                        options={assets?.map((item) => ({
                                            value: item.id,
                                            label: item.assetName,
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                    ></Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    id=""
                                    labelAlign="left"
                                    label={t("modal.assetSelect.search.asset_model")}
                                    name="assetModels"
                                >
                                    <Select
                                        size='large'
                                        allowClear
                                        placeholder={t("modal.assetSelect.search.asset_model_placeholder")}
                                        showSearch
                                        options={assetModels?.map((item) => ({
                                            value: item.id,
                                            label: item.assetModelName,
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                    ></Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    id=""
                                    labelAlign="left"
                                    label={t("modal.assetSelect.search.serial")}
                                    name="assetMaintenances"
                                >
                                    <Select
                                        size='large'
                                        allowClear
                                        placeholder={t("modal.assetSelect.search.serial_placeholder")}
                                        showSearch
                                        options={assetMaintenances?.map((item) => ({
                                            value: item.id,
                                            label: item.serial,
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                    ></Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={t("modal.assetSelect.search.priority")}
                                    name="priorityLevels"
                                    labelAlign="left"
                                >
                                    <Select
                                        size='large'
                                        placeholder={t("modal.assetSelect.search.priority_placeholder")}
                                        options={(priorityLevelStatus.Options || []).map((item) => ({
                                            value: item.value,
                                            label: t(item.label),
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                        dropdownStyle={dropdownRender}
                                    />
                                </Form.Item>
                            </Col>
                            <Divider>{t("modal.assetSelect.divider")}</Divider>
                            <Col span={24}>
                                <Form.Item
                                    label={t("modal.assetSelect.search.dateRange.from")}
                                    name="startDate"
                                    labelAlign="left"
                                >
                                    <DatePicker
                                        size='large'
                                        placeholder={t("modal.assetSelect.search.dateRange.from_placeholder")}
                                        format="DD-MM-YYYY"
                                        style={{ width: "100%" }}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={t("modal.assetSelect.search.dateRange.to")}
                                    name="endDate"
                                    labelAlign="left"
                                >
                                    <DatePicker style={{ width: '100%' }} placeholder={t("modal.assetSelect.search.dateRange.to_placeholder")} format="DD/MM/YYYY" size='large' />
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
                            {t("modal.common.buttons.clear")}
                        </Button>
                        <Button
                            block
                            onClick={handleSubmit}
                            style={{ background: '#34c38f', color: '#fff', flex: 1, height: 40, fontWeight: 500, fontSize: 16 }}
                        >
                            {t("modal.common.buttons.submit")}
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </div>

    );
};

export default CardFilter;