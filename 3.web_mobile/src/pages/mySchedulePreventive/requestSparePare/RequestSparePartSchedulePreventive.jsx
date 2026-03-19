import React, { useEffect, useRef, useState } from "react";
import { Card, Button, Typography, message, Form, Spin, Empty } from "antd";
import { ArrowLeftOutlined, PlusOutlined, QrcodeOutlined } from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as _unitOfWork from "../../../api";
import {
  PAGINATION,
  schedulePreventiveTaskRequestSparePartStatus,
  spareRequestType,
} from "../../../utils/constant";
import { useTranslation } from "react-i18next";
import CreateRequestSparePartSchedule from "./CreateRequestSparePartSchedule";
import { parseDate, parseDateHH } from "../../../helper/date-helper";
import { parseToLabel } from "../../../helper/parse-helper";
import DetailSchedulePrevetiveTaskResSparePart from "./DetailSchedulePrevetiveTaskResSparePart";
import "./index.scss"
import QrScannerModal from "../../../components/modal/QrScannerModal";
const { Title, Text } = Typography;

export default function RequestSparePartSchedulePreventive() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const assetModel = location.state?.assetModel;
  const schedulePreventive = location.state?.schedulePreventive;
  const assetMaintenance = location.state?.assetMaintenance;
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [form] = Form.useForm();
  const contentRef = useRef();
  const [showDetail, setShowDetail] = useState(false);
  const [qrScannerVisible, setQrScannerVisible] = useState(false);
  const [spareParts, setSpareParts] = useState([]);

  const [
    schedulePreventiveTaskRequestSparepart,
    setSchedulePreventiveTaskRequestSparepart,
  ] = useState([]);
  const [
    schedulePreventiveTaskRequestSpareparts,
    setSchedulePreventiveTaskRequestSpareparts,
  ] = useState([]);

  useEffect(() => {
    fetchGetListSchedulePreventiveTaskRequestSparepart(1, true);
    fetchSpareParts();
    console.log("assetMaintenance typeof:", typeof assetMaintenance, assetMaintenance)

  }, []);

  const fetchGetListSchedulePreventiveTaskRequestSparepart = async (
    _page,
    isFirstLoad = false
  ) => {
    try {
      if (isFirstLoad) setLoading(true);
      else setLoadingMore(true);

      const payload = {
        page: _page,
        limit: PAGINATION.limit,
        schedulePreventive,
        schedulePreventiveTask: params?.id,
      };

      const res =
        await _unitOfWork.schedulePreventiveTaskRequestSparepart.getListSchedulePrevetiveTaskSparePartRequests(
          payload
        );

      if (res && res.code === 1) {
        if (_page === 1) {
          setSchedulePreventiveTaskRequestSpareparts(res.data);
        } else {
          setSchedulePreventiveTaskRequestSpareparts((prev) => [
            ...prev,
            ...res.data,
          ]);
        }
        setTotalRecord(res.totalRecords || res.data.length);
      }
    } catch (error) {
      message.error(t("schedulePreventive.spareRequest.errorLoadList"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (!loadingMore && scrollTop + clientHeight + 1 >= scrollHeight) {
        const nextPage = page + 1;
        const totalLoaded = (nextPage - 1) * PAGINATION.limit;
        if (totalLoaded < totalRecord) {
          setPage(nextPage);
          fetchGetListSchedulePreventiveTaskRequestSparepart(nextPage);
        }
      }
    }
  };
  const onClickOpenDetail = (data) => {
    setSchedulePreventiveTaskRequestSparepart(data);
    setShowDetail(true);
  };
  const handleQrScan = async (decodedText) => {
    try {
      const url = new URL(decodedText);
      const sparePartId = url.searchParams.get("sparePart");
      const qrCode = url.searchParams.get("qrcode");

      if (!qrCode) {
        message.warning(t("schedulePreventive.spareRequest.invalidQR"));
        return;
      }
      if (!sparePartId) {
        message.warning(t("schedulePreventive.spareRequest.invalidQR"));
        return;
      }

      const part = spareParts.find(sp => sp.sparePart.id.toString() === sparePartId.toString());
      if (!part) {
        message.warning(t("schedulePreventive.spareRequest.notInList"));
        return;
      }


      const res =
        await _unitOfWork.schedulePreventiveTaskRequestSparepart.createSchedulePreventiveSparePartRequest(
          {
            data: {
              schedulePreventiveTask: params?.id,
              schedulePreventive,
              assetMaintenance: String(assetMaintenance),
              schedulePreventiveRequestSpareParts: [{
                qty: 1,
                sparePart: sparePartId,
                spareRequestType: "spareReplace",
                unitCost: 0,
                sparePartDetail: qrCode,
              }],
            },
          }
        );

      if (res?.code === 1) {
        message.success(t("schedulePreventive.spareRequest.submitSuccess"));
        fetchGetListSchedulePreventiveTaskRequestSparepart(1, true);
      } else {
        message.error(t("schedulePreventive.spareRequest.submitFailed"));
      }

      setQrScannerVisible(false);
    } catch (err) {
      console.error(err);
      message.error(t("schedulePreventive.spareRequest.qrReadError"));
    }
  }

  const fetchSpareParts = async () => {
    const res = await _unitOfWork.AssetModelSparePart.getResById({
      id: assetModel,
    });
    if (res && res.code === 1) setSpareParts(res.data);
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
        <span style={{ flex: 1 }}>{t("schedulePreventive.spareRequest.headerTitle")}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
          padding: 16,
          flex: 1,
          overflowY: "auto",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", marginTop: 50 }}>
            <Spin size="large" />
          </div>
        ) : schedulePreventiveTaskRequestSpareparts.length === 0 ? (
          <Empty description={t("schedulePreventive.spareRequest.emptyList")} />
        ) : (
          schedulePreventiveTaskRequestSpareparts.map((item, index) => (
            <Card
              key={item._id || index}
              title={item.code || `${t("schedulePreventive.spareRequest.requestLabel")} #${index + 1}`}
              bordered={false}
              style={{ marginBottom: 16, borderRadius: 10 }}
              onClick={() => onClickOpenDetail(item)}
            >
              <p>
                <Text strong>{t("schedulePreventive.spareRequest.statusLabel")}</Text>{" "}
                {t(
                  parseToLabel(
                    schedulePreventiveTaskRequestSparePartStatus.Options,
                    item?.requestStatus
                  )
                )}
              </p>
              <p>
                <Text strong>{t("schedulePreventive.spareRequest.createdBy")}:</Text>{" "}
                {item.createdBy?.fullName || "-"}
              </p>
              <p>
                <Text strong>{t("schedulePreventive.spareRequest.createdAt")}:</Text>{" "}
                {parseDateHH(item?.createdAt)}
              </p>
              {item?.holder && (
                <p>
                  <Text strong>{t("schedulePreventive.spareRequest.holder")}:</Text>{" "}
                  {item.holder?.fullName || "-"}
                </p>
              )}
              {item?.assignUserDate && (
                <p>
                  <Text strong>{t("schedulePreventive.spareRequest.assignUserDate")}:</Text>{" "}
                  {parseDateHH(item?.assignUserDate)}
                </p>
              )}
              <p>
                <Text strong>{t("schedulePreventive.spareRequest.sparePartsLabel")}:</Text>{" "}
                {item?.schedulePrevetiveTaskSparePartRequestDetails
                  ?.map((detail) => detail?.sparePart?.sparePartsName)
                  ?.join(", ")}
              </p>
            </Card>
          ))
        )}

        {loadingMore && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <Spin />
          </div>
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
          title={t("schedulePreventive.spareRequest.addSparePart")}
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            height: 60,
            width: 60,
          }}
        />
      </div>

      {/* Modal tạo mới */}
      <CreateRequestSparePartSchedule
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        assetModelId={assetModel || null}
        schedulePreventive={schedulePreventive}
        schedulePreventiveTask={params?.id}
        // onReset={() => fetchGetListSchedulePreventiveTaskRequestSparepart(1)}
        onReset={() => navigate(-1)}
        spareParts={spareParts}
      />
      <DetailSchedulePrevetiveTaskResSparePart
        open={showDetail}
        onClose={() => setShowDetail(false)}
        assetModelId={assetModel || null}
        schedulePreventive={schedulePreventive}
        schedulePreventiveTask={params?.id}
        schedulePreventiveTaskRequestSparepart={
          schedulePreventiveTaskRequestSparepart
        }

      />
      <QrScannerModal
        open={qrScannerVisible}
        onClose={() => setQrScannerVisible(false)}
        onScan={handleQrScan}
      />
    </div>
  );
}