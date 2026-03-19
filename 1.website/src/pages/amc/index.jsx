import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  RedoOutlined,
  SearchOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Pagination,
  Space,
  Form,
  Table,
  Tooltip,
  Card,
  Row,
  Col,
  Input,
} from "antd";
import Confirm from "../../components/modal/Confirm";
import { useNavigate } from "react-router-dom";
import { staticPath } from "../../router/routerConfig";
import useHeader from "../../contexts/headerContext";
import * as _unitOfWork from "../../api";
import { useEffect, useState } from "react";
import { PAGINATION } from "../../utils/constant";
import { parseDate } from "../../helper/date-helper";
import useAuth from "../../contexts/authContext";
import { checkPermission } from "../../helper/permission-helper";
import { permissionCodeConstant } from "../../utils/permissionConstant";
import { useTranslation } from "react-i18next";
import ShowSuccess from "../../components/modal/result/successNotification";

export default function AmcManager() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setHeaderTitle } = useHeader();
  const [amcs, setAmcs] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [page, setPage] = useState(1);
  const [searchForm] = Form.useForm();
  const { permissions } = useAuth();

  useEffect(() => {
    setHeaderTitle(t("amc.manager.title"));
  }, []);
  useEffect(() => {
    if (page > 1) {
      fetchServicePackages();
    } else {
      fetchServicePackages(1);
    }
  }, [page]);
  const fetchServicePackages = async (_page) => {
    let payload = {
      page: _page || page,
      limit: PAGINATION.limit,
      ...searchForm.getFieldsValue(),
    };
    let res = await _unitOfWork.amc.getAmcs(payload);
    if (res && res.code === 1) {
      setAmcs(res.amcs);
      setTotalRecord(res.data.totalResults);
    }
  };
  const onChangePagination = (value) => {
    setPage(value);
  };
  const resetSearch = () => {
    searchForm.resetFields();
    setPage(1);
    fetchServicePackages(1);
  };
  const onSearch = () => {
    setPage(1);
    fetchServicePackages(1);
  };
  const onClickCreate = () => {
    navigate(staticPath.createAmc);
  };
  const onUpdate = (value) => {
    navigate(staticPath.updateAmc + "/" + value._id);
  };
  const onDetail = (value) => {
    navigate(staticPath.viewAmc + "/" + value._id);
  };
  const onMapping = (value) => {
    navigate(staticPath.amcMappingAssetMaintenance + "/" + value._id);
  };
  const onDelete = async (value) => {
    let res = await _unitOfWork.amc.deleteAmc(value?._id || value?.id);
    if (res && res.code === 1) {
      ShowSuccess(
        "topRight",
        t("common.notifications"),
        t("preventive.messages.delete_success")
      );
      fetchServicePackages();
    }
  };
  const columns = [
    {
      title: t("amc.manager.table.index"),
      dataIndex: "key",
      width: 50,
      align: "center",
      render: (_, __, _idx) => {
        return <span>{_idx + 1 + PAGINATION.limit * (page - 1)}</span>;
      },
    },
    {
      title: t("amc.manager.table.contract_no"),
      dataIndex: "amcNo",
      className: "text-left-column",
    },
    {
      title: t("amc.manager.table.customer"),
      dataIndex: "customerName",
      className: "text-left-column",
      render: (_, record) => record?.customer?.customerName,
    },
    {
      title: t("amc.manager.table.contract_period"),
      dataIndex: "requestDate",
      align: "center",
      render: (text) => <>{parseDate(text)}</>,
    },
    {
      title: t("amc.manager.table.actions"),
      dataIndex: "action",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          {/* {checkPermission(
            permissions,
            permissionCodeConstant.maintenance_contract_assign_executor
          ) && (
              <Tooltip title={t("amc.manager.table.assign_executor")}>
                <Button
                  onClick={() => onUpdate(record)}
                  type="primary"
                  className="bt-yellow"
                  icon={<UserOutlined />}
                  size="small"
                />
              </Tooltip>
            )}
          <Tooltip title={t("calibration_contract.buttons.linking_contracts_to_assets")}>
            )} */}
          <Tooltip
            title={t(
              "calibration_contract.buttons.linking_contracts_to_assets"
            )}
          >
            <Button
              onClick={() => onMapping(record)}
              type="primary"
              className="bt-blue"
              icon={<UsergroupAddOutlined />}
              size="small"
            />
          </Tooltip>
          {checkPermission(
            permissions,
            permissionCodeConstant.maintenance_contract_update
          ) && (
            <Tooltip title={t("amc.manager.table.edit")}>
              <Button
                onClick={() => onUpdate(record)}
                type="primary"
                icon={<EditOutlined />}
                size="small"
              />
            </Tooltip>
          )}
          {checkPermission(
            permissions,
            permissionCodeConstant.maintenance_contract_view_detail
          ) && (
            <Tooltip title={t("amc.manager.table.detail")}>
              <Button
                onClick={() => onDetail(record)}
                type="primary"
                className="bt-green"
                icon={<EyeOutlined />}
                size="small"
              />
            </Tooltip>
          )}
          {checkPermission(
            permissions,
            permissionCodeConstant.maintenance_contract_delete
          ) && (
            <Tooltip title={t("amc.manager.table.delete")}>
              <Button
                onClick={() =>
                  Confirm(t("amc.manager.table.confirm_delete"), () =>
                    onDelete(record)
                  )
                }
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Form
        className="search-form"
        form={searchForm}
        layout="vertical"
        onFinish={onSearch}
      >
        <Row className="mb-1" gutter={32}>
          <Col span={6}>
            <Form.Item
              id=""
              label={t("orderPurchase.form.fields.contract_number")}
              name="amcNo"
            >
              <Input placeholder={t("amc.form.contract_no_placeholder")} />
            </Form.Item>
          </Col>{" "}
        </Row>
        <Row>
          <Col
            span={12}
            style={{ display: "flex", alignItems: "center", marginBottom: 2 }}
          >
            <Button type="primary" className="mr-2" htmlType="submit">
              <SearchOutlined />
              {t("preventive.buttons.search")}
            </Button>
            <Button className="bt-green mr-2" onClick={resetSearch}>
              <RedoOutlined />
              {t("preventive.buttons.reset")}
            </Button>
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            {checkPermission(
              permissions,
              permissionCodeConstant.maintenance_contract_create
            ) && (
              <Button onClick={() => onClickCreate()} type="primary">
                <PlusOutlined />
                {t("amc.manager.create_button")}
              </Button>
            )}
          </Col>
          <Col span={24} style={{ fontSize: 16, textAlign: "right" }}>
            <b>{t("amc.manager.total", { count: totalRecord || 0 })}</b>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={amcs}
          className="custom-table"
          pagination={false}
        />
        {totalRecord > 0 && (
          <Pagination
            className="pagination-table mt-2"
            onChange={onChangePagination}
            pageSize={PAGINATION.limit}
            total={totalRecord}
          />
        )}
      </Form>
    </Card>
  );
}
