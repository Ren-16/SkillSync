// import React, { useState, useEffect } from "react";
// import { supabase } from "../../supabaseClient";
// import { 
//   Container, Table, Form, Button, InputGroup, 
//   Spinner, Badge, ProgressBar, Card, Alert 
// } from "react-bootstrap";

// export default function Home() {
//   const [results, setResults] = useState([]);
//   const [skillsList, setSkillsList] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [configs, setConfigs] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [fullName, setFullName] = useState("");
//   const [userId, setUserId] = useState(null);

//   // 1. Get Logged-in User
//   useEffect(() => {
//     const getUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) setUserId(user.id);
//     };
//     getUser();
//   }, []);

//   // 2. Initial Data Loading
//   useEffect(() => {
//     if (!userId) return;
//     const loadInitialData = async () => {
//       setLoading(true);
//       await Promise.all([
//         fetchProfile(),
//         fetchCategories(),
//         fetchCoreDataAndCalculate("", null)
//       ]);
//       setLoading(false);
//     };
//     loadInitialData();
//   }, [userId]);

//   const fetchProfile = async () => {
//     const { data } = await supabase
//       .from("profiles")
//       .select("first_name, middle_name, last_name")
//       .eq("id", userId)
//       .single();

//     if (data) {
//       setFullName(`${data.first_name} ${data.middle_name ? data.middle_name + " " : ""}${data.last_name}`);
//     }
//   };

//   const fetchCategories = async () => {
//     const { data } = await supabase
//       .from("skill_category")
//       .select("category_id, skill_category")
//       .order("skill_category");

//     if (data) setCategories(data);
//   };

//   // 🧠 THE CALCULATION ENGINE
//   const fetchCoreDataAndCalculate = async (term = "", category = null) => {
//     try {
//       // A. Fetch CMS configurations & rules
//       const { data: configData } = await supabase.from("scoring_config").select("*").order("created_at");
//       const { data: rulesData } = await supabase.from("scoring_rules").select("*");
//       setConfigs(configData || []);

//       // B. Fetch skills based on search parameters
//       let skillsQuery = supabase.from("skills").select("*");
//       if (term) skillsQuery = skillsQuery.ilike("skill_name", `%${term}%`);
//       if (category) skillsQuery = skillsQuery.eq("category_id", category);
//       const { data: skillsData } = await skillsQuery;
//       setSkillsList(skillsData || []);

//       if (!skillsData || skillsData.length === 0) {
//         setResults([]);
//         return;
//       }

//       // C. Fetch raw educational, certification, and publication achievements
//       const [eduRes, certsRes, pubsRes] = await Promise.all([
//         supabase.from("educational_attainment").select("*, educational_skills(skill_id)").eq("user_id", userId),
//         supabase.from("certifications").select("*, certifications_skills(skill_id)").eq("user_id", userId),
//         supabase.from("publications").select("*, publications_skills(skill_id)").eq("user_id", userId),
//       ]);

//       const userData = {
//         educational_attainment: eduRes.data || [],
//         certifications: certsRes.data || [],
//         publications: pubsRes.data || [],
//         // Shorthand fallbacks if CMS maps shorthand tables
//         education: eduRes.data || [],
//         publication: pubsRes.data || []
//       };

//       // D. Map over skills and tally points
//       const calculatedResults = skillsData.map(skill => {
//         let totalScore = 0;
//         let categoryScores = {};

//         (configData || []).forEach(config => {
//           let catTotalScore = 0; 
//           const catRules = (rulesData || []).filter(r => r.category_id === config.id);
//           const tableData = userData[config.source_table] || [];

//           // Isolate items tagged to this skill
//           const relevantItems = tableData.filter(item => {
//             const skillJunctions = item.educational_skills || item.certifications_skills || item.publications_skills || [];
//             return skillJunctions.some(s => s.skill_id === skill.id);
//           });

//           relevantItems.forEach(item => {
//             let itemScore = 0; // Tally per item row

//             catRules.forEach(rule => {
//               const itemVal = item[rule.target_column];
//               if (!itemVal) return;

//               const normalizedItemVal = String(itemVal).toLowerCase().trim();
//               const normalizedRuleVal = String(rule.value).toLowerCase().trim();

