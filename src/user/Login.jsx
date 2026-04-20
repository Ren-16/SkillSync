// import React, { useState, useEffect } from "react";
// import {
//   Form,
//   Button,
//   Card,
//   Container,
//   Alert,
//   Spinner,
//   InputGroup,
// } from "react-bootstrap";
// import { supabase } from "../supabaseClient";
// import { Link, useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   // 🚫 If already logged in, redirect away from login
//   useEffect(() => {
//     const checkSession = async () => {
//       const { data } = await supabase.auth.getSession();
//       if (data.session) {
//         navigate("/home", { replace: true });
//       }
//     };
//     checkSession();
//   }, [navigate]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setErrors({});

//     if (!email) return setErrors({ email: "Email is required." });
//     if (!password) return setErrors({ password: "Password is required." });

//     setLoading(true);

//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       setErrors({ login: error.message });
//       setLoading(false);
//       return;
//     }

//     setLoading(false);

//     // ✅ replace prevents going back to login
//     navigate("/home", { replace: true });
//   };

//   return (
//     <Container
//       className="d-flex justify-content-center align-items-center"
//       style={{ height: "100vh" }}
//     >
//       <Card style={{ width: "380px", padding: "20px" }}>
//         <h3 className="text-center mb-3">Login</h3>

//         {errors.login && <Alert variant="danger">{errors.login}</Alert>}

//         <Form onSubmit={handleLogin}>
//           <Form.Group className="mb-3">
//             <Form.Label>Email Address</Form.Label>
//             <Form.Control
//               type="email"
//               value={email}
//               isInvalid={!!errors.email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <Form.Control.Feedback type="invalid">
//               {errors.email}
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Password</Form.Label>
//             <InputGroup>
//               <Form.Control
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 isInvalid={!!errors.password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//               <Button
//                 variant="outline-secondary"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} />
//               </Button>
//             </InputGroup>
//           </Form.Group>

//           <Button type="submit" className="w-100" disabled={loading}>
//             {loading ? <Spinner size="sm" /> : "Login"}
//           </Button>
//         </Form>

//         <p className="text-center mt-3">
//           Don't have an account? <Link to="/">Sign Up</Link>
//         </p>
//       </Card>
//     </Container>
//   );
// }


import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/home", { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!email) return setErrors({ email: "Email is required." });
    if (!password) return setErrors({ password: "Password is required." });

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrors({ login: error.message });
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/home", { replace: true });
  };

  // Consistent styles with the Signup Page
  const containerStyle = {
    minHeight: "100vh",
    width: "100%",
    // Use the same image URL as your Signup page for consistency
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
    maxWidth: "420px",
    width: "100%"
  };

  return (
    <div style={containerStyle}>
      <Card style={cardStyle} className="p-4 p-md-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">SkillSync</h2>
          <p className="text-muted small text-uppercase fw-bold">Welcome Back</p>
          <hr className="w-25 mx-auto" />
        </div>

        {errors.login && <Alert variant="danger" className="py-2 small text-center">{errors.login}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              isInvalid={!!errors.email}
              onChange={(e) => setEmail(e.target.value)}
              className="py-2"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold">Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                isInvalid={!!errors.password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-2"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                className="border-start-0"
                style={{ zIndex: 0 }}
              >
                <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} />
              </Button>
            </InputGroup>
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 py-2 fw-bold shadow-sm" 
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "LOGIN"}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <p className="text-muted small">
            Don't have an account?{" "}
            <Link to="/" className="fw-bold text-decoration-none text-primary">
              Create Account
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}