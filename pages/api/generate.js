import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function generate(req, res) {
	if (!configuration.apiKey) {
		res.status(500).json({
			error: {
				message: "OpenAI API key not configured, please follow instructions in README.md",
			}
		});
		return;
	}

	const typeOfPlaylist = req.body.typeOfPlaylist || '';
	const genres = req.body.genres || '';
	const numSongs = req.body.numSongs || 0;
	if (typeOfPlaylist.trim().length === 0 || numSongs.trim().length === 0) {
		res.status(400).json({
			error: {
				message: "Please enter valid data",
			}
		});
		return;
	}

	try {
		const completion = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			max_tokens: 800,
			messages: [{ role: "user", content: generatePrompt(typeOfPlaylist, genres, numSongs) }],
		});

		console.log(completion.data.choices[0].message.content)
		const textResult = completion.data.choices[0].message.content;

		let result = textResultToArray(textResult);
		let title = extractTitle(textResult);
		
		res.status(200).json({ result: result, title });
	} catch (error) {
		// Consider adjusting the error handling logic for your use case
		if (error.response) {
			console.error(error.response.status, error.response.data);
			res.status(error.response.status).json(error.response.data);
		} else {
			console.error(`Error with OpenAI API request: ${error.message}`);
			res.status(500).json({
				error: {
					message: 'An error occurred during your request.',
				}
			});
		}
	}
}

// salto
function generatePrompt(typeOfPlaylist, genres, numSongs) {
	const capitalizedTypeOfPlaylist =
		typeOfPlaylist[0].toUpperCase() + typeOfPlaylist.slice(1).toLowerCase();
	return `Quiero que conozcas todos los titulos de todas las canciones con sus respectivos artistas. Crea una playlist que cumpla con lo siguiente:
	Cantidad de canciones: ${numSongs}.
	Generos: ${genres}.
	Tipo: ${capitalizedTypeOfPlaylist}.
	Solo responderás con la lista de canciones. No incluiras canciones que no estes seguro de su existencia o si perteneces a cierto artista. A cada elemento le agregaras la etiqueta <cancion> y </cancion>. Ejemplo: <cancion>Nombre de la cancion - artista</cancion>. Le agregaras un titulo creativo a la playlist entre las etiquetas <titulo> y </titulo>. Ejemplo: <titulo>titulo de la playlist</titulo>.`;
}

function textResultToArray(textResult) {
	const regex = /<cancion>(.*?)<\/cancion>/g;
	//guarda las canciones en un object con el nombre de la cancion y el artista
	const songs = [];
	let match;

	while ((match = regex.exec(textResult)) !== null) {
		const song = match[1].split('-');
		songs.push({ name: song[0], artist: song[1] });
	}
	return songs;
}

function extractTitle(textResult) {
	const regex = /<titulo>(.*?)<\/titulo>/g;

	const title = [];
	let match;

	while ((match = regex.exec(textResult)) !== null) {
		title.push(match[1]);
	}
	return title[0];

}