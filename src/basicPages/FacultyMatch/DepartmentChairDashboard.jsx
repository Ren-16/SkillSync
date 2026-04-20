// import React, { useState, useEffect } from "react";
// import { supabase } from "../../supabaseClient";
// import { Container, Table, Form, Button, Spinner, ProgressBar, Card, Row, Col, Badge } from "react-bootstrap";

// export default function ProgramChairDashboard() {
//   const [results, setResults] = useState([]);
//   const [facultyList, setFacultyList] = useState([]);
//   const [skillCategories, setSkillCategories] = useState([]); // Restored state
//   const [allSkills, setAllSkills] = useState([]);
//   const [configs, setConfigs] = useState([]);
  
//   const [selectedFaculty, setSelectedFaculty] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState(""); // Restored state
//   const [selectedSkill, setSelectedSkill] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [chairInfo, setChairInfo] = useState(null);

//   useEffect(() => {
//     const initializeDashboard = async () => {
//       setLoading(true);
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) return;

//       const { data: profile } = await supabase
//         .from("profiles")
//         .select("id, department_id, departments(name)")
//         .eq("id", user.id)
//         .single();
      
//       setChairInfo(profile);

//       if (profile?.department_id) {
//         const [faculties, categories, configsData] = await Promise.all([
//           fetchDepartmentFaculty(profile.department_id),
//           fetchSkillCategories(), // Restored fetch
//           fetchScoringConfigs(),
//           fetchSkillsList()
//         ]);

//         await fetchAndCalculate(faculties, configsData);
//       }
//       setLoading(false);
//     };
//     initializeDashboard();
//   }, []);

//   const fetchDepartmentFaculty = async (deptId) => {
//     const { data } = await supabase
//       .from("profiles")
//       .select("id, first_name, last_name")
//       .eq("department_id", deptId)
//       .in("role", ["faculty", "chair"]);
//     if (data) {
//       setFacultyList(data);
//       return data;
//     }
//     return [];
//   };

//   // Restored Category Fetch
//   const fetchSkillCategories = async () => {
//     const { data } = await supabase.from("skill_category").select("*").order("skill_category");
//     if (data) setSkillCategories(data);
//     return data;
//   };

//   const fetchSkillsList = async () => {
//     const { data } = await supabase.from("skills").select("id, skill_name, category_id").order("skill_name");
//     if (data) setAllSkills(data);
//     return data;
//   };

//   const fetchScoringConfigs = async () => {
//     const { data } = await supabase.from("scoring_config").select("*").order("created_at");
//     const configData = data || [];
//     setConfigs(configData);
//     return configData;
//   };

//   const fetchAndCalculate = async (passedFaculty = null, passedConfigs = null) => {
//     setLoading(true);
//     try {
//       const activeFacultyList = passedFaculty || facultyList;
//       const activeConfigs = passedConfigs || configs;

//       if (activeFacultyList.length === 0) {
//         setLoading(false);
//         return;
//       }

//       const { data: rulesData } = await supabase.from("scoring_rules").select("*");
//       const facultyIds = selectedFaculty ? [selectedFaculty] : activeFacultyList.map(f => f.id);

//       const [eduRes, certsRes, pubsRes, skillsRes] = await Promise.all([
//         supabase.from("educational_attainment").select("*, educational_skills(skill_id)").in("user_id", facultyIds),
//         supabase.from("certifications").select("*, certifications_skills(skill_id)").in("user_id", facultyIds),
//         supabase.from("publications").select("*, publications_skills(skill_id)").in("user_id", facultyIds),
//         supabase.from("skills").select("*")
//       ]);

//       // Updated Logic: Filter skills by Category OR specific Skill selection
//       let skillsToProcess = skillsRes.data || [];
//       if (selectedCategory) {
//         skillsToProcess = skillsToProcess.filter(s => s.category_id === selectedCategory);
//       }
//       if (selectedSkill) {
//         skillsToProcess = skillsToProcess.filter(s => s.id === selectedSkill);
//       }

//       const reportData = [];

//       facultyIds.forEach(fId => {
//         const facultyMember = activeFacultyList.find(f => f.id === fId);
//         if (!facultyMember) return;
        
//         skillsToProcess.forEach(skill => {
//           let totalScore = 0;
//           let categoryScores = {};

//           activeConfigs.forEach(config => {
//             let catTotalScore = 0;
//             let highestEduScore = 0;
//             const catRules = (rulesData || []).filter(r => r.category_id === config.id);
            
//             const tableData = (
//               config.source_table === "educational_attainment" ? eduRes.data : 
//               config.source_table === "certifications" ? certsRes.data : 
//               pubsRes.data
//             ).filter(item => item.user_id === fId);

