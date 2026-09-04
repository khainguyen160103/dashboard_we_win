import React from "react";
import { InstagramOutlined, YoutubeOutlined } from "@ant-design/icons";
import type { Platform } from "./types";

export const getTierColor = (tier: string): string => {
  switch (tier) {
    case "Mega":  return "gold";
    case "Macro": return "purple";
    case "Micro": return "blue";
    default:      return "default";
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Active":  return "success";
    case "Pending": return "warning";
    default:        return "default";
  }
};

export const getPlatformIcon = (platform: Platform): React.ReactNode => {
  switch (platform) {
    case "Instagram": return <InstagramOutlined style={{ color: "#E1306C" }} />;
    case "TikTok":    return <span style={{ fontWeight: 700, fontSize: 12, color: "#010101" }}>TK</span>;
    case "YouTube":   return <YoutubeOutlined style={{ color: "#FF0000" }} />;
  }
};

export const formatFollowers = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};
