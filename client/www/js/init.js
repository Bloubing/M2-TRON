import { global, globalUI } from "./global.js";

// === Initialisation côté client ===

export function init() {
  // On initialise le websocket
  global.ws = new WebSocket("ws://10.42.0.1:9898/");

  // On place l'event listener pour l'affichage UI des messages du serveur
  document.getElementById("messageScreenBtn").onclick =
    globalUI.closeMessageScreen;
}
