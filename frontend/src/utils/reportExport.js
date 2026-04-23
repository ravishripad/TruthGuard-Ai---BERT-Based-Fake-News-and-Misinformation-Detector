const PDF_PAGE_WIDTH = 612;
const PDF_PAGE_HEIGHT = 792;
const PDF_MARGIN_X = 50;
const PDF_START_Y = 742;
const PDF_LINE_HEIGHT = 16;
const PDF_MAX_CHARS = 88;
const PDF_LINES_PER_PAGE = 40;

const sanitizeFileName = (value) =>
  (value || 'fact-check-report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'fact-check-report';

const normalizeText = (value) =>
  String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\u2022/g, '-')
    .trim();

const buildNewsSection = (result) => {
  const articles = result.news_validation?.articles || [];
  if (!articles.length) return 'Related articles: none';

  return [
    'Related articles:',
    ...articles.slice(0, 5).map((article, index) => {
      const source = article.source || 'Unknown source';
      const title = article.title || 'Untitled article';
      const url = article.url || 'No URL';
      return `${index + 1}. ${title} | ${source} | ${url}`;
    }),
  ].join('\n');
};

export const buildFactCheckReportText = (result, analysisTime) => {
  const sections = [
    'thruthGuard AI Fact Check Report',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    'Summary',
    `Claim: ${result.text || 'N/A'}`,
    `Verdict: ${String(result.prediction || 'unknown').toUpperCase()}`,
    `Confidence: ${((result.confidence || 0) * 100).toFixed(1)}%`,
    `Scan time: ${analysisTime ? `${analysisTime}s` : 'N/A'}`,
    `Decision source: ${result.prediction_source || 'unknown'}`,
    '',
    'Probabilities',
    `Fake: ${(((result.probabilities?.fake || 0) * 100)).toFixed(1)}%`,
    `Real: ${(((result.probabilities?.real || 0) * 100)).toFixed(1)}%`,
    '',
    'Reasoning',
    result.reasoning || 'No reasoning available.',
    '',
    'Workflow Notes',
    result.extracted_from_image
      ? 'Input came from OCR extraction on an uploaded image.'
      : result.extracted_from_url
        ? 'Input came from scraping a provided article URL.'
        : 'Input came from direct text entry.',
    result.news_insight || 'No additional news insight available.',
    '',
    'News Validation',
    `Verification status: ${result.news_validation?.verification_status || 'unavailable'}`,
    `Relevant articles: ${result.news_validation?.relevant_articles ?? 0}`,
    buildNewsSection(result),
  ];

  if (result.url_extraction) {
    sections.push(
      '',
      'URL Extraction',
      `Source: ${result.url_extraction.source || result.url_extraction.domain || 'Unknown'}`,
      `URL: ${result.url_extraction.url || 'N/A'}`,
      `Preview: ${result.url_extraction.text_preview || 'N/A'}`
    );
  }

  if (result.image_extraction) {
    sections.push(
      '',
      'Image Extraction',
      `Title: ${result.image_extraction.title || 'N/A'}`,
      `Source: ${result.image_extraction.source || 'N/A'}`,
      `Date: ${result.image_extraction.date || 'N/A'}`
    );
  }

  return sections.join('\n');
};

const triggerDownload = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const downloadFactCheckTxt = (result, analysisTime) => {
  const text = buildFactCheckReportText(result, analysisTime);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, `${sanitizeFileName(result.text)}.txt`);
};

const escapePdfText = (value) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '');

const wrapLine = (line, maxChars = PDF_MAX_CHARS) => {
  if (!line) return [''];

  const words = line.split(/\s+/);
  const wrapped = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      return;
    }

    if (current) wrapped.push(current);

    if (word.length <= maxChars) {
      current = word;
      return;
    }

    for (let index = 0; index < word.length; index += maxChars) {
      wrapped.push(word.slice(index, index + maxChars));
    }
    current = '';
  });

  if (current) wrapped.push(current);
  return wrapped.length ? wrapped : [''];
};

const paginateText = (text) => {
  const normalized = normalizeText(text)
    .normalize('NFKD')
    .replace(/[^\x20-\x7E\n]/g, '');

  const lines = normalized
    .split('\n')
    .flatMap((line) => (line ? wrapLine(line) : ['']));

  const pages = [];
  for (let index = 0; index < lines.length; index += PDF_LINES_PER_PAGE) {
    pages.push(lines.slice(index, index + PDF_LINES_PER_PAGE));
  }
  return pages.length ? pages : [['Fact check report was empty.']];
};

const buildPdf = (text) => {
  const pages = paginateText(text);
  const objects = [];

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  const pageRefs = [];
  let objectIndex = 4;

  pages.forEach((pageLines) => {
    const pageObjectNumber = objectIndex++;
    const contentObjectNumber = objectIndex++;
    pageRefs.push(`${pageObjectNumber} 0 R`);

    const contentLines = [
      'BT',
      '/F1 11 Tf',
      `${PDF_MARGIN_X} ${PDF_START_Y} Td`,
      `${PDF_LINE_HEIGHT} TL`,
      ...pageLines.flatMap((line, index) =>
        index === 0 ? [`(${escapePdfText(line)}) Tj`] : ['T*', `(${escapePdfText(line)}) Tj`]
      ),
      'ET',
    ];

    const contentStream = contentLines.join('\n');
    objects[contentObjectNumber] = `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`;
    objects[pageObjectNumber] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
  });

  objects[2] = `<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${pages.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += '0000000000 65535 f \n';

  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
};

export const downloadFactCheckPdf = (result, analysisTime) => {
  const text = buildFactCheckReportText(result, analysisTime);
  const blob = buildPdf(text);
  triggerDownload(blob, `${sanitizeFileName(result.text)}.pdf`);
};
