// logic.js

Rune.initLogic({
    minPlayers: 1,
    maxPlayers: 4,
    setup: (allPlayerIds) => {
      const scores = {}
      for (let playerId of allPlayerIds) {
        scores[playerId] = 0
      }
      return { scores }
    },
    actions: {
      incrementScore(playerWhoGotPoints, { game }) {
        game.scores[playerWhoGotPoints]++
      },
    },
  })