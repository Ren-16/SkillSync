// import React, { useState } from "react";
// import { useEffect } from "react";
// import Form from "react-bootstrap/Form";
// import Button from "react-bootstrap/Button";
// import Alert from "react-bootstrap/Alert";
// import { supabase } from "../supabaseClient";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";

// export default function SkillCategories() {
//   const [skillName, setSkillName] = useState("");
//   const [description, setDescription] = useState("");

//   // Notification state
//   const [message, setMessage] = useState(null);
//   const [variant, setVariant] = useState("success");

//   const [category, setCategory] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//   fetchCategories();
//     }, []);

//   const fetchCategories = async () => {
//     const { data, error } = await supabase
//       .from("skill_category")
//       .select("category_id, skill_category");

//     if (error) {
//       setError(error.message);
//     } else {
//       setCategories(data);
//     }
//   };

//   const addCourseHandled = async (e) => {
//     e.preventDefault();

//     confirmAlert({
//       title: "Confirm Add Skill",
//       message: "Do you want to add this skill?",
//       buttons: [
//         {
//           label: "Confirm",
//           onClick: async () => {
//             try {
//               const { error } = await supabase
//                 .from("skills")
//                 .insert([{
//                   skill_name: skillName,
//                   category_id: category,
//                   description,
//                   last_verified: new Date()
//                 }]);

//               if (error) throw error;

//               setVariant("success");
//               setMessage("Skill added successfully!");

//               // reset form
//               setSkillName("");
//               setDescription("");

//             } catch (err) {
//               console.error(err);
//               setVariant("danger");
//               setMessage(err.message);
//             }
//           }
//         },
//         { label: "Cancel" }
//       ]
//     });
//   };

//   return (
//     <>
//       {/* Notification */}
//       {message && (
//         <Alert
//           variant={variant}
//           dismissible
//           onClose={() => setMessage(null)}
//         >
//           {message}
//         </Alert>
//       )}

//       <Form onSubmit={addCourseHandled}>

//         <Form.Group className="mb-3">
//           <Form.Label>Specialization Category</Form.Label>

//           <Form.Select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             required
//           >
//             <option value="" disabled>Select a category</option>

//             {categories.map((cat) => (
//               <option key={cat.category_id} value={cat.category_id}>
//                 {cat.skill_category}
//               </option>
//             ))}
//           </Form.Select>

//           {error && <p style={{ color: "red" }}>{error}</p>}
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>Skill Name</Form.Label>
//           <Form.Control
//             type="text"
//             value={skillName}
//             onChange={(e) => setSkillName(e.target.value)}
//             placeholder="Enter Skill Name"
//             required
//           />
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>Description</Form.Label>
//           <Form.Control
//             type="text"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             placeholder="Enter Skill Description"
//             required
//           />
//         </Form.Group>
   

//         <Button variant="primary" type="submit">
//           Add Skill
//         </Button>
//       </Form>
//     </>
//   );
// }



import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Card, Row, Col, Container, Table, Badge } from "react-bootstrap";
import { supabase } from "../supabaseClient";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

export default function SkillManagement() {
  // --- Data State ---
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);

  // --- Form State ---
  const [skillCategory, setSkillCategory] = useState("");
  const [skillName, setSkillName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // --- Filter State ---
  const [filterCategory, setFilterCategory] = useState("All");

  // --- UI State ---
  const [message, setMessage] = useState(null);
  const [variant, setVariant] = useState("success");
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchSkills();
  }, []);

  // Handle Filtering Logic
  useEffect(() => {
    if (filterCategory === "All") {
      setFilteredSkills(skills);
    } else {
      setFilteredSkills(skills.filter(s => s.category_id.toString() === filterCategory));
    }
  }, [filterCategory, skills]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("skill_category")
      .select("category_id, skill_category");
    if (!error) setCategories(data);
    else setFetchError(error.message);
  };

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from("skills")
      .select(`
        *,
        skill_category (skill_category)
      `);
    if (!error) setSkills(data);
  };

  const showAlert = (msg, type) => {
    setMessage(msg);
    setVariant(type);
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    confirmAlert({
      title: "Confirm Add Category",
      message: `Add "${skillCategory}"?`,
      buttons: [
        {
          label: "Confirm",
          onClick: async () => {
            const { error } = await supabase
              .from("skill_category")
              .insert([{ user_id: user.id, skill_category: skillCategory }]);

            if (!error) {
              showAlert("Category added!", "success");
              setSkillCategory("");
              fetchCategories();
            } else {
              showAlert(error.message, "danger");
            }
          },
        },
        { label: "Cancel" },
      ],
    });
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    confirmAlert({
      title: "Confirm Add Skill",
      message: `Add "${skillName}"?`,
      buttons: [
        {
          label: "Confirm",
          onClick: async () => {
            const { error } = await supabase
              .from("skills")
              .insert([{
                skill_name: skillName,
                category_id: selectedCategory,
                description,
                last_verified: new Date()
              }]);

            if (!error) {
              showAlert("Skill added!", "success");
              setSkillName("");
              setDescription("");
              fetchSkills();
            } else {
              showAlert(error.message, "danger");
            }
          }
        },
        { label: "Cancel" }
      ]
    });
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark">Skill & Category Management</h2>
        <p className="text-muted">Define your specialization categories and specific skills below.</p>
      </div>

      {message && <Alert variant={variant} dismissible onClose={() => setMessage(null)} className="shadow-sm">{message}</Alert>}

      <Row className="g-4 mb-5">
        <Col lg={5}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-primary text-white py-3 border-0">
              <h5 className="mb-0">Add New Category</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleAddCategory}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">Category Name</Form.Label>
                  <Form.Control type="text" value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)} placeholder="e.g. Software Development" required />
                </Form.Group>
                <div className="d-grid"><Button variant="primary" type="submit">Create Category</Button></div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-dark text-white py-3 border-0">
              <h5 className="mb-0">Add New Skill</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleAddSkill}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">Specialization Category</Form.Label>
                  <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat) => (<option key={cat.category_id} value={cat.category_id}>{cat.skill_category}</option>))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">Skill Name</Form.Label>
                  <Form.Control type="text" value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="e.g. React.js" required />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small">Description</Form.Label>
                  <Form.Control as="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Skill details..." required />
                </Form.Group>
                <div className="d-grid"><Button variant="dark" type="submit">Save New Skill</Button></div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Skills Table Section */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Skill Registry</h5>
          <div className="d-flex align-items-center" style={{ minWidth: '250px' }}>
            <span className="me-2 small fw-bold text-muted">Filter:</span>
            <Form.Select size="sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {categories.map((cat) => (<option key={cat.category_id} value={cat.category_id}>{cat.skill_category}</option>))}
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Skill Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.length > 0 ? (
                filteredSkills.map((skill) => (
                  <tr key={skill.id}>
                    <td className="ps-4 fw-bold text-primary">{skill.skill_name}</td>
                    <td><Badge bg="info" text="dark">{skill.skill_category?.skill_category}</Badge></td>
                    <td className="text-muted small" style={{ maxWidth: '300px' }}>{skill.description}</td>
                    <td>{new Date(skill.last_verified).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-4 text-muted">No skills found.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

