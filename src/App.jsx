import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";
import { Suspense, useEffect, useState } from 'react';

import { supabase } from "./supabaseClient";

// PAGES
import SignUp from './user/Signup';
import Login from './user/Login';
import ProfilePage from './basicPages/Profile';
import './index.css';
import Home from './basicPages/FacultyMatch/Home';
import SkillCategory from './basicPages/SkillCategory';
import SkillList from './basicPages/SkillList';
import Seminars from './Certifications/Seminars';
import TrainingsWorkshop from './Certifications/TrainingWorkshop';
import IndustryCertification from './Certifications/IndustryCertifications';
import Publications from './Publications/Publications';
import EducationalAttainment from './EducationalAttainment/EducationalAttainment';
import ScoringConfigPage from './ScoringWeight/ScoringConfigPage';
import DepartmentChairDashboard from './basicPages/FacultyMatch/DepartmentChairDashboard';


// =================== SIDEBAR ===================
function Sidebar({ collapsed, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!error) {
      setRole(data.role);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { name: "Home", path: "/home" },
    { name: "Educational Attainment", path: "/educ" },
    { name: "Seminar", path: "/seminars" },
    { name: "Training/Workshop", path: "/training" },
    { name: "Industry Certification", path: "/industrycert" },
    { name: "Publication", path: "/publications" },
    { name: "Profile", path: "/profile" }
  ];

  return (
    <div
      className={`d-flex flex-column sidebar ${collapsed ? "collapsed" : ""}`}
    >
      {/* LOGO / BRAND */}
      <div className="sidebar-brand d-flex align-items-center justify-content-center py-4">
        {!collapsed ? <h5 className="mb-0 fw-bold">SkillSync</h5> : <span>FP</span>}
      </div>

      {/* MENU */}
      <ul className="nav flex-column">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link d-flex align-items-center ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              
              {!collapsed && <span className="ms-2">{item.name}</span>}
            </Link>
          </li>
        ))}

        {role === "chair" && !collapsed && (
          <li className="nav-item mt-3">
            
            <div className="accordion" id="chairAccordion">
              
              <div className="accordion-item border-0">
                
                {/* ACCORDION HEADER */}
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed py-2"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#chairMenu"
                  >
                    Chair Functions
                  </button>
                </h2>

                {/* ACCORDION BODY */}
                <div
                  id="chairMenu"
                  className="accordion-collapse collapse"
                  data-bs-parent="#chairAccordion"
                >
                  <div className="accordion-body p-0">

                    <ul className="nav flex-column">

                      {/* <li className="nav-item">
                        <Link
                          to="/skillCategory"
                          className={`nav-link ${location.pathname === "/skillCategory" ? "active" : ""} text-black`}
                        >
                          Skill Category
                        </Link>
                      </li> */}

                      <li className="nav-item">
                        <Link
                          to="/indskill"
                          className={`nav-link ${location.pathname === "/indskill" ? "active" : ""} text-black`}
                        >
                          Skills
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link
                          to="/scoring-config"
                          className={`nav-link ${location.pathname === "/scoring-config" ? "active" : ""} text-black`}
                        >
                          Scoring Weight
                        </Link>
                      </li>


                      <li className="nav-item">
                        <Link
                          to="/deptdash"
                          className={`nav-link ${location.pathname === "/deptdash" ? "active" : ""} text-black`}
                        >
                          Chair Dashboard
                        </Link>
                      </li>
                      

                    </ul>

                  </div>
                </div>

              </div>
            </div>

          </li>
        )}
      </ul>


      {/* LOGOUT */}
      <div className="sidebar-logout text-center mt-5">
        <button className="btn btn-danger w-75" onClick={handleLogout}>
          {!collapsed ? "Logout" : "X"}
        </button>
      </div>
    </div>
  );
}


// =================== CHAIR ROUTE ===================
function ChairRoute({ children }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (data?.role === "chair") {
      setAuthorized(true);
    } else {
      navigate("/home");
    }
  };

  if (authorized === null) return <div>Checking access...</div>;
  return children;
}

function AppLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Define routes where the sidebar and main padding should not exist
  const hideSidebarRoutes = ["/", "/login"];
  const hideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    // min-vh-100 ensures the background covers the full height
    // w-100 ensures it covers the full width
    <div className="d-flex min-vh-100 w-100">
      {!hideSidebar && (
        <Sidebar
          collapsed={collapsed}
          toggleSidebar={() => setCollapsed(!collapsed)}
        />
      )}

      {/* FIX: We use a template literal for className.
          If hideSidebar is true, we remove 'p-4' and 'main-content' styles 
          to allow the Signup/Login background to be truly full-screen.
      */}
      <div 
        className={`flex-grow-1 ${hideSidebar ? "" : "p-4 main-content"}`}
        style={{ width: hideSidebar ? "100%" : "auto" }}
      >
        <Suspense fallback={<div className="p-5 text-center">Loading...</div>}>
          <Routes>
            {/* AUTH PAGES */}
            <Route path="/" element={<SignUp />} />
            <Route path="/login" element={<Login />} />

            {/* DASHBOARD PAGES */}
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            <Route path="/seminars" element={<Seminars />} />
            <Route path="/training" element={<TrainingsWorkshop />} />
            <Route path="/industrycert" element={<IndustryCertification />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/educ" element={<EducationalAttainment />} />

            {/* CHAIR ONLY ROUTES */}
            {/* <Route
              path="/skillCategory"
              element={
                <ChairRoute>
                  <SkillCategory />
                </ChairRoute>
              }
            /> */}

            <Route
              path="/scoring-config"
              element={
                <ChairRoute>
                  <ScoringConfigPage />
                </ChairRoute>
              }
            />
            
            <Route
              path="/indskill"
              element={
                <ChairRoute>
                  <SkillList />
                </ChairRoute>
              }
            />

            <Route
              path="/deptdash"
              element={
                <ChairRoute>
                  <DepartmentChairDashboard />
                </ChairRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

// =================== MAIN APP ===================
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
