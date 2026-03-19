import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Form, Row, Table, Tabs, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as _unitOfWork from "../../../../../api";
import { useTranslation } from "react-i18next";
import { staticPath } from "../../../../../router/routerConfig";
import {
  frequencyAllOptions,
  monitoringType,
  priorityType,
  ScheduleBasedOnType,
} from "../../../../../utils/constant";
import { parseToLabel } from "../../../../../helper/parse-helper";
import Comfirm from "../../../../../components/modal/Confirm";
import ShowSuccess from "../../../../../components/modal/result/successNotification";
export default function PreventiveOfModel() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const params = useParams();
  const navigate = useNavigate();
  const [preventiveOfModels, setPreventiveOfModels] = useState([]);

  useEffect(() => {
    fetchGetPreventiveOfModels();
  }, []);

  const fetchGetPreventiveOfModels = async () => {
    let res = await _unitOfWork.preventiveOfModel.getListPreventiveOfModels({
      assetModel: params?.id,
    });
    if (res && res.code === 1) {
      setPreventiveOfModels(res?.preventiveOfModelWithTasks);
    }
  };
  const onViewCreate = () => {
    navigate(staticPath.cretaePreventiveOfModel + "/" + params?.id);
  };
  const onClickUpdate = (record) => {
    navigate(
      `${staticPath.updatePreventiveOfModel}/${
        record?.id || record?._id
      }?assetModel=${params?.id}`
    );
  };
  const onClickDelete = async (record) => {
    const res = await _unitOfWork.preventiveOfModel.deletePreventiveOfModelById(
      {
        id: record._id || record.id,
      }
    );
    if (res && res.code === 1) {
      ShowSuccess(
        "topRight",
        t("preventive.list.title"),
        t("preventive.messages.delete_success")
      );
      fetchGetPreventiveOfModels();
    }
  };
  const columns = [
    {
      title: t("preventive.list.table.index"),
      dataIndex: "id",
      key: "id",
      width: "60px",
      align: "center",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: t("preventive.list.table.plan_name"),
      dataIndex: "preventiveName",
      ellipsis: true,
    },
    {
      title: t("preventive.list.table.frequency_type"),
      dataIndex: "frequencyType",
      ellipsis: true,
      render: (_text, record) => {
        // if (record?.scheduleType === ScheduleBasedOnType.Monitoring) {
        //   return t(parseToLabel(monitoringType.Options, record.monitoringType));
        // }
        const label = t(
          parseToLabel(frequencyAllOptions.Option, record?.frequencyType)
        );
        return record?.calenderFrequencyDuration
          ? ` ${record?.calenderFrequencyDuration} ${label}`
          : label;
      },
    },

    {
      title: t("preventive.list.table.schedule_based_on"),
      dataIndex: "scheduleType",
      align: "center",
      render: (text) => t(parseToLabel(ScheduleBasedOnType.Option, text)),
    },
    {
      title: t("preventive.list.table.priority"),
      dataIndex: "importance",
      align: "center",
      render: (text) => t(parseToLabel(priorityType.Option, text)),
    },
    {
      title: t("preventive.common.action"),
      dataIndex: "action",
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <div>
          <Tooltip title={t("preventive.buttons.edit")}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => onClickUpdate(record)}
              className="ml-2"
            />
          </Tooltip>
          <Tooltip title={t("preventive.buttons.delete")}>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() =>
                Comfirm(t("assetModel.common.messages.confirm_delete"), () =>
                  onClickDelete(record)
                )
              }
              className="ml-2"
            />
          </Tooltip>
        </div>
      ),
    },
  ];
  return (
    <div className="content-manager">
      <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <Card
          title={t(`assetModel.model.title_preventive_of_model`)}
          extra={
            <>
              <Button style={{ marginRight: 10 }} onClick={() => navigate(-1)}>
                <ArrowLeftOutlined />
                {t("assetModel.common.buttons.back")}
              </Button>
              <Button
                type="primary"
                style={{ marginRight: 10 }}
                onClick={onViewCreate}
              >
                <PlusCircleOutlined />
                {t("common_buttons.create")}
              </Button>
            </>
          }
        ></Card>
      </Form>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={preventiveOfModels}
        bordered
        pagination={false}
        className="p-2"
      />
    </div>
  );
}
