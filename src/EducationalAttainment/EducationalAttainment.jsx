import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { supabase } from "../supabaseClient";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import Modal from "react-bootstrap/Modal";

export default function EducationalAttainment() {
    // Form States
    const [programName, setrogramName] = useState("");
    const [institution, setInstitution] = useState("");
    const [dateCompleted, setdateCompleted] = useState("");
    const [degree, setDegree] = useState("");
    const [thesisCapstone, setThesisCapstone] = useState("");

    // Skills & Categories States
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);

    // Data States
    const [educations, setEducations] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // UI States
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [variant, setVariant] = useState("success");
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchEducations();
    }, []);

    /* ============================
       FETCH CATEGORIES (BY DEPT)
    ============================ */
    const fetchCategories = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("department_id")
                .eq("id", user.id)
                .single();

            if (profileError) throw profileError;

            const { data: deptUsers, error: deptError } = await supabase
                .from("profiles")
                .select("id")
                .eq("department_id", profile.department_id);

            if (deptError) throw deptError;
            const userIds = deptUsers.map(u => u.id);

            const { data, error } = await supabase
                .from("skill_category")
                .select("category_id, skill_category")
                .in("user_id", userIds);

            if (error) throw error;
            setCategories(data || []);
        } catch (err) {
            setError(err.message);
        }
    };

    /* ============================
       FETCH SKILLS BY CATEGORIES
    ============================ */
    const fetchSkillsByCategories = async (categoryIds) => {
        try {
            if (!categoryIds || categoryIds.length === 0) {
                setFilteredSkills([]);
                return;
            }

            const { data, error } = await supabase
                .from("skills")
                .select("id, skill_name, description, category_id")
                .in("category_id", categoryIds);

            if (error) throw error;
            setFilteredSkills(data || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchEducations = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from("educational_attainment")
                .select(`
                    *,
                    educational_skills (
                        skill_id,
                        skills (
                            id,
                            skill_name,
                            description,
                            category_id
                        )
                    )
                `)
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
            prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        );
    };

    const resetForm = () => {
        setrogramName("");
        setInstitution("");
        setdateCompleted("");
        setDegree("");
        setThesisCapstone("");

        setSelectedCategories([]);
        setSelectedSkills([]);
        setFilteredSkills([]);
        setEditingId(null);
    };

    const handleEdit = async (educ) => {
        setEditingId(educ.education_id);

        setrogramName(educ.program_name);
        setInstitution(educ.institution);
        setdateCompleted(educ.date_completed);
        setDegree(educ.degree);
        setThesisCapstone(educ.thesis_capstone);

        // Extract associated skills and categories
        const associatedSkills = educ.educational_skills?.map(s => s.skill_id) || [];
        const cats = [...new Set(educ.educational_skills?.map(s => s.skills?.category_id))].filter(Boolean);

        setSelectedCategories(cats);
        setSelectedSkills(associatedSkills);
        
        // Fetch the skill list for the categories so they appear in the modal
        if (cats.length > 0) {
            await fetchSkillsByCategories(cats);
        }
        
        setShowModal(true);
    };

    const addOrUpdateEducation = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();

        confirmAlert({
            title: editingId ? "Confirm Update" : "Confirm Add",
            message: `Are you sure you want to ${editingId ? "update" : "add"} this education?`,
            buttons: [
                {
                    label: "Confirm",
                    onClick: async () => {
                        try {
                            let educId = editingId;

                            const payload = {
                                user_id: user.id,
                                program_name: programName,
                                institution,
                                date_completed: dateCompleted, 
                                degree,
                                thesis_capstone: thesisCapstone
                            };

                            if (!editingId) {
                                const { data, error } = await supabase
                                    .from("educational_attainment")
                                    .insert([payload])
                                    .select();
                                if (error) throw error;
                                educId = data[0].education_id;
                            } else {
                                const { error } = await supabase
                                    .from("educational_attainment")
                                    .update(payload)
                                    .eq("education_id", editingId);
                                if (error) throw error;

                                await supabase
                                    .from("educational_skills")
                                    .delete()
                                    .eq("education_id", editingId);
                            }

                            if (selectedSkills.length > 0) {
                                const rows = selectedSkills.map(skillId => ({
                                    education_id: educId,
                                    skill_id: skillId
                                }));
                                await supabase.from("educational_skills").insert(rows);
                            }

                            setVariant("success");
                            setMessage(editingId ? "Updated successfully!" : "Added successfully!");
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
            title: "Delete Education?",
            message: "This action cannot be undone.",
            buttons: [
                {
                    label: "Yes, Delete",
                    onClick: async () => {
                        const { error } = await supabase
                            .from("educational_attainment")
                            .delete()
                            .eq("education_id", id);
                        if (error) setError(error.message);
                        fetchEducations();
                    }
                },
                { label: "No" }
            ]
        });
    };

    return (
        <div className="container py-4">
            {message && <Alert variant={variant} dismissible onClose={() => setMessage(null)}>{message}</Alert>}
            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Educational Attainment</h3>
                <Button 
                    className="rounded-pill px-4" 
                    onClick={() => { resetForm(); setShowModal(true); }}
                >
                    + Add Education
                </Button>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered scrollable>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">
                        {editingId ? "Update Education" : "Add New Education"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="pt-2">
                    <Form onSubmit={addOrUpdateEducation}>
                        <div className="row">
                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label className="fw-semibold">Program Name</Form.Label>
                                <Form.Control value={programName} onChange={e => setrogramName(e.target.value)} required />
                            </Form.Group>
                        </div>

                        <div className="row">
                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label className="fw-semibold">School Graduated</Form.Label>
                                <Form.Control value={institution} onChange={e => setInstitution(e.target.value)} required />
                            </Form.Group>

                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label className="fw-semibold">Completed Date</Form.Label>
                                <Form.Control type="date" value={dateCompleted} onChange={e => setdateCompleted(e.target.value)} required />
                            </Form.Group>
                        </div>

                        <div className="row">
                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label className="fw-semibold">Degree</Form.Label>
                                <Form.Select 
                                    value={degree} 
                                    onChange={e => setDegree(e.target.value)} 
                                    required
                                    className="rounded-3"
                                >
                                    <option value="" disabled>Select Degree</option>
                                    <option value="Bachelor">Bachelor</option>
                                    <option value="Master">Master</option>
                                    <option value="Doctoral">Doctoral</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label className="fw-semibold">Thesis / Capstone</Form.Label>
                                <Form.Control type="text" value={thesisCapstone} onChange={e => setThesisCapstone(e.target.value)} required />
                            </Form.Group>
                        </div>

                        <div className="mb-4 border-top pt-3">
                            <h6 className="fw-bold text-secondary mb-3">Skill Categories</h6>
                            <div className="d-flex flex-wrap gap-3">
                                {categories.map(cat => (
                                    <Form.Check 
                                        key={cat.category_id} 
                                        type="checkbox" 
                                        label={cat.skill_category} 
                                        checked={selectedCategories.includes(cat.category_id)}
                                        onChange={() => handleCategoryToggle(cat.category_id)} 
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mb-4 border-top pt-3">
                            <h6 className="fw-bold text-secondary mb-3">Select Skills</h6>
                            {selectedCategories.map(catId => {
                                const cat = categories.find(c => c.category_id === catId);
                                const skills = filteredSkills.filter(s => s.category_id === catId);
                                return (
                                    <div key={catId} className="mb-3">
                                        <div className="small fw-semibold mb-2">{cat?.skill_category}</div>
                                        <div className="d-flex flex-wrap gap-2">
                                            {skills.map(skill => (
                                                <OverlayTrigger key={skill.id} overlay={<Tooltip>{skill.description}</Tooltip>}>
                                                    <Badge 
                                                        bg={selectedSkills.includes(skill.id) ? "primary" : "light"}
                                                        text={selectedSkills.includes(skill.id) ? "light" : "dark"}
                                                        className="px-3 py-2 rounded-pill border"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => handleSkillToggle(skill.id)}
                                                    >
                                                        {skill.skill_name}
                                                    </Badge>
                                                </OverlayTrigger>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="text-end">
                            <Button variant="secondary" className="me-2 rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button type="submit" className="px-4 rounded-pill">Save Changes</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <h3 className="mt-5">Your Educations</h3>
            <hr />
            {loading ? <Spinner animation="border" /> : (
                educations.length === 0 ? <Alert variant="info">No records found.</Alert> : 
                educations.map(educ => (
                    <Card key={educ.education_id} className="mb-4 border-0 shadow-sm rounded-3">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h5 className="fw-bold mb-1">{educ.program_name}</h5>
                                    <p className="text-muted mb-1">{educ.institution}</p>
                                    <p className="text-muted mb-1">{educ.degree}</p>
                                    <p className="small text-secondary">Theis/Capstone: {educ.thesis_capstone}</p>
                                </div>
                                <Badge bg="info" className="px-3 py-2 h-100">{educ.date_completed}</Badge>
                            </div>
                            <div className="mt-3">
                                {educ.educational_skills?.map(s => (
                                    <Badge key={s.skill_id} bg="light" text="dark" className="border me-2 px-3 py-2 rounded-pill">
                                        {s.skills?.skill_name}
                                    </Badge>
                                ))}
                            </div>
                            <div className="d-flex justify-content-end gap-2 mt-3">
                                <Button size="sm" variant="outline-warning" className="rounded-pill px-3" onClick={() => handleEdit(educ)}>Edit</Button>
                                <Button size="sm" variant="outline-danger" className="rounded-pill px-3" onClick={() => handleDelete(educ.education_id)}>Delete</Button>
                            </div>
                        </Card.Body>
                    </Card>
                ))
            )}
        </div>
    );
}