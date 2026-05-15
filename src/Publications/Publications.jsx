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

// export default function Publications() {
//     // Form States
//     const [title, setTitle] = useState("");
//     const [journalName, setJournalName] = useState("");
//     const [publicationDate, setPublicationDate] = useState("");
//     const [indexing, setIndexing] = useState("");
//     const [link, setLink] = useState("");

//     // Skills & Categories States
//     const [categories, setCategories] = useState([]);
//     const [selectedCategories, setSelectedCategories] = useState([]);
//     const [filteredSkills, setFilteredSkills] = useState([]);
//     const [selectedSkills, setSelectedSkills] = useState([]);

//     // Data States
//     const [publications, setPublications] = useState([]);
//     const [editingId, setEditingId] = useState(null);

//     // UI States
//     const [loading, setLoading] = useState(true);
//     const [message, setMessage] = useState(null);
//     const [variant, setVariant] = useState("success");
//     const [error, setError] = useState(null);
//     const [showModal, setShowModal] = useState(false);

//     useEffect(() => {
//         fetchCategories();
//         fetchPublications();
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

//     const fetchPublications = async () => {
//         try {
//             setLoading(true);
//             const { data: { user } } = await supabase.auth.getUser();

//             const { data, error } = await supabase
//                 .from("publications")
//                 .select(`
//                     *,
//                     publications_skills (
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
//             setPublications(data || []);
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
//         setTitle("");
//         setJournalName("");
//         setPublicationDate("");
//         setIndexing("");
//         setLink("");
//         setSelectedCategories([]);
//         setSelectedSkills([]);
//         setFilteredSkills([]);
//         setEditingId(null);
//     };

//     const handleEdit = async (pub) => {
//         setEditingId(pub.pub_id);
//         setTitle(pub.title);
//         setJournalName(pub.journal_name);
//         setPublicationDate(pub.publication_date);
//         setIndexing(pub.indexing);
//         setLink(pub.link);

//         const associatedSkills = pub.publications_skills?.map(s => s.skill_id) || [];
//         const cats = [...new Set(pub.publications_skills?.map(s => s.skills?.category_id))].filter(Boolean);

//         setSelectedCategories(cats);
//         setSelectedSkills(associatedSkills);

//         if (cats.length > 0) {
//             await fetchSkillsByCategories(cats);
//         }

//         setShowModal(true);
//     };

//     const addOrUpdatePublication = async (e) => {
//         e.preventDefault();
//         const { data: { user } } = await supabase.auth.getUser();

//         confirmAlert({
//             title: editingId ? "Confirm Update" : "Confirm Add",
//             message: `Are you sure you want to ${editingId ? "update" : "add"} this publication?`,
//             buttons: [
//                 {
//                     label: "Confirm",
//                     onClick: async () => {
//                         try {
//                             let pubId = editingId;

//                             const payload = {
//                                 user_id: user.id,
//                                 title,
//                                 journal_name: journalName,
//                                 publication_date: publicationDate,
//                                 indexing,
//                                 link
//                             };

//                             if (!editingId) {
//                                 const { data, error } = await supabase
//                                     .from("publications")
//                                     .insert([payload])
//                                     .select();
//                                 if (error) throw error;
//                                 pubId = data[0].pub_id;
//                             } else {
//                                 const { error } = await supabase
//                                     .from("publications")
//                                     .update(payload)
//                                     .eq("pub_id", editingId);
//                                 if (error) throw error;

//                                 await supabase
//                                     .from("publications_skills")
//                                     .delete()
//                                     .eq("pub_id", editingId);
//                             }

//                             if (selectedSkills.length > 0) {
//                                 const rows = selectedSkills.map(skillId => ({
//                                     pub_id: pubId,
//                                     skill_id: skillId
//                                 }));
//                                 await supabase.from("publications_skills").insert(rows);
//                             }

