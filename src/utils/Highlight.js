import React from "react";

export const Highlight = (text, keyword) => {
  if (!keyword || !keyword.trim()) {
    return text;
  }

  const parts = text.split(new RegExp(`(${keyword})`, "gi"));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} style={{ backgroundColor: "#fff3bf", color: "#000", padding: "0 2px" }}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};
