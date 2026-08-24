import React from "react";

function PageHeader({ icon: IconComponent, iconColor = "#2563EB", title, description, children, extraLeft }) {
  return (
    <div
      className="dashboard-card mb20 flex justify-between items-center flex-wrap gap16"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "14px",
        padding: "18px 24px",
        marginBottom: "20px",
        boxSizing: "border-box",
        width: "100%"
      }}
    >
      {/* Left Title & Description Column Group */}
      <div className="flex flex-col items-start gap4 flex-1" style={{ minWidth: 0 }}>
        {/* Main Title Row */}
        <div className="flex items-center gap10 flex-wrap">
          {IconComponent && <IconComponent size={22} color={iconColor} />}
          <h2 className="page-title text22 font-extrabold m0" style={{ color: "#0F172A", letterSpacing: "-0.4px" }}>
            {title}
          </h2>
          {extraLeft && (
            <div className="flex items-center gap8 ml8">
              <div style={{ width: "1px", height: "16px", background: "#E2E8F0" }} className="hide-mobile" />
              {extraLeft}
            </div>
          )}
        </div>

        {/* Description Row (Placed Directly Below Main Title) */}
        {description && (
          <p className="text13 text-slate-500 m0 mt4" style={{ color: "#64748B", lineHeight: "1.5", wordBreak: "keep-all" }}>
            {description}
          </p>
        )}
      </div>

      {/* Right Controls / Action Group */}
      {children && (
        <div className="flex items-center gap8 flex-shrink-0" style={{ whiteSpace: "nowrap" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
