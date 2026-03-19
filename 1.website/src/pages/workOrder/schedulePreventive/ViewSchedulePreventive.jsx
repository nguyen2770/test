import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Space,
  Tag,
  Tooltip,
  Form,
  Input,
  Radio,
  Collapse,
  Tabs,
  Divider,
} from "antd";
import {
  FileOutlined,
  UserOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  EyeOutlined,
} from "@ant-design/icons";
import { data, useNavigate, useParams } from "react-router-dom";
import * as _unitOfWork from "../../../api";
import { parseDateHH } from "../../../helper/date-helper";
import { parseToLabel } from "../../../helper/parse-helper";
import {
  answerTypeInspection,
  assetType,
  frequencyAllOptions,
  historySchedulePreventiveStatus,
  priorityType,
  schedulePreventiveStatus,
  schedulePreventiveTaskAssignUserStatus,
  ServiceTaskType,
  schedulePreventiveTaskRequestSparePartStatus,
} from "../../../utils/constant";
import { useTranslation } from "react-i18next";
import ViewRequestSparePartDetails from "./ViewRequestSparePartDetails";
import { staticPath } from "../../../router/routerConfig";

const { Text } = Typography;
const { Panel } = Collapse;

export default function ViewSchedulePreventive() {
  const { t } = useTranslation();
  const params = useParams();
  const [schedulePreventive, setSchedulePreventive] = useState(null);
  const [schedulePreventiveHistorys, setSchedulePreventiveHistorys] = useState(
    []
  );
  const [requestSpareParts, setRequestSpareParts] = useState([]);
  const [requestSparePart, setRequestSparePart] = useState("");
  const [showRequestSparePartDetail, setShowRequestSparePartDetail] =
    useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGetSchedulePreventive();
  }, []);

  const fetchGetSchedulePreventive = async () => {
    const res = await _unitOfWork.schedulePreventive.getSchedulePreventiveById({
      id: params.id,
    });
    if (res && res.code === 1) {
      setSchedulePreventive(res.data);
      setSchedulePreventiveHistorys(res.schedulePreventiveHistorys || []);
      setRequestSpareParts(res?.schedulePreventiveRequestSpareParts);
    }
  };
  const onShowDetail = (record) => {
    setShowRequestSparePartDetail(true);
    setRequestSparePart(record);
  };
  const files = [];

  const renderScheduleInfo = () => (
    <Card style={{ marginBottom: 24 }}>
      {/* Header */}
      <Row gutter={16} align="middle">
        <Col flex="auto">
          <Space>
            <Text strong style={{ fontSize: 16, color: "#1976d2" }}>
              {t("preventiveSchedule.view.asset_schedule_prefix")}
              {schedulePreventive?.preventive?.preventiveName}
            </Text>
            {schedulePreventive?.preventive?.assetMaintenance?.customer
              ?.customerName && (
                <>
                  | <UserOutlined />{" "}
                  {
                    schedulePreventive?.preventive?.assetMaintenance?.customer
                      ?.customerName
                  }
                </>
              )}
            <CalendarOutlined className="ml-3" />
            {parseDateHH(schedulePreventive?.startDate)}
          </Space>
        </Col>
        <Col>
          <Tag className="p-2">
            {t(
              parseToLabel(
                schedulePreventiveStatus.Options,
                schedulePreventive?.status
              )
            )}
          </Tag>
          <Tag className="p-2 pl-3 pr-3">
            {t(
              parseToLabel(priorityType.Option, schedulePreventive?.importance)
            )}
          </Tag>
        </Col>
      </Row>

      {/* Asset Info */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        {schedulePreventive?.preventive?.assetMaintenance && (
          <Col>
            <Text type="secondary">
              {t("preventiveSchedule.view.labels.asset_style")}
            </Text>
            <div>
              {t(
                parseToLabel(
                  assetType.Options,
                  schedulePreventive?.preventive?.assetMaintenance?.assetStyle
                )
              )}
            </div>
          </Col>
        )}
        {schedulePreventive?.preventive?.assetMaintenance?.assetModel
          ?.asset && (
            <Col>
              <Text type="secondary">
                {t("preventiveSchedule.view.labels.asset_name")}
              </Text>
              <div>
                {
                  schedulePreventive?.preventive?.assetMaintenance?.assetModel
                    ?.asset?.assetName
                }
              </div>
            </Col>
          )}
        {schedulePreventive?.preventive?.assetMaintenance?.assetModel && (
          <Col>
            <Text type="secondary">
              {t("preventiveSchedule.view.labels.model")}
            </Text>
            <div>
              {
                schedulePreventive?.preventive?.assetMaintenance?.assetModel
                  ?.assetModelName
              }
            </div>
          </Col>
        )}
        {schedulePreventive?.preventive?.assetMaintenance && (
          <Col>
            <Text type="secondary">
              {t("preventiveSchedule.view.labels.serial")}
            </Text>
            <div>
              {schedulePreventive?.preventive?.assetMaintenance?.serial}
            </div>
          </Col>
        )}
        <Col>
          <Text type="secondary">
            {t("preventiveSchedule.view.labels.code")}
          </Text>
          <div>{schedulePreventive?.code}</div>
        </Col>
        {schedulePreventive?.amc && (
          <Col
            onClick={() =>
              navigate(
                staticPath.viewAmc +
                "/" +
                (schedulePreventive?.amc?._id || schedulePreventive?.amc?.id)
              )
            }
          >
            <a>
              {" "}
              <Text type="secondary">
                {t("preventiveSchedule.view.labels.contract")}
              </Text>
              <div>{schedulePreventive?.amc?.amcNo}</div>
            </a>
          </Col>
        )}

        {schedulePreventive?.schedulePreventive && (
          <Col>
            <Text type="secondary">
              {t("preventiveSchedule.view.labels.frequency_type")}
            </Text>
            <div>
              {schedulePreventive.preventive?.calenderFrequencyDuration
                ? `${schedulePreventive.preventive?.calenderFrequencyDuration
                } ${t(
                  parseToLabel(
                    frequencyAllOptions.Option,
                    schedulePreventive.preventive?.frequencyType
                  )
                )}`
                : t(
                  parseToLabel(
                    frequencyAllOptions.Option,
                    schedulePreventive.preventive?.frequencyType
                  )
                )}
            </div>
          </Col>
        )}
      </Row>

      {/* Tasks */}
      <div style={{ marginTop: 16 }}>
        <Collapse accordion>
          {schedulePreventive?.tasks?.map((task, idx) => (
            <Panel
              header={
                <Space>
                  <Tooltip
                    title={t("preventiveSchedule.view.labels.task_type")}
                  >
                    <Text>
                      {t(parseToLabel(ServiceTaskType.Options, task?.taskType))}
                    </Text>
                  </Tooltip>
                  |
                  <Tooltip
                    title={t("preventiveSchedule.view.labels.task_name")}
                  >
                    <Text strong>{task?.taskName}</Text>
                  </Tooltip>
                </Space>
              }
              key={idx}
              extra={
                <span style={{ fontWeight: "bold" }}>
                  {t("preventiveSchedule.view.labels.performer_name")}:{" "}
                  {
                    task?.schedulePreventiveTaskAssignUserIsActive?.user
                      ?.fullName
                  }{" "}
                  -{" "}
                  {t(
                    parseToLabel(
                      schedulePreventiveTaskAssignUserStatus.Options,
                      task?.schedulePreventiveTaskAssignUserIsActive?.status
                    )
                  )}
                </span>
              }
            >
              {task?.taskItems?.map((taskItem, taskItemIdx) => (
                <Card className="mb-2 mt-2" key={taskItemIdx}>
                  <div>
                    {taskItemIdx + 1}. {taskItem?.taskItemDescription}
                  </div>
                  <div>
                    <Col span={8}>
                      {((task.taskType === ServiceTaskType.inspection &&
                        (taskItem?.answerTypeInspection ===
                          answerTypeInspection.numbericValue ||
                          taskItem?.answerTypeInspection ===
                          answerTypeInspection.value)) ||
                        task.taskType === ServiceTaskType.monitoring) && (
                          <Form.Item
                            label={t("preventiveSchedule.view.labels.value")}
                          >
                            {taskItem?.value}
                          </Form.Item>
                        )}
                      {task.taskType === ServiceTaskType.inspection &&
                        taskItem.answerTypeInspection ===
                        answerTypeInspection.yesNoNa && (
                          <Form.Item
                            label={t("preventiveSchedule.view.labels.value")}
                          >
                            <Radio.Group disabled value={taskItem?.status}>
                              <Radio value="yes">Yes</Radio>
                              <Radio value="no">No</Radio>
                              <Radio value="na">N/A</Radio>
                            </Radio.Group>
                          </Form.Item>
                        )}
                      {task?.taskType === ServiceTaskType.calibration && (
                        <>
                          <Form.Item
                            label={t("preventiveSchedule.view.labels.value")}
                          >
                            {taskItem.value1}
                          </Form.Item>
                          <Form.Item
                            label={t(
                              "preventiveSchedule.view.labels.work_level"
                            )}
                          >
                            <Radio.Group disabled value={taskItem?.status}>
                              <Radio value="done">Đã xong</Radio>
                              <Radio value="not-done">Không hoàn thành</Radio>
                            </Radio.Group>
                          </Form.Item>
                        </>
                      )}
                    </Col>
                    {taskItem?.comment && (
                      <Col span={24}>
                        <Form.Item
                          label={t("preventiveSchedule.view.labels.comment")}
                        >
                          {taskItem?.comment}
                        </Form.Item>
                      </Col>
                    )}
                    {taskItem?.breakdown && (
                      <Col span={24}>
                        <Form.Item
                          label={t("preventiveSchedule.view.labels.breakdown")}
                        >
                          {taskItem?.breakdown?.code}
                        </Form.Item>
                      </Col>
                    )}
                  </div>
                </Card>
              ))}
            </Panel>
          ))}
        </Collapse>
      </div>

      {/* Files */}
      <div style={{ marginTop: 16 }}>
        <Table
          columns={[
            {
              title: t("preventiveSchedule.view.labels.files_position"),
              dataIndex: "role",
              key: "role",
            },
            {
              title: t("preventiveSchedule.view.labels.files_name"),
              dataIndex: "name",
              key: "name",
            },
            {
              title: t("preventiveSchedule.view.labels.files_size"),
              dataIndex: "size",
              key: "size",
            },
          ]}
          dataSource={files}
          pagination={false}
          locale={{
            emptyText: (
              <span style={{ color: "red" }}>
                {t("preventiveSchedule.view.labels.no_records")}
              </span>
            ),
          }}
          size="small"
          bordered
          rowKey={(r, i) => i}
        />
      </div>

      {/* History */}
      {schedulePreventiveHistorys?.map((item, idx) => (
        <Card
          key={idx}
          style={{ marginBottom: 16, background: "#fafafa", padding: 10 }}
        >
          <Row align="middle">
            <Col>
              <CheckCircleFilled
                style={{ color: "#4caf50", fontSize: 32, marginRight: 8 }}
              />
            </Col>
            <Col flex="auto">
              {item?.schedulePreventiveTask ? (
                <Text strong>
                  {t("preventiveSchedule.view.labels.history_task_name")} :{" "}
                  {item?.schedulePreventiveTask?.taskName}
                </Text>
              ) : (
                <Text strong>
                  {t("preventiveSchedule.view.labels.history_schedule_name")} :{" "}
                  {item?.schedulePreventive?.preventive?.preventiveName}
                </Text>
              )}
              <div>
                <CalendarOutlined /> {parseDateHH(item?.createdAt)}
              </div>
            </Col>
            <Col span={6}>
              <Text strong>
                {t("preventiveSchedule.view.labels.history_status")}:
              </Text>{" "}
              <Text>
                {t(
                  parseToLabel(
                    historySchedulePreventiveStatus.Options,
                    item?.status
                  )
                )}
              </Text>
            </Col>
            <Col span={10} style={{ textAlign: "end" }}>
              {item?.createdBy && (
                <>
                  <Text strong>
                    {t("preventiveSchedule.view.labels.history_assigned_by")} :{" "}
                  </Text>
                  <Text>{item?.createdBy?.fullName}</Text>
                  <br />
                </>
              )}
              {item?.assignedTo && (
                <>
                  <Text strong>
                    {t("preventiveSchedule.view.labels.history_assigned_to")} :{" "}
                  </Text>
                  <Text>{item?.assignedTo?.fullName}</Text>
                </>
              )}
            </Col>
          </Row>
        </Card>
      ))}
    </Card>
  );

  const renderSparePartInfo = () => (
    <Card>
      <Table
        columns={[
          {
            title: t("preventiveSchedule.list.table.request_status"),
            dataIndex: "requestStatus",
            key: "requestStatus",
            align: "center",
            render: (text) =>
              t(
                parseToLabel(
                  schedulePreventiveTaskRequestSparePartStatus.Options,
                  text
                )
              ),
          },
          {
            title: t("preventiveSchedule.list.table.request_sender"),
            dataIndex: "createdBy",
            key: "createdBy",
            render: (text) => <>{text?.fullName}</>,
          },
          {
            title: t("preventiveSchedule.list.table.date_of_request"),
            dataIndex: "createdAt",
            key: "createdAt",
            align: "center",
            render: (text) => parseDateHH(text),
          },
          {
            title: t("preventiveSchedule.list.table.receiver"),
            dataIndex: "holder",
            key: "holder",
            render: (text) => <>{text?.fullName}</>,
          },
          {
            title: t("preventiveSchedule.list.table.date_sent_sending_confirm"),
            dataIndex: "assignUserDate",
            key: "assignUserDate",
            align: "center",
            render: (text) => parseDateHH(text),
          },
          {
            title: t("preventiveSchedule.list.table.spare_parts"),
            dataIndex: "sparePart",
            key: "sparePart",
            align: "center",
            render: (text, record) => (
              <>
                {record?.scheduleePreventiveRequestSparePartDetails
                  ?.map((item) => item?.sparePart?.sparePartsName)
                  .filter(Boolean) // loại bỏ giá trị null/undefined nếu có
                  .join(", ")}
              </>
            ),
          },
          {
            title: t("preventiveSchedule.list.table.action"),
            dataIndex: "action",
            align: "center",
            fixed: "right",
            render: (_, record) => (
              <div>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => onShowDetail(record)}
                  className="ml-2"
                />
              </div>
            ),
          },
        ]}
        dataSource={requestSpareParts}
        pagination={false}
        rowKey={(r, i) => i}
        locale={{
          emptyText: (
            <span style={{ color: "red" }}>{t("preventiveSchedule.list.table.no_spare")}</span>
          ),
        }}
        bordered
      />
    </Card>
  );

  return (
    <div style={{ padding: 24, background: "#ffffff" }}>
      <div style={{ textAlign: "end" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          {t("preventiveSchedule.view.back")}
        </Button>
      </div>
      <Divider />
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: t(
              "preventiveSchedule.detail.title_tabs_maintenance_schedule_information"
            ),
            children: renderScheduleInfo(),
          },
          {
            key: "2",
            label: t(
              "preventiveSchedule.detail.title_tabs_spare_part_information"
            ),
            children: renderSparePartInfo(),
          },
        ]}
      />
      <ViewRequestSparePartDetails
        open={showRequestSparePartDetail}
        onClose={() => setShowRequestSparePartDetail(false)}
        schedulePreventiveTaskRequestSparepart={requestSparePart}
      />
    </div>
  );
}
