import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

CMS_BASE = "https://data.cms.gov/provider-data/api/1/datastore/query"

@router.get("/{ccn}")
async def get_provider(ccn: str):
    url = (
        f"{CMS_BASE}/4pq5-n9py/0"
        f"?conditions[0][property]=cms_certification_number_ccn"
        f"&conditions[0][value]={ccn}"
        f"&conditions[0][operator]==&limit=1"
    )
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10)

    results = response.json().get("results", [])

    if not results:
        raise HTTPException(status_code=404, detail="Facility not found")

    return results[0]