//               // Rule Type 1: Exact String Matches (Doctoral, Master, Training etc.)
//               if (rule.rule_type === "exact_match" && normalizedItemVal === normalizedRuleVal) {
//                 itemScore += Number(rule.points);
//               } 
              
//               // 🧪 OVERRIDE FOR PUBLICATIONS ("None" gets half points for matching rule)
//               else if (
//                 config.source_table === "publications" && 
//                 rule.target_column === "indexing" && 
//                 normalizedItemVal === "none"
//               ) {
//                 // Award half points of the defined rule (e.g., 15 / 2 = 7.5)
//                 itemScore += Number(rule.points) / 2;
//               }

//               // Rule Type 2: Text contains logic
//               // else if (rule.rule_type === "contains" && normalizedItemVal.includes(normalizedRuleVal)) {
//               //   itemScore += Number(rule.points);
//               // } 

//               // Rule Type 3: Dynamic Hours (By Chunks - e.g., using "thresholds" in the Extra JSON field)
//               else if (rule.rule_type === "per_hours" && normalizedItemVal === normalizedRuleVal) {
//                 const hrs = Number(item.num_of_hrs || 0);
//                 let parsedExtra = {};

//                 try {
//                   parsedExtra = typeof rule.extra === "string" ? JSON.parse(rule.extra) : rule.extra || {};
//                 } catch (e) {
//                   parsedExtra = {};
//                 }

//                 const thresholds = parsedExtra.thresholds || [];

//                 if (thresholds.length > 0) {
//                   // Find highest bracket user hit (e.g., hours >= 16)
//                   const sortedThresholds = [...thresholds].sort((a, b) => b.hours - a.hours);
//                   const matchedBracket = sortedThresholds.find(t => hrs >= t.hours);
//                   if (matchedBracket) {
//                     itemScore += Number(matchedBracket.points);
//                   }
//                 } else {
//                   // Standard math fallbacks
//                   const chunk = Number(parsedExtra.per_hours) || 4;
//                   itemScore += Math.floor(hrs / chunk) * Number(rule.points);
//                 }
//               }
//             });

//             // 🛑 Item-Level Cap using max_score (Clamp the single row certificate to config constraints)
//             const cappedItemScore = Math.min(itemScore, Number(config.max_score));
//             catTotalScore += cappedItemScore;
//           });

//           // 🛑 Category-Level Cap using config.weight (The upper ceiling for total category masteries)
//           catTotalScore = Math.min(catTotalScore, Number(config.weight));
//           categoryScores[config.category] = catTotalScore;
//           totalScore += catTotalScore;
//         });

//         return { ...skill, categoryScores, totalMatchScore: totalScore };
//       });

//       calculatedResults.sort((a, b) => b.totalMatchScore - a.totalMatchScore);
//       setResults(calculatedResults);

//     } catch (err) {
//       console.error("Critical calculation error:", err);
//     }
//   };

//   const handleSearch = async (e) => {
//     if (e) e.preventDefault();
//     setLoading(true);
//     await fetchCoreDataAndCalculate(searchTerm, selectedCategory || null);
//     setLoading(false);
//   };

//   const handleClear = async () => {
//     setSearchTerm("");
//     setSelectedCategory("");
//     setLoading(true);
//     await fetchCoreDataAndCalculate("", null);
//     setLoading(false);
//   };

//   const getScoreColor = (score) => {
//     if (score >= 90) return "success";
//     if (score >= 70) return "info";
//     if (score >= 40) return "warning";
//     return "danger";
//   };

//   return (
//     <Container className="py-3">
//       {/* Dynamic Header Bio */}
//       <Card className="mb-4 border-0 shadow-sm bg-primary text-white">
//         <Card.Body className="p-4">
//           <h4 className="mb-1">Welcome back,</h4>
//           <h2 className="fw-bold">{fullName || "Faculty Member"}</h2>
//           <p className="mb-0 opacity-75">Monitoring your academic skill alignment.</p>
//         </Card.Body>
//       </Card>

