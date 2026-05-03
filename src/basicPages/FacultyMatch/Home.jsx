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

//           // Variable to track the highest degree score for overlap logic
//           let highestEduScore = 0; 

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
//               else if (rule.rule_type === "per_hour" && normItemVal === normRuleVal) {
//                 const hours = Number(item.num_of_hrs || 0);
//                 itemScore += (hours * Number(rule.points));
//               }
//               else if (config.source_table === "publications" && normItemVal === "none") {
//                 itemScore += Number(rule.points) / 2;
//               }
//             });

//             // Split the logic based on the source table
//             if (config.source_table === "educational_attainment") {
//               // Overlap logic: Find the highest degree score (e.g., Master's overrides Bachelor's)
//               highestEduScore = Math.max(highestEduScore, itemScore);
//             } else {
//               // Standard logic: Add up points for certs/pubs and apply item-level cap
//               const cappedItemScore = Math.min(itemScore, Number(config.max_score));
//               catTotalScore += cappedItemScore;
//             }
//           });

//           // Apply the highest recorded education score to the category total
//           if (config.source_table === "educational_attainment") {
//             catTotalScore = highestEduScore;
//           }

//           // CATEGORY-LEVEL CAP (Clamp category total to weight)
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
//             <Form onSubmit={(e) => { e.preventDefault(); /* handleSearch not defined in original snippet, assuming it triggers fetch */ fetchCoreDataAndCalculate(searchTerm, selectedCategory || null); }}>
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

import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
    Container, Table, Form, Button, InputGroup,
    Spinner, ProgressBar, Card, Row, Col, Badge
} from "react-bootstrap";

