import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import API from "../../lib/api"
import { useNavigate } from "react-router-dom"
export default function Signup() {
  const Navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Read the Form Data 
    const form = e.target;
    const data = new FormData(form);
    console.log(data)
    try {
      const res = await API.post("/user/signup", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      console.log("Success: ", res.data);
      form.reset();
      Navigate("/");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-96 p-4">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label>Username</Label>
              <Input
                name="userName"
                placeholder="Your username"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Password</Label>
              <Input
                name="password"
                type="password"
                placeholder="********"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Photo</Label>
              <Input
                className="cursor-pointer"
                name="profilePic"
                type="file"
                placeholder="Upload profile picture"
              />
            </div>
            <div className="grid gap-2">
              <Label>Bio</Label>
              <Textarea
                name="bio"
                placeholder="Tell us about yourself"
              />
            </div>

            <Button className="w-full" type="submit">
              Sign Up
            </Button>

            <p className="text-sm text-center" >
              Already have an account?{" "}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => Navigate("/login")}
              >
                Login
              </span>
            </p>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}