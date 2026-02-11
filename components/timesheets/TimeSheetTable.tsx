"use client";

import { Table, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TimesheetStatus } from "@/lib/types";

type Props = {
  rows: TimesheetRow[];
  loading: boolean;
  selectedId?: string | null;
  onSelect: (row: TimesheetRow) => void;
  onAction: (row: TimesheetRow) => void;
};

const statusColor: Record<TimesheetStatus, string> = {
  Missing: "magenta",
  Incomplete: "gold",
  Complete: "green",
};

type TimesheetRow = {
  id: string;
  weekNumber: number;
  dateRange: string;
  status: TimesheetStatus;
  totalHours: number;
};

const actionLabel: Record<TimesheetStatus, string> = {
  Missing: "Create",
  Incomplete: "Update",
  Complete: "View",
};

export default function TimesheetTable({
  rows,
  loading,
  selectedId,
  onSelect,
  onAction,
}: Props) {
  const columns: ColumnsType<TimesheetRow> = [
    {
      title: "Week #",
      dataIndex: "weekNumber",
      key: "weekNumber",
      width: 100,
    },
    {
      title: "Date",
      dataIndex: "dateRange",
      key: "dateRange",
      width: 220,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: TimesheetStatus) => (
        <Tag color={statusColor[status]}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            onAction(record);
          }}
        >
          {actionLabel[record.status]}
        </Button>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={rows}
      loading={loading}
      pagination={{ pageSize: 6 }}
      onRow={(record) => ({
        onClick: () => onSelect(record),
      })}
      rowClassName={(record) =>
        record.id === selectedId ? "bg-blue-50" : ""
      }
    />
  );
}
