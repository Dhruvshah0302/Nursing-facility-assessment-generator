import httpx
import asyncio
from fastapi import APIRouter

router = APIRouter()

CMS_BASE = "https://data.cms.gov/provider-data/api/1/datastore/query"

@router.get("/{state}")
async def get_averages(state: str):
    nat_url = (
        f"{CMS_BASE}/xcdc-v8bm/0"
        f"?conditions[0][property]=state_or_nation"
        f"&conditions[0][value]=NATION"
        f"&conditions[0][operator]==&limit=1"
    )
    state_url = (
        f"{CMS_BASE}/xcdc-v8bm/0"
        f"?conditions[0][property]=state_or_nation"
        f"&conditions[0][value]={state.upper()}"
        f"&conditions[0][operator]==&limit=1"
    )

    async with httpx.AsyncClient() as client:
        nat_res, state_res = await asyncio.gather(
            client.get(nat_url, timeout=10),
            client.get(state_url, timeout=10)
        )

    national = nat_res.json().get("results", [{}])[0]
    state_data = state_res.json().get("results", [{}])[0]

    def extract(row):
        return {
            "str_hospitalization": row.get("percentage_of_short_stay_residents_who_were_rehospitalized__1d02"),
            "str_ed_visit": row.get("percentage_of_short_stay_residents_who_had_an_outpatient_em_d911"),
            "lt_hospitalization": row.get("number_of_hospitalizations_per_1000_longstay_resident_days"),
            "lt_ed_visit": row.get("number_of_outpatient_emergency_department_visits_per_1000_l_de9d"),
        }

    return {
        "national": extract(national),
        "state": extract(state_data)
    }