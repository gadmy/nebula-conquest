/* ─────────────────────────────────────────────
   LOCKSTEP : LE RELAIS D'ORDRES (prototype)
   Chaque navigateur calcule toute la partie ; le serveur (outils/relais.mjs)
   ne fait que faire circuler les ordres. Il envoie toutes les 50 ms un
   paquet numerote : le paquet n s'applique au tour (n + 2) x 3 + 1, chez
   tout le monde, et personne ne calcule plus loin que le dernier paquet
   recu. Deux paquets d'avance : le temps que le reseau livre.
   On y entre par l'adresse du jeu :
     ?relais=ws://serveur:8080&salle=nom&joueurs=2&ia=0&carte=6
   Les joueurs humains ont les premiers numeros, les IA suivent. Chaque
   seconde de jeu, l'empreinte de la partie part au relais, qui les compare.
   ───────────────────────────────────────────── */
const TOURS_PAR_PAQUET = 3;
const PAQUETS_AVANCE = 2;

