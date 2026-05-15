// import React, { useState, useEffect } from "react";
// import Form from "react-bootstrap/Form";
// import Button from "react-bootstrap/Button";
// import Alert from "react-bootstrap/Alert";
// import Card from "react-bootstrap/Card";
// import Badge from "react-bootstrap/Badge";
// import Spinner from "react-bootstrap/Spinner";
// import OverlayTrigger from "react-bootstrap/OverlayTrigger";
// import Tooltip from "react-bootstrap/Tooltip";
// import { supabase } from "../supabaseClient";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import Modal from "react-bootstrap/Modal";

// export default function EducationalAttainment() {
//     // Form States
//     const [programName, setrogramName] = useState("");
//     const [institution, setInstitution] = useState("");
//     const [dateCompleted, setdateCompleted] = useState("");
//     const [degree, setDegree] = useState("");
//     const [thesisCapstone, setThesisCapstone] = useState("");

//     // Skills & Categories States
//     const [categories, setCategories] = useState([]);
//     const [selectedCategories, setSelectedCategories] = useState([]);
//     const [filteredSkills, setFilteredSkills] = useState([]);
//     const [selectedSkills, setSelectedSkills] = useState([]);

//     // Data States
//     const [educations, setEducations] = useState([]);
//     const [editingId, setEditingId] = useState(null);

//     // UI States
//     const [loading, setLoading] = useState(true);
//     const [message, setMessage] = useState(null);
//     const [variant, setVariant] = useState("success");
//     const [error, setError] = useState(null);
//     const [showModal, setShowModal] = useState(false);

//     useEffect(() => {
//         fetchCategories();
//         fetchEducations();
//     }, []);

//     /* ============================
//        FETCH CATEGORIES (BY DEPT)
//     ============================ */
//     const fetchCategories = async () => {
//         try {
//             const { data: { user } } = await supabase.auth.getUser();

//             const { data: profile, error: profileError } = await supabase
//                 .from("profiles")
//                 .select("department_id")
//                 .eq("id", user.id)
//                 .single();

//             if (profileError) throw profileError;

//             const { data: deptUsers, error: deptError } = await supabase
//                 .from("profiles")
//                 .select("id")
//                 .eq("department_id", profile.department_id);

//             if (deptError) throw deptError;
//             const userIds = deptUsers.map(u => u.id);

//             const { data, error } = await supabase
//                 .from("skill_category")
//                 .select("category_id, skill_category")
//                 .in("user_id", userIds);

//             if (error) throw error;
//             setCategories(data || []);
//         } catch (err) {
//             setError(err.message);
//         }
//     };

//     /* ============================
//        FETCH SKILLS BY CATEGORIES
//     ============================ */
//     const fetchSkillsByCategories = async (categoryIds) => {
//         try {
//             if (!categoryIds || categoryIds.length === 0) {
//                 setFilteredSkills([]);
//                 return;
//             }

//             const { data, error } = await supabase
//                 .from("skills")
//                 .select("id, skill_name, description, category_id")
//                 .in("category_id", categoryIds);

//             if (error) throw error;
//             setFilteredSkills(data || []);
//         } catch (err) {
//             setError(err.message);
//         }
//     };

//     const fetchEducations = async () => {
//         try {
//             setLoading(true);
//             const { data: { user } } = await supabase.auth.getUser();

//             const { data, error } = await supabase
//                 .from("educational_attainment")
//                 .select(`
//                     *,
//                     educational_skills (
//                         skill_id,
//                         skills (
//                             id,
//                             skill_name,
//                             description,
//                             category_id
//                         )
//                     )
//                 `)
//                 .eq("user_id", user.id)
//                 .order("created_at", { ascending: false });

//             if (error) throw error;
//             setEducations(data || []);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleCategoryToggle = (categoryId) => {
//         const updated = selectedCategories.includes(categoryId)
//             ? selectedCategories.filter(id => id !== categoryId)
//             : [...selectedCategories, categoryId];

//         setSelectedCategories(updated);
//         fetchSkillsByCategories(updated);
//     };

