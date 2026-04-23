insert into public.categories (slug, name, description, icon, active, sort_order)
values
  ('plumbing', 'Plumbing', 'Leaks, boilers, installations, and emergency callouts.', 'wrench', true, 10),
  ('electrical', 'Electrical', 'Rewiring, lighting, EV chargers, and safety certificates.', 'zap', true, 20),
  ('painting-decorating', 'Painting & Decorating', 'Interior, exterior, wallpapering, and finishing work.', 'paintbrush', true, 30),
  ('cleaning', 'Cleaning', 'Domestic, deep cleaning, and end-of-tenancy services.', 'sparkles', true, 40),
  ('handyman', 'Handyman', 'Repairs, fittings, assembly, and general jobs.', 'hammer', true, 50),
  ('landscaping', 'Landscaping & Gardening', 'Lawns, hedges, fencing, patios, and outdoor maintenance.', 'trees', true, 60),
  ('roofing', 'Roofing', 'Roof repairs, gutters, flat roofs, and chimney work.', 'home', true, 70),
  ('carpentry', 'Carpentry & Joinery', 'Doors, skirting, fitted work, and bespoke woodwork.', 'ruler', true, 80),
  ('locksmith', 'Locksmith', 'Lockouts, replacements, upgrades, and emergency access.', 'key-round', true, 90),
  ('removals', 'Removals', 'Local moves, man-with-a-van, and house clearances.', 'truck', true, 100)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  active = excluded.active,
  sort_order = excluded.sort_order;
