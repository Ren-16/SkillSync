// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Container,
//   Button,
//   Spinner,
//   Modal,
//   Form,
//   Alert,
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

//   // ---------------------------
//   // FETCH USER PROFILE & DEPARTMENTS
//   // ---------------------------
//   useEffect(() => {
//     async function fetchProfile() {
//       setLoading(true);

//       const {
//         data: { user },
//         error: userError,
//       } = await supabase.auth.getUser();

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
//     setShowModal(true);
//   };

//   // ---------------------------
//   // SAVE EDITED PROFILE
//   // ---------------------------
//   const handleSave = async () => {
//     setSaving(true);
//     setErrorMsg("");

//     const { error } = await supabase
//       .from("profiles")
//       .update({
//         first_name: editData.first_name,
//         middle_name: editData.middle_name,
//         last_name: editData.last_name,
//         department_id: editData.department_id,
//       })
//       .eq("id", profile.id);

//     if (error) {
//       setErrorMsg(error.message);
//       setSaving(false);
//       return;
//     }

//     // Update UI
//     setProfile((prev) => ({
//       ...prev,
//       ...editData,
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
//     return <p className="text-center text-danger">{errorMsg || "Error loading profile."}</p>;

//   return (
//     <Container className="d-flex justify-content-center mt-5">
//       <Card style={{ width: "500px", padding: "20px" }}>
//         <h4 className="text-center mb-3">My Profile</h4>

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
  const [selectedFile, setSelectedFile] = useState(null);

  // ---------------------------
  // FETCH USER PROFILE & DEPARTMENTS
  // ---------------------------
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setErrorMsg("");

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setErrorMsg("User not logged in");
        setLoading(false);
        return;
      }

      // Fetch profile
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

      // Fetch departments
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

  // ---------------------------
  // OPEN EDIT MODAL
  // ---------------------------
  const handleEdit = () => {
    setEditData({
      first_name: profile.first_name,
      middle_name: profile.middle_name,
      last_name: profile.last_name,
      department_id: profile.department_id,
    });
    setSelectedFile(null); // reset file input
    setShowModal(true);
  };

  // ---------------------------
  // SAVE EDITED PROFILE
  // ---------------------------
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setErrorMsg("User not logged in");
      setSaving(false);
      return;
    }

    let imagePath = profile.profile_image || null;

    // 1️⃣ Upload image if a new file is selected
    if (selectedFile) {
      const fileName = `${user.id}-${selectedFile.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("profile_images")
        .upload(fileName, selectedFile, { upsert: true });

      if (uploadError) {
        setErrorMsg("Failed to upload image: " + uploadError.message);
        setSaving(false);
        return;
      }

      // Get public URL of the uploaded image
      const { publicUrl } = supabase.storage
        .from("profile_images")
        .getPublicUrl(fileName);
      imagePath = publicUrl;
    }

    // 2️⃣ Update profile in table
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: editData.first_name,
        middle_name: editData.middle_name,
        last_name: editData.last_name,
        department_id: editData.department_id,
        profile_image: imagePath,
      })
      .eq("id", user.id); // MUST use auth.uid()

    if (error) {
      setErrorMsg(error.message);
      setSaving(false);
      return;
    }

    // Update UI
    setProfile((prev) => ({
      ...prev,
      ...editData,
      profile_image: imagePath,
    }));

    setSaving(false);
    setShowModal(false);
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  if (!profile)
    return (
      <p className="text-center text-danger">
        {errorMsg || "Error loading profile."}
      </p>
    );

  return (
    <Container className="d-flex justify-content-center mt-5">
      <Card style={{ width: "500px", padding: "20px" }}>
        <h4 className="text-center mb-3">My Profile</h4>

        {/* DISPLAY PROFILE IMAGE */}
        {profile.profile_image ? (
          <div className="text-center mb-3">
            <Image
              src={profile.profile_image}
              roundedCircle
              width={120}
              height={120}
              alt="Profile"
            />
          </div>
        ) : (
          <div className="text-center mb-3">
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: "#ddd",
                display: "inline-block",
              }}
            />
          </div>
        )}

        {/* DISPLAY PROFILE INFO */}
        <p>
          <strong>First Name:</strong> {profile.first_name}
        </p>
        <p>
          <strong>Middle Name:</strong> {profile.middle_name}
        </p>
        <p>
          <strong>Last Name:</strong> {profile.last_name}
        </p>
        <p>
          <strong>Role:</strong> {profile.role}
        </p>
        <p>
          <strong>Department:</strong>{" "}
          {departments.find((d) => d.id === profile.department_id)?.name ||
            "Not Assigned"}
        </p>

        {/* EDIT BUTTON */}
        <Button variant="primary" className="w-100 mt-3" onClick={handleEdit}>
          Edit Profile
        </Button>
      </Card>

      {/* ---------------------------
          EDIT PROFILE MODAL
      --------------------------- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                value={editData.first_name}
                onChange={(e) =>
                  setEditData({ ...editData, first_name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Middle Name</Form.Label>
              <Form.Control
                type="text"
                value={editData.middle_name}
                onChange={(e) =>
                  setEditData({ ...editData, middle_name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                value={editData.last_name}
                onChange={(e) =>
                  setEditData({ ...editData, last_name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Select
                value={editData.department_id}
                onChange={(e) =>
                  setEditData({ ...editData, department_id: e.target.value })
                }
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profile Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
