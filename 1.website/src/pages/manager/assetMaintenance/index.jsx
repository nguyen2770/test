import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AimOutlined,
  DeleteOutlined,
  DeliveredProcedureOutlined,
  EditOutlined,
  EyeOutlined,
  FileExcelFilled,
  FileExcelOutlined,
  FilterOutlined,
  MenuOutlined,
  MoreOutlined,
  PlusCircleFilled,
  PlusCircleOutlined,
  PlusOutlined,
  RedoOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Dropdown,
  Form,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
} from "antd";
import { assetType, PAGINATION } from "../../../utils/constant";
import * as _unitOfWork from "../../../api";
import Comfirm from "../../../components/modal/Confirm";
import { useNavigate } from "react-router-dom";
import { staticPath } from "../../../router/routerConfig";
import useHeader from "../../../contexts/headerContext";
import { parseToLabel } from "../../../helper/parse-helper";
import { filterOption } from "../../../helper/search-select-helper";
import UpdateMapAssetMaintenance from "./UpdateMapAssetMaintenance";
import AssetMaintenanceLocationHistory from "./AssetMaintenanceLocationHistory";
import noImage from "../../../assets/images/no-image.png";
import dayjs from "dayjs";
import { formatWorkingTime } from "../../../helper/date-helper";
import ShowError from "../../../components/modal/result/errorNotification";
import ShowSuccess from "../../../components/modal/result/successNotification";
import BulkUploadModal from "../../../components/modal/BulkUpload";
import ResourceImportData from "./ResourceImportData";
import useAuth from "../../../contexts/authContext";
import { checkPermission } from "../../../helper/permission-helper";
import { permissionCodeConstant } from "../../../utils/permissionConstant";
import { utils, write } from "xlsx";
import FileSaver from "file-saver";
import DrawerSearchAssetMaintenance from "../../../components/drawer/drawerSearchAssetMaintenance";
import { LabelValue } from "../../../helper/label-value";
import { cleanEmptyValues } from "../../../helper/check-search-value";
const year = dayjs().year();
export default function AssetMaintenance() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { setHeaderTitle } = useHeader();
  const [totalRecord, setTotalRecord] = useState(0);
  const [assetMaintenances, setAssetMaintenances] = useState([]);
  const [assetModels, setAssetModels] = useState([]);
  const [searchForm] = Form.useForm();
  const [isOpenUpdateMapAssetMainten, setIsOpenUpdateMapAssetMainten] =
    useState(false);
  const [assetMaintenance, setAssetMaintenance] = useState(null);
  const [assets, setAssets] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isOpenLocationHistory, setIsOpenLocationHistory] = useState(false);
  const [isOpenSearchaAvanced, setIsisOpenSearchaAvanced] = useState(false);
  const [isOpenBulkUpload, setOpenBulkUpload] = useState(false);
  const [isOpenFileImport, setIsOpenFileImport] = useState(false);
  const [isOpenDrawerSearch, setIsOpenDrawerSearch] = useState(false);
  const { permissions } = useAuth();
  const [searchField, setSearchField] = useState("searchText");
  const [searchFilter, setSearchFilter] = useState({});
  const drawerRef = useRef();

  useEffect(() => {
    if (page > 1)
      fetchGetListAssetMiantenance(page, searchFilter);
    else
      fetchGetListAssetMiantenance(1, searchFilter);
  }, [page]);

  useEffect(() => {
    setHeaderTitle(t("assetMaintenance.list.title"));
  }, [t, setHeaderTitle]);

  const onChangePagination = (value) => {
    setPage(value);
  };

  const fetchGetListAssetMiantenance = async (_page, value) => {
    const searchValue = searchForm.getFieldValue("searchValue");
    let payload = {
      page: _page || page,
      limit: PAGINATION.limit,
      ...cleanEmptyValues(value || {}),
      [searchField]: searchValue,
    };
    const res = await _unitOfWork.assetMaintenance.getListAssetMaintenances(
      payload
    );
    if (res && res.results && res.results?.results) {
      setAssetMaintenances(
        res.results?.results?.map((item) => {
          const purchaseDate = item.purchaseDate
            ? dayjs(item.purchaseDate).add(7, "hour")
            : null;
          const assetAge = purchaseDate
            ? dayjs().diff(purchaseDate, "year")
            : null;
          return {
            ...item,
            purchaseDate,
            assetAge,
          };
        })
      );
      setTotalRecord(res.results.totalResults);
    }
  };

  const exportExcel = (rows, fileName = "BaoCao.xlsx") => {
    if (!Array.isArray(rows)) {
      console.error("exportExcel: rows không phải là mảng", rows);
      return;
    }
    if (!rows.length) {
      console.warn("exportExcel: mảng rỗng");
    }

    // Tạo sheet từ mảng object
    const ws = utils.json_to_sheet(rows);

    // Set độ rộng cột
    ws["!cols"] = [
      { wpx: 50 },
      { wpx: 200 },
      { wpx: 130 },
      { wpx: 150 },
      { wpx: 130 },
      { wpx: 150 },
      { wpx: 120 },
      { wpx: 150 }
    ];

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "BaoCao");

    const wbout = write(wb, { bookType: "xlsx", type: "array" });

    FileSaver.saveAs(
      new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }),
      fileName
    );
  };

  const onClickUpdateMapAssetMaintenance = (value) => {
    setIsOpenUpdateMapAssetMainten(true);
    setAssetMaintenance(value);
  };
  const onClickUpdate = (values) => {
    navigate(staticPath.updateAssetMaintenance + "/" + values.id);
  };

  const onClickClone = (values) => {
    navigate(`${staticPath.updateAssetMaintenance}/${values.id}?mode=clone`);
  };

  const onClickGoToView = (values) => {
    navigate(staticPath.viewAssetMaintenance + "/" + values.id);
  };

  const onDeleteCategory = async (values) => {
    const res = await _unitOfWork.assetMaintenance.deleteAssetMaintenance({
      id: values.id,
    });
    if (res && res.code === 1) {
      fetchGetListAssetMiantenance(1, searchFilter);
      ShowSuccess(
        "topRight",
        t("common.notifications"),
        t("common.messages.success.delete")
      );
    } else {
      ShowError(
        "topRight",
        t("common.notifications"),
        res.message || t("common.errors.delete_failed")
      );
    }
  };

  const onSearch = () => {
    setPage(1);
    fetchGetListAssetMiantenance(1, searchFilter);
  };
  const resetSearch = () => {
    setSearchFilter({});
    if (drawerRef.current)
      drawerRef.current.resetForm();
    setPage(1);
    searchForm.resetFields();
    fetchGetListAssetMiantenance(1);
  };
  const onOpenCreate = () => {
    navigate(staticPath.createAssetMaintenance);
  };
  const onClickLocationHistory = (record) => {
    setAssetMaintenance(record);
    setIsOpenLocationHistory(true);
  };
  const handleUpload = async (file, note) => {
    // const reader = new FileReader();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("note", note);
    console.log("file, note", file, note);
    let res = await _unitOfWork.importData.uploadAssetMaintenanceExcel(
      formData
    );
    if (res && res.code === 1) {
      ShowSuccess(
        "topRight",
        t("common.notifications"),
        t("common.messages.success.upload")
      );
    } else {
      ShowError(
        "topRight",
        t("common.notifications"),
        res.message || t("common.messages.errors.upload_failed")
      );
    }
    fetchGetListAssetMiantenance();
    setOpenBulkUpload(false);
    // reader.onload = async (e) => {
    //   try {
    //     const data = new Uint8Array(e.target.result);
    //     const workbook = read(data, { type: 'array' });
    //     const firstSheetName = workbook.SheetNames[0];
    //     const worksheet = workbook.Sheets[firstSheetName];
    //     const jsonData = utils.sheet_to_json(worksheet);

    //     for (const row of jsonData) {
    //       const assetName = row["Tên tài sản"];
    //       const assetModelName = row["Model"];
    //       const serial = row["Số seri"];
    //       const assetNumber = row["Mã tài sản"];
    //       const isMovable = row["Thiết bị di động"] === 'Có' ? true : false;
    //       // if (customerName) {
    //       //   await _unitOfWork.customer.createCustomer({
    //       //     contactEmail: contactEmail,
    //       //     contactNumber: contactNumber,
    //       //     customerName: customerName,
    //       //     address: address
    //       //   });
    //       // }
    //     }
    //     setOpenBulkUpload(false);
    //     fetchGetListAssetMiantenance();
    //   } catch (error) {
    //     ShowError("topRight", "Thông báo!", "Lỗi khi đọc file Excel.");
    //   }
    // };
    // reader.readAsArrayBuffer(file);
  };
  const placeholderMap = {
    searchText: "Serial / Tên model / Tên tài sản / Mã tài sản / Nhà cung cấp / Phòng ban / Chi nhánh,...",
    code: t("preventive.common.code"),
    preventiveName: t("preventive.list.table.plan_name"),
    serial: t("preventive.common.serial"),
    assetName: t("preventive.list.table.asset_name"),
    assetModelName: t("preventive.list.table.model"),
  };

  const columns = [
    {
      title: t("assetMaintenance.export.index"),
      dataIndex: "id",
      key: "id",
      width: "50px",
      align: "center",
      render: (_text, _record, index) =>
        (page - 1) * PAGINATION.limit + index + 1,
    },
    {
      title: t("assetMaintenance.list.title_info"),
      // dataIndex: "assetMaintenance",
      render: (text) => (
        <div>
          <LabelValue
            label={t("breakdown.list.columns.asset_type")}
            value={t(parseToLabel(assetType.Options, text?.assetStyle))}
          />
          <LabelValue
            label={t("breakdown.list.columns.asset_name")}
            value={text?.assetModel?.asset?.assetName}
          />
          {/* <LabelValue
            label={t("assetMaintenance.list.table.asset_number")}
            value={text?.assetNumber}
          /> */}
          <LabelValue
            label={t("breakdown.list.columns.model")}
            value={text?.assetModel?.assetModelName}
          />
          {/* <LabelValue
            label={t("breakdown.list.columns.serial")}
            value={text?.serial}
          /> */}
        </div>
      ),
    },
    // {
    //   title: t("assetMaintenance.list.table.asset_name"),
    //   dataIndex: "assetModel",
    //   align: "center",
    //   className: "text-left-column",
    //   render: (text, record) => {
    //     return <span>{text?.asset?.assetName}</span>;
    //   },
    // },
    {
      title: t("assetMaintenance.list.table.asset_number"),
      dataIndex: "assetNumber",
      align: "center",
      className: "text-left-column",
    },
    // {
    //   title: t("assetMaintenance.list.table.model"),
    //   dataIndex: "assetModel",
    //   align: "center",
    //   className: "text-left-column",
    //   render: (text, record) => {
    //     return <span>{record?.assetModel?.assetModelName || []}</span>;
    //   },
    // },
    {
      title: t("assetMaintenance.list.table.serial"),
      dataIndex: "serial",
      align: "center",
      className: "text-left-column",
    },
    // {
    //   title: "Ngày cài đặt",
    //   dataIndex: "installationDate",
    //   align: "center",
    //   className: "text-left-column",
    //   render: (text, record) => parseDateHH( text)
    // },
    // {
    //   title: t("assetMaintenance.list.table.asset_style"),
    //   dataIndex: "assetStyle",
    //   align: "center",
    //   className: "text-left-column",
    //   render: (text, record) => t(t(parseToLabel(assetType.Options, text))),
    // },
    {
      title: t("assetMaintenance.list.table.image"),
      dataIndex: "resource",
      align: "center",
      render: (text, record) => {
        return record?.resource ? (
          <img
            src={_unitOfWork.resource.getImage(record?.resource?.id)}
            alt="anhthietbi.atl"
            style={{
              width: 80,
              height: 60,
              objectFit: "cover",
            }}
          />
        ) : (
          <img
            src={noImage}
            alt="anhthietbi.atl"
            style={{
              width: 80,
              height: 60,
              objectFit: "cover",
            }}
          />
        );
      },
    },
    {
      title: t("assetMaintenance.list.table.down_time", {
        year,
        defaultValue: `Down Time  (${year})`,
      }),
      dataIndex: "totalDowntime",
      align: "center",
      render: (text, record) => formatWorkingTime(text),
    },
    {
      title: t("assetMaintenance.list.table.asset_age"),
      dataIndex: "assetAge",
      align: "center",
      render: (text, record) => record?.assetAge || 0,
    },
    {
      title: t("assetMaintenance.table.action"),
      dataIndex: "action",
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const menuItems = [
          checkPermission(permissions, permissionCodeConstant.asset_update) && {
            key: "edit",
            label: t("assetMaintenance.actions.edit"),
            icon: <EditOutlined />,
            onClick: () => onClickUpdate(record),
          },
          checkPermission(permissions, permissionCodeConstant.asset_move) && {
            key: "move",
            label: t("assetMaintenance.actions.move"),
            icon: <AimOutlined />,
            onClick: () => onClickUpdateMapAssetMaintenance(record),
          },
          checkPermission(
            permissions,
            permissionCodeConstant.asset_view_move_history
          ) && {
            key: "moveHistory",
            label: t("assetMaintenance.actions.move_history"),
            icon: <DeliveredProcedureOutlined />,
            onClick: () => onClickLocationHistory(record),
          },
          checkPermission(permissions, permissionCodeConstant.asset_create) &&
          {
            key: "clone",
            label: t("Nhân bản"),
            icon: <PlusCircleOutlined />,
            onClick: () => onClickClone(record),
          },
          checkPermission(permissions, permissionCodeConstant.asset_delete) && {
            key: "delete",
            label: t("assetMaintenance.actions.delete"),
            icon: <DeleteOutlined />,
            onClick: () =>
              Comfirm(t("assetMaintenance.messages.confirm_delete"), () =>
                onDeleteCategory(record)
              ),
          },

        ].filter(Boolean);

        return (
          <div>
            {/* nút xem chi tiết */}
            {checkPermission(
              permissions,
              permissionCodeConstant.asset_view_detail
            ) && (
                <Tooltip title={t("assetMaintenance.actions.detail")}>
                  <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => onClickGoToView(record)}
                  />
                </Tooltip>
              )}

            {/* dropdown gom action */}
            {menuItems.length > 0 && (
              <Dropdown
                trigger={["click"]}
                menu={{ items: menuItems }}
              >
                <Button
                  icon={<MoreOutlined />}
                  size="small"
                  className="ml-2"
                />
              </Dropdown>
            )}
          </div>
        );
      },
    }
  ];
  const goToSearchQrCode = () => {
    navigate(staticPath.searchQrCodeAssetMaintenance);
  };
  const prepareDataExportExcel = (data, { assetTypeOptions, t }) => {
    return data.map((item, index) => {
      return {
        STT: index + 1,
        "Tên tài sản": item?.assetModel?.asset?.assetName || "",
        "Mã tài sản": item?.assetNumber || "",
        "Model": item?.assetModel?.assetModelName || "",
        "Số serial": item?.serial || "",
        "Kiểu thiết bị": t ? t(parseToLabel(assetTypeOptions, item?.assetStyle)) || "" : parseToLabel(assetTypeOptions, item?.assetStyle) || "",
        "Tuổi thiết bị": item?.assetAge ?? "",
        [`Down Time (${dayjs().year()})`]: formatWorkingTime(item?.totalDowntime || 0)
      };
    });
  };
  const handleExportExcel = async () => {
    try {
      const formValues = searchForm.getFieldsValue();
      const payload = {
        page: 1,
        limit: totalRecord,
        ...formValues
      };

      const res = await _unitOfWork.assetMaintenance.getListAssetMaintenances(payload);

      const list = res?.results?.results;
      if (!Array.isArray(list) || !list.length) {
        console.warn("Không có dữ liệu để xuất");
        return;
      }

      const rawData = list.map(item => {
        const purchaseDate = item.purchaseDate ? dayjs(item.purchaseDate).utcOffset(7) : null;
        const assetAge = purchaseDate ? dayjs().diff(purchaseDate, "year") : null;
        return { ...item, purchaseDate, assetAge };
      });

      const dataExport = prepareDataExportExcel(rawData, {
        assetTypeOptions: assetType.Options,
        t
      });

      console.log("dataExport isArray:", Array.isArray(dataExport));
      exportExcel(dataExport, "BaoCao.xlsx");
    } catch (e) {
      console.error("Lỗi xuất Excel:", e);
    }
  };

  const items = [
    // {
    //   key: "searchQr",
    //   label: (
    //     <div onClick={() => goToSearchQrCode()}>
    //       <SearchOutlined /> {t("assetMaintenance.actions.search_qr_code")}
    //     </div>
    //   ),
    // },
    {
      key: "bulkUpload",
      label: (
        <div onClick={() => setOpenBulkUpload(true)}>
          <UploadOutlined /> {t("assetMaintenance.actions.bulk_upload")}
        </div>
      ),
    },
    {
      key: "fileBulkUpload",
      label: (
        <div onClick={() => setIsOpenFileImport(true)}>
          <FileExcelOutlined /> {t("assetMaintenance.actions.file_bulk_upload")}
        </div>
      ),
    },
    {
      key: "export excel",
      label: (
        <div
          onClick={() => handleExportExcel()}
        >
          <FileExcelFilled /> Xuất file Excel
        </div>
      )
    }
  ];

  if (checkPermission(permissions, permissionCodeConstant.asset_search_Qr_code)) {
    items.push({
      key: "searchQr",
      label: (
        <div onClick={() => goToSearchQrCode()}>
          <SearchOutlined /> {t("assetMaintenance.actions.search_qr_code")}
        </div>
      ),
    });
  }

  return (
    <div className="p-3 pb-5">
      <Form
        className="search-form"
        form={searchForm}
        layout="vertical"
        onFinish={onSearch}
      >
        <Row gutter={16} >
          <Col span={8}>
            <Form.Item style={{ marginBottom: 0 }}>
              <Input.Group compact>
                <Select

                  value={searchField}
                  style={{ width: "35%" }}
                  onChange={(value) => {
                    setSearchField(value);
                    searchForm.setFieldValue("searchValue", "");
                  }}
                  options={[
                    { value: "searchText", label: t("preventive.common.all") },
                    { value: "assetNumber", label: t("assetMaintenance.list.table.asset_number") },
                    { value: "assetName", label: t("assetMaintenance.list.table.asset_name") },
                    { value: "serial", label: t("assetMaintenance.list.table.serial") },
                  ]}
                />
                <Form.Item name="searchValue" noStyle>
                  <Input

                    style={{ width: "65%" }}
                    placeholder={placeholderMap[searchField]}
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Space>
              <Button type="primary" htmlType="submit">
                <SearchOutlined />
                {t("common.buttons.search")}
              </Button>
              <Button className="bt-green" onClick={resetSearch}>
                <RedoOutlined />
                {t("common.buttons.reset")}
              </Button>
              <Button
                title={t("assetMaintenance.actions.advanced_search")}
                className="px-2 mr-2"
                onClick={() => setIsOpenDrawerSearch(true)}
              >
                <FilterOutlined
                  style={{ fontSize: 20, cursor: "pointer" }}
                />
              </Button>
            </Space>


            {/* <Button
              className="button ml-2"
              onClick={() => exportExcel(assetMaintenances, "BaoCao.xlsx")}
            >
              <FileExcelFilled />
              Xuất file Excel
            </Button> 
            <Button
              className="button ml-2"
              onClick={() => setOpenBulkUpload(true)}
            >
              <UploadOutlined />
              {t("assetMaintenance.actions.bulk_upload")}
            </Button>
            <Button
              className="button ml-2"
              onClick={() => setIsOpenFileImport(true)}
            >
              <FileExcelOutlined />
              {t("assetMaintenance.actions.file_bulk_upload")}
            </Button> */}

          </Col>

          <Col span={8}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
              <Dropdown menu={{ items }} trigger={["click"]}>
                <MenuOutlined style={{ fontSize: 20, cursor: "pointer" }} />
              </Dropdown>
              {checkPermission(permissions, permissionCodeConstant.asset_create) && (
                <Button type="primary" onClick={() => onOpenCreate()}>
                  <PlusOutlined />
                  {t("assetMaintenance.actions.create")}
                </Button>
              )}
            </div>
          </Col>

          <Col span={24} style={{ textAlign: "right" }}>
            <span
              className="total-record-table"
              style={{ fontWeight: 600, fontSize: "16px" }}
            >
              {t("assetMaintenance.list.total", { count: totalRecord })}
            </span>
          </Col>
        </Row>
        <Table
          rowKey="id"
          columns={columns}
          key={"id"}
          dataSource={assetMaintenances}
          bordered
          pagination={false}
          scroll={{ x: "max-content" }}
        ></Table>
        <Pagination
          className="pagination-table mt-2 mb-3"
          onChange={onChangePagination}
          pageSize={PAGINATION.limit}
          total={totalRecord}
          current={page}
        />
      </Form>
      <UpdateMapAssetMaintenance
        open={isOpenUpdateMapAssetMainten}
        onCancel={() => setIsOpenUpdateMapAssetMainten(false)}
        assetMaintenance={assetMaintenance}
        onReset={fetchGetListAssetMiantenance}
      />
      <AssetMaintenanceLocationHistory
        open={isOpenLocationHistory}
        onCancel={() => setIsOpenLocationHistory(false)}
        assetMaintenance={assetMaintenance}
      />
      <BulkUploadModal
        open={isOpenBulkUpload}
        onCancel={() => setOpenBulkUpload(false)}
        onUpload={handleUpload}
        templateUrl="/file/templateAsset.xlsx"
      />
      <ResourceImportData
        open={isOpenFileImport}
        handleOk={() => setIsOpenFileImport(false)}
        handleCancel={() => setIsOpenFileImport(false)}
        onRefresh={fetchGetListAssetMiantenance}
      />
      <DrawerSearchAssetMaintenance
        isOpen={isOpenDrawerSearch}
        onClose={() => setIsOpenDrawerSearch(false)}
        ref={drawerRef}
        onCallBack={(value) => {
          searchForm.resetFields(["searchValue"]);
          setSearchFilter(value);
          if (!value.isClose) {
            setPage(1);
            fetchGetListAssetMiantenance(1, value);
          }
        }}
      />
    </div>
  );
}
