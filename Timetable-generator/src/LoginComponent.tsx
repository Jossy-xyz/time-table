import React, {
  useState,
  useEffect,
  useRef,
  ElementType,
  ChangeEvent,
  KeyboardEvent,
  FormEvent,
} from "react";
import { authService } from "./services/api/authService";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "./components/atoms/Button";
import IconBell from "./components/ui/IconBell";
import { useTheme } from "./context/ThemeContext";
import bellsLogo from "./assets/images/bells-logo.png";
import { User } from "./types/institutional";
import { FiEye, FiEyeOff, FiCheck, FiAlertCircle } from "react-icons/fi";

import { collegeService, College } from "./services/api/collegeService";

const MOCK_COLLEGES = [
  {
    id: "m1",
    name: "Natural & Applied Sciences",
    icon: "🔬",
    accent: "#4a90e2",
  },
  { id: "m2", name: "Engineering", accent: "#e94e77" },
  { id: "m3", name: "Food Technology", accent: "#50c878" },
  { id: "m4", name: "Management Sciences", accent: "#f39c12" },
  { id: "m5", name: "Environmental Sciences", accent: "#1252f3" },
];

// Helper for visual assets (colors) matching DB names
const GET_COLLEGE_ASSETS = (name: string) => {
  const assets: Record<string, { accent: string }> = {
    "Natural & Applied Sciences": { accent: "#4a90e2" },
    Engineering: { accent: "#e94e77" },
    "Food Technology": { accent: "#50c878" },
    "Management Sciences": { accent: "#f39c12" },
    "Environmental Sciences": { accent: "#1252f3" },
    "College of Natural & Applied Sciences": { accent: "#4a90e2" },
    "College of Engineering": { accent: "#e94e77" },
    "College of Food Technology": { accent: "#50c878" },
    "College of Management Sciences": { accent: "#f39c12" },
    "College of Environmental Sciences": { accent: "#1252f3" },
  };

  const normalized = name.replace("College of ", "");
  return assets[name] || assets[normalized] || { accent: "#666666" };
};

interface StrengthLevel {
  strength: number;
  label: string;
  color: string;
}

// Password Strength Calculator
function calculatePasswordStrength(password: string): StrengthLevel {
  if (!password) return { strength: 0, label: "", color: "" };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  const levels: StrengthLevel[] = [
    { strength: 0, label: "Very Weak", color: "#ff4444" },
    { strength: 1, label: "Weak", color: "#ff8844" },
    { strength: 2, label: "Fair", color: "#ffbb44" },
    { strength: 3, label: "Good", color: "#88cc44" },
    { strength: 4, label: "Strong", color: "#44cc44" },
    { strength: 5, label: "Very Strong", color: "#22aa22" },
  ];

  return levels[Math.min(strength, levels.length - 1)];
}

interface LoginInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  icon?: ElementType;
  autoComplete?: string;
  isValid?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  showPasswordVisible?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

