import React, { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Row, Switch, Table, Tooltip } from "antd";
import CreateAssetModelSolution from "./CreateAssetModelSolution";
import UpdateAssetModelSolution from "./UpdateAssetModelSolution";
import * as _unitOfWork from "../../../../../api";
import Comfirm from "../../../../../components/modal/Confirm";
import { CheckCircleTwoTone } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function AssetModelSolution({ assetModel }) {
  const { t } = useTranslation();
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [items, setItems] = useState([]);
  const [changeItem, setChangeItem] = useState(null);

  useEffect(() => {
    if (assetModel) fetchData();
  }, [assetModel]);

  const fetchData = async () => {
    const res =
      await _unitOfWork.assetModelSolution.getAllAssetModelSolution(
        { assetModel: assetModel.id }
      );
    if (res?.code === 1) setItems(res.data);
  };

  const onClickUpdate = (record) => {
    setChangeItem(record);
    setIsOpenUpdate(true);
  };

  const onClickDelete = async (record) => {
    const res =
      await _unitOfWork.assetModelSolution.deleteAssetModelSolution({
        id: record._id
      });
    if (res?.code === 1) fetchData();
  };

  const onUpdateStatus = async (record) => {
    const res =
      await _unitOfWork.assetModelSolution.updateAssetModelSolutionStatus(
        record._id
      );
    if (res?.code === 1) fetchData();
  };

  const columns = [
    {
      title: t("assetModel.solution.table.index"),
      dataIndex: "key",
      width: 60,
      align: "center",
      render: (_t, _r, i) => i + 1
    },
    {
      title: t("assetModel.solution.table.failure_type"),
      dataIndex: "assetModelFailureType",
      align: "center",
      className: "text-left-column",
      render: (_t, record) =>
        record?.assetModelFailureType?.name || ""
    },
    {
      title: t("assetModel.solution.table.tags"),
      dataIndex: "tags",
      align: "center",
      className: "text-left-column",
      render: (_t, record) => (
        <div>
          {record?.tags?.map((tag) => (
            <span
              key={tag.name}
              style={{
                padding: "2px 8px",
                backgroundColor: "#ddd",
                borderRadius: 6,
                marginRight: 5
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )
    },
    {
      title: t("assetModel.solution.table.reason_origin"),
      dataIndex: "reasonOrigin",
      className: "text-left-column"
    },
    {
      title: t("assetModel.solution.table.solution_content"),
      dataIndex: "solutionContent",
      className: "text-left-column"
    },
    {
      title: t("assetModel.common.table.status"),
      dataIndex: "status",
      width: 90,
      align: "center",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          checkedChildren={<CheckCircleTwoTone twoToneColor="#52c41a" />}
          unCheckedChildren="x"
          onChange={() =>
            Comfirm(
              t("assetModel.common.messages.confirm_status_change"),
              () => onUpdateStatus(record)
            )
          }
        />
      )
    },
    {
      title: t("assetModel.common.table.action"),
      dataIndex: "action",
      width: 110,
      align: "center",
      render: (_, record) => (
        <div>
          <Tooltip title={t("assetModel.common.buttons.update")}>
            <Button
              icon={<EditOutlined />}
              type="primary"
              size="small"
              onClick={() => onClickUpdate(record)}
            />
          </Tooltip>
          <Tooltip title={t("assetModel.common.buttons.delete")}>
            <Button
              icon={<DeleteOutlined />}
              danger
              type="primary"
              size="small"
              className="ml-2"
              onClick={() =>
                Comfirm(
                  t("assetModel.common.messages.confirm_delete"),
                  () => onClickDelete(record)
                )
              }
            />
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div>
      <Row className="mb-1">
        <Col span={24} style={{ textAlign: "right" }}>
          <Button
            type="primary"
            onClick={() => setIsOpenCreate(true)}
            className="ml-3"
          >
            <PlusOutlined />{" "}
            {t("assetModel.common.buttons.add_solution")}
          </Button>
        </Col>
      </Row>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={items}
        bordered
        pagination={false}
      />
      <CreateAssetModelSolution
        open={isOpenCreate}
        onCancel={() => setIsOpenCreate(false)}
        onRefresh={fetchData}
        assetModel={assetModel}
      />
      <UpdateAssetModelSolution
        open={isOpenUpdate}
        onCancel={() => setIsOpenUpdate(false)}
        handleOk={() => setIsOpenUpdate(false)}
        assetModelSolutionChange={changeItem}
        assetModel={assetModel}
        onRefresh={fetchData}
      />
    </div>
  );
}