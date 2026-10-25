alter table public.content_categories
  drop constraint if exists content_categories_section_check;

alter table public.content_categories
  add constraint content_categories_section_check
  check (section in ('place', 'news', 'institution'));

insert into public.content_categories (section, value, name) values
  ('institution', 'school', 'School'),
  ('institution', 'college', 'College'),
  ('institution', 'madrasah', 'Madrasah'),
  ('institution', 'university', 'University'),
  ('institution', 'kindergarten', 'Kindergarten'),
  ('institution', 'education-centre', 'Other education centre'),
  ('institution', 'hospital', 'Hospital'),
  ('institution', 'health-centre', 'Health centre')
on conflict (section, value) do update set name = excluded.name;