//             const relevantItems = tableData.filter(item => {
//               const junctions = item.educational_skills || item.certifications_skills || item.publications_skills || [];
//               return junctions.some(s => s.skill_id === skill.id);
//             });

//             relevantItems.forEach(item => {
//               let itemScore = 0;
//               catRules.forEach(rule => {
//                 const itemVal = item[rule.target_column];
//                 if (!itemVal) return;
//                 const normItemVal = String(itemVal).toLowerCase().trim();
//                 const normRuleVal = String(rule.value).toLowerCase().trim();

//                 if (rule.rule_type === "exact_match" && normItemVal === normRuleVal) {
//                   itemScore += Number(rule.points);
//                 } else if (rule.rule_type === "per_hour" && normItemVal === normRuleVal) {
//                   itemScore += (Number(item.num_of_hrs || 0) * Number(rule.points));
//                 }
//               });

//               if (config.source_table === "educational_attainment") {
//                 highestEduScore = Math.max(highestEduScore, itemScore);
//               } else {
//                 catTotalScore += Math.min(itemScore, Number(config.max_score));
//               }
//             });

//             if (config.source_table === "educational_attainment") catTotalScore = highestEduScore;
//             catTotalScore = Math.min(catTotalScore, Number(config.weight));
            
//             categoryScores[config.category] = catTotalScore;
//             totalScore += catTotalScore;
//           });

//           if (totalScore > 0 || selectedSkill || selectedFaculty || selectedCategory) {
//             reportData.push({
//               id: `${fId}-${skill.id}`,
//               facultyName: `${facultyMember.first_name} ${facultyMember.last_name}`,
//               skillName: skill.skill_name,
//               categoryScores,
//               totalScore
//             });
//           }
//         });
//       });

//       setResults(reportData.sort((a, b) => b.totalScore - a.totalScore));
//     } catch (err) {
//       console.error("Calculation Error:", err);
//     }
//     setLoading(false);
//   };

//   const getScoreColor = (s) => (s >= 80 ? "success" : s >= 50 ? "info" : "warning");

//   return (
//     <Container className="py-4">
//       <Card className="mb-4 border-0 shadow-sm bg-dark text-white">
//         <Card.Body className="d-flex justify-content-between align-items-center">
//           <div>
//             <h3 className="fw-bold mb-0">Program Chair Analytics</h3>
//             <p className="mb-0 text-info small">Department: {chairInfo?.departments?.name || "Detecting..."}</p>
//           </div>
//           {loading && <Spinner animation="border" variant="info" size="sm" />}
//         </Card.Body>
//       </Card>

//       <Row className="mb-4 g-3">
//         {/* Faculty Filter */}
//         <Col md={3}>
//           <Form.Group>
//             <Form.Label className="small fw-bold">Faculty Member</Form.Label>
//             <Form.Select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)}>
//               <option value="">All Faculty</option>
//               {facultyList.map(f => (
//                 <option key={f.id} value={f.id}>
//                   {f.first_name} {f.last_name} {f.id === chairInfo?.id ? "(You)" : ""}
//                 </option>
//               ))}
//             </Form.Select>
//           </Form.Group>
//         </Col>
        
//         {/* RESTORED: Skill Category Filter */}
//         <Col md={3}>
//           <Form.Group>
//             <Form.Label className="small fw-bold">Skill Category</Form.Label>
//             <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
//               <option value="">All Categories</option>
//               {skillCategories.map(cat => (
//                 <option key={cat.category_id} value={cat.category_id}>{cat.skill_category}</option>
//               ))}
//             </Form.Select>
//           </Form.Group>
//         </Col>
        
//         {/* Specific Skill Filter */}
//         <Col md={3}>
//           <Form.Group>
//             <Form.Label className="small fw-bold">Specific Skill</Form.Label>
//             <Form.Select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
//               <option value="">All Skills</option>
//               {allSkills
//                 .filter(s => !selectedCategory || s.category_id === selectedCategory) // Sub-filter skills based on category
//                 .map(s => (
//                   <option key={s.id} value={s.id}>{s.skill_name}</option>
//                 ))}
//             </Form.Select>
//           </Form.Group>
//         </Col>

//         <Col md={3} className="d-flex align-items-end">
//           <Button variant="primary" className="w-100 fw-bold" onClick={() => fetchAndCalculate()} disabled={loading}>
//             Generate Report
//           </Button>
//         </Col>
//       </Row>

