/**
 * RolePermissionMatrix
 *
 * Component hiển thị bảng ma trận: Hàng = Role, Cột = Permission
 * Mỗi ô có checkbox để bật/tắt quyền cho từng role
 *
 * Props:
 *   - roles: danh sách vai trò
 *   - permissions: danh sách quyền
 *   - permissionMap: map quyền hiện tại (roleCode -> Set<permCode>)
 *   - onChange: callback khi người dùng tick/untick 1 ô
 *   - isLoading: hiển thị skeleton khi đang tải
 */

import { Checkbox, Skeleton, Tag, Tooltip } from "antd";
import type { RoleRow, PermissionCol, RolePermissionMap } from "./types";

// Màu cho từng nhóm resource
const resourceColors: Record<string, string> = {
  dashboard: "blue",
  campaign:  "green",
  job:       "purple",
  report:    "orange",
  user:      "cyan",
  role:      "red",
};

type Props = {
  roles: RoleRow[];
  permissions: PermissionCol[];
  permissionMap: RolePermissionMap;
  onChange: (roleCode: string, permCode: string, checked: boolean) => void;
  highlightedRoleCodes?: string[];
  isLoading?: boolean;
};

export function RolePermissionMatrix({
  roles,
  permissions,
  permissionMap,
  onChange,
  highlightedRoleCodes = [],
  isLoading = false,
}: Props) {
  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 800 }}>

        {/* ── Header hàng đầu: tên các permission ── */}
        <thead>
          <tr>
            {/* Ô góc trên trái */}
            <th style={thStyleLeft}>Vai trò / Quyền</th>

            {permissions.map((perm) => (
              <th key={perm.id} style={thStyleCenter}>
                <Tooltip title={`Resource: ${perm.resource} | Action: ${perm.action}`}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    {perm.name}
                  </div>
                  <Tag
                    color={resourceColors[perm.resource] ?? "default"}
                    style={{ fontSize: 10, margin: 0 }}
                  >
                    {perm.resource}
                  </Tag>
                </Tooltip>
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Các hàng: mỗi hàng là một Role ── */}
        <tbody>
          {roles.map((role, rowIndex) => {
            // Lấy Set quyền của role này, nếu không có thì dùng Set rỗng
            const rolePerms = permissionMap[role.code] ?? new Set<string>();
            const isHighlighted = highlightedRoleCodes.includes(role.code);

            const rowBgColor = isHighlighted
              ? "#e6f7ff"
              : rowIndex % 2 === 0
              ? "#fafafa"
              : "#ffffff";

            return (
              <tr
                key={role.id}
                style={{
                  backgroundColor: rowBgColor,
                }}
              >
                {/* Cột đầu: tên Role */}
                <td style={tdStyleLeft}>
                  <div style={{ fontWeight: 600, color: "#1f1f1f" }}>{role.name}</div>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>{role.description}</div>
                  <Tag style={{ marginTop: 4, fontSize: 10 }}>{role.code}</Tag>
                </td>

                {/* Mỗi cột còn lại: checkbox bật/tắt quyền */}
                {permissions.map((perm) => {
                  const isChecked = rolePerms.has(perm.code);

                  return (
                    <td key={perm.id} style={tdStyleCenter}>
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => onChange(role.code, perm.code, e.target.checked)}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Inline table styles ──────────────────────────────────────────────────────
const borderStyle = "1px solid #f0f0f0";

const thStyleLeft: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  borderBottom: borderStyle,
  borderRight: borderStyle,
  backgroundColor: "#fafafa",
  minWidth: 200,
  position: "sticky",
  left: 0,
  zIndex: 1,
};

const thStyleCenter: React.CSSProperties = {
  textAlign: "center",
  padding: "10px 12px",
  borderBottom: borderStyle,
  borderRight: borderStyle,
  backgroundColor: "#fafafa",
  minWidth: 120,
};

const tdStyleLeft: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: borderStyle,
  borderRight: borderStyle,
  verticalAlign: "middle",
  position: "sticky",
  left: 0,
  backgroundColor: "inherit",
  zIndex: 1,
};

const tdStyleCenter: React.CSSProperties = {
  textAlign: "center",
  padding: "12px",
  borderBottom: borderStyle,
  borderRight: borderStyle,
  verticalAlign: "middle",
};
