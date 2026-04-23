// import React, { useState, useEffect } from "react";
// import { supabase } from "../../supabaseClient";
// import { Container, Table, Form, Button, Spinner, ProgressBar, Card, Row, Col, Badge } from "react-bootstrap";

// export default function ProgramChairDashboard() {
//   const [results, setResults] = useState([]);
//   const [facultyList, setFacultyList] = useState([]);
//   const [skillCategories, setSkillCategories] = useState([]); 
//   const [allSkills, setAllSkills] = useState([]);
//   const [configs, setConfigs] = useState([]);
  
//   const [selectedFaculty, setSelectedFaculty] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState(""); 
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
//           fetchSkillCategories(),
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
//                 // Restore Publication "None" fallback logic
//                 else if (config.source_table === "publications" && normItemVal === "none") {
//                   itemScore += Number(rule.points) / 2;
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
        
//         <Col md={3}>
//           <Form.Group>
//             <Form.Label className="small fw-bold">Specific Skill</Form.Label>
//             <Form.Select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
//               <option value="">All Skills</option>
//               {allSkills
//                 .filter(s => !selectedCategory || s.category_id === selectedCategory) 
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


import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import {
  Container, Row, Col, Card, Form, Button,
  Spinner, Badge, ProgressBar, Alert, Tab, Tabs,
  OverlayTrigger, Tooltip,
} from "react-bootstrap";

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════ */
const DEFAULT_THRESHOLD = 50;   // % below which a faculty member is "at-risk"

/* ═══════════════════════════════════════════════════════════════════
   SMALL HELPERS
═══════════════════════════════════════════════════════════════════ */

/** Bootstrap colour variant based on score */
const scoreVariant = (s) => {
  if (s >= 80) return "success";
  if (s >= 50) return "info";
  if (s >= 25) return "warning";
  return "danger";
};

/** Text label for a score band */
const scoreLabel = (s) => {
  if (s >= 80) return "Highly Proficient";
  if (s >= 50) return "Proficient";
  if (s >= 25) return "Developing";
  if (s >  0 ) return "Needs Development";
  return "No Credentials";
};

/** Hex accent colour matched to variant */
const variantHex = (v) => ({
  success: "#198754",
  info:    "#0dcaf0",
  warning: "#ffc107",
  danger:  "#dc3545",
}[v] || "#6c757d");

/** Small circular badge showing a number */
const CountBadge = ({ value, bg = "secondary" }) => (
  <Badge
    bg={bg}
    className="rounded-circle d-inline-flex align-items-center justify-content-center"
    style={{ width: 26, height: 26, fontSize: "0.75rem" }}
  >
    {value}
  </Badge>
);

