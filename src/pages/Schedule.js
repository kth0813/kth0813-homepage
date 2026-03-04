import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { dbService } from "../services/DbService";
import { showToast } from "../utils/Alert";
import { useNavigate } from "react-router-dom";
import CategoryManage from "./CategoryManage";
import "../css/App.css";

dayjs.extend(isBetween);

const Schedule = () => {
  const navigate = useNavigate();
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
  const [colorCode, setColorCode] = useState("");
  const [location, setLocation] = useState("");
  const [repeatYn, setRepeatYn] = useState("N");

  const fetchCategories = async () => {
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
  };

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
  }, []);

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

    setSelectedDate(dayjs(evt.start_datetime.slice(0, 19)));
    setTitle(evt.title);
    setDescription(evt.description || "");
    setCategorySeq(evt.category_seq);
    setStartDateStr(dayjs(evt.start_datetime.slice(0, 19)).format("YYYY-MM-DDTHH:mm"));
    setEndDateStr(dayjs(evt.end_datetime.slice(0, 19)).format("YYYY-MM-DDTHH:mm"));
    setColorCode(evt.color_code || "");
    setLocation(evt.location || "");
    setRepeatYn(evt.repeat_yn || "N");
    setEditingSeq(evt.seq);
    setIsModalOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!title.trim() || !startDateStr || !endDateStr) {
      showToast("필수 항목을 모두 입력해주세요.", "warning");
      return;
    }

    if (dayjs(endDateStr).isBefore(dayjs(startDateStr))) {
      showToast("종료 일시는 시작 일시보다 빠를 수 없습니다.", "warning");
      return;
    }

    try {
      const scheduleData = {
        category_seq: categorySeq ? Number(categorySeq) : null,
        user_seq: loginUser.seq,
        title,
        description,
        start_datetime: dayjs(startDateStr).format("YYYY-MM-DDTHH:mm:ss"),
        end_datetime: dayjs(endDateStr).format("YYYY-MM-DDTHH:mm:ss"),
        color_code: colorCode || null,
        location,
        repeat_yn: repeatYn
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
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="page-title">📅 일정관리</h2>
          <p className="page-description m0 mt8 text-muted">일정을 확인하고 등록하세요.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            className="btn-secondary"
            onClick={() => setIsCategoryManageModalOpen(true)}
            style={{ padding: "0 16px", height: "40px", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            카테고리 관리
          </button>
          <button
            className="btn-primary"
            onClick={() => handleDateClick(dayjs())}
            style={{
              padding: "0 16px",
              height: "40px",
              fontSize: "14px",
              fontWeight: "600",
              width: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--primary-color)",
              color: "white"
            }}
          >
            일정 추가
          </button>
          <button
            className="btn-secondary"
            onClick={handleToday}
            style={{ padding: "0 16px", height: "40px", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            오늘
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "var(--card-bg)",
              padding: "4px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <button className="btn-ghost" onClick={handlePrevMonth} style={{ padding: "4px 8px", fontSize: "18px" }}>
              ◀
            </button>
            <div
              style={{ position: "relative", width: "160px", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}
              onClick={() => {
                if (monthInputRef.current && typeof monthInputRef.current.showPicker === "function") {
                  monthInputRef.current.showPicker();
                }
              }}
            >
              <h3 style={{ margin: 0, fontSize: "20px", color: "var(--header-bg)", pointerEvents: "none" }}>{currentDate.format("YYYY년 MM월")}</h3>
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
            <button className="btn-ghost" onClick={handleNextMonth} style={{ padding: "4px 8px", fontSize: "18px" }}>
              ▶
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "var(--bg-color)", borderBottom: "1px solid var(--border-color)" }}>
          {daysOfWeek.map((day, idx) => (
            <div
              key={day}
              style={{
                padding: "12px",
                textAlign: "center",
                fontWeight: "bold",
                color: idx === 0 ? "var(--danger-color)" : idx === 6 ? "var(--primary-color)" : "var(--text-main)",
                borderRight: idx < 6 ? "1px solid var(--border-color)" : "none"
              }}
            >
              {day}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {calendarGrid.map((date, idx) => {
            const isCurrentMonth = date.month() === currentDate.month();
            const isToday = date.isSame(dayjs(), "day");

            const dayEvents = schedules.filter((s) => {
              const start = dayjs(s.start_datetime.slice(0, 19)).startOf("day");
              const end = dayjs(s.end_datetime.slice(0, 19)).endOf("day");

              if (s.repeat_yn === "Y") {
                // For repeating events, check if the current date matches the month and day,
                // and happens on or after the original start year.
                const isAfterStartYear = date.year() >= start.year();
                const isSameMonthAndDay = date.format("MM-DD") >= start.format("MM-DD") && date.format("MM-DD") <= end.format("MM-DD");

                // If the event spans multiple days (e.g. 12-31 to 01-02), we just do a simple check
                // For simplicity assuming repeat events are usually single days like birthdays/anniversaries
                return isAfterStartYear && isSameMonthAndDay;
              } else {
                return date.isBetween(start, end, null, "[]");
              }
            });

            return (
              <div
                key={date.format("YYYYMMDD")}
                onClick={() => handleDateClick(date)}
                style={{
                  minHeight: "120px",
                  padding: "8px",
                  borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--border-color)" : "none",
                  borderBottom: "1px solid var(--border-color)",
                  background: isCurrentMonth ? "var(--card-bg)" : "var(--bg-color)",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => {
                  if (e.currentTarget.style.background === "var(--card-bg)") e.currentTarget.style.background = "#f1f5f9";
                }}
                onMouseOut={(e) => {
                  if (e.currentTarget.style.background === "rgb(241, 245, 249)" || e.currentTarget.style.background === "#f1f5f9") {
                    e.currentTarget.style.background = "var(--card-bg)";
                  }
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      fontSize: "14px",
                      fontWeight: isToday ? "bold" : "normal",
                      color: isToday ? "white" : date.day() === 0 ? "var(--danger-color)" : date.day() === 6 ? "var(--primary-color)" : !isCurrentMonth ? "var(--text-muted)" : "var(--text-main)",
                      background: isToday ? "var(--primary-color)" : "transparent"
                    }}
                  >
                    {date.format("D")}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {dayEvents.map((evt) => {
                    const bgColor = evt.color_code || evt.category?.default_color || "#3b82f6";
                    return (
                      <div
                        key={evt.seq}
                        onClick={(e) => handleEventClick(e, evt)}
                        style={{
                          background: bgColor,
                          color: "white",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          lineHeight: "1.2",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: "500",
                          cursor: "pointer"
                        }}
                        title={`${evt.title} (${dayjs(evt.start_datetime.slice(0, 19)).format("HH:mm")})`}
                      >
                        {evt.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--card-bg)",
              padding: "24px",
              borderRadius: "12px",
              width: "600px",
              maxWidth: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              overflowX: "hidden",
              boxSizing: "border-box",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
            }}
          >
            <h3 style={{ margin: "0 0 20px 0", color: "var(--header-bg)", borderBottom: "2px solid var(--primary-color)", paddingBottom: "10px" }}>
              {selectedDate?.format("M월 D일")} 일정 {editingSeq ? "수정" : "추가"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="text-muted" style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "13px" }}>
                  카테고리 *
                </label>
                <select
                  className="input-field"
                  value={categorySeq || ""}
                  onChange={(e) => setCategorySeq(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--border-color)", borderRadius: "8px" }}
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
                <label className="text-muted" style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "13px" }}>
                  일정 제목 *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 청년부 예배"
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--border-color)", borderRadius: "8px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label className="text-muted" style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "13px" }}>
                    시작 일시 *
                  </label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--border-color)", borderRadius: "8px", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-muted" style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "13px" }}>
                    종료 일시 *
                  </label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--border-color)", borderRadius: "8px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", marginBottom: "4px" }}>
                <input
                  type="checkbox"
                  id="repeat-checkbox"
                  checked={repeatYn === "Y"}
                  onChange={(e) => setRepeatYn(e.target.checked ? "Y" : "N")}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="repeat-checkbox" style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)", cursor: "pointer" }}>
                  매년 반복 (생일, 기념일 등)
                </label>
              </div>

              <div>
                <label className="text-muted" style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "13px" }}>
                  장소
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예: 본당, 친교실"
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--border-color)", borderRadius: "8px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label className="text-muted" style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "13px" }}>
                  상세 설명
                </label>
                <textarea
                  className="input-field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="일정에 대한 간략한 설명"
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--border-color)", borderRadius: "8px", boxSizing: "border-box", minHeight: "60px", resize: "vertical" }}
                />
              </div>

              <div>
                <label className="text-muted" style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "13px" }}>
                  개별 배경색 지정 (선택)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {(() => {
                    const fallbackColor = categories.find((c) => c.seq.toString() === categorySeq?.toString())?.default_color || "#3b82f6";
                    return (
                      <>
                        <input
                          type="color"
                          value={colorCode || fallbackColor}
                          onChange={(e) => setColorCode(e.target.value)}
                          style={{ width: "40px", height: "40px", padding: "0", border: "1px solid var(--border-color)", borderRadius: "8px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>{colorCode ? colorCode : `카테고리 기본색 (${fallbackColor}) 사용`}</span>
                      </>
                    );
                  })()}
                  {colorCode && (
                    <button className="btn-ghost" onClick={() => setColorCode("")} style={{ fontSize: "12px", padding: "4px 8px", color: "var(--danger-color)" }}>
                      색상 초기화
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: editingSeq ? "space-between" : "flex-end", alignItems: "center", marginTop: "24px" }}>
              {editingSeq && (
                <button className="btn-ghost" onClick={handleDeleteSchedule} style={{ color: "var(--danger-color)", fontWeight: "bold", padding: "8px 12px" }}>
                  삭제
                </button>
              )}
              <div style={{ display: "flex", gap: "8px", marginLeft: editingSeq ? "auto" : "0" }}>
                <button className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ padding: "8px 20px" }}>
                  취소
                </button>
                <button className="btn-primary" onClick={handleSaveSchedule} style={{ padding: "8px 20px" }}>
                  {editingSeq ? "수정하기" : "저장하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCategoryManageModalOpen && (
        <CategoryManage
          onClose={() => {
            setIsCategoryManageModalOpen(false);
            fetchCategories();
          }}
        />
      )}
    </div>
  );
};

export default Schedule;