//                             setVariant("success");
//                             setMessage(editingId ? "Updated successfully!" : "Added successfully!");
//                             resetForm();
//                             fetchPublications();
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
//             title: "Delete Publication?",
//             message: "This action cannot be undone.",
//             buttons: [
//                 {
//                     label: "Yes, Delete",
//                     onClick: async () => {
//                         const { error } = await supabase
//                             .from("publications")
//                             .delete()
//                             .eq("pub_id", id);
//                         if (error) setError(error.message);
//                         fetchPublications();
//                     }
//                 },
//                 { label: "No" }
//             ]
//         });
//     };

//     const indexingBadgeColor = (val) => {
//         if (val === "Scopus") return "success";
//         return "secondary";
//     };

//     return (
//         <div className="container py-4">
//             {message && <Alert variant={variant} dismissible onClose={() => setMessage(null)}>{message}</Alert>}
//             {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

//             {/* ── BUG FIX: Changed heading from "Seminars" to "Publications" ── */}
//             <div className="d-flex justify-content-between align-items-center mb-4">
//                 <h3 className="fw-bold mb-0">Publications</h3>
//                 <Button
//                     className="rounded-pill px-4"
//                     onClick={() => { resetForm(); setShowModal(true); }}
//                 >
//                     + Add Publication
//                 </Button>
//             </div>

//             <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered scrollable>
//                 <Modal.Header closeButton className="border-0 pb-0">
//                     <Modal.Title className="fw-bold">
//                         {editingId ? "Update Publication" : "Add New Publication"}
//                     </Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body className="pt-2">
//                     <Form onSubmit={addOrUpdatePublication}>
//                         <div className="row">
//                             <Form.Group className="mb-3 col-md-12">
//                                 <Form.Label className="fw-semibold">Research Title</Form.Label>
//                                 <Form.Control
//                                     value={title}
//                                     onChange={e => setTitle(e.target.value)}
//                                     placeholder="Enter the full title of the research paper"
//                                     required
//                                 />
//                             </Form.Group>
//                         </div>

//                         <div className="row">
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Journal Name</Form.Label>
//                                 <Form.Control
//                                     value={journalName}
//                                     onChange={e => setJournalName(e.target.value)}
//                                     placeholder="e.g. IEEE Transactions on..."
//                                     required
//                                 />
//                             </Form.Group>
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Publication Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     value={publicationDate}
//                                     onChange={e => setPublicationDate(e.target.value)}
//                                     required
//                                 />
//                             </Form.Group>
//                         </div>

//                         <div className="row">
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">Indexing</Form.Label>
//                                 <Form.Select
//                                     value={indexing}
//                                     onChange={e => setIndexing(e.target.value)}
//                                     required
//                                 >
//                                     <option value="" disabled>Select Indexing</option>
//                                     <option value="Scopus">Scopus</option>
//                                     <option value="None">None (half points only)</option>
//                                 </Form.Select>
//                             </Form.Group>
//                             <Form.Group className="mb-3 col-md-6">
//                                 <Form.Label className="fw-semibold">DOI / Link</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     value={link}
//                                     onChange={e => setLink(e.target.value)}
//                                     placeholder="https://doi.org/..."
//                                     required
//                                 />
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

