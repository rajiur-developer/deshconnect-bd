import { NextRequest, NextResponse } from "next/server";
import { listDistricts, listDivisions, listUpazilas } from "@/services/locations";
export const dynamic = "force-dynamic";
/** Dependent-select data for Division → District → Upazila. */ export async function GET(request: NextRequest) {
const { searchParams } = new URL(request.url);
const districtId = searchParams.get("districtId");
const divisionId = searchParams.get("divisionId");
if (districtId) {
const upazilas = await listUpazilas(districtId);
return NextResponse.json({ upazilas });
}
if (divisionId) {
const districts = await listDistricts(divisionId);
return NextResponse.json({ districts });
}
const divisions = await listDivisions();
return NextResponse.json({ divisions }); }
