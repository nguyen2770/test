import React, { useEffect, useRef, useState } from "react";
import { Card, Button, Typography, message, Spin, Empty } from "antd";
import { ArrowLeftOutlined, PlusOutlined, QrcodeOutlined } from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as _unitOfWork from "../../../api";
import { assetModelSpareRequestCategory, PAGINATION } from "../../../utils/constant";
import useAuth from "../../../contexts/authContext";
import { useTranslation } from "react-i18next";
import CreateBreakdownSpareRequest from "./CreateBreakdownSpareRequest";
import DetailBreakdownSpareRequest from "./DetailBreakdownSpareRequest";
import QrScannerModal from "../../../components/modal/QrScannerModal";
import "./index.scss";
import { parseDate } from "../../../helper/date-helper";

const { Title, Text } = Typography;

export default function BreakdownSparePartRequest() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id } = useParams();
    const location = useLocation();
    const assetModel = location.state?.assetModel;
    const assetMaintenance = location.state?.assetMaintenance;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalRecord, setTotalRecord] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [qrScannerVisible, setQrScannerVisible] = useState(false);
    const [spareParts, setSpareParts] = useState([]);
    const contentRef = useRef();

    const userId = user?.id;

    useEffect(() => {
        fetchBreakdownSpareRequestByBreakdown(1, true);
        fetchSpareParts();
    }, []);

    const fetchBreakdownSpareRequestByBreakdown = async (_page, isFirstLoad = false) => {
        try {
            if (isFirstLoad) setLoading(true);
            else setLoadingMore(true);

            const payload = {
                page: _page,
                limit: PAGINATION.limit,
                breakdown: id
            };
            const res = await _unitOfWork.breakdownSpareRequest.getBreakdownSpareRequestByBreakdown(payload);
            if (res?.code === 1) {
                if (_page === 1) {
                    setData(res.data.data);
                } else {
                    setData((prev) => [
                        ...prev,
                        ...res.data.data,
                    ])
                }
                setTotalRecord(res.data.totalRecords || res.data.data.length);

            }
        } catch (e) {
            message.error(t("breakdown.sparePartList.messages.load_error"));
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const fetchSpareParts = async () => {
        const res = await _unitOfWork.AssetModelSparePart.getResById({
            id: assetModel
        });
        if (res && res.code === 1) {
            setSpareParts(res.data);
        }
    };

    const onScroll = () => {
        if (contentRef.current) {
            console.log("")
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            if (!loadingMore && scrollTop + clientHeight + 1 >= scrollHeight) {
                const nextPage = page + 1;
                const totalLoaded = (nextPage - 1) * PAGINATION.limit;
                console.log(totalLoaded)
                if (totalLoaded < totalRecord) {
                    setPage(nextPage);
                    fetchBreakdownSpareRequestByBreakdown(nextPage);
                }
            }
        }
    };

    const onClickOpenDetail = (request) => {
        setSelectedRequest(request);
        setShowDetail(true);
    };

    const handleQrScan = async (decodedText) => {
        try {
            const url = new URL(decodedText);
            const sparePartId = url.searchParams.get("sparePart");
            const qrCode = url.searchParams.get("qrcode");

            if (!qrCode || !sparePartId) {
                message.warning(t("breakdown.sparePartList.messages.invalid_qr"));
                return;
            }

            const part = spareParts.find(
                (sp) => sp.sparePart.id.toString() === sparePartId.toString()
            );
            if (!part) {
                message.warning(t("breakdown.sparePartList.messages.not_in_list"));
                return;
            }

            const payload = {
                spareRequest: {
                    breakdown: id,
                    user: userId,
                    assetMaintenance: assetMaintenance,
                },
                spareRequestDetail: [
                    {
                        assetModelSparePart: part.id,
                        spareRequestType: "spareReplace",
                        requestStatus: "spareReplace",
                        qty: 1,
                        unitCost: 0,
                        comment: "",
                        sparePartDetail: qrCode,
                    },
                ],
            };

            const res = await _unitOfWork.breakdownSpareRequest.createBreakdownSpareRequest(payload);
            if (res?.code === 1) {
                message.success(t("breakdown. sparePartList.messages.submit_success"));
                fetchBreakdownSpareRequestByBreakdown(1, true);
            } else {
                message.error(t("breakdown.sparePartList.messages.submit_error"));
            }

            setQrScannerVisible(false);
        } catch (err) {
            console.error(err);
            message.error(t("breakdown.sparePartList.messages.qr_read_error"));
        }
    };

    return (
        <div
            style={{
                background: "#f8f8f8",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header cố định */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    background: "#23457b",
                    color: "#fff",
                    padding: "0 16px",
                    fontWeight: 600,
                    fontSize: 20,
                    zIndex: 10,
                }}
            >
                <ArrowLeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
                    onClick={() => navigate(-1)}
                />
                <span style={{ flex: 1 }}>
                    {t("breakdown.sparePartForm.title")}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {/* <QrcodeOutlined
                        onClick={() => setQrScannerVisible(true)}
                        style={{ fontSize: 22, cursor: "pointer" }}
                    /> */}
                </div>
            </div>

            {/* Nội dung cuộn */}
            <div
                ref={contentRef}
                onScroll={onScroll}
                style={{
                    marginTop: 56,
                    height: "calc(100vh - 56px)",
                    padding: 16,
                    overflowY: "auto",
                    paddingBottom: 80,
                }}
            >
                {
                    loading ? (
                        <div style={{ textAlign: "center", marginTop: 50 }}>
                            {/* <Spin size="large" /> */}
                        </div>
                    ) :
                        data.length === 0 ? (
                            <Empty description={t("breakdown.sparePartList.messages.empty_list")} />
                        ) : (
                            data.map((item, index) => (
                                <Card
                                    key={item._id || index}
                                    title={item.code || `${t("breakdown.sparePartList.labels.request")} #${index + 1}`}
                                    bordered={false}
                                    style={{ marginBottom: 16, borderRadius: 10 }}
                                    onClick={() => onClickOpenDetail(item)}
                                >
                                    <p>
                                        <Text strong>{t("breakdown.sparePartList.labels.status")}:</Text>{" "}
                                        {t(assetModelSpareRequestCategory[item?.requestStatus])}
                                    </p>
                                    <p>
                                        <Text strong>{t("breakdown.sparePartList.labels.created_by")}:</Text>{" "}
                                        {item.createdBy?.fullName || "-"}
                                    </p>
                                    <p>
                                        <Text strong>{t("breakdown.sparePartList.labels.created_date")}:</Text>{" "}
                                        {parseDate(item.createdAt)}
                                    </p>
                                    <p>
                                        <Text strong>{t("breakdown.sparePartList.labels.update_date")}:</Text>{" "}
                                        {parseDate(item.updatedAt)}
                                    </p>
                                    <p>
                                        <Text strong>{t("breakdown.sparePartList.labels.spare_parts")}:</Text>{" "}
                                        {item?.details
                                            ?.map((detail) => detail?.assetModelSparePart?.sparePart?.sparePartsName)
                                            ?.join(", ")}
                                    </p>
                                </Card>
                            ))
                        )}
            </div>

            {/* Nút thêm nổi */}
            <div
                style={{
                    position: "fixed",
                    right: 20,
                    bottom: "15vh",
                }}
            >
                <Button
                    type="primary"
                    shape="circle"
                    icon={<PlusOutlined style={{ fontSize: 20 }} />}
                    onClick={() => setModalVisible(true)}
                    title={t("breakdown.sparePartList.buttons.add")}
                    style={{
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        height: 60,
                        width: 60,
                    }}
                />
            </div>

            {/* Modal tạo mới */}
            <CreateBreakdownSpareRequest
                open={modalVisible}
                onClose={() => setModalVisible(false)}
                breakdownId={id}
                assetModel={assetModel}
                assetMaintenance={assetMaintenance}
                userId={userId}
                spareParts={spareParts}
                onReset={() => navigate(-1)}
            />

            {/* Modal chi tiết */}
            <DetailBreakdownSpareRequest
                open={showDetail}
                onClose={() => setShowDetail(false)}
                request={selectedRequest}
                onRefresh={() => fetchBreakdownSpareRequestByBreakdown(1, true)}
            />

            {/* QR Scanner */}
            <QrScannerModal
                open={qrScannerVisible}
                onClose={() => setQrScannerVisible(false)}
                onScan={handleQrScan}
            />
        </div>

    );
}