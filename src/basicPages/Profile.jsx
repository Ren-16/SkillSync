// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Container,
//   Button,
//   Spinner,
//   Modal,
//   Form,
//   Alert,
//   Image,
// } from "react-bootstrap";
// import { supabase } from "../supabaseClient";

// export default function ProfilePage() {
//   const [profile, setProfile] = useState(null);
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [showModal, setShowModal] = useState(false);
//   const [editData, setEditData] = useState({});
//   const [saving, setSaving] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);

//   // ---------------------------
//   // FETCH USER PROFILE & DEPARTMENTS
//   // ---------------------------
//   useEffect(() => {
//     async function fetchProfile() {
//       setLoading(true);
//       setErrorMsg("");

//       const { data: { user }, error: userError } = await supabase.auth.getUser();
//       if (userError || !user) {
//         setErrorMsg("User not logged in");
//         setLoading(false);
//         return;
//       }

//       // Fetch profile
//       const { data: profileData, error: profileError } = await supabase
//         .from("profiles")
//         .select("*")
//         .eq("id", user.id)
//         .single();

//       if (profileError) {
//         setErrorMsg(profileError.message);
//         setLoading(false);
//         return;
//       }

//       // Fetch departments
//       const { data: deptData, error: deptError } = await supabase
//         .from("departments")
//         .select("*");

//       if (deptError) {
//         setErrorMsg(deptError.message);
//         setLoading(false);
//         return;
//       }

//       setDepartments(deptData || []);
//       setProfile(profileData);
//       setLoading(false);
//     }

//     fetchProfile();
//   }, []);

//   // ---------------------------
//   // OPEN EDIT MODAL
//   // ---------------------------
//   const handleEdit = () => {
//     setEditData({
//       first_name: profile.first_name,
//       middle_name: profile.middle_name,
//       last_name: profile.last_name,
//       department_id: profile.department_id,
//     });
//     setSelectedFile(null); // reset file input
//     setShowModal(true);
//   };

//   // ---------------------------
//   // SAVE EDITED PROFILE
//   // ---------------------------
//   const handleSave = async () => {
//     setSaving(true);
//     setErrorMsg("");

//     const { data: { user }, error: userError } = await supabase.auth.getUser();
//     if (userError || !user) {
//       setErrorMsg("User not logged in");
//       setSaving(false);
//       return;
//     }

//     let imagePath = profile.profile_image || null;

//     // 1️⃣ Upload image if a new file is selected
//     if (selectedFile) {
//       const fileName = `${user.id}-${selectedFile.name}`;
//       const { data, error: uploadError } = await supabase.storage
//         .from("profile_images")
//         .upload(fileName, selectedFile, { upsert: true });

//       if (uploadError) {
//         setErrorMsg("Failed to upload image: " + uploadError.message);
//         setSaving(false);
//         return;
//       }

//       // Get public URL of the uploaded image
//       const { publicUrl } = supabase.storage
//         .from("profile_images")
//         .getPublicUrl(fileName);
//       imagePath = publicUrl;
//     }

//     // 2️⃣ Update profile in table
//     const { error } = await supabase
//       .from("profiles")
//       .update({
//         first_name: editData.first_name,
//         middle_name: editData.middle_name,
//         last_name: editData.last_name,
//         department_id: editData.department_id,
//         profile_image: imagePath,
//       })
//       .eq("id", user.id); // MUST use auth.uid()

//     if (error) {
//       setErrorMsg(error.message);
//       setSaving(false);
//       return;
//     }

//     // Update UI
//     setProfile((prev) => ({
//       ...prev,
//       ...editData,
//       profile_image: imagePath,
//     }));

//     setSaving(false);
//     setShowModal(false);
//   };

//   if (loading)
//     return (
//       <div className="text-center mt-5">
//         <Spinner animation="border" />
//       </div>
//     );

//   if (!profile)
//     return (
//       <p className="text-center text-danger">
//         {errorMsg || "Error loading profile."}
//       </p>
//     );

//   return (
//     <Container className="d-flex justify-content-center mt-5">
//       <Card style={{ width: "500px", padding: "20px" }}>
//         <h4 className="text-center mb-3">My Profile</h4>

//         {/* DISPLAY PROFILE IMAGE */}
//         {profile.profile_image ? (
//           <div className="text-center mb-3">
//             <Image
//               src={profile.profile_image}
//               roundedCircle
//               width={120}
//               height={120}
//               alt="Profile"
//             />
//           </div>
//         ) : (
//           <div className="text-center mb-3">
//             <div
//               style={{
//                 width: 120,
//                 height: 120,
//                 borderRadius: "50%",
//                 backgroundColor: "#ddd",
//                 display: "inline-block",
//               }}
//             />
//           </div>
//         )}

