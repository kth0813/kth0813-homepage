import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function PostChart() {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [yearList, setYearList] = useState([]);

  const fetchStats = useCallback(async () => {
    const { data: yearData } = await supabase.from("monthly_post_counts").select("year");
    if (yearData) {
      const uniqueYears = [...new Set(yearData.map((item) => item.year))].sort().reverse();
      setYearList(uniqueYears);
    }

    const { data: stats, error } = await supabase.from("monthly_post_counts").select("month, post_count").eq("year", selectedYear);

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
    <div className="chart-container" style={{ padding: "20px", background: "#fff", borderRadius: "8px", border: "1px solid #eee", marginBottom: "30px", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "18px" }}>📝 게시글 작성 추이 (월별)</h3>

        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ddd" }}>
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

      <div style={{ width: "100%", height: 300 }}>
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