//             <h5 className="fw-bold mt-5">Your Publications</h5>
//             <hr />
//             {loading ? (
//                 <div className="text-center py-5">
//                     <Spinner animation="border" variant="primary" />
//                     <p className="text-muted mt-2 small">Loading publications...</p>
//                 </div>
//             ) : publications.length === 0 ? (
//                 <div className="text-center py-5">
//                     <div style={{ fontSize: "3rem" }}>📄</div>
//                     <h6 className="fw-bold mt-3 mb-1">No Publications Yet</h6>
//                     <p className="text-muted small">Click "Add Publication" to record your research outputs.</p>
//                 </div>
//             ) : (
//                 publications.map(pub => (
//                     <Card key={pub.pub_id} className="mb-4 border-0 shadow-sm rounded-3">
//                         <Card.Body className="p-4">
//                             <div className="d-flex justify-content-between">
//                                 <div className="flex-grow-1 me-3">
//                                     <h5 className="fw-bold mb-1">{pub.title}</h5>
//                                     <p className="text-muted mb-1 small">
//                                         <strong>Journal:</strong> {pub.journal_name}
//                                     </p>
//                                     <p className="text-muted mb-1 small">
//                                         <strong>Indexing:</strong>{" "}
//                                         <Badge bg={indexingBadgeColor(pub.indexing)} className="px-2">
//                                             {pub.indexing}
//                                         </Badge>
//                                     </p>
//                                     <p className="small text-secondary mb-0">
//                                         <strong>Link:</strong>{" "}
//                                         <a href={pub.link} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
//                                             {pub.link}
//                                         </a>
//                                     </p>
//                                 </div>
//                                 <Badge bg="info" className="px-3 py-2 h-100 text-nowrap">{pub.publication_date}</Badge>
//                             </div>
//                             {pub.publications_skills?.length > 0 && (
//                                 <div className="mt-3 pt-2 border-top">
//                                     <p className="small text-muted mb-2">Tagged Skills:</p>
//                                     {pub.publications_skills.map(s => (
//                                         <Badge key={s.skill_id} bg="light" text="dark" className="border me-2 mb-1 px-3 py-2 rounded-pill">
//                                             {s.skills?.skill_name}
//                                         </Badge>
//                                     ))}
//                                 </div>
//                             )}
//                             <div className="d-flex justify-content-end gap-2 mt-3">
//                                 <Button size="sm" variant="outline-warning" className="rounded-pill px-3" onClick={() => handleEdit(pub)}>Edit</Button>
//                                 <Button size="sm" variant="outline-danger" className="rounded-pill px-3" onClick={() => handleDelete(pub.pub_id)}>Delete</Button>
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
const ACCENT = "#0ca678";
const ACCENT_LIGHT = "#e6faf4";

