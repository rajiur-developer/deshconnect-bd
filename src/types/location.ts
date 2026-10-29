/** Geographic hierarchy: Division → District → Upazila → Union. */
export interface Division {
id: string;
slug: string;
name: string;
bnName: string;
capital: string;
districtsCount: number;
summary: string;
image: string; }
export interface District {
id: string;
slug: string;
name: string;
divisionId: string;
summary: string;
image: string; }
export interface Upazila {
id: string;
slug: string;
name: string;
districtId: string;
image?: string;
summary?: string; }
export interface Union {
id: string;
slug: string;
name: string;
upazilaId: string; }
/** Flat shape used by dependent selects and filters. */ export interface LocationRef {
divisionId?: string | null;
districtId?: string | null;
upazilaId?: string | null; }
