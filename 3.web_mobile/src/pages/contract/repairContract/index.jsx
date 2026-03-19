import { useEffect, useState, useRef } from "react";
import { ArrowLeftOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Drawer, Form, Input, Row, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as _unitOfWork from "../../../api";
import { PAGINATION } from "../../../utils/constant";
import { parseDate } from "../../../helper/date-helper";
import { staticPath } from "../../../router/RouteConfig";

export default function RepairContractMobile() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [totalRecord, setTotalRecord] = useState(0);
    const [page, setPage] = useState(1);
    const [openFilter, setOpenFilter] = useState(false);
    const [searchForm] = Form.useForm();
    const contentRef = useRef(null);

    useEffect(() => {
        fetchContracts(1);
    }, []);

    useEffect(() => {
        if (page > 1) fetchContracts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    useEffect(() => {
        const div = contentRef.current;
        if (!div) return;
        const handleScroll = () => {
            const bottom = div.scrollHeight - div.scrollTop <= div.clientHeight + 100;
            if (bottom && contracts.length < totalRecord) {
                const nextPage = page + 1;
                const totalLoaded = (nextPage - 1) * PAGINATION.limit;
                if (totalLoaded < totalRecord) setPage(nextPage);
            }
        };
        div.addEventListener("scroll", handleScroll);
        return () => div.removeEventListener("scroll", handleScroll);
    }, [contracts, totalRecord, page]);

    const fetchContracts = async (_page) => {
        const payload = {
            page: _page || page,
            limit: PAGINATION.limit,
            ...searchForm.getFieldsValue(),
        };
        const res = await _unitOfWork.repairContract.getListRepairContracts(payload);
        if (res && res.code === 1) {
            if (payload.page > 1) {
                setContracts((prev) => [...prev, ...(res.repairContracts || [])]);
            } else {
                setContracts(res.repairContracts || []);
            }
            setTotalRecord(res.totalResults || 0);
        }
    };

    const onDetail = (record) => {
        navigate(staticPath.viewRepairContract + "/" + (record.id || record._id));
    };

    const onSearch = () => {
        setPage(1);
        fetchContracts(1);
        setOpenFilter(false);
    };

    const resetSearch = () => {
        searchForm.resetFields();
        setPage(1);
        fetchContracts(1);
        setOpenFilter(false);
    };

    return (
        <div style={{ background: "#f8f8f8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Sticky Header */}
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    background: "#23457b",
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px",
                    fontWeight: 600,
                    fontSize: 20,
                    color: "#fff",
                }}
            >
                <div style={{ display: "flex", alignItems: "center" }}>
                    <ArrowLeftOutlined
                        style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
                        onClick={() => navigate(-1)}
                    />
                    <span>{t("menu.contract.repair")}</span>
                </div>
                {/* 
                <Button type="link" style={{ color: "#fff", padding: 0 }} onClick={() => setOpenFilter(true)}>
                    <SearchOutlined />
                </Button> */}
            </div>

            {/* Content */}
            <div
                ref={contentRef}
                style={{
                    background: "#f5f5f5",
                    maxHeight: "calc(100vh - 56px)",
                    overflowY: "auto",
                    padding: "8px",
                }}
            >
                {contracts.map((item, idx) => (
                    <Card
                        key={item._id || item.id || idx}
                        className="mb-2"
                        bodyStyle={{ padding: 12 }}
                        onClick={() => onDetail(item)}
                    >
                        <Row align="middle">
                            <Col span={20}>
                                <div>
                                    <b>{t("amc.manager.table.contract_no")}: </b>
                                    {item?.contractNo}
                                </div>
                                <div>
                                    <b>{t("calibration_contract.service_contractor")}: </b>
                                    {item?.serviceContractor?.serviceContractorName}
                                </div>
                                <div>
                                    <b>{t("amc.manager.table.customer")}: </b>
                                    {item?.customer?.customerName}
                                </div>
                                <div>
                                    <b>{t("calibration_contract.expiration_date")}: </b>
                                    {parseDate(item?.expirationDate)}
                                </div>
                            </Col>
                        </Row>
                    </Card>
                ))}

                {contracts.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                        {t("common.no_data") || "Không có dữ liệu"}
                    </div>
                )}
            </div>

            <Drawer
                title={t("amc.manager.filter.title") || "Tìm kiếm"}
                placement="right"
                onClose={() => setOpenFilter(false)}
                open={openFilter}
                width={300}
            >
                <Form form={searchForm} layout="vertical" onFinish={onSearch}>
                    <Form.Item
                        label={t("orderPurchase.form.fields.contract_number")}
                        name="contractNo"
                    >
                        <Input placeholder={t("amc.form.contract_no_placeholder")} />
                    </Form.Item>

                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                            {t("preventive.buttons.search")}
                        </Button>
                        <Button className="bt-green" onClick={resetSearch} icon={<RedoOutlined />}>
                            {t("preventive.buttons.reset")}
                        </Button>
                    </Space>
                </Form>
            </Drawer>
        </div>
    );
}