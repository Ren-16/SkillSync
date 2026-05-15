// import React, { useState, useEffect } from "react";
// import { Form, Button, Alert, Spinner, InputGroup } from "react-bootstrap";
// import { supabase } from "../supabaseClient";
// import { Link, useNavigate } from "react-router-dom";

// export default function Login() {
//     const navigate = useNavigate();

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);

//     // ── Redirect if already logged in ────────────────────────────────────────
//     useEffect(() => {
//         const checkSession = async () => {
//             const { data } = await supabase.auth.getSession();
//             if (data.session) navigate("/home", { replace: true });
//         };
//         checkSession();
//     }, [navigate]);

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setErrors({});
//         if (!email) return setErrors({ email: "Email is required." });
//         if (!password) return setErrors({ password: "Password is required." });

//         setLoading(true);
//         const { error } = await supabase.auth.signInWithPassword({ email, password });
//         if (error) {
//             setErrors({ login: error.message });
//             setLoading(false);
//             return;
//         }
//         setLoading(false);
//         navigate("/home", { replace: true });
//     };

//     return (
//         <div style={styles.page}>
//             {/* ── Decorative blobs ─────────────────────────────────────── */}
//             <div style={styles.blob1} />
//             <div style={styles.blob2} />

//             <div style={styles.card}>
//                 {/* ── Branding ─────────────────────────────────────────── */}
//                 <div style={styles.brandArea}>
//                     <div style={styles.logoCircle}>
//                         <span style={{ fontSize: "1.5rem" }}>⚡</span>
//                     </div>
//                     <h2 style={styles.brandName}>SkillSync</h2>
//                     <p style={styles.brandSub}>Faculty Competency Management System</p>
//                 </div>

//                 {/* ── Divider ───────────────────────────────────────────── */}
//                 <div style={styles.divider}>
//                     <span style={styles.dividerText}>Sign in to your account</span>
//                 </div>

//                 {/* ── Error Alert ───────────────────────────────────────── */}
//                 {errors.login && (
//                     <Alert
//                         variant="danger"
//                         className="py-2 small text-center mb-3 rounded-3"
//                         style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b" }}
//                     >
//                         ⚠️ {errors.login}
//                     </Alert>
//                 )}

//                 {/* ── Form ─────────────────────────────────────────────── */}
//                 <Form onSubmit={handleLogin}>
//                     <Form.Group className="mb-3">
//                         <Form.Label style={styles.label}>Email Address</Form.Label>
//                         <div style={styles.inputWrapper}>
//                             <span style={styles.inputIcon}>✉️</span>
//                             <Form.Control
//                                 type="email"
//                                 placeholder="name@university.edu"
//                                 value={email}
//                                 isInvalid={!!errors.email}
//                                 onChange={e => setEmail(e.target.value)}
//                                 style={styles.input}
//                             />
//                         </div>
//                         {errors.email && <div style={styles.fieldError}>{errors.email}</div>}
//                     </Form.Group>

//                     <Form.Group className="mb-4">
//                         <Form.Label style={styles.label}>Password</Form.Label>
//                         <div style={{ ...styles.inputWrapper, paddingRight: 0 }}>
//                             <span style={styles.inputIcon}>🔒</span>
//                             <Form.Control
//                                 type={showPassword ? "text" : "password"}
//                                 placeholder="Enter your password"
//                                 value={password}
//                                 isInvalid={!!errors.password}
//                                 onChange={e => setPassword(e.target.value)}
//                                 style={{ ...styles.input, borderRight: "none" }}
//                             />
//                             <button
//                                 type="button"
//                                 onClick={() => setShowPassword(!showPassword)}
//                                 style={styles.eyeBtn}
//                             >
//                                 {showPassword ? "🙈" : "👁️"}
//                             </button>
//                         </div>
//                         {errors.password && <div style={styles.fieldError}>{errors.password}</div>}
//                     </Form.Group>

//                     <button type="submit" style={styles.submitBtn} disabled={loading}>
//                         {loading ? (
//                             <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
//                                 <Spinner animation="border" size="sm" style={{ borderColor: "#fff", borderRightColor: "transparent" }} />
//                                 Signing in…
//                             </span>
//                         ) : (
//                             "Sign In →"
//                         )}
//                     </button>
//                 </Form>

