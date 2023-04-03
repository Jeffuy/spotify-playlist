import { signIn, signOut, useSession } from "next-auth/react";
import { Audio, Bars } from "react-loader-spinner";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Script from "next/script";

export default function Home() {
	const targetDiv = useRef(null);
	const { data: session } = useSession()
	const [accessToken, setAccessToken] = useState('')
	const [playlistType, setPlaylistType] = useState('')
	const [genres, setGenres] = useState('')
	const [numSongs, setNumSongs] = useState(0)
	const [result, setResult] = useState([])
	const [title, setTitle] = useState('')
	const [playlistCreated, setPlaylistCreated] = useState(false)
	const [loadingPlaylist, setLoadingPlaylist] = useState(false)
	const [addingPlaylist, setAddingPlaylist] = useState(false)
	const [searchMode, setSearchMode] = useState("relaxed")
	const [showModal, setShowModal] = useState(false)


	const handleSearchModeChange = (e) => {
		setSearchMode(e.target.value)
	}

	const handleCreatePlaylist = async (result, accessToken) => {
		console.log(searchMode)
		setAddingPlaylist(true)
		try {
			const response = await axios.post('/api/spotify', {
				songs: result,
				playlistName: title,
				searchMode: searchMode,
				userId: session.token.sub, // El ID de usuario de Spotify
				accessToken, // El token de acceso de Spotify
			});

			console.log('Playlist creada:', response.data.playlistId);
			setPlaylistCreated(true)
		} catch (error) {
			console.error('Error creando la playlist:', error);
		}
		setAddingPlaylist(false)
	};


	async function onSubmit(e) {
		e.preventDefault()
		setLoadingPlaylist(true)
		try {
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					typeOfPlaylist: playlistType,
					genres: genres,
					numSongs: numSongs,
				}),
			})
			if (response.ok) {
				const data = await response.json()
				setResult(data.result)
				setTitle(data.title)
				setAccessToken(session.token.accessToken)

			}
		} catch (error) {
			console.error(error)
		}
		setLoadingPlaylist(false)
	}

	useEffect(() => {
		if (targetDiv.current) {
			targetDiv.current.scrollIntoView({ behavior: 'smooth' });
		}
		// } else if (resultDiv.current) {
		// 	resultDiv.current.scrollIntoView({ behavior: 'smooth' });
		// }
		console.count("scrolling")
	}, [loadingPlaylist]);

	return (<>
		<Head>
			<title>Create Spotify Playlist</title>
			<meta name="description" content="Create a playlist based on your mood using AI" />
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
			<link rel="icon" href="/icon.png" />
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.0/css/all.min.css" />

		</Head>
		{/* <!-- Google tag (gtag.js) --> */}
		<Script async src={"https://www.googletagmanager.com/gtag/js?id=G-F7837YT067"} />
		<Script
			dangerouslySetInnerHTML={{
				__html: `
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments)};
					gtag('js', new Date());
					gtag('config', 'G-F7837YT067')
					`}}
			id="gtag"
		/>
		<div className={styles.container}>


			<main className={styles.main}>
				<h1 className={styles.title}>
					Welcome
					{session
						? `, ${session.token.name}` || ''
						: ''}
					!

				</h1>
				<p>
					{session ? (
						<button
							className={styles.button}
							type="button"
							onClick={() => signOut()}
						>
							Sign out
						</button>
					) : (
						<button
							className={styles.button}
							type="button"

							onClick={() => signIn('spotify')}
							disabled={session}
						>
							Sign in with Spotify
						</button>
					)}
				</p>

				{session && (
					<form onSubmit={onSubmit} className={styles.form}>
						<div className={styles.inputGroup}>
							<label htmlFor="playlistType" className={styles.label}>
								Your mood:
							</label>
							<input
								type="text"
								name="playlistType"
								id="playlistType"
								className={styles.input}
								placeholder="E.g.: party, sad, relaxed."
								value={playlistType}
								onChange={(e) => setPlaylistType(e.target.value)}
							/>
						</div>

						<div className={styles.inputGroup}>
							<label htmlFor="genres" className={styles.label}>
								Genres:
							</label>
							<input
								type="text"
								name="genres"
								id="genres"
								className={styles.input}
								placeholder="E.g.: Rock, Pop, Reggae, etc."
								value={genres}
								onChange={(e) => setGenres(e.target.value)}
							/>
						</div>

						<div className={styles.inputGroup}>
							<label htmlFor="numSongs" className={styles.label}>
								Number of songs:
							</label>
							<input
								type="number"
								name="numSongs"
								id="numSongs"
								className={styles.input}
								placeholder="min: 10, max: 30"
								min={10}
								max={30}
								value={numSongs == 0 ? '' : numSongs}
								onChange={(e) => setNumSongs(e.target.value)}
							/>
						</div>

						<button type="submit" className={styles.button} disabled={loadingPlaylist}>
							Create Playlist
						</button>
					</form>
				)}
				{loadingPlaylist && (<div ref={targetDiv} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					<Audio
						height="80"
						width="80"
						color="#4fa94d"
						ariaLabel="audio-loading"
						wrapperStyle={{}}
						wrapperClass="wrapper-class"
						visible={true}
					/>
					<p>Creating playlist...</p>
				</div>)}
				{result.length > 0 & !loadingPlaylist ? (
					<div className={styles.result}>

						<h2>{title}</h2>
						<ul>
							{result.map((song, index) => (
								<li key={index}>
									{index + 1} - {' '}
									{song.name} - {song.artist}
								</li>
							))}
						</ul>

						<div className={styles.selectGroup}>
							<select
								className={styles.selectInput}
								name="searchMode"
								value={searchMode}
								onChange={handleSearchModeChange}
							>
								<option value="relaxed">Relaxed Mode</option>
								<option value="strict">Strict Mode</option>
							</select>
							<button onClick={() => setShowModal(true)} className={styles.helpIcon}>
								?
							</button>
						</div>

						{showModal && (
							<div className={styles.modal}>
								<div className={styles.modalContent}>
									<span
										className={styles.modalClose}
										onClick={() => setShowModal(false)}
									>
										×
									</span>
									<h2>Modes: Strict & Relaxed</h2>
									<p>
										Since the AI is not perfect and may not find the exact song you want (or even invent a song that {`doesn't`} exist), there are two modes to choose from.
									</p>
									<p>
										<strong>Strict mode:</strong> Adds songs with exact title and artist match. Results in fewer, but more accurate songs.
									</p>
									<p>
										<strong>Relaxed mode:</strong> More flexible song selection, but may include some incorrect ones.
									</p>
									<p>
										If AI selections are unsatisfactory, try switching modes or manually adding songs.
									</p>
								</div>
							</div>
						)}

						<button onClick={() => handleCreatePlaylist(result, accessToken)} className={styles.button} disabled={addingPlaylist}>
							Add to my Spotify account.
						</button>
						{addingPlaylist && (<div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem' }}>
							<Bars
								height="60"
								width="60"
								color="#4fa94d"
								ariaLabel="bars-loading"
								wrapperStyle={{}}
								wrapperClass=""
								visible={true}
							/>
							<p>Adding playlist...</p>
						</div>)}

						{playlistCreated & !addingPlaylist ? <p style={{ marginTop: "1rem"}}>Playlist added!</p> : null}

					</div>
				) : null}

			</main>
		</div></>
	)
}