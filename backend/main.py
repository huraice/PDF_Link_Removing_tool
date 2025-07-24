from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
import fitz  # PyMuPDF
import io

app = FastAPI()

# ✅ Add this route for connection check
@app.get("/ping")
def ping():
    return {"message": "Backend is connected successfully"}
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/clean-pdf")
async def clean_pdf(file: UploadFile = File(...)):
    input_bytes = await file.read()
    doc = fitz.open(stream=input_bytes, filetype="pdf")

    for page in doc:
        links = page.get_links()
        for link in links:
            if 'uri' in link and link['uri'].startswith("http"):
                page.delete_link(link)

    output_stream = io.BytesIO()
    doc.save(output_stream)
    output_stream.seek(0)
    doc.close()

    return StreamingResponse(output_stream, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=cleaned_{file.filename}"
    })
@app.get("/")
def home():
    return {"message": "PDF Link Remover Backend is Running"}