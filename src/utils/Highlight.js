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
          <mark key={i} className="highlight-mark">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};
