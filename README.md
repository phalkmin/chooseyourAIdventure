
# Choose your own AIdventure

This repository is a submission for the [Cloudflare AI Challenge](https://dev.to/devteam/join-us-for-the-cloudflare-ai-challenge-3000-in-prizes-5f99).


## Demo

Demo can be [seen and played here](https://chooseyouraidventure.pages.dev/)

![Old School style RPG](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ib2vq45ho2tti85smk5l.png)

## Deployment

To deploy this project, clone it and upload the file from `WK` folder to a new CloudFlare Worker. 

Then, create a .env file with:

NEXT_PUBLIC_CF_WORKER=<WORKER URL YOU CREATED>

then run

```bash
  npm install
```

to test :

```bash
  npm run dev 
```

to build locally :

```bash
  npx @cloudflare/next-on-pages@1
```

If everything is OK, then create a new CloudFlare Pages and upload the folder OR connect your github repository to it. Create the variable NEXT_PUBLIC_CF_WORKER before the first build