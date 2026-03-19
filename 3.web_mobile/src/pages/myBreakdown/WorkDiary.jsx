import React, { useEffect, useState } from 'react';
import {
    Timeline,
} from "antd";
import {
    ArrowLeftOutlined,
    CheckCircleTwoTone,
} from "@ant-design/icons";
import dayjs from 'dayjs';
import { progressStatus } from '../../utils/constant';
import * as _unitOfWork from "../../api"
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function WorkDiary() {
    const { t } = useTranslation();
    const params = useParams();
    const navigate = useNavigate();
    const [breakdownHistorys, setBreakdownHistorys] = useState([]);
    useEffect(() => {
        fetchGetBreakdownById();
    }, []);

    const fetchGetBreakdownById = async () => {
        let res = await _unitOfWork.breakdown.getBreakdownById({ id: params.id });
        if (res) {
            setBreakdownHistorys(res?.breakdownHistorys);
        }
    };
    const statusToTimelineKey = (status) => {
        if (status === progressStatus.raised) return "created";
        if (status === progressStatus.cloesed) return "closed";
        if (status === progressStatus.cancelled) return "cancelled";
        if (status === progressStatus.experimentalFix) return "experimental_fix";
        if (status === progressStatus.fixedOnTrial) return "fixed_on_trial";
        if (status === progressStatus.assigned) return "assigned";
        if (status === progressStatus.reopen) return "reopen";
        if (status === progressStatus.requestForSupport) return "request_for_support";
        if (status === progressStatus.replacement) return "replacement";
        if (status === progressStatus.accepted) return "accepted";
        if (status === progressStatus.WCA || status === progressStatus.WWA) return "confirmed";
        return null;
    };
    return (
        <div style={{ background: '#f8f8f8', minHeight: '100vh' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 56,
                    background: '#23457b',
                    color: '#fff',
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: 20,
                    boxSizing: 'border-box',
                }}
            >
                <ArrowLeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={() => navigate(-1)}
                />
                <span style={{ flex: 1 }}>{t("breakdown.view.menu.work_diary")}</span>
            </div>
            <div style={{ padding: 16 }}>
                <Timeline className="mt-2">
                    {breakdownHistorys?.map((item, index) => {
                        const key = statusToTimelineKey(item?.status);
                        const label = key ? t(`breakdown.view.timeline.${key}`) : "";
                        return (
                            <Timeline.Item
                                key={index}
                                dot={
                                    <CheckCircleTwoTone twoToneColor="#23457b" style={{ fontSize: 32, marginTop: 10, marginRight: 3 }} />
                                }
                                style={{ marginBottom: 16 }}
                            >
                                <div style={{ padding: "7px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
                                    <>
                                        {label && (
                                            <div>
                                                <b>{label} :</b> {dayjs(item?.workedDate).format("DD/MM/YYYY HH:mm")}
                                            </div>
                                        )}
                                        {item?.estimatedCompletionDate && (<div><b>{t("breakdown.view.timeline.estimated_completion")} : </b> {dayjs(item?.estimatedCompletionDate).format("DD/MM/YYYY HH:mm")}</div>)}
                                        {item?.loginDate && (<div><b>{t("breakdown.view.timeline.login_time")} : </b> {dayjs(item?.loginDate).format("DD/MM/YYYY HH:mm")}</div>)}
                                        {item?.logoutDate && (<div><b>{t("breakdown.view.timeline.logout_time")} : </b> {dayjs(item?.logoutDate).format("DD/MM/YYYY HH:mm")}</div>)}
                                        {item.replacementUser && (<div><b>{t("breakdown.view.timeline.replacement_user")} :</b> {item?.replacementUser?.fullName || "--"}</div>)}
                                        {item.designatedUser && (<div><b>{t("breakdown.view.timeline.designated_user")} :</b> {item?.designatedUser?.fullName || "--"}</div>)}
                                        <div><b>{t("breakdown.view.timeline.comment")}:</b> {item?.comment || "null"}</div>
                                        <div><b>{t("breakdown.view.timeline.status")}:</b> {
                                            t(progressStatus.Option.find(p => p.value === item.status)?.label)
                                        }</div>
                                        {item?.status === progressStatus.assigned && (
                                            <>
                                                {item.workedBy && (
                                                    <div>
                                                        <b>{t("breakdown.view.timeline.assigned_user")} : </b> {item?.workedBy?.fullName || "--"}
                                                    </div>
                                                )}
                                                {item.indicaltedUserBy && (
                                                    <div>
                                                        <b>{t("breakdown.view.timeline.executed_by")} : </b> {item?.indicaltedUserBy?.fullName || "--"}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {item?.status !== progressStatus.assigned && item.workedBy && (
                                            <div>
                                                <b>{t("breakdown.view.timeline.executed_by")} : </b> {item?.workedBy?.fullName || "--"}
                                            </div>
                                        )}
                                    </>
                                </div>
                            </Timeline.Item>
                        );
                    })}
                </Timeline>
            </div>
        </div>
    );
};