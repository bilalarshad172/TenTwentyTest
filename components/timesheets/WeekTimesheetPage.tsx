"use client";

import { useMemo, useState } from "react";
import {
  Card,
  Typography,
  Progress,
  Tag,
  Button,
  Form,
  Select,
  Input,
  InputNumber,
  message,
} from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type {
  TimesheetDay,
  TimesheetEntry,
  TimesheetTask,
  TimesheetStatus,
} from "@/lib/types";
import {
  TARGET_WEEK_HOURS,
  formatWeekRange,
  getStatus,
  getTotalHours,
} from "@/lib/timesheet-utils";

const { Title, Text } = Typography;
const { TextArea } = Input;

type Props = {
  entry: TimesheetEntry | null;
  loading?: boolean;
  onUpdate: (entryId: string, next: TimesheetEntry) => void;
};

type TaskFormValues = {
  project: string;
  workType: string;
  description: string;
  hours: number;
};

const projectOptions = ["Project Name", "Internal", "Client Work"].map(
  (value) => ({
    value,
    label: value,
  })
);

const workTypeOptions = ["Bug fixes", "Feature", "Design", "Meeting"].map(
  (value) => ({
    value,
    label: value,
  })
);

function getStatusTagColor(status: TimesheetStatus) {
  switch (status) {
    case "Complete":
      return "green";
    case "Incomplete":
      return "gold";
    case "Missing":
      return "magenta";
    default:
      return "default";
  }
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildTask(values: TaskFormValues): TimesheetTask {
  return {
    id: generateId(),
    name: values.description,
    description: values.description,
    hours: Number(values.hours),
    project: values.project,
    workType: values.workType,
  };
}

function clampHours(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.min(24, Math.max(0, value));
}

function updateEntryDay(
  entry: TimesheetEntry,
  dayIndex: number,
  updater: (day: TimesheetDay) => TimesheetDay
) {
  const nextDays = entry.days.map((day, index) =>
    index === dayIndex ? updater(day) : day
  );
  return { ...entry, days: nextDays };
}

export default function WeekTimesheetPage({
  entry,
  loading,
  onUpdate,
}: Props) {
  const [form] = Form.useForm<TaskFormValues>();
  const [addingDayIndex, setAddingDayIndex] = useState<number | null>(null);

  const totalHours = useMemo(() => (entry ? getTotalHours(entry) : 0), [entry]);
  const status = useMemo(() => getStatus(totalHours), [totalHours]);

  const handleAddTask = (values: TaskFormValues) => {
    if (!entry || addingDayIndex === null) return;
    const next = updateEntryDay(entry, addingDayIndex, (day) => ({
      ...day,
      tasks:
        day.tasks.length === 0
          ? [buildTask(values)]
          : [
              day.tasks[0],
              buildTask(values),
              ...day.tasks.slice(1),
            ],
    }));
    onUpdate(entry.id, next);
    message.success("Task added successfully");
    setAddingDayIndex(null);
    form.resetFields();
  };

  const handleRemoveTask = (dayIndex: number, taskId: string) => {
    if (!entry) return;
    const next = updateEntryDay(entry, dayIndex, (day) => ({
      ...day,
      tasks: day.tasks.filter((task) => task.id !== taskId),
    }));
    onUpdate(entry.id, next);
    message.success("Task deleted successfully");
  };

  if (!entry) {
    return (
      <Card className="shadow-sm">
        <Text type="secondary">
          {loading ? "Loading timesheet..." : "Timesheet not found."}
        </Text>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <Title level={4} className="mb-1">
              This week's timesheet
            </Title>
            <Text type="secondary">{formatWeekRange(entry.weekStart)}</Text>
          </div>
          <div className="w-full sm:min-w-[220px] sm:w-auto">
            <div className="flex flex-wrap items-center justify-start gap-2 text-sm text-gray-500 sm:justify-end">
              <span>
                {totalHours}/{TARGET_WEEK_HOURS} hrs
              </span>
              <Tag color={getStatusTagColor(status)}>{status}</Tag>
            </div>
            <Progress
              percent={Math.min(
                100,
                Math.round((totalHours / TARGET_WEEK_HOURS) * 100)
              )}
              showInfo={false}
              strokeColor="#1C64F2"
            />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {entry.days.map((day, index) => {
            const dateLabel = dayjs(day.date).format("MMM D");
            return (
              <div key={day.date} className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <div className="w-full text-sm font-semibold text-gray-700 sm:w-20">
                  {dateLabel}
                </div>
                <div className="flex-1 space-y-2">
                  {day.tasks.length === 0 && (
                    <div className="text-sm text-gray-400">No tasks yet.</div>
                  )}
                  {day.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col gap-2 rounded-md border border-gray-200 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="text-sm text-gray-700 break-words">
                        {task.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:gap-3">
                        <span>{task.hours} hrs</span>
                        {task.project && <Tag color="blue">{task.project}</Tag>}
                        <Button
                          type="link"
                          size="small"
                          danger
                          onClick={() => handleRemoveTask(index, task.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="w-full rounded-md border border-dashed border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm text-blue-600 hover:cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      setAddingDayIndex(index);
                      form.setFieldsValue({
                        project: "Project Name",
                        workType: "Bug fixes",
                        description: "",
                        hours: 1,
                      });
                    }}
                  >
                    + Add new task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card className="mt-6 shadow-sm" style={{marginTop:"20px"}}>
            
            <p className="text-center text-sm text-gray-500" style={{marginBottom:"0px"}} >
              © 2026 TenTwenty Inc. All rights reserved.
            </p>
          </Card>

      <Form
        form={form}
        layout="vertical"
        className={addingDayIndex !== null ? "block" : "hidden"}
      >
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-lg bg-white p-4 shadow-lg max-h-[90vh] overflow-y-auto sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <Title level={5} className="mb-0">
                Add New Entry
              </Title>
              <Button
                type="text"
                onClick={() => {
                  setAddingDayIndex(null);
                  form.resetFields();
                }}
              >
                ×
              </Button>
            </div>
            <Form.Item
              label="Select Project"
              name="project"
              rules={[{ required: true, message: "Project is required" }]}
            >
              <Select options={projectOptions} />
            </Form.Item>
            <Form.Item
              label="Type of Work"
              name="workType"
              rules={[{ required: true, message: "Work type is required" }]}
            >
              <Select options={workTypeOptions} />
            </Form.Item>
            <Form.Item
              label="Task description"
              name="description"
              rules={[{ required: true, message: "Description is required" }]}
            >
              <TextArea rows={4} placeholder="Write text here..." />
            </Form.Item>
            <Form.Item
              label="Hours"
              name="hours"
              rules={[{ required: true, message: "Hours are required" }]}
            >
              <div className="flex items-center gap-2">
                <Button
                  icon={<MinusOutlined />}
                  onClick={() => {
                    const next = clampHours(form.getFieldValue("hours") - 1);
                    form.setFieldsValue({ hours: next });
                  }}
                />
                <InputNumber min={0} max={24} step={1} className="w-24" />
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    const next = clampHours(form.getFieldValue("hours") + 1);
                    form.setFieldsValue({ hours: next });
                  }}
                />
              </div>
            </Form.Item>
            
            <div className="mt-6 flex gap-3">
              <Button
                type="primary"
                className="primary"
                onClick={() => {
                  form
                    .validateFields()
                    .then((values) => handleAddTask(values))
                    .catch(() => undefined);
                }}
              >
                Add entry
              </Button>
              <Button
                onClick={() => {
                  setAddingDayIndex(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </>
  );
}
