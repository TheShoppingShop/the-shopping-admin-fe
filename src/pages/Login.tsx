import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { APP_CREDENTIALS } from "@/constants";
import { setSession } from "@/utils/session";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Login | TheShopping Admin";
  }, []);

  const valid = useMemo(() => username.trim() && password.trim(), [username, password]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (username === APP_CREDENTIALS.username && password === APP_CREDENTIALS.password) {
      setSession({ username, loginAt: new Date().toISOString() });
      toast({ title: "Signed in", description: "Welcome back!" });
      navigate("/videos", { replace: true });
    } else {
      const msg = "Invalid username or password";
      setError(msg);
      toast({ title: "Sign in failed", description: msg });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={!valid}>
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
