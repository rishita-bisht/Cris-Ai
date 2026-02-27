from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "CRIS Backend is running!"}