/* ═══════════════════════════════════════════════════════════════════
   SKILL GAP ANALYSIS MODULE  (formerly DepartmentChairDashboard)
═══════════════════════════════════════════════════════════════════ */
export default function SkillGapAnalysis() {

  /* ── data state ── */
  const [chairInfo,       setChairInfo]       = useState(null);
  const [facultyList,     setFacultyList]     = useState([]);
  const [skillCategories, setSkillCategories] = useState([]);
  const [allSkills,       setAllSkills]       = useState([]);
  const [configs,         setConfigs]         = useState([]);

  /* ── filter state ── */
  const [selectedFaculty,  setSelectedFaculty]  = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkill,    setSelectedSkill]     = useState("");
  const [threshold,        setThreshold]         = useState(DEFAULT_THRESHOLD);

  /* ── result state ── */
  const [allResults,    setAllResults]    = useState([]);   // full unfiltered matrix
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [activeTab,     setActiveTab]     = useState("summary");
  const [initialLoad,   setInitialLoad]   = useState(false);

  /* ═══════════════════════════════════════════════════════════════
     INITIALISATION
  ═══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const init = async () => {
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
        const [faculty, , configsData] = await Promise.all([
          fetchDepartmentFaculty(profile.department_id),
          fetchSkillCategories(),
          fetchScoringConfigs(),
          fetchSkillsList(),
        ]);
        await computeFullMatrix(faculty, configsData);
      }
      setInitialLoad(true);
      setLoading(false);
    };
    init();
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     DATA LOADERS
  ═══════════════════════════════════════════════════════════════ */
  const fetchDepartmentFaculty = async (deptId) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("department_id", deptId)
      .in("role", ["faculty", "chair"]);
    if (data) setFacultyList(data);
    return data || [];
  };

  const fetchSkillCategories = async () => {
    const { data } = await supabase
      .from("skill_category")
      .select("*")
      .order("skill_category");
    if (data) setSkillCategories(data);
  };

  const fetchSkillsList = async () => {
    const { data } = await supabase
      .from("skills")
      .select("id, skill_name, category_id")
      .order("skill_name");
    if (data) setAllSkills(data);
    return data || [];
  };

  const fetchScoringConfigs = async () => {
    const { data } = await supabase
      .from("scoring_config")
      .select("*")
      .order("created_at");
    const cfg = data || [];
    setConfigs(cfg);
    return cfg;
  };

  /* ═══════════════════════════════════════════════════════════════
     SCORING ENGINE
     Computes the full faculty × skill proficiency matrix.
     FIX #1: ALL faculty-skill pairs are included (no zero-score filter).
  ═══════════════════════════════════════════════════════════════ */
  const computeFullMatrix = useCallback(async (
    passedFaculty = null,
    passedConfigs = null,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const activeFaculty  = passedFaculty  || facultyList;
      const activeConfigs  = passedConfigs  || configs;

      if (!activeFaculty.length) { setLoading(false); return; }

      const { data: rulesData  } = await supabase.from("scoring_rules").select("*");
      const { data: skillsData } = await supabase.from("skills").select("*");

      const facultyIds = activeFaculty.map((f) => f.id);

      const [eduRes, certsRes, pubsRes] = await Promise.all([
        supabase.from("educational_attainment")
          .select("*, educational_skills(skill_id)").in("user_id", facultyIds),
        supabase.from("certifications")
          .select("*, certifications_skills(skill_id)").in("user_id", facultyIds),
        supabase.from("publications")
          .select("*, publications_skills(skill_id)").in("user_id", facultyIds),
      ]);

      const matrix = [];

      activeFaculty.forEach((member) => {
        (skillsData || []).forEach((skill) => {
          let totalScore = 0;
          const categoryScores = {};

          activeConfigs.forEach((config) => {
            let catScore        = 0;
            let highestEduScore = 0;

            const catRules  = (rulesData || []).filter((r) => r.category_id === config.id);
            const tableData = (
              config.source_table === "educational_attainment" ? eduRes.data  :
              config.source_table === "certifications"         ? certsRes.data :
              pubsRes.data
            ).filter((item) => item.user_id === member.id);

            const relevant = tableData.filter((item) => {
              const junctions =
                item.educational_skills    ||
                item.certifications_skills ||
                item.publications_skills   || [];
              return junctions.some((s) => s.skill_id === skill.id);
            });

            relevant.forEach((item) => {
              let itemScore = 0;
              catRules.forEach((rule) => {
                const itemVal = item[rule.target_column];
                if (!itemVal) return;
                const nItem = String(itemVal).toLowerCase().trim();
                const nRule = String(rule.value).toLowerCase().trim();

                if (rule.rule_type === "exact_match" && nItem === nRule) {
                  itemScore += Number(rule.points);
                } else if (rule.rule_type === "per_hour" && nItem === nRule) {
                  itemScore += Number(item.num_of_hrs || 0) * Number(rule.points);
                } else if (config.source_table === "publications" && nItem === "none") {
                  itemScore += Number(rule.points) / 2;
                }
              });

              if (config.source_table === "educational_attainment") {
                highestEduScore = Math.max(highestEduScore, itemScore);
              } else {
                catScore += Math.min(itemScore, Number(config.max_score));
              }
            });

            if (config.source_table === "educational_attainment") catScore = highestEduScore;
            catScore = Math.min(catScore, Number(config.weight));

            categoryScores[config.category] = catScore;
            totalScore += catScore;
          });

          /* ── FIX #1: push every row unconditionally ── */
          matrix.push({
            id:             `${member.id}-${skill.id}`,
            facultyId:      member.id,
            facultyName:    `${member.first_name} ${member.last_name}`,
            skillId:        skill.id,
            skillName:      skill.skill_name,
            categoryId:     skill.category_id,
            categoryScores,
            totalScore,
            /* FIX #2: pre-compute gap */
            gap:            parseFloat((100 - totalScore).toFixed(2)),
            hasCredentials: totalScore > 0,
          });
        });
      });

      setAllResults(matrix);
      setConfigs(activeConfigs);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
    setLoading(false);
  }, [facultyList, configs]);

  /* ═══════════════════════════════════════════════════════════════
     FILTER HELPERS
  ═══════════════════════════════════════════════════════════════ */
  const filteredResults = allResults.filter((row) => {
    if (selectedFaculty  && row.facultyId  !== selectedFaculty)  return false;
    if (selectedCategory && row.categoryId !== selectedCategory)  return false;
    if (selectedSkill    && row.skillId    !== selectedSkill)     return false;
    return true;
  });

  const filteredSkillList = selectedCategory
    ? allSkills.filter((s) => s.category_id === selectedCategory)
    : allSkills;

  /* ═══════════════════════════════════════════════════════════════
     DEPARTMENT SUMMARY  (FIX #3)
     For each unique skill in the current filtered view, aggregate:
       - average proficiency across all faculty
       - average gap
       - # faculty at or above threshold
       - # faculty below threshold but > 0
       - # faculty with zero credentials
  ═══════════════════════════════════════════════════════════════ */
  const buildSummary = () => {
    const skillMap = {};

    filteredResults.forEach((row) => {
      if (!skillMap[row.skillId]) {
        skillMap[row.skillId] = {
          skillId:       row.skillId,
          skillName:     row.skillName,
          rows:          [],
        };
      }
      skillMap[row.skillId].rows.push(row);
    });

    return Object.values(skillMap)
      .map(({ skillId, skillName, rows }) => {
        const n           = rows.length;
        const avgScore    = rows.reduce((s, r) => s + r.totalScore, 0) / n;
        const avgGap      = 100 - avgScore;
        const aboveThresh = rows.filter((r) => r.totalScore >= threshold).length;
        const belowThresh = rows.filter((r) => r.totalScore > 0 && r.totalScore < threshold).length;
        const noCredits   = rows.filter((r) => !r.hasCredentials).length;

        return {
          skillId, skillName, n,
          avgScore:    parseFloat(avgScore.toFixed(1)),
          avgGap:      parseFloat(avgGap.toFixed(1)),
          aboveThresh, belowThresh, noCredits,
          coverageRate: parseFloat(((aboveThresh / n) * 100).toFixed(0)),
        };
      })
      /* Sort weakest skills first — most useful for gap analysis */
      .sort((a, b) => a.avgScore - b.avgScore);
  };

  const summary = initialLoad ? buildSummary() : [];

  /* ── summary KPIs ── */
  const avgDeptScore  = summary.length
    ? summary.reduce((s, r) => s + r.avgScore, 0) / summary.length
    : 0;
  const criticalSkills = summary.filter((r) => r.avgScore < threshold).length;
  const noCredSkills   = summary.filter((r) => r.noCredits === r.n).length;

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <Container fluid className="py-4 px-4">

      {/* ── PAGE HEADER ── */}
      <Card className="mb-4 border-0 shadow-sm overflow-hidden" style={{ background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)" }}>
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col>
              <h3 className="fw-bold mb-1 text-white">Skill Gap Analysis</h3>
              <p className="mb-0 text-info small">
                Department: {chairInfo?.departments?.name || "Detecting…"}
              </p>
            </Col>
            <Col xs="auto" className="d-flex align-items-center gap-3">
              {loading && <Spinner animation="border" variant="info" size="sm" />}
              {/* FIX #4: Threshold control */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-white small fw-semibold text-nowrap">
                  Proficiency Threshold:
                </span>
                <Form.Select
                  size="sm"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  style={{ width: 90, background: "#374151", color: "#fff", border: "1px solid #6b7280" }}
                >
                  {[25, 50, 60, 75, 80].map((v) => (
                    <option key={v} value={v}>{v}%</option>
                  ))}
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {/* ── KPI CARDS ── */}
      {initialLoad && (
        <Row className="g-3 mb-4">
          {[
            {
              label:   "Avg. Dept. Proficiency",
              value:   `${avgDeptScore.toFixed(1)}%`,
              sub:     "across all skills",
              variant: scoreVariant(avgDeptScore),
              icon:    "📊",
            },
            {
              label:   "Skills Below Threshold",
              value:   criticalSkills,
              sub:     `below ${threshold}% average`,
              variant: criticalSkills > 0 ? "danger" : "success",
              icon:    "⚠️",
            },
            {
              label:   "Skills with No Coverage",
              value:   noCredSkills,
              sub:     "zero credentials dept-wide",
              variant: noCredSkills > 0 ? "warning" : "success",
              icon:    "🚫",
            },
            {
              label:   "Faculty Evaluated",
              value:   facultyList.length,
              sub:     "in your department",
              variant: "primary",
              icon:    "👥",
            },
          ].map((kpi) => (
            <Col md={3} sm={6} key={kpi.label}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <span className="text-muted small">{kpi.label}</span>
                    <span style={{ fontSize: "1.3rem" }}>{kpi.icon}</span>
                  </div>
                  <h3 className={`fw-bold mb-0 text-${kpi.variant}`}>{kpi.value}</h3>
                  <p className="text-muted small mb-0 mt-1">{kpi.sub}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ── FILTERS ── */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-end">
            <Col md={3}>
              <Form.Label className="small fw-bold mb-1">Faculty Member</Form.Label>
              <Form.Select
                size="sm"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
              >
                <option value="">All Faculty</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.first_name} {f.last_name}
                    {f.id === chairInfo?.id ? " (You)" : ""}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label className="small fw-bold mb-1">Skill Category</Form.Label>
              <Form.Select
                size="sm"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSkill("");
                }}
              >
                <option value="">All Categories</option>
                {skillCategories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.skill_category}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label className="small fw-bold mb-1">Specific Skill</Form.Label>
              <Form.Select
                size="sm"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                <option value="">All Skills</option>
                {filteredSkillList.map((s) => (
                  <option key={s.id} value={s.id}>{s.skill_name}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3} className="d-flex gap-2">
              <Button
                size="sm"
                variant="primary"
                className="fw-bold flex-grow-1"
                disabled={loading}
                onClick={() => computeFullMatrix()}
              >
                {loading
                  ? <><Spinner size="sm" animation="border" className="me-1" />Calculating…</>
                  : "Refresh Data"
                }
              </Button>
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => {
                  setSelectedFaculty("");
                  setSelectedCategory("");
                  setSelectedSkill("");
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── ACTIVE FILTER CHIPS ── */}
      {(selectedFaculty || selectedCategory || selectedSkill) && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          <span className="text-muted small fw-semibold align-self-center">Filtering by:</span>
          {selectedFaculty && (
            <Badge bg="primary" className="px-3 py-2 rounded-pill d-flex align-items-center gap-1">
              👤 {facultyList.find((f) => f.id === selectedFaculty)?.first_name}{" "}
              {facultyList.find((f) => f.id === selectedFaculty)?.last_name}
              <span
                style={{ cursor: "pointer", marginLeft: 4 }}
                onClick={() => setSelectedFaculty("")}
              >✕</span>
            </Badge>
          )}
          {selectedCategory && (
            <Badge bg="info" text="dark" className="px-3 py-2 rounded-pill d-flex align-items-center gap-1">
              📂 {skillCategories.find((c) => c.category_id === selectedCategory)?.skill_category}
              <span
                style={{ cursor: "pointer", marginLeft: 4 }}
                onClick={() => { setSelectedCategory(""); setSelectedSkill(""); }}
              >✕</span>
            </Badge>
          )}
          {selectedSkill && (
            <Badge bg="success" className="px-3 py-2 rounded-pill d-flex align-items-center gap-1">
              🎯 {allSkills.find((s) => s.id === selectedSkill)?.skill_name}
              <span
                style={{ cursor: "pointer", marginLeft: 4 }}
                onClick={() => setSelectedSkill("")}
              >✕</span>
            </Badge>
          )}
        </div>
      )}

      {/* ── MAIN TABS ── */}
      {initialLoad && (
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-0"
          variant="pills"
        >

          {/* ════════════════════════════════════════════
              TAB 1: DEPARTMENT SUMMARY (FIX #3)
          ════════════════════════════════════════════ */}
          <Tab
            eventKey="summary"
            title={
              <span className="px-2">
                📋 Department Overview
                {criticalSkills > 0 && (
                  <Badge bg="danger" pill className="ms-2">{criticalSkills}</Badge>
                )}
              </span>
            }
          >
            <Card className="border-0 shadow-sm rounded-top-0">
              <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                <div>
                  <h6 className="fw-bold mb-0">Skill-Level Gap Summary</h6>
                  <p className="text-muted small mb-0">
                    Sorted by average proficiency (weakest skills first). Threshold line set at{" "}
                    <strong>{threshold}%</strong>.
                  </p>
                </div>
                <Badge bg="secondary" className="px-3 py-2">
                  {summary.length} skill{summary.length !== 1 ? "s" : ""}
                </Badge>
              </Card.Header>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="small text-uppercase fw-bold text-muted">
                      <th className="ps-4">Skill</th>
                      <th className="text-center" style={{ width: 180 }}>
                        Avg. Proficiency
                        <div className="fw-normal text-lowercase" style={{ fontSize: "0.7rem" }}>
                          (department mean)
                        </div>
                      </th>
                      {/* FIX #2 in summary view */}
                      <th className="text-center" style={{ width: 140 }}>
                        Avg. Gap
                        <div className="fw-normal text-lowercase" style={{ fontSize: "0.7rem" }}>
                          (100 − proficiency)
                        </div>
                      </th>
                      <th className="text-center" style={{ width: 120 }}>
                        ✅ Above {threshold}%
                      </th>
                      <th className="text-center" style={{ width: 120 }}>
                        ⚠️ Below {threshold}%
                      </th>
                      <th className="text-center" style={{ width: 120 }}>
                        🚫 No Credentials
                      </th>
                      <th className="text-center" style={{ width: 140 }}>
                        Coverage Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          No data available. Ensure scoring rules are configured.
                        </td>
                      </tr>
                    ) : (
                      summary.map((row) => {
                        const variant = scoreVariant(row.avgScore);
                        const isCritical = row.avgScore < threshold;
                        return (
                          <tr
                            key={row.skillId}
                            style={isCritical ? { background: "#fff8f8" } : {}}
                          >
                            {/* Skill name with critical indicator */}
                            <td className="ps-4">
                              <div className="d-flex align-items-center gap-2">
                                {isCritical && (
                                  <OverlayTrigger
                                    overlay={
                                      <Tooltip>
                                        Avg. proficiency below {threshold}% threshold
                                      </Tooltip>
                                    }
                                  >
                                    <span style={{ color: "#dc3545", cursor: "help" }}>⚠️</span>
                                  </OverlayTrigger>
                                )}
                                <span className="fw-semibold">{row.skillName}</span>
                              </div>
                            </td>

                            {/* Avg proficiency + progress */}
                            <td className="px-3">
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className={`fw-bold small text-${variant}`}>
                                  {row.avgScore}%
                                </span>
                                <span className="text-muted small">{scoreLabel(row.avgScore)}</span>
                              </div>
                              {/* FIX #4: threshold marker on progress bar */}
                              <div className="position-relative">
                                <ProgressBar
                                  now={row.avgScore}
                                  variant={variant}
                                  style={{ height: 8 }}
                                />
                                {/* Threshold tick */}
                                <div
                                  style={{
                                    position: "absolute",
                                    top: -2,
                                    left: `${threshold}%`,
                                    width: 2,
                                    height: 12,
                                    background: "#1f2937",
                                    borderRadius: 1,
                                    transform: "translateX(-50%)",
                                  }}
                                />
                              </div>
                            </td>

                            {/* Avg gap — FIX #2 */}
                            <td className="text-center">
                              <span
                                className="fw-bold"
                                style={{ color: row.avgGap > 50 ? "#dc3545" : "#6c757d" }}
                              >
                                {row.avgGap.toFixed(1)}%
                              </span>
                            </td>

                            {/* Above threshold */}
                            <td className="text-center">
                              <CountBadge
                                value={row.aboveThresh}
                                bg={row.aboveThresh > 0 ? "success" : "light"}
                              />
                            </td>

                            {/* Below threshold */}
                            <td className="text-center">
                              <CountBadge
                                value={row.belowThresh}
                                bg={row.belowThresh > 0 ? "warning" : "light"}
                              />
                            </td>

                            {/* No credentials */}
                            <td className="text-center">
                              <CountBadge
                                value={row.noCredits}
                                bg={row.noCredits > 0 ? "danger" : "light"}
                              />
                            </td>

                            {/* Coverage rate */}
                            <td className="px-3">
                              <div className="d-flex align-items-center gap-2">
                                <ProgressBar
                                  now={row.coverageRate}
                                  variant={row.coverageRate >= 75 ? "success" : row.coverageRate >= 40 ? "warning" : "danger"}
                                  style={{ height: 8, flex: 1 }}
                                />
                                <span className="small fw-semibold text-muted" style={{ minWidth: 36 }}>
                                  {row.coverageRate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <Card.Footer className="bg-white border-top py-3">
                <div className="d-flex flex-wrap gap-4 small text-muted align-items-center">
                  <span className="fw-semibold">Legend:</span>
                  <span>✅ At or above {threshold}% threshold</span>
                  <span>⚠️ Has credentials but below threshold</span>
                  <span>🚫 No credentials tagged to this skill</span>
                  <span className="ms-auto fst-italic">
                    ▏ Vertical tick on bar = proficiency threshold ({threshold}%)
                  </span>
                </div>
              </Card.Footer>
            </Card>
          </Tab>

          {/* ════════════════════════════════════════════
              TAB 2: INDIVIDUAL FACULTY ANALYSIS
          ════════════════════════════════════════════ */}
          <Tab
            eventKey="individual"
            title={<span className="px-2">👤 Individual Analysis</span>}
          >
            <Card className="border-0 shadow-sm rounded-top-0">
              <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                <div>
                  <h6 className="fw-bold mb-0">Faculty Proficiency Detail</h6>
                  <p className="text-muted small mb-0">
                    All faculty shown. Rows with no credentials are dimmed but included.
                    Threshold line at <strong>{threshold}%</strong>.
                  </p>
                </div>
                <Badge bg="secondary" className="px-3 py-2">
                  {filteredResults.length} row{filteredResults.length !== 1 ? "s" : ""}
                </Badge>
              </Card.Header>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="small text-uppercase fw-bold text-muted">
                      <th className="ps-4">Faculty</th>
                      <th>Skill</th>
                      {configs.map((c) => (
                        <th key={c.id} className="text-center">
                          {c.category}
                          <div className="fw-normal text-lowercase" style={{ fontSize: "0.7rem" }}>
                            (max {c.weight}%)
                          </div>
                        </th>
                      ))}
                      {/* FIX #2: gap column */}
                      <th className="text-center" style={{ width: 90 }}>
                        Gap
                        <div className="fw-normal text-lowercase" style={{ fontSize: "0.7rem" }}>
                          to 100%
                        </div>
                      </th>
                      <th className="text-center" style={{ width: 200 }}>
                        Total Proficiency
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sort: has credentials first, then by totalScore desc */}
                    {[...filteredResults]
                      .sort((a, b) => {
                        if (a.hasCredentials !== b.hasCredentials)
                          return a.hasCredentials ? -1 : 1;
                        return b.totalScore - a.totalScore;
                      })
                      .map((row) => {
                        const variant     = scoreVariant(row.totalScore);
                        const belowThresh = row.hasCredentials && row.totalScore < threshold;

                        return (
                          <tr
                            key={row.id}
                            style={
                              !row.hasCredentials
                                ? { opacity: 0.45, background: "#fafafa" }
                                : belowThresh
                                ? { background: "#fffbf0" }
                                : {}
                            }
                          >
                            {/* Faculty */}
                            <td className="ps-4 fw-bold">{row.facultyName}</td>

                            {/* Skill */}
                            <td>
                              <Badge bg="light" text="dark" className="border px-2 py-1">
                                {row.skillName}
                              </Badge>
                              {belowThresh && (
                                <OverlayTrigger
                                  overlay={
                                    <Tooltip>
                                      Below {threshold}% proficiency threshold
                                    </Tooltip>
                                  }
                                >
                                  <span className="ms-2" style={{ cursor: "help" }}>⚠️</span>
                                </OverlayTrigger>
                              )}
                              {!row.hasCredentials && (
                                <Badge bg="light" text="danger" className="ms-2 border small">
                                  No credentials
                                </Badge>
                              )}
                            </td>

                            {/* Per-category scores */}
                            {configs.map((c) => (
                              <td key={c.id} className="text-center small text-muted">
                                {(row.categoryScores[c.category] || 0).toFixed(1)}%
                              </td>
                            ))}

                            {/* Gap column — FIX #2 */}
                            <td className="text-center">
                              <span
                                className="fw-bold small"
                                style={{
                                  color: row.gap > 75
                                    ? "#dc3545"
                                    : row.gap > 50
                                    ? "#fd7e14"
                                    : "#198754",
                                }}
                              >
                                {row.gap.toFixed(1)}%
                              </span>
                            </td>

                            {/* Total proficiency + threshold marker — FIX #4 */}
                            <td className="px-3">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className={`fw-bold small text-${variant}`}>
                                  {row.totalScore.toFixed(1)}%
                                </span>
                                <span
                                  className="small text-muted"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  {scoreLabel(row.totalScore)}
                                </span>
                              </div>
                              <div className="position-relative">
                                <ProgressBar
                                  now={row.totalScore}
                                  variant={variant}
                                  style={{ height: 8 }}
                                />
                                {/* Threshold tick */}
                                <div
                                  style={{
                                    position: "absolute",
                                    top: -2,
                                    left: `${threshold}%`,
                                    width: 2,
                                    height: 12,
                                    background: "#1f2937",
                                    borderRadius: 1,
                                    transform: "translateX(-50%)",
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {filteredResults.length === 0 && (
                      <tr>
                        <td
                          colSpan={configs.length + 4}
                          className="text-center py-5 text-muted"
                        >
                          {loading
                            ? "Calculating proficiency scores…"
                            : "No data found. Check that scoring rules are configured."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <Card.Footer className="bg-white border-top py-3">
                <div className="d-flex flex-wrap gap-4 small text-muted align-items-center">
                  {[
                    { colour: "#198754", label: "80–100%  Highly Proficient" },
                    { colour: "#0dcaf0", label: "50–79%   Proficient" },
                    { colour: "#ffc107", label: "25–49%   Developing" },
                    { colour: "#dc3545", label: "0–24%    Needs Development" },
                  ].map(({ colour, label }) => (
                    <span key={label}>
                      <span style={{ color: colour, fontWeight: 700 }}>■ </span>
                      {label}
                    </span>
                  ))}
                  <span className="ms-auto fst-italic">
                    ▏ Tick = {threshold}% threshold &nbsp;|&nbsp;
                    Dimmed rows = no credentials tagged
                  </span>
                </div>
              </Card.Footer>
            </Card>
          </Tab>

        </Tabs>
      )}

      {/* ── LOADING SKELETON (first load) ── */}
      {!initialLoad && loading && (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted mb-0">Loading faculty and computing proficiency scores…</p>
          </Card.Body>
        </Card>
      )}

    </Container>
  );
}
