// import React, { useState, useEffect } from "react";
// import {
//   Form,
//   Button,
//   Card,
//   Container,
//   Alert,
//   Spinner,
//   InputGroup,
//   Modal,
//   Row,
//   Col,
// } from "react-bootstrap";
// import { supabase } from "../supabaseClient";
// import { Link, useNavigate } from "react-router-dom";

// export default function Signup() {
//   const navigate = useNavigate();
//   // ... existing state variables ...
//   const [firstName, setFirstName] = useState("");
//   const [middleName, setMiddleName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [departmentId, setDepartmentId] = useState("");
//   const [departments, setDepartments] = useState([]);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);

//   useEffect(() => {
//     async function fetchDepartments() {
//       const { data, error } = await supabase.from("departments").select("*");
//       if (!error) setDepartments(data);
//     }
//     fetchDepartments();
//   }, []);

//   const isPasswordValid = (password) => {
//     return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
//   };

//   const validateForm = () => {
//     let newErrors = {};
//     if (!firstName.trim()) newErrors.firstName = "First name is required.";
//     if (!lastName.trim()) newErrors.lastName = "Last name is required.";
//     if (!email.includes("@")) newErrors.email = "Please enter a valid email.";
//     if (!isPasswordValid(password)) newErrors.password = "Password is too weak.";
//     if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
//     if (!departmentId) newErrors.department = "Please select a department.";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     setLoading(true);

//     const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

//     if (authError) {
//       setErrors({ signup: authError.message });
//       setLoading(false);
//       return;
//     }

//     if (authData.user) {
//       const { error: profileError } = await supabase.from("profiles").insert([{
//         id: authData.user.id,
//         first_name: firstName,
//         middle_name: middleName,
//         last_name: lastName,
//         department_id: departmentId,
//         profile_image: null,
//         role: "faculty",
//       }]);
//       if (profileError) { setErrors({ signup: profileError.message }); setLoading(false); return; }
//     }
//     setLoading(false);
//     setShowSuccess(true);
//   };

//   // Styles defined as constants for easier editing
//   const containerStyle = {
//     minHeight: "100vh",
//     width: "100%",
//     // REPLACE THE URL BELOW WITH YOUR IMAGE
//     backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80')`,
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: "20px"
//   };

//   const cardStyle = {
//     background: "rgba(255, 255, 255, 0.9)",
//     backdropFilter: "blur(10px)",
//     borderRadius: "15px",
//     border: "none",
//     boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
//     maxWidth: "850px",
//     width: "100%"
//   };

//   return (
//     <div style={containerStyle}>
//       <Card style={cardStyle} className="p-4 p-md-5">
//         <div className="text-center mb-4">
//           <h2 className="fw-bold text-primary">SkillSync</h2>
//           <p className="text-muted">Faculty Competency Management System</p>
//           <hr className="w-25 mx-auto" />
//           <h4 className="mt-3">Create Your Account</h4>
//         </div>

//         {errors.signup && <Alert variant="danger" className="text-center">{errors.signup}</Alert>}

//         <Form onSubmit={handleRegister}>
//           <Row>
//             <Col md={6} className="border-md-end">
//               <h6 className="mb-3 text-uppercase small fw-bold text-muted">Personal Information</h6>
//               <Form.Group className="mb-3">
//                 <Form.Label className="small fw-bold">First Name</Form.Label>
//                 <Form.Control type="text" placeholder="John" value={firstName} isInvalid={!!errors.firstName} onChange={(e) => setFirstName(e.target.value)} />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label className="small fw-bold">Middle Name</Form.Label>
//                 <Form.Control type="text" placeholder="Quincy" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label className="small fw-bold">Last Name</Form.Label>
//                 <Form.Control type="text" placeholder="Doe" value={lastName} isInvalid={!!errors.lastName} onChange={(e) => setLastName(e.target.value)} />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label className="small fw-bold">Department</Form.Label>
//                 <Form.Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} isInvalid={!!errors.department}>
//                   <option value="">Select Department</option>
//                   {departments.map((dept) => (
//                     <option key={dept.id} value={dept.id}>{dept.name}</option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>
//             </Col>

