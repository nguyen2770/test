import { useEffect, useState, useRef } from "react";
import { Card } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import * as _unitOfWork from "../../../api";
import { staticPath } from "../../../router/RouteConfig";
import { PAGINATION } from "../../../utils/constant";
import { parseDate } from "../../../helper/date-helper";
import "./index.scss";
import { t } from "i18next";

export default function CalibrationContract() {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [totalRecord, setTotalRecord] = useState(0);
    const [page, setPage] = useState(1);
    const contentRef = useRef(null);

    useEffect(() => {
        fetchContracts(1);
    }, []);

    useEffect(() => {
        if (page > 1) {
            fetchContracts();
        }
    }, [page]);

    useEffect(() => {
        const div = contentRef.current;
        if (!div) return;

        const handleScroll = () => {
            const bottom =
                div.scrollHeight - div.scrollTop <= div.clientHeight + 100;

            if (bottom && contracts.length < totalRecord) {
                loadMoreData();
            }
        };

        div.addEventListener("scroll", handleScroll);
        return () => div.removeEventListener("scroll", handleScroll);
    }, [contracts, totalRecord]);

    const loadMoreData = () => {
        const nextPage = page + 1;
        const totalLoaded = (nextPage - 1) * PAGINATION.limit;
        if (totalLoaded >= totalRecord) return;
        setPage(nextPage);
    };

    const fetchContracts = async (_page) => {
        const payload = {
            page: _page || page,
            limit: PAGINATION.limit,
        };

        const res =
            await _unitOfWork.calibrationContract.getCalibrationContracts(
                payload
            );

        if (res?.code === 1) {
            const items = res.resultWithItems || [];
            if (payload.page > 1) {
                setContracts((prev) => [...prev, ...items]);
            } else {
                setContracts(items);
            }
            setTotalRecord(res.totalResults || items.length);
        }
    };

    const onDetail = (item) => {
        navigate(staticPath.viewCalibrationContract + "/" + item.id);
    };

    return (
        <div className="view-amc-container">
            {/* HEADER */}
            <div className="view-amc-header">
                <ArrowLeftOutlined
                    className="back-icon"
                    onClick={() => navigate(-1)}
                />
                <span>{t("menu.contract.calibration")}</span>
            </div>

            {/* CONTENT SCROLL */}
            <div
                ref={contentRef}
                className="view-amc-content"
            >
                {contracts.map((item, idx) => (
                    <Card
                        key={item.id || idx}
                        className="amc-mobile-card"
                        bodyStyle={{ padding: 12 }}
                        onClick={() => onDetail(item)}
                    >
                        <div className="card-title">
                            {item.contractNo}
                        </div>

                        <div className="card-sub">
                            {item.customer?.customerName || "-"}
                        </div>

                        <div className="card-date">
                            Hết hạn: {parseDate(item.expirationDate)}
                        </div>
                    </Card>
                ))}

                {contracts.length === 0 && (
                    <div className="view-amc-content-empty">
                        Không có dữ liệu
                    </div>
                )}
            </div>
        </div>
    );
}
