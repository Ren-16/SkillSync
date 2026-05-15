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

// export default function TrainingsWorkshop() {
//     // Form States
//     const [certification, setCertification] = useState("");
//     const [certifyingBody, setCertifyingBody] = useState("");
//     const [dateAwarded, setDateAwarded] = useState("");
//     const [typeOfCertification, setTypeOfCertification] = useState("");
//     const [numOfHrs, setNumOfHrs] = useState(0);

//     // Skills & Categories States
//     const [categories, setCategories] = useState([]);
//     const [selectedCategories, setSelectedCategories] = useState([]);
//     const [filteredSkills, setFilteredSkills] = useState([]);
//     const [selectedSkills, setSelectedSkills] = useState([]);

//     // Data States
//     const [certifications, setCertifications] = useState([]);
//     const [editingId, setEditingId] = useState(null);

//     // UI States
//     const [loading, setLoading] = useState(true);
//     const [message, setMessage] = useState(null);
//     const [variant, setVariant] = useState("success");
//     const [error, setError] = useState(null);
//     const [showModal, setShowModal] = useState(false);

//     useEffect(() => {
//         fetchCategories();
//         fetchCertifications();
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

//     const fetchCertifications = async () => {
//         try {
//             setLoading(true);
//             const { data: { user } } = await supabase.auth.getUser();

//             const { data, error } = await supabase
//                 .from("certifications")
//                 .select(`
//                     *,
//                     certifications_skills (
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
//                 .eq("type_of_certification", "Training")
//                 .order("created_at", { ascending: false });

//             if (error) throw error;
//             setCertifications(data || []);
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
//         setCertification("");
//         setCertifyingBody("");
//         setDateAwarded("");
//         setTypeOfCertification("");
//         setNumOfHrs(0);
//         setSelectedCategories([]);
//         setSelectedSkills([]);
//         setFilteredSkills([]);
//         setEditingId(null);
//     };

//     const handleEdit = async (cert) => {
//         setEditingId(cert.certification_id);
//         setCertification(cert.certification);
//         setCertifyingBody(cert.certifying_body);
//         setDateAwarded(cert.date_awarded);
//         setTypeOfCertification(cert.type_of_certification);
//         setNumOfHrs(cert.num_of_hrs);

//         // Extract associated skills and categories
//         const associatedSkills = cert.certifications_skills?.map(s => s.skill_id) || [];
//         const cats = [...new Set(cert.certifications_skills?.map(s => s.skills?.category_id))].filter(Boolean);

//         setSelectedCategories(cats);
//         setSelectedSkills(associatedSkills);
        
//         // Fetch the skill list for the categories so they appear in the modal
//         if (cats.length > 0) {
//             await fetchSkillsByCategories(cats);
//         }
        
//         setShowModal(true);
//     };

//     const addOrUpdateCertification = async (e) => {
//         e.preventDefault();
//         const { data: { user } } = await supabase.auth.getUser();

//         confirmAlert({
//             title: editingId ? "Confirm Update" : "Confirm Add",
//             message: `Are you sure you want to ${editingId ? "update" : "add"} this certification?`,
//             buttons: [
//                 {
//                     label: "Confirm",
//                     onClick: async () => {
//                         try {
//                             let certId = editingId;

//                             const payload = {
//                                 user_id: user.id,
//                                 certification,
//                                 certifying_body: certifyingBody,
//                                 date_awarded: dateAwarded,
//                                 type_of_certification: "Training",
//                                 num_of_hrs: numOfHrs
//                             };

//                             if (!editingId) {
//                                 const { data, error } = await supabase
//                                     .from("certifications")
//                                     .insert([payload])
//                                     .select();
//                                 if (error) throw error;
//                                 certId = data[0].certification_id;
//                             } else {
//                                 const { error } = await supabase
//                                     .from("certifications")
//                                     .update(payload)
//                                     .eq("certification_id", editingId);
//                                 if (error) throw error;

//                                 await supabase
//                                     .from("certifications_skills")
//                                     .delete()
//                                     .eq("certification_id", editingId);
//                             }

//                             if (selectedSkills.length > 0) {
//                                 const rows = selectedSkills.map(skillId => ({
//                                     certification_id: certId,
//                                     skill_id: skillId
//                                 }));
//                                 await supabase.from("certifications_skills").insert(rows);
//                             }

