import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { predictionAPI, authAPI } from '../api';
import { 
  Shield, 
  LogOut, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  History,
  TrendingUp,
  User,
  Sparkles,
  Clock,
  Target,
  ExternalLink,
  Newspaper
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [title, setTitle] = useState('');
  const [articleText, setArticleText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total_checks: 0, real_count: 0, fake_count: 0 });
  const [showHistory, setShowHistory] = useState(false);
  const [analysisTime, setAnalysisTime] = useState(null);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await authAPI.getHistory(10);
      setHistory(response.data.predictions || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!title.trim() || title.length < 5) {
      setError('Please enter a title (at least 5 characters)');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);
    const startTime = Date.now();

    try {
      const response = await predictionAPI.predict(title, articleText || null);
      setResult(response.data);
      setAnalysisTime(((Date.now() - startTime) / 1000).toFixed(1));
      loadHistory();
      loadStats();
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sampleTexts = [
    { title: "The President announced new climate policies", text: "The new policies will reduce carbon emissions by 50% by 2030, according to official statements." },
    { title: "Scientists discover hot water cures all viral infections", text: "A viral social media post claims drinking hot water instantly cures all viruses." },
    { title: "NASA confirms asteroid will pass by Earth", text: "NASA officials confirmed that the asteroid will pass safely by Earth next month at a distance of 2 million miles." }
  ];

  const COLORS = ['#ef4444', '#22c55e'];

  const chartData = result ? [
    { name: 'Fake', value: result.probabilities.fake * 100 },
    { name: 'Real', value: result.probabilities.real * 100 }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">TruthLens</h1>
                <p className="text-xs text-slate-500">AI Fact Checker</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  showHistory 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <History className="w-5 h-5" />
                <span className="hidden sm:inline">History</span>
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-300 hidden sm:inline">{user?.username}</span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition border border-transparent hover:border-red-500/30"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Analyze News</h2>
                  <p className="text-sm text-slate-400">Paste or type any news article</p>
                </div>
              </div>
              
              {/* Sample Texts */}
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-2">Try a sample:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleTexts.map((sample, i) => (
                    <button
                      key={i}
                      onClick={() => { setTitle(sample.title); setArticleText(sample.text); }}
                      className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition border border-slate-600"
                    >
                      Sample {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">News Title / Headline *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the news headline..."
                  className="w-full p-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Article Text Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Article Text (Optional - improves accuracy)</label>
                <textarea
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                  placeholder="Paste the full article content for better analysis..."
                  className="w-full h-32 p-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-slate-500">
                  Title: {title.length} chars | Text: {articleText.length} chars
                </span>
                <button
                  onClick={handleAnalyze}
                  disabled={loading || title.length < 5}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </div>

            {/* Results Card */}
            {result && (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Analysis Result</h2>
                  {analysisTime && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      {analysisTime}s
                    </div>
                  )}
                </div>

                {/* Verdict */}
                <div className={`p-6 rounded-2xl mb-6 border-2 ${
                  result.is_fake 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-green-500/10 border-green-500/30'
                }`}>
                  <div className="flex items-center gap-4">
                    {result.is_fake ? (
                      <div className="p-4 bg-red-500/20 rounded-2xl">
                        <AlertTriangle className="w-10 h-10 text-red-400" />
                      </div>
                    ) : (
                      <div className="p-4 bg-green-500/20 rounded-2xl">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                      </div>
                    )}
                    <div>
                      <h3 className={`text-3xl font-bold ${
                        result.is_fake ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {result.prediction.toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Target className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">
                          Confidence: <span className="text-white font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `${value.toFixed(1)}%`}
                          contentStyle={{ 
                            background: '#1e293b', 
                            border: '1px solid #475569',
                            borderRadius: '0.75rem'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-slate-400">Fake:</span>
                      <span className="text-white font-semibold">{(result.probabilities.fake * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-slate-400">Real:</span>
                      <span className="text-white font-semibold">{(result.probabilities.real * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* News Validation & Sources */}
                {result.news_validation && (
                  <div className="mt-6 space-y-4">
                    {/* Verification Status */}
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-purple-400" />
                        Source Validation
                      </h4>
                      <p className="text-sm text-slate-400">
                        Status: <span className="text-purple-400 font-medium">{result.news_validation.verification_status || 'N/A'}</span>
                      </p>
                      {result.news_insight && (
                        <p className="text-sm text-slate-500 mt-2">{result.news_insight}</p>
                      )}
                      {result.news_validation.total_results > 0 && (
                        <p className="text-sm text-cyan-400 mt-2">
                          Found {result.news_validation.total_results} related articles
                        </p>
                      )}
                    </div>

                    {/* Related Sources */}
                    {result.news_validation.articles && result.news_validation.articles.length > 0 && (
                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                          <ExternalLink className="w-5 h-5 text-cyan-400" />
                          Related Sources
                        </h4>
                        <div className="space-y-3">
                          {result.news_validation.articles.slice(0, 5).map((article, index) => (
                            <a
                              key={index}
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 hover:border-purple-500/50 transition group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-medium text-white group-hover:text-purple-400 transition line-clamp-2">
                                    {article.title}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                                      {article.source}
                                    </span>
                                    {article.published_at && (
                                      <span className="text-xs text-slate-500">
                                        {new Date(article.published_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  {article.description && (
                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                      {article.description}
                                    </p>
                                  )}
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-purple-400 flex-shrink-0" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total Checks</p>
                    <p className="font-semibold text-white">{stats.total_checks}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Verified Real</p>
                    <p className="font-semibold text-white">{stats.real_count}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Detected Fake</p>
                    <p className="font-semibold text-white">{stats.fake_count}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* History Card */}
            {showHistory && history.length > 0 && (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent History</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {history.slice(0, 10).map((item, i) => (
                    <div 
                      key={i}
                      onClick={() => setNewsText(item.text)}
                      className="p-3 bg-slate-900 rounded-xl cursor-pointer hover:bg-slate-800 transition border border-slate-700 hover:border-slate-600"
                    >
                      <p className="text-sm text-slate-300 truncate">{item.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.is_fake 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          {item.prediction}
                        </span>
                        <span className="text-xs text-slate-500">
                          {(item.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Pro Tips</h3>
              </div>
              <ul className="text-sm space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Check the source credibility
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  Look for supporting evidence
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  Verify with multiple sources
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  Be wary of sensational headlines
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
