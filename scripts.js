const input = document.getElementById("input");
const output = document.getElementById("output");
const preview = document.getElementById("preview");
const previewContainer = document.getElementById("preview-container");
const copyButton = document.getElementById("copy");

// Automatically run parser when input is updated.
input.addEventListener("input", parseJson);

// Some auto-generated intro text to give context about where these posts are coming from.
function createIntro(json) {
	let intro = document.createElement("p");
	intro.innerText = `This conversation was extracted from an external Discourse thread titled "${json.title}".`;
	return intro;
}

// From a single user post, create a quote box with the relevant information about that post.
// These will be concatenated together as a single post of quotes.
function createQuote(who, when, post) {
	// filter out empty posts
	if (!post) { return null }

	let aside = document.createElement("aside");
	aside.setAttribute("class", "quote no-group");
	aside.setAttribute("data-username", who);

	let title = document.createElement("div");
	title.setAttribute("class", "title");
	title.innerText = `${who} on ${when}:`

	let content = document.createElement("blockquote");
	content.setAttribute("class", "quote no-group");
	content.setAttribute('data-username', who);
	content.innerHTML = post;

	aside.appendChild(title);
	aside.appendChild(content);

	return aside;
}

// Go through the JSON loaded in the page, and try to turn it into well formatted HTML.
function parseJson() {
	output.innerHTML = null;
	preview.innerHTML = null;
	previewContainer.style.display = "none";

	let input_text = input.value;
	if (!input_text) { return }

	output.innerText = "parsing..."

	let posts, json;

	try {
		json = JSON.parse(input_text);
		posts = json.post_stream.posts;
	} catch (e) {
		output.innerText = `Error: Expected JSON input with \`post_stream.posts\`.\n ${e}`
		return
	}

	let intro = createIntro(json);
	preview.appendChild(intro);

	for (post of posts) {
		let date = new Date(post.created_at);
		let quote = createQuote(post.name, date.toDateString(), post.cooked);
		if (quote) {
			preview.appendChild(quote);
		}
	}

	removeOneBoxes();

	output.innerText = "Parsed successfully!"
	previewContainer.style.display = "block";
}

// This function finds Discourse Oneboxes, and turns them back into normal links.
// Formatting of the onebox did not look good when putting HTML back through the parser in the forum.
function removeOneBoxes() {
	let boxes = document.getElementsByClassName("onebox");

	for (box of boxes) {
		let url = box.getAttribute("data-onebox-src");
		if (url) {
			// Replace the onebox html with a simple link.
			box.outerHTML = `<p><a href='${url}'>${url}</a></p>`;
		}
	}
}

// Copies the "preview" html to the clipboard.
// Attempts to make the HTML well formatted with `html_beautify`.
function copyToClipboard() {
	let output = preview.innerHTML;
	if (html_beautify) {

		let options = {
			"max_preserve_newlines": "-1",
			"preserve_newlines": false,
		};
		output = html_beautify(output, options);
	}
	navigator.clipboard.writeText(output)
		.then(
			function () {
				output.innerText = "Successfully copied to clipboard!";
			})
		.catch(
			function () {
				output.innerText = "Failed to copy to clipboard!";
			});
}

// Run the script on startup.
parseJson()
