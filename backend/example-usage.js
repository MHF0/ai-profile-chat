const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Example usage of the improved backend API
async function demonstrateBackendCapabilities() {
  console.log('🚀 AI Recruitment Chat Backend - Example Usage\n');

  try {
    // 1. Get data overview
    console.log('📊 1. Getting Data Overview...');
    const overview = await axios.get(`${BASE_URL}/api/data/overview`);
    console.log(`   Total Candidates: ${overview.data.data.profiles_count}`);
    console.log(`   Total Jobs: ${overview.data.data.jobs_count}`);
    console.log(`   AI Summaries: ${overview.data.data.ai_summaries_count}`);
    console.log('');

    // 2. Get statistics
    console.log('📈 2. Getting Statistics...');
    const stats = await axios.get(`${BASE_URL}/api/data/statistics`);
    console.log(`   Average Experience: ${stats.data.data.average_experience?.toFixed(1)} years`);
    console.log(`   Top Skills: ${stats.data.data.skills_distribution?.slice(0, 3).map(s => s.skill).join(', ')}`);
    console.log('');

    // 3. Get searchable data
    console.log('🔍 3. Getting Searchable Data...');
    const searchable = await axios.get(`${BASE_URL}/api/data/searchable`);
    console.log(`   Available Skills: ${searchable.data.data.skills.slice(0, 5).join(', ')}...`);
    console.log(`   Available Locations: ${searchable.data.data.locations.slice(0, 3).join(', ')}...`);
    console.log('');

    // 4. Search for Python developers
    console.log('🐍 4. Searching for Python Developers...');
    const searchResults = await axios.post(`${BASE_URL}/api/search/profiles`, {
      query: 'Python',
      filters: { experience_min: 2 }
    });
    console.log(`   Found ${searchResults.data.data.total} Python developers`);
    if (searchResults.data.data.results.length > 0) {
      const topResult = searchResults.data.data.results[0];
      console.log(`   Top Result: ${topResult.name} (${topResult.fit_percentage}% fit)`);
    }
    console.log('');

    // 5. Get AI insights
    console.log('🤖 5. Getting AI Insights...');
    const insights = await axios.get(`${BASE_URL}/api/chat/insights`);
    console.log(`   Insights generated successfully (${insights.data.insights.length} characters)`);
    console.log('');

    // 6. Get comprehensive insights
    console.log('📋 6. Getting Comprehensive Insights...');
    const comprehensive = await axios.get(`${BASE_URL}/api/chat/insights/comprehensive`);
    console.log(`   Comprehensive analysis generated (${comprehensive.data.insights.length} characters)`);
    console.log('');

    // 7. AI Analysis with specific query
    console.log('🧠 7. AI Analysis with Custom Query...');
    const aiAnalysis = await axios.post(`${BASE_URL}/api/ai/analyze`, {
      query: 'Show me the top 3 candidates and explain why they are the best fit',
      analysis_type: 'data_insights'
    });
    console.log(`   AI Analysis completed (${aiAnalysis.data.data.response.length} characters)`);
    console.log('');

    // 8. Get chat suggestions
    console.log('💡 8. Getting Chat Suggestions...');
    const suggestions = await axios.get(`${BASE_URL}/api/chat/suggestions`);
    console.log(`   Available suggestions: ${suggestions.data.suggestions.length}`);
    console.log(`   Example: "${suggestions.data.suggestions[0]}"`);
    console.log('');

    console.log('🎉 All examples completed successfully!');
    console.log('📚 The backend is now providing comprehensive data access and AI analysis.');
    console.log('');
    console.log('💡 You can now:');
    console.log('   • Ask natural language questions about candidates');
    console.log('   • Search profiles with advanced filters');
    console.log('   • Get AI-powered insights and recommendations');
    console.log('   • Analyze individual profiles in detail');
    console.log('   • Compare candidates side-by-side');
    console.log('   • Get comprehensive data statistics');

  } catch (error) {
    console.error('❌ Example failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.log('');
    console.log('💡 Make sure the backend is running on port 5000');
    console.log('💡 Check that your MongoDB connection is working');
    console.log('💡 Verify your OpenAI API key is set');
  }
}

// Example of how to use the search API with different filters
async function demonstrateSearchCapabilities() {
  console.log('🔍 Demonstrating Advanced Search Capabilities...\n');

  try {
    // Search by skills
    console.log('1. Searching by Skills (React + JavaScript)...');
    const skillSearch = await axios.post(`${BASE_URL}/api/search/profiles`, {
      query: 'React JavaScript',
      filters: { experience_min: 1 }
    });
    console.log(`   Found ${skillSearch.data.data.total} candidates with React + JavaScript`);
    console.log('');

    // Search by location
    console.log('2. Searching by Location (San Francisco)...');
    const locationSearch = await axios.post(`${BASE_URL}/api/search/profiles`, {
      query: 'San Francisco',
      filters: { experience_min: 3 }
    });
    console.log(`   Found ${locationSearch.data.data.total} candidates in San Francisco with 3+ years experience`);
    console.log('');

    // Search by industry
    console.log('3. Searching by Industry (Technology)...');
    const industrySearch = await axios.post(`${BASE_URL}/api/search/profiles`, {
      query: 'Technology',
      filters: { experience_min: 5 }
    });
    console.log(`   Found ${industrySearch.data.data.total} technology candidates with 5+ years experience`);
    console.log('');

    // Search with AI analysis
    console.log('4. Search with AI Analysis...');
    const aiSearch = await axios.post(`${BASE_URL}/api/chat/search`, {
      query: 'Senior developers with cloud experience',
      filters: { experience_min: 5 },
      include_analysis: true
    });
    console.log(`   Found ${aiSearch.data.search_results.total} candidates`);
    console.log(`   AI Analysis: ${aiSearch.data.analysis ? 'Generated' : 'Not requested'}`);
    console.log('');

  } catch (error) {
    console.error('❌ Search demonstration failed:', error.message);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  demonstrateBackendCapabilities()
    .then(() => demonstrateSearchCapabilities())
    .catch(console.error);
}

module.exports = { demonstrateBackendCapabilities, demonstrateSearchCapabilities };
