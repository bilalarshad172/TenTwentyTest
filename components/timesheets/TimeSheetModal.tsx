"use client";

import { Modal, Form, InputNumber, DatePicker, Select } from "antd";
import type { TimesheetEntry, TimesheetStatus } from "@/lib/types";
import dayjs from "dayjs";

type Props = {
  open: boolean;
  title: string;
  loading: boolean;
  initialValues?: TimesheetEntry;
  onCancel: () => void;
  onSubmit: (data: Omit<TimesheetEntry, "id">) => void;
};

const statusOptions: TimesheetStatus[] = ["Pending", "Submitted", "Approved"];

export default function TimesheetModal({
  open,
  title,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm();

  return (
    <Modal
      open={open}
      title={title}
      okText={initialValues ? "Update" : "Create"}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      confirmLoading={loading}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            const payload = {
              weekNumber: values.weekNumber,
              date: values.date.format("YYYY-MM-DD"),
              status: values.status,
            };
            onSubmit(payload);
            form.resetFields();
          })
          .catch(() => undefined);
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          weekNumber: initialValues?.weekNumber,
          date: initialValues?.date ? dayjs(initialValues.date) : undefined,
          status: initialValues?.status ?? "Pending",
        }}
      >
        <Form.Item
          label="Week #"
          name="weekNumber"
          rules={[{ required: true, message: "Week number is required" }]}
        >
          <InputNumber min={1} className="w-full" />
        </Form.Item>

        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: "Date is required" }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Status is required" }]}
        >
          <Select options={statusOptions.map((value) => ({ value }))} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
