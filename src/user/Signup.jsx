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
// import { Link } from "react-router-dom";

// export default function Signup() {
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

//   // FETCH DEPARTMENTS
//   useEffect(() => {
//     async function fetchDepartments() {
//       const { data, error } = await supabase.from("departments").select("*");
//       if (!error) setDepartments(data);
//     }
//     fetchDepartments();
//   }, []);

//   // PASSWORD VALIDATION
//   const isPasswordValid = (password) => {
//     return (
//       password.length >= 8 &&
//       /[A-Z]/.test(password) &&
//       /[0-9]/.test(password) &&
//       /[!@#$%^&*(),.?":{}|<>]/.test(password)
//     );
//   };

//   const validateForm = () => {
//     let newErrors = {};

//     if (!firstName.trim()) newErrors.firstName = "First name is required.";
//     if (!middleName.trim()) newErrors.middleName = "Middle name is required.";
//     if (!lastName.trim()) newErrors.lastName = "Last name is required.";

//     if (!email.includes("@")) newErrors.email = "Please enter a valid email.";
//     if (!isPasswordValid(password)) newErrors.password = "Password is too weak.";
//     if (password !== confirmPassword)
//       newErrors.confirmPassword = "Passwords do not match.";
//     if (!departmentId) newErrors.department = "Please select a department.";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // REGISTER FUNCTION
//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setErrors({});

//     if (!validateForm()) return;

//     setLoading(true);

//     const { data: authData, error: authError } =
//       await supabase.auth.signUp({
//         email,
//         password,
//       });

//     if (authError) {
//       setErrors({ signup: authError.message });
//       setLoading(false);
//       return;
//     }

//     if (authData.user) {
//       const { error: profileError } = await supabase.from("profiles").insert([
//         {
//           id: authData.user.id,
//           first_name: firstName,
//           middle_name: middleName,
//           last_name: lastName,
//           department_id: departmentId,
//           profile_image: "no profile image yet",
//           role: "faculty",
//           created_at: new Date(),
//         },
//       ]);

//       if (profileError) {
//         setErrors({ signup: profileError.message });
//         setLoading(false);
//         return;
//       }
//     }

//     setLoading(false);
//     setShowSuccess(true);
//   };

//   const redirectToLogin = () => {
//     window.location.href = "/login";
//   };

//   return (
//     <Container
//       className="d-flex justify-content-center align-items-center"
//       style={{ height: "100vh" }}
//     >
//       <Card style={{ width: "700px", padding: "20px" }}>
//         <h3 className="text-center mb-3">Create Account</h3>

//         {errors.signup && <Alert variant="danger">{errors.signup}</Alert>}

//         <Form onSubmit={handleRegister}>
//           <Row>
//             {/* LEFT COLUMN */}
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>First Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter your first name"
//                   value={firstName}
//                   isInvalid={!!errors.firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.firstName}
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Middle Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter your middle name"
//                   value={middleName}
//                   isInvalid={!!errors.middleName}
//                   onChange={(e) => setMiddleName(e.target.value)}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.middleName}
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Last Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter your last name"
//                   value={lastName}
//                   isInvalid={!!errors.lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.lastName}
//                 </Form.Control.Feedback>
//               </Form.Group>
//             </Col>

//             {/* RIGHT COLUMN */}
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Email Address</Form.Label>
//                 <Form.Control
//                   type="email"
//                   placeholder="Enter email"
//                   value={email}
//                   isInvalid={!!errors.email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.email}
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Department</Form.Label>
//                 <Form.Select
//                   value={departmentId}
//                   onChange={(e) => setDepartmentId(e.target.value)}
//                   isInvalid={!!errors.department}
//                 >
//                   <option value="">Select Department</option>
//                   {departments.map((dept) => (
//                     <option key={dept.id} value={dept.id}>
//                       {dept.name}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 <Form.Control.Feedback type="invalid">
//                   {errors.department}
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Password</Form.Label>
//                 <InputGroup>
//                   <Form.Control
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Create password"
//                     value={password}
//                     isInvalid={!!errors.password}
//                     onChange={(e) => setPassword(e.target.value)}
//                   />
//                   <Button
//                     variant="outline-secondary"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     <i
//                       className={
//                         showPassword ? "bi bi-eye-slash" : "bi bi-eye"
//                       }
//                     ></i>
//                   </Button>
//                 </InputGroup>
//                 <Form.Control.Feedback type="invalid">
//                   {errors.password}
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Confirm Password</Form.Label>
//                 <InputGroup>
//                   <Form.Control
//                     type={showConfirm ? "text" : "password"}
//                     placeholder="Confirm password"
//                     value={confirmPassword}
//                     isInvalid={!!errors.confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                   />
//                   <Button
//                     variant="outline-secondary"
//                     onClick={() => setShowConfirm(!showConfirm)}
//                   >
//                     <i
//                       className={
//                         showConfirm ? "bi bi-eye-slash" : "bi bi-eye"
//                       }
//                     ></i>
//                   </Button>
//                 </InputGroup>
//                 <Form.Control.Feedback type="invalid">
//                   {errors.confirmPassword}
//                 </Form.Control.Feedback>
//               </Form.Group>
//             </Col>
//           </Row>

