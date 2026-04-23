import os
import base64
import requests
from dotenv import load_dotenv
from typing import Optional, Dict

try:
    # mistralai>=1.x
    from mistralai import Mistral
except Exception:
    try:
        # mistralai<1.x
        from mistralai.client import MistralClient as Mistral
    except Exception:
        Mistral = None

load_dotenv()

class ImageOCR:
    """
    Extract text from news images using Mistral OCR API.
    Useful for analyzing screenshots of news shared on social media.
    """
    
    def __init__(self):
        self.api_key = os.getenv('MISTRAL_API_KEY')
        self.enabled = False
        self.client = None
        self.use_http_fallback = False
        self.model = "mistral-ocr-latest"  # Mistral's OCR model

        if not (self.api_key and self.api_key != 'your_api_key_here' and len(self.api_key) > 10):
            print("⚠ MISTRAL_API_KEY not configured, image OCR disabled")
            return

        if Mistral is not None:
            try:
                self.client = Mistral(api_key=self.api_key)
                self.enabled = True
                print("✓ Image OCR (Mistral OCR SDK) initialized successfully")
                return
            except Exception as e:
                print(f"⚠ Failed to initialize Mistral OCR SDK: {e}")

        # SDK import/init can fail in some cloud images; use direct HTTP API fallback.
        self.use_http_fallback = True
        self.enabled = True
        print("⚠ Mistral SDK unavailable, using direct HTTP OCR fallback")
    
    def extract_text_from_image(self, image_data: bytes, mime_type: str = "image/jpeg") -> Optional[Dict]:
        """
        Extract news title and text from an image using Mistral OCR.
        
        Args:
            image_data: Raw image bytes
            mime_type: Image MIME type (image/jpeg, image/png, etc.)
            
        Returns:
            Dict with extracted title, text, and metadata
        """
        if not self.enabled:
            return None
        
        try:
            # Convert to base64
            base64_image = base64.b64encode(image_data).decode('utf-8')
            return self._call_mistral_ocr(base64_image, mime_type)
            
        except Exception as e:
            print(f"Image OCR error: {e}")
            return {
                "title": "NOT_FOUND",
                "text": "NOT_FOUND",
                "source": "NOT_FOUND",
                "date": "NOT_FOUND",
                "error": str(e),
                "extraction_success": False
            }
    
    def _call_mistral_ocr(self, base64_image: str, mime_type: str) -> Dict:
        """Call Mistral OCR API for text extraction."""
        
        try:
            # Use Mistral OCR API with base64 image
            image_data_url = f"data:{mime_type};base64,{base64_image}"
            if self.client and not self.use_http_fallback:
                ocr_response = self.client.ocr.process(
                    model=self.model,
                    document={
                        "type": "image_url",
                        "image_url": image_data_url
                    }
                )
            else:
                ocr_response = self._call_mistral_ocr_http(image_data_url)

            extracted_text = self._extract_text_from_ocr_response(ocr_response)
            
            extracted_text = extracted_text.strip()
            
            if not extracted_text:
                return {
                    "title": "NOT_FOUND",
                    "text": "NOT_FOUND",
                    "source": "NOT_FOUND",
                    "date": "NOT_FOUND",
                    "extraction_success": False
                }
            
            # Parse the extracted text to find title and content
            return self._parse_extracted_text(extracted_text)
            
        except Exception as e:
            print(f"Mistral OCR API error: {e}")
            return {
                "title": "NOT_FOUND",
                "text": "NOT_FOUND",
                "source": "NOT_FOUND",
                "date": "NOT_FOUND",
                "error": str(e),
                "extraction_success": False
            }

    def _call_mistral_ocr_http(self, image_data_url: str) -> Dict:
        """Fallback to Mistral OCR REST API if SDK is unavailable."""
        if not self.api_key:
            raise RuntimeError("MISTRAL_API_KEY is missing")

        response = requests.post(
            "https://api.mistral.ai/v1/ocr",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": self.model,
                "document": {
                    "type": "image_url",
                    "image_url": image_data_url,
                },
            },
            timeout=60,
        )
        response.raise_for_status()
        return response.json()

    def _extract_text_from_ocr_response(self, ocr_response) -> str:
        """Extract page text from both SDK objects and HTTP JSON responses."""
        extracted_text = ""

        if isinstance(ocr_response, dict):
            pages = ocr_response.get("pages", [])
            for page in pages:
                markdown = page.get("markdown") if isinstance(page, dict) else None
                text = page.get("text") if isinstance(page, dict) else None
                if markdown:
                    extracted_text += markdown + "\n"
                elif text:
                    extracted_text += text + "\n"
            return extracted_text.strip()

        if ocr_response and hasattr(ocr_response, 'pages'):
            for page in ocr_response.pages:
                if hasattr(page, 'markdown') and page.markdown:
                    extracted_text += page.markdown + "\n"
                elif hasattr(page, 'text') and page.text:
                    extracted_text += page.text + "\n"

        return extracted_text.strip()
    
    def _parse_extracted_text(self, text: str) -> Dict:
        """Parse OCR extracted text to identify title, content, source, and date."""
        
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        if not lines:
            return {
                "title": "NOT_FOUND",
                "text": "NOT_FOUND",
                "source": "NOT_FOUND",
                "date": "NOT_FOUND",
                "extraction_success": False
            }
        
        # Heuristic: First substantial line is likely the title
        title = "NOT_FOUND"
        text_content = "NOT_FOUND"
        source = "NOT_FOUND"
        date = "NOT_FOUND"
        
        # Find title (first line with significant content)
        for i, line in enumerate(lines):
            # Skip very short lines or common UI elements
            if len(line) > 15 and not any(x in line.lower() for x in ['follow', 'share', 'comment', 'like', 'reply', 'retweet']):
                title = line[:300]  # Limit title length
                # Rest is the text content
                remaining_lines = lines[i+1:] if i+1 < len(lines) else []
                if remaining_lines:
                    text_content = ' '.join(remaining_lines)[:2000]  # Limit text length
                break
        
        # If no title found, use first line
        if title == "NOT_FOUND" and lines:
            title = lines[0][:300]
            if len(lines) > 1:
                text_content = ' '.join(lines[1:])[:2000]
        
        # Try to detect source (common news sources)
        source_keywords = ['reuters', 'bbc', 'cnn', 'fox', 'nbc', 'abc', 'times', 'post', 'guardian', 'india today', 'ndtv', 'hindu', 'express', 'twitter', 'x.com', 'facebook', 'instagram']
        for line in lines:
            line_lower = line.lower()
            for keyword in source_keywords:
                if keyword in line_lower:
                    source = line[:100]
                    break
            if source != "NOT_FOUND":
                break
        
        # Try to detect date patterns
        import re
        date_patterns = [
            r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',  # DD/MM/YYYY or similar
            r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}',  # 26 Feb 2026
            r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}',  # Feb 26, 2026
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                date = match.group()
                break
        
        return {
            "title": title,
            "text": text_content if text_content != "NOT_FOUND" else title,
            "source": source,
            "date": date,
            "raw_text": text[:3000],
            "extraction_success": True
        }
    
    def extract_from_base64(self, base64_string: str, mime_type: str = "image/jpeg") -> Optional[Dict]:
        """
        Extract text from a base64-encoded image.
        
        Args:
            base64_string: Base64 encoded image string
            mime_type: Image MIME type
            
        Returns:
            Dict with extracted text
        """
        if not self.enabled:
            return None
            
        try:
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            return self._call_mistral_ocr(base64_string, mime_type)
        except Exception as e:
            print(f"Image OCR error: {e}")
            return {
                "title": "NOT_FOUND",
                "text": "NOT_FOUND",
                "source": "NOT_FOUND",
                "date": "NOT_FOUND",
                "error": str(e),
                "extraction_success": False
            }


# Global instance
image_ocr = ImageOCR()
