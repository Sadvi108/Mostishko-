import trafilatura
from pypdf import PdfReader
from docx import Document as DocxDocument
import io

def parse_pdf(file_content: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_content))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def parse_docx(file_content: bytes) -> str:
    doc = DocxDocument(io.BytesIO(file_content))
    text = "\n".join([para.text for para in doc.paragraphs])
    return text

def parse_text(file_content: bytes) -> str:
    return file_content.decode("utf-8")

def parse_url(url: str) -> str:
    downloaded = trafilatura.fetch_url(url)
    return trafilatura.extract(downloaded)
