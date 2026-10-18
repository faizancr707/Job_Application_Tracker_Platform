/**
 * Semantic Job Search Service
 * Natural language job search with vector similarity + metadata filtering
 */
const { queryJobs } = require('../ai/vectorStore.service');

/**
 * Search jobs semantically with optional filters
 * @param {string} query - Natural language search query
 * @param {object} [filters={}] - Metadata filters
 * @param {string} [filters.location] - Location filter
 * @param {string} [filters.jobType] - Job type filter
 * @param {number} [filters.minSalary] - Minimum salary
 * @param {number} [filters.maxSalary] - Maximum salary
 * @param {number} [filters.experienceLevel] - Experience level
 * @param {number} [k=10] - Number of results
 * @returns {Promise<Array>} Search results with relevance scores
 */
async function semanticJobSearch(query, filters = {}, k = 10) {
  // Build ChromaDB metadata filter
  const metaFilter = {};
  if (filters.location) metaFilter.location = filters.location;
  if (filters.jobType) metaFilter.jobType = filters.jobType;

  const results = await queryJobs(query, k * 2, Object.keys(metaFilter).length > 0 ? metaFilter : {});

  // Post-filter by salary range if specified
  let filtered = results;
  if (filters.minSalary || filters.maxSalary) {
    filtered = results.filter(r => {
      const salary = parseFloat(r.metadata.salary) || 0;
      if (filters.minSalary && salary < filters.minSalary) return false;
      if (filters.maxSalary && salary > filters.maxSalary) return false;
      return true;
    });
  }

  // Sort by score (lower = more similar in ChromaDB) and take top k
  return filtered
    .sort((a, b) => a.score - b.score)
    .slice(0, k)
    .map((r, index) => ({
      rank: index + 1,
      jobId: r.metadata.jobId,
      title: r.metadata.title || '',
      location: r.metadata.location || '',
      jobType: r.metadata.jobType || '',
      salary: r.metadata.salary || '',
      relevanceScore: Math.round((1 - Math.min(r.score, 1)) * 100),
      snippet: r.pageContent.substring(0, 200),
    }));
}

module.exports = { semanticJobSearch };
