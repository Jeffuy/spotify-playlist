import { useState, useEffect } from "react";
import axios from "axios";

export default function useUser() {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchUser() {
			try {
				const response = await axios.get("/api/me");
				setUser(response.data);
			} catch (error) {
				console.error("Error al obtener la información del usuario", error);
			}
			setIsLoading(false);
		}

		fetchUser();
	}, []);

	return { user, isLoading };
}