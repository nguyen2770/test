import React, { useRef, useState, useEffect } from "react";
import * as _unitOfWork from "../../api";
import { useTranslation } from "react-i18next";
import "./index.scss";
import ApproveSparePartSchedulePreventive from "./ApproveSparePartSchedulePreventive";
import { useNavigate, useLocation, useParams } from "react-router-dom";

export default function SparePartRequestSchedulePrevetiveDetail() {
  const { t } = useTranslation();
  const [isOpenModalApprover, setIsOpenModalApprover] = useState(true);
  const navigate = useNavigate();
  const [data, setData] = useState();
  const params = useParams();

  const onClose = () => {
    navigate(-1);
    setIsOpenModalApprover(false);
  };

  useEffect(() => {
    fetchGetSparePartRequestSchedulePreventive();
  }, []);

  const fetchGetSparePartRequestSchedulePreventive = async () => {
    let res =
      await _unitOfWork.schedulePreventiveTaskRequestSparepart.getScheduleePreventiveRequestSparePartById(
        { id: params?.id }
      );
    if (res && res.code === 1) {
      setData(res?.data);
    }
  };
  return (
    <div className="my-breakdown-container">
      <ApproveSparePartSchedulePreventive
        open={isOpenModalApprover}
        onClose={onClose}
        data={data}
        onSubmit={onClose}
      />
    </div>
  );
}
