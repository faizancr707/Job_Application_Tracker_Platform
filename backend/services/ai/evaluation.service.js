/**
 * AI Evaluation Service
 * Quality checks for AI outputs
 */

/**
 * Verify cover letter doesn't hallucinate experiences
 * @param {string} coverLetter - Generated cover letter
 * @param {object} resumeData - Parsed resume data
 * @returns {{ isValid: boolean, issues: string[] }}
 */
function validateCoverLetter(coverLetter, resumeData) {
  const issues = [];
  const letterLower = coverLetter.toLowerCase();

  // Check if mentioned companies exist in resume
  if (resumeData.experience) {
    const resumeCompanies = resumeData.experience.map(e => e.company?.toLowerCase()).filter(Boolean);
    // Look for company-like patterns and check they're in resume
    const yearPatterns = letterLower.match(/at\s+([a-z\s]+?)[\s,.]+(for|where|during)/gi) || [];
    // This is a heuristic check — flag if suspicious
    if (yearPatterns.length > resumeCompanies.length + 2) {
      issues.push('Cover letter may reference more companies than listed in resume');
    }
  }

  // Check for suspiciously specific claims not in resume
  if (!resumeData.certifications?.length && /certified|certification/i.test(coverLetter)) {
    issues.push('Mentions certifications but none found in resume');
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Validate match score sanity
 * @param {object} matchResult
 * @returns {{ isValid: boolean, issues: string[] }}
 */
function validateMatchScore(matchResult) {
  const issues = [];
  if (matchResult.overallScore === 100 && matchResult.missingSkills?.length > 0) {
    issues.push('Perfect score despite missing skills');
  }
  if (matchResult.overallScore === 0 && matchResult.matchedSkills?.length > 0) {
    issues.push('Zero score despite matched skills');
  }
  if (matchResult.overallScore > 90 && matchResult.missingSkills?.filter(s => s.importance === 'critical').length > 2) {
    issues.push('Very high score with multiple critical missing skills');
  }
  return { isValid: issues.length === 0, issues };
}

module.exports = { validateCoverLetter, validateMatchScore };