export default function Publications() {
    // ── Form States ──────────────────────────────────────────────────────────
    const [title, setTitle] = useState("");
    const [journalName, setJournalName] = useState("");
    const [publicationDate, setPublicationDate] = useState("");
    const [indexing, setIndexing] = useState("");
    const [link, setLink] = useState("");

    // ── Skills & Categories States ───────────────────────────────────────────
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);

    // ── Data States ──────────────────────────────────────────────────────────
    const [publications, setPublications] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // ── UI States ────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [variant, setVariant] = useState("success");
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchPublications();
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

    // ── Fetch All Publications ────────────────────────────────────────────────
    const fetchPublications = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from("publications")
                .select(`*, publications_skills(skill_id, skills(id, skill_name, description, category_id))`)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            if (error) throw error;
            setPublications(data || []);
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
        setTitle("");
        setJournalName("");
        setPublicationDate("");
        setIndexing("");
        setLink("");
        setSelectedCategories([]);
        setSelectedSkills([]);
        setFilteredSkills([]);
        setEditingId(null);
    };

    const handleEdit = async (pub) => {
        setEditingId(pub.pub_id);
        setTitle(pub.title);
        setJournalName(pub.journal_name);
        setPublicationDate(pub.publication_date);
        setIndexing(pub.indexing);
        setLink(pub.link);
        const associatedSkills = pub.publications_skills?.map(s => s.skill_id) || [];
        const cats = [...new Set(pub.publications_skills?.map(s => s.skills?.category_id))].filter(Boolean);
        setSelectedCategories(cats);
        setSelectedSkills(associatedSkills);
        if (cats.length > 0) await fetchSkillsByCategories(cats);
        setShowModal(true);
    };

    const addOrUpdatePublication = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        confirmAlert({
            title: editingId ? "Confirm Update" : "Confirm Add",
            message: `Are you sure you want to ${editingId ? "update" : "add"} this publication?`,
            buttons: [
                {
                    label: "Confirm",
                    onClick: async () => {
                        try {
                            let pubId = editingId;
                            const payload = {
                                user_id: user.id, title, journal_name: journalName,
                                publication_date: publicationDate, indexing, link
                            };
                            if (!editingId) {
                                const { data, error } = await supabase.from("publications").insert([payload]).select();
                                if (error) throw error;
                                pubId = data[0].pub_id;
                            } else {
                                const { error } = await supabase.from("publications").update(payload).eq("pub_id", editingId);
                                if (error) throw error;
                                await supabase.from("publications_skills").delete().eq("pub_id", editingId);
                            }
                            if (selectedSkills.length > 0) {
                                const rows = selectedSkills.map(skillId => ({ pub_id: pubId, skill_id: skillId }));
                                await supabase.from("publications_skills").insert(rows);
                            }
                            setVariant("success");
                            setMessage(editingId ? "Publication updated successfully!" : "Publication added successfully!");
                            resetForm();
                            fetchPublications();
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
            title: "Delete Publication?",
            message: "This action cannot be undone.",
            buttons: [
                {
                    label: "Yes, Delete",
                    onClick: async () => {
                        const { error } = await supabase.from("publications").delete().eq("pub_id", id);
                        if (error) setError(error.message);
                        fetchPublications();
                    }
                },
                { label: "Cancel" }
            ]
        });
    };

    // ── Derived Stats ─────────────────────────────────────────────────────────
    const scopusCount = publications.filter(p => p.indexing === "Scopus").length;
    const totalSkillsTags = publications.reduce((sum, p) => sum + (p.publications_skills?.length || 0), 0);

    // ── Indexing badge style ──────────────────────────────────────────────────
    const getIndexingStyle = (val) => {
        if (val === "Scopus") return { background: "#fff3cd", color: "#856404", border: "1px solid #ffc10740" };
        return { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" };
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="container-fluid py-4 px-3 px-md-4">

            {/* ── Alerts ──────────────────────────────────────────────────── */}
            {message && <Alert variant={variant} dismissible onClose={() => setMessage(null)} className="shadow-sm">{message}</Alert>}
            {error && <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm">{error}</Alert>}

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div
                className="rounded-4 p-4 mb-4 d-flex justify-content-between align-items-center"
                style={{ background: `linear-gradient(135deg, #064e3b 0%, ${ACCENT} 100%)` }}
            >
                <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <span style={{ fontSize: "1.6rem" }}>📄</span>
                        <h3 className="fw-bold text-white mb-0">Research Publications</h3>
                    </div>
                    <p className="text-white mb-0 opacity-75 small">
                        Record journal articles and research outputs linked to your skill expertise.
                    </p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="rounded-pill px-4 fw-bold shadow-sm"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.5)", color: "#fff", backdropFilter: "blur(4px)" }}
                >
                    + Add Publication
                </Button>
            </div>

            {/* ── Stats Row ───────────────────────────────────────────────── */}
            {!loading && publications.length > 0 && (
                <Row className="g-3 mb-4">
                    {[
                        { icon: "📄", label: "Total Publications", value: publications.length },
                        { icon: "⭐", label: "Scopus-Indexed", value: scopusCount },
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
                        <span>📄</span>
                        {editingId ? "Update Publication Record" : "Add New Publication"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    <Form onSubmit={addOrUpdatePublication}>

                        {/* Section: Publication Info */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom: `2px solid ${ACCENT}` }}>
                                <span className="fw-bold small text-uppercase" style={{ color: ACCENT }}>
                                    📝 Publication Details
                                </span>
                            </div>
                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">Research Title</Form.Label>
                                        <Form.Control
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            placeholder="Enter the full title of your research paper"
                                            required
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">Journal / Conference Name</Form.Label>
                                        <Form.Control
                                            value={journalName}
                                            onChange={e => setJournalName(e.target.value)}
                                            placeholder="e.g., IEEE Transactions on Learning Technologies"
                                            required
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">Publication Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={publicationDate}
                                            onChange={e => setPublicationDate(e.target.value)}
                                            required
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">Indexing</Form.Label>
                                        <Form.Select
                                            value={indexing}
                                            onChange={e => setIndexing(e.target.value)}
                                            required
                                            className="rounded-3"
                                        >
                                            <option value="" disabled>Select indexing</option>
                                            <option value="Scopus">⭐ Scopus (full points)</option>
                                            <option value="None">— None (half points)</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold small">DOI / URL Link</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={link}
                                            onChange={e => setLink(e.target.value)}
                                            placeholder="https://doi.org/10.xxxx/xxxxx"
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

                            {/* Indexing Note */}
                            <div
                                className="rounded-3 p-3 mb-3 small"
                                style={{ background: "#fff8e1", border: "1px solid #ffc10760", color: "#78530a" }}
                            >
                                <strong>📌 Scoring Note:</strong> Scopus-indexed publications receive full points from the configured rule.
                                Publications with no indexing receive half points automatically.
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
                                {editingId ? "💾 Save Changes" : "➕ Add Publication"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* ── Records List ────────────────────────────────────────────── */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0" style={{ color: "#1e293b" }}>Your Publication Records</h5>
                {!loading && (
                    <Badge className="rounded-pill px-3 py-2"
                        style={{ background: ACCENT_LIGHT, color: ACCENT, fontSize: "0.82rem", fontWeight: 600 }}>
                        {publications.length} record{publications.length !== 1 ? "s" : ""}
                    </Badge>
                )}
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: ACCENT }} />
                    <p className="text-muted mt-2 small">Loading publication records…</p>
                </div>
            ) : publications.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-4 text-center py-5">
                    <Card.Body>
                        <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>📄</div>
                        <h5 className="fw-bold mt-3 mb-1" style={{ color: "#1e293b" }}>No Publications Recorded Yet</h5>
                        <p className="text-muted mb-4 small" style={{ maxWidth: 400, margin: "0 auto 1rem" }}>
                            Research publications — especially those indexed in Scopus — contribute significantly
                            to your proficiency score. Log your published works here.
                        </p>
                        <Button onClick={() => { resetForm(); setShowModal(true); }} className="rounded-pill px-4 fw-bold" style={{ background: ACCENT, border: "none" }}>
                            + Add Your First Publication
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                publications.map(pub => (
                    <Card key={pub.pub_id} className="mb-3 border-0 shadow-sm rounded-4" style={{ overflow: "hidden", position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: ACCENT, borderRadius: "4px 0 0 4px" }} />
                        <Card.Body className="p-4 ps-5">
                            <Row className="align-items-start">
                                <Col>
                                    <h5 className="fw-bold mb-1 lh-sm" style={{ color: "#1e293b" }}>{pub.title}</h5>
                                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                        <span className="text-muted small">📰 {pub.journal_name}</span>
                                        <span className="text-muted small">·</span>
                                        <span
                                            className="rounded-pill px-2 py-1 small fw-semibold"
                                            style={getIndexingStyle(pub.indexing)}
                                        >
                                            {pub.indexing === "Scopus" ? "⭐" : "—"} {pub.indexing}
                                        </span>
                                    </div>
                                    {pub.link && (
                                        <a
                                            href={pub.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="small text-decoration-none d-inline-flex align-items-center gap-1"
                                            style={{ color: ACCENT }}
                                        >
                                            🔗 <span style={{ textDecoration: "underline" }}>{pub.link.length > 50 ? pub.link.slice(0, 50) + "…" : pub.link}</span>
                                        </a>
                                    )}
                                    {pub.publications_skills?.length > 0 && (
                                        <div className="d-flex flex-wrap gap-1 mt-2">
                                            {pub.publications_skills.map(s => (
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
                                        style={{ background: ACCENT_LIGHT, color: ACCENT, fontWeight: 600, fontSize: "0.78rem" }}>
                                        📅 {pub.publication_date}
                                    </Badge>
                                    <div className="d-flex gap-1 mt-1">
                                        <Button size="sm" onClick={() => handleEdit(pub)} className="rounded-pill px-3"
                                            style={{ background: "transparent", border: `1.5px solid ${ACCENT}`, color: ACCENT, fontSize: "0.78rem" }}>
                                            ✏️ Edit
                                        </Button>
                                        <Button size="sm" onClick={() => handleDelete(pub.pub_id)} className="rounded-pill px-3"
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