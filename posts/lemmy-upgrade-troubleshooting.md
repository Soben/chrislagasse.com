---
title: Troubleshooting Lemmy Upgrades
description: Recent upgrades to local Lemmy instances have caused a few issues. These were our solutions.
date: 2023-07-31
tags:
  - lemmy
  - activitypub
  - federated
  - digital-ocean
layout: layouts/post.njk
---

My friend [Daryn](https://daryn.codes) and I both host [Lemmy](https://join-lemmy.org) instances on [Digital Ocean](https://digitalocean.com) droplets, implemented via the [Lemmy Easy Deploy](https://github.com/ubergeek77/Lemmy-Easy-Deploy) script. We've gone through the update processes a few times recently and encountered the same issues.

Here are some comment problems and what we had to do to resolve. These issues were caused by updating **up** to `0.18.3` unless otherwise mentioned.

## White Screen of Death (WSOD)

After completing an update via the `./deploy.sh` script, visiting the website triggered a WSOD. Reviewing the logs only showed an issue with pictrs tied to the logo and nothing else. The solution ended up being that somehow the firewall on the server was no longer sufficient and we had to re-open the 443 (SSL) port. This is accomplished by logging into the server and running

```shell
$ sudo ufw allow 443
```

## Emails not sending (even though previously working)

The most recent update (`0.18.3`) caused user registrations to break. As we enforced email verification, registration would fail (as it could not send an email, but create the account), and the forgot password flow was also broken.

We eventually discovered that our custom SMTP settings were missing from the `./live/lemmy.hjson` file, even though they were there initially. Not 100% sure as to what is causing it, but we've taken several cautionary measures to resolve.

### 1. re-add the `email` block to `lemmy.hjson`

the block looks something like this, and is on the same level as the `database` block.

```json
  email: {
    smtp_server: "host:port"
    smtp_login: "email@example.com"
    smtp_password: "password"
    smtp_from_address: "noreply@example.com"
    tls_type: "tls"
  }
```

### 2. update the `./config.env` to set our defaults, just in case this is where content is replacing from.

The fields disappearing from `lemmy.hjson` points to the content being regenerated, so we've updated our `config.env` in the project root to be up to date with the content we've entered into `./live/lemmy.hjson` file -- hopefully this will solve this issue in the long term.

### 3. back up

Duplicate your current `live/lemmy.json`, `live/docker-compose.yml` and `config.env` files, and move them outside of your Lemmy project, so you have something to reference when verifying configuration is still accurate.

## How to Troubleshoot

While on the server, you can explore the logs in docker. For the problems above, they're mostly noticeable by looking at the backend logs

```shell
docker logs lemmy-easy-deploy-lemmy-1
```

If you add the `-f` argument, you can get a live stream of the logs as you explore the site. The name (`lemmy-easy-deploy-lemmy-1`) is found by running `docker ps` and reviewing the available containers.

```shell
root@dis:~# docker ps
CONTAINER ID   IMAGE                                STATUS       NAMES
0123456789ab   caddy:latest                         Up 6 hours   lemmy-easy-deploy-proxy-1
abcdef012345   ghcr.io/ubergeek77/lemmy-ui:0.18.3   Up 6 hours   lemmy-easy-deploy-lemmy-ui-1
456789abcdef   ghcr.io/ubergeek77/lemmy:0.18.3      Up 6 hours   lemmy-easy-deploy-lemmy-1
ef0123456789   postgres:15-alpine                   Up 6 hours   lemmy-easy-deploy-postgres-1
89abcdef0123   asonix/pictrs:0.4.0                  Up 6 hours   lemmy-easy-deploy-pictrs-1
```

(some columns removed for brevity)

---

The Lemmy Easy Deploy helper script is not perfect, and is still way easier than trying to navigate through implementation from scratch. Hopefully these quirks will resolve in time.