import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import API from "../../lib/api"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useState } from "react"

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Signing up...", {
      position: "bottom-center",
    }
    )
    setLoading(true); // 🔥 FIX: start loading here

    const form = e.target;
    const data = new FormData(form);

    try {
      const res = await API.post("/user/signup", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      toast.success("Signup successful!", { id: toastId }); // ✅ update same toast
      console.log("Success: ", res.data);

      form.reset();
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load feed"

      // ❌ error update (same toast)
      toast.error(message, { id: toastId })
    } finally {
      setLoading(false); // ✅ always stop loading
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-96 p-4 relative"> {/* 🔥 add relative */}

        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>

            <div className="grid gap-2">
              <Label>Username</Label>
              <Input name="userName" placeholder="Your username" required />
            </div>

            <div className="grid gap-2">
              <Label>Email</Label>
              <Input name="email" type="email" placeholder="m@example.com" required />
            </div>

            <div className="grid gap-2">
              <Label>Password</Label>
              <Input name="password" type="password" placeholder="********" required />
            </div>

            <div className="grid gap-2">
              <Label>Photo</Label>
              <Input
                className="cursor-pointer"
                name="profilePic"
                type="file"
              />
            </div>

            <div className="grid gap-2">
              <Label>Bio</Label>
              <Textarea name="bio" placeholder="Tell us about yourself" />
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"} {/* 🔥 better text */}
            </Button>

            <p className="text-sm text-center">
              Already have an account?{" "}
             <Button
              variant="link"
              className="px-0 text-blue-600 hover:underline"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
            </p>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}