//       <div className="row mb-4">
//         {/* Dynamic CMS Category Dropdown Filter */}
//         <div className="col-md-4">
//           <Form.Select
//             className="shadow-sm"
//             value={selectedCategory}
//             onChange={async (e) => {
//               const value = e.target.value;
//               setSelectedCategory(value);
//               setLoading(true);
//               await fetchCoreDataAndCalculate(searchTerm, value || null);
//               setLoading(false);
//             }}
//           >
//             <option value="">All Skill Categories</option>
//             {categories.map((cat) => (
//               <option key={cat.category_id} value={cat.category_id}>
//                 {cat.skill_category}
//               </option>
//             ))}
//           </Form.Select>
//         </div>

//         {/* Dynamic Skill Text Searching */}
//         <div className="col-md-5">
//           <Form onSubmit={handleSearch}>
//             <InputGroup className="shadow-sm">
//               <Form.Control
//                 placeholder="Search for a specific skill..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//               <Button variant="primary" type="submit" disabled={loading}>
//                 {loading ? <Spinner size="sm" animation="border" /> : "Filter"}
//               </Button>
//               {searchTerm && <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>}
//             </InputGroup>
//           </Form>
//         </div>
//       </div>

//       <Alert variant="secondary" className="border-0 small text-muted text-center">
//         <strong>Note:</strong> Points stack up per certifications/qualifications linked until they meet maximum category weights.
//       </Alert>

//       {/* Primary Mastery Dashboard Table UI */}
//       <Card className="shadow-sm border-0">
//         <Card.Body className="p-0">
//           <Table responsive hover className="mb-0 align-middle">
//             <thead className="bg-light text-uppercase small fw-bold">
//               <tr>
//                 <th className="ps-4 py-3 text-start">Skill</th>
                
//                 {/* Dynamically reading Weight percentages from CMS configs */}
//                 {configs.map(config => (
//                   <th key={config.id} className="text-center">
//                     {config.category} ({config.weight}%)
//                   </th>
//                 ))}
                
//                 <th className="text-center" style={{ width: "220px" }}>Total Mastery</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={configs.length + 2} className="text-center py-5">
//                     <Spinner animation="border" variant="primary" />
//                     <p className="mt-2 text-muted">Calculating dynamic mastery metrics...</p>
//                   </td>
//                 </tr>
//               ) : results.length > 0 ? (
//                 results.map((row) => (
//                   <tr key={row.id}>
//                     <td className="ps-4 fw-bold text-dark text-start">{row.skill_name}</td>
                    
//                     {/* Accessing mapped dynamic percentages per config column key */}
//                     {configs.map(config => (
//                       <td key={config.id} className="text-center text-muted small">
//                         {Number(row.categoryScores[config.category] || 0).toFixed(2)}%
//                       </td>
//                     ))}

//                     <td className="px-4">
//                       <div className="d-flex align-items-center justify-content-between mb-1">
//                         <span className={`fw-bold text-${getScoreColor(row.totalMatchScore)}`}>
//                           {Number(row.totalMatchScore).toFixed(2)}%
//                         </span>
//                       </div>
//                       <ProgressBar 
//                         now={row.totalMatchScore} 
//                         variant={getScoreColor(row.totalMatchScore)} 
//                         style={{ height: "8px" }} 
//                       />
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={configs.length + 2} className="text-center py-5 text-muted">
//                     No skills matched.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// }


// --------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------


// import React, { useState, useEffect } from "react";
// import { supabase } from "../../supabaseClient";
// import { Container, Table, Form, Button, InputGroup, Spinner, Badge, ProgressBar, Card, Alert } from "react-bootstrap";

// export default function Home() {
//   const [results, setResults] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [configs, setConfigs] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [fullName, setFullName] = useState("");
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const getUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) setUserId(user.id);
//     };
//     getUser();
//   }, []);

//   useEffect(() => {
//     if (!userId) return;
//     const loadInitialData = async () => {
//       setLoading(true);
//       await Promise.all([fetchProfile(), fetchCategories(), fetchCoreDataAndCalculate("", null)]);
//       setLoading(false);
//     };
//     loadInitialData();
//   }, [userId]);

//   const fetchProfile = async () => {
//     const { data } = await supabase.from("profiles").select("first_name, last_name").eq("id", userId).single();
//     if (data) setFullName(`${data.first_name} ${data.last_name}`);
//   };

