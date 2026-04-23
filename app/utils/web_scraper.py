import re
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup


class WebArticleScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/123.0.0.0 Safari/537.36"
                ),
                "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            }
        )

    def _clean_text(self, value: str | None) -> str:
        if not value:
            return ""
        return re.sub(r"\s+", " ", value).strip()

    def _extract_title(self, soup: BeautifulSoup) -> str:
        title_candidates = [
            soup.find("meta", property="og:title"),
            soup.find("meta", attrs={"name": "twitter:title"}),
        ]

        for candidate in title_candidates:
            if candidate and candidate.get("content"):
                title = self._clean_text(candidate.get("content"))
                if title:
                    return title

        if soup.title and soup.title.string:
            title = self._clean_text(soup.title.string)
            if title:
                return title

        h1 = soup.find("h1")
        if h1:
            return self._clean_text(h1.get_text(" ", strip=True))

        return ""

    def _extract_site_name(self, soup: BeautifulSoup, domain: str) -> str:
        site_meta = soup.find("meta", property="og:site_name")
        if site_meta and site_meta.get("content"):
            return self._clean_text(site_meta.get("content"))
        return domain

    def _extract_description(self, soup: BeautifulSoup) -> str:
        description_candidates = [
            soup.find("meta", property="og:description"),
            soup.find("meta", attrs={"name": "description"}),
            soup.find("meta", attrs={"name": "twitter:description"}),
        ]

        for candidate in description_candidates:
            if candidate and candidate.get("content"):
                description = self._clean_text(candidate.get("content"))
                if description:
                    return description
        return ""

    def _collect_candidate_text(self, soup: BeautifulSoup) -> list[str]:
        selectors = [
            "article p",
            "main p",
            "[role='main'] p",
            ".article-body p",
            ".story-body p",
            ".entry-content p",
            ".post-content p",
            ".content p",
            "p",
        ]

        paragraphs = []
        seen = set()
        for selector in selectors:
            for node in soup.select(selector):
                paragraph = self._clean_text(node.get_text(" ", strip=True))
                if len(paragraph) < 35:
                    continue
                if paragraph in seen:
                    continue
                seen.add(paragraph)
                paragraphs.append(paragraph)
            if len(paragraphs) >= 6:
                break
        return paragraphs

    def scrape(self, url: str, max_chars: int = 6000) -> dict:
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("Please enter a valid article URL starting with http:// or https://")

        response = self.session.get(url, timeout=12, allow_redirects=True)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "").lower()
        if "html" not in content_type and "xml" not in content_type and response.text[:20].strip().lower().startswith("<html") is False:
            raise ValueError("That URL did not return a readable HTML news page.")

        final_url = response.url
        final_domain = urlparse(final_url).netloc.replace("www.", "")

        soup = BeautifulSoup(response.text, "html.parser")
        for tag in soup(["script", "style", "nav", "header", "footer", "aside", "form", "noscript", "svg"]):
            tag.decompose()

        title = self._extract_title(soup)
        site_name = self._extract_site_name(soup, final_domain)
        description = self._extract_description(soup)
        paragraphs = self._collect_candidate_text(soup)
        article_text = " ".join(paragraphs)
        article_text = article_text[:max_chars].strip()

        if not title:
            title = description[:220] if description else (article_text[:220] if article_text else final_domain)

        if len(article_text) < 80 and description:
            article_text = f"{description}. {article_text}".strip(". ")

        if len(article_text) < 80 and title:
            article_text = f"{title}. {article_text}".strip(". ")

        if len(title) < 5:
            raise ValueError("The page did not expose a readable article headline.")

        if len(article_text) < 40:
            raise ValueError("Could not scrape enough readable article text from that URL.")

        return {
            "title": title[:300],
            "text": article_text,
            "source": site_name,
            "url": final_url,
            "domain": final_domain,
            "description": description[:300] if description else None,
        }


web_scraper = WebArticleScraper()