//                             setVariant("success");
//                             setMessage(editingId ? "Updated successfully!" : "Added successfully!");
//                             resetForm();
//                             fetchCertifications();
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
//             title: "Delete Certification?",
//             message: "This action cannot be undone.",
//             buttons: [
//                 {
//                     label: "Yes, Delete",
//                     onClick: async () => {
//                         const { error } = await supabase
//                             .from("certifications")
//                             .delete()
//                             .eq("certification_id", id);
//                         if (error) setError(error.message);
//                         fetchCertifications();
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
//                 <h3 className="fw-bold mb-0">Trainings or Workshops</h3>
//                 <Button 
//                     className="rounded-pill px-4" 
//                     onClick={() => { resetForm(); setShowModal(true); }}
//                 >
//                     + Add Certification
//                 </Button>
//             </div>

//             <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered scrollable>
//                 <Modal.Header closeButton className="border-0 pb-0">
//                     <Modal.Title className="fw-bold">
//                         {editingId ? "Update Certification" : "Add New Certification"}
//                     </Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body className="pt-2">
//                     <Form onSubmit={addOrUpdateCertification}>
//                         <div className="row">
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Certification Title</Form.Label>
//                                 <Form.Control value={certification} onChange={e => setCertification(e.target.value)} required />
//                             </Form.Group>
//                         </div>
//                         <div className="row">
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Certifying Body</Form.Label>
//                                 <Form.Control value={certifyingBody} onChange={e => setCertifyingBody(e.target.value)} required />
//                             </Form.Group>
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Date Awarded</Form.Label>
//                                 <Form.Control type="date" value={dateAwarded} onChange={e => setDateAwarded(e.target.value)} required />
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

//             <h3 className="mt-5">Your Certifications</h3>
//             <hr />
//             {loading ? <Spinner animation="border" /> : (
//                 certifications.length === 0 ? <Alert variant="info">No records found.</Alert> : 
//                 certifications.map(cert => (
//                     <Card key={cert.certification_id} className="mb-4 border-0 shadow-sm rounded-3">
//                         <Card.Body className="p-4">
//                             <div className="d-flex justify-content-between">
//                                 <div>
//                                     <h5 className="fw-bold mb-1">{cert.certification}</h5>
//                                     <p className="text-muted mb-1">{cert.certifying_body} | {cert.type_of_certification}</p>
//                                     <p className="small text-secondary">Hours: {cert.num_of_hrs}</p>
//                                 </div>
//                                 <Badge bg="info" className="px-3 py-2 h-100">{cert.date_awarded}</Badge>
//                             </div>
//                             <div className="mt-3">
//                                 {cert.certifications_skills?.map(s => (
//                                     <Badge key={s.skill_id} bg="light" text="dark" className="border me-2 px-3 py-2 rounded-pill">
//                                         {s.skills?.skill_name}
//                                     </Badge>
//                                 ))}
//                             </div>
//                             <div className="d-flex justify-content-end gap-2 mt-3">
//                                 <Button size="sm" variant="outline-warning" className="rounded-pill px-3" onClick={() => handleEdit(cert)}>Edit</Button>
//                                 <Button size="sm" variant="outline-danger" className="rounded-pill px-3" onClick={() => handleDelete(cert.certification_id)}>Delete</Button>
//                             </div>
//                         </Card.Body>
//                     </Card>
//                 ))
//             )}
//         </div>
//     );
// }


// ---------------------------CHANGES in UPDATE from 5-4-26----------------------------------------
// ---------------------------CHANGES in UPDATE from 5-4-26----------------------------------------
// ---------------------------CHANGES in UPDATE from 5-4-26----------------------------------------

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

// export default function TrainingsWorkshop() {
//     // Form States
//     const [certification, setCertification] = useState("");
//     const [certifyingBody, setCertifyingBody] = useState("");
//     const [dateAwarded, setDateAwarded] = useState("");
//     // ── BUG FIX: numOfHrs was in state but MISSING from the form ──
//     const [numOfHrs, setNumOfHrs] = useState(0);

