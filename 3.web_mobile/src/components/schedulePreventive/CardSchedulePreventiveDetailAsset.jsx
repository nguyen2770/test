import { parseDatetime } from "../../helper/date-helper";
import { parseToLabel } from "../../helper/parse-helper";
import {
  frequencyAllOptions,
  priorityType,
  scheduleBasedOnType,
} from "../../utils/schedulePreventive.constant";
import { useTranslation } from "react-i18next";

const CardSchedulePreventiveDetailAsset = ({
  schedulePreventive,
  assetMaintenance,
  schedulePreventiveTask,
}) => {
  const { t } = useTranslation();
  const generateFrequency = () => {
    const label = t(
      parseToLabel(
        frequencyAllOptions.Option,
        schedulePreventive?.preventive?.frequencyType
      )
    );
    return schedulePreventive?.preventive?.calenderFrequencyDuration
      ? ` ${schedulePreventive?.preventive?.calenderFrequencyDuration} ${label}`
      : label;
  };
  return (
    <>
      <div
        style={{ fontWeight: 600, fontSize: 18, margin: "24px 0 12px 20px" }}
      >
        {t("schedulePreventive.detail.asset_section_title")}
      </div>
      <div
        style={{
          background: "#f5f5f7",
          margin: "0 12px 18px 12px",
          padding: "10px 0",
          boxShadow: "0 1px 6px #0001",
        }}
      >
        <RowDetail
          label={t("schedulePreventive.detail.asset_name")}
          value={assetMaintenance?.assetModel?.asset?.assetName}
        />
        <RowDetail
          label={t("schedulePreventive.detail.model")}
          value={assetMaintenance?.assetModel?.assetModelName}
        />
        <RowDetail
          label={t("schedulePreventive.detail.serial")}
          value={assetMaintenance?.serial}
        />
        <RowDetail
          label={t("schedulePreventive.detail.asset_number")}
          value={assetMaintenance?.assetNumber}
        />
        <RowDetail
          label={t("schedulePreventive.detail.supplier")}
          value={assetMaintenance?.assetModel?.supplier?.supplierName}
        />
        <RowDetail
          label={t("schedulePreventive.detail.manufacturer")}
          value={assetMaintenance?.assetModel?.manufacturer?.manufacturerName}
        />
        <RowDetail
          label={t("schedulePreventive.detail.category")}
          value={assetMaintenance?.assetModel?.category?.categoryName}
        />
        <RowDetail
          label={t("schedulePreventive.detail.user")}
          value={assetMaintenance?.customer?.customerName}
        />
        <RowDetail
          label={t("schedulePreventive.detail.contact_number")}
          value={assetMaintenance?.customer?.contactNumber}
        />
        <RowDetail
          label={t("schedulePreventive.detail.branch")}
          value={assetMaintenance?.location?.branch?.branchName}
        />
        <RowDetail
          label={t("schedulePreventive.detail.location")}
          value={assetMaintenance?.addressNote}
        />
        <RowDetail
          label={t("schedulePreventive.detail.building")}
          value={assetMaintenance?.location?.building?.buildingName}
        />
        <RowDetail
          label={t("schedulePreventive.detail.floor")}
          value={assetMaintenance?.location?.floor?.floorName}
        />
        <RowDetail
          label={t("schedulePreventive.detail.department")}
          value={assetMaintenance?.location?.branch?.departmentName}
        />
      </div>

      <div
        style={{ fontWeight: 600, fontSize: 18, margin: "24px 0 12px 20px" }}
      >
        {t("schedulePreventive.detail.schedule_section_title")}
      </div>
      <div
        style={{
          background: "#f5f5f7",
          margin: "0 12px 18px 12px",
          padding: "10px 0",
          boxShadow: "0 1px 6px #0001",
        }}
      >
        <RowDetail
          label={t("schedulePreventive.detail.schedule_id")}
          value={schedulePreventive?.code}
        />
        <RowDetail
          label={t("schedulePreventive.detail.schedule_name")}
          value={schedulePreventive?.preventive?.preventiveName}
        />
        <RowDetail
          label={t("menu.settings.contract")}
          value={schedulePreventiveTask?.amc?.amcNo || schedulePreventive?.amc?.amcNo}
        />
        <RowDetail
          label={t("schedulePreventive.detail.start_date")}
          value={parseDatetime(schedulePreventive?.startDate)}
        />
        <RowDetail
          label={t("schedulePreventive.detail.updated_at")}
          value={parseDatetime(schedulePreventive?.updatedAt)}
        />
        <RowDetail
          label={t("schedulePreventive.detail.frequency_based_on")}
          value={generateFrequency()}
        />
        <RowDetail
          label={t("schedulePreventive.detail.managed_by")}
          value={t(
            parseToLabel(
              scheduleBasedOnType.Option,
              schedulePreventive?.preventive?.scheduleType
            )
          )}
        />
        <RowDetail
          label={t("schedulePreventive.detail.priority")}
          value={t(
            parseToLabel(
              priorityType.Option,
              schedulePreventive?.preventive?.importance
            )
          )}
        />
      </div>
    </>
  );
};

export default CardSchedulePreventiveDetailAsset;

function RowDetail({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 8px",
        borderBottom: "1px solid #eee",
        fontSize: 16,
      }}
    >
      <span style={{ color: "#888" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
