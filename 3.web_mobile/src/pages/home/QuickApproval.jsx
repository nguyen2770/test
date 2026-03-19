import {
  Button,
  Card,
  Drawer,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckSquareOutlined,
  CloseCircleOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import * as _unitOfWork from "../../api";
import { PAGINATION } from "../../utils/constant";
import { useTranslation } from "react-i18next";

import ApproveSparePartModal from "../myBreakdown/ApproveSparePartModal";
import ApproveSparePartSchedulePreventive from "../sparePartRequestSchedulePrevetive/ApproveSparePartSchedulePreventive";
import ComfirmCloseBreakdown from "../myBreakdown/ComfirmCloseBreakdown";
import ConfirmReOpenModal from "../schedulePreventive/ConfirmReopen";
import CloseSchedulePreventiveDrawer from "../../components/Drawer/CloseSchedulePreventiveDrawer";
import ReopenBreakdown from "../myBreakdown/ReOpenBreakdown";
import Confirm from "../../components/modal/Comfirm";

const QuickApprovalMobile = ({ open, onClose, onTotalChange }) => {
  const { t } = useTranslation();
  const contentRef = useRef(null);

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [breakdown, setBreakdown] = useState(null);
  const [schedulePreventive, setSchedulePreventive] = useState(null);
  const [spareData, setSpareData] = useState(null);

  const [openApproveSpare, setOpenApproveSpare] = useState(false);
  const [openApproveScheduleSpare, setOpenApproveScheduleSpare] = useState(false);
  const [openCloseBreakdown, setOpenCloseBreakdown] = useState(false);
  const [openReopenBreakdown, setOpenReopenBreakdown] = useState(false);
  const [openClosePreventive, setOpenClosePreventive] = useState(false);
  const [openReopenPreventive, setOpenReopenPreventive] = useState(false);


  useEffect(() => {
    if (open) {
      setPage(1);
      fetchData(1, false);
    }
  }, [open]);

  useEffect(() => {
    if (page > 1) fetchData(page, true);
  }, [page]);

  const fetchData = async (pageNumber, loadMore) => {
    if (loading) return;
    setLoading(true);

    const res = await _unitOfWork.report.getApproveWorks({
      page: pageNumber,
      limit: PAGINATION.limit,
    });

    if (res?.data) {
      setTotal(res.data.totalResults);
      setData(prev =>
        loadMore ? [...prev, ...res.data.results] : res.data.results
      );
      onTotalChange?.(res.data.totalResults);
    }

    setLoading(false);
  };


  useEffect(() => {
    const div = contentRef.current;
    if (!div) return;

    const handleScroll = () => {
      const isBottom =
        div.scrollHeight - div.scrollTop <= div.clientHeight + 1;

      if (isBottom && data.length < total && !loading) {
        setPage(p => p + 1);
      }
    };

    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [data, total, loading]);


  const renderAction = (item) => {
    switch (item.sourceType) {
      case "spare_request_breakdown":
        return (
          <Button
            type="primary"
            size="small"
            icon={<CheckSquareOutlined />}
            onClick={() => {
              setSpareData(item.data);
              setOpenApproveSpare(true);
            }}
          />
        );

      case "spare_request_schedule_preventive":
        return (
          <Button
            type="primary"
            size="small"
            icon={<CheckSquareOutlined />}
            onClick={() => {
              setSpareData(item.data);
              setOpenApproveScheduleSpare(true);
            }}
          />
        );

      case "close_breakdown":
        return (
          <>
            <Button
              type="primary"
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setBreakdown(item.data);
                setOpenCloseBreakdown(true);
              }}
            />
            <Button
              type="primary"
              size="small"
              icon={<FolderOpenOutlined />}
              onClick={() => {
                setBreakdown(item.data);
                setOpenReopenBreakdown(true);
              }}
              style={{ marginLeft: 6 }}
            />
          </>
        );

      case "preventive":
        return (
          <>
            <Button
              type="primary"
              size="small"
              icon={<CheckSquareOutlined />}
              onClick={() => {
                setSchedulePreventive(item.data);
                setOpenClosePreventive(true);
              }}
            />
            <Button
              type="primary"
              size="small"
              icon={<FolderOpenOutlined />}
              onClick={() => {
                setSchedulePreventive(item.data);
                setOpenReopenPreventive(true);
              }}
              style={{ marginLeft: 6 }}
            />
          </>
        );

      case "trial_repair_approval":
        return (
          <Button
            type="primary"
            size="small"
            icon={<CheckSquareOutlined />}
            onClick={() =>
              Confirm(
                t("dashboard.quick.confirm.experimental_fix"),
                async () => {
                  await _unitOfWork.breakdownAssignUser
                    .comfirmBreakdownAssignUserFixed({
                      breakdownAssignUser: item.sourceId,
                    });
                  fetchData(1, false);
                }
              )
            }
          />
        );

      default:
        return null;
    }
  };


  return (
    <Drawer
      placement="right"
      open={open}
      closable={false}
      width="100%"
      bodyStyle={{ padding: 0 }}
    >
      {/* ===== HEADER ===== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#23457b",
          color: "#fff",
          padding: "15px",
          fontWeight: 600,
          fontSize: 20,
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <ArrowLeftOutlined
          style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
          onClick={onClose}
        />
        <span style={{ flex: 1 }}>
          {t("quickApproval.title")}
        </span>
      </div>

      <div
        ref={contentRef}
        style={{
          padding: 16,
          height: "calc(100vh - 56px)",
          overflowY: "auto",
        }}
      >
        {data.map((item) => (
          <Card
            key={item.id}
            style={{
              marginBottom: 16,
              borderRadius: 12,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0",
            }}
            bodyStyle={{ padding: "12px 16px" }}
          >
            <Row>
              <Col span={18}>
                <b
                  style={{
                    fontSize: 16,
                    color: "#23457b",
                  }}
                >
                  {item.title}
                </b>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#666",
                    fontSize: 14,
                  }}
                >
                  {item.description}
                </p>
              </Col>
              <Col
                span={6}
                style={{ textAlign: "right" }}
              >
                {renderAction(item)}
              </Col>
            </Row>
          </Card>
        ))}
      </div>

      <ApproveSparePartModal
        open={openApproveSpare}
        data={spareData}
        onClose={() => setOpenApproveSpare(false)}
        onSubmit={() => fetchData(1, false)}
      />

      <ApproveSparePartSchedulePreventive
        open={openApproveScheduleSpare}
        data={spareData}
        onClose={() => setOpenApproveScheduleSpare(false)}
        onSubmit={() => fetchData(1, false)}
      />

      <ComfirmCloseBreakdown
        open={openCloseBreakdown}
        breakdown={breakdown}
        onCancel={() => setOpenCloseBreakdown(false)}
        onRefresh={() => fetchData(1, false)}
      />

      <ReopenBreakdown
        open={openReopenBreakdown}
        breakdown={breakdown}
        onCancel={() => setOpenReopenBreakdown(false)}
        onRefresh={() => fetchData(1, false)}
      />

      <CloseSchedulePreventiveDrawer
        open={openClosePreventive}
        schedulePreventive={schedulePreventive}
        onClose={() => setOpenClosePreventive(false)}
        onRefresh={() => fetchData(1, false)}
      />

      <ConfirmReOpenModal
        open={openReopenPreventive}
        schedulePreventive={schedulePreventive}
        onCancel={() => setOpenReopenPreventive(false)}
        onRefresh={() => fetchData(1, false)}
      />
    </Drawer>
  );
};

export default QuickApprovalMobile;