//     const handleSkillToggle = (skillId) => {
//         setSelectedSkills(prev =>
//             prev.includes(skillId)
//                 ? prev.filter(id => id !== skillId)
//                 : [...prev, skillId]
//         );
//     };

//     const resetForm = () => {
//         setrogramName("");
//         setInstitution("");
//         setdateCompleted("");
//         setDegree("");
//         setThesisCapstone("");

//         setSelectedCategories([]);
//         setSelectedSkills([]);
//         setFilteredSkills([]);
//         setEditingId(null);
//     };

//     const handleEdit = async (educ) => {
//         setEditingId(educ.education_id);

//         setrogramName(educ.program_name);
//         setInstitution(educ.institution);
//         setdateCompleted(educ.date_completed);
//         setDegree(educ.degree);
//         setThesisCapstone(educ.thesis_capstone);

//         // Extract associated skills and categories
//         const associatedSkills = educ.educational_skills?.map(s => s.skill_id) || [];
//         const cats = [...new Set(educ.educational_skills?.map(s => s.skills?.category_id))].filter(Boolean);

//         setSelectedCategories(cats);
//         setSelectedSkills(associatedSkills);
        
//         // Fetch the skill list for the categories so they appear in the modal
//         if (cats.length > 0) {
//             await fetchSkillsByCategories(cats);
//         }
        
//         setShowModal(true);
//     };

//     const addOrUpdateEducation = async (e) => {
//         e.preventDefault();
//         const { data: { user } } = await supabase.auth.getUser();

//         confirmAlert({
//             title: editingId ? "Confirm Update" : "Confirm Add",
//             message: `Are you sure you want to ${editingId ? "update" : "add"} this education?`,
//             buttons: [
//                 {
//                     label: "Confirm",
//                     onClick: async () => {
//                         try {
//                             let educId = editingId;

//                             const payload = {
//                                 user_id: user.id,
//                                 program_name: programName,
//                                 institution,
//                                 date_completed: dateCompleted, 
//                                 degree,
//                                 thesis_capstone: thesisCapstone
//                             };

//                             if (!editingId) {
//                                 const { data, error } = await supabase
//                                     .from("educational_attainment")
//                                     .insert([payload])
//                                     .select();
//                                 if (error) throw error;
//                                 educId = data[0].education_id;
//                             } else {
//                                 const { error } = await supabase
//                                     .from("educational_attainment")
//                                     .update(payload)
//                                     .eq("education_id", editingId);
//                                 if (error) throw error;

//                                 await supabase
//                                     .from("educational_skills")
//                                     .delete()
//                                     .eq("education_id", editingId);
//                             }

//                             if (selectedSkills.length > 0) {
//                                 const rows = selectedSkills.map(skillId => ({
//                                     education_id: educId,
//                                     skill_id: skillId
//                                 }));
//                                 await supabase.from("educational_skills").insert(rows);
//                             }

//                             setVariant("success");
//                             setMessage(editingId ? "Updated successfully!" : "Added successfully!");
//                             resetForm();
//                             fetchEducations();
//                             setShowModal(false);
//                         } catch (err) {
//                             setVariant("danger");
//                             setMessage(err.message);
//                         }
//                     }
//                 },
//                 { label: "Cancel" }
//             ]
//         });
//     };

//     const handleDelete = (id) => {
//         confirmAlert({
//             title: "Delete Education?",
//             message: "This action cannot be undone.",
//             buttons: [
//                 {
//                     label: "Yes, Delete",
//                     onClick: async () => {
//                         const { error } = await supabase
//                             .from("educational_attainment")
//                             .delete()
//                             .eq("education_id", id);
//                         if (error) setError(error.message);
//                         fetchEducations();
//                     }
//                 },
//                 { label: "No" }
//             ]
//         });
//     };

//     return (
//         <div className="container py-4">
//             {message && <Alert variant={variant} dismissible onClose={() => setMessage(null)}>{message}</Alert>}
//             {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

