import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Badge,
  ProgressBar,
  Alert,
} from "react-bootstrap";

/* ─────────────────────────────────────────────────────────────────
   HELPER: ordinal suffix  →  1st, 2nd, 3rd, 4th …
───────────────────────────────────────────────────────────────── */
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/* ─────────────────────────────────────────────────────────────────
   HELPER: rank badge colour
───────────────────────────────────────────────────────────────── */
function rankMeta(rank) {
  if (rank === 1) return { bg: "#FFD700", color: "#7a5c00", label: "🥇" };
  if (rank === 2) return { bg: "#C0C0C0", color: "#4a4a4a", label: "🥈" };
  if (rank === 3) return { bg: "#CD7F32", color: "#fff",    label: "🥉" };
  return          { bg: "#e9ecef",  color: "#495057",       label: `#${rank}` };
}

/* ─────────────────────────────────────────────────────────────────
   HELPER: proficiency colour
───────────────────────────────────────────────────────────────── */
function scoreVariant(s) {
  if (s >= 80) return "success";
  if (s >= 50) return "info";
  if (s >= 25) return "warning";
  return "danger";
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function FacultyRanking() {
  /* ── state ── */
  const [chairInfo,       setChairInfo]       = useState(null);
  const [facultyList,     setFacultyList]     = useState([]);
  const [skillCategories, setSkillCategories] = useState([]);
  const [allSkills,       setAllSkills]       = useState([]);
  const [configs,         setConfigs]         = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkill,    setSelectedSkill]    = useState("");

  const [rankings, setRankings] = useState([]);   // computed ranked rows
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false); // has user triggered a rank yet?
  const [error,    setError]    = useState(null);

  /* ── init ── */
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, department_id, departments(name)")
        .eq("id", user.id)
        .single();

      setChairInfo(profile);

      if (profile?.department_id) {
        await Promise.all([
          loadFaculty(profile.department_id),
          loadCategories(),
          loadSkills(),
          loadConfigs(),
        ]);
      }
    };
    init();
  }, []);

  /* ── loaders ── */
  const loadFaculty = async (deptId) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("department_id", deptId)
      .in("role", ["faculty", "chair"]);
    if (data) setFacultyList(data);
    return data || [];
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from("skill_category")
      .select("*")
      .order("skill_category");
    if (data) setSkillCategories(data);
  };

  const loadSkills = async () => {
    const { data } = await supabase
      .from("skills")
      .select("id, skill_name, category_id")
      .order("skill_name");
    if (data) setAllSkills(data);
    return data || [];
  };

  const loadConfigs = async () => {
    const { data } = await supabase
      .from("scoring_config")
      .select("*")
      .order("created_at");
    if (data) setConfigs(data);
    return data || [];
  };

  /* ── SCORING ENGINE (same logic as DepartmentChairDashboard) ── */
  const computeRankings = async () => {
    if (!selectedSkill) return;

    setLoading(true);
    setSearched(true);
    setError(null);

    try {
      /* 1. fresh configs + rules */
      const { data: configData } = await supabase
        .from("scoring_config")
        .select("*")
        .order("created_at");

      const { data: rulesData } = await supabase
        .from("scoring_rules")
        .select("*");

      const activeConfigs = configData || [];

      /* 2. skill being ranked */
      const skill = allSkills.find((s) => s.id === selectedSkill);
      if (!skill) { setLoading(false); return; }

      /* 3. all faculty ids in department */
      const facultyIds = facultyList.map((f) => f.id);
      if (facultyIds.length === 0) { setLoading(false); return; }

      /* 4. fetch credential tables for all faculty */
      const [eduRes, certsRes, pubsRes] = await Promise.all([
        supabase
          .from("educational_attainment")
          .select("*, educational_skills(skill_id)")
          .in("user_id", facultyIds),
        supabase
          .from("certifications")
          .select("*, certifications_skills(skill_id)")
          .in("user_id", facultyIds),
        supabase
          .from("publications")
          .select("*, publications_skills(skill_id)")
          .in("user_id", facultyIds),
      ]);

      /* 5. compute score per faculty for the selected skill */
      const rows = facultyIds.map((fId) => {
        const member = facultyList.find((f) => f.id === fId);
        let totalScore = 0;
        const categoryScores = {};

        activeConfigs.forEach((config) => {
          let catScore = 0;
          let highestEduScore = 0;

          const catRules = (rulesData || []).filter(
            (r) => r.category_id === config.id
          );

          const tableData = (
            config.source_table === "educational_attainment"
              ? eduRes.data
              : config.source_table === "certifications"
              ? certsRes.data
              : pubsRes.data
          ).filter((item) => item.user_id === fId);

          const relevant = tableData.filter((item) => {
            const junctions =
              item.educational_skills ||
              item.certifications_skills ||
              item.publications_skills ||
              [];
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
              } else if (
                config.source_table === "publications" &&
                nItem === "none"
              ) {
                itemScore += Number(rule.points) / 2;
              }
            });

            if (config.source_table === "educational_attainment") {
              highestEduScore = Math.max(highestEduScore, itemScore);
            } else {
              catScore += Math.min(itemScore, Number(config.max_score));
            }
          });

          if (config.source_table === "educational_attainment") {
            catScore = highestEduScore;
          }

          catScore = Math.min(catScore, Number(config.weight));
          categoryScores[config.category] = catScore;
          totalScore += catScore;
        });

        return {
          facultyId: fId,
          facultyName: `${member.first_name} ${member.last_name}`,
          totalScore,
          categoryScores,
        };
      });

      /* 6. sort descending → assign rank (ties share same rank) */
      rows.sort((a, b) => b.totalScore - a.totalScore);

      let rank = 1;
      const ranked = rows.map((row, idx) => {
        if (idx > 0 && row.totalScore < rows[idx - 1].totalScore) {
          rank = idx + 1;
        }
        return { ...row, rank };
      });

      setConfigs(activeConfigs);  // keep in sync
      setRankings(ranked);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }

    setLoading(false);
  };

  /* ── derived ── */
  const filteredSkills = selectedCategory
    ? allSkills.filter((s) => s.category_id === selectedCategory)
    : allSkills;

  const selectedSkillName =
    allSkills.find((s) => s.id === selectedSkill)?.skill_name || "";

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <Container className="py-4">

      {/* ── PAGE HEADER ── */}
      <Card className="mb-4 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)" }}>
        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
          <div>
            <h3 className="fw-bold mb-1 text-white">Faculty Ranking</h3>
            <p className="mb-0 text-info small">
              Department: {chairInfo?.departments?.name || "Detecting…"}
            </p>
          </div>
          {loading && <Spinner animation="border" variant="info" size="sm" />}
        </Card.Body>
      </Card>

      {/* ── FILTER PANEL ── */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-4">
          <h6 className="fw-bold text-secondary mb-3 text-uppercase small">
            Select a Skill to Rank Faculty
          </h6>
          <Row className="g-3 align-items-end">

            {/* Category filter */}
            <Col md={4}>
              <Form.Label className="small fw-bold">Skill Category</Form.Label>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSkill("");   // reset skill when category changes
                  setRankings([]);
                  setSearched(false);
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

            {/* Skill selector */}
            <Col md={4}>
              <Form.Label className="small fw-bold">
                Specific Skill <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={selectedSkill}
                onChange={(e) => {
                  setSelectedSkill(e.target.value);
                  setRankings([]);
                  setSearched(false);
                }}
              >
                <option value="">— Select a skill —</option>
                {filteredSkills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.skill_name}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* Action button */}
            <Col md={4}>
              <Button
                variant="primary"
                className="w-100 fw-bold"
                disabled={!selectedSkill || loading}
                onClick={computeRankings}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Ranking…
                  </>
                ) : (
                  "Generate Ranking"
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── ERROR ── */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ── RESULTS ── */}
      {searched && !loading && (
        <>
          {/* Result heading */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 className="fw-bold mb-0">
                Rankings for{" "}
                <span className="text-primary">{selectedSkillName}</span>
              </h5>
              <p className="text-muted small mb-0">
                {rankings.length} faculty member
                {rankings.length !== 1 ? "s" : ""} evaluated
              </p>
            </div>
            <Badge bg="secondary" className="px-3 py-2">
              {rankings.filter((r) => r.totalScore > 0).length} with recorded credentials
            </Badge>
          </div>

          {/* ── TOP 3 PODIUM ── */}
          {rankings.filter((r) => r.totalScore > 0).length >= 1 && (
            <Row className="g-3 mb-4">
              {rankings
                .filter((r) => r.totalScore > 0)
                .slice(0, 3)
                .map((row) => {
                  const { bg, color, label } = rankMeta(row.rank);
                  return (
                    <Col md={4} key={row.facultyId}>
                      <Card
                        className="border-0 shadow text-center h-100"
                        style={{ borderTop: `4px solid ${bg}` }}
                      >
                        <Card.Body className="p-4">
                          {/* Medal */}
                          <div
                            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                            style={{
                              width: 56,
                              height: 56,
                              background: bg,
                              color,
                              fontSize: "1.4rem",
                              fontWeight: 700,
                            }}
                          >
                            {label}
                          </div>

                          {/* Name */}
                          <h6 className="fw-bold mb-1">{row.facultyName}</h6>
                          <p className="text-muted small mb-2">
                            {ordinal(row.rank)} Place
                          </p>

                          {/* Score pill */}
                          <h4
                            className={`fw-bold text-${scoreVariant(row.totalScore)} mb-2`}
                          >
                            {row.totalScore.toFixed(1)}%
                          </h4>

                          {/* Progress */}
                          <ProgressBar
                            now={row.totalScore}
                            variant={scoreVariant(row.totalScore)}
                            style={{ height: 6 }}
                          />

                          {/* Category breakdown */}
                          <div className="mt-3 text-start">
                            {configs.map((c) => (
                              <div
                                key={c.id}
                                className="d-flex justify-content-between small text-muted py-1 border-bottom"
                              >
                                <span>{c.category}</span>
                                <span className="fw-semibold">
                                  {(row.categoryScores[c.category] || 0).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
            </Row>
          )}

          {/* ── FULL RANKED LIST ── */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="fw-bold mb-0">Complete Ranking Table</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-uppercase fw-bold text-muted">
                    <th className="ps-4" style={{ width: 80 }}>Rank</th>
                    <th>Faculty Member</th>
                    {configs.map((c) => (
                      <th key={c.id} className="text-center">
                        {c.category}
                        <div className="text-muted fw-normal" style={{ fontSize: "0.7rem" }}>
                          (max {c.weight}%)
                        </div>
                      </th>
                    ))}
                    <th className="text-center" style={{ width: 180 }}>
                      Total Proficiency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={configs.length + 3}
                        className="text-center py-5 text-muted"
                      >
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    rankings.map((row, idx) => {
                      const { bg, color, label } = rankMeta(row.rank);
                      const hasCredentials = row.totalScore > 0;

                      return (
                        <tr
                          key={row.facultyId}
                          style={
                            !hasCredentials
                              ? { opacity: 0.45, background: "#fafafa" }
                              : {}
                          }
                        >
                          {/* Rank badge */}
                          <td className="ps-4">
                            <span
                              className="rounded-pill px-2 py-1 fw-bold small"
                              style={{
                                background: bg,
                                color,
                                minWidth: 40,
                                display: "inline-block",
                                textAlign: "center",
                              }}
                            >
                              {label}
                            </span>
                          </td>

                          {/* Name */}
                          <td>
                            <span className="fw-semibold">{row.facultyName}</span>
                            {!hasCredentials && (
                              <Badge
                                bg="light"
                                text="secondary"
                                className="ms-2 border small"
                              >
                                No credentials tagged
                              </Badge>
                            )}
                          </td>

                          {/* Per-category scores */}
                          {configs.map((c) => (
                            <td key={c.id} className="text-center small text-muted">
                              {(row.categoryScores[c.category] || 0).toFixed(1)}%
                            </td>
                          ))}

                          {/* Total + progress bar */}
                          <td className="px-3">
                            <div className="d-flex justify-content-between mb-1">
                              <span
                                className={`fw-bold small text-${scoreVariant(row.totalScore)}`}
                              >
                                {row.totalScore.toFixed(1)}%
                              </span>
                            </div>
                            <ProgressBar
                              now={row.totalScore}
                              variant={scoreVariant(row.totalScore)}
                              style={{ height: 6 }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </Card.Body>

            {/* ── LEGEND ── */}
            <Card.Footer className="bg-white border-top py-3">
              <div className="d-flex flex-wrap gap-4 small text-muted">
                <span>
                  <span className="fw-bold text-success">■</span> 80–100% Highly Proficient
                </span>
                <span>
                  <span className="fw-bold text-info">■</span> 50–79% Proficient
                </span>
                <span>
                  <span className="fw-bold text-warning">■</span> 25–49% Developing
                </span>
                <span>
                  <span className="fw-bold text-danger">■</span> 0–24% Needs Development
                </span>
                <span className="ms-auto fst-italic">
                  Faculty with no tagged credentials are listed last and excluded from
                  the podium.
                </span>
              </div>
            </Card.Footer>
          </Card>
        </>
      )}

      {/* ── EMPTY PROMPT (before first search) ── */}
      {!searched && (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <div style={{ fontSize: "3rem" }}>🏆</div>
            <h5 className="fw-bold mt-3 mb-1">Select a Skill to Begin</h5>
            <p className="text-muted">
              Choose a skill category and a specific skill above, then click{" "}
              <strong>Generate Ranking</strong> to see faculty ranked by their
              computed proficiency score for that skill.
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
