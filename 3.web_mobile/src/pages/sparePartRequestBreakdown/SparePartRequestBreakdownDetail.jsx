import React, { useRef, useState, useEffect } from "react";
import * as _unitOfWork from "../../api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ApproveSparePartModal from "../myBreakdown/ApproveSparePartModal";

export default function SparePartRequestBreakdownDetail() {
  const [isOpenModalApprover, setIsOpenModalApprover] = useState(true);
  const navigate = useNavigate();
  const [data, setData] = useState();
  const params = useParams();

  const onSubmit = () => {
    setIsOpenModalApprover(false);
    navigate(-1);
  };
  useEffect(() => {
    fetchGetBreakdownSpareRequestById();
  }, []);

  const fetchGetBreakdownSpareRequestById = async () => {
    let res =
      await _unitOfWork.breakdownSpareRequest.getBreakdownSpareRequestById({
        id: params?.id,
      });
    if (res && res.code === 1) {
      setData(res?.data);
    }
  };
  return (
    <div className="my-breakdown-container">
      <ApproveSparePartModal
        open={isOpenModalApprover}
        onClose={onSubmit}
        data={data}
        onSubmit={onSubmit}
      />
    </div>
  );
}
