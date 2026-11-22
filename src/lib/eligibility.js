import schemes from "@/data/schemes.json";

const PASS = "pass";
const FAIL = "fail";
const UNKNOWN = "unknown";

const isNum = (v) => typeof v === "number" && !Number.isNaN(v);
const lower = (v) => String(v || "").toLowerCase();

function ruleResult(rule, status) {
  return { label: rule.label, field: rule.field, status, soft: Boolean(rule.soft) };
}

function evaluateRule(rule, profile) {
  const value = rule.value;

  switch (rule.field) {
    case "age": {
      if (!isNum(profile.age)) return ruleResult(rule, UNKNOWN);
      const ok = rule.op === "gte" ? profile.age >= value : profile.age <= value;
      return ruleResult(rule, ok ? PASS : FAIL);
    }
    case "income": {
      if (!isNum(profile.income)) return ruleResult(rule, UNKNOWN);
      const ok = rule.op === "lte" ? profile.income <= value : profile.income >= value;
      return ruleResult(rule, ok ? PASS : FAIL);
    }
    case "gender": {
      if (!profile.gender) return ruleResult(rule, UNKNOWN);
      return ruleResult(rule, profile.gender === value ? PASS : FAIL);
    }
    case "area": {
      if (!profile.area) return ruleResult(rule, UNKNOWN);
      return ruleResult(rule, profile.area === value ? PASS : FAIL);
    }
    case "occupation": {
      if (!profile.occupation) return ruleResult(rule, UNKNOWN);
      return ruleResult(rule, value.includes(profile.occupation) ? PASS : FAIL);
    }
    case "caste": {
      if (!profile.caste) return ruleResult(rule, UNKNOWN);
      return ruleResult(rule, value.includes(profile.caste) ? PASS : FAIL);
    }
    case "state": {
      if (!profile.state) return ruleResult(rule, UNKNOWN);
      const ok = value.some((s) => lower(s) === lower(profile.state));
      return ruleResult(rule, ok ? PASS : FAIL);
    }
    case "disability": {
      if (profile.disability === null || profile.disability === undefined)
        return ruleResult(rule, UNKNOWN);
      return ruleResult(rule, profile.disability === value ? PASS : FAIL);
    }
    case "bpl": {
      if (profile.bpl === null || profile.bpl === undefined) return ruleResult(rule, UNKNOWN);
      return ruleResult(rule, profile.bpl === value ? PASS : FAIL);
    }
    case "land": {
      if (profile.land === null || profile.land === undefined) return ruleResult(rule, UNKNOWN);
      return ruleResult(rule, profile.land === value ? PASS : FAIL);
    }
    case "group": {
      const isScSt = profile.caste === "sc" || profile.caste === "st";
      const isWoman = profile.gender === "female";
      const ok = value.includes("sc_st_or_woman") && (isScSt || isWoman);
      return ruleResult(rule, ok ? PASS : FAIL);
    }
    default:
      return ruleResult(rule, UNKNOWN);
  }
}

export function evaluateScheme(scheme, profile) {
  const reasons = scheme.rules.map((r) => evaluateRule(r, profile));
  const hardFail = reasons.some((r) => r.status === FAIL && !r.soft);
  const softFail = reasons.some((r) => r.status === FAIL && r.soft);
  const hasUnknown = reasons.some((r) => r.status === UNKNOWN);

  let status = "eligible";
  if (hardFail) status = "not_eligible";
  else if (softFail || hasUnknown) status = "maybe";

  return {
    id: scheme.id,
    status,
    reasons,
    unknownCount: reasons.filter((r) => r.status === UNKNOWN).length,
  };
}

export function evaluateAll(profile) {
  return schemes.map((scheme) => {
    const result = evaluateScheme(scheme, profile);
    return { ...result, scheme };
  });
}

export function groupResults(results) {
  return {
    eligible: results.filter((r) => r.status === "eligible"),
    maybe: results.filter((r) => r.status === "maybe"),
    not: results.filter((r) => r.status === "not_eligible"),
  };
}

export function documentsFor(results) {
  const set = new Set();
  results
    .filter((r) => r.status !== "not_eligible")
    .forEach((r) => (r.scheme.documents || []).forEach((d) => set.add(d)));
  return Array.from(set).sort();
}

export function getScheme(id) {
  return schemes.find((s) => s.id === id) || null;
}

export { schemes };