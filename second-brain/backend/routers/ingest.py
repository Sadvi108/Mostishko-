from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..ingestion.pipeline import ingest_document

router = APIRouter()

@router.post("/ingest/file")
async def ingest_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    content = await file.read()
    file_type = file.filename.split('.')[-1].lower()
    
    if file_type not in ['pdf', 'docx', 'txt', 'md']:
        # Treat txt and md as text
        if file_type not in ['txt', 'md']:
             raise HTTPException(status_code=400, detail="Unsupported file type")
        file_type = 'text' # internal type for parser
    elif file_type == 'txt' or file_type == 'md':
        file_type = 'text'

    try:
        result = await ingest_document(
            db=db,
            file_content=content,
            filename=file.filename,
            file_type=file_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/text")
async def ingest_text(
    text: str = Form(...),
    title: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        result = await ingest_document(
            db=db,
            file_content=text.encode('utf-8'),
            filename=title,
            file_type='text'
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/url")
async def ingest_url_endpoint(
    url: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        result = await ingest_document(
            db=db,
            url=url
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
