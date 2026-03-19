import React, { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Row, Space, Table, Tooltip } from "antd";
import CreateUom from "./CreateUom";
import UpdateUom from "./UpdateUom";
import Confirm from "../../../components/modal/Confirm";
import * as _unitOfWork from "../../../api";
import useHeader from "../../../contexts/headerContext";
import { useTranslation } from "react-i18next";
import useAuth from "../../../contexts/authContext";
import { checkPermission } from "../../../helper/permission-helper";
import { permissionCodeConstant } from "../../../utils/permissionConstant";

export default function UomPage() {
  const { t } = useTranslation();
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const { setHeaderTitle } = useHeader();
  const [uoms, setUoms] = useState([]);
  const [uomUpdate, setUomUpdate] = useState(null);
  const [searchForm] = Form.useForm();
  const { permissions } = useAuth();

  useEffect(() => {
    setHeaderTitle(t("uom.list.title"));
  }, [t, setHeaderTitle]);

  useEffect(() => {
    fetchUoms();
  }, []);

  const fetchUoms = async () => {
    const res = await _unitOfWork.uom.getAllUom({});
    if (res && res.code === 1) {
      setUoms(res?.data);
    }
  };

  const onClickCreate = () => setIsOpenCreate(true);
  const onClickUpdate = (record) => {
    setIsOpenEdit(true);
    setUomUpdate(record);
  };
  const onClikDelete = async (record) => {
    const res = await _unitOfWork.uom.deleteUom({ id: record.id });
    if (res && res.code === 1) {
      fetchUoms();
      message.success(t("uom.messages.delete_success"));
    } else {
      message.error(t("uom.messages.delete_error"));
    }
  };

  const onFinish = () => {
    // giữ nguyên (chưa có tìm kiếm thực tế)
  };

  const columns = [
    {
      title: t("uom.export.index"),
      dataIndex: "key",
      width: 50,
      align: "center",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: t("uom.list.table.name"),
      dataIndex: "uomName",
      className: "text-left-column",
      align: "center",
    },
    {
      title: t("uom.table.action", { defaultValue: "Action" }),
      dataIndex: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          {checkPermission(permissions, permissionCodeConstant.uom_update) && (
            <Tooltip title={t("uom.actions.edit")}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                className="ml-2"
                size="small"
                onClick={() => onClickUpdate(record)}
              />
            </Tooltip>
          )}
          {checkPermission(permissions, permissionCodeConstant.uom_delete) && (
            <Tooltip title={t("uom.actions.delete")}>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
                className="ml-2"
                onClick={() =>
                  Confirm(t("uom.messages.confirm_delete"), () => onClikDelete(record))
                }
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-3">
      <Form
        form={searchForm}
        className="mb-3"
        onFinish={onFinish}
        layout="vertical"
      >
        <Row className="mb-1">
          <Col span={12}>
            {/* Chưa dùng search – giữ nguyên logic */}
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            {checkPermission(permissions, permissionCodeConstant.uom_create) && (
              <Button
                className="ml-3"
                type="primary"
                onClick={() => onClickCreate()}
              >
                <UsergroupAddOutlined />
                {t("uom.form.buttons.submit_create")}
              </Button>
            )}
          </Col>
        </Row>
      </Form>

      <Row>
        <Col
          span={24}
          style={{ fontSize: 16, textAlign: "right" }}
          className="mt-1"
        >
          <b>{t("uom.list.total", { count: uoms.length || 0 })}</b>
        </Col>
      </Row>

      <Table
        rowKey="id"
        columns={columns}
        key={"id"}
        dataSource={uoms}
        bordered
      />

      <CreateUom
        open={isOpenCreate}
        handleCancel={() => setIsOpenCreate(false)}
        handleOk={() => setIsOpenCreate()}
        onRefresh={fetchUoms}
      />
      <UpdateUom
        open={isOpenEdit}
        handleCancel={() => setIsOpenEdit(false)}
        handleOk={() => setIsOpenEdit()}
        uom={uomUpdate}
        onRefresh={fetchUoms}
      />
    </div>
  );
}