import axios from "axios";

// Aquí van las funciones fetchSongUris y createSpotifyPlaylist
async function fetchSongUris(songs, accessToken) {
    const songUris = [];
	//eliminar todo lo que haya antes de un guion en cada elemento del array songs
	


    for (const song of songs) {
		
        try {
            const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(song)}&type=track&limit=1`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.data.tracks.items.length > 0) {
                songUris.push(response.data.tracks.items[0].uri);
            }
        } catch (error) {
            console.error(`Error fetching song "${song}":`, error);
        }
    }

    return songUris;
}

async function createSpotifyPlaylist(userId, playlistName, songUris, accessToken) {
    try {
        const playlistResponse = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            name: playlistName
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const playlistId = playlistResponse.data.id;

        await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            uris: songUris
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return playlistId;

    } catch (error) {
        console.error('Error creating playlist:', error);
    }
}


export default async function handler(req, res) {
	if (req.method === "POST") {
		// Extraer la información necesaria del cuerpo de la solicitud
		const { userId, accessToken, songs, playlistName } = req.body;

		try {
			// Obtener las URIs de las canciones
			const songUris = await fetchSongUris(songs, accessToken);

			// Crear la playlist en Spotify
			const playlistId = await createSpotifyPlaylist(userId, playlistName, songUris, accessToken);

			// Devolver el ID de la playlist creada
			res.status(200).json({ playlistId });
		} catch (error) {
			console.error("Error handling request:", error);
			res.status(500).json({ message: "Error al crear la playlist" });
		}
	} else {
		// Manejar otros métodos HTTP que no sean POST, si es necesario
		res.status(405).json({ message: "Método no permitido" });
	}
}