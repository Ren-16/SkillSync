// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import { Card, Form, Button, Table, Row, Col, Badge, ProgressBar, Alert } from "react-bootstrap";

// export default function ScoringConfigPage() {
//   const [configs, setConfigs] = useState([]);
//   const [rules, setRules] = useState([]);

//   const [formConfig, setFormConfig] = useState({
//     category: "",
//     weight: "",
//     max_score: "",
//     source_table: "",
//   });

//   const [formRule, setFormRule] = useState({
//     category_id: "",
//     rule_type: "exact_match", 
//     target_column: "",
//     value: "",
//     points: "",
//   });

//   const [isEducationCategory, setIsEducationCategory] = useState(false);

//   useEffect(() => {
//     fetchConfigs();
//     fetchRules();
//   }, []);

//   const fetchConfigs = async () => {
//     const { data, error } = await supabase
//       .from("scoring_config")
//       .select("*")
//       .order("created_at", { ascending: false });
//     if (!error) setConfigs(data);
//   };

//   const fetchRules = async () => {
//     const { data, error } = await supabase
//       .from("scoring_rules")
//       .select(`*, scoring_config(category)`);
//     if (!error) setRules(data);
//   };

//   const totalCategoryWeight = configs.reduce((sum, config) => sum + Number(config.weight || 0), 0);

//   const handleConfigSubmit = async (e) => {
//     e.preventDefault();
//     const newWeight = Number(formConfig.weight);

//     if (totalCategoryWeight + newWeight > 100) {
//       alert(`Cannot add category. Pushes total weights to ${totalCategoryWeight + newWeight}%, exceeding the 100% limit.`);
//       return;
//     }

//     const { error } = await supabase.from("scoring_config").insert([
//       {
//         category: formConfig.category,
//         weight: newWeight,
//         max_score: Number(formConfig.max_score),
//         source_table: formConfig.source_table,
//       },
//     ]);

//     if (!error) {
//       setFormConfig({ category: "", weight: "", max_score: "", source_table: "" });
//       fetchConfigs();
//     }
//   };

//   const handleRuleSubmit = async (e) => {
//     e.preventDefault();

//     let finalRuleType = formRule.rule_type; 
//     let finalValue = formRule.value;
//     let finalPoints = Number(formRule.points);

//     if (isEducationCategory) {
//       finalRuleType = "exact_match";
//       finalValue = formRule.value; 
//     }

//     const { error } = await supabase.from("scoring_rules").insert([
//       {
//         category_id: formRule.category_id,
//         rule_type: finalRuleType,
//         target_column: formRule.target_column,
//         value: finalValue,
//         points: finalPoints,
//       },
//     ]);

//     if (!error) {
//       setFormRule({ category_id: "", rule_type: "exact_match", target_column: "", value: "", points: "" });
//       setIsEducationCategory(false);
//       fetchRules();
//     }
//   };

//   const deleteConfig = async (id) => {
//     if (window.confirm("Are you sure? All related rules will also be deleted.")) {
//       const { error } = await supabase.from("scoring_config").delete().eq("id", id);
//       if (!error) fetchConfigs();
//     }
//   };

//   const deleteRule = async (id) => {
//     if (window.confirm("Are you sure you want to delete this rule?")) {
//       const { error } = await supabase.from("scoring_rules").delete().eq("id", id);
//       if (!error) fetchRules();
//     }
//   };

//   const handleEducationPointsAutoCalc = (type, categoryId) => {
//     const selectedConfig = configs.find(c => c.id === categoryId);
//     if (!selectedConfig) return;

//     const maxWeight = Number(selectedConfig.weight);
//     let points = 0;

//     if (type === "Bachelor") points = maxWeight * 0.50;
//     if (type === "Master") points = maxWeight * 0.75;
//     if (type === "Doctoral") points = maxWeight * 1.00;

//     setFormRule(prev => ({
//       ...prev,
//       value: type,
//       points: points.toFixed(2)
//     }));
//   };

//   return (
//     <div className="container mt-4 mb-5">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2 className="fw-bold text-dark">CMS Skill Scoring Metrics</h2>
//         <Badge bg="primary" className="p-2">Master Metric Cap: 100%</Badge>
//       </div>

