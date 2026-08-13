import React from "react";

function PageHeader({ icon: IconComponent, iconColor = "#2563EB", title, description, children, extraLeft }) {
  return (
    <div
      className="dashboard-card mb32 flex justify-between items-center flex-wrap gap16"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        padding: "16px 24px",
        minHeight: "72px",
        boxSizing: "border-box",
        width: "100%"
      }}
    >
      {/* Left Title & Description & Extra Left Content */}
      <div className="flex items-center gap16 flex-wrap" style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap10" style={{ whiteSpace: "nowrap" }}>
          {IconComponent && <IconComponent size={24} color={iconColor} />}
          <h2 className="page-title text22 font-bold m0" style={{ color: "#0F172A", whiteSpace: "nowrap" }}>
            {title}
          </h2>
        </div>

        {extraLeft && (
          <>
            <div style={{ width: "1px", height: "20px", background: "#E2E8F0", margin: "0 4px" }} className="hide-mobile" />
            {extraLeft}
          </>
        )}

        {description && !extraLeft && (
          <p className="text14 text-muted m0 hide-mobile" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