export default function Home() {
    const [results, setResults] = useState([]);
    const [categories, setCategories] = useState([]);
    const [configs, setConfigs] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [userId, setUserId] = useState(null);
    const [initialLoad, setInitialLoad] = useState(false);

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
            await Promise.all([
                fetchProfile(),
                fetchCategories(),
                fetchCoreDataAndCalculate("", null)
            ]);
            setInitialLoad(true);
            setLoading(false);
        };
        loadInitialData();
    }, [userId]);

    const fetchProfile = async () => {
        const { data } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", userId)
            .single();
        if (data) setFullName(`${data.first_name} ${data.last_name}`);
    };

    const fetchCategories = async () => {
        const { data } = await supabase
            .from("skill_category")
            .select("category_id, skill_category")
            .order("skill_category");
        if (data) setCategories(data);
    };

    const fetchCoreDataAndCalculate = async (term = "", category = null) => {
        try {
            const { data: configData } = await supabase
                .from("scoring_config")
                .select("*")
                .order("created_at");
            const { data: rulesData } = await supabase
                .from("scoring_rules")
                .select("*");

            setConfigs(configData || []);

            let skillsQuery = supabase.from("skills").select("*");
            if (term) skillsQuery = skillsQuery.ilike("skill_name", `%${term}%`);
            if (category) skillsQuery = skillsQuery.eq("category_id", category);
            const { data: skillsData } = await skillsQuery;

            if (!skillsData || skillsData.length === 0) {
                setResults([]);
                return;
            }

            const [eduRes, certsRes, pubsRes] = await Promise.all([
                supabase.from("educational_attainment")
                    .select("*, educational_skills(skill_id)")
                    .eq("user_id", userId),
                supabase.from("certifications")
                    .select("*, certifications_skills(skill_id)")
                    .eq("user_id", userId),
                supabase.from("publications")
                    .select("*, publications_skills(skill_id)")
                    .eq("user_id", userId),
            ]);

            const userData = {
                educational_attainment: eduRes.data || [],
                certifications: certsRes.data || [],
                publications: pubsRes.data || []
            };

            const calculatedResults = skillsData.map(skill => {
                let totalScore = 0;
                const categoryScores = {};

                (configData || []).forEach(config => {
                    let catTotalScore = 0;
                    let highestEduScore = 0;
                    const catRules = (rulesData || []).filter(r => r.category_id === config.id);
                    const tableData = userData[config.source_table] || [];

                    const relevantItems = tableData.filter(item => {
                        const skillJunctions =
                            item.educational_skills ||
                            item.certifications_skills ||
                            item.publications_skills || [];
                        return skillJunctions.some(s => s.skill_id === skill.id);
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
                                itemScore += Number(item.num_of_hrs || 0) * Number(rule.points);
                            } else if (config.source_table === "publications" && normItemVal === "none") {
                                itemScore += Number(rule.points) / 2;
                            }
                        });

                        if (config.source_table === "educational_attainment") {
                            highestEduScore = Math.max(highestEduScore, itemScore);
                        } else {
                            catTotalScore += Math.min(itemScore, Number(config.max_score));
                        }
                    });

                    if (config.source_table === "educational_attainment") {
                        catTotalScore = highestEduScore;
                    }

                    catTotalScore = Math.min(catTotalScore, Number(config.weight));
                    categoryScores[config.category] = catTotalScore;
                    totalScore += catTotalScore;
                });

                return { ...skill, categoryScores, totalMatchScore: totalScore };
            });

            setResults(calculatedResults.sort((a, b) => b.totalMatchScore - a.totalMatchScore));
        } catch (err) {
            console.error("Calculation error:", err);
        }
    };

    // ── BUG FIX: Search now properly wraps with loading state ────────────────
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        await fetchCoreDataAndCalculate(searchTerm, selectedCategory || null);
        setLoading(false);
    };

    const handleCategoryChange = async (value) => {
        setSelectedCategory(value);
        setLoading(true);
        await fetchCoreDataAndCalculate(searchTerm, value || null);
        setLoading(false);
    };

    const handleClear = async () => {
        setSearchTerm("");
        setSelectedCategory("");
        setLoading(true);
        await fetchCoreDataAndCalculate("", null);
        setLoading(false);
    };

    const getScoreColor = (s) => (s >= 80 ? "success" : s >= 50 ? "info" : s >= 25 ? "warning" : "danger");
    const getScoreLabel = (s) => (s >= 80 ? "Highly Proficient" : s >= 50 ? "Proficient" : s >= 25 ? "Developing" : "Needs Development");

    // ── KPI Computations ────────────────────────────────────────────────────
    const totalSkills = results.length;
    const avgProficiency = totalSkills > 0
        ? results.reduce((sum, r) => sum + r.totalMatchScore, 0) / totalSkills
        : 0;
    const highProficiencyCount = results.filter(r => r.totalMatchScore >= 80).length;
    const needsDevelopmentCount = results.filter(r => r.totalMatchScore < 50).length;

    const kpiCards = [
        {
            label: "Total Skills",
            value: totalSkills,
            sub: "skill areas evaluated",
            icon: "📚",
            color: "primary",
        },
        {
            label: "Avg. Proficiency",
            value: `${avgProficiency.toFixed(1)}%`,
            sub: getScoreLabel(avgProficiency),
            icon: "📊",
            color: getScoreColor(avgProficiency),
        },
        {
            label: "Highly Proficient",
            value: highProficiencyCount,
            sub: "skills at 80% or above",
            icon: "🏆",
            color: "success",
        },
        {
            label: "Needs Development",
            value: needsDevelopmentCount,
            sub: "skills below 50%",
            icon: "⚠️",
            color: "danger",
        },
    ];

    return (
        <Container className="py-3">
            {/* ── Welcome Banner ─────────────────────────────────────────────── */}
            <Card
                className="mb-4 border-0 shadow-sm"
                style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0d6efd 100%)" }}
            >
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        <Col>
                            <h2 className="fw-bold text-white mb-1">
                                Welcome, {fullName || "Faculty"} 👋
                            </h2>
                            <p className="mb-0 opacity-75 text-white small">
                                Academic Skill Alignment Dashboard — Review and track your competency profile below.
                            </p>
                        </Col>
                        {loading && (
                            <Col xs="auto">
                                <Spinner animation="border" variant="light" size="sm" />
                            </Col>
                        )}
                    </Row>
                </Card.Body>
            </Card>

            {/* ── KPI Summary Cards ─────────────────────────────────────────── */}
            {initialLoad && (
                <Row className="g-3 mb-4">
                    {kpiCards.map(kpi => (
                        <Col sm={6} lg={3} key={kpi.label}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <span className="text-muted small">{kpi.label}</span>
                                        <span style={{ fontSize: "1.3rem" }}>{kpi.icon}</span>
                                    </div>
                                    <h3 className={`fw-bold mb-0 text-${kpi.color}`}>{kpi.value}</h3>
                                    <p className="text-muted small mb-0 mt-1">{kpi.sub}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* ── Filters ───────────────────────────────────────────────────── */}
            <div className="row mb-4 g-2">
                <div className="col-md-4">
                    <Form.Select
                        value={selectedCategory}
                        onChange={e => handleCategoryChange(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">All Skill Categories</option>
                        {categories.map(cat => (
                            <option key={cat.category_id} value={cat.category_id}>
                                {cat.skill_category}
                            </option>
                        ))}
                    </Form.Select>
                </div>

                <div className="col-md-6">
                    {/* ── BUG FIX: onSubmit now uses handleSearch which properly sets loading ── */}
                    <Form onSubmit={handleSearch}>
                        <InputGroup>
                            <Form.Control
                                placeholder="Search for a specific skill..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                disabled={loading}
                            />
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? <Spinner size="sm" animation="border" /> : "Filter"}
                            </Button>
                            {(searchTerm || selectedCategory) && (
                                <Button variant="outline-secondary" onClick={handleClear} disabled={loading}>
                                    Clear
                                </Button>
                            )}
                        </InputGroup>
                    </Form>
                </div>
            </div>

            {/* ── Skill Proficiency Table ───────────────────────────────────── */}
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="fw-bold mb-0">Skill Proficiency Matrix</h6>
                        <p className="text-muted small mb-0">
                            Proficiency is computed from your logged credentials against the scoring configuration.
                        </p>
                    </div>
                    {initialLoad && (
                        <Badge bg="secondary" className="px-3 py-2">
                            {totalSkills} skill{totalSkills !== 1 ? "s" : ""}
                        </Badge>
                    )}
                </Card.Header>

                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light text-uppercase small fw-bold">
                        <tr>
                            <th className="ps-4 py-3">Skill</th>
                            {configs.map(c => (
                                <th key={c.id} className="text-center">
                                    {c.category}
                                    <div className="fw-normal text-lowercase" style={{ fontSize: "0.7rem" }}>
                                        (max {c.weight}%)
                                    </div>
                                </th>
                            ))}
                            <th className="text-center" style={{ width: 220 }}>Total Mastery</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={configs.length + 2} className="text-center py-5">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2 text-muted small">Calculating proficiency scores...</p>
                                </td>
                            </tr>
                        ) : results.length === 0 ? (
                            <tr>
                                <td colSpan={configs.length + 2} className="text-center py-5">
                                    <div style={{ fontSize: "3rem" }}>🔍</div>
                                    <p className="fw-bold mt-2 mb-1">No skills found</p>
                                    <p className="text-muted small mb-0">
                                        {(searchTerm || selectedCategory)
                                            ? "No skills match your filters. Try clearing the search."
                                            : "Add credentials and tag them to skills to see your proficiency scores."
                                        }
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            results.map(row => (
                                <tr key={row.id}>
                                    <td className="ps-4 fw-bold">{row.skill_name}</td>
                                    {configs.map(c => (
                                        <td key={c.id} className="text-center text-muted small">
                                            {Number(row.categoryScores[c.category] || 0).toFixed(2)}%
                                        </td>
                                    ))}
                                    <td className="px-4">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className={`fw-bold small text-${getScoreColor(row.totalMatchScore)}`}>
                                                {Number(row.totalMatchScore).toFixed(2)}%
                                            </span>
                                            <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                                                {getScoreLabel(row.totalMatchScore)}
                                            </span>
                                        </div>
                                        <ProgressBar
                                            now={row.totalMatchScore}
                                            variant={getScoreColor(row.totalMatchScore)}
                                            style={{ height: "8px" }}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>

                <Card.Footer className="bg-white border-top py-3">
                    <div className="d-flex flex-wrap gap-4 small text-muted">
                        <span><span className="fw-bold text-success">■</span> 80–100% Highly Proficient</span>
                        <span><span className="fw-bold text-info">■</span> 50–79% Proficient</span>
                        <span><span className="fw-bold text-warning">■</span> 25–49% Developing</span>
                        <span><span className="fw-bold text-danger">■</span> 0–24% Needs Development</span>
                    </div>
                </Card.Footer>
            </Card>
        </Container>
    );
}