//       <Card className="shadow-sm border-0 mb-4 bg-light">
//         <Card.Body>
//           <div className="d-flex justify-content-between align-items-center mb-2">
//             <span className="fw-bold">Overall Weights Distribution Tracker</span>
//             <span className={`fw-bold ${totalCategoryWeight > 100 ? "text-danger" : "text-success"}`}>
//               {totalCategoryWeight} / 100%
//             </span>
//           </div>
//           <ProgressBar 
//             now={totalCategoryWeight}
//             variant={totalCategoryWeight > 100 ? "danger" : totalCategoryWeight === 100 ? "success" : "info"} 
//             animated={totalCategoryWeight < 100}
//             style={{ height: "12px" }}
//           />
//         </Card.Body>
//       </Card>

//       <Row className="g-4">
//         <Col md={6}>
//           <Card className="p-3 shadow-sm h-100 border-0">
//             <h5 className="fw-bold text-secondary mb-3">Add Scoring Category</h5>
//             <Form onSubmit={handleConfigSubmit}>

//               <Form.Group className="mb-2">
//                 <Form.Label className="small fw-bold">Category Name</Form.Label>
//                 <Form.Select value={formConfig.category} onChange={(e) => setFormConfig({ ...formConfig, category: e.target.value })} required >
//                   <option value="">Select Category</option>
//                   <option value="Educational Attainment">Educational Attainment</option>
//                   <option value="Seminar">Seminar</option>
//                   <option value="Training/Workshop">Training/Workshop</option>
//                   <option value="Industry Certification">Industry Certification</option>
//                   <option value="Publication">Publication</option>
//                 </Form.Select>
//               </Form.Group>

//               <Form.Group className="mb-2">
//                 <Form.Label className="small fw-bold">Source Table</Form.Label>
//                 <Form.Select value={formConfig.source_table} onChange={(e) => setFormConfig({ ...formConfig, source_table: e.target.value })} required >
//                   <option value="">Select Source</option>
//                   <option value="educational_attainment">Educational Attainment</option>
//                   <option value="certifications">Certifications</option>
//                   <option value="publications">Publications</option>
//                 </Form.Select>
//               </Form.Group>

//               <Form.Group className="mb-2">
//                 <Form.Label className="small fw-bold">Category Weight (%)</Form.Label>
//                 <Form.Control type="number" value={formConfig.weight} onChange={(e) => setFormConfig({ ...formConfig, weight: e.target.value })} required />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Label className="small fw-bold">Item Point Ceiling (Max Score per Cert)</Form.Label>
//                 <Form.Control type="number" value={formConfig.max_score} onChange={(e) => setFormConfig({ ...formConfig, max_score: e.target.value })} required />
//               </Form.Group>
//               <Button variant="primary" type="submit" className="mt-3 w-100" disabled={totalCategoryWeight >= 100}>Add Category</Button>
//             </Form>
//           </Card>
//         </Col>

//         <Col md={6}>
//           <Card className="p-3 shadow-sm h-100 border-0">
//             <h5 className="fw-bold text-secondary mb-3">Add Scoring Rule</h5>
//             <Form onSubmit={handleRuleSubmit}>
//               <Form.Group className="mb-2">
//                 <Form.Label className="small fw-bold">Target Category</Form.Label>
//                 <Form.Select value={formRule.category_id} onChange={(e) => {
//                     const selectedCatId = e.target.value;
//                     const selectedConfig = configs.find(c => c.id === selectedCatId);
//                     let targetColumn = "";
//                     let isEdu = false;
//                     if (selectedConfig) {
//                       if (selectedConfig.source_table === "educational_attainment") { targetColumn = "degree"; isEdu = true; }
//                       else if (selectedConfig.source_table === "certifications") targetColumn = "type_of_certification";
//                       else if (selectedConfig.source_table === "publications") targetColumn = "indexing";
//                     }
//                     setFormRule({ ...formRule, category_id: selectedCatId, target_column: targetColumn, value: "", points: "" });
//                     setIsEducationCategory(isEdu);
//                 }} required>
//                   <option value="">Select Category</option>
//                   {configs.map((c) => <option key={c.id} value={c.id}>{c.category}</option>)}
//                 </Form.Select>
//               </Form.Group>

