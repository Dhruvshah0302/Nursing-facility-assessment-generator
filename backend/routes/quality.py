import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

CMS_BASE = "https://data.cms.gov/provider-data/api/1/datastore/query"

MEASURE_MAP = {
    "521": "str_hospitalization",
    "522": "str_ed_visit",
    "551": "lt_hospitalization",
    "552": "lt_ed_visit",
}

@router.get("/{ccn}")
async def get_quality(ccn: str):
    url = (
        f"{CMS_BASE}/ijh5-nb2v/0"
        f"?conditions[0][property]=cms_certification_number_ccn"
        f"&conditions[0][value]={ccn}"
        f"&conditions[0][operator]==&limit=20"
    )
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10)

    results = response.json().get("results", [])

    mapped = {}
    for row in results:
        code = str(row.get("measure_code", ""))
        if code in MEASURE_MAP:
            mapped[MEASURE_MAP[code]] = (
                row.get("adjusted_score") or row.get("observed_score")
            )

    return mapped