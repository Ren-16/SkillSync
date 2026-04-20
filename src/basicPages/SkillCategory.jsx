import React, { useState, useEffect  } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { supabase } from "../supabaseClient";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

export default function SkillCategory() {
  const [skillCategory, setSkillCategory] = useState("");
  // Notification state
  const [message, setMessage] = useState(null);
  const [variant, setVariant] = useState("success");

  const addCategory = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    confirmAlert({
      title: "Confirm Add Category",
      message: "Do you want to add this skill category?",
      buttons: [
        {
          label: "Confirm",
          onClick: async () => {
            try {
              const { error } = await supabase
                .from("skill_category")
                .insert([
                  {
                    user_id: user.id,
                    skill_category: skillCategory
                  }
                ]);

              if (error) {
                setVariant("danger");
                setMessage(error.message);
              } else {
                setVariant("success");
                setMessage("Specialization category added successfully!");
                setSkillCategory("");
              }
            } catch (err) {
              console.error(err);
              setVariant("danger");
              setMessage("An unexpected error occurred.");
            }
          }
        },
        {
          label: "Cancel",
          onClick: () => {}
        }
      ]
    });
  };

  return (
    <>
      {/* Notification */}
      {message && (
        <Alert
          variant={variant}
          dismissible
          onClose={() => setMessage(null)}
        >
          {message}
        </Alert>
      )}

      <Form onSubmit={addCategory}>

        <Form.Group className="mb-3">
          <Form.Label>Skill Category</Form.Label>
          <Form.Control
            type="text"
            value={skillCategory}
            onChange={(e) => setSkillCategory(e.target.value)}
            placeholder="Enter description"
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Add Category
        </Button>
      </Form>
    </>
  );
}
