import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar as BigCalendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import localizer from "./dayjsLocalizer";
import * as _unitOfWork from "../../api";
import dayjs from "dayjs";
import { breakdownUserStatus } from "../../utils/constant";
import { staticPath } from "../../router/RouteConfig";
import { useTranslation } from "react-i18next";
export default function MyCalendar() {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const { t } = useTranslation();

  const { defaultDate, formats } = useMemo(
    () => ({
      defaultDate: new Date(),
      formats: {
        eventTimeRangeEndFormat: (date, culture, localizer) =>
          " << " + localizer.format(date, "hh:mm A", culture),
      },
    }),
    []
  );
  const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);

  const messages = {
    today: t("dashboard.calendar.messages.today"),
    previous: t("dashboard.calendar.messages.previous"),
    next: t("dashboard.calendar.messages.next"),
    month: t("dashboard.calendar.messages.month"),
    week: t("dashboard.calendar.messages.week"),
    day: t("dashboard.calendar.messages.day"),
    agenda: t("dashboard.calendar.messages.agenda"),
    date: t("dashboard.calendar.messages.date"),
    time: t("dashboard.calendar.messages.time"),
    event: t("dashboard.calendar.messages.event"),
    allDay: t("dashboard.calendar.messages.allDay"),
    noEventsInRange: t("dashboard.calendar.messages.noEventsInRange"),
  };
  useEffect(() => {
    const start = dayjs(date).startOf("month").startOf("week");
    const end = dayjs(date).endOf("month").endOf("week");
    fetchGetMyTicketCalender(start, end);
  }, [date]);

  const fetchGetMyTicketCalender = async (startDate, endDate) => {
    let res = await _unitOfWork.report.getMyTicketCalender({
      startDate,
      endDate,
    });
    if (res && res.code === 1) {
      setEvents(
        res?.data?.map((item) => ({
          id: item?.breakdown?.id || item?.breakdown?._id,
          title: item?.asset?.assetName + " - " + item?.breakdown?.code,
          start: new Date(item?.expectedRepairTime),
          end: dayjs(item?.expectedRepairTime).endOf("day").toDate(),
          status: item?.status,
          allDay:true
        }))
      );
    }
  };

  const onRangeChange = useCallback((range) => {
    let start, end;
    if (Array.isArray(range)) {
      // Month hoặc Week
      start = range[0];
      end = range[range.length - 1];
    } else {
      // Day hoặc Agenda
      start = range.start;
      end = range.end;
    }

    fetchGetMyTicketCalender(dayjs(start), dayjs(end));
  }, []);
  const onSelectEvent = useCallback((calEvent) => {
    window.open(staticPath.viewMyBreakdown + "/" + calEvent.id);
  }, []);
  return (
    <div className="bg-white shadow-md rounded-xl">
      <BigCalendar
        formats={formats}
        defaultDate={defaultDate}
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "600px" }}
        onRangeChange={onRangeChange}
        onNavigate={onNavigate}
        showMultiDayTimes
        className="rounded-lg"
        onSelectEvent={onSelectEvent}
        messages={messages}
        eventPropGetter={(event) => {
          const option = breakdownUserStatus.Option.find(
            (opt) => opt.value === event.status
          );
          const color = option?.color || "#d9d9d9"; // fallback màu xám
          return {
            style: {
              backgroundColor: color,
              color: "white",
              borderRadius: "6px",
              padding: "2px 6px",
              fontWeight: 500,
            },
          };
        }}
      />
    </div>
  );
}
