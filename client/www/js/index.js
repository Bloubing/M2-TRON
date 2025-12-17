// index.js
// Charge les différents modules de l'application

const lobby = require('./lobby.js');
const connexion = require('./connexion.js');
const controle = require('./controle.js');
const game = require('./game.js');

// Export éventuel si nécessaire
module.exports = {
  lobby,
  connexion,
  controle,
  game
};
