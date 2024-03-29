---
title: Using SlimPHP on Fly.io
description: Streamlined solution to Dockerfile-only approach to get a SlimPHP site on fly.io
date: 2023-02-26
tags:
  - slimphp
  - php
  - sqlite
  - hosting
  - serverless
layout: layouts/post.njk
---

I've built a new project recently on SlimPHP and it was time to find hosting. I had a strong desire to stick with serverless-esque hosting, such as Vercel (my current provider of choice), but their third-party PHP support was... lacking.

That's when I discovered [fly.io](https://fly.io). My hopes were initially dashed as it seemed that I needed to use Docker. Locally I was sufficient with 'just' using `php --serve`, and I wanted to keep my requirements as minimal as possible.

However, I stuck with it, and found an effective solution as a middle ground.

**Note** This build/project requires zero write ability in Fly.io, which is good for serverless, and accomplished my needs.

```docker
FROM php:8.2-apache

RUN apt update \
    && apt install -y zip libzip-dev \
    && docker-php-ext-configure zip \
    && docker-php-ext-install zip

RUN a2enmod rewrite

RUN sed -ri -e 's!:80>!:8080>!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!Listen 80!Listen 8080!g' /etc/apache2/ports.conf

COPY --chown=www-data . /var/www/html

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html

EXPOSE 8080
```

## Let's break it down!

```docker
FROM php:8.2-apache
```

We're including the apache variant of Docker's native `PHP` container, running PHP 8.2

```docker
RUN apt update \
    && apt install -y zip libzip-dev \
    && docker-php-ext-configure zip \
    && docker-php-ext-install zip
```

`zip` was required for composer. This tells the container to install and configure `zip` as a PHP extension.

```docker
RUN a2enmod rewrite
```

I use an `.htaccess` file in my `/public` folder, and this tells apache to pay attention to it. Apache already has `AllowOverride All` for the appropriate folders, but it still needs the rewrite module enabled.

```docker
RUN sed -ri -e 's!:80>!:8080>!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!Listen 80!Listen 8080!g' /etc/apache2/ports.conf
```

`Fly.io` has an 'internal' port that defaults to `:8080` that it plans to use to communicate with the container. This can be any port, but I stuck with the default for ease of setup.

```docker
COPY --chown=www-data . /var/www/html
```

This copies over your files from your local into the container, and makes sure they have the right 'public-facing' permissions.

```docker
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader
```

Install composer, and install the necessary packages for production (will not install composer plugins as `--optimize-autoloader` is enabled. Composer throws warnings and ends build prematurely)

```docker
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
```

These two lines are regex and it tells Apache to use the `/public` folder as the site root instead of `/html`

```docker
WORKDIR /var/www/html
```

A helpful configuration that has your 'root' working directory in the same directory as your project.

```docker
EXPOSE 8080
```

Since we're not using `:80` for our working port, we need to tell the container to make `:8080` available.

## Conclusions

We'll see. I don't know how the site will perform on Fly.io yet, or what the costs will be for continued hosting, but it's successfully hosted and rendering on Fly.io.

I had the added benefit of not needing any write ability on this project. I'm using SQLite, but in a read-only capacity. The database is compiled separately and stored statically in the database. 

**Hope this helps you**. It was quite difficult to find sufficient resources regarding PHP and these serverless environments, especially from a more barebones approach like I wanted.