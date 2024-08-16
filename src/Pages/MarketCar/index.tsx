"use client"; // Adicione esta linha no início do arquivo

import { useState } from 'react';
import axios from 'axios';
import './style.css';

interface JokeData {
  joke?: string;
  setup?: string;
  delivery?: string;
}

const Home = () => {
  const [joke, setJoke] = useState<JokeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchJoke = async () => {
    try {
      const response = await axios.get<JokeData>('https://v2.jokeapi.dev/joke/Any');
      setJoke(response.data);
      setError(null);
    } catch (error) {
      setError('Erro ao buscar piada');
    }
  };

  return (
    <div className="container">
      <img 
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaty1oLdrdSYvBB1TN4Ps8QPGcvo5PxMg4oQ&s" 
        alt="Humor" 
        className="joke-image" 
      />
      <h1>Piada Aleatória</h1>
      <button onClick={handleFetchJoke}>Buscar Comédia</button>
      {error && <p className="error">{error}</p>}
      {joke && (
        <p className="joke">
          {joke.setup ? `${joke.setup} - ${joke.delivery}` : joke.joke}
        </p>
      )}
    </div>
  );
};

export default Home;
