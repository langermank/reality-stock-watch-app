insert into auth.users(id, email)
values (gen_random_uuid(), 'admin@realitystockwatch.com')
on CONFLICT do nothing;
