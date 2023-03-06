# Development setup

### Supabase setup

To develop this project, you'll need a supabase account with a configured project for development.
- Go to the [supabase](https://app.supabase.com) website and create an account if you don't have one.
- Inside your dashboard, click the `New project` button and select an existing organization, or create a new personal org.
- Name your project adding a `-dev` suffix, and then click `generate a password` link when setting the database password. Make sure to copy the password.
- Select the free tier and confirm the project creation.
- Once inside the project dashboard, go the Settings tab (cog icon at the last position of the nav bar), and start setting up the dev environment variables as described next

### Env vars setup

After cloning the repository, make sure to run `npm install`.
Once that's completed, run `npm run dev-setup` and follow the instructions. Make sure to select `dev` to be able to use your supabase project created in the **Supabase setup** section.

#### Database variables

They are used by the migration manager to update the database structure directly through postgres.

- Postgres HOST: go to your supabase project settings > `Database` > `Connection info` section, and copy the host address
- Postgres PORT: project settings > `Database` > `Connection info` section > `Port` field
- Postgres DATABASE: project settings > `Database` > `Connection info` section > `Database name` field
- Postgres USER: project settings > `Database` > `Connection info` section > `User` field
- Postgres PASSWORD: project settings > `Database` > `Connection info` section > `Password` field

#### Supabase variables

- Supabase REST ENDPOINT: project settings > `API` > `Project URL` section > `URL` field 
- Supabase SERVICE SECRET: project settings > `API` > `Project API keys` section > `service_role` field 

Once all variables are set, a `dev.env` file will be added to your project root. Feel free to run this script again to make any adjustments, as it remembers the values defined previously.