//       <Card className="border-0 shadow-sm">
//         <Table responsive hover className="align-middle mb-0">
//           <thead className="bg-light">
//             <tr className="small text-uppercase fw-bold text-muted">
//               <th className="ps-3">Faculty</th>
//               <th>Skill Area</th>
//               {configs.map(c => <th key={c.id} className="text-center">{c.category}</th>)}
//               <th className="text-center" style={{ width: "180px" }}>Overall Proficiency</th>
//             </tr>
//           </thead>
//           <tbody>
//             {results.length === 0 ? (
//               <tr>
//                 <td colSpan={configs.length + 3} className="text-center py-5 text-muted">
//                   {loading ? "Calculating metrics..." : "No data found for the selected filters."}
//                 </td>
//               </tr>
//             ) : (
//               results.map(res => (
//                 <tr key={res.id}>
//                   <td className="ps-3 fw-bold">{res.facultyName}</td>
//                   <td><Badge bg="light" text="dark" className="border">{res.skillName}</Badge></td>
//                   {configs.map(c => (
//                     <td key={c.id} className="text-center small">
//                       {res.categoryScores[c.category]?.toFixed(1)}%
//                     </td>
//                   ))}
//                   <td className="px-3">
//                     <div className="d-flex justify-content-between x-small mb-1">
//                       <span className={`fw-bold text-${getScoreColor(res.totalScore)}`}>
//                         {res.totalScore.toFixed(1)}%
//                       </span>
//                     </div>
//                     <ProgressBar now={res.totalScore} variant={getScoreColor(res.totalScore)} style={{ height: "6px" }} />
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </Table>
//       </Card>
//     </Container>
//   );
// }

// ----------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------


import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Container, Table, Form, Button, Spinner, ProgressBar, Card, Row, Col, Badge } from "react-bootstrap";

