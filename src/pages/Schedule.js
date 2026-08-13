import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { dbService } from "../services/DbService";
import { showToast } from "../utils/Alert";
import CategoryManage from "./CategoryManage";
import { IconSchedule } from "../components/Icons";
import PageHeader from "../components/PageHeader";
import "../css/App.css";

dayjs.extend(isBetween);

const parseDate = (dt) => {
  if (!dt) return dayjs();
  if (typeof dt === "string") {
    const normalized = dt.trim().replace(/\s+([+-]\d{2}:?\d{2})$/, "$1");
    return dayjs(normalized);
  }
  return dayjs(dt);
};

const getCategoryBadgeStyle = (category, customColor, isMultiDay, isStart, isEnd) => {
  const hexColor = category?.default_color || category?.color_code || customColor;

  let style = {
    background: "#F1F5F9",
    color: "#0F172A",
    border: "1px solid #CBD5E1",
    borderLeft: "4px solid #334155"
  };

  if (hexColor && hexColor.startsWith("#")) {
    style = {
      background: hexColor + "1F", // ~12% soft background
      color: "#0F172A", // Dark Slate 900 for ultra-high contrast & readability
      border: `1px solid ${hexColor}60`, // ~37% border
      borderLeft: `4px solid ${hexColor}` // 4px solid left accent bar
    };
  } else {
    const categoryName = category?.category_name || (typeof category === "string" ? category : "");
    const name = categoryName.toLowerCase();
    if (name.includes("개인") || name.includes("personal")) {
      style = { background: "#F3E8FF", color: "#581C87", border: "1px solid #D8B4FE", borderLeft: "4px solid #7E22CE" };
    } else if (name.includes("업무") || name.includes("work") || name.includes("회사")) {
      style = { background: "#ECFDF5", color: "#064E3B", border: "1px solid #6EE7B7", borderLeft: "4px solid #047857" };
    } else if (name.includes("생일") || name.includes("기념일") || name.includes("birthday")) {
      style = { background: "#FEF3C7", color: "#78350F", border: "1px solid #FDE68A", borderLeft: "4px solid #D97706" };
    } else if (name.includes("예배") || name.includes("모임") || name.includes("교회")) {
      style = { background: "#E0E7FF", color: "#1E1B4B", border: "1px solid #A5B4FC", borderLeft: "4px solid #4338CA" };
    }
  }

  // Multi-day Bar Connecting Styles
  if (isMultiDay) {
    if (isStart) {
      style.borderRadius = "4px 0 0 4px";
      style.marginRight = "-9px";
      style.paddingRight = "10px";
      style.borderRight = "none";
    } else if (isEnd) {
      style.borderRadius = "0 4px 4px 0";
      style.marginLeft = "-9px";
      style.paddingLeft = "10px";
      style.borderLeft = "none";
    } else {
      style.borderRadius = "0";
      style.marginLeft = "-9px";
      style.marginRight = "-9px";
      style.paddingLeft = "8px";
      style.paddingRight = "8px";
      style.borderLeft = "none";
      style.borderRight = "none";
    }
  } else {
    style.borderRadius = "4px";
  }

  return style;
};