//     // Skills & Categories States
//     const [categories, setCategories] = useState([]);
//     const [selectedCategories, setSelectedCategories] = useState([]);
//     const [filteredSkills, setFilteredSkills] = useState([]);
//     const [selectedSkills, setSelectedSkills] = useState([]);

//     // Data States
//     const [certifications, setCertifications] = useState([]);
//     const [editingId, setEditingId] = useState(null);

//     // UI States
//     const [loading, setLoading] = useState(true);
//     const [message, setMessage] = useState(null);
//     const [variant, setVariant] = useState("success");
//     const [error, setError] = useState(null);
//     const [showModal, setShowModal] = useState(false);

//     useEffect(() => {
//         fetchCategories();
//         fetchCertifications();
//     }, []);

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

//     const fetchCertifications = async () => {
//         try {
//             setLoading(true);
//             const { data: { user } } = await supabase.auth.getUser();

//             const { data, error } = await supabase
//                 .from("certifications")
//                 .select(`
//                     *,
//                     certifications_skills (
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
//                 .eq("type_of_certification", "Training")
//                 .order("created_at", { ascending: false });

//             if (error) throw error;
//             setCertifications(data || []);
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
//         setCertification("");
//         setCertifyingBody("");
//         setDateAwarded("");
//         setNumOfHrs(0);
//         setSelectedCategories([]);
//         setSelectedSkills([]);
//         setFilteredSkills([]);
//         setEditingId(null);
//     };

//     const handleEdit = async (cert) => {
//         setEditingId(cert.certification_id);
//         setCertification(cert.certification);
//         setCertifyingBody(cert.certifying_body);
//         setDateAwarded(cert.date_awarded);
//         setNumOfHrs(cert.num_of_hrs);

//         const associatedSkills = cert.certifications_skills?.map(s => s.skill_id) || [];
//         const cats = [...new Set(cert.certifications_skills?.map(s => s.skills?.category_id))].filter(Boolean);

//         setSelectedCategories(cats);
//         setSelectedSkills(associatedSkills);

//         if (cats.length > 0) {
//             await fetchSkillsByCategories(cats);
//         }

//         setShowModal(true);
//     };

//     const addOrUpdateCertification = async (e) => {
//         e.preventDefault();
//         const { data: { user } } = await supabase.auth.getUser();

//         confirmAlert({
//             title: editingId ? "Confirm Update" : "Confirm Add",
//             message: `Are you sure you want to ${editingId ? "update" : "add"} this record?`,
//             buttons: [
//                 {
//                     label: "Confirm",
//                     onClick: async () => {
//                         try {
//                             let certId = editingId;

//                             const payload = {
//                                 user_id: user.id,
//                                 certification,
//                                 certifying_body: certifyingBody,
//                                 date_awarded: dateAwarded,
//                                 type_of_certification: "Training",
//                                 num_of_hrs: numOfHrs
//                             };

//                             if (!editingId) {
//                                 const { data, error } = await supabase
//                                     .from("certifications")
//                                     .insert([payload])
//                                     .select();
//                                 if (error) throw error;
//                                 certId = data[0].certification_id;
//                             } else {
//                                 const { error } = await supabase
//                                     .from("certifications")
//                                     .update(payload)
//                                     .eq("certification_id", editingId);
//                                 if (error) throw error;

//                                 await supabase
//                                     .from("certifications_skills")
//                                     .delete()
//                                     .eq("certification_id", editingId);
//                             }

//                             if (selectedSkills.length > 0) {
//                                 const rows = selectedSkills.map(skillId => ({
//                                     certification_id: certId,
//                                     skill_id: skillId
//                                 }));
//                                 await supabase.from("certifications_skills").insert(rows);
//                             }

//                             setVariant("success");
//                             setMessage(editingId ? "Updated successfully!" : "Added successfully!");
//                             resetForm();
//                             fetchCertifications();
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
//             title: "Delete Record?",
//             message: "This action cannot be undone.",
//             buttons: [
//                 {
//                     label: "Yes, Delete",
//                     onClick: async () => {
//                         const { error } = await supabase
//                             .from("certifications")
//                             .delete()
//                             .eq("certification_id", id);
//                         if (error) setError(error.message);
//                         fetchCertifications();
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
//                 <h3 className="fw-bold mb-0">Trainings &amp; Workshops</h3>
//                 <Button
//                     className="rounded-pill px-4"
//                     onClick={() => { resetForm(); setShowModal(true); }}
//                 >
//                     + Add Training
//                 </Button>
//             </div>

