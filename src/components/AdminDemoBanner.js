import React from "react";

/**
 * AdminDemoBanner Component
 * 
 * Displays a prominent, perfectly-aligned notification banner on all Admin pages.
 * Shows a Read-Only Demo notice for regular portfolio visitors,
 * and an Admin Auth notice for real administrators.
 */
function AdminDemoBanner() {
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const isAdmin = loginUser?.admin_yn === "Y";

  if (isAdmin) {
    return (
      <div
        className="admin-demo-banner mb20"
        style={{
          background: "#F0FDF4",
          border: "1px solid #A7F3D0",
          borderRadius: "14px",
          padding: "16px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "20px"
        }}
      >
        <div className="flex items-center gap12 flex-wrap">
          <span
            style={{
              background: "#10B981",
              color: "#FFFFFF",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: "800",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center"
            }}
          >
            👑 ADMIN AUTH
          </span>
          <span className="text14 font-bold" style={{ color: "#065F46", wordBreak: "keep-all" }}>
            관리자 최고 권한으로 접속 중입니다. (모든 데이터 CUD 처리 가능)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-demo-banner mb20"
      style={{
        background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 60%, #EFF6FF 100%)",
        border: "1px solid #FDE68A",
        borderRadius: "14px",
        padding: "16px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "14px",
        marginBottom: "20px",
        boxShadow: "0 2px 10px rgba(217, 119, 6, 0.05)"
      }}
    >
      {/* Left Badge + Primary Text */}
      <div className="flex items-center gap12 flex-wrap flex-1" style={{ minWidth: "280px" }}>
        <span
          style={{
            background: "#D97706",
            color: "#FFFFFF",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "800",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(217, 119, 6, 0.3)"
          }}
        >
          🔒 READ-ONLY DEMO MODE
        </span>
        <span
          className="text14 font-bold"
          style={{
            color: "#78350F",
            lineHeight: "1.5",
            wordBreak: "keep-all"
          }}
        >
          현재 관리자(Admin) 체험 모드로 접속 중입니다. 실제 DB와 연동된 데이터 관리 UI를 확인해 보세요.
        </span>
      </div>

      {/* Right Secondary Notice (Visually Separated) */}
      <div
        className="flex items-center gap6 text12 font-medium"
        style={{
          color: "#92400E",
          opacity: 0.85,
          background: "rgba(255, 255, 255, 0.6)",
          padding: "5px 12px",
          borderRadius: "8px",
          border: "1px solid rgba(253, 230, 138, 0.8)",
          whiteSpace: "nowrap"
        }}
      >
        <span>※ 포트폴리오 체험 모드에서는 읽기 권한만 제공됩니다.</span>
      </div>
    </div>
  );
}

export default AdminDemoBanner;