//           <Button
//             variant="primary"
//             type="submit"
//             className="w-100 mt-2"
//             disabled={loading}
//           >
//             {loading ? <Spinner animation="border" size="sm" /> : "Register"}
//           </Button>
//         </Form>

//         <p className="text-center mt-3">
//           Already have an account?{" "}
//           <Link to="/login" style={{ textDecoration: "none" }}>
//             Login
//           </Link>
//         </p>
//       </Card>

//       <Modal show={showSuccess} onHide={redirectToLogin} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Registration Successful!</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           Your account has been created. Please verify your email.
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="primary" onClick={redirectToLogin}>
//             Continue to Login
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// }


import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Container,
  Alert,
  Spinner,
  InputGroup,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  // ... existing state variables ...
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchDepartments() {
      const { data, error } = await supabase.from("departments").select("*");
      if (!error) setDepartments(data);
    }
    fetchDepartments();
  }, []);

  const isPasswordValid = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!email.includes("@")) newErrors.email = "Please enter a valid email.";
    if (!isPasswordValid(password)) newErrors.password = "Password is too weak.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!departmentId) newErrors.department = "Please select a department.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setErrors({ signup: authError.message });
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert([{
        id: authData.user.id,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        department_id: departmentId,
        profile_image: null,
        role: "faculty",
      }]);
      if (profileError) { setErrors({ signup: profileError.message }); setLoading(false); return; }
    }
    setLoading(false);
    setShowSuccess(true);
  };

  // Styles defined as constants for easier editing
  const containerStyle = {
    minHeight: "100vh",
    width: "100%",
    // REPLACE THE URL BELOW WITH YOUR IMAGE
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  };

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
    maxWidth: "850px",
    width: "100%"
  };

  return (
    <div style={containerStyle}>
      <Card style={cardStyle} className="p-4 p-md-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">SkillSync</h2>
          <p className="text-muted">Faculty Competency Management System</p>
          <hr className="w-25 mx-auto" />
          <h4 className="mt-3">Create Your Account</h4>
        </div>

        {errors.signup && <Alert variant="danger" className="text-center">{errors.signup}</Alert>}

        <Form onSubmit={handleRegister}>
          <Row>
            <Col md={6} className="border-md-end">
              <h6 className="mb-3 text-uppercase small fw-bold text-muted">Personal Information</h6>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">First Name</Form.Label>
                <Form.Control type="text" placeholder="John" value={firstName} isInvalid={!!errors.firstName} onChange={(e) => setFirstName(e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Middle Name</Form.Label>
                <Form.Control type="text" placeholder="Quincy" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Last Name</Form.Label>
                <Form.Control type="text" placeholder="Doe" value={lastName} isInvalid={!!errors.lastName} onChange={(e) => setLastName(e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Department</Form.Label>
                <Form.Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} isInvalid={!!errors.department}>
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <h6 className="mb-3 text-uppercase small fw-bold text-muted">Account Credentials</h6>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Email Address</Form.Label>
                <Form.Control type="email" placeholder="name@university.edu" value={email} isInvalid={!!errors.email} onChange={(e) => setEmail(e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    isInvalid={!!errors.password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                    <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </Button>
                </InputGroup>
                <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Must include Uppercase, Number, and Special Char.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Confirm Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    isInvalid={!!errors.confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button variant="outline-secondary" onClick={() => setShowConfirm(!showConfirm)}>
                    <i className={showConfirm ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Button variant="primary" type="submit" className="w-100 mt-4 py-2 shadow-sm fw-bold" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "CREATE ACCOUNT"}
          </Button>
        </Form>

        <p className="text-center mt-4 mb-0">
          Already have an account?{" "}
          <Link to="/login" className="fw-bold text-decoration-none">
            Sign In
          </Link>
        </p>
      </Card>

      {/* Success Modal */}
      <Modal show={showSuccess} onHide={() => navigate("/login")} centered>
        <Modal.Body className="text-center p-5">
          <div className="mb-3 text-success">
             <i className="bi bi-check-circle" style={{ fontSize: "3rem" }}></i>
          </div>
          <h3 className="fw-bold">Registration Successful!</h3>
          <p className="text-muted">Your account has been created. Please check your email for a verification link.</p>
          <Button variant="success" className="w-100 mt-3" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}