// Enhanced Input Component with validation feedback
function LoginInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  icon: Icon,
  autoComplete,
  isValid,
  showPasswordToggle,
  onKeyDown,
  disabled,
  autoFocus,
}: LoginInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Handle password toggle internally if showing toggle
  const actualType = showPasswordToggle
    ? isPasswordVisible
      ? "text"
      : "password"
    : type;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-bold text-institutional-primary"
      >
        {label}
        {required && <span className="text-status-error ml-1">*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brick/40 group-focus-within:text-brick transition-colors pointer-events-none">
            <Icon />
          </div>
        )}
        <input
          id={id}
          type={actualType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full bg-page border border-brick/10 outline-none rounded-institutional py-3.5 px-4 text-sm font-medium text-institutional-primary transition-all
            focus:ring-2 focus:ring-brick/20 focus:border-brick/30 focus:bg-surface
            placeholder:text-institutional-muted placeholder:opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? "pl-12" : ""}
            ${error ? "border-status-error/50 focus:ring-status-error/20 bg-status-error/5" : ""}
            ${isValid && value && !error ? "border-status-success/50 focus:ring-status-success/20" : ""}
          `}
          required={required}
          autoComplete={autoComplete}
          aria-describedby={error ? `${id}-error` : undefined}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          disabled={disabled}
        />

        {isValid && value && !error && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-status-success pointer-events-none">
            <FiCheck />
          </span>
        )}

        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brick transition-colors focus:outline-none"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {isPasswordVisible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="text-xs font-bold text-status-error mt-1 flex items-center gap-1"
        >
          <FiAlertCircle className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

// Left Panel - Branding with Tech Pattern
function BrandingPanel({ colleges }: { colleges: College[] }) {
  return (
    <div className="hidden lg:flex w-[50%] bg-brick dark:bg-[#1a1f26] relative overflow-hidden flex-col justify-between p-8 text-white transition-colors duration-500 shadow-inner">
      {/* Subtle Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-brick-deep/40 via-transparent to-transparent z-[1]" />

      {/* Watermark Logo - Optimal Visibility */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none flex items-center justify-center overflow-hidden">
        <img
          src={bellsLogo}
          alt=""
          className="w-[140%] max-w-none grayscale opacity-50 mix-blend-overlay rotate-[-10deg]"
        />
      </div>

      <div className="relative z-10 pt-2">
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-widest text-gold mb-1">
            Bells University
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 leading-tight">
            Timetable Generator
          </h1>
          <p className="text-white/80 font-medium text-base max-w-sm">
            Institutional scheduling made dependable.
          </p>
        </div>

        <div className="space-y-1.5 font-medium text-sm mb-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[8px] font-bold flex-shrink-0">
              ✓
            </div>
            <span>Intelligent Scheduling</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[8px] font-bold flex-shrink-0">
              ✓
            </div>
            <span>Conflict Resolution</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[8px] font-bold flex-shrink-0">
              ✓
            </div>
            <span>Real-time Management</span>
          </div>
        </div>

        {/* College Representation Badges */}
        <div className="space-y-1.5">
          <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/40 mb-0.5">
            Serving Colleges:
          </p>
          <div className="grid grid-cols-1 gap-1">
            {(colleges.length > 0 ? colleges : MOCK_COLLEGES)
              .slice(0, 5)
              .map((college: any) => {
                const { accent } = GET_COLLEGE_ASSETS(college.name);
                return (
                  <div
                    key={college.id}
                    className="group relative flex items-center gap-3 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 rounded-institutional backdrop-blur-md transition-all cursor-default overflow-hidden"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 opacity-60"
                      style={{ backgroundColor: college.accent || accent }}
                    />
                    <span className="text-[12px] font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                      {college.name}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-4">
        <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">
          © 2026 Bells University. All rights reserved.
        </p>
      </div>
    </div>
  );
}

interface AuthCardProps {
  onSubmit: (e: FormEvent) => void;
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  isLoading: boolean;
}

// Right Panel - Auth Form with Enhanced Features
function AuthCard({
  onSubmit,
  username,
  setUsername,
  password,
  setPassword,
  isLoading,
}: AuthCardProps) {
  const { theme, toggle } = useTheme();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<StrengthLevel>({
    strength: 0,
    label: "",
    color: "",
  });
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [bellRinging, setBellRinging] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus username field on mount
  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  // Calculate password strength whenever password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  const handleThemeToggle = () => {
    setBellRinging(true);
    toggle();
    setTimeout(() => setBellRinging(false), 600);
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setIsUsernameValid(value.trim().length >= 3);
    if (errors.username) {
      setErrors({ ...errors, username: "" });
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password) {
      setErrors({ ...errors, password: "" });
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    nextFieldId: string,
  ) => {
    if (e.key === "Enter" && nextFieldId) {
      e.preventDefault();
      const nextField = document.getElementById(
        nextFieldId,
      ) as HTMLInputElement;
      if (nextField) nextField.focus();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center p-8 md:p-10 bg-surface relative animate-fadeIn overflow-hidden h-full">
      <div className="flex justify-between items-start mb-6 max-w-md mx-auto w-full">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-black text-institutional-primary tracking-tight">
            Welcome Back
          </h2>
          <p className="text-institutional-secondary text-xs font-semibold opacity-60">
            Sign in to your account
          </p>
        </div>
        <button
          className={`p-2 rounded-full bg-page hover:bg-brick/10 text-institutional-muted hover:text-brick transition-all absolute top-6 right-6 z-20 ${bellRinging ? "animate-pulse" : ""}`}
          onClick={handleThemeToggle}
          aria-label="Toggle theme"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          disabled={isLoading}
        >
          <IconBell active={theme === "dark"} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-md mx-auto w-full"
      >
        <LoginInput
          id="login-username"
          label="Username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={handleUsernameChange}
          error={errors.username}
          required
          autoComplete="username"
          isValid={isUsernameValid}
          autoFocus={true}
          onKeyDown={(e) => handleKeyDown(e, "login-password")}
          disabled={isLoading}
        />

        <div>
          <LoginInput
            id="login-password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            error={errors.password}
            required
            autoComplete="current-password"
            showPasswordToggle={true}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />

          {password && !errors.password && (
            <div className="mt-2 text-institutional-primary">
              <div className="h-1 w-full bg-brick/10 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${(passwordStrength.strength / 5) * 100}%`,
                    backgroundColor: passwordStrength.color,
                  }}
                />
              </div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider text-right"
                style={{ color: passwordStrength.color }}
              >
                {passwordStrength.label}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer group select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-brick/20 text-brick focus:ring-brick/20 cursor-pointer bg-page"
              aria-label="Remember me"
              disabled={isLoading}
            />
            <span className="text-sm text-institutional-secondary group-hover:text-institutional-primary transition-colors font-medium">
              Remember me
            </span>
          </label>
          <a
            href="#forgot"
            className="text-sm font-bold text-gold-deep hover:underline underline-offset-4"
          >
            Forgot password?
          </a>
        </div>

        <Button
          variant="brand"
          type="submit"
          disabled={isLoading}
          className="w-full py-4 text-sm font-bold bg-gold hover:bg-gold-deep text-brick-deep shadow-none hover:shadow-lg transition-all rounded-institutional flex items-center justify-center gap-2 uppercase tracking-wide"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-brick-deep border-t-transparent rounded-full animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="relative py-4 max-w-md mx-auto w-full text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-brick/10"></div>
        </div>
        <span className="relative bg-surface px-4 text-[10px] uppercase tracking-widest text-institutional-muted font-bold">
          Need help?
        </span>
      </div>

      <div className="max-w-md mx-auto w-full text-center">
        <p className="text-[10px] text-institutional-secondary font-medium">
          IT Support:{" "}
          <a
            href="mailto:support@bellsuniversity.edu"
            className="text-gold-deep font-bold hover:underline"
          >
            support@bellsuniversity.edu
          </a>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const navigate = useNavigate();

  const { data: colleges = [] } = useQuery({
    queryKey: ["colleges"],
    queryFn: collegeService.getAll,
    staleTime: 1000 * 60 * 30, // Colleges change infrequently, 30m cache
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoadingSubmit(true);

    try {
      await authService.login(username, password);
      toast.success("Login successful!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Invalid username or password");
      setIsLoadingSubmit(false);
    }
  };

  return (
    <div className="flex h-screen bg-page overflow-hidden">
      <BrandingPanel colleges={colleges} />
      <AuthCard
        onSubmit={handleSubmit}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        isLoading={isLoadingSubmit}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