//             <Col md={6}>
//               <h6 className="mb-3 text-uppercase small fw-bold text-muted">Account Credentials</h6>
//               <Form.Group className="mb-3">
//                 <Form.Label className="small fw-bold">Email Address</Form.Label>
//                 <Form.Control type="email" placeholder="name@university.edu" value={email} isInvalid={!!errors.email} onChange={(e) => setEmail(e.target.value)} />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label className="small fw-bold">Password</Form.Label>
//                 <InputGroup>
//                   <Form.Control
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Min. 8 characters"
//                     value={password}
//                     isInvalid={!!errors.password}
//                     onChange={(e) => setPassword(e.target.value)}
//                   />
//                   <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
//                     <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
//                   </Button>
//                 </InputGroup>
//                 <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
//                   Must include Uppercase, Number, and Special Char.
//                 </Form.Text>
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label className="small fw-bold">Confirm Password</Form.Label>
//                 <InputGroup>
//                   <Form.Control
//                     type={showConfirm ? "text" : "password"}
//                     placeholder="Repeat password"
//                     value={confirmPassword}
//                     isInvalid={!!errors.confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                   />
//                   <Button variant="outline-secondary" onClick={() => setShowConfirm(!showConfirm)}>
//                     <i className={showConfirm ? "bi bi-eye-slash" : "bi bi-eye"}></i>
//                   </Button>
//                 </InputGroup>
//               </Form.Group>
//             </Col>
//           </Row>

//           <Button variant="primary" type="submit" className="w-100 mt-4 py-2 shadow-sm fw-bold" disabled={loading}>
//             {loading ? <Spinner animation="border" size="sm" /> : "CREATE ACCOUNT"}
//           </Button>
//         </Form>

//         <p className="text-center mt-4 mb-0">
//           Already have an account?{" "}
//           <Link to="/login" className="fw-bold text-decoration-none">
//             Sign In
//           </Link>
//         </p>
//       </Card>

//       {/* Success Modal */}
//       <Modal show={showSuccess} onHide={() => navigate("/login")} centered>
//         <Modal.Body className="text-center p-5">
//           <div className="mb-3 text-success">
//              <i className="bi bi-check-circle" style={{ fontSize: "3rem" }}></i>
//           </div>
//           <h3 className="fw-bold">Registration Successful!</h3>
//           <p className="text-muted">Your account has been created. Please check your email for a verification link.</p>
//           <Button variant="success" className="w-100 mt-3" onClick={() => navigate("/login")}>
//             Go to Login
//           </Button>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// }

/**
 * Signup.jsx
 * ─────────────────────────────────────────────────────────────────
 * Faculty Registration Page — SkillSync
 *
 * Features:
 *  • Two-column responsive layout (personal info / credentials)
 *  • Real-time password-strength indicator
 *  • Client-side validation with inline feedback
 *  • Department dropdown fetched from Supabase
 *  • Supabase Auth sign-up + profiles table insertion
 *  • Success modal with redirect to /login
 *
 * APA Citation:
 *  Anastasya et al. (2024) validate that iterative, user-centered
 *  form design reduces input errors in academic web applications.
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
  Row,
  Col,
  ProgressBar,
} from "react-bootstrap";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

/* ─── Password strength scorer (0–4) ─────────────────────────── */
function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  return score;
}

const strengthMeta = [
  { label: "Too short",  variant: "danger",  color: "#ef4444" },
  { label: "Weak",       variant: "danger",  color: "#ef4444" },
  { label: "Fair",       variant: "warning", color: "#f59e0b" },
  { label: "Good",       variant: "info",    color: "#3b82f6" },
  { label: "Strong",     variant: "success", color: "#22c55e" },
];

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
    padding: "32px 16px",
    fontFamily: "'Lato', sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(16px)",
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    maxWidth: "900px",
    width: "100%",
    overflow: "hidden",
  },
  headerStripe: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
    padding: "28px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontFamily: "'Playfair Display', serif",
    color: "#fff",
    fontSize: "1.7rem",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    margin: 0,
  },
  logoBadge: {
    background: "rgba(255,255,255,0.12)",
    color: "#93c5fd",
    fontSize: "0.7rem",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    padding: "4px 10px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  body: {
    padding: "36px 40px 32px",
  },
  sectionLabel: {
    fontSize: "0.65rem",
    fontWeight: "700",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e5e7eb",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "5px",
  },
  input: {
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    padding: "10px 14px",
    fontSize: "0.9rem",
    transition: "border-color 0.2s, box-shadow 0.2s",
    background: "#f9fafb",
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
    transition: "opacity 0.2s, transform 0.15s",
    width: "100%",
    marginTop: "4px",
  },
};

