import { useAuth } from "../../auth/AuthContext";
import AuthForm from "../../components/AuthForm";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  return (
    <AuthForm
      tagline="Create an account for your list"
      submitLabel="Create account"
      passwordHint="At least 8 characters"
      fallbackError="Registration failed"
      switchText="Already have an account? Sign in"
      switchHref="/login"
      onSubmit={signUp}
    />
  );
}