//                 {/* ── Footer Link ───────────────────────────────────────── */}
//                 <p style={styles.footerText}>
//                     Don't have an account?{" "}
//                     <Link to="/" style={styles.footerLink}>Create Account</Link>
//                 </p>
//             </div>
//         </div>
//     );
// }

// // ── Inline styles ─────────────────────────────────────────────────────────────
// const styles = {
//     page: {
//         minHeight: "100vh",
//         width: "100%",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
//         padding: "20px",
//         position: "relative",
//         overflow: "hidden",
//         fontFamily: "'Segoe UI', system-ui, sans-serif",
//     },
//     blob1: {
//         position: "absolute",
//         top: "-15%",
//         right: "-10%",
//         width: 480,
//         height: 480,
//         borderRadius: "50%",
//         background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
//         pointerEvents: "none",
//     },
//     blob2: {
//         position: "absolute",
//         bottom: "-15%",
//         left: "-10%",
//         width: 420,
//         height: 420,
//         borderRadius: "50%",
//         background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)",
//         pointerEvents: "none",
//     },
//     card: {
//         background: "rgba(255,255,255,0.97)",
//         borderRadius: 20,
//         padding: "44px 40px 36px",
//         width: "100%",
//         maxWidth: 440,
//         boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
//         position: "relative",
//         zIndex: 1,
//     },
//     brandArea: {
//         textAlign: "center",
//         marginBottom: 24,
//     },
//     logoCircle: {
//         width: 60,
//         height: 60,
//         borderRadius: "50%",
//         background: "linear-gradient(135deg, #1e3a5f, #0d6efd)",
//         display: "inline-flex",
//         alignItems: "center",
//         justifyContent: "center",
//         marginBottom: 12,
//         boxShadow: "0 4px 16px rgba(13,110,253,0.4)",
//     },
//     brandName: {
//         fontWeight: 800,
//         fontSize: "1.8rem",
//         color: "#0f172a",
//         marginBottom: 4,
//         letterSpacing: "-0.5px",
//     },
//     brandSub: {
//         color: "#64748b",
//         fontSize: "0.82rem",
//         margin: 0,
//         textTransform: "uppercase",
//         letterSpacing: "0.5px",
//     },
//     divider: {
//         display: "flex",
//         alignItems: "center",
//         marginBottom: 24,
//     },
//     dividerText: {
//         flex: 1,
//         textAlign: "center",
//         color: "#94a3b8",
//         fontSize: "0.82rem",
//         position: "relative",
//         fontWeight: 500,
//     },
//     label: {
//         fontSize: "0.82rem",
//         fontWeight: 700,
//         color: "#374151",
//         marginBottom: 6,
//         display: "block",
//     },
//     inputWrapper: {
//         display: "flex",
//         alignItems: "center",
//         border: "1.5px solid #e2e8f0",
//         borderRadius: 10,
//         overflow: "hidden",
//         background: "#f8fafc",
//         transition: "border-color 0.2s",
//     },
//     inputIcon: {
//         padding: "0 10px",
//         fontSize: "1rem",
//         userSelect: "none",
//         flexShrink: 0,
//     },
//     input: {
//         border: "none",
//         background: "transparent",
//         boxShadow: "none",
//         padding: "10px 8px",
//         fontSize: "0.9rem",
//         flex: 1,
//     },
//     eyeBtn: {
//         background: "none",
//         border: "none",
//         padding: "0 12px",
//         cursor: "pointer",
//         fontSize: "1rem",
//         color: "#94a3b8",
//         flexShrink: 0,
//     },
//     fieldError: {
//         color: "#dc2626",
//         fontSize: "0.75rem",
//         marginTop: 4,
//     },
//     submitBtn: {
//         width: "100%",
//         padding: "12px",
//         background: "linear-gradient(135deg, #1e3a5f 0%, #0d6efd 100%)",
//         color: "#fff",
//         border: "none",
//         borderRadius: 10,
//         fontWeight: 700,
//         fontSize: "0.95rem",
//         cursor: "pointer",
//         letterSpacing: "0.3px",
//         transition: "opacity 0.2s, transform 0.15s",
//         boxShadow: "0 4px 14px rgba(13,110,253,0.4)",
//     },
//     footerText: {
//         textAlign: "center",
//         marginTop: 20,
//         marginBottom: 0,
//         fontSize: "0.82rem",
//         color: "#64748b",
//     },
//     footerLink: {
//         color: "#0d6efd",
//         fontWeight: 700,
//         textDecoration: "none",
//     },
// };