//             <div className="d-flex justify-content-between align-items-center mb-4">
//                 <h3 className="fw-bold mb-0">Educational Attainment</h3>
//                 <Button 
//                     className="rounded-pill px-4" 
//                     onClick={() => { resetForm(); setShowModal(true); }}
//                 >
//                     + Add Education
//                 </Button>
//             </div>

//             <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered scrollable>
//                 <Modal.Header closeButton className="border-0 pb-0">
//                     <Modal.Title className="fw-bold">
//                         {editingId ? "Update Education" : "Add New Education"}
//                     </Modal.Title>
//                 </Modal.Header>

//                 <Modal.Body className="pt-2">
//                     <Form onSubmit={addOrUpdateEducation}>
//                         <div className="row">
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Program Name</Form.Label>
//                                 <Form.Control value={programName} onChange={e => setrogramName(e.target.value)} required />
//                             </Form.Group>
//                         </div>

//                         <div className="row">
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">School Graduated</Form.Label>
//                                 <Form.Control value={institution} onChange={e => setInstitution(e.target.value)} required />
//                             </Form.Group>

//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Completed Date</Form.Label>
//                                 <Form.Control type="date" value={dateCompleted} onChange={e => setdateCompleted(e.target.value)} required />
//                             </Form.Group>
//                         </div>

//                         <div className="row">
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Degree</Form.Label>
//                                 <Form.Select 
//                                     value={degree} 
//                                     onChange={e => setDegree(e.target.value)} 
//                                     required
//                                     className="rounded-3"
//                                 >
//                                     <option value="" disabled>Select Degree</option>
//                                     <option value="Bachelor">Bachelor</option>
//                                     <option value="Master">Master</option>
//                                     <option value="Doctoral">Doctoral</option>
//                                 </Form.Select>
//                             </Form.Group>

//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Thesis / Capstone</Form.Label>
//                                 <Form.Control type="text" value={thesisCapstone} onChange={e => setThesisCapstone(e.target.value)} required />
//                             </Form.Group>
//                         </div>

//                         <div className="mb-4 border-top pt-3">
//                             <h6 className="fw-bold text-secondary mb-3">Skill Categories</h6>
//                             <div className="d-flex flex-wrap gap-3">
//                                 {categories.map(cat => (
//                                     <Form.Check 
//                                         key={cat.category_id} 
//                                         type="checkbox" 
//                                         label={cat.skill_category} 
//                                         checked={selectedCategories.includes(cat.category_id)}
//                                         onChange={() => handleCategoryToggle(cat.category_id)} 
//                                     />
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="mb-4 border-top pt-3">
//                             <h6 className="fw-bold text-secondary mb-3">Select Skills</h6>
//                             {selectedCategories.map(catId => {
//                                 const cat = categories.find(c => c.category_id === catId);
//                                 const skills = filteredSkills.filter(s => s.category_id === catId);
//                                 return (
//                                     <div key={catId} className="mb-3">
//                                         <div className="small fw-semibold mb-2">{cat?.skill_category}</div>
//                                         <div className="d-flex flex-wrap gap-2">
//                                             {skills.map(skill => (
//                                                 <OverlayTrigger key={skill.id} overlay={<Tooltip>{skill.description}</Tooltip>}>
//                                                     <Badge 
//                                                         bg={selectedSkills.includes(skill.id) ? "primary" : "light"}
//                                                         text={selectedSkills.includes(skill.id) ? "light" : "dark"}
//                                                         className="px-3 py-2 rounded-pill border"
//                                                         style={{ cursor: "pointer" }}
//                                                         onClick={() => handleSkillToggle(skill.id)}
//                                                     >
//                                                         {skill.skill_name}
//                                                     </Badge>
//                                                 </OverlayTrigger>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                         <div className="text-end">
//                             <Button variant="secondary" className="me-2 rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</Button>
//                             <Button type="submit" className="px-4 rounded-pill">Save Changes</Button>
//                         </div>
//                     </Form>
//                 </Modal.Body>
//             </Modal>

