# Deploying Ofry.ro

Every push to `main` runs `.github/workflows/deploy.yml`, which deploys:

1. the **backend** (database, functions, file storage, login) to **Convex**, then
2. the **website** to **Cloudflare Workers**.

The workflow skips itself until it has the keys below. You do this setup once and it takes about 15 minutes.

You'll need two free accounts: [Convex](https://dashboard.convex.dev) and [Cloudflare](https://dash.cloudflare.com). Sign in to both with GitHub if you like.

## Where the values go

All six values go in **GitHub → `mirzacmarius/ofry` → Settings → Secrets and variables → Actions**:
<https://github.com/mirzacmarius/ofry/settings/secrets/actions>

The page has two tabs:

| Tab | Button | Names |
| --- | --- | --- |
| **Secrets** (hidden after saving) | *New repository secret* | `CONVEX_DEPLOY_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ALCHEMY_PASSWORD` |
| **Variables** (visible) | *New repository variable* | `VITE_CONVEX_URL`, `VITE_CONVEX_SITE_URL` |

For each value, type the **Name** exactly as written here (capital letters, underscores), paste the value, and click **Add secret** or **Add variable**.

## Step 1: Convex (3 values)

1. Go to <https://dashboard.convex.dev> and click **Create Project**. Name it `ofry`.
2. At the top of the project, switch the deployment selector from **Development** to **Production**. Everything below must come from **Production**.
3. Open **Settings** in the left sidebar. On **URL & Deploy Key** you'll find:
   - **Deployment URL**, which looks like `https://happy-animal-123.convex.cloud`. Save it as the **variable** `VITE_CONVEX_URL`.
   - **HTTP Actions URL**: the same address ending in `.convex.site`, for example `https://happy-animal-123.convex.site`. Save it as the **variable** `VITE_CONVEX_SITE_URL`.
   - **Generate Production Deploy Key**: click it, copy the key (it starts with `prod:`), and save it as the **secret** `CONVEX_DEPLOY_KEY`.
4. Still in **Settings**, open **Environment Variables** and add two entries. These go in Convex, not in GitHub:
   - `BETTER_AUTH_SECRET`: a long random string. You can generate one at <https://generate-secret.vercel.app/32>, or run `openssl rand -base64 32`.
   - `SITE_URL`: the address people will use to open the site. If ofry.ro isn't connected yet, use the `workers.dev` address from Step 4 for now. Login only works from the address you put here.

## Step 2: Cloudflare (2 values)

1. **Account ID.** Go to <https://dash.cloudflare.com> and open **Workers & Pages** in the left sidebar. The **Account ID** is in the right-hand panel, with a copy button. It's also the long hex string in the browser address bar (`dash.cloudflare.com/<account-id>/...`). Save it as the **secret** `CLOUDFLARE_ACCOUNT_ID`.
2. **API token.** Go to <https://dash.cloudflare.com/profile/api-tokens>, click **Create Token**, and next to the **Edit Cloudflare Workers** template click **Use template**.
   - **Permissions**: keep the template rows and click **+ Add more** to add **Account → Secrets Store → Edit**. Alchemy keeps its deployment records in a Cloudflare Secrets Store, and without this permission the deploy fails with `Unauthorized: Authentication error`.
   - **Account Resources**: Include → your account.
   - **Zone Resources**: Include → All zones (or just `ofry.ro` once the domain is on Cloudflare).
   - Click **Continue to summary**, then **Create Token**, and copy the token. Cloudflare shows it only once. Save it as the **secret** `CLOUDFLARE_API_TOKEN`.

## Step 3: Alchemy password (1 value)

Alchemy is the tool that deploys the website. It needs a password to encrypt its deployment records. Make up any long random string, for example from <https://generate-secret.vercel.app/32>. Save it as the **secret** `ALCHEMY_PASSWORD`. Never change it afterwards.

## Step 4: Run the deploy

1. Open <https://github.com/mirzacmarius/ofry/actions/workflows/deploy.yml> and click **Run workflow** → **Run workflow**. Any later push to `main` also deploys.
2. When the run turns green, open the **Deploy web app to Cloudflare** step. The website address is near the end of the log, something like `https://ofry-web-prod.<your-subdomain>.workers.dev`.
3. Set Convex `SITE_URL` (Step 1.4) to that address, or to `https://ofry.ro` once the domain is connected.
4. Optional demo data: Convex dashboard (Production) → **Functions** → `seed:run` → **Run function**.

## Checklist

| Name | Kind (GitHub tab) | Where it comes from |
| --- | --- | --- |
| `CONVEX_DEPLOY_KEY` | Secret | Convex → Production → Settings → Generate Production Deploy Key |
| `VITE_CONVEX_URL` | Variable | Convex → Production → Settings → Deployment URL (`.convex.cloud`) |
| `VITE_CONVEX_SITE_URL` | Variable | Convex → Production → Settings → HTTP Actions URL (`.convex.site`) |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | Cloudflare → Workers & Pages → Account ID |
| `CLOUDFLARE_API_TOKEN` | Secret | Cloudflare → Profile → API Tokens → "Edit Cloudflare Workers" template + Account → Secrets Store → Edit |
| `ALCHEMY_PASSWORD` | Secret | Any random string you make up |
| `BETTER_AUTH_SECRET` | **Convex** env var | Any random string you make up |
| `SITE_URL` | **Convex** env var | The site's address (workers.dev URL for now, later `https://ofry.ro`) |
