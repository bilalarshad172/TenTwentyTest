"use client";

import { Table, Tag, Space, Button, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TimesheetEntry, TimesheetStatus } from "@/lib/types";

type Props = {
  items: TimesheetEntry[];
  loading: boolean;
  onEdit: (entry: TimesheetEntry) => void;
  onDelete: (id: string) => void;
};

const statusColor: Record<TimesheetStatus, string> = {
  Pending: "gold",
  Submitted: "blue",
  Approved: "green",
};

export default function TimesheetTable({
  items,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const columns: ColumnsType<TimesheetEntry> = [
    {
      title: "Week #",
      dataIndex: "weekNumber",
      key: "weekNumber",
      width: 100,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 160,
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
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete timesheet?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={items}
      loading={loading}
      pagination={{ pageSize: 6 }}
    />
  );
}
