import React from "react";
import "../css/App.css";

export const SkeletonLine = ({ width = "100%", height = "20px", style = {} }) => {
  return <div className="skeleton skeleton-line" style={{ width, height, ...style }}></div>;
};

export const SkeletonCircle = ({ size = "40px", style = {} }) => {
  return <div className="skeleton skeleton-circle" style={{ width: size, height: size, ...style }}></div>;
};

export const SkeletonRect = ({ width = "100%", height = "150px", style = {} }) => {
  return <div className="skeleton skeleton-rect" style={{ width, height, ...style }}></div>;
};
