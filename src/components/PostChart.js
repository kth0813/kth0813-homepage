import React, { useEffect, useState, useCallback } from "react";
import { dbService } from "../services/DbService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { IconBoard } from "./Icons";

function PostChart() {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [yearList, setYearList] = useState([]);

  const fetchStats = useCallback(async () => {
    try {
      const { data: yearData } = await dbService.getMonthlyPostYears();
      let activeYear = selectedYear;

      if (yearData && yearData.length > 0) {
        const uniqueYears = [...new Set(yearData.map((item) => item.year))].filter(Boolean).sort().reverse();
        setYearList(uniqueYears);

        if (uniqueYears.length > 0 && (!activeYear || !uniqueYears.includes(activeYear))) {
          activeYear = uniqueYears[0];
          setSelectedYear(activeYear);
        }
      }

      const { data: stats, error } = await dbService.getMonthlyPostCounts(activeYear);

      const safeStats = !error && Array.isArray(stats) ? stats : [];
      const formattedData = Array.from({ length: 12 }, (_, i) => {
        const monthStr = (i + 1).toString().padStart(2, "0");
        const found = safeStats.find((s) => s.month === monthStr);
        return {
          month: `${i + 1}월`,
          게시글수: found ? parseInt(found.post_count, 10) : 0
        };
      });
      setData(formattedData);
    } catch (err) {
      console.error("PostChart fetch error:", err);
      const fallback = Array.from({ length: 12 }, (_, i) => ({
        month: `${i + 1}월`,
        게시글수: 0
      }));
      setData(fallback);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="chart-wrapper dashboard-card p20" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
      <div className="chart-header flex justify-between items-center mb16">
        <div className="flex items-center gap8">
          <IconBoard size={20} color="#2563EB" />
          <h3 className="chart-title text16 font-bold m0" style={{ color: "#0F172A" }}>
            게시글 작성 추이 (월별)
          </h3>
        </div>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="select-field"
          style={{ height: "34px", padding: "0 10px", fontSize: "13px", borderRadius: "6px" }}
        >
          {yearList.length > 0 ? (
            yearList.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))
          ) : (
            <option value={selectedYear || new Date().getFullYear().toString()}>
              {selectedYear || new Date().getFullYear().toString()}년
            </option>
          )}
        </select>
      </div>

      <div className="chart-container" style={{ width: "100%", height: "280px", minHeight: "280px" }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
            <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
            <Bar dataKey="게시글수" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PostChart;