const Schedule = () => {
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [schedules, setSchedules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeq, setEditingSeq] = useState(null);
  const [isCategoryManageModalOpen, setIsCategoryManageModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const monthInputRef = useRef(null);
  const [categorySeq, setCategorySeq] = useState("");
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [isAllday, setIsAllday] = useState(false);
  const [colorCode, setColorCode] = useState("");
  const [location, setLocation] = useState("");
  const [repeatYn, setRepeatYn] = useState("N");

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await dbService.getScheduleCategories(loginUser?.seq);
      if (error) throw error;
      if (data) {
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
      showToast("카테고리를 불러오는데 실패했습니다.", "error");
    }
  }, [loginUser?.seq]);

  const fetchSchedules = useCallback(async () => {
    try {
      const startOfMonth = currentDate.startOf("month").startOf("week").format("YYYY-MM-DDTHH:mm:ss");
      const endOfMonth = currentDate.endOf("month").endOf("week").format("YYYY-MM-DDTHH:mm:ss");

      const { data, error } = await dbService.getSchedulesByDateRange(startOfMonth, endOfMonth, loginUser?.seq);
      if (error) throw error;
      if (data) setSchedules(data);
    } catch (err) {
      console.error(err);
      showToast("일정을 불러오는데 실패했습니다.", "error");
    }
  }, [currentDate, loginUser?.seq]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handlePrevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));
  const handleToday = () => setCurrentDate(dayjs());

  const handleDateClick = (date) => {
    if (!loginUser) {
      showToast("일정 추가는 로그인 후 가능합니다.", "warning");
      return;
    }
    const formattedDate = date.format("YYYY-MM-DD");
    setSelectedDate(date);
    setTitle("");
    setDescription("");
    setCategorySeq("");
    setIsAllday(false);
    setStartDateStr(`${formattedDate}T09:00`);
    setEndDateStr(`${formattedDate}T10:00`);
    setColorCode("");
    setLocation("");
    setRepeatYn("N");
    setEditingSeq(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (e, evt) => {
    e.stopPropagation();
    if (!loginUser) {
      showToast("일정 확인 및 수정은 로그인 후 가능합니다.", "warning");
      return;
    }
    if (loginUser.admin_yn !== "Y" && loginUser.seq !== evt.user_seq) {
      showToast("본인의 일정만 수정/삭제할 수 있습니다.", "warning");
      return;
    }

    const start = parseDate(evt.start_datetime);
    const end = parseDate(evt.end_datetime);
    const checkIsAllday =
      evt.allday_yn === "Y" ||
      (start.format("HH:mm") === "00:00" && (end.format("HH:mm") === "23:59" || end.format("HH:mm") === "23:58"));

    setSelectedDate(start);
    setTitle(evt.title);
    setDescription(evt.description || "");
    setCategorySeq(evt.category_seq);
    setIsAllday(checkIsAllday);

    if (checkIsAllday) {
      setStartDateStr(start.format("YYYY-MM-DD"));
      setEndDateStr(end.format("YYYY-MM-DD"));
    } else {
      setStartDateStr(start.format("YYYY-MM-DDTHH:mm"));
      setEndDateStr(end.format("YYYY-MM-DDTHH:mm"));
    }
    setColorCode(evt.color_code || "");
    setLocation(evt.location || "");
    setRepeatYn(evt.repeat_yn || "N");
    setEditingSeq(evt.seq);
    setIsModalOpen(true);
  };

  const handleAlldayToggle = (checked) => {
    setIsAllday(checked);
    if (checked) {
      const sDateOnly = startDateStr ? startDateStr.split("T")[0] : selectedDate?.format("YYYY-MM-DD");
      const eDateOnly = endDateStr ? endDateStr.split("T")[0] : sDateOnly;
      setStartDateStr(sDateOnly);
      setEndDateStr(eDateOnly);
    } else {
      const sDateOnly = startDateStr ? startDateStr.split("T")[0] : selectedDate?.format("YYYY-MM-DD");
      const eDateOnly = endDateStr ? endDateStr.split("T")[0] : sDateOnly;
      setStartDateStr(`${sDateOnly}T09:00`);
      setEndDateStr(`${eDateOnly}T10:00`);
    }
  };

  const handleSaveSchedule = async () => {
    if (!title.trim() || !startDateStr || !endDateStr) {
      showToast("필수 항목을 모두 입력해주세요.", "warning");
      return;
    }

    let finalStartStr, finalEndStr;
    if (isAllday) {
      const sDate = startDateStr.split("T")[0];
      const eDate = endDateStr.split("T")[0];
      finalStartStr = `${sDate}T00:00:00`;
      finalEndStr = `${eDate}T23:59:59`;
    } else {
      finalStartStr = startDateStr;
      finalEndStr = endDateStr;
    }

    if (dayjs(finalEndStr).isBefore(dayjs(finalStartStr))) {
      showToast("종료 일시는 시작 일시보다 빠를 수 없습니다.", "warning");
      return;
    }

    try {
      const scheduleData = {
        category_seq: categorySeq ? Number(categorySeq) : null,
        user_seq: loginUser.seq,
        title,
        description,
        start_datetime: dayjs(finalStartStr).format("YYYY-MM-DD HH:mm:ssZ"),
        end_datetime: dayjs(finalEndStr).format("YYYY-MM-DD HH:mm:ssZ"),
        color_code: colorCode || null,
        location,
        repeat_yn: repeatYn,
        allday_yn: isAllday ? "Y" : "N"
      };

      let error;
      if (editingSeq) {
        const res = await dbService.updateSchedule(editingSeq, scheduleData);
        error = res.error;
      } else {
        const res = await dbService.insertSchedule(scheduleData);
        error = res.error;
      }

      if (error) throw error;

      showToast(`일정이 ${editingSeq ? "수정" : "등록"}되었습니다.`, "success");
      setIsModalOpen(false);
      fetchSchedules();
    } catch (err) {
      console.error(err);
      showToast(`일정 ${editingSeq ? "수정" : "등록"}에 실패했습니다.`, "error");
    }
  };

  const handleDeleteSchedule = async () => {
    if (!window.confirm("정말 이 일정을 삭제하시겠습니까?")) return;
    try {
      const { error } = await dbService.deleteSchedule(editingSeq);
      if (error) throw error;
      showToast("일정이 삭제되었습니다.", "success");
      setIsModalOpen(false);
      fetchSchedules();
    } catch (err) {
      console.error(err);
      showToast("일정 삭제에 실패했습니다.", "error");
    }
  };

  // Build Calendar Grid
  const calendarGrid = useMemo(() => {
    const startWeek = currentDate.startOf("month").startOf("week");
    const endWeek = currentDate.endOf("month").endOf("week");
    const grid = [];
    let current = startWeek;

    while (current.isBefore(endWeek)) {
      grid.push(current);
      current = current.add(1, "day");
    }
    return grid;
  }, [currentDate]);

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="page-container">
      {/* Header Banner - Google Calendar Style via PageHeader */}
      <PageHeader
        icon={IconSchedule}
        title="일정관리 (Schedule)"
        extraLeft={
          <div
            className="flex items-center gap6 cursor-pointer"
            style={{ position: "relative", whiteSpace: "nowrap", flexShrink: 0 }}
            onClick={() => {
              if (monthInputRef.current && typeof monthInputRef.current.showPicker === "function") {
                monthInputRef.current.showPicker();
              }
            }}
          >
            <h3 className="text20 font-bold m0" style={{ color: "#1E293B", letterSpacing: "-0.5px" }}>
              {currentDate.format("YYYY년 M월")}
            </h3>
            <span className="text12 text-muted">▼</span>
            <input
              ref={monthInputRef}
              type="month"
              value={currentDate.format("YYYY-MM")}
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentDate(dayjs(e.target.value));
                }
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
                margin: 0,
                padding: 0,
                border: "none"
              }}
            />
          </div>
        }
      >
        {/* Segmented Control: [◀] [오늘] [▶] */}
        <div className="calendar-segmented-control flex items-center" style={{ height: "38px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "2px", whiteSpace: "nowrap", flexShrink: 0 }}>
          <button
            className="btn-ghost text14 font-semibold"
            onClick={handlePrevMonth}
            style={{ height: "32px", padding: "0 10px", color: "#475569", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}
            title="이전 달"
          >
            ◀
          </button>
          <button
            className="btn-outline-sm text13 font-semibold"
            onClick={handleToday}
            style={{ height: "32px", padding: "0 14px", color: "#1E293B", background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "6px", whiteSpace: "nowrap" }}
          >
            오늘
          </button>
          <button
            className="btn-ghost text14 font-semibold"
            onClick={handleNextMonth}
            style={{ height: "32px", padding: "0 10px", color: "#475569", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}
            title="다음 달"
          >
            ▶
          </button>
        </div>

        {/* Action Buttons: Category & Add Event */}
        <button
          className="btn-outline-sm flex items-center gap6 font-semibold"
          onClick={() => setIsCategoryManageModalOpen(true)}
          style={{ height: "38px", padding: "0 14px", fontSize: "13px", color: "#334155", whiteSpace: "nowrap", flexShrink: 0, borderRadius: "8px" }}
        >
          카테고리 관리
        </button>

        <button
          className="btn-primary flex items-center gap6 font-semibold"
          onClick={() => handleDateClick(dayjs())}
          style={{ width: "auto", display: "inline-flex", height: "38px", padding: "0 16px", fontSize: "13px", background: "#2563EB", color: "white", whiteSpace: "nowrap", flexShrink: 0, borderRadius: "8px" }}
        >
          + 일정 추가
        </button>
      </PageHeader>

      {/* Calendar Grid Container */}
      <div className="dashboard-card p0" style={{ overflow: "hidden" }}>
        {/* Days of Week Header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
          {daysOfWeek.map((day, idx) => (
            <div
              key={day}
              style={{
                padding: "12px",
                textAlign: "center",
                fontWeight: "700",
                fontSize: "13px",
                color: idx === 0 ? "#DC2626" : idx === 6 ? "#2563EB" : "#334155",
                borderRight: idx < 6 ? "1px solid #E2E8F0" : "none"
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {calendarGrid.map((date, idx) => {
            const isCurrentMonth = date.month() === currentDate.month();
            const isToday = date.isSame(dayjs(), "day");

            const dayEvents = schedules.filter((s) => {
              if (!s || !s.start_datetime || !s.end_datetime) return false;
              const start = parseDate(s.start_datetime);
              const end = parseDate(s.end_datetime);

              const isLegacyShift =
                start.format("HH:mm") === "09:00" &&
                (end.format("HH:mm") === "08:59" || end.format("HH:mm") === "08:58" || end.format("HH:mm") === "09:00") &&
                end.isAfter(start) &&
                end.diff(start, "hour") >= 23 &&
                end.diff(start, "hour") <= 25;

              if (s.repeat_yn === "Y") {
                const isAfterStartYear = date.year() >= start.year();
                const isSameMonthAndDay = date.format("MM-DD") >= start.format("MM-DD") && date.format("MM-DD") <= end.format("MM-DD");
                return isAfterStartYear && isSameMonthAndDay;
              } else {
                const dayStr = date.format("YYYY-MM-DD");
                const startDayStr = start.format("YYYY-MM-DD");
                const endDayStr = isLegacyShift
                  ? start.format("YYYY-MM-DD")
                  : (end.format("HH:mm:ss") === "00:00:00" && end.isAfter(start))
                    ? end.subtract(1, "second").format("YYYY-MM-DD")
                    : end.format("YYYY-MM-DD");

                return dayStr >= startDayStr && dayStr <= endDayStr;
              }
            });

            return (
              <div
                key={date.format("YYYYMMDD")}
                className="calendar-day-cell"
                onClick={() => handleDateClick(date)}
                style={{
                  minHeight: "130px",
                  padding: "8px",
                  background: isCurrentMonth ? "#FFFFFF" : "#F8FAFC",
                  opacity: isCurrentMonth ? 1 : 0.65
                }}
              >
                <div className="flex justify-between items-center mb10">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      fontSize: "13px",
                      fontWeight: isToday ? "bold" : "700",
                      color: isToday ? "#FFFFFF" : date.day() === 0 ? "#DC2626" : date.day() === 6 ? "#2563EB" : !isCurrentMonth ? "#94A3B8" : "#0F172A",
                      background: isToday ? "#2563EB" : "transparent"
                    }}
                  >
                    {date.format("D")}
                  </span>

                  <button
                    type="button"
                    className="cell-quick-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateClick(date);
                    }}
                    title="일정 추가"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-col gap4">
                  {dayEvents.map((evt) => {
                    const start = parseDate(evt.start_datetime);
                    const end = parseDate(evt.end_datetime);
                    const isStart = date.isSame(start, "day");
                    const isEnd = date.isSame(end, "day");
                    const isMultiDay = !start.isSame(end, "day");
                    const isWeekStart = date.day() === 0;

                    const isEvtAllday =
                      evt.allday_yn === "Y" ||
                      (start.format("HH:mm") === "00:00" && (end.format("HH:mm") === "23:59" || end.format("HH:mm") === "23:58"));

                    const catObj = categories.find((c) => c.seq === evt.category_seq) || evt.category;
                    const badgeStyle = getCategoryBadgeStyle(catObj, evt.color_code, isMultiDay, isStart, isEnd);

                    const shouldShowText = isStart || isWeekStart || !isMultiDay;
                    let displayTitle = "";
                    if (shouldShowText) {
                      displayTitle = isEvtAllday ? evt.title : `${start.format("HH:mm")} ${evt.title}`;
                    } else {
                      displayTitle = "\u00A0";
                    }

                    const tooltipText = isEvtAllday
                      ? `${evt.title} (${start.format("YYYY.MM.DD")} ~ ${end.format("YYYY.MM.DD")})`
                      : `${evt.title} (${start.format("YYYY.MM.DD HH:mm")} ~ ${end.format("YYYY.MM.DD HH:mm")})`;

                    return (
                      <div
                        key={evt.seq}
                        className="event-pill-soft"
                        onClick={(e) => handleEventClick(e, evt)}
                        style={{
                          ...badgeStyle,
                          padding: "2.5px 6px",
                          fontSize: "12px",
                          fontWeight: "700",
                          lineHeight: "1.25",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: "pointer",
                          minWidth: 0
                        }}
                        title={tooltipText}
                      >
                        {displayTitle}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Edit/Create Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="dashboard-card"
            style={{
              width: "560px",
              maxWidth: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px"
            }}
          >
            <div className="flex justify-between items-center mb20 pb12" style={{ borderBottom: "1px solid #E2E8F0" }}>
              <h3 className="text18 font-bold m0" style={{ color: "#0F172A" }}>
                {selectedDate?.format("M월 D일")} 일정 {editingSeq ? "수정" : "추가"}
              </h3>
              <button className="candidate-chip-remove" onClick={() => setIsModalOpen(false)} style={{ width: "24px", height: "24px", fontSize: "12px" }}>
                ✕
              </button>
            </div>

            <div className="flex flex-col gap16">
              <div>
                <label className="text13 text-muted font-bold block mb4">
                  카테고리 *
                </label>
                <select
                  className="sidebar-search-input"
                  value={categorySeq || ""}
                  onChange={(e) => setCategorySeq(e.target.value)}
                  style={{ width: "100%", height: "40px", paddingLeft: "12px" }}
                >
                  <option value="">카테고리 없음</option>
                  {categories.map((c) => (
                    <option key={c.seq} value={c.seq}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text13 text-muted font-bold block mb4">
                  일정 제목 *
                </label>
                <input
                  type="text"
                  className="sidebar-search-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 청년부 예배"
                  style={{ width: "100%", height: "40px", paddingLeft: "12px" }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb4">
                  <label className="text13 text-muted font-bold m0">
                    일시 선택 *
                  </label>
                  <label className="text13 font-bold flex items-center gap6 cursor-pointer" style={{ color: "#2563EB" }}>
                    <input
                      type="checkbox"
                      checked={isAllday}
                      onChange={(e) => handleAlldayToggle(e.target.checked)}
                    />
                    <span>하루 종일</span>
                  </label>
                </div>

                <div className="grid-cols-2-md gap12">
                  <div>
                    <label className="text12 text-muted font-semibold block mb4">시작 {isAllday ? "날짜" : "일시"}</label>
                    <input
                      type={isAllday ? "date" : "datetime-local"}
                      className="sidebar-search-input"
                      value={startDateStr}
                      onChange={(e) => setStartDateStr(e.target.value)}
                      style={{ width: "100%", height: "40px", paddingLeft: "12px" }}
                    />
                  </div>
                  <div>
                    <label className="text12 text-muted font-semibold block mb4">종료 {isAllday ? "날짜" : "일시"}</label>
                    <input
                      type={isAllday ? "date" : "datetime-local"}
                      className="sidebar-search-input"
                      value={endDateStr}
                      onChange={(e) => setEndDateStr(e.target.value)}
                      style={{ width: "100%", height: "40px", paddingLeft: "12px" }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text13 text-muted font-bold block mb4">장소</label>
                <input
                  type="text"
                  className="sidebar-search-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예: 교회 본당"
                  style={{ width: "100%", height: "40px", paddingLeft: "12px" }}
                />
              </div>

              <div>
                <label className="text13 text-muted font-bold block mb4">설명</label>
                <textarea
                  className="input-field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="일정 관련 메모..."
                  style={{ width: "100%", minHeight: "80px", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}
                />
              </div>

              <div className="flex items-center gap12 pt8">
                <label className="text13 font-bold flex items-center gap6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={repeatYn === "Y"}
                    onChange={(e) => setRepeatYn(e.target.checked ? "Y" : "N")}
                  />
                  <span>매년 반복 일정 (생일/기념일 등)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center mt28 pt16" style={{ borderTop: "1px solid #E2E8F0" }}>
              {editingSeq ? (
                <button className="btn-outline-sm font-semibold" onClick={handleDeleteSchedule} style={{ color: "#EF4444", borderColor: "#FECDD3", background: "#FFE4E6" }}>
                  일정 삭제
                </button>
              ) : <div />}

              <div className="flex gap12">
                <button className="btn-outline-sm font-semibold" onClick={() => setIsModalOpen(false)}>
                  취소
                </button>
                <button className="btn-primary font-bold" onClick={handleSaveSchedule} style={{ padding: "8px 20px", background: "#2563EB", color: "white" }}>
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryManageModalOpen && (
        <CategoryManage
          isOpen={isCategoryManageModalOpen}
          onClose={() => {
            setIsCategoryManageModalOpen(false);
            fetchCategories();
            fetchSchedules();
          }}
          userSeq={loginUser?.seq}
        />
      )}
    </div>
  );
};

export default Schedule;
