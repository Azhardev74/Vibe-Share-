import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import API from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    const data = {
      email: form.email.value.trim(),
      password: form.password.value.trim(),
    };

    // ✅ Basic frontend validation
    if (!data.email || !data.password) {
      return alert("Please fill all fields");
    }

    try {
      setLoading(true);

      const res = await API.post("/user/login", data);

      // ✅ Save token safely

      localStorage.setItem("token", res.data.token);
      window.dispatchEvent(new Event("authChanged"));
      // ✅ Optional: save user (good for UI)
      localStorage.setItem("user", JSON.stringify(res.data.user));

      console.log("Login Success:", res.data);

      // ✅ Reset form
      form.reset();

      // ✅ Redirect
      navigate("/");

    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);

      alert(
        error.response?.data?.message ||
        "Login failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login
          </CardDescription>

          <CardAction>
            <Button
              variant="link"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                name="password"
                type="password"
                required
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}