//         {/* DISPLAY PROFILE INFO */}
//         <p>
//           <strong>First Name:</strong> {profile.first_name}
//         </p>
//         <p>
//           <strong>Middle Name:</strong> {profile.middle_name}
//         </p>
//         <p>
//           <strong>Last Name:</strong> {profile.last_name}
//         </p>
//         <p>
//           <strong>Role:</strong> {profile.role}
//         </p>
//         <p>
//           <strong>Department:</strong>{" "}
//           {departments.find((d) => d.id === profile.department_id)?.name ||
//             "Not Assigned"}
//         </p>

//         {/* EDIT BUTTON */}
//         <Button variant="primary" className="w-100 mt-3" onClick={handleEdit}>
//           Edit Profile
//         </Button>
//       </Card>

//       {/* ---------------------------
//           EDIT PROFILE MODAL
//       --------------------------- */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Profile</Modal.Title>
//         </Modal.Header>

//         <Modal.Body>
//           {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>First Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={editData.first_name}
//                 onChange={(e) =>
//                   setEditData({ ...editData, first_name: e.target.value })
//                 }
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Middle Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={editData.middle_name}
//                 onChange={(e) =>
//                   setEditData({ ...editData, middle_name: e.target.value })
//                 }
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Last Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={editData.last_name}
//                 onChange={(e) =>
//                   setEditData({ ...editData, last_name: e.target.value })
//                 }
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Department</Form.Label>
//               <Form.Select
//                 value={editData.department_id}
//                 onChange={(e) =>
//                   setEditData({ ...editData, department_id: e.target.value })
//                 }
//               >
//                 <option value="">Select Department</option>
//                 {departments.map((dept) => (
//                   <option key={dept.id} value={dept.id}>
//                     {dept.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Profile Image</Form.Label>
//               <Form.Control
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => setSelectedFile(e.target.files[0])}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleSave} disabled={saving}>
//             {saving ? <Spinner animation="border" size="sm" /> : "Save Changes"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// }


