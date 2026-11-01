-- Add independently discoverable private hospitals and diagnostic centres in Thakurgaon.
-- Public map/directory listings are marked unverified unless corroborated by DGHS.
-- The existing neutral illustration is used where no facility-owned photo URL was verified.
with source_rows (
  slug, name, category, description, address, phone, upazila_slug, verification, source
) as (
  values
    ('new-popular-hospital-thakurgaon', 'New Popular Hospital and Diagnostic Center', 'hospital',
      'Private hospital and diagnostic facility listed on Google Maps. Confirm department availability and contact details before visiting.',
      '2FHF+R63, Bangabandhu Road, Thakurgaon Sadar, Thakurgaon', '+8801784909661', 'thakurgaon-sadar', 'unverified',
      'Google Maps listing: https://www.google.com/maps/search/?api=1&query=New+Popular+Hospital+and+Diagnostic+Center+Thakurgaon'),
    ('neuron-hospital-diagnostic-thakurgaon', 'Neuron Hospital & Diagnostic Center', 'hospital',
      'Private hospital and diagnostic facility listed at Zamzam Tower. Confirm current services directly with the facility.',
      '3rd & 4th Floor, Zamzam Tower, Bangabandhu Road, Thakurgaon Sadar, Thakurgaon', '+8801770779211', 'thakurgaon-sadar', 'unverified',
      'Google Maps listing: https://www.google.com/maps/search/?api=1&query=Neuron+Hospital+Diagnostic+Center+Thakurgaon'),
    ('rainbow-diagnostic-center-thakurgaon', 'Rainbow Diagnostic Center', 'diagnostic-centre',
      'Diagnostic facility listed on Bangabandhu Road in Thakurgaon town. Service details should be confirmed with the facility.',
      'Bangabandhu Road, Thakurgaon Sadar, Thakurgaon', '+8801869061360', 'thakurgaon-sadar', 'unverified',
      'Google Maps listing: https://www.google.com/maps/search/?api=1&query=Rainbow+Diagnostic+Center+Thakurgaon; Website: https://rdcthakurgaon.com'),
    ('new-ideal-hospital-thakurgaon', 'New Ideal Hospital', 'hospital',
      'Private hospital listed on Sirajuddowlah Road, Thakurgaon town. Confirm current departments and admission availability directly.',
      '2FJH+57M, Sirajuddowlah Road, Thakurgaon Sadar, Thakurgaon', '+8801723016442', 'thakurgaon-sadar', 'unverified',
      'Google Maps listing: https://www.google.com/maps/search/?api=1&query=New+Ideal+Hospital+Thakurgaon'),
    ('northern-hospital-diagnostic-thakurgaon', 'Northern Hospital & Diagnostic Center', 'hospital',
      'Private hospital and diagnostic facility listed along the Dhaka–Rangpur Highway in Thakurgaon.',
      '2FJJ+WQJ, Dhaka–Rangpur Highway, Thakurgaon Sadar, Thakurgaon', null, 'thakurgaon-sadar', 'unverified',
      'Google Maps listing: https://www.google.com/maps/search/?api=1&query=Northern+Hospital+Diagnostic+Center+Thakurgaon'),
    ('eliza-nursing-home-diagnostics-thakurgaon', 'Eliza Nursing Home and Diagnostics Center', 'hospital',
      'Private nursing home and diagnostic facility listed in the DGHS Facility Registry as ELIZA NURNING HOME (facility code 10022883).',
      '2FJG+GPR, Sirajuddowlah Road, Thakurgaon Sadar, Thakurgaon', null, 'thakurgaon-sadar', 'verified',
      'DGHS Facility Registry code 10022883; Google Maps listing: https://www.google.com/maps/search/?api=1&query=Eliza+Nursing+Home+Thakurgaon'),
    ('hasan-xray-clinic-pathology-thakurgaon', 'Hasan X-Ray Clinic and Pathology', 'diagnostic-centre',
      'X-ray and pathology diagnostic facility listed opposite the fire service on Clinic Lane, Thakurgaon town.',
      '2FHF+8GM, opposite Fire Service, Clinic Lane, Thakurgaon Sadar, Thakurgaon', '+8801740835315', 'thakurgaon-sadar', 'unverified',
      'Google Maps listing: https://www.google.com/maps/search/?api=1&query=Hasan+X-Ray+Clinic+Pathology+Thakurgaon'),
    ('seba-diagnostic-center-thakurgaon', 'Seba Diagnostic Center', 'diagnostic-centre',
      'Diagnostic centre listed on Bangabandhu Road, west of the 250-bed hospital area, Thakurgaon town.',
      '2FJG+268, Bangabandhu Road, Thakurgaon Sadar, Thakurgaon', '+8801713671229', 'thakurgaon-sadar', 'unverified',
      'Google Maps listing: https://www.google.com/maps/search/?api=1&query=Seba+Diagnostic+Center+Thakurgaon'),
    ('momi-hospital-diagnostic-baliadangi', 'Momi Hospital & Diagnostic Center', 'hospital',
      'Private hospital and diagnostic facility listed on Baliadangi–Lahiri Hat Road. A past public report noted its registration period had expired in 2022–2023; current licensing should be checked.',
      '37XH+C4W, Baliadangi–Lahiri Hat Road, Baliadangi, Thakurgaon', '+8801719422675', 'baliadangi', 'unverified',
      'Google Maps listing: https://www.google.com/maps/search/?api=1&query=Momi+Hospital+Diagnostic+Center+Baliadangi; public registration-status report (2022–2023)'),
    ('mission-general-hospital-ranisankail', 'Mission General Hospital', 'hospital',
      'Private specialized hospital listed in Ranisankail. A precise street address and service details were not confirmed in public listings.',
      'Ranisankail, Thakurgaon', '+8801777239335', 'ranisankail', 'unverified',
      'Google Maps listing: https://www.google.com/maps/search/?api=1&query=Mission+General+Hospital+Ranisankail+Thakurgaon')
)
insert into public.hospitals (
  slug, name, category, description, address, phone, image, verification, source,
  division_id, district_id, upazila_id, status, last_checked_at, created_at, updated_at
)
select
  s.slug, s.name, s.category, s.description, s.address, s.phone,
  '/images/hospitals/diagnostic-centre.svg',
  s.verification, s.source,
  division.id, district.id, upazila.id,
  'published', now(), now(), now()
from source_rows s
join public.divisions division on division.slug = 'rangpur'
join public.districts district on district.slug = 'thakurgaon' and district.division_id = division.id
join public.upazilas upazila on upazila.slug = s.upazila_slug and upazila.district_id = district.id
on conflict (slug) do nothing;