//             <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered scrollable>
//                 <Modal.Header closeButton className="border-0 pb-0">
//                     <Modal.Title className="fw-bold">
//                         {editingId ? "Update Training / Workshop" : "Add New Training / Workshop"}
//                     </Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body className="pt-2">
//                     <Form onSubmit={addOrUpdateCertification}>
//                         <div className="row">
//                             <Form.Group className="mb-3 col-md-12">
//                                 <Form.Label className="fw-semibold">Training / Workshop Title</Form.Label>
//                                 <Form.Control
//                                     value={certification}
//                                     onChange={e => setCertification(e.target.value)}
//                                     placeholder="e.g. Advanced React Development Workshop"
//                                     required
//                                 />
//                             </Form.Group>
//                         </div>

//                         <div className="row">
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Organizing Body</Form.Label>
//                                 <Form.Control
//                                     value={certifyingBody}
//                                     onChange={e => setCertifyingBody(e.target.value)}
//                                     placeholder="e.g. DICT, CHED, Private Provider"
//                                     required
//                                 />
//                             </Form.Group>
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Date Attended</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     value={dateAwarded}
//                                     onChange={e => setDateAwarded(e.target.value)}
//                                     required
//                                 />
//                             </Form.Group>
//                         </div>

//                         {/* ── BUG FIX: Added the missing Number of Hours field ── */}
//                         <div className="row">
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Number of Hours</Form.Label>
//                                 <Form.Control
//                                     type="number"
//                                     min="0"
//                                     value={numOfHrs}
//                                     onChange={e => setNumOfHrs(e.target.value)}
//                                     placeholder="e.g. 8"
//                                     required
//                                 />
//                                 <Form.Text className="text-muted">
//                                     Total training hours. Used for hourly-rate scoring calculations.
//                                 </Form.Text>
//                             </Form.Group>
//                         </div>

//                         <div className="mb-4 border-top pt-3">
//                             <h6 className="fw-bold text-secondary mb-3">Skill Categories</h6>
//                             <div className="d-flex flex-wrap gap-3">
//                                 {categories.length === 0
//                                     ? <p className="text-muted small">No categories available for your department.</p>
//                                     : categories.map(cat => (
//                                         <Form.Check
//                                             key={cat.category_id}
//                                             type="checkbox"
//                                             label={cat.skill_category}
//                                             checked={selectedCategories.includes(cat.category_id)}
//                                             onChange={() => handleCategoryToggle(cat.category_id)}
//                                         />
//                                     ))}
//                             </div>
//                         </div>

//                         <div className="mb-4 border-top pt-3">
//                             <h6 className="fw-bold text-secondary mb-3">Select Skills</h6>
//                             {selectedCategories.length === 0
//                                 ? <p className="text-muted small">Select a category above to see available skills.</p>
//                                 : selectedCategories.map(catId => {
//                                     const cat = categories.find(c => c.category_id === catId);
//                                     const skills = filteredSkills.filter(s => s.category_id === catId);
//                                     return (
//                                         <div key={catId} className="mb-3">
//                                             <div className="small fw-semibold mb-2">{cat?.skill_category}</div>
//                                             <div className="d-flex flex-wrap gap-2">
//                                                 {skills.map(skill => (
//                                                     <OverlayTrigger key={skill.id} overlay={<Tooltip>{skill.description}</Tooltip>}>
//                                                         <Badge
//                                                             bg={selectedSkills.includes(skill.id) ? "primary" : "light"}
//                                                             text={selectedSkills.includes(skill.id) ? "light" : "dark"}
//                                                             className="px-3 py-2 rounded-pill border"
//                                                             style={{ cursor: "pointer" }}
//                                                             onClick={() => handleSkillToggle(skill.id)}
//                                                         >
//                                                             {skill.skill_name}
//                                                         </Badge>
//                                                     </OverlayTrigger>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                         </div>

//                         <div className="text-end">
//                             <Button variant="secondary" className="me-2 rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</Button>
//                             <Button type="submit" className="px-4 rounded-pill">Save Changes</Button>
//                         </div>
//                     </Form>
//                 </Modal.Body>
//             </Modal>