//   const fetchCategories = async () => {
//     const { data } = await supabase.from("skill_category").select("category_id, skill_category").order("skill_category");
//     if (data) setCategories(data);
//   };

//   const fetchCoreDataAndCalculate = async (term = "", category = null) => {
//     try {
//       const { data: configData } = await supabase.from("scoring_config").select("*").order("created_at");
//       const { data: rulesData } = await supabase.from("scoring_rules").select("*");
//       setConfigs(configData || []);

//       let skillsQuery = supabase.from("skills").select("*");
//       if (term) skillsQuery = skillsQuery.ilike("skill_name", `%${term}%`);
//       if (category) skillsQuery = skillsQuery.eq("category_id", category);
//       const { data: skillsData } = await skillsQuery;

//       if (!skillsData || skillsData.length === 0) { setResults([]); return; }

//       const [eduRes, certsRes, pubsRes] = await Promise.all([
//         supabase.from("educational_attainment").select("*, educational_skills(skill_id)").eq("user_id", userId),
//         supabase.from("certifications").select("*, certifications_skills(skill_id)").eq("user_id", userId),
//         supabase.from("publications").select("*, publications_skills(skill_id)").eq("user_id", userId),
//       ]);

//       const userData = {
//         educational_attainment: eduRes.data || [],
//         certifications: certsRes.data || [],
//         publications: pubsRes.data || []
//       };

//       const calculatedResults = skillsData.map(skill => {
//         let totalScore = 0;
//         let categoryScores = {};

//         (configData || []).forEach(config => {
//           let catTotalScore = 0; 
//           const catRules = (rulesData || []).filter(r => r.category_id === config.id);
//           const tableData = userData[config.source_table] || [];

//           const relevantItems = tableData.filter(item => {
//             const skillJunctions = item.educational_skills || item.certifications_skills || item.publications_skills || [];
//             return skillJunctions.some(s => s.skill_id === skill.id);
//           });

//           relevantItems.forEach(item => {
//             let itemScore = 0;

//             catRules.forEach(rule => {
//               const itemVal = item[rule.target_column];
//               if (!itemVal) return;

//               const normItemVal = String(itemVal).toLowerCase().trim();
//               const normRuleVal = String(rule.value).toLowerCase().trim();

//               if (rule.rule_type === "exact_match" && normItemVal === normRuleVal) {
//                 itemScore += Number(rule.points);
//               } 
//               // ✨ NEW HOURLY LOGIC
//               else if (rule.rule_type === "per_hour" && normItemVal === normRuleVal) {
//                 const hours = Number(item.num_of_hrs || 0);
//                 itemScore += (hours * Number(rule.points));
//               }
//               // Publication Override
//               else if (config.source_table === "publications" && normItemVal === "none") {
//                 itemScore += Number(rule.points) / 2;
//               }
//             });

//             // 🛑 ITEM-LEVEL CAP (Clamp individual entry to max_score)
//             const cappedItemScore = Math.min(itemScore, Number(config.max_score));
//             catTotalScore += cappedItemScore;
//           });

//           // 🛑 CATEGORY-LEVEL CAP (Clamp category total to weight)
//           catTotalScore = Math.min(catTotalScore, Number(config.weight));
//           categoryScores[config.category] = catTotalScore;
//           totalScore += catTotalScore;
//         });

//         return { ...skill, categoryScores, totalMatchScore: totalScore };
//       });

//       setResults(calculatedResults.sort((a, b) => b.totalMatchScore - a.totalMatchScore));
//     } catch (err) { console.error("Error:", err); }
//   };

//   const getScoreColor = (s) => (s >= 90 ? "success" : s >= 70 ? "info" : s >= 40 ? "warning" : "danger");

//   return (
//     <Container className="py-3">
//       <Card className="mb-4 border-0 shadow-sm bg-primary text-white">
//         <Card.Body className="p-4">
//           <h2 className="fw-bold">Welcome, {fullName || "Faculty"}</h2>
//           <p className="mb-0 opacity-75">Academic Skill Alignment Dashboard</p>
//         </Card.Body>
//       </Card>