//             <h3 className="mt-5">Your Educations</h3>
//             <hr />
//             {loading ? <Spinner animation="border" /> : (
//                 educations.length === 0 ? <Alert variant="info">No records found.</Alert> : 
//                 educations.map(educ => (
//                     <Card key={educ.education_id} className="mb-4 border-0 shadow-sm rounded-3">
//                         <Card.Body className="p-4">
//                             <div className="d-flex justify-content-between">
//                                 <div>
//                                     <h5 className="fw-bold mb-1">{educ.program_name}</h5>
//                                     <p className="text-muted mb-1">{educ.institution}</p>
//                                     <p className="text-muted mb-1">{educ.degree}</p>
//                                     <p className="small text-secondary">Theis/Capstone: {educ.thesis_capstone}</p>
//                                 </div>
//                                 <Badge bg="info" className="px-3 py-2 h-100">{educ.date_completed}</Badge>
//                             </div>
//                             <div className="mt-3">
//                                 {educ.educational_skills?.map(s => (
//                                     <Badge key={s.skill_id} bg="light" text="dark" className="border me-2 px-3 py-2 rounded-pill">
//                                         {s.skills?.skill_name}
//                                     </Badge>
//                                 ))}
//                             </div>
//                             <div className="d-flex justify-content-end gap-2 mt-3">
//                                 <Button size="sm" variant="outline-warning" className="rounded-pill px-3" onClick={() => handleEdit(educ)}>Edit</Button>
//                                 <Button size="sm" variant="outline-danger" className="rounded-pill px-3" onClick={() => handleDelete(educ.education_id)}>Delete</Button>
//                             </div>
//                         </Card.Body>
//                     </Card>
//                 ))
//             )}
//         </div>
//     );
// }

import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { supabase } from "../supabaseClient";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import Modal from "react-bootstrap/Modal";

// ── Accent colour token for this credential type ──────────────────────────
const ACCENT = "#c2410c";
const ACCENT_LIGHT = "#fff1ec";

// ── Degree display helpers ─────────────────────────────────────────────────
const DEGREE_META = {
    Bachelor: { icon: "🎓", label: "Bachelor's Degree",  color: "#3b82f6", bg: "#eff6ff" },
    Master:   { icon: "🏫", label: "Master's Degree",    color: "#7c3aed", bg: "#f5f3ff" },
    Doctoral: { icon: "🔬", label: "Doctorate Degree",   color: "#c2410c", bg: "#fff1ec" },
};