//             <h5 className="fw-bold mt-5">Your Trainings &amp; Workshops</h5>
//             <hr />
//             {loading ? (
//                 <div className="text-center py-5">
//                     <Spinner animation="border" variant="primary" />
//                     <p className="text-muted mt-2 small">Loading records...</p>
//                 </div>
//             ) : certifications.length === 0 ? (
//                 <div className="text-center py-5">
//                     <div style={{ fontSize: "3rem" }}>🎓</div>
//                     <h6 className="fw-bold mt-3 mb-1">No Training Records Yet</h6>
//                     <p className="text-muted small">Click "Add Training" to log your completed trainings and workshops.</p>
//                 </div>
//             ) : (
//                 certifications.map(cert => (
//                     <Card key={cert.certification_id} className="mb-4 border-0 shadow-sm rounded-3">
//                         <Card.Body className="p-4">
//                             <div className="d-flex justify-content-between">
//                                 <div>
//                                     <h5 className="fw-bold mb-1">{cert.certification}</h5>
//                                     <p className="text-muted mb-1 small">{cert.certifying_body} · Training / Workshop</p>
//                                     <p className="small text-secondary mb-0">
//                                         <strong>Hours:</strong> {cert.num_of_hrs} hrs
//                                     </p>
//                                 </div>
//                                 <Badge bg="info" className="px-3 py-2 h-100 text-nowrap">{cert.date_awarded}</Badge>
//                             </div>
//                             {cert.certifications_skills?.length > 0 && (
//                                 <div className="mt-3 pt-2 border-top">
//                                     <p className="small text-muted mb-2">Tagged Skills:</p>
//                                     {cert.certifications_skills.map(s => (
//                                         <Badge key={s.skill_id} bg="light" text="dark" className="border me-2 mb-1 px-3 py-2 rounded-pill">
//                                             {s.skills?.skill_name}
//                                         </Badge>
//                                     ))}
//                                 </div>
//                             )}
//                             <div className="d-flex justify-content-end gap-2 mt-3">
//                                 <Button size="sm" variant="outline-warning" className="rounded-pill px-3" onClick={() => handleEdit(cert)}>Edit</Button>
//                                 <Button size="sm" variant="outline-danger" className="rounded-pill px-3" onClick={() => handleDelete(cert.certification_id)}>Delete</Button>
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
const ACCENT = "#e07b00";
const ACCENT_LIGHT = "#fff4e6";

