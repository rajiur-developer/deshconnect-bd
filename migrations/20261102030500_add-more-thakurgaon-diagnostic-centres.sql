-- Additional currently active DGHS-listed Thakurgaon Sadar diagnostic facilities.
with source_rows (slug, name, registry_id, registry_code) as (
  values
    ('nirmal-diagnostic-center-thakurgaon', 'Nirmal Diagnostic Center', 28400, '10028812'),
    ('new-update-diagnostic-centre', 'New Update Diagnostic Centre', 35506, '10035918'),
    ('mam-diagnostic-center-thakurgaon', 'MAM Diagnostic Center', 31934, '10032346'),
    ('rafi-diagnostic-centre-thakurgaon', 'Rafi Diagnostic Centre', 28646, '10029058')
)
insert into public.hospitals (
  slug, name, category, description, address, image, verification, source,
  division_id, district_id, upazila_id, status, last_checked_at, created_at, updated_at
)
select
  s.slug,
  s.name,
  'diagnostic-centre',
  'DGHS-listed consultancy and diagnostic centre. Contact details and exact street address should be confirmed with the facility.',
  'Thakurgaon Sadar, Thakurgaon',
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
join public.upazilas upazila on upazila.slug = 'thakurgaon-sadar' and upazila.district_id = district.id
on conflict (slug) do nothing;
