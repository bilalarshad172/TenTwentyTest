"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Layout, Typography, Alert, DatePicker, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import TimesheetTable from "@/components/timesheets/TimeSheetTable";
import TimesheetModal from "@/components/timesheets/TimeSheetModal";
import { useTimesheetsStore } from "@/store/timesheets-store";
import type { TimesheetEntry } from "@/lib/types";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardClient() {
  const { items, loading, error, fetchAll, create, update, remove } =
    useTimesheetsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TimesheetEntry | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const title = useMemo(
    () => (editing ? "Edit Timesheet" : "New Timesheet"),
    [editing]
  );

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (entry: TimesheetEntry) => {
    setEditing(entry);
    setModalOpen(true);
  };

  const handleSubmit = async (data: Omit<TimesheetEntry, "id">) => {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <Layout className="min-h-screen bg-white" >
      <Header style={{ background: "white", padding: "0 24px" }}>
        <div className="flex items-center justify-between h-full">
          
          <div className="flex items-center gap-4">
            <Title level={3} className="mb-0">
              Ticktock
            </Title>
            <h2 className="text-lg font-semibold mb-0">
              Timesheets
            </h2>
          </div>

          <Text type="secondary">
            John Doe
          </Text>

        </div>
      </Header>


     <Content className="p-6">
        <Card className="shadow-sm">
          
          {/* Header section */}
          <div className="mb-4">
            <Title level={4} className="mb-2">
              Your Timesheets
            </Title>

            {/* Filters row */}
            <div className="flex items-center gap-3">
              <DatePicker.RangePicker />

              <Select
                placeholder="Status"
                style={{ width: 140 }}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                ]}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <Alert message={error} type="error" showIcon className="mb-4" />
          )}

          {/* Table */}
          <TimesheetTable
            loading={loading}
            items={items}
            onEdit={handleEdit}
            onDelete={remove}
          />
        </Card>
      </Content>


<Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Timesheet
          </Button>
      <TimesheetModal
        open={modalOpen}
        title={title}
        loading={loading}
        initialValues={editing ?? undefined}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
}