//               {!isEducationCategory && (
//                 <Form.Group className="mb-2">
//                   <Form.Label className="small fw-bold">Scoring Method</Form.Label>
//                   <Form.Select value={formRule.rule_type} onChange={(e) => setFormRule({ ...formRule, rule_type: e.target.value })} required>
//                     <option value="exact_match">Flat Rate (Points per Match)</option>
//                     <option value="per_hour">Hourly Rate (Points x Hours)</option>
//                   </Form.Select>
//                 </Form.Group>
//               )}

//               {isEducationCategory && (
//                 <Form.Group className="mb-2">
//                   <Form.Label className="small fw-bold">Educational Degree Type</Form.Label>
//                   <Form.Select onChange={(e) => handleEducationPointsAutoCalc(e.target.value, formRule.category_id)} required>
//                     <option value="">Select Degree Type</option>
//                     <option value="Bachelor">Bachelor's</option>
//                     <option value="Master">Master's</option>
//                     <option value="Doctoral">Doctorate</option>
//                   </Form.Select>
//                 </Form.Group>
//               )}

//               <Form.Group className="mb-2">
//                 <Form.Label className="small fw-bold">Value to Match</Form.Label>
//                 <Form.Select value={formRule.value} onChange={(e) => setFormRule({ ...formRule, value: e.target.value })} required disabled={isEducationCategory}>
//                   <option value="">Select Match Value</option>
//                   <option value="Scopus">Scopus</option>
//                   <option value="Seminar">Seminar</option>
//                   <option value="Training">Training</option>
//                   <option value="Industry Certification">Industry Certification</option>
//                   <option value="Bachelor">Bachelor</option>
//                   <option value="Master">Master</option>
//                   <option value="Doctoral">Doctoral</option>
//                 </Form.Select>
//               </Form.Group>

//               <Form.Group className="mb-2">
//                 <Form.Label className="small fw-bold">{formRule.rule_type === 'per_hour' ? "Points per Hour" : "Points to Award"}</Form.Label>
//                 <Form.Control type="number" step="0.01" value={formRule.points} onChange={(e) => setFormRule({ ...formRule, points: e.target.value })} required disabled={isEducationCategory} />
//               </Form.Group>

//               <Button variant="primary" type="submit" className="mt-3 w-100" disabled={configs.length === 0}>Add Rule</Button>
//             </Form>
//           </Card>
//         </Col>
//       </Row>

//       <Card className="mt-4 shadow-sm p-3 border-0">
//         <h5 className="fw-bold text-secondary mb-3">Scoring Categories Registry</h5>
//         <Table striped bordered hover responsive size="sm">
//           <thead className="table-light"><tr className="small"><th>Category</th><th>Source</th><th>Weight</th><th>Item Ceiling</th><th>Action</th></tr></thead>
//           <tbody>{configs.map((c) => (<tr key={c.id}><td>{c.category}</td><td><code>{c.source_table}</code></td><td>{c.weight}%</td><td>{c.max_score}</td><td><Button variant="outline-danger" size="sm" onClick={() => deleteConfig(c.id)}>Delete</Button></td></tr>))}</tbody>
//         </Table>
//       </Card>

//       <Card className="mt-4 shadow-sm p-3 border-0">
//         <h5 className="fw-bold text-secondary mb-3">Established Scoring Rules Registry</h5>
//         <Table striped bordered hover responsive size="sm">
//           <thead className="table-light"><tr className="small"><th>Category</th><th>Condition</th><th>Type</th><th>Payout</th><th>Action</th></tr></thead>
//           <tbody>{rules.map((r) => (<tr key={r.id}><td>{r.scoring_config?.category}</td><td>{r.target_column} = {r.value}</td><td><Badge bg="secondary">{r.rule_type}</Badge></td><td>{r.points} pts</td><td><Button variant="outline-danger" size="sm" onClick={() => deleteRule(r.id)}>Delete</Button></td></tr>))}</tbody>
//         </Table>
//       </Card>
//     </div>
//   );
// }


// -----------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Card, Form, Button, Table, Row, Col, Badge, ProgressBar } from "react-bootstrap";

// Mapping definition for automatic selection
const categoryToTableMap = {
  "Educational Attainment": "educational_attainment",
  "Seminar": "certifications",
  "Training/Workshop": "certifications",
  "Industry Certification": "certifications",
  "Publication": "publications",
};