import React, { useEffect, useState } from "react";
import {
    Card,
    Container,
    Button,
    Spinner,
    Modal,
    Form,
    Alert,
    Image,
    Row,
    Col,
    Badge,
} from "react-bootstrap";
import { supabase } from "../supabaseClient";

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // ─── Fetch Profile & Departments ────────────────────────────────────────
    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            setErrorMsg("");

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                setErrorMsg("User not logged in.");
                setLoading(false);
                return;
            }

            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profileError) {
                setErrorMsg(profileError.message);
                setLoading(false);
                return;
            }

            const { data: deptData, error: deptError } = await supabase
                .from("departments")
                .select("*");

            if (deptError) {
                setErrorMsg(deptError.message);
                setLoading(false);
                return;
            }

            setDepartments(deptData || []);
            setProfile(profileData);
            setLoading(false);
        }
        fetchProfile();
    }, []);

    // ─── Open Edit Modal ─────────────────────────────────────────────────────
    const handleEdit = () => {
        setEditData({
            first_name: profile.first_name || "",
            middle_name: profile.middle_name || "",
            last_name: profile.last_name || "",
            department_id: profile.department_id || "",
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        setErrorMsg("");
        setShowModal(true);
    };

    // ─── Handle File Selection with Preview ──────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setErrorMsg("Please select a valid image file.");
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setErrorMsg("Image must be smaller than 2MB.");
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setErrorMsg("");
    };

    // ─── Save Profile (BUG FIX: getPublicUrl destructuring) ─────────────────
    const handleSave = async () => {
        setSaving(true);
        setErrorMsg("");

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            setErrorMsg("User not logged in.");
            setSaving(false);
            return;
        }

        let imagePath = profile.profile_image || null;

        // ── BUG FIX: Correctly destructure the public URL ──────────────────
        // OLD (broken):  const { publicUrl } = supabase.storage...getPublicUrl(...)
        // NEW (correct): const { data: { publicUrl } } = supabase.storage...getPublicUrl(...)
        if (selectedFile) {
            const fileExt = selectedFile.name.split(".").pop();
            const fileName = `${user.id}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("profile_images")
                .upload(fileName, selectedFile, { upsert: true });

            if (uploadError) {
                setErrorMsg("Failed to upload image: " + uploadError.message);
                setSaving(false);
                return;
            }

            // ✅ CORRECT destructuring
            const { data: { publicUrl } } = supabase.storage
                .from("profile_images")
                .getPublicUrl(fileName);

            // Append cache-buster so the browser reloads the new image
            imagePath = `${publicUrl}?t=${Date.now()}`;
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                first_name: editData.first_name,
                middle_name: editData.middle_name,
                last_name: editData.last_name,
                department_id: editData.department_id,
                profile_image: imagePath,
            })
            .eq("id", user.id);

        if (error) {
            setErrorMsg(error.message);
            setSaving(false);
            return;
        }

        setProfile(prev => ({ ...prev, ...editData, profile_image: imagePath }));
        setSaving(false);
        setShowModal(false);
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
    };

    // ─── Helpers ─────────────────────────────────────────────────────────────
    const getDepartmentName = () =>
        departments.find(d => d.id === profile?.department_id)?.name || "Not Assigned";

    const getRoleBadge = (role) => {
        const map = { chair: "warning", faculty: "primary", admin: "danger" };
        return map[role] || "secondary";
    };

    const getInitials = () => {
        if (!profile) return "?";
        return `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase();
    };

    // ─── Loading / Error States ───────────────────────────────────────────────
    if (loading) {
        return (
            <div className="text-center mt-5 py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2 small">Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return <Alert variant="danger" className="m-4">{errorMsg || "Error loading profile."}</Alert>;
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={7} xl={6}>
                    {successMsg && (
                        <Alert variant="success" dismissible onClose={() => setSuccessMsg("")}>
                            {successMsg}
                        </Alert>
                    )}

                    <Card className="border-0 shadow rounded-4 overflow-hidden">
                        {/* Header Banner */}
                        <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0d6efd 100%)", height: 100 }} />

                        <Card.Body className="px-4 pb-4">
                            {/* Avatar */}
                            <div className="d-flex justify-content-between align-items-start" style={{ marginTop: -50 }}>
                                <div>
                                    {profile.profile_image ? (
                                        <Image
                                            src={profile.profile_image}
                                            roundedCircle
                                            width={90}
                                            height={90}
                                            alt="Profile Photo"
                                            style={{ border: "4px solid white", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div
                                            className="d-flex align-items-center justify-content-center fw-bold text-white rounded-circle"
                                            style={{
                                                width: 90, height: 90,
                                                background: "#0d6efd",
                                                border: "4px solid white",
                                                fontSize: "1.8rem"
                                            }}
                                        >
                                            {getInitials()}
                                        </div>
                                    )}
                                </div>
                                <Badge
                                    bg={getRoleBadge(profile.role)}
                                    className="px-3 py-2 rounded-pill mt-2 text-capitalize"
                                >
                                    {profile.role}
                                </Badge>
                            </div>

                            {/* Name */}
                            <div className="mt-3 mb-4">
                                <h4 className="fw-bold mb-0">
                                    {profile.first_name} {profile.middle_name} {profile.last_name}
                                </h4>
                                <p className="text-muted small mb-0">{getDepartmentName()}</p>
                            </div>

                            {/* Info Grid */}
                            <Row className="g-3 mb-4">
                                {[
                                    { label: "First Name", value: profile.first_name },
                                    { label: "Middle Name", value: profile.middle_name || "—" },
                                    { label: "Last Name", value: profile.last_name },
                                    { label: "Department", value: getDepartmentName() },
                                ].map(item => (
                                    <Col xs={6} key={item.label}>
                                        <div className="p-3 rounded-3 bg-light">
                                            <p className="text-muted small mb-0">{item.label}</p>
                                            <p className="fw-semibold mb-0">{item.value}</p>
                                        </div>
                                    </Col>
                                ))}
                            </Row>

                            <Button
                                variant="primary"
                                className="w-100 rounded-pill fw-bold py-2"
                                onClick={handleEdit}
                            >
                                ✏️ Edit Profile
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ── Edit Modal ───────────────────────────────────────────────── */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Edit Profile</Modal.Title>
                </Modal.Header>

                <Modal.Body className="px-4">
                    {errorMsg && <Alert variant="danger" className="py-2 small">{errorMsg}</Alert>}

                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editData.first_name}
                                        onChange={e => setEditData({ ...editData, first_name: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Middle Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editData.middle_name}
                                        onChange={e => setEditData({ ...editData, middle_name: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editData.last_name}
                                onChange={e => setEditData({ ...editData, last_name: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Department</Form.Label>
                            <Form.Select
                                value={editData.department_id}
                                onChange={e => setEditData({ ...editData, department_id: e.target.value })}
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Profile Photo</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <Form.Text className="text-muted small">Max 2MB. JPG, PNG, or GIF.</Form.Text>
                            {previewUrl && (
                                <div className="mt-2 text-center">
                                    <Image
                                        src={previewUrl}
                                        roundedCircle
                                        width={70}
                                        height={70}
                                        style={{ objectFit: "cover", border: "2px solid #dee2e6" }}
                                        alt="Preview"
                                    />
                                    <p className="text-muted small mt-1">Preview</p>
                                </div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="border-0">
                    <Button variant="secondary" className="rounded-pill px-4" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" className="rounded-pill px-4" onClick={handleSave} disabled={saving}>
                        {saving ? <><Spinner animation="border" size="sm" className="me-2" />Saving...</> : "Save Changes"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
