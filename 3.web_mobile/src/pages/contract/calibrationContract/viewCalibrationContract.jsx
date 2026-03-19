import React, { useEffect, useState } from "react";
import { Card } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import * as _unitOfWork from "../../../api";
import AttachmentList from "../../../components/attachment/AttachmentList";
import dayjs from "dayjs";
import { ArrowLeftOutlined } from "@ant-design/icons";
import "./index.scss";
import AttachmentModel from "../../../components/modal/Attachment/AttachmentModelMobie";
import { t } from "i18next";

export default function ViewCalibrationContract() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchDetail();
    }, []);

    const fetchDetail = async () => {
        const res =
            await _unitOfWork.calibrationContract.getCalibrationContractById(id);

        if (res?.code === 1) {
            setData(res.calibrationContractObj);
            const fileList =
                res.calibrationContractObj?.listResource?.map((r) => ({
                    name: r.resource.fileName + r.resource.extension,
                    src: _unitOfWork.resource.getImage(r.resource.id),
                })) || [];
            setFiles(fileList);
        }
    };

    if (!data) return null;

    return (
        <div className="view-amc-container">
            {/* HEADER */}
            <div className="view-amc-header">
                <ArrowLeftOutlined
                    className="back-icon"
                    onClick={() => navigate(-1)}
                />
                <span>{t("calibration_contract.title_calibration_contract_details")}</span>
            </div>

            {/* CONTENT */}
            <div className="view-amc-content">
                <Card className="info-card">
                    <InfoRow label={t("amc.form.contract_no")} value={data.contractNo} />
                    <InfoRow label={t("calibration_contract.contract_name")} value={data.contractName} />

                    <InfoRow
                        label={t("amc.form.service_contractor")}
                        value={data.serviceContractor?.serviceContractorName || "-"}
                    />

                    <InfoRow
                        label={t("amc.form.user")}
                        value={data.customer?.customerName || "-"}
                    />

                    <InfoRow
                        label={t("amc.form.date_signed")}
                        value={
                            data.signedDate
                                ? dayjs(data.signedDate).format("DD/MM/YYYY")
                                : "-"
                        }
                    />

                    <InfoRow
                        label={t("calibration_contract.effective_date")}
                        value={dayjs(data.effectiveDate).format("DD/MM/YYYY")}
                    />

                    <InfoRow
                        label={t("calibration_contract.expiration_date")}
                        value={dayjs(data.expirationDate).format("DD/MM/YYYY")}
                    />

                    {/* <InfoRow
                        label="Không giới hạn số lần"
                        value={data.isCalloutRestirction ? "Có" : "Không"}
                    /> */}

                    {!data.isCalloutRestirction && (
                        <InfoRow
                            label={t("calibration_contract.number_of_calibrations")}
                            value={data.numberOfCalibrations}
                        />
                    )}

                    <InfoRow
                        label={t("calibration_contract.total_cost")}
                        value={data.totalCost}
                        highlight
                    />
                </Card>


                {files.length > 0 && (
                    <Card className="attachment-card" title={t("amc.form.attachments")}>
                        {/* <AttachmentList files={files} /> */}
                        <AttachmentModel
                            value={files}
                            notSize
                            notDelete
                            noCreate
                        />
                    </Card>
                )}
            </div>
        </div>
    );
}

function InfoRow({ label, value, highlight }) {
    return (
        <div className={`info-row ${highlight ? "highlight" : ""}`}>
            <span className="info-label">{label}</span>
            <span className="info-value">{value}</span>
        </div>
    );
}
