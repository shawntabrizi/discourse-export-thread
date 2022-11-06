const input = document.getElementById("input");
const output = document.getElementById("output");
const preview = document.getElementById("preview");
const previewContainer = document.getElementById("preview-container");

const copyButton = document.getElementById("copy");

input.addEventListener("input", parseJson);

function createIntro(json) {
	let intro = document.createElement("p");
	intro.innerText = `This post is scraped text from an external Discourse thread titled "${json.title}".`;

	return intro;
}

function createQuote(who, post) {
	// filter out empty posts
	if (!post) { return null }

	let aside = document.createElement("aside");
	aside.setAttribute("class", "quote no-group");
	aside.setAttribute("data-username", who);

	let title = document.createElement("div");
	title.setAttribute("class", "title");
	title.innerText = `${who}:`

	let content = document.createElement("blockquote");
	content.setAttribute("class", "quote no-group");
	content.setAttribute('data-username', who);
	content.innerHTML = post;

	aside.appendChild(title);
	aside.appendChild(content);

	return aside;
}

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
		let quote = createQuote(post.name, post.cooked);
		if (quote) {
			preview.appendChild(quote);
		}
	}

	output.innerText = "Parsed successfully!"
	previewContainer.style.display = "block";
}

// Copies the "preview" html to the clipboard.
function copyToClipboard() {
	navigator.clipboard.writeText(preview.innerHTML)
		.then(
			function () {
				output.innerText = "Successfully copied to clipboard!";
			})
		.catch(
			function () {
				output.innerText = "Failed to copy to clipboard!";
			});
}

parseJson()