export default function ScoringConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [rules, setRules] = useState([]);

  const [formConfig, setFormConfig] = useState({
    category: "",
    weight: "",
    max_score: "",
    source_table: "",
  });

  const [formRule, setFormRule] = useState({
    category_id: "",
    rule_type: "exact_match",
    target_column: "",
    value: "",
    points: "",
  });

  const [isEducationCategory, setIsEducationCategory] = useState(false);

  useEffect(() => {
    fetchConfigs();
    fetchRules();
  }, []);

  const fetchConfigs = async () => {
    const { data, error } = await supabase
      .from("scoring_config")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setConfigs(data);
  };

  const fetchRules = async () => {
    const { data, error } = await supabase
      .from("scoring_rules")
      .select(`*, scoring_config(category)`);
    if (!error) setRules(data);
  };

  const totalCategoryWeight = configs.reduce((sum, config) => sum + Number(config.weight || 0), 0);

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    const newWeight = Number(formConfig.weight);

    if (totalCategoryWeight + newWeight > 100) {
      alert(`Cannot add category. Pushes total weights to ${totalCategoryWeight + newWeight}%, exceeding the 100% limit.`);
      return;
    }

    const { error } = await supabase.from("scoring_config").insert([
      {
        category: formConfig.category,
        weight: newWeight,
        max_score: Number(formConfig.max_score),
        source_table: formConfig.source_table,
      },
    ]);

    if (!error) {
      setFormConfig({ category: "", weight: "", max_score: "", source_table: "" });
      fetchConfigs();
    }
  };

  const handleRuleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("scoring_rules").insert([
      {
        category_id: formRule.category_id,
        rule_type: formRule.rule_type,
        target_column: formRule.target_column,
        value: formRule.value,
        points: Number(formRule.points),
      },
    ]);

    if (!error) {
      setFormRule({ category_id: "", rule_type: "exact_match", target_column: "", value: "", points: "" });
      setIsEducationCategory(false);
      fetchRules();
    }
  };

  const deleteConfig = async (id) => {
    if (window.confirm("Are you sure? All related rules will also be deleted.")) {
      const { error } = await supabase.from("scoring_config").delete().eq("id", id);
      if (!error) fetchConfigs();
    }
  };

  const deleteRule = async (id) => {
    if (window.confirm("Are you sure you want to delete this rule?")) {
      const { error } = await supabase.from("scoring_rules").delete().eq("id", id);
      if (!error) fetchRules();
    }
  };

  const handleEducationPointsAutoCalc = (type, categoryId) => {
    const selectedConfig = configs.find((c) => c.id === categoryId);
    if (!selectedConfig) return;

    const maxWeight = Number(selectedConfig.weight);
    let points = 0;

    if (type === "Bachelor") points = maxWeight * 0.5;
    if (type === "Master") points = maxWeight * 0.75;
    if (type === "Doctoral") points = maxWeight * 1.0;

    setFormRule((prev) => ({
      ...prev,
      value: type,
      points: points.toFixed(2),
    }));
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">CMS Skill Scoring Metrics</h2>
        <Badge bg="primary" className="p-2">Master Metric Cap: 100%</Badge>
      </div>

      <Card className="shadow-sm border-0 mb-4 bg-light">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">Overall Weights Distribution Tracker</span>
            <span className={`fw-bold ${totalCategoryWeight > 100 ? "text-danger" : "text-success"}`}>
              {totalCategoryWeight} / 100%
            </span>
          </div>
          <ProgressBar
            now={totalCategoryWeight}
            variant={totalCategoryWeight > 100 ? "danger" : totalCategoryWeight === 100 ? "success" : "info"}
            animated={totalCategoryWeight < 100}
            style={{ height: "12px" }}
          />
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col md={6}>
          <Card className="p-3 shadow-sm h-100 border-0">
            <h5 className="fw-bold text-secondary mb-3">Add Scoring Category</h5>
            <Form onSubmit={handleConfigSubmit}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Category Name</Form.Label>
                <Form.Select
                  value={formConfig.category}
                  onChange={(e) => {
                    const selectedCat = e.target.value;
                    setFormConfig({
                      ...formConfig,
                      category: selectedCat,
                      source_table: categoryToTableMap[selectedCat] || "",
                    });
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Educational Attainment">Educational Attainment</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Training/Workshop">Training/Workshop</option>
                  <option value="Industry Certification">Industry Certification</option>
                  <option value="Publication">Publication</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Category Weight (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={formConfig.weight}
                  onChange={(e) => setFormConfig({ ...formConfig, weight: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Item Point Ceiling (Max Score per Cert)</Form.Label>
                <Form.Control
                  type="number"
                  value={formConfig.max_score}
                  onChange={(e) => setFormConfig({ ...formConfig, max_score: e.target.value })}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3 w-100" disabled={totalCategoryWeight >= 100}>
                Add Category
              </Button>
            </Form>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="p-3 shadow-sm h-100 border-0">
            <h5 className="fw-bold text-secondary mb-3">Add Scoring Rule</h5>
            <Form onSubmit={handleRuleSubmit}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Target Category</Form.Label>
                <Form.Select
                  value={formRule.category_id}
                  onChange={(e) => {
                    const selectedCatId = e.target.value;
                    const config = configs.find((c) => c.id === selectedCatId);
                    
                    let ruleType = "exact_match";
                    let targetCol = "";
                    let val = "";
                    let isEdu = false;

                    if (config) {
                      if (config.category === "Educational Attainment") {
                        targetCol = "degree";
                        isEdu = true;
                      } else if (config.category === "Seminar") {
                        ruleType = "per_hour";
                        targetCol = "type_of_certification";
                        val = "Seminar";
                      } else if (config.category === "Training/Workshop") {
                        targetCol = "type_of_certification";
                        val = "Training";
                      } else if (config.category === "Industry Certification") {
                        targetCol = "type_of_certification";
                        val = "Industry Certification";
                      } else if (config.category === "Publication") {
                        targetCol = "indexing";
                        val = "Scopus";
                      }
                    }

                    setFormRule({
                      ...formRule,
                      category_id: selectedCatId,
                      rule_type: ruleType,
                      target_column: targetCol,
                      value: val,
                      points: isEdu ? "" : formRule.points,
                    });
                    setIsEducationCategory(isEdu);
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  {configs.map((c) => (
                    <option key={c.id} value={c.id}>{c.category}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {isEducationCategory && (
                <>
                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">Educational Degree Type</Form.Label>
                    <Form.Select
                      onChange={(e) => handleEducationPointsAutoCalc(e.target.value, formRule.category_id)}
                      required
                    >
                      <option value="">Select Degree Type</option>
                      <option value="Bachelor">Bachelor's</option>
                      <option value="Master">Master's</option>
                      <option value="Doctoral">Doctorate</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">Value to Match</Form.Label>
                    <Form.Control type="text" value={formRule.value} readOnly disabled />
                  </Form.Group>
                </>
              )}

              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">
                  {formRule.rule_type === "per_hour" ? "Points per Hour" : "Points to Award"}
                </Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formRule.points}
                  onChange={(e) => setFormRule({ ...formRule, points: e.target.value })}
                  required
                  disabled={isEducationCategory}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="mt-3 w-100" disabled={configs.length === 0}>
                Add Rule
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4 shadow-sm p-3 border-0">
        <h5 className="fw-bold text-secondary mb-3">Scoring Categories Registry</h5>
        <Table striped bordered hover responsive size="sm">
          <thead className="table-light">
            <tr className="small">
              <th>Category</th>
              <th>Source</th>
              <th>Weight</th>
              <th>Item Ceiling</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((c) => (
              <tr key={c.id}>
                <td>{c.category}</td>
                <td><code>{c.source_table}</code></td>
                <td>{c.weight}%</td>
                <td>{c.max_score}</td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => deleteConfig(c.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card className="mt-4 shadow-sm p-3 border-0">
        <h5 className="fw-bold text-secondary mb-3">Established Scoring Rules Registry</h5>
        <Table striped bordered hover responsive size="sm">
          <thead className="table-light">
            <tr className="small">
              <th>Category</th>
              <th>Condition</th>
              <th>Type</th>
              <th>Payout</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td>{r.scoring_config?.category}</td>
                <td>{r.target_column} = {r.value}</td>
                <td><Badge bg="secondary">{r.rule_type}</Badge></td>
                <td>{r.points} pts</td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => deleteRule(r.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}