/**
 * Login.jsx
 * ─────────────────────────────────────────────────────────────────
 * Faculty Login Page — SkillSync
 *
 * Features:
 *  • Email/password authentication via Supabase Auth
 *  • "Forgot Password" modal → supabase.auth.resetPasswordForEmail()
 *  • Animated success/error feedback states
 *  • Session guard (redirects authenticated users to /home)
 *
 * Supabase Reset Flow:
 *  1. User enters email in the "Forgot Password" modal.
 *  2. resetPasswordForEmail() sends a reset email with a link
 *     pointing to /reset-password (configured in Supabase dashboard
 *     under Authentication → URL Configuration → Redirect URLs).
 *  3. The user clicks the link, lands on ResetPassword.jsx, and
 *     sets a new password via supabase.auth.updateUser().
 *
 * ⚠️  IMPORTANT — Supabase Dashboard Setup Required:
 *     Add the following to your Redirect URLs:
 *       http://localhost:5173/reset-password   (development)
 *       https://your-domain.com/reset-password (production)
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

/* ─── Styles ──────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    backgroundImage: `
      linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(30,58,138,0.82) 100%),
      url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Lato', sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(16px)",
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    maxWidth: "440px",
    width: "100%",
    overflow: "hidden",
  },
  headerStripe: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
    padding: "24px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontFamily: "'Playfair Display', serif",
    color: "#fff",
    fontSize: "1.6rem",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    margin: 0,
  },
  logoBadge: {
    background: "rgba(255,255,255,0.12)",
    color: "#93c5fd",
    fontSize: "0.68rem",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    padding: "4px 10px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  body: {
    padding: "32px",
  },
  input: {
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    padding: "11px 14px",
    fontSize: "0.9rem",
    background: "#f9fafb",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "5px",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    border: "none",
    borderRadius: "12px",
    padding: "12px 0",
    fontSize: "0.95rem",
    fontWeight: "700",
    letterSpacing: "0.5px",
    color: "#fff",
    width: "100%",
    transition: "opacity 0.2s",
  },
  forgotLink: {
    fontSize: "0.8rem",
    color: "#3b82f6",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    background: "none",
    border: "none",
    padding: 0,
  },
};

/* ─── Component ───────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();

  /* ── Login form state ──────────────────────────────────────── */
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);

  /* ── Forgot-password modal state ───────────────────────────── */
  const [showForgot,       setShowForgot]       = useState(false);
  const [resetEmail,       setResetEmail]       = useState("");
  const [resetLoading,     setResetLoading]     = useState(false);
  const [resetError,       setResetError]       = useState("");
  const [resetSuccess,     setResetSuccess]     = useState(false);

  /* ── Redirect already-authenticated users ──────────────────── */
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate("/home", { replace: true });
    };
    checkSession();
  }, [navigate]);

  /* ── Login handler ─────────────────────────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email)    newErrors.email    = "Email is required.";
    if (!password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrors({ login: "Invalid email or password. Please try again." });
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/home", { replace: true });
  };

  /* ── Forgot-password handler ───────────────────────────────── */
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError("");

    if (!resetEmail || !resetEmail.includes("@")) {
      setResetError("Please enter a valid email address.");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      /*
       * redirectTo must be whitelisted in your Supabase dashboard:
       *   Authentication → URL Configuration → Redirect URLs
       *
       * Add both:
       *   http://localhost:5173/reset-password     (dev)
       *   https://your-production-domain.com/reset-password  (prod)
       */
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setResetLoading(false);

    if (error) {
      setResetError(error.message);
      return;
    }

    setResetSuccess(true);
  };

  /* ── Reset modal: close & clear ────────────────────────────── */
  const closeForgotModal = () => {
    setShowForgot(false);
    setResetEmail("");
    setResetError("");
    setResetSuccess(false);
  };

  /* ─────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Google Fonts ── */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        rel="stylesheet"
      />

      <div style={styles.page}>
        <div style={styles.card}>

          {/* ── Header Stripe ── */}
          <div style={styles.headerStripe}>
            <h1 style={styles.logo}>SkillSync</h1>
            <span style={styles.logoBadge}>Faculty Portal</span>
          </div>

          {/* ── Body ── */}
          <div style={styles.body}>
            <div className="mb-4">
              <h5 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>
                Welcome Back
              </h5>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
                Sign in to your SkillSync account to continue.
              </p>
            </div>

            {/* Login-level error */}
            {errors.login && (
              <Alert variant="danger" className="py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill" />
                {errors.login}
              </Alert>
            )}

            <Form onSubmit={handleLogin} noValidate>
              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label style={styles.label}>
                  Email Address <span style={{ color: "#ef4444" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="name@university.edu.ph"
                  value={email}
                  isInvalid={!!errors.email}
                  onChange={e => setEmail(e.target.value)}
                  style={styles.input}
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-1">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label style={styles.label}>
                    Password <span style={{ color: "#ef4444" }}>*</span>
                  </Form.Label>
                  {/* ── Forgot Password trigger ── */}
                  <button
                    type="button"
                    style={styles.forgotLink}
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot password?
                  </button>
                </div>

                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    isInvalid={!!errors.password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ ...styles.input, borderRight: "none", borderRadius: "10px 0 0 10px" }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(p => !p)}
                    style={{ borderRadius: "0 10px 10px 0", borderColor: "#e5e7eb", background: "#f9fafb" }}
                  >
                    <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} />
                  </Button>
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              {/* Submit */}
              <div className="mt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  style={styles.submitBtn}
                  onMouseOver={e => (e.currentTarget.style.opacity = "0.88")}
                  onMouseOut={e => (e.currentTarget.style.opacity = "1")}
                >
                  {loading
                    ? <><Spinner animation="border" size="sm" className="me-2" />Signing in…</>
                    : <><i className="bi bi-box-arrow-in-right me-2" />Sign In</>
                  }
                </Button>
              </div>
            </Form>

            <p className="text-center mt-4 mb-0" style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              Don't have an account?{" "}
              <Link to="/" style={{ color: "#1e3a8a", fontWeight: 700, textDecoration: "none" }}>
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          FORGOT PASSWORD MODAL
          ══════════════════════════════════════════════════════ */}
      <Modal
        show={showForgot}
        onHide={closeForgotModal}
        centered
        size="sm"
      >
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
            borderBottom: "none",
            padding: "18px 24px",
          }}
        >
          <Modal.Title
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 700,
            }}
          >
            Reset Your Password
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "28px 24px 20px" }}>
          {!resetSuccess ? (
            <>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "20px" }}>
                Enter the email address associated with your account and we will
                send you a password reset link.
              </p>

              {resetError && (
                <Alert variant="danger" className="py-2 small d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill" />
                  {resetError}
                </Alert>
              )}

              <Form onSubmit={handleForgotPassword} noValidate>
                <Form.Group className="mb-4">
                  <Form.Label style={styles.label}>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@university.edu.ph"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    style={styles.input}
                    autoFocus
                  />
                </Form.Group>

                <Button
                  type="submit"
                  disabled={resetLoading}
                  style={styles.submitBtn}
                >
                  {resetLoading
                    ? <><Spinner animation="border" size="sm" className="me-2" />Sending…</>
                    : <><i className="bi bi-envelope-fill me-2" />Send Reset Link</>
                  }
                </Button>

                <Button
                  variant="link"
                  className="w-100 mt-2"
                  style={{ color: "#6b7280", fontSize: "0.82rem", textDecoration: "none" }}
                  onClick={closeForgotModal}
                >
                  Cancel
                </Button>
              </Form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center py-2">
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📧</div>
              <h6 style={{ fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
                Check Your Inbox
              </h6>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "20px" }}>
                A password reset link has been sent to{" "}
                <strong style={{ color: "#1e3a8a" }}>{resetEmail}</strong>.
                The link will expire in <strong>1 hour</strong>.
              </p>
              <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginBottom: "20px" }}>
                Didn't receive it? Check your spam folder or{" "}
                <button
                  type="button"
                  style={{ ...styles.forgotLink, fontSize: "0.78rem" }}
                  onClick={() => setResetSuccess(false)}
                >
                  try again
                </button>
                .
              </p>
              <Button
                className="rounded-pill px-4 fw-bold"
                style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)", border: "none" }}
                onClick={closeForgotModal}
              >
                Back to Login
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}