/* ─── Component ───────────────────────────────────────────────── */
export default function Signup() {
  const navigate = useNavigate();

  /* Form state */
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [firstName,       setFirstName]       = useState("");
  const [middleName,      setMiddleName]       = useState("");
  const [lastName,        setLastName]         = useState("");
  const [email,           setEmail]            = useState("");
  const [password,        setPassword]         = useState("");
  const [confirmPassword, setConfirmPassword]  = useState("");
  const [departmentId,    setDepartmentId]     = useState("");
  const [departments,     setDepartments]      = useState([]);

  /* UI state */
  const [showPassword,    setShowPassword]   = useState(false);
  const [showConfirm,     setShowConfirm]    = useState(false);
  const [errors,          setErrors]         = useState({});
  const [loading,         setLoading]        = useState(false);
  const [showSuccess,     setShowSuccess]    = useState(false);
  const [globalError,     setGlobalError]    = useState("");

  const pwStrength = getPasswordStrength(password);
  const pwMeta     = strengthMeta[pwStrength] ?? strengthMeta[0];

  /* Fetch departments on mount */
  useEffect(() => {
    const fetchDepts = async () => {
      const { data, error } = await supabase.from("departments").select("*");
      if (!error) setDepartments(data || []);
    };
    fetchDepts();
  }, []);

  /* ── Validation ────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!employeeNumber.trim()) e.employeeNumber = "Employee number is required.";
    if (!firstName.trim()) e.firstName = "First name is required.";
    if (!lastName.trim())  e.lastName  = "Last name is required.";
    if (!email.includes("@")) e.email  = "Please enter a valid email address.";
    if (pwStrength < 4)    e.password  = "Password does not meet all requirements.";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (!departmentId)     e.department = "Please select a department.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ────────────────────────────────────────────────── */
  const handleRegister = async (e) => {
    e.preventDefault();
    setGlobalError("");
    if (!validate()) return;
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setGlobalError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert([{
        id:            authData.user.id,
        employee_number: employeeNumber,
        first_name:    firstName,
        middle_name:   middleName,
        last_name:     lastName,
        department_id: departmentId,
        profile_image: null,
        role:          "faculty",
      }]);
      if (profileError) {
        setGlobalError(profileError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setShowSuccess(true);
  };

  /* ── Helpers ───────────────────────────────────────────────── */
  const FieldLabel = ({ children, required }) => (
    <Form.Label style={styles.label}>
      {children}
      {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
    </Form.Label>
  );

  const inputProps = {
    style: styles.input,
    className: "w-100",
  };

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
                Create Your Account
              </h5>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
                Register to access the faculty competency management system.
              </p>
            </div>

            {globalError && (
              <Alert variant="danger" className="py-2 small" dismissible onClose={() => setGlobalError("")}>
                <i className="bi bi-exclamation-triangle-fill me-2" />
                {globalError}
              </Alert>
            )}

            <Form onSubmit={handleRegister} noValidate>
              <Row className="g-4">

                {/* ── Left Column: Personal Info ── */}
                <Col md={6}>
                  <div style={styles.sectionLabel}>
                    <i className="bi bi-person" style={{ color: "#3b82f6" }} />
                    Personal Information
                    <div style={styles.dividerLine} />
                  </div>

                  <Row className="g-3">
                    <Col sm={12}>
                      <Form.Group>
                        <FieldLabel required>Employee Number</FieldLabel>
                        <Form.Control
                          type="text"
                          placeholder="e.g. 2024-0001"
                          value={employeeNumber}
                          onChange={e => setEmployeeNumber(e.target.value)}
                          isInvalid={!!errors.employeeNumber}
                          style={styles.input}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.employeeNumber}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col sm={12}>
                      <Form.Group>
                        <FieldLabel required>First Name</FieldLabel>
                        <Form.Control
                          type="text"
                          placeholder="e.g. Mathew"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          isInvalid={!!errors.firstName}
                          style={styles.input}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.firstName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col sm={12}>
                      <Form.Group>
                        <FieldLabel>Middle Name</FieldLabel>
                        <Form.Control
                          type="text"
                          placeholder="e.g. Mojica (optional)"
                          value={middleName}
                          onChange={e => setMiddleName(e.target.value)}
                          style={styles.input}
                        />
                      </Form.Group>
                    </Col>

                    <Col sm={12}>
                      <Form.Group>
                        <FieldLabel required>Last Name</FieldLabel>
                        <Form.Control
                          type="text"
                          placeholder="e.g. Santiago"
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          isInvalid={!!errors.lastName}
                          style={styles.input}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.lastName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col sm={12}>
                      <Form.Group>
                        <FieldLabel required>Department</FieldLabel>
                        <Form.Select
                          value={departmentId}
                          onChange={e => setDepartmentId(e.target.value)}
                          isInvalid={!!errors.department}
                          style={{ ...styles.input, paddingRight: "32px" }}
                        >
                          <option value="">— Select your department —</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.department}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>

                {/* ── Right Column: Credentials ── */}
                <Col md={6}>
                  <div style={styles.sectionLabel}>
                    <i className="bi bi-shield-lock" style={{ color: "#3b82f6" }} />
                    Account Credentials
                    <div style={styles.dividerLine} />
                  </div>

                  <Row className="g-3">
                    <Col sm={12}>
                      <Form.Group>
                        <FieldLabel required>Email Address</FieldLabel>
                        <Form.Control
                          type="email"
                          placeholder="name@university.edu.ph"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          isInvalid={!!errors.email}
                          style={styles.input}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col sm={12}>
                      <Form.Group>
                        <FieldLabel required>Password</FieldLabel>
                        <InputGroup>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            isInvalid={!!errors.password}
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

                        {/* Strength bar */}
                        {password.length > 0 && (
                          <div className="mt-2">
                            <ProgressBar
                              now={(pwStrength / 4) * 100}
                              variant={pwMeta.variant}
                              style={{ height: "5px", borderRadius: "4px" }}
                            />
                            <div className="d-flex justify-content-between mt-1">
                              <small style={{ color: pwMeta.color, fontWeight: 600, fontSize: "0.72rem" }}>
                                {pwMeta.label}
                              </small>
                              <small style={{ color: "#9ca3af", fontSize: "0.72rem" }}>
                                {pwStrength}/4 requirements met
                              </small>
                            </div>
                          </div>
                        )}

                        {/* Requirements checklist */}
                        <div className="mt-2" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {[
                            { ok: password.length >= 8,               text: "At least 8 characters" },
                            { ok: /[A-Z]/.test(password),             text: "One uppercase letter" },
                            { ok: /[0-9]/.test(password),             text: "One number" },
                            { ok: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: "One special character" },
                          ].map(({ ok, text }) => (
                            <small
                              key={text}
                              style={{ color: ok ? "#22c55e" : "#9ca3af", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 4 }}
                            >
                              <i className={ok ? "bi bi-check-circle-fill" : "bi bi-circle"} />
                              {text}
                            </small>
                          ))}
                        </div>
                      </Form.Group>
                    </Col>

                    <Col sm={12}>
                      <Form.Group>
                        <FieldLabel required>Confirm Password</FieldLabel>
                        <InputGroup>
                          <Form.Control
                            type={showConfirm ? "text" : "password"}
                            placeholder="Repeat your password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            isInvalid={!!errors.confirmPassword}
                            style={{ ...styles.input, borderRight: "none", borderRadius: "10px 0 0 10px" }}
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() => setShowConfirm(p => !p)}
                            style={{ borderRadius: "0 10px 10px 0", borderColor: "#e5e7eb", background: "#f9fafb" }}
                          >
                            <i className={showConfirm ? "bi bi-eye-slash" : "bi bi-eye"} />
                          </Button>
                          <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                        </InputGroup>
                        {confirmPassword.length > 0 && password === confirmPassword && (
                          <small style={{ color: "#22c55e", fontSize: "0.72rem" }}>
                            <i className="bi bi-check-circle-fill me-1" />Passwords match
                          </small>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              </Row>

              {/* ── Submit ── */}
              <div className="mt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  style={styles.submitBtn}
                  onMouseOver={e => (e.currentTarget.style.opacity = "0.9")}
                  onMouseOut={e => (e.currentTarget.style.opacity = "1")}
                >
                  {loading
                    ? <><Spinner animation="border" size="sm" className="me-2" />Creating Account…</>
                    : <><i className="bi bi-person-plus-fill me-2" />Create Account</>
                  }
                </Button>
              </div>
            </Form>

            <p className="text-center mt-4 mb-0" style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#1e3a8a", fontWeight: 700, textDecoration: "none" }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Success Modal ── */}
      <Modal show={showSuccess} onHide={() => navigate("/login")} centered>
        <Modal.Body className="text-center p-5">
          <div className="mb-3" style={{ fontSize: "3.5rem" }}>🎉</div>
          <h4 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#0f172a" }}>
            Registration Successful!
          </h4>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>
            Your account has been created. Please check your email inbox
            for a <strong>verification link</strong> before logging in.
          </p>
          <Button
            className="mt-2 rounded-pill px-5 fw-bold"
            style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)", border: "none" }}
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}