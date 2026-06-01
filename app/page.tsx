useEffect(() => {
  const finishGame = async () => {
    if (
      !gameStarted ||
      gameFinished
    )
      return;

    const finishedPlayer =
      selectedPlayers.find(
        (playerId) => {
          const playerScores =
            scores[playerId] || {};

          return (
            Object.keys(playerScores)
              .length ===
            gameCategories.length
          );
        }
      );

    if (!finishedPlayer) return;

    let bestPlayer = "";
    let bestScore = -1;

    const gameResults =
      selectedPlayers.map(
        (playerId) => {
          const playerScores =
            scores[playerId] || {};

          const total =
            Object.values(
              playerScores
            ).reduce(
              (sum, value) =>
                sum + value,
              0
            );

          let perfectCategories = 0;

          gameCategories.forEach(
            (category) => {
              if (
                playerScores[
                  category.id
                ] === category.max
              ) {
                perfectCategories++;
              }
            }
          );

          if (total > bestScore) {
            bestScore = total;

            bestPlayer = playerId;
          }

          return {
            playerId,
            total,
            perfectCategories,
          };
        }
      );

    const winnerName =
      players.find(
        (p) => p.id === bestPlayer
      )?.name || "";

    setWinner(winnerName);

    setWinnerScore(bestScore);

    await saveFinishedGame({
      date: new Date().toISOString(),

      winner: bestPlayer,

      winnerScore: bestScore,

      players: selectedPlayers,

      scores: gameResults,
    });

    setGameFinished(true);

    setShowFinishedGame(true);
  };

  finishGame();
}, [
  scores,
  gameStarted,
  gameFinished,
  selectedPlayers,
]);