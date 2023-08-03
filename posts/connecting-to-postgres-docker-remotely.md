---
title: Connecting to a remote Postgres Docker container
description: How I solved connecting to a remote Postgres instance hosted in a Docker container so I can view content via pgAdmin GUI locally.
date: 2023-07-31
tags:
  - postgres
  - gui
  - pgAdmin
  - Docker
  - digital-ocean
layout: layouts/post.njk
---

Recently I decided to start hosting a [Lemmy](https://join-lemmy.org) instance. I am hosting it on a [Docker](https://www.docker.com) server on [Digital Ocean](https://digitalocean.com), following the very easy-to-use [Lemmy Easy Deploy](https://github.com/ubergeek77/Lemmy-Easy-Deploy) instructions.

Naturally, I needed to explore the [Postgres](https://www.postgresql.org/) database to make minor changes and create backups, so I set forward on discovering how to connect to and access it locally.

These instructions should be the same for any remote host, so you should be able to follow this for any service that provides SSH tunnel access.

## What you'll need

* [pgAdmin](https://pgadmin.org) or similar Postgres GUI interface
* All necessary credentials, which include
  * Postgres username and password
  * SSH username and password/ssh key.

## Instructions

### 1. Find out your Docker container's IP.

SSH into your remote container and run `docker ps` -- This will provide you information regarding any running docker images, with their unique ids, the image powering them, any ports in use, when the image was created, how long its been running, and their indentifying names.

```shell
$ docker ps
CONTAINER ID   IMAGE
0123456789ab   caddy:latest
abcdef019234   ghcr.io/ubergeek77/lemmy-ui:0.18.3
3456789abcde   ghcr.io/ubergeek77/lemmy:0.18.3
def012345678   postgres:15-alpine
789abcdef012   asonix/pictrs:0.4.0
```
If you've also changed the port, make note of that column (my example above is missing several columns as it is an example). Grab the 'Container ID' for the 'postgres' image and find out the IP by running the following command, where `{container_id}` is the result from your `docker ps` call above (for instance `def012345678`)

```shell
$ docker inspect {container_id} | grep IPAddress
  "SecondaryIPAddresses": null,
  "IPAddress": "",
    "IPAddress": "666.13.0.1",
```

Make a note of this IP address, we'll need it to connect to the Host after tunneling.

### 2. Create a new connection in the pgAdmin app

Load up your local copy of pgAdmin and either click 'Object' in the toolbar, or right click 'Servers'

{% image "src/img/posts/docker-postgres-1.png", "Example of dropdown menu for pgAdmin on OSX, showing how to create a new Server by clicking Object > Register > Server..." %}

Provide it with a name for easy reference.

{% image "src/img/posts/docker-postgres-3.png", "The 'General' tab of registering a postgres server, with fields such as the requied 'Name', options to select colors for easy reference, and what group the new server belongs to." %}

Under the "Connection" tab, provide the IP address discovered above for the Hostname, and replace the port if it is different than what Docker says. Then update the Username and Password fields with correct values.

{% image "src/img/posts/docker-postgres-4.png", "The 'Connections' tab of registering a postgres server. The hostname set to the docker container's IP (in this case 666.13.0.1), the port (default of 5432), and other common fields tied to connecting to a database" %}

After these changes, head over to the "SSH Tunnel" tab and provide your details there for connecting to your server. In the case of Digital Ocean (the majority of the time), you'll want to select "Indentity File" for the Authentication method and select the file on your system.

{% image "src/img/posts/docker-postgres-5.png", "The 'SSH Tunnel' tab of registering a postgres server. Provide your server's hostname (commonly an ip), port, and username. We chose the Authentication method of 'identity file' and selected our local ssh private key" %}

After all of this, select "Save" at the bottom and you should successfully connect!

### 3. Success!

You should have successfully managed to connect to your database. If you're having an issue and it's something I may be able to help with, send me a message over on [Mastodon](https://suncoast.dev/@chris).

## What's next

The tables are several nested layers down by going to Database > {name} > Schemas > Public > Tables

{% image "src/img/posts/docker-postgres-6.png", "An example of the server's tree in the sidebar after successfully connecting, showing the path, and other options, leading to the 'Tables' list." %}

But you can start navigating the content early by right-clicking the database and selecting one of the Tools listed, such as 'Query Tool'

{% image "src/img/posts/docker-postgres-7.png", "The secondary menu triggered by a right click of the 'server' in the sidebar, showcasing the options available, including 'Query Tool', which allows you to enter your SQL queries to call against the database." %}

## Conclusion

This process was a little difficult to discover, and for me to navigate (first time working with Postgres this closely), so I hope these steps help you spin up and test faster than it took me :)