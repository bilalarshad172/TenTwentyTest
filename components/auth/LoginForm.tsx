"use client";

import { Card, Form, Input, Button, Typography, Alert, message } from "antd";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Title, Text } = Typography;

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFinish(values: { email: string; password: string }) {
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    setLoading(false);

    if (result?.ok) {
      message.success("Logged in successfully");
      router.push("/dashboard");
      return;
    }

    setError("Invalid email or password.");
  }

  return (
    <div className="flex min-h-screen ">
        <div className="w-full md:w-1/2 shadow-xl">
          <div className="h-full px-16 flex flex-col justify-center">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-black">
                 Welcome Back
                </h1>
                <Text type="secondary">
                  Sign in with your account. Demo: `tentwenty@demo.com` / `password123`
                </Text>
              </div>

             {error && <Alert message={error} type="error" showIcon className="mb-4" />}

                <Form layout="vertical" onFinish={handleFinish}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Email is required" },
                      { type: "email", message: "Enter a valid email" },
                    ]}
                  >
                    <Input placeholder="you@company.com" style={{padding:"8px"}} />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Password is required" }]}
                  >
                    <Input.Password placeholder="••••••••" style={{padding:"8px"}}/>
                  </Form.Item>

                  <Button type="primary" htmlType="submit" style={{padding:"8px", backgroundColor:"#1C64F2"}} block loading={loading}>
                    Sign In
                  </Button>
                </Form>
            </div>
        </div>
      


        <div className="hidden md:block md:w-1/2 bg-[#1C64F2]">
            <div className="h-full p-8 flex flex-col justify-center text-start">
              <h1 className="text-white text-4xl font-bold">
                ticktok
              </h1>

              <p className="text-white mt-4">
                Introducing ticktock, our cutting-edge timesheet web application designed
                to revolutionize how you manage employee work hours. With ticktock, you
                can effortlessly track and monitor employee attendance and productivity
                from anywhere, anytime, using any internet-connected device.
              </p>
            </div>
        </div>
    </div>
  );
}