export default function ProgramChairDashboard() {
  const [results, setResults] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [skillCategories, setSkillCategories] = useState([]); 
  const [allSkills, setAllSkills] = useState([]);
  const [configs, setConfigs] = useState([]);
  
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [chairInfo, setChairInfo] = useState(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, department_id, departments(name)")
        .eq("id", user.id)
        .single();
      
      setChairInfo(profile);

      if (profile?.department_id) {
        const [faculties, categories, configsData] = await Promise.all([
          fetchDepartmentFaculty(profile.department_id),
          fetchSkillCategories(),
          fetchScoringConfigs(),
          fetchSkillsList()
        ]);

        await fetchAndCalculate(faculties, configsData);
      }
      setLoading(false);
    };
    initializeDashboard();
  }, []);

  const fetchDepartmentFaculty = async (deptId) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("department_id", deptId)
      .in("role", ["faculty", "chair"]);
    if (data) {
      setFacultyList(data);
      return data;
    }
    return [];
  };

  const fetchSkillCategories = async () => {
    const { data } = await supabase.from("skill_category").select("*").order("skill_category");
    if (data) setSkillCategories(data);
    return data;
  };

  const fetchSkillsList = async () => {
    const { data } = await supabase.from("skills").select("id, skill_name, category_id").order("skill_name");
    if (data) setAllSkills(data);
    return data;
  };

  const fetchScoringConfigs = async () => {
    const { data } = await supabase.from("scoring_config").select("*").order("created_at");
    const configData = data || [];
    setConfigs(configData);
    return configData;
  };

  const fetchAndCalculate = async (passedFaculty = null, passedConfigs = null) => {
    setLoading(true);
    try {
      const activeFacultyList = passedFaculty || facultyList;
      const activeConfigs = passedConfigs || configs;

      if (activeFacultyList.length === 0) {
        setLoading(false);
        return;
      }

      const { data: rulesData } = await supabase.from("scoring_rules").select("*");
      const facultyIds = selectedFaculty ? [selectedFaculty] : activeFacultyList.map(f => f.id);

      const [eduRes, certsRes, pubsRes, skillsRes] = await Promise.all([
        supabase.from("educational_attainment").select("*, educational_skills(skill_id)").in("user_id", facultyIds),
        supabase.from("certifications").select("*, certifications_skills(skill_id)").in("user_id", facultyIds),
        supabase.from("publications").select("*, publications_skills(skill_id)").in("user_id", facultyIds),
        supabase.from("skills").select("*")
      ]);

      let skillsToProcess = skillsRes.data || [];
      if (selectedCategory) {
        skillsToProcess = skillsToProcess.filter(s => s.category_id === selectedCategory);
      }
      if (selectedSkill) {
        skillsToProcess = skillsToProcess.filter(s => s.id === selectedSkill);
      }

      const reportData = [];

      facultyIds.forEach(fId => {
        const facultyMember = activeFacultyList.find(f => f.id === fId);
        if (!facultyMember) return;
        
        skillsToProcess.forEach(skill => {
          let totalScore = 0;
          let categoryScores = {};

          activeConfigs.forEach(config => {
            let catTotalScore = 0;
            let highestEduScore = 0;
            const catRules = (rulesData || []).filter(r => r.category_id === config.id);
            
            const tableData = (
              config.source_table === "educational_attainment" ? eduRes.data : 
              config.source_table === "certifications" ? certsRes.data : 
              pubsRes.data
            ).filter(item => item.user_id === fId);

            const relevantItems = tableData.filter(item => {
              const junctions = item.educational_skills || item.certifications_skills || item.publications_skills || [];
              return junctions.some(s => s.skill_id === skill.id);
            });

            relevantItems.forEach(item => {
              let itemScore = 0;
              catRules.forEach(rule => {
                const itemVal = item[rule.target_column];
                if (!itemVal) return;
                const normItemVal = String(itemVal).toLowerCase().trim();
                const normRuleVal = String(rule.value).toLowerCase().trim();

                if (rule.rule_type === "exact_match" && normItemVal === normRuleVal) {
                  itemScore += Number(rule.points);
                } else if (rule.rule_type === "per_hour" && normItemVal === normRuleVal) {
                  itemScore += (Number(item.num_of_hrs || 0) * Number(rule.points));
                } 
                // Restore Publication "None" fallback logic
                else if (config.source_table === "publications" && normItemVal === "none") {
                  itemScore += Number(rule.points) / 2;
                }
              });

              if (config.source_table === "educational_attainment") {
                highestEduScore = Math.max(highestEduScore, itemScore);
              } else {
                catTotalScore += Math.min(itemScore, Number(config.max_score));
              }
            });

            if (config.source_table === "educational_attainment") catTotalScore = highestEduScore;
            catTotalScore = Math.min(catTotalScore, Number(config.weight));
            
            categoryScores[config.category] = catTotalScore;
            totalScore += catTotalScore;
          });

          if (totalScore > 0 || selectedSkill || selectedFaculty || selectedCategory) {
            reportData.push({
              id: `${fId}-${skill.id}`,
              facultyName: `${facultyMember.first_name} ${facultyMember.last_name}`,
              skillName: skill.skill_name,
              categoryScores,
              totalScore
            });
          }
        });
      });

      setResults(reportData.sort((a, b) => b.totalScore - a.totalScore));
    } catch (err) {
      console.error("Calculation Error:", err);
    }
    setLoading(false);
  };

  const getScoreColor = (s) => (s >= 80 ? "success" : s >= 50 ? "info" : "warning");

  return (
    <Container className="py-4">
      <Card className="mb-4 border-0 shadow-sm bg-dark text-white">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="fw-bold mb-0">Program Chair Analytics</h3>
            <p className="mb-0 text-info small">Department: {chairInfo?.departments?.name || "Detecting..."}</p>
          </div>
          {loading && <Spinner animation="border" variant="info" size="sm" />}
        </Card.Body>
      </Card>

      <Row className="mb-4 g-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-bold">Faculty Member</Form.Label>
            <Form.Select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)}>
              <option value="">All Faculty</option>
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>
                  {f.first_name} {f.last_name} {f.id === chairInfo?.id ? "(You)" : ""}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-bold">Skill Category</Form.Label>
            <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {skillCategories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>{cat.skill_category}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-bold">Specific Skill</Form.Label>
            <Form.Select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
              <option value="">All Skills</option>
              {allSkills
                .filter(s => !selectedCategory || s.category_id === selectedCategory) 
                .map(s => (
                  <option key={s.id} value={s.id}>{s.skill_name}</option>
                ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3} className="d-flex align-items-end">
          <Button variant="primary" className="w-100 fw-bold" onClick={() => fetchAndCalculate()} disabled={loading}>
            Generate Report
          </Button>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Table responsive hover className="align-middle mb-0">
          <thead className="bg-light">
            <tr className="small text-uppercase fw-bold text-muted">
              <th className="ps-3">Faculty</th>
              <th>Skill Area</th>
              {configs.map(c => <th key={c.id} className="text-center">{c.category}</th>)}
              <th className="text-center" style={{ width: "180px" }}>Overall Proficiency</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={configs.length + 3} className="text-center py-5 text-muted">
                  {loading ? "Calculating metrics..." : "No data found for the selected filters."}
                </td>
              </tr>
            ) : (
              results.map(res => (
                <tr key={res.id}>
                  <td className="ps-3 fw-bold">{res.facultyName}</td>
                  <td><Badge bg="light" text="dark" className="border">{res.skillName}</Badge></td>
                  {configs.map(c => (
                    <td key={c.id} className="text-center small">
                      {res.categoryScores[c.category]?.toFixed(1)}%
                    </td>
                  ))}
                  <td className="px-3">
                    <div className="d-flex justify-content-between x-small mb-1">
                      <span className={`fw-bold text-${getScoreColor(res.totalScore)}`}>
                        {res.totalScore.toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar now={res.totalScore} variant={getScoreColor(res.totalScore)} style={{ height: "6px" }} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}