//       <div className="row mb-4">
//         <div className="col-md-4">
//           <Form.Select value={selectedCategory} onChange={async (e) => { setSelectedCategory(e.target.value); setLoading(true); await fetchCoreDataAndCalculate(searchTerm, e.target.value || null); setLoading(false); }}>
//             <option value="">All Categories</option>
//             {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.skill_category}</option>)}
//           </Form.Select>
//         </div>
//         <div className="col-md-5">
//             <Form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
//                 <InputGroup>
//                     <Form.Control placeholder="Search skill..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//                     <Button variant="primary" type="submit">Filter</Button>
//                 </InputGroup>
//             </Form>
//         </div>
//       </div>

//       <Card className="shadow-sm border-0">
//         <Table responsive hover className="mb-0 align-middle">
//           <thead className="bg-light small fw-bold">
//             <tr>
//               <th className="ps-4">Skill</th>
//               {configs.map(c => <th key={c.id} className="text-center">{c.category} ({c.weight}%)</th>)}
//               <th className="text-center">Total Mastery</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? <tr><td colSpan={configs.length+2} className="text-center py-5"><Spinner animation="border" /></td></tr> :
//               results.map(row => (
//                 <tr key={row.id}>
//                   <td className="ps-4 fw-bold">{row.skill_name}</td>
//                   {configs.map(c => <td key={c.id} className="text-center text-muted small">{Number(row.categoryScores[c.category] || 0).toFixed(2)}%</td>)}
//                   <td className="px-4">
//                     <div className="d-flex justify-content-between mb-1">
//                       <span className={`fw-bold text-${getScoreColor(row.totalMatchScore)}`}>{Number(row.totalMatchScore).toFixed(2)}%</span>
//                     </div>
//                     <ProgressBar now={row.totalMatchScore} variant={getScoreColor(row.totalMatchScore)} style={{ height: "8px" }} />
//                   </td>
//                 </tr>
//               ))
//             }
//           </tbody>
//         </Table>
//       </Card>
//     </Container>
//   );
// }

// --------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Container, Table, Form, Button, InputGroup, Spinner, Badge, ProgressBar, Card, Alert } from "react-bootstrap";

export default function Home() {
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchCategories(), fetchCoreDataAndCalculate("", null)]);
      setLoading(false);
    };
    loadInitialData();
  }, [userId]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("first_name, last_name").eq("id", userId).single();
    if (data) setFullName(`${data.first_name} ${data.last_name}`);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("skill_category").select("category_id, skill_category").order("skill_category");
    if (data) setCategories(data);
  };

  const fetchCoreDataAndCalculate = async (term = "", category = null) => {
    try {
      const { data: configData } = await supabase.from("scoring_config").select("*").order("created_at");
      const { data: rulesData } = await supabase.from("scoring_rules").select("*");
      setConfigs(configData || []);

      let skillsQuery = supabase.from("skills").select("*");
      if (term) skillsQuery = skillsQuery.ilike("skill_name", `%${term}%`);
      if (category) skillsQuery = skillsQuery.eq("category_id", category);
      const { data: skillsData } = await skillsQuery;

      if (!skillsData || skillsData.length === 0) { setResults([]); return; }

      const [eduRes, certsRes, pubsRes] = await Promise.all([
        supabase.from("educational_attainment").select("*, educational_skills(skill_id)").eq("user_id", userId),
        supabase.from("certifications").select("*, certifications_skills(skill_id)").eq("user_id", userId),
        supabase.from("publications").select("*, publications_skills(skill_id)").eq("user_id", userId),
      ]);

      const userData = {
        educational_attainment: eduRes.data || [],
        certifications: certsRes.data || [],
        publications: pubsRes.data || []
      };

      const calculatedResults = skillsData.map(skill => {
        let totalScore = 0;
        let categoryScores = {};

        (configData || []).forEach(config => {
          let catTotalScore = 0; 
          const catRules = (rulesData || []).filter(r => r.category_id === config.id);
          const tableData = userData[config.source_table] || [];

          const relevantItems = tableData.filter(item => {
            const skillJunctions = item.educational_skills || item.certifications_skills || item.publications_skills || [];
            return skillJunctions.some(s => s.skill_id === skill.id);
          });

          // Variable to track the highest degree score for overlap logic
          let highestEduScore = 0; 

          relevantItems.forEach(item => {
            let itemScore = 0;

            catRules.forEach(rule => {
              const itemVal = item[rule.target_column];
              if (!itemVal) return;

              const normItemVal = String(itemVal).toLowerCase().trim();
              const normRuleVal = String(rule.value).toLowerCase().trim();

              if (rule.rule_type === "exact_match" && normItemVal === normRuleVal) {
                itemScore += Number(rule.points);
              } 
              else if (rule.rule_type === "per_hour" && normItemVal === normRuleVal) {
                const hours = Number(item.num_of_hrs || 0);
                itemScore += (hours * Number(rule.points));
              }
              else if (config.source_table === "publications" && normItemVal === "none") {
                itemScore += Number(rule.points) / 2;
              }
            });

            // Split the logic based on the source table
            if (config.source_table === "educational_attainment") {
              // Overlap logic: Find the highest degree score (e.g., Master's overrides Bachelor's)
              highestEduScore = Math.max(highestEduScore, itemScore);
            } else {
              // Standard logic: Add up points for certs/pubs and apply item-level cap
              const cappedItemScore = Math.min(itemScore, Number(config.max_score));
              catTotalScore += cappedItemScore;
            }
          });

          // Apply the highest recorded education score to the category total
          if (config.source_table === "educational_attainment") {
            catTotalScore = highestEduScore;
          }

          // CATEGORY-LEVEL CAP (Clamp category total to weight)
          catTotalScore = Math.min(catTotalScore, Number(config.weight));
          categoryScores[config.category] = catTotalScore;
          totalScore += catTotalScore;
        });

        return { ...skill, categoryScores, totalMatchScore: totalScore };
      });

      setResults(calculatedResults.sort((a, b) => b.totalMatchScore - a.totalMatchScore));
    } catch (err) { console.error("Error:", err); }
  };

  const getScoreColor = (s) => (s >= 90 ? "success" : s >= 70 ? "info" : s >= 40 ? "warning" : "danger");

  return (
    <Container className="py-3">
      <Card className="mb-4 border-0 shadow-sm bg-primary text-white">
        <Card.Body className="p-4">
          <h2 className="fw-bold">Welcome, {fullName || "Faculty"}</h2>
          <p className="mb-0 opacity-75">Academic Skill Alignment Dashboard</p>
        </Card.Body>
      </Card>

      <div className="row mb-4">
        <div className="col-md-4">
          <Form.Select value={selectedCategory} onChange={async (e) => { setSelectedCategory(e.target.value); setLoading(true); await fetchCoreDataAndCalculate(searchTerm, e.target.value || null); setLoading(false); }}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.skill_category}</option>)}
          </Form.Select>
        </div>
        <div className="col-md-5">
            <Form onSubmit={(e) => { e.preventDefault(); /* handleSearch not defined in original snippet, assuming it triggers fetch */ fetchCoreDataAndCalculate(searchTerm, selectedCategory || null); }}>
                <InputGroup>
                    <Form.Control placeholder="Search skill..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Button variant="primary" type="submit">Filter</Button>
                </InputGroup>
            </Form>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light small fw-bold">
            <tr>
              <th className="ps-4">Skill</th>
              {configs.map(c => <th key={c.id} className="text-center">{c.category} ({c.weight}%)</th>)}
              <th className="text-center">Total Mastery</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={configs.length+2} className="text-center py-5"><Spinner animation="border" /></td></tr> :
              results.map(row => (
                <tr key={row.id}>
                  <td className="ps-4 fw-bold">{row.skill_name}</td>
                  {configs.map(c => <td key={c.id} className="text-center text-muted small">{Number(row.categoryScores[c.category] || 0).toFixed(2)}%</td>)}
                  <td className="px-4">
                    <div className="d-flex justify-content-between mb-1">
                      <span className={`fw-bold text-${getScoreColor(row.totalMatchScore)}`}>{Number(row.totalMatchScore).toFixed(2)}%</span>
                    </div>
                    <ProgressBar now={row.totalMatchScore} variant={getScoreColor(row.totalMatchScore)} style={{ height: "8px" }} />
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}