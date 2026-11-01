-- Seed currently active DGHS-listed diagnostic facilities in Thakurgaon district.
-- Facility details are sourced from DGHS Facility Registry. Missing street addresses,
-- phone numbers and photographs are intentionally not fabricated; the UI uses a
-- clearly generic diagnostic-centre illustration until a real facility photo is added.
with source_rows (
  slug, name, description, address, phone, email, upazila_slug, registry_id, registry_code
) as (
  values
    ('seven-day-diagnostic-centre', 'Seven Day Diagnostic Centre', 'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.', 'Thakurgaon Sadar, Thakurgaon', '01775403576', '7daynd@gmail.com', 'thakurgaon-sadar', 34296, '10034708'),
    ('thakurgaon-general-hospital-diagnostic-centre', 'Thakurgaon General Hospital & Diagnostic Centre', 'DGHS-listed private hospital and diagnostic facility. Contact details and exact street address should be confirmed with the facility.', 'Thakurgaon Sadar, Thakurgaon', null, null, 'thakurgaon-sadar', 25663, '10026075'),
    ('alpha-diagnostic-center-thakurgaon', 'Alpha Diagnostic Center', 'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.', 'Thakurgaon Sadar, Thakurgaon', null, null, 'thakurgaon-sadar', 26544, '10026956'),
    ('surokkha-diagnostic-centre', 'Surokkha Diagnostic Centre', 'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.', 'Thakurgaon Sadar, Thakurgaon', null, null, 'thakurgaon-sadar', 29645, '10030057'),
    ('esdo-community-hospital-pathology-lab', 'ESDO Community Hospital (Pathological Lab)', 'DGHS-listed pathology laboratory. Contact details and exact street address should be confirmed with the facility.', 'Thakurgaon Sadar, Thakurgaon', null, null, 'thakurgaon-sadar', 30991, '10031403'),
    ('new-desh-diagnostic-centre', 'New Desh Diagnostic Centre', 'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.', 'Thakurgaon Sadar, Thakurgaon', null, null, 'thakurgaon-sadar', 32145, '10032557'),
    ('thakurgaon-swasthoseba-hospital-pathology', 'Thakurgaon Swasthoseba Hospital (Pathology)', 'DGHS-listed pathology facility. Contact details and exact street address should be confirmed with the facility.', 'Thakurgaon Sadar, Thakurgaon', null, null, 'thakurgaon-sadar', 32365, '10032777'),
    ('central-diagnostic-centre-thakurgaon', 'Central Diagnostic Centre', 'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.', 'Thakurgaon Sadar, Thakurgaon', null, 'cdcthak@gmail.com', 'thakurgaon-sadar', 30259, '10030671'),
    ('friends-apollo-diagnostic-centre', 'Friends Apollo Diagnostic Center', 'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.', 'Thakurgaon Sadar, Thakurgaon', null, 'friendsapollohospital@gmail.com', 'thakurgaon-sadar', 35693, '10036105'),
    ('uttara-diagnostic-center-thakurgaon', 'Uttara Diagnostic Center', 'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.', 'Thakurgaon Sadar, Thakurgaon', null, null, 'thakurgaon-sadar', 35484, '10035896'),
    ('amader-hospital-diagnostic-centre', 'Amader Hospital and Diagnostic Centre', 'DGHS-listed private hospital and diagnostic facility. Contact details and exact street address should be confirmed with the facility.', 'Thakurgaon Sadar, Thakurgaon', null, null, 'thakurgaon-sadar', 33995, '10034407'),
    ('ma-diagnostic-centre-thakurgaon', 'MA Diagnostic Centre', 'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.', 'Thakurgaon Sadar, Thakurgaon', null, null, 'thakurgaon-sadar', 40000, '10040412'),
    ('doctors-clinic-digital-diagnostic-complex', 'Doctors Clinic & Digital Diagnostic Complex', 'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.', 'Ranisankail, Thakurgaon', null, 'doctorsclinic4540@gamil.com', 'ranisankail', 33029, '10033441'),
    ('shastho-sheba-digital-diagnostic-center', 'Shastho Sheba Digital Diagnostic Center', 'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.', 'Ranisankail, Thakurgaon', null, null, 'ranisankail', 39431, '10039843'),
    ('ohi-digital-diagnostic-center', 'Ohi Digital Diagnostic Center', 'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.', 'Baliadangi, Thakurgaon', null, 'ohiddc2020@gmail.com', 'baliadangi', 35654, '10036066'),
    ('rozina-diagnostic-centre-haripur', 'Rozina Diagnostic Centre', 'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.', 'Haripur, Thakurgaon', null, 'rozinadiagnosticcenter@gmail.com', 'haripur', 34693, '10035105'),
    ('pirganj-diabetes-general-hospital-pathology', 'Pirganj Diabetes & General Hospital Pathology', 'DGHS-listed pathology facility of Pirganj Diabetic Association. Contact details and exact street address should be confirmed with the facility.', 'Pirganj, Thakurgaon', null, null, 'pirganj', 39770, '10040182')
)
insert into public.hospitals (
  slug, name, category, description, address, phone, email, image, verification, source,
  division_id, district_id, upazila_id, status, last_checked_at, created_at, updated_at
)
select
  s.slug,
  s.name,
  'diagnostic-centre',
  s.description,
  s.address,
  s.phone,
  s.email,
  '/images/hospitals/diagnostic-centre.svg',
  'unverified',
  'DGHS Facility Registry facility #' || s.registry_id::text || ' (code ' || s.registry_code || '): https://hrm.dghs.gov.bd/public/facility-registry/facilities/' || s.registry_id::text || '/profile',
  division.id,
  district.id,
  upazila.id,
  'published',
  now(),
  now(),
  now()
from source_rows s
join public.divisions division on division.slug = 'rangpur'
join public.districts district on district.slug = 'thakurgaon' and district.division_id = division.id
join public.upazilas upazila on upazila.slug = s.upazila_slug and upazila.district_id = district.id
on conflict (slug) do nothing;
