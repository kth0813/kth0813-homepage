import React, { useEffect, useState, useCallback } from "react";
import { dbService } from "../services/DbService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function PostChart() {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [yearList, setYearList] = useState([]);

  const fetchStats = useCallback(async () => {
    const { data: yearData } = await dbService.getMonthlyPostYears();
    if (yearData) {
      const uniqueYears = [...new Set(yearData.map((item) => item.year))].sort().reverse();
      setYearList(uniqueYears);
    }

    const { data: stats, error } = await dbService.getMonthlyPostCounts(selectedYear);

    if (!error) {
      const formattedData = Array.from({ length: 12 }, (_, i) => {
        const monthStr = (i + 1).toString().padStart(2, "0");
        const found = stats.find((s) => s.month === monthStr);
        return {
          month: `${i + 1}월`,
          게시글수: found ? found.post_count : 0
        };
      });
      setData(formattedData);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h3 className="chart-title">📝 게시글 작성 추이 (월별)</h3>

        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="chart-select">
          {yearList.length > 0 ? (
            yearList.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))
          ) : (
            <option value={selectedYear}>{selectedYear}년</option>
          )}
        </select>
      </div>

      <div className="chart-container">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: "#f8f9fa" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Bar dataKey="게시글수" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PostChart;