export default function TrainingsWorkshop() {
    // ── Form States ──────────────────────────────────────────────────────────
    const [certification, setCertification] = useState("");
    const [certifyingBody, setCertifyingBody] = useState("");
    const [dateAwarded, setDateAwarded] = useState("");
    const [numOfHrs, setNumOfHrs] = useState(0);

    // ── Skills & Categories States ───────────────────────────────────────────
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);

    // ── Data States ──────────────────────────────────────────────────────────
    const [certifications, setCertifications] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // ── UI States ────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [variant, setVariant] = useState("success");
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchCertifications();
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

    // ── Fetch All Training/Workshop Records ──────────────────────────────────
    const fetchCertifications = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from("certifications")
                .select(`*, certifications_skills(skill_id, skills(id, skill_name, description, category_id))`)
                .eq("user_id", user.id)
                .eq("type_of_certification", "Training")
                .order("created_at", { ascending: false });
            if (error) throw error;
            setCertifications(data || []);
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
        setCertification("");
        setCertifyingBody("");
        setDateAwarded("");
        setNumOfHrs(0);
        setSelectedCategories([]);
        setSelectedSkills([]);
        setFilteredSkills([]);
        setEditingId(null);
    };

    const handleEdit = async (cert) => {
        setEditingId(cert.certification_id);
        setCertification(cert.certification);
        setCertifyingBody(cert.certifying_body);
        setDateAwarded(cert.date_awarded);
        setNumOfHrs(cert.num_of_hrs);
        const associatedSkills = cert.certifications_skills?.map(s => s.skill_id) || [];
        const cats = [...new Set(cert.certifications_skills?.map(s => s.skills?.category_id))].filter(Boolean);
        setSelectedCategories(cats);
        setSelectedSkills(associatedSkills);
        if (cats.length > 0) await fetchSkillsByCategories(cats);
        setShowModal(true);
    };

    const addOrUpdateCertification = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        confirmAlert({
            title: editingId ? "Confirm Update" : "Confirm Add",
            message: `Are you sure you want to ${editingId ? "update" : "add"} this record?`,
            buttons: [
                {
                    label: "Confirm",
                    onClick: async () => {
                        try {
                            let certId = editingId;
                            const payload = {
                                user_id: user.id, certification, certifying_body: certifyingBody,
                                date_awarded: dateAwarded, type_of_certification: "Training", num_of_hrs: numOfHrs
                            };
                            if (!editingId) {
                                const { data, error } = await supabase.from("certifications").insert([payload]).select();
                                if (error) throw error;
                                certId = data[0].certification_id;
                            } else {
                                const { error } = await supabase.from("certifications").update(payload).eq("certification_id", editingId);
                                if (error) throw error;
                                await supabase.from("certifications_skills").delete().eq("certification_id", editingId);
                            }
                            if (selectedSkills.length > 0) {
                                const rows = selectedSkills.map(skillId => ({ certification_id: certId, skill_id: skillId }));
                                await supabase.from("certifications_skills").insert(rows);
                            }
                            setVariant("success");
                            setMessage(editingId ? "Updated successfully!" : "Added successfully!");
                            resetForm();
                            fetchCertifications();
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
            title: "Delete Training Record?",
            message: "This action cannot be undone.",
            buttons: [
                {
                    label: "Yes, Delete",
                    onClick: async () => {
                        const { error } = await supabase.from("certifications").delete().eq("certification_id", id);
                        if (error) setError(error.message);
                        fetchCertifications();
                    }
                },
                { label: "Cancel" }
            ]
        });
    };

    // ── Derived Stats ─────────────────────────────────────────────────────────
    const totalHours = certifications.reduce((sum, c) => sum + Number(c.num_of_hrs || 0), 0);
    const totalSkillsTags = certifications.reduce((sum, c) => sum + (c.certifications_skills?.length || 0), 0);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="container-fluid py-4 px-3 px-md-4">

            {/* ── Alerts ──────────────────────────────────────────────────── */}
            {message && <Alert variant={variant} dismissible onClose={() => setMessage(null)} className="shadow-sm">{message}</Alert>}
            {error && <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm">{error}</Alert>}

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div
                className="rounded-4 p-4 mb-4 d-flex justify-content-between align-items-center"
                style={{ background: `linear-gradient(135deg, #7c3a00 0%, ${ACCENT} 100%)` }}
            >
                <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <span style={{ fontSize: "1.6rem" }}>🛠️</span>
                        <h3 className="fw-bold text-white mb-0">Trainings &amp; Workshops</h3>
                    </div>
                    <p className="text-white mb-0 opacity-75 small">
                        Document hands-on trainings and workshops to build your skills portfolio.
                    </p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="rounded-pill px-4 fw-bold shadow-sm"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.5)", color: "#fff", backdropFilter: "blur(4px)" }}
                >
                    + Add Training
                </Button>
            </div>

            {/* ── Stats Row ───────────────────────────────────────────────── */}
            {!loading && certifications.length > 0 && (
                <Row className="g-3 mb-4">
                    {[
                        { icon: "🛠️", label: "Total Trainings", value: certifications.length },
                        { icon: "⏱️", label: "Total Hours", value: `${totalHours} hrs` },
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

            {/* ── Add / Edit Modal ────────────────────────────────────────── */}
            <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="xl" centered scrollable>
                <Modal.Header closeButton className="border-0 pb-0" style={{ background: ACCENT_LIGHT }}>
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        <span>🛠️</span>
                        {editingId ? "Update Training / Workshop" : "Add New Training / Workshop"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    <Form onSubmit={addOrUpdateCertification}>

                        {/* Section: Basic Info */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom: `2px solid ${ACCENT}` }}>
                                <span className="fw-bold small text-uppercase" style={{ color: ACCENT }}>
                                    📝 Training Information
                                </span>
                            </div>
                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">Training / Workshop Title</Form.Label>
                                        <Form.Control
                                            value={certification}
                                            onChange={e => setCertification(e.target.value)}
                                            placeholder="e.g., Advanced React Development Workshop"
                                            required
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">Organizing Body / Provider</Form.Label>
                                        <Form.Control
                                            value={certifyingBody}
                                            onChange={e => setCertifyingBody(e.target.value)}
                                            placeholder="e.g., DICT, CHED, Private Provider"
                                            required
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">Date Attended</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={dateAwarded}
                                            onChange={e => setDateAwarded(e.target.value)}
                                            required
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">Number of Hours</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            value={numOfHrs}
                                            onChange={e => setNumOfHrs(e.target.value)}
                                            placeholder="e.g. 8"
                                            required
                                            className="rounded-3"
                                        />
                                        <Form.Text className="text-muted" style={{ fontSize: "0.72rem" }}>
                                            Used for hourly-rate scoring.
                                        </Form.Text>
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
                                {editingId ? "💾 Save Changes" : "➕ Add Training"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* ── Records List ────────────────────────────────────────────── */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0" style={{ color: "#1e293b" }}>Your Training Records</h5>
                {!loading && (
                    <Badge className="rounded-pill px-3 py-2"
                        style={{ background: ACCENT_LIGHT, color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>
                        {certifications.length} record{certifications.length !== 1 ? "s" : ""}
                    </Badge>
                )}
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: ACCENT }} />
                    <p className="text-muted mt-2 small">Loading training records…</p>
                </div>
            ) : certifications.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-4 text-center py-5">
                    <Card.Body>
                        <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>🛠️</div>
                        <h5 className="fw-bold mt-3 mb-1" style={{ color: "#1e293b" }}>No Training Records Yet</h5>
                        <p className="text-muted mb-4 small" style={{ maxWidth: 380, margin: "0 auto 1rem" }}>
                            Trainings and workshops with recorded hours are scored hourly,
                            directly contributing to your skill proficiency.
                        </p>
                        <Button onClick={() => { resetForm(); setShowModal(true); }} className="rounded-pill px-4 fw-bold" style={{ background: ACCENT, border: "none" }}>
                            + Add Your First Training
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                certifications.map(cert => (
                    <Card key={cert.certification_id} className="mb-3 border-0 shadow-sm rounded-4" style={{ overflow: "hidden", position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: ACCENT, borderRadius: "4px 0 0 4px" }} />
                        <Card.Body className="p-4 ps-5">
                            <Row className="align-items-start">
                                <Col>
                                    <h5 className="fw-bold mb-1" style={{ color: "#1e293b" }}>{cert.certification}</h5>
                                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                        <span className="text-muted small">🏛️ {cert.certifying_body}</span>
                                        <span className="text-muted small">·</span>
                                        <span className="small fw-semibold" style={{ color: ACCENT }}>⏱️ {cert.num_of_hrs} hrs</span>
                                    </div>
                                    {cert.certifications_skills?.length > 0 && (
                                        <div className="d-flex flex-wrap gap-1 mt-2">
                                            {cert.certifications_skills.map(s => (
                                                <span key={s.skill_id} className="rounded-pill px-2 py-1"
                                                    style={{ background: ACCENT_LIGHT, color: ACCENT, fontSize: "0.72rem", fontWeight: 600, border: `1px solid ${ACCENT}40` }}>
                                                    🎯 {s.skills?.skill_name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </Col>
                                <Col xs="auto" className="d-flex flex-column align-items-end gap-2">
                                    <Badge className="rounded-pill px-3 py-2"
                                        style={{ background: ACCENT_LIGHT, color: "#fff", fontWeight: 600, fontSize: "0.78rem" }}>
                                        📅 {cert.date_awarded}
                                    </Badge>
                                    <div className="d-flex gap-1 mt-1">
                                        <Button size="sm" onClick={() => handleEdit(cert)} className="rounded-pill px-3"
                                            style={{ background: "transparent", border: `1.5px solid ${ACCENT}`, color: ACCENT, fontSize: "0.78rem" }}>
                                            ✏️ Edit
                                        </Button>
                                        <Button size="sm" onClick={() => handleDelete(cert.certification_id)} className="rounded-pill px-3"
                                            style={{ background: "transparent", border: "1.5px solid #dc3545", color: "#dc3545", fontSize: "0.78rem" }}>
                                            🗑️ Delete
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))
            )}
        </div>
    );
}