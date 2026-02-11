"use client";

import { useEffect, useMemo, useState } from "react";
import { Layout, Typography, Alert, Button } from "antd";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTimesheetsStore } from "@/store/timesheets-store";
import WeekTimesheetPage from "@/components/timesheets/WeekTimesheetPage";
import type { TimesheetEntry } from "@/lib/types";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function TimesheetWeekPage() {
  const { items, loading, error, fetchAll, update } = useTimesheetsStore();
  const [hasLoaded, setHasLoaded] = useState(false);
  const params = useParams<{ id: string }>();
  const idParam = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [localEntry, setLocalEntry] = useState<TimesheetEntry | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    fetchAll()
      .catch(() => undefined)
      .finally(() => {
        if (active) setHasLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [fetchAll]);

  useEffect(() => {
    if (!idParam) return;
    let active = true;
    setLocalError(null);
    fetch(`/api/timesheets/${idParam}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Timesheet not found");
        }
        return (await res.json()) as TimesheetEntry;
      })
      .then((data) => {
        if (active) setLocalEntry(data);
      })
      .catch((err) => {
        if (active) setLocalError(err.message);
      });
    return () => {
      active = false;
    };
  }, [idParam]);

  const entry = useMemo(() => {
    if (!idParam) return null;
    return (
      items.find((item) => item.id === idParam) ??
      localEntry ??
      null
    );
  }, [items, idParam, localEntry]);

  return (
    <Layout className="min-h-screen bg-white">
      <Header style={{ background: "white", padding: "0 24px" }}>
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-4">
            <Title level={3} className="mb-0">
              Ticktock
            </Title>
            <h2 className="text-lg font-semibold mb-0">Timesheets</h2>
          </div>
          <Text type="secondary">John Doe</Text>
        </div>
      </Header>

      <Content className="p-6">
        <div className="w-full max-w-6xl mx-auto">
          <div className="mb-4">
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/dashboard")}
              className="px-0"
            >
              Back to Dashboard
            </Button>
          </div>
          {(error || localError) && (
            <Alert
              message={error ?? localError}
              type="error"
              showIcon
              className="mb-4"
            />
          )}
          <WeekTimesheetPage
            entry={entry}
            loading={!hasLoaded || loading}
            onUpdate={(entryId, next) => {
              setLocalEntry(next);
              return update(entryId, {
                weekNumber: next.weekNumber,
                weekStart: next.weekStart,
                days: next.days,
              });
            }}
          />
          {loading && (
            <div className="mt-4 text-sm text-gray-500">Loading...</div>
          )}
        </div>
      </Content>
    </Layout>
  );
}
