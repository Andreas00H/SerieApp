import { useAuth } from "../../auth/AuthContext";
import AuthForm from "../../components/AuthForm";

export default function LoginScreen() {
  const { signIn } = useAuth();
  return (
    <AuthForm
      tagline="Your movies and series in one place"
      submitLabel="Sign in"
      fallbackError="Sign-in failed"
      switchText="No account? Create one"
      switchHref="/register"
      onSubmit={signIn}
    />
  );
}
