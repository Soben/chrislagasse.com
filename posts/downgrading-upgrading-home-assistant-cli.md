---
title: Downgrading/Upgrading Home Assistant via CLI.
description: I had to do a temporary downgrade to solve MyQ being removed. Here's some pointers.
date: 2024-04-07
tags:
  - home assistant
  - smart home
layout: layouts/post.njk
---

Alternative title for this post was "Remove MyQ from [Home Assistant](https://www.home-assistant.io/) post-2023.12.0 upgrade", but this applies to any time you might need to downgrade your version of Home Assistant due to a local issue that you need to roll back. 

## The Problem

Back when `2023.12.0` came out, Home Assistant finally relented that Chamberlain's [MyQ](https://www.myq.com/) service was not going to be cooperative with third party tools, and decided to [fully drop the integration](https://www.home-assistant.io/blog/2023/11/06/removal-of-myq-integration/). I knew that the MyQ integration was "borked", but I wasn't prepared for Home Assistant to remove the integration.

After updating to `2023.12.0`, Home Assistant would show warnings about the MyQ integration's devices', but wouldn't let me actually clear it out because the Integration was no longer visible. I would have a bunch of entities and other references that were lingering, but uneditable. While they (likely) didn't affect functionality, they annoyed me. So I had to do what I could to remove them.

## The Solution

These steps assume you're familiar with, and have access to, your Home Assistant devices' terminal interface via SSH or similar. The commands below are what worked for me. You may need to add `hassio` in front of it, or connect via Docker. Your Mileage May Vary (YMMV) based on your individual configurations. In my case I'm running Home Assistant OS on a Raspberry Pi 4.

1. Connect to your Home Assistant terminal.
2. Downgrade to before the removal of myQ (takes a while, completed in 5+ minutes for me)

```shell
$ ha core update --version 2023.11.3
```

3. Go to Settings > Devices & Services > Integrations, and find MyQ.
4. Click the integration to view the full list of myQ integrations
5. Click the three vertical dots for each integration, and click 'delete'

{% image "src/img/posts/homeassistant-myq-1.png", "Partial screenshot of the Home Assistant MyQ integration in 2023.11.3, with a warning on the Chamberlain device and the sub-menu for the three vertical dots showing how to 'delete' the device from the Home Assistant install." %}

6. Follow updates steps via the UX as usual, to go back to 2023.12.x (or newer), or run the update via CLI.

```shell
$ ha core update
```