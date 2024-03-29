const fs = require("fs");
require("dotenv").config()

const { PurgeCSS } = require("purgecss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

const Image = require("@11ty/eleventy-img");
const path = require('path');

const isProduction = function() {
  if (!process.env.ELEVENTY_ENV) {
    return false; // default to dev
  }

  return process.env.ELEVENTY_ENV == "production";
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  eleventyConfig.addPassthroughCopy({"src/img": "img"});
  eleventyConfig.addPassthroughCopy({"src/css": "css"});
  eleventyConfig.addPassthroughCopy({"src/js": "js"});
  eleventyConfig.addPassthroughCopy({"src/root/robots.txt": "robots.txt"});

  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.linkInsideHeader({
      class: "direct-link",
    }),
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Browsersync Overrides
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync("_site/404.html");

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false
  });

	eleventyConfig.addShortcode("image", function (src, alt, sizes="(min-width: 1024px) 100vw, 50vw") {
		console.log(`Generating image(s) from:  ${src}`)
		let options = {
			widths: [600, 900, 1500],
			formats: ["webp", "jpeg"],
			urlPath: "/images/",
			outputDir: "./_site/images/",
			filenameFormat: function (id, src, width, format, options) {
				const extension = path.extname(src)
				const name = path.basename(src, extension)
				return `${name}-${width}w.${format}`
			}
		}

		// generate images
		Image(src, options)

		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		}
		// get metadata
		metadata = Image.statsSync(src, options)
		return Image.generateHTML(metadata, imageAttributes)
	})

  // @TODO determine why this is now throwing errors
  eleventyConfig.addTransform("purge-and-inline-css", async (content, outputPath) => {
    if (!isProduction() || !outputPath.endsWith(".html")) {
      return content;
    }

    const purgeCSSResults = await new PurgeCSS().purge({
      content: [{ raw: content }],
      css: ["_site/css/index.css"],
      keyframes: true,
    });

    return content.replace("<!-- INLINE CSS-->", "<style>" + purgeCSSResults[0].css + "</style>");
  });

  return {
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",

    dir: {
      input: ".",
      includes: "src/includes",
      data: "src/data",
      output: "_site"
    }
  };
};
