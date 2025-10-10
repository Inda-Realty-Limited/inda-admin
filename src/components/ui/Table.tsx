import React from "react";

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (
    value: unknown,
    row: Record<string, unknown>,
    index: number
  ) => React.ReactNode;
}

export interface TableRow {
  [key: string]: unknown;
}

export interface TableProps {
  columns: TableColumn[];
  data: TableRow[];
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: Record<string, unknown>) => void;
}

export function Table({
  columns,
  data,
  className = "",
  emptyMessage = "No data available",
  onRowClick,
}: TableProps) {
  // Calculate equal width for all columns
  const columnWidth = `${100 / columns.length}%`;

  if (data.length === 0) {
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-white ${className}`}
      >
        <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white overflow-hidden ${className}`}
    >
      <div className="w-full">
        <table className="w-full table-fixed">
          {/* Header */}
          <thead>
            <tr className="bg-[#4EA8A1] text-white">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-sm font-medium ${
                    column.align === "center"
                      ? "text-center"
                      : column.align === "right"
                      ? "text-right"
                      : "text-left"
                  }`}
                  style={{ width: column.width || columnWidth }}
                >
                  <div className="truncate" title={column.label}>
                    {column.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {/* Body */}
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-[#E5E5E5] ${
                  rowIndex % 2 === 0 ? "bg-[#4EA8A11F]" : "bg-[#4EA8A11F]"
                } hover:bg-gray-100 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((column) => {
                  const cellValue = row[column.key];
                  const cellContent: React.ReactNode = column.render
                    ? column.render(cellValue, row, rowIndex)
                    : cellValue === null || cellValue === undefined
                    ? "—"
                    : typeof cellValue === "string" ||
                      typeof cellValue === "number"
                    ? (cellValue as React.ReactNode)
                    : String(cellValue);

                  return (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-sm text-gray-900 ${
                        column.align === "center"
                          ? "text-center"
                          : column.align === "right"
                          ? "text-right"
                          : "text-left"
                      }`}
                      style={{ width: column.width || columnWidth }}
                    >
                      <div
                        className="truncate"
                        title={
                          typeof cellContent === "string"
                            ? cellContent
                            : undefined
                        }
                      >
                        {cellContent}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Additional components for common table elements
export function TableButton({
  children,
  variant = "primary",
  size = "sm",
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
}) {
  const baseClasses = `inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`;

  const variants = {
    primary:
      "bg-[#4EA8A1] text-white hover:bg-[#4EA8A1]/90 focus:ring-[#4EA8A1]",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function TableBadge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