export default function EducationalAttainment() {
    // ── Form States ──────────────────────────────────────────────────────────
    const [programName, setProgramName] = useState("");
    const [institution, setInstitution] = useState("");
    const [dateCompleted, setDateCompleted] = useState("");
    const [degree, setDegree] = useState("");
    const [thesisCapstone, setThesisCapstone] = useState("");

    // ── Skills & Categories States ───────────────────────────────────────────
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);

    // ── Data States ──────────────────────────────────────────────────────────
    const [educations, setEducations] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // ── UI States ────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [variant, setVariant] = useState("success");
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchEducations();
    }, []);

    // ── Fetch Categories (by Department) ─────────────────────────────────────
    const fetchCategories = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile, error: profileError } = await supabase
                .from("profiles").select("department_id").eq("id", user.id).single();
            if (profileError) throw profileError;

            const { data: deptUsers, error: deptError } = await supabase
                .from("profiles").select("id").eq("department_id", profile.department_id);
            if (deptError) throw deptError;

            const userIds = deptUsers.map(u => u.id);
            const { data, error } = await supabase
                .from("skill_category").select("category_id, skill_category").in("user_id", userIds);
            if (error) throw error;
            setCategories(data || []);
        } catch (err) {
            setError(err.message);
        }
    };

    // ── Fetch Skills by Selected Categories ──────────────────────────────────
    const fetchSkillsByCategories = async (categoryIds) => {
        try {
            if (!categoryIds || categoryIds.length === 0) { setFilteredSkills([]); return; }
            const { data, error } = await supabase
                .from("skills").select("id, skill_name, description, category_id").in("category_id", categoryIds);
            if (error) throw error;
            setFilteredSkills(data || []);
        } catch (err) {
            setError(err.message);
        }
    };

    // ── Fetch All Education Records ───────────────────────────────────────────
    const fetchEducations = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from("educational_attainment")
                .select(`*, educational_skills(skill_id, skills(id, skill_name, description, category_id))`)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            if (error) throw error;
            setEducations(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryToggle = (categoryId) => {
        const updated = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];
        setSelectedCategories(updated);
        fetchSkillsByCategories(updated);
    };

    const handleSkillToggle = (skillId) => {
        setSelectedSkills(prev =>
            prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
        );
    };

    const resetForm = () => {
        setProgramName("");
        setInstitution("");
        setDateCompleted("");
        setDegree("");
        setThesisCapstone("");
        setSelectedCategories([]);
        setSelectedSkills([]);
        setFilteredSkills([]);
        setEditingId(null);
    };

    const handleEdit = async (educ) => {
        setEditingId(educ.education_id);
        setProgramName(educ.program_name);
        setInstitution(educ.institution);
        setDateCompleted(educ.date_completed);
        setDegree(educ.degree);
        setThesisCapstone(educ.thesis_capstone);
        const associatedSkills = educ.educational_skills?.map(s => s.skill_id) || [];
        const cats = [...new Set(educ.educational_skills?.map(s => s.skills?.category_id))].filter(Boolean);
        setSelectedCategories(cats);
        setSelectedSkills(associatedSkills);
        if (cats.length > 0) await fetchSkillsByCategories(cats);
        setShowModal(true);
    };

    const addOrUpdateEducation = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        confirmAlert({
            title: editingId ? "Confirm Update" : "Confirm Add",
            message: `Are you sure you want to ${editingId ? "update" : "add"} this education record?`,
            buttons: [
                {
                    label: "Confirm",
                    onClick: async () => {
                        try {
                            let educId = editingId;
                            const payload = {
                                user_id: user.id, program_name: programName, institution,
                                date_completed: dateCompleted, degree, thesis_capstone: thesisCapstone
                            };
                            if (!editingId) {
                                const { data, error } = await supabase.from("educational_attainment").insert([payload]).select();
                                if (error) throw error;
                                educId = data[0].education_id;
                            } else {
                                const { error } = await supabase.from("educational_attainment").update(payload).eq("education_id", editingId);
                                if (error) throw error;
                                await supabase.from("educational_skills").delete().eq("education_id", editingId);
                            }
                            if (selectedSkills.length > 0) {
                                const rows = selectedSkills.map(skillId => ({ education_id: educId, skill_id: skillId }));
                                await supabase.from("educational_skills").insert(rows);
                            }
                            setVariant("success");
                            setMessage(editingId ? "Education record updated successfully!" : "Education record added successfully!");
                            resetForm();
                            fetchEducations();
                            setShowModal(false);
                        } catch (err) {
                            setVariant("danger");
                            setMessage(err.message);
                        }
                    }
                },
                { label: "Cancel" }
            ]
        });
    };

    const handleDelete = (id) => {
        confirmAlert({
            title: "Delete Education Record?",
            message: "This action cannot be undone.",
            buttons: [
                {
                    label: "Yes, Delete",
                    onClick: async () => {
                        const { error } = await supabase.from("educational_attainment").delete().eq("education_id", id);
                        if (error) setError(error.message);
                        fetchEducations();
                    }
                },
                { label: "Cancel" }
            ]
        });
    };

    // ── Derived Stats ─────────────────────────────────────────────────────────
    const highestDegree = educations.find(e => e.degree === "Doctoral") ||
                          educations.find(e => e.degree === "Master") ||
                          educations.find(e => e.degree === "Bachelor");
    const totalSkillsTags = educations.reduce((sum, e) => sum + (e.educational_skills?.length || 0), 0);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="container-fluid py-4 px-3 px-md-4">

            {/* ── Alerts ──────────────────────────────────────────────────── */}
            {message && <Alert variant={variant} dismissible onClose={() => setMessage(null)} className="shadow-sm">{message}</Alert>}
            {error && <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm">{error}</Alert>}

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div
                className="rounded-4 p-4 mb-4 d-flex justify-content-between align-items-center"
                style={{ background: `linear-gradient(135deg, #7c1d12 0%, ${ACCENT} 100%)` }}
            >
                <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <span style={{ fontSize: "1.6rem" }}>🎓</span>
                        <h3 className="fw-bold text-white mb-0">Educational Attainment</h3>
                    </div>
                    <p className="text-white mb-0 opacity-75 small">
                        Record your academic degrees. The highest degree contributes to your overall proficiency score.
                    </p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="rounded-pill px-4 fw-bold shadow-sm"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.5)", color: "#fff", backdropFilter: "blur(4px)" }}
                >
                    + Add Education
                </Button>
            </div>

            {/* ── Stats Row ───────────────────────────────────────────────── */}
            {!loading && educations.length > 0 && (
                <Row className="g-3 mb-4">
                    {[
                        { icon: "🎓", label: "Degrees on Record", value: educations.length },
                        {
                            icon: highestDegree ? DEGREE_META[highestDegree.degree]?.icon : "—",
                            label: "Highest Degree",
                            value: highestDegree ? DEGREE_META[highestDegree.degree]?.label.split("'")[0] : "—"
                        },
                        { icon: "🎯", label: "Skills Tagged", value: totalSkillsTags },
                    ].map(stat => (
                        <Col xs={4} key={stat.label}>
                            <Card className="border-0 shadow-sm text-center rounded-3 h-100">
                                <Card.Body className="py-3 px-2">
                                    <div style={{ fontSize: "1.3rem" }}>{stat.icon}</div>
                                    <div className="fw-bold fs-5" style={{ color: ACCENT }}>{stat.value}</div>
                                    <div className="text-muted" style={{ fontSize: "0.72rem" }}>{stat.label}</div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* ── Scoring Info Banner ──────────────────────────────────────── */}
            <div
                className="rounded-3 p-3 mb-4 small d-flex align-items-start gap-2"
                style={{ background: "#fff8f0", border: "1px solid #fed7aa", color: "#92400e" }}
            >
                <span style={{ fontSize: "1.1rem" }}>💡</span>
                <div>
                    <strong>How Education Scoring Works:</strong> Only your <em>highest earned degree</em> contributes
                    to your proficiency score for each tagged skill. Adding multiple degrees is encouraged for completeness,
                    but the scoring engine selects the one with the highest point value.
                </div>
            </div>

            {/* ── Add / Edit Modal ────────────────────────────────────────── */}
            <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="xl" centered scrollable>
                <Modal.Header closeButton className="border-0 pb-0" style={{ background: ACCENT_LIGHT }}>
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        <span>🎓</span>
                        {editingId ? "Update Education Record" : "Add New Education Record"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    <Form onSubmit={addOrUpdateEducation}>

                        {/* Section: Academic Info */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom: `2px solid ${ACCENT}` }}>
                                <span className="fw-bold small text-uppercase" style={{ color: ACCENT }}>
                                    📝 Academic Information
                                </span>
                            </div>
                            <Row className="g-3">
                                <Col md={8}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">Program / Course Name</Form.Label>
                                        <Form.Control
                                            value={programName}
                                            onChange={e => setProgramName(e.target.value)}
                                            placeholder="e.g., Bachelor of Science in Information Technology"
                                            required
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">Degree Level</Form.Label>
                                        <Form.Select
                                            value={degree}
                                            onChange={e => setDegree(e.target.value)}
                                            required
                                            className="rounded-3"
                                        >
                                            <option value="" disabled>Select Degree</option>
                                            <option value="Bachelor">🎓 Bachelor's</option>
                                            <option value="Master">🏫 Master's</option>
                                            <option value="Doctoral">🔬 Doctorate</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={8}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">School / University</Form.Label>
                                        <Form.Control
                                            value={institution}
                                            onChange={e => setInstitution(e.target.value)}
                                            placeholder="e.g., National University Dasmariñas"
                                            required
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">Date Completed</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={dateCompleted}
                                            onChange={e => setDateCompleted(e.target.value)}
                                            required
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        {/* BUG FIX: Corrected label from "Theis" to "Thesis" */}
                                        <Form.Label className="fw-semibold small">Thesis / Capstone Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={thesisCapstone}
                                            onChange={e => setThesisCapstone(e.target.value)}
                                            placeholder="e.g., A Web-Based Faculty Profiling System Using Machine Learning"
                                            required
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Section: Skill Mapping */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom: `2px solid ${ACCENT}` }}>
                                <span className="fw-bold small text-uppercase" style={{ color: ACCENT }}>
                                    🎯 Skill Mapping
                                </span>
                                <span className="text-muted small ms-1">(optional)</span>
                            </div>
                            <div className="mb-3">
                                <p className="small fw-semibold text-secondary mb-2">Step 1 — Select Skill Categories</p>
                                {categories.length === 0 ? (
                                    <p className="text-muted small fst-italic">No categories found for your department.</p>
                                ) : (
                                    <div className="d-flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <div
                                                key={cat.category_id}
                                                onClick={() => handleCategoryToggle(cat.category_id)}
                                                className="rounded-pill px-3 py-1 small fw-semibold"
                                                style={{
                                                    cursor: "pointer",
                                                    background: selectedCategories.includes(cat.category_id) ? ACCENT : "#f1f5f9",
                                                    color: selectedCategories.includes(cat.category_id) ? "#fff" : "#475569",
                                                    border: `1.5px solid ${selectedCategories.includes(cat.category_id) ? ACCENT : "#e2e8f0"}`,
                                                    transition: "all 0.15s",
                                                    userSelect: "none",
                                                }}
                                            >
                                                {selectedCategories.includes(cat.category_id) ? "✓ " : ""}{cat.skill_category}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedCategories.length > 0 && (
                                <div>
                                    <p className="small fw-semibold text-secondary mb-2">Step 2 — Select Specific Skills</p>
                                    {selectedCategories.map(catId => {
                                        const cat = categories.find(c => c.category_id === catId);
                                        const skills = filteredSkills.filter(s => s.category_id === catId);
                                        return (
                                            <div key={catId} className="mb-3 p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                                <p className="small fw-bold mb-2" style={{ color: ACCENT }}>📂 {cat?.skill_category}</p>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {skills.length === 0 ? (
                                                        <span className="text-muted small fst-italic">No skills under this category.</span>
                                                    ) : skills.map(skill => (
                                                        <OverlayTrigger key={skill.id} overlay={<Tooltip>{skill.description}</Tooltip>}>
                                                            <Badge
                                                                className="px-3 py-2 rounded-pill"
                                                                style={{
                                                                    cursor: "pointer",
                                                                    background: selectedSkills.includes(skill.id) ? ACCENT : "#fff",
                                                                    color: selectedSkills.includes(skill.id) ? "#fff" : "#334155",
                                                                    border: `1.5px solid ${selectedSkills.includes(skill.id) ? ACCENT : "#cbd5e1"}`,
                                                                    fontWeight: 500,
                                                                    fontSize: "0.8rem",
                                                                    transition: "all 0.15s",
                                                                }}
                                                                onClick={() => handleSkillToggle(skill.id)}
                                                            >
                                                                {selectedSkills.includes(skill.id) ? "✓ " : ""}{skill.skill_name}
                                                            </Badge>
                                                        </OverlayTrigger>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                            <Button variant="light" className="rounded-pill px-4" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
                            <Button type="submit" className="rounded-pill px-4 fw-bold" style={{ background: ACCENT, border: "none" }}>
                                {editingId ? "💾 Save Changes" : "➕ Add Education"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* ── Records List ────────────────────────────────────────────── */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0" style={{ color: "#1e293b" }}>Your Academic Degrees</h5>
                {!loading && (
                    <Badge className="rounded-pill px-3 py-2"
                        style={{ background: ACCENT_LIGHT, color: ACCENT, fontSize: "0.82rem", fontWeight: 600 }}>
                        {educations.length} record{educations.length !== 1 ? "s" : ""}
                    </Badge>
                )}
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: ACCENT }} />
                    <p className="text-muted mt-2 small">Loading education records…</p>
                </div>
            ) : educations.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-4 text-center py-5">
                    <Card.Body>
                        <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>🎓</div>
                        <h5 className="fw-bold mt-3 mb-1" style={{ color: "#1e293b" }}>No Education Records Yet</h5>
                        <p className="text-muted mb-4 small" style={{ maxWidth: 400, margin: "0 auto 1rem" }}>
                            Your educational background is the foundation of your competency profile.
                            Add your academic degrees to begin building your proficiency score.
                        </p>
                        <Button onClick={() => { resetForm(); setShowModal(true); }} className="rounded-pill px-4 fw-bold" style={{ background: ACCENT, border: "none" }}>
                            + Add Your First Degree
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                educations.map(educ => {
                    const degMeta = DEGREE_META[educ.degree] || {};
                    const isHighest = highestDegree?.education_id === educ.education_id;
                    return (
                        <Card
                            key={educ.education_id}
                            className="mb-3 border-0 shadow-sm rounded-4"
                            style={{ overflow: "hidden", position: "relative" }}
                        >
                            {/* Left accent bar */}
                            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: degMeta.color || ACCENT, borderRadius: "4px 0 0 4px" }} />
                            <Card.Body className="p-4 ps-5">
                                <Row className="align-items-start">
                                    <Col>
                                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                            <h5 className="fw-bold mb-0" style={{ color: "#1e293b" }}>{educ.program_name}</h5>
                                            {/* Degree pill */}
                                            <span
                                                className="rounded-pill px-2 py-1 small fw-bold"
                                                style={{ background: degMeta.bg, color: degMeta.color, fontSize: "0.72rem" }}
                                            >
                                                {degMeta.icon} {educ.degree}
                                            </span>
                                            {/* Highest degree indicator */}
                                            {isHighest && educations.length > 1 && (
                                                <span
                                                    className="rounded-pill px-2 py-1 small fw-bold"
                                                    style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.7rem" }}
                                                >
                                                    ⭐ Highest (Scored)
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-muted small mb-1">🏛️ {educ.institution}</p>
                                        {/* BUG FIX: Corrected "Theis/Capstone" → "Thesis/Capstone" */}
                                        {educ.thesis_capstone && (
                                            <p className="text-muted small mb-2" style={{ fontSize: "0.78rem" }}>
                                                📝 <em>Thesis/Capstone:</em> {educ.thesis_capstone}
                                            </p>
                                        )}
                                        {educ.educational_skills?.length > 0 && (
                                            <div className="d-flex flex-wrap gap-1 mt-2">
                                                {educ.educational_skills.map(s => (
                                                    <span key={s.skill_id} className="rounded-pill px-2 py-1"
                                                        style={{
                                                            background: ACCENT_LIGHT, color: ACCENT,
                                                            fontSize: "0.72rem", fontWeight: 600,
                                                            border: `1px solid ${ACCENT}40`,
                                                        }}>
                                                        🎯 {s.skills?.skill_name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </Col>
                                    <Col xs="auto" className="d-flex flex-column align-items-end gap-2">
                                        <Badge className="rounded-pill px-3 py-2"
                                            style={{ background: degMeta.bg, color: degMeta.color, fontWeight: 600, fontSize: "0.78rem" }}>
                                            📅 {educ.date_completed}
                                        </Badge>
                                        <div className="d-flex gap-1 mt-1">
                                            <Button size="sm" onClick={() => handleEdit(educ)} className="rounded-pill px-3"
                                                style={{ background: "transparent", border: `1.5px solid ${ACCENT}`, color: ACCENT, fontSize: "0.78rem" }}>
                                                ✏️ Edit
                                            </Button>
                                            <Button size="sm" onClick={() => handleDelete(educ.education_id)} className="rounded-pill px-3"
                                                style={{ background: "transparent", border: "1.5px solid #dc3545", color: "#dc3545", fontSize: "0.78rem" }}>
                                                🗑️ Delete
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    );
                })
            )}
        </div>
    );
}