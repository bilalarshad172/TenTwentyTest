"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Layout,
  Typography,
  Alert,
  DatePicker,
  Select,
  Dropdown,
  Button,
  message,
} from "antd";
import TimesheetTable from "@/components/timesheets/TimeSheetTable";
import { useTimesheetsStore } from "@/store/timesheets-store";
import type { TimesheetEntry, TimesheetStatus } from "@/lib/types";
import dayjs, { type Dayjs } from "dayjs";
import {
  formatWeekRange,
  getStatus,
  getTotalHours,
  getWeekEnd,
} from "@/lib/timesheet-utils";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardClient() {
  const { items, loading, error, fetchAll } = useTimesheetsStore();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(5);
  const router = useRouter();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const rows = useMemo(() => {
    const base = items
      .map((entry) => {
        const totalHours = getTotalHours(entry);
        const status = getStatus(totalHours);
        return {
          id: entry.id,
          weekNumber: entry.weekNumber,
          weekStart: entry.weekStart,
          dateRange: formatWeekRange(entry.weekStart),
          status,
          totalHours,
        };
      })
      .sort(
        (a, b) =>
          dayjs(a.weekStart).valueOf() - dayjs(b.weekStart).valueOf()
      );

    const filtered = base.filter((row) => {
      if (statusFilter && row.status !== statusFilter) {
        return false;
      }
      if (!dateRange) return true;
      const [start, end] = dateRange;
      const startMs = start.startOf("day").valueOf();
      const endMs = end.endOf("day").valueOf();
      const weekStartMs = dayjs(row.weekStart).valueOf();
      const weekEndMs = getWeekEnd(row.weekStart).valueOf();
      return (
        (weekStartMs >= startMs && weekStartMs <= endMs) ||
        (weekEndMs >= startMs && weekEndMs <= endMs)
      );
    });

    return filtered;
  }, [items, dateRange, statusFilter]);

  useEffect(() => {
    if (!rows.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !rows.some((row) => row.id === selectedId)) {
      setSelectedId(rows[0].id);
    }
  }, [rows, selectedId]);

  return (
    <Layout className="min-h-screen bg-white">
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

          <Dropdown
            menu={{
              items: [
                {
                  key: "logout",
                  label: "Logout",
                  onClick: async () => {
                    message.success("Logged out successfully");
                    await signOut({ callbackUrl: "/login" });
                  },
                },
              ],
            }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button type="text" className="text-gray-500">
              John Doe
            </Button>
          </Dropdown>

        </div>
      </Header>


      <Content className="p-6">
        <div className="w-full max-w-6xl mx-auto">
          <Card className="shadow-sm">
          
          {/* Header section */}
          <div className="mb-4">
            <Title level={4} className="mb-2">
              Your Timesheets
            </Title>

            {/* Filters row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <DatePicker.RangePicker
                value={dateRange}
                onChange={(value) =>
                  setDateRange(value ? [value[0]!, value[1]!] : null)
                }
              />

              <Select
                placeholder="Status"
                style={{ width: 140 }}
                allowClear
                value={statusFilter ?? undefined}
                onChange={(value) =>
                  setStatusFilter((value as TimesheetStatus) ?? null)
                }
                options={[
                  { value: "Missing", label: "Missing" },
                  { value: "Incomplete", label: "Incomplete" },
                  { value: "Complete", label: "Complete" },
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
            rows={rows}
            selectedId={selectedId}
            pageSize={pageSize}
            sortBy="weekNumber"
            sortOrder="asc"
            onSelect={(row) => {
              setSelectedId(row.id);
              router.push(`/dashboard/${row.id}`);
            }}
            onAction={(row) => {
              setSelectedId(row.id);
              router.push(`/dashboard/${row.id}`);
            }}
          />
          <div className="mt-4 flex items-center justify-between">
            <Select
              value={pageSize}
              onChange={(value) => setPageSize(value)}
              style={{ width: 140 }}
              options={[
                { value: 5, label: "5 per page" },
                { value: 10, label: "10 per page" },
                { value: 15, label: "15 per page" },
              ]}
            />
          </div>
          </Card>
          <Card className="mt-6 shadow-sm" style={{marginTop:"20px"}}>
            
            <p className="text-center text-sm text-gray-500" style={{marginBottom:"0px"}} >
              © 2026 TenTwenty Inc. All rights reserved.
            </p>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
