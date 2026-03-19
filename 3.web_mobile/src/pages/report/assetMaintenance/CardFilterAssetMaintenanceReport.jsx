import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Select, Button, Drawer } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import * as _unitOfWork from "../../../api";
import { dropdownRender, filterOption } from '../../../helper/search-select-helper';
import { useTranslation } from "react-i18next";

const { Option } = Select;

const CardFilterAssetMaintenanceReport = ({ open, onClose, onSearch, onReFeshFilter }) => {
    const { t } = useTranslation();
    const [filterForm] = Form.useForm();
    const [assetStyle, setAssetStyle] = useState(null);
    const [categories, setCategories] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [assets, setAssets] = useState([]);
    const [assetModels, setAssetModels] = useState([]);
    const [assetMaintenances, setAssetMaintenances] = useState([]);

    useEffect(() => {
        initData();
    }, []);

    const initData = async () => {
        const customersRes = await _unitOfWork.customer.getAllCustomer();
        if (customersRes?.data) setCustomers(customersRes.data);

        const buildingsRes = await _unitOfWork.building.getAllBuilding();
        if (buildingsRes?.data) setBuildings(buildingsRes.data);

        const floorsRes = await _unitOfWork.floor.getAllFloor();
        if (floorsRes?.data) setFloors(floorsRes.data);

        const departmentsRes = await _unitOfWork.department.getAllDepartment();
        if (departmentsRes?.data) setDepartments(departmentsRes.data);

        const manufacturersRes = await _unitOfWork.manufacturer.getAllManufacturer();
        if (manufacturersRes?.data) setManufacturers(manufacturersRes.data);

        const assetsRes = await _unitOfWork.asset.getAllAsset();
        if (assetsRes?.data) setAssets(assetsRes.data);

        const assetModelsRes = await _unitOfWork.assetModel.getAllAssetModel();
        if (assetModelsRes?.data) setAssetModels(assetModelsRes.data);

        const assetMaintenancesRes = await _unitOfWork.assetMaintenance.getAllAssetMaintenance();
        if (assetMaintenancesRes?.data) setAssetMaintenances(assetMaintenancesRes.data);

        const categoryRes = await _unitOfWork.category.getAllCategory();
        if (categoryRes) setCategories(categoryRes?.data);
    };

    const handleSubmit = () => {
        const values = filterForm.getFieldsValue();
        const filteredValues = Object.fromEntries(
            Object.entries(values)
                .filter(([_, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
                .map(([k, v]) => [
                    k,
                    v && v.format ? v.format("YYYY-MM-DD") : v,
                ])
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
                        <span style={{ flex: 1 }}>{t("report.filter.title")}</span>
                    </div>

                    <div style={{ padding: 16, background: '#fff' }}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item label={t("report.common.labels.asset_type")} name="assetStyle">
                                    <Select
                                        allowClear
                                        placeholder={t("report.common.placeholders.choose_asset_type")}
                                        onChange={(value) => setAssetStyle(value)}
                                    >
                                        <Option value="1">{t("report.assetMaintenanceReport.columns.category")}</Option>
                                        <Option value="2">{t("report.assetMaintenanceReport.columns.category")}</Option>
                                        <Option value="3">{t("report.assetMaintenanceReport.columns.category")}</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={t("report.common.labels.customer_name")} name="customer">
                                    <Select
                                        allowClear
                                        mode="multiple"
                                        placeholder={t("report.common.placeholders.choose_customer")}
                                        showSearch
                                        options={customers?.map((item) => ({
                                            value: item._id,
                                            label: item.customerName,
                                        }))}
                                        dropdownStyle={dropdownRender}
                                        filterOption={filterOption}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={t("report.common.labels.building")} name="building">
                                    <Select
                                        allowClear
                                        mode="multiple"
                                        placeholder={t("report.common.placeholders.choose_building")}
                                        showSearch
                                        options={buildings?.map((item) => ({
                                            value: item.id,
                                            label: item.buildingName,
                                        }))}
                                        dropdownStyle={dropdownRender}
                                        filterOption={filterOption}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={t("report.common.labels.floor")} name="floor">
                                    <Select
                                        allowClear
                                        mode="multiple"
                                        placeholder={t("report.common.placeholders.choose_floor")}
                                        showSearch
                                        options={floors?.map((item) => ({
                                            value: item.id,
                                            label: item.floorName,
                                        }))}
                                        dropdownStyle={dropdownRender}
                                        filterOption={filterOption}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={t("report.common.labels.department")} name="department">
                                    <Select
                                        allowClear
                                        mode="multiple"
                                        placeholder={t("report.common.placeholders.choose_department")}
                                        showSearch
                                        options={departments?.map((item) => ({
                                            value: item.id,
                                            label: item.departmentName,
                                        }))}
                                        dropdownStyle={dropdownRender}
                                        filterOption={filterOption}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={t("report.common.labels.category")} name="category">
                                    <Select
                                        allowClear
                                        mode="multiple"
                                        placeholder={t("report.common.placeholders.choose_category")}
                                        showSearch
                                        options={categories?.map((item) => ({
                                            value: item.id,
                                            label: item.categoryName,
                                        }))}
                                        dropdownStyle={dropdownRender}
                                        filterOption={filterOption}
                                    />
                                </Form.Item>
                            </Col>

                            {assetStyle !== 3 && (
                                <Col span={24}>
                                    <Form.Item label={t("report.common.labels.manufacturer")} name="manufacturer">
                                        <Select
                                            allowClear
                                            mode="multiple"
                                            placeholder={t("report.common.placeholders.choose_manufacturer")}
                                            showSearch
                                            options={manufacturers?.map((item) => ({
                                                value: item.id,
                                                label: item.manufacturerName,
                                            }))}
                                            dropdownStyle={dropdownRender}
                                            filterOption={filterOption}
                                        />
                                    </Form.Item>
                                </Col>
                            )}

                            <Col span={24}>
                                <Form.Item label={t("report.common.labels.asset_name")} name="asset">
                                    <Select
                                        allowClear
                                        mode="multiple"
                                        placeholder={t("report.common.placeholders.choose_asset_name")}
                                        showSearch
                                        options={assets?.map((item) => ({
                                            value: item.id,
                                            label: item.assetName,
                                        }))}
                                        dropdownStyle={dropdownRender}
                                        filterOption={filterOption}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={t("report.common.labels.asset_model")} name="assetModel">
                                    <Select
                                        allowClear
                                        mode="multiple"
                                        placeholder={t("report.common.placeholders.choose_asset_model")}
                                        showSearch
                                        options={assetModels?.map((item) => ({
                                            value: item.id,
                                            label: item.assetModelName,
                                        }))}
                                        dropdownStyle={dropdownRender}
                                        filterOption={filterOption}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={t("report.common.labels.asset_id")} name="assetMaintenance">
                                    <Select
                                        allowClear
                                        mode="multiple"
                                        placeholder={t("report.common.placeholders.choose_asset_id")}
                                        showSearch
                                        options={assetMaintenances?.map((item) => ({
                                            value: item.id,
                                            label: item.serial,
                                        }))}
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

export default CardFilterAssetMaintenanceReport;