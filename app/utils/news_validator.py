import os
import requests
from typing import Optional, Dict, List
from dotenv import load_dotenv
from datetime import datetime, timedelta
import re

load_dotenv()

class NewsValidator:
    """
    Validates claims against real news sources using multiple APIs.
    Supports: Google News RSS (free), NewsAPI, SerpAPI
    """
    
    def __init__(self):
        self.newsapi_key = os.getenv('NEWSAPI_KEY')
        self.serpapi_key = os.getenv('SERPAPI_KEY')
        # Always enabled because Google News RSS is free and doesn't need API key
        self.enabled = True
        
    def extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text for searching"""
        # Common stop words to filter out
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                      'of', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 
                      'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 
                      'might', 'can', 'said', 'says', 'that', 'this', 'they', 'their', 'them',
                      'there', 'these', 'those', 'what', 'which', 'when', 'where', 'who', 'whom',
                      'how', 'why', 'just', 'only', 'even', 'also', 'very', 'most', 'some', 
                      'many', 'much', 'more', 'other', 'than', 'then', 'now', 'here', 'such',
                      'like', 'into', 'over', 'after', 'before', 'between', 'under', 'again',
                      'about', 'being', 'once', 'during', 'each', 'because', 'through', 'while',
                      'news', 'breaking', 'report', 'says', 'according', 'announced', 'claims',
                      'article', 'story', 'sources', 'officials', 'people', 'percent', 'years'}
        
        # Extract words (including proper nouns with capitals)
        words = re.findall(r'\b[A-Za-z]{3,}\b', text)
        
        # Prioritize capitalized words (likely proper nouns - names, places, organizations)
        proper_nouns = [w for w in words if w[0].isupper() and w.lower() not in stop_words]
        
        # Get other important words
        other_words = [w.lower() for w in words if w.lower() not in stop_words and not w[0].isupper()]
        
        # Combine: proper nouns first, then other words
        keywords = proper_nouns[:4] + other_words[:3]
        
        # Remove duplicates while preserving order
        seen = set()
        unique_keywords = []
        for k in keywords:
            k_lower = k.lower()
            if k_lower not in seen:
                seen.add(k_lower)
                unique_keywords.append(k)
        
        return unique_keywords[:6]
    
    def build_search_query(self, text: str) -> str:
        """Build an effective search query from the text"""
        # Clean the text - remove extra whitespace
        clean_text = ' '.join(text.split())
        
        # If text is short enough, use it directly (best for relevance)
        if len(clean_text) <= 150:
            return clean_text
        
        # For longer text, extract the most important parts
        keywords = self.extract_keywords(text)
        
        if not keywords:
            # Fallback: use first 100 chars
            return clean_text[:100].strip()
        
        # Build query with proper nouns quoted for exact matching
        query_parts = []
        for kw in keywords[:5]:
            if kw[0].isupper():
                query_parts.append(f'"{kw}"')
            else:
                query_parts.append(kw)
        
        return ' '.join(query_parts)
    
    def search_google_news_rss(self, query: str) -> Optional[Dict]:
        """Search Google News RSS feed for free, real-time results"""
        try:
            import urllib.parse
            
            # Google News RSS - free and always up-to-date
            encoded_query = urllib.parse.quote(query)
            url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
            
            response = requests.get(url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            if response.status_code == 200:
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.content)
                
                articles = []
                for item in root.findall('.//item')[:10]:
                    title = item.find('title')
                    link = item.find('link')
                    pub_date = item.find('pubDate')
                    source = item.find('source')
                    
                    if title is not None and link is not None:
                        articles.append({
                            'title': title.text,
                            'url': link.text,
                            'source': source.text if source is not None else 'Google News',
                            'published_at': pub_date.text if pub_date is not None else None,
                            'description': title.text[:200] if title.text else ''
                        })
                
                return {
                    'total_results': len(articles),
                    'articles': articles[:5]
                }
            return None
        except Exception as e:
            print(f"Google News RSS error: {e}")
            return None
    
    def search_newsapi(self, query: str, days: int = 7) -> Optional[Dict]:
        """Search NewsAPI for relevant articles"""
        if not self.newsapi_key or self.newsapi_key == 'your_newsapi_key_here':
            return None
            
        try:
            from_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            url = 'https://newsapi.org/v2/everything'
            
            params = {
                'q': query,
                'from': from_date,
                'sortBy': 'publishedAt',  # Sort by date for recent news
                'language': 'en',
                'pageSize': 10,
                'apiKey': self.newsapi_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                articles = data.get('articles', [])
                
                return {
                    'total_results': data.get('totalResults', 0),
                    'articles': [
                        {
                            'title': article.get('title'),
                            'source': article.get('source', {}).get('name'),
                            'url': article.get('url'),
                            'published_at': article.get('publishedAt'),
                            'description': article.get('description', '')[:200] if article.get('description') else ''
                        }
                        for article in articles[:5]
                    ]
                }
            else:
                print(f"NewsAPI response: {response.status_code} - {response.text[:200]}")
            return None
        except Exception as e:
            print(f"NewsAPI error: {e}")
            return None
    
    def search_serpapi(self, query: str) -> Optional[Dict]:
        """Search Google News using SerpAPI"""
        if not self.serpapi_key or self.serpapi_key == 'your_serpapi_key_here':
            return None
            
        try:
            import serpapi
            
            params = {
                "q": query,
                "tbm": "nws",  # News search
                "api_key": self.serpapi_key,
                "num": 10
            }
            
            results = serpapi.search(params)
            
            news_results = results.get('news_results', [])
            
            return {
                'total_results': len(news_results),
                'articles': [
                    {
                        'title': item.get('title'),
                        'source': item.get('source', {}).get('name') if isinstance(item.get('source'), dict) else item.get('source'),
                        'url': item.get('link'),
                        'published_at': item.get('date'),
                        'description': item.get('snippet', '')[:200]
                    }
                    for item in news_results[:5]
                ]
            }
        except Exception as e:
            print(f"SerpAPI error: {e}")
            return None

    def fetch_article_snippet(self, url: str, max_chars: int = 600) -> str:
        """
        Fetch the opening paragraphs of an article URL so Gemini gets
        real content, not just the headline.
        Returns an empty string on any error (non-blocking).
        """
        if not url or not url.startswith("http"):
            return ""
        try:
            from bs4 import BeautifulSoup
            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/122.0 Safari/537.36"
                )
            }
            resp = requests.get(url, headers=headers, timeout=6, allow_redirects=True)
            if resp.status_code != 200:
                return ""
            soup = BeautifulSoup(resp.text, "html.parser")
            # Remove noise
            for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
                tag.decompose()
            # Collect paragraph text
            paragraphs = [p.get_text(" ", strip=True) for p in soup.find_all("p") if len(p.get_text(strip=True)) > 60]
            snippet = " ".join(paragraphs[:6])
            return snippet[:max_chars].strip()
        except Exception:
            return ""

    def validate_claim(self, text: str) -> Optional[Dict]:
        """
        Validate a claim against real news sources
        
        Args:
            text: The claim to validate
            
        Returns:
            Dict with validation results or None if no API available
        """
        if not self.enabled:
            return None
        
        # Build search query from user's full input
        query = self.build_search_query(text)
        keywords = self.extract_keywords(text)
        
        print(f"🔍 Searching news with query: {query[:100]}...")
        
        # Try Google News RSS first (free, real-time, most relevant)
        print(f"🔍 Searching Google News with query: {query[:80]}...")
        news_results = self.search_google_news_rss(query)
        
        # If no results, try with keywords only
        if not news_results or news_results.get('total_results', 0) == 0:
            keyword_query = ' '.join(keywords[:4]) if keywords else query[:50]
            print(f"🔍 Retry Google News with keywords: {keyword_query}")
            news_results = self.search_google_news_rss(keyword_query)
        
        # If Google News fails, try NewsAPI
        if not news_results or news_results.get('total_results', 0) == 0:
            print("🔍 Trying NewsAPI...")
            news_results = self.search_newsapi(query, days=7)
        
        # If NewsAPI no results, try with keywords
        if not news_results or news_results.get('total_results', 0) == 0:
            keyword_query = ' '.join(keywords[:4]) if keywords else query[:50]
            news_results = self.search_newsapi(keyword_query, days=7)
        
        # If NewsAPI fails, try SerpAPI
        if not news_results or news_results.get('total_results', 0) == 0:
            print("🔍 Trying SerpAPI...")
            news_results = self.search_serpapi(query)
        
        # If still no results, try SerpAPI with keywords
        if not news_results or news_results.get('total_results', 0) == 0:
            keyword_query = ' '.join(keywords[:4]) if keywords else query[:50]
            news_results = self.search_serpapi(keyword_query)
        
        if not news_results:
            return {
                'news_validation_enabled': True,
                'verification_status': 'unavailable',
                'confidence': 0.5,
                'message': 'News validation service unavailable.',
                'total_results': 0,
                'relevant_articles': 0,
                'articles': [],
                'search_keywords': keywords[:3],
                'search_query': query[:100]
            }
        
        # Analyze results
        total_articles = news_results.get('total_results', 0)
        articles = news_results.get('articles', [])
        
        # Check if any articles are relevant by matching keywords or text fragments
        relevant_count = 0
        relevant_articles = []
        
        # Also check for words from the original text
        text_words = set(word.lower() for word in text.split() if len(word) > 4)
        
        for article in articles:
            title = article.get('title', '').lower()
            desc = article.get('description', '').lower() if article.get('description') else ''
            article_text = title + ' ' + desc
            
            # Check if keywords appear in article
            keyword_matches = 0
            for keyword in keywords[:5]:
                kw_lower = keyword.lower()
                if kw_lower in article_text:
                    keyword_matches += 1
            
            # Also check for common words from original text
            text_matches = sum(1 for w in text_words if w in article_text)
            
            # Consider relevant if keyword match or significant text overlap
            if keyword_matches >= 1 or text_matches >= 3:
                relevant_count += 1
                article['relevance_score'] = keyword_matches + (text_matches * 0.5)
                relevant_articles.append(article)
        
        # Sort by relevance score and prioritize
        relevant_articles.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)

        # Combine: relevant first, then others
        if relevant_articles:
            other_articles = [a for a in articles if a not in relevant_articles]
            articles = relevant_articles[:3] + other_articles[:2]

        # ── Fetch real article body snippets for Gemini context ──────────────
        # Only fetch for the top 3 to keep response time reasonable
        print(f"📰 Fetching article snippets for top {min(3, len(articles))} articles...")
        for art in articles[:3]:
            url = art.get('url', '')
            if url:
                art['fetched_snippet'] = self.fetch_article_snippet(url)
                if art['fetched_snippet']:
                    print(f"   ✓ Fetched snippet from {art.get('source','?')} ({len(art['fetched_snippet'])} chars)")
                else:
                    print(f"   ✗ Could not fetch snippet from {url[:60]}")
        
        # Calculate confidence based on findings
        if total_articles == 0:
            verification_status = "unverified"
            confidence = 0.3
            message = "No recent news articles found matching this claim."
        elif relevant_count >= 2:
            verification_status = "found"
            confidence = min(0.9, 0.5 + (relevant_count * 0.1))
            message = f"Found {relevant_count} relevant news articles discussing this topic."
        elif relevant_count == 1:
            verification_status = "limited"
            confidence = 0.6
            message = "Found limited news coverage of this topic."
        else:
            verification_status = "not_found"
            confidence = 0.4
            message = "No relevant news articles found. This may be unverified information."
        
        return {
            'news_validation_enabled': True,
            'verification_status': verification_status,
            'confidence': confidence,
            'message': message,
            'total_results': total_articles,
            'relevant_articles': relevant_count,
            'articles': articles[:5],
            'search_keywords': keywords[:4],
            'search_query': query[:100]
        }
    
    def enhance_prediction(self, bert_result: Dict, ai_result: Optional[Dict], 
                          news_validation: Optional[Dict]) -> Dict:
        """
        Enhance the final prediction with news validation data.
        NEWS SOURCES CAN OVERRIDE AI/MODEL PREDICTIONS when strong evidence exists.
        
        Args:
            bert_result: Model prediction (already corrected by AI silently)
            ai_result: AI prediction (can be None)
            news_validation: News validation results (can be None)
            
        Returns:
            Enhanced prediction with news validation insights
        """
        result = bert_result.copy()
        
        # Add news validation data
        if news_validation:
            result['news_validation'] = news_validation
            
            # Adjust final prediction based on news validation
            verification = news_validation['verification_status']
            relevant_count = news_validation.get('relevant_articles', 0)
            
            if verification == 'not_found':
                # No news found - slightly reduce confidence in a "real" prediction
                result['news_insight'] = "⚠️ No recent news coverage found. Treat with caution."
                result['verification_boost'] = -0.1
                
                if result.get('prediction') == 'real':
                    result['confidence'] = max(0.3, result.get('confidence', 0.5) - 0.1)
                    result['probabilities'] = {'real': result['confidence'], 'fake': 1 - result['confidence']}
                
            elif verification == 'found':
                # Related articles found - informational only, does NOT verify the claim
                result['news_insight'] = f"ℹ️ Found {relevant_count} related news article(s) on this topic."
                result['verification_boost'] = 0.05
                # NOTE: Finding related articles does not mean the specific claim is true.
                # The model prediction is preserved as-is.
                
            elif verification == 'limited':
                result['news_insight'] = "ℹ️ Limited related news coverage found."
                result['verification_boost'] = 0.0
                # NOTE: Finding related articles does not mean the specific claim is true.
                # The model prediction is preserved as-is.
                
            else:  # unverified
                result['news_insight'] = "Unable to verify against news sources."
                result['verification_boost'] = 0.0
        else:
            result['news_validation'] = None
            result['news_insight'] = "News validation not available."
            result['verification_boost'] = 0.0
        
        # Update is_fake based on final prediction
        if result.get('prediction'):
            result['is_fake'] = result['prediction'] == 'fake'
        
        return result

# Global instance
news_validator = NewsValidator()
