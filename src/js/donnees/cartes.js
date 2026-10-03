// ─────────────────────────────────────────────
// GÉNÉRATEUR DE NOMS PROCÉDURAUX
// ─────────────────────────────────────────────
function generateName() {
    const prefixes = ['Zan','Kry','Vel','Xor','Neb','Thal','Aur','Pyx','Cel','Dra','Ith','Vor','Syn','Pal','Eri','Omi','Zet','Sig','Cor','Lyr'];
    const mids = ['a','o','u','i','e','an','on','ar','el','is','ax','um','al','en','os','ir'];
    const suffixes = ['th','ra','nis','xis','ton','ria','mus','pha','dis','lux','vyn','don','zar','mir','bus','tis'];
    return prefixes[Math.floor(worldRandom()*prefixes.length)]
        + mids[Math.floor(worldRandom()*mids.length)]
        + suffixes[Math.floor(worldRandom()*suffixes.length)];
}


// ─────────────────────────────────────────────
// GÉNÉRATION DE L'UNIVERS
// ─────────────────────────────────────────────
// ═══════════════════════════════════════
// BIBLIOTHÈQUE DE MAPS
// ═══════════════════════════════════════
const MAP_LIBRARY = [
  {
  "name": "Berceau Solaire",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    {
      "name": "Omiimir", "radius": 154, "orbitRadius": 1010, "orbitSpeed": 0.0186, "angle": 3.622, "color": "#FFE44D",
      "planets": [
        { "name": "Vorenxis", "radius": 115, "orbitRadius": 450, "orbitSpeed": 0.0451, "angle": 6.049, "flore": 60, "faune": 24,
          "moons": [
            { "name": "Omiarria", "radius": 28, "orbitRadius": 198, "orbitSpeed": 0.3028, "angle": 54.086, "flore": 31, "faune": 45 },
            { "name": "Lyrondis", "radius": 26, "orbitRadius": 198, "orbitSpeed": 0.3028, "angle": 51.863, "flore": 17, "faune": 46 },
            { "name": "Velalzar", "radius": 35, "orbitRadius": 247, "orbitSpeed": 0.2917, "angle": 48.066, "flore": 13, "faune": 43 }
          ]
        },
        { "name": "Ithosmus", "radius": 71, "orbitRadius": 450, "orbitSpeed": 0.0451, "angle": 10.169, "flore": 42, "faune": 60,
          "moons": [
            { "name": "Nebisdis", "radius": 26, "orbitRadius": 181, "orbitSpeed": 0.3159, "angle": 44.733, "flore": 14, "faune": 20 },
            { "name": "Eriunis", "radius": 41, "orbitRadius": 181, "orbitSpeed": 0.3159, "angle": 46.609, "flore": 35, "faune": 26 }
          ]
        },
        { "name": "Synaxra", "radius": 84, "orbitRadius": 268, "orbitSpeed": 0.0616, "angle": 4.193, "flore": 11, "faune": 56, "moons": [] }
      ]
    },
    {
      "name": "Thalarmir", "radius": 208, "orbitRadius": 1010, "orbitSpeed": 0.0186, "angle": 1.384, "color": "#7CB9FF",
      "planets": [
        { "name": "Auredis", "radius": 108, "orbitRadius": 478, "orbitSpeed": 0.0432, "angle": 6.688, "flore": 13, "faune": 38,
          "moons": [
            { "name": "Sigaxria", "radius": 48, "orbitRadius": 184, "orbitSpeed": 0.3418, "angle": 27.737, "flore": 8, "faune": 77 },
            { "name": "Thaliria", "radius": 35, "orbitRadius": 184, "orbitSpeed": 0.3418, "angle": 25.809, "flore": 41, "faune": 75 },
            { "name": "Erionton", "radius": 25, "orbitRadius": 232, "orbitSpeed": 0.2729, "angle": 18.924, "flore": 14, "faune": 49 }
          ]
        },
        { "name": "Draumus", "radius": 125, "orbitRadius": 478, "orbitSpeed": 0.0432, "angle": 3.132, "flore": 89, "faune": 32, "moons": [] }
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Nébuleuse Pourpre",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    {
      "name": "Nebatis", "radius": 188, "orbitRadius": 1232, "orbitSpeed": 0.0154, "angle": 2.353, "color": "#FF6B6B",
      "planets": [
        { "name": "Celavyn", "radius": 95, "orbitRadius": 509, "orbitSpeed": 0.0644, "angle": 13.517, "flore": 82, "faune": 79,
          "moons": [
            { "name": "Thalumvyn", "radius": 30, "orbitRadius": 194, "orbitSpeed": 0.3461, "angle": 57.744, "flore": 20, "faune": 45 },
            { "name": "Eriitis", "radius": 20, "orbitRadius": 194, "orbitSpeed": 0.3461, "angle": 60.616, "flore": 11, "faune": 2 },
            { "name": "Draumir", "radius": 42, "orbitRadius": 280, "orbitSpeed": 0.2143, "angle": 34.799, "flore": 47, "faune": 6 }
          ]
        },
        { "name": "Pyxith", "radius": 75, "orbitRadius": 817, "orbitSpeed": 0.0441, "angle": 5.877, "flore": 32, "faune": 97,
          "moons": [
            { "name": "Celirlux", "radius": 30, "orbitRadius": 135, "orbitSpeed": 0.2486, "angle": 47.871, "flore": 18, "faune": 37 },
            { "name": "Xorospha", "radius": 24, "orbitRadius": 232, "orbitSpeed": 0.2569, "angle": 48.418, "flore": 23, "faune": 51 },
            { "name": "Velanria", "radius": 30, "orbitRadius": 135, "orbitSpeed": 0.2486, "angle": 45.36, "flore": 20, "faune": 6 },
            { "name": "Palaxria", "radius": 23, "orbitRadius": 232, "orbitSpeed": 0.2569, "angle": 46.037, "flore": 44, "faune": 34 }
          ]
        },
        { "name": "Sigadon", "radius": 96, "orbitRadius": 817, "orbitSpeed": 0.0441, "angle": 2.525, "flore": 95, "faune": 25,
          "moons": [
            { "name": "Ithalux", "radius": 39, "orbitRadius": 171, "orbitSpeed": 0.3034, "angle": 28.292, "flore": 43, "faune": 46 }
          ]
        }
      ]
    },
    {
      "name": "Velelvyn", "radius": 212, "orbitRadius": 1232, "orbitSpeed": 0.0154, "angle": -1.331, "color": "#FFB830",
      "planets": [
        { "name": "Vorirnis", "radius": 111, "orbitRadius": 606, "orbitSpeed": 0.0481, "angle": 3.695, "flore": 93, "faune": 28,
          "moons": [
            { "name": "Vorirbus", "radius": 20, "orbitRadius": 166, "orbitSpeed": 0.2122, "angle": 13.618, "flore": 45, "faune": 59 },
            { "name": "Corenmir", "radius": 23, "orbitRadius": 257, "orbitSpeed": 0.2615, "angle": 14.888, "flore": 5, "faune": 7 },
            { "name": "Velumvyn", "radius": 36, "orbitRadius": 257, "orbitSpeed": 0.2615, "angle": 19.723, "flore": 36, "faune": 10 },
            { "name": "Draumus", "radius": 53, "orbitRadius": 257, "orbitSpeed": 0.2615, "angle": 17.518, "flore": 40, "faune": 21 },
            { "name": "Palalvyn", "radius": 36, "orbitRadius": 166, "orbitSpeed": 0.2122, "angle": 10.991, "flore": 49, "faune": 40 }
          ]
        },
        { "name": "Nebosra", "radius": 122, "orbitRadius": 606, "orbitSpeed": 0.0481, "angle": 0.765, "flore": 77, "faune": 66,
          "moons": [
            { "name": "Coraxth", "radius": 57, "orbitRadius": 239, "orbitSpeed": 0.2785, "angle": 13.813, "flore": 36, "faune": 23 },
            { "name": "Auredis", "radius": 50, "orbitRadius": 239, "orbitSpeed": 0.2785, "angle": 9.667, "flore": 16, "faune": 52 },
            { "name": "Synirtis", "radius": 23, "orbitRadius": 344, "orbitSpeed": 0.2913, "angle": 13.367, "flore": 32, "faune": 57 },
            { "name": "Lyrosth", "radius": 59, "orbitRadius": 344, "orbitSpeed": 0.2913, "angle": 11.266, "flore": 27, "faune": 47 }
          ]
        }
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Les Cinq Flammes",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    {
      "name": "Coriszar", "radius": 166, "orbitRadius": 1513, "orbitSpeed": 0.0151, "angle": 0.959, "color": "#FFB830",
      "planets": [
        { "name": "Velenxis", "radius": 114, "orbitRadius": 413, "orbitSpeed": 0.0453, "angle": 1.638, "flore": 93, "faune": 74,
          "moons": [
            { "name": "Paliton", "radius": 48, "orbitRadius": 196, "orbitSpeed": 0.1595, "angle": 4.007, "flore": 41, "faune": 14 },
            { "name": "Zanadon", "radius": 60, "orbitRadius": 196, "orbitSpeed": 0.1595, "angle": 6.275, "flore": 5, "faune": 46 }
          ]
        },
        { "name": "Auristis", "radius": 117, "orbitRadius": 920, "orbitSpeed": 0.0324, "angle": -1.063, "flore": 28, "faune": 38,
          "moons": [
            { "name": "Itheldon", "radius": 22, "orbitRadius": 194, "orbitSpeed": 0.3312, "angle": 13.179, "flore": 44, "faune": 50 },
            { "name": "Voridon", "radius": 26, "orbitRadius": 194, "orbitSpeed": 0.3312, "angle": 10.7, "flore": 34, "faune": 49 }
          ]
        },
        { "name": "Thalarlux", "radius": 124, "orbitRadius": 920, "orbitSpeed": 0.0324, "angle": 0.65, "flore": 50, "faune": 58,
          "moons": [
            { "name": "Lyrumir", "radius": 33, "orbitRadius": 252, "orbitSpeed": 0.1527, "angle": 2.608, "flore": 43, "faune": 44 }
          ]
        },
        { "name": "Lyrelton", "radius": 110, "orbitRadius": 920, "orbitSpeed": 0.0324, "angle": 2.623, "flore": 1, "faune": 3,
          "moons": [
            { "name": "Thalendis", "radius": 23, "orbitRadius": 270, "orbitSpeed": 0.271, "angle": 4.708, "flore": 49, "faune": 38 },
            { "name": "Vorismus", "radius": 31, "orbitRadius": 270, "orbitSpeed": 0.271, "angle": 10.454, "flore": 5, "faune": 20 },
            { "name": "Corenmir", "radius": 27, "orbitRadius": 218, "orbitSpeed": 0.216, "angle": 6.329, "flore": 34, "faune": 17 }
          ]
        }
      ]
    },
    {
      "name": "Ithexis", "radius": 243, "orbitRadius": 1513, "orbitSpeed": 0.0151, "angle": 3.213, "color": "#FF6B6B",
      "planets": [
        { "name": "Zanosnis", "radius": 72, "orbitRadius": 495, "orbitSpeed": 0.0494, "angle": 1.722, "flore": 63, "faune": 55,
          "moons": [
            { "name": "Auranra", "radius": 34, "orbitRadius": 149, "orbitSpeed": 0.1583, "angle": 2.169, "flore": 4, "faune": 43 },
            { "name": "Siganton", "radius": 26, "orbitRadius": 149, "orbitSpeed": 0.1583, "angle": 0.388, "flore": 27, "faune": 42 },
            { "name": "Kryaxpha", "radius": 39, "orbitRadius": 206, "orbitSpeed": 0.183, "angle": 4.578, "flore": 27, "faune": 31 }
          ]
        },
        { "name": "Celenria", "radius": 109, "orbitRadius": 930, "orbitSpeed": 0.0309, "angle": -0.336, "flore": 70, "faune": 48,
          "moons": [
            { "name": "Nebelria", "radius": 31, "orbitRadius": 179, "orbitSpeed": 0.2834, "angle": 6.308, "flore": 22, "faune": 14 },
            { "name": "Thalaxvyn", "radius": 51, "orbitRadius": 179, "orbitSpeed": 0.2834, "angle": 1.83, "flore": 30, "faune": 44 }
          ]
        },
        { "name": "Lyrenxis", "radius": 127, "orbitRadius": 495, "orbitSpeed": 0.0494, "angle": -1.607, "flore": 31, "faune": 68, "moons": [] },
        { "name": "Celumton", "radius": 115, "orbitRadius": 930, "orbitSpeed": 0.0309, "angle": 2.969, "flore": 26, "faune": 24,
          "moons": [
            { "name": "Kryanis", "radius": 27, "orbitRadius": 237, "orbitSpeed": 0.3072, "angle": 3.178, "flore": 4, "faune": 18 },
            { "name": "Erielvyn", "radius": 26, "orbitRadius": 279, "orbitSpeed": 0.1855, "angle": 3.263, "flore": 31, "faune": 30 },
            { "name": "Velivyn", "radius": 36, "orbitRadius": 237, "orbitSpeed": 0.3072, "angle": 6.637, "flore": 14, "faune": 9 },
            { "name": "Voraxnis", "radius": 57, "orbitRadius": 237, "orbitSpeed": 0.3072, "angle": 1.624, "flore": 13, "faune": 15 },
            { "name": "Velipha", "radius": 22, "orbitRadius": 237, "orbitSpeed": 0.3072, "angle": 2.523, "flore": 1, "faune": 9 }
          ]
        }
      ]
    },
    {
      "name": "Corumlux", "radius": 221, "orbitRadius": 1513, "orbitSpeed": 0.0151, "angle": -1.37, "color": "#FF8C42",
      "planets": [
        { "name": "Nebumth", "radius": 123, "orbitRadius": 493, "orbitSpeed": 0.065, "angle": 5.733, "flore": 16, "faune": 81, "moons": [] },
        { "name": "Lyralpha", "radius": 95, "orbitRadius": 806, "orbitSpeed": 0.0491, "angle": 2.966, "flore": 65, "faune": 8,
          "moons": [
            { "name": "Kryubus", "radius": 49, "orbitRadius": 176, "orbitSpeed": 0.1657, "angle": 14.12, "flore": 45, "faune": 29 },
            { "name": "Synirdis", "radius": 23, "orbitRadius": 176, "orbitSpeed": 0.1657, "angle": 16.421, "flore": 30, "faune": 16 },
            { "name": "Palelmus", "radius": 37, "orbitRadius": 176, "orbitSpeed": 0.1657, "angle": 16.462, "flore": 16, "faune": 32 },
            { "name": "Sigarth", "radius": 44, "orbitRadius": 371, "orbitSpeed": 0.322, "angle": 21.655, "flore": 41, "faune": 52 },
            { "name": "Vorirzar", "radius": 40, "orbitRadius": 371, "orbitSpeed": 0.322, "angle": 19.235, "flore": 31, "faune": 21 }
          ]
        },
        { "name": "Celaxdon", "radius": 83, "orbitRadius": 806, "orbitSpeed": 0.0491, "angle": 7.288, "flore": 77, "faune": 100,
          "moons": [
            { "name": "Synevyn", "radius": 47, "orbitRadius": 271, "orbitSpeed": 0.1785, "angle": 14.206, "flore": 20, "faune": 31 },
            { "name": "Erialux", "radius": 51, "orbitRadius": 426, "orbitSpeed": 0.298, "angle": 26.721, "flore": 32, "faune": 14 },
            { "name": "Aurirvyn", "radius": 56, "orbitRadius": 426, "orbitSpeed": 0.298, "angle": 22.301, "flore": 23, "faune": 18 },
            { "name": "Omialdis", "radius": 33, "orbitRadius": 271, "orbitSpeed": 0.1785, "angle": 16.351, "flore": 28, "faune": 15 }
          ]
        }
      ]
    },
    {
      "name": "Zanosria", "radius": 209, "orbitRadius": 3080, "orbitSpeed": 0.0118, "angle": -0.136, "color": "#FFB830",
      "planets": [
        { "name": "Pyxirlux", "radius": 111, "orbitRadius": 550, "orbitSpeed": 0.0475, "angle": 2.856, "flore": 143, "faune": 77,
          "moons": [
            { "name": "Ithonnis", "radius": 26, "orbitRadius": 244, "orbitSpeed": 0.3019, "angle": 3.652, "flore": 169, "faune": 54 },
            { "name": "Palath", "radius": 44, "orbitRadius": 244, "orbitSpeed": 0.3019, "angle": 5.757, "flore": 149, "faune": 19 }
          ]
        },
        { "name": "Ithaxdon", "radius": 80, "orbitRadius": 550, "orbitSpeed": 0.0475, "angle": -0.628, "flore": 149, "faune": 117,
          "moons": [
            { "name": "Zanamir", "radius": 43, "orbitRadius": 162, "orbitSpeed": 0.3118, "angle": 2.684, "flore": 71, "faune": 51 },
            { "name": "Zetovyn", "radius": 23, "orbitRadius": 162, "orbitSpeed": 0.3118, "angle": 0.449, "flore": 84, "faune": 66 }
          ]
        }
      ]
    },
    {
      "name": "Synaxra", "radius": 242, "orbitRadius": 3080, "orbitSpeed": 0.0118, "angle": -2.405, "color": "#7CB9FF",
      "planets": [
        { "name": "Pyxelra", "radius": 77, "orbitRadius": 529, "orbitSpeed": 0.0458, "angle": 2.666, "flore": 50, "faune": 20,
          "moons": [
            { "name": "Nebuton", "radius": 27, "orbitRadius": 192, "orbitSpeed": 0.2246, "angle": -1.265, "flore": 61, "faune": 45 },
            { "name": "Lyriria", "radius": 48, "orbitRadius": 192, "orbitSpeed": 0.2246, "angle": 3.303, "flore": 50, "faune": 30 },
            { "name": "Nebismus", "radius": 27, "orbitRadius": 261, "orbitSpeed": 0.2635, "angle": 2.385, "flore": 27, "faune": 13 },
            { "name": "Pyxosra", "radius": 28, "orbitRadius": 261, "orbitSpeed": 0.2635, "angle": 1.147, "flore": 61, "faune": 23 },
            { "name": "Draapha", "radius": 48, "orbitRadius": 261, "orbitSpeed": 0.2635, "angle": -1.824, "flore": 14, "faune": 23 }
          ]
        },
        { "name": "Corapha", "radius": 105, "orbitRadius": 529, "orbitSpeed": 0.0458, "angle": 0.006, "flore": 59, "faune": 49,
          "moons": [
            { "name": "Pyxoslux", "radius": 35, "orbitRadius": 160, "orbitSpeed": 0.2045, "angle": -1.015, "flore": 20, "faune": 37 },
            { "name": "Zanora", "radius": 47, "orbitRadius": 160, "orbitSpeed": 0.2045, "angle": 0.604, "flore": 12, "faune": 20 }
          ]
        },
        { "name": "Nebisxis", "radius": 99, "orbitRadius": 743, "orbitSpeed": 0.0331, "angle": 1.245, "flore": 24, "faune": 51,
          "moons": [
            { "name": "Thalirth", "radius": 40, "orbitRadius": 160, "orbitSpeed": 0.3096, "angle": 0.097, "flore": 35, "faune": 26 },
            { "name": "Palalvyn", "radius": 30, "orbitRadius": 266, "orbitSpeed": 0.2675, "angle": 0.33, "flore": 19, "faune": 28 },
            { "name": "Synospha", "radius": 21, "orbitRadius": 266, "orbitSpeed": 0.2675, "angle": 3.132, "flore": 31, "faune": 19 }
          ]
        }
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Éclipse Jumelle",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    {
      "name": "Draosmus", "radius": 185, "orbitRadius": 1687, "orbitSpeed": 0.016, "angle": 1.281, "color": "#FFB830",
      "planets": [
        { "name": "Draonmir", "radius": 117, "orbitRadius": 625, "orbitSpeed": 0.0489, "angle": 7.088, "flore": 60, "faune": 59,
          "moons": [
            { "name": "Voronbus", "radius": 31, "orbitRadius": 184, "orbitSpeed": 0.1696, "angle": 19.048, "flore": 34, "faune": 46 },
            { "name": "Eriath", "radius": 38, "orbitRadius": 311, "orbitSpeed": 0.1759, "angle": 21.705, "flore": 3, "faune": 1 },
            { "name": "Zetaxlux", "radius": 48, "orbitRadius": 311, "orbitSpeed": 0.1759, "angle": 23.49, "flore": 41, "faune": 56 }
          ]
        },
        { "name": "Omiirria", "radius": 74, "orbitRadius": 1002, "orbitSpeed": 0.038, "angle": 8.234, "flore": 64, "faune": 35,
          "moons": [
            { "name": "Pyxaltis", "radius": 39, "orbitRadius": 210, "orbitSpeed": 0.1712, "angle": 20.036, "flore": 47, "faune": 36 },
            { "name": "Synedon", "radius": 52, "orbitRadius": 210, "orbitSpeed": 0.1712, "angle": 22.513, "flore": 38, "faune": 19 }
          ]
        },
        { "name": "Kryonxis", "radius": 123, "orbitRadius": 1002, "orbitSpeed": 0.038, "angle": 4.194, "flore": 72, "faune": 9,
          "moons": [
            { "name": "Erianvyn", "radius": 49, "orbitRadius": 218, "orbitSpeed": 0.3216, "angle": 46.587, "flore": 7, "faune": 55 },
            { "name": "Nebanria", "radius": 32, "orbitRadius": 331, "orbitSpeed": 0.1937, "angle": 17.911, "flore": 24, "faune": 59 }
          ]
        }
      ]
    },
    {
      "name": "Xorilux", "radius": 241, "orbitRadius": 1687, "orbitSpeed": 0.016, "angle": -1.493, "color": "#FF8C42",
      "planets": [
        { "name": "Synonth", "radius": 112, "orbitRadius": 978, "orbitSpeed": 0.0364, "angle": 2.267, "flore": 285, "faune": 99,
          "moons": [
            { "name": "Veluxis", "radius": 21, "orbitRadius": 191, "orbitSpeed": 0.2171, "angle": 20.388, "flore": 74, "faune": 63 },
            { "name": "Xorendon", "radius": 26, "orbitRadius": 405, "orbitSpeed": 0.2605, "angle": 21.248, "flore": 37, "faune": 84 },
            { "name": "Corixis", "radius": 57, "orbitRadius": 405, "orbitSpeed": 0.2605, "angle": 22.763, "flore": 55, "faune": 75 },
            { "name": "Palumxis", "radius": 24, "orbitRadius": 405, "orbitSpeed": 0.2605, "angle": 19.193, "flore": 211, "faune": 50 }
          ]
        }
      ]
    },
    {
      "name": "Palazar", "radius": 218, "orbitRadius": 2797, "orbitSpeed": 0.01, "angle": 3.014, "color": "#FFE44D",
      "planets": [
        { "name": "Kryaxria", "radius": 86, "orbitRadius": 473, "orbitSpeed": 0.0676, "angle": 2.985, "flore": 60, "faune": 18,
          "moons": [
            { "name": "Aurenxis", "radius": 45, "orbitRadius": 192, "orbitSpeed": 0.1675, "angle": 6.178, "flore": 10, "faune": 50 },
            { "name": "Corenria", "radius": 34, "orbitRadius": 243, "orbitSpeed": 0.2531, "angle": 10.621, "flore": 36, "faune": 9 },
            { "name": "Kryardis", "radius": 36, "orbitRadius": 192, "orbitSpeed": 0.1675, "angle": 3.636, "flore": 27, "faune": 51 }
          ]
        },
        { "name": "Draanpha", "radius": 91, "orbitRadius": 801, "orbitSpeed": 0.0356, "angle": 0.29, "flore": 76, "faune": 67,
          "moons": [
            { "name": "Ithumvyn", "radius": 54, "orbitRadius": 176, "orbitSpeed": 0.2399, "angle": 7.553, "flore": 41, "faune": 51 },
            { "name": "Xorenra", "radius": 32, "orbitRadius": 176, "orbitSpeed": 0.2399, "angle": 5.581, "flore": 43, "faune": 44 }
          ]
        },
        { "name": "Sigomus", "radius": 112, "orbitRadius": 801, "orbitSpeed": 0.0356, "angle": 4.304, "flore": 4, "faune": 35,
          "moons": [
            { "name": "Celarria", "radius": 56, "orbitRadius": 213, "orbitSpeed": 0.1754, "angle": 4.289, "flore": 8, "faune": 24 },
            { "name": "Eriudis", "radius": 54, "orbitRadius": 213, "orbitSpeed": 0.1754, "angle": 6.821, "flore": 10, "faune": 19 },
            { "name": "Xorenton", "radius": 59, "orbitRadius": 379, "orbitSpeed": 0.1939, "angle": 2.932, "flore": 36, "faune": 50 },
            { "name": "Omiidis", "radius": 32, "orbitRadius": 379, "orbitSpeed": 0.1939, "angle": 6.383, "flore": 28, "faune": 16 }
          ]
        }
      ]
    },
    {
      "name": "Pyxudon", "radius": 244, "orbitRadius": 2797, "orbitSpeed": 0.01, "angle": -0.392, "color": "#FF6B6B",
      "planets": [
        { "name": "Sigozar", "radius": 94, "orbitRadius": 542, "orbitSpeed": 0.0519, "angle": 0.458, "flore": 58, "faune": 29,
          "moons": [
            { "name": "Vorirmus", "radius": 46, "orbitRadius": 222, "orbitSpeed": 0.3025, "angle": 1.216, "flore": 36, "faune": 60 },
            { "name": "Aurandis", "radius": 44, "orbitRadius": 222, "orbitSpeed": 0.3025, "angle": 5.132, "flore": 48, "faune": 10 },
            { "name": "Thalepha", "radius": 35, "orbitRadius": 149, "orbitSpeed": 0.1575, "angle": 1.677, "flore": 40, "faune": 12 }
          ]
        },
        { "name": "Zetalra", "radius": 99, "orbitRadius": 734, "orbitSpeed": 0.0553, "angle": -1.113, "flore": 12, "faune": 75,
          "moons": [
            { "name": "Syniria", "radius": 40, "orbitRadius": 159, "orbitSpeed": 0.3499, "angle": 6.648, "flore": 28, "faune": 37 },
            { "name": "Corirxis", "radius": 30, "orbitRadius": 159, "orbitSpeed": 0.3499, "angle": 3.067, "flore": 37, "faune": 42 },
            { "name": "Zanazar", "radius": 60, "orbitRadius": 354, "orbitSpeed": 0.2866, "angle": 3.025, "flore": 44, "faune": 47 }
          ]
        },
        { "name": "Celipha", "radius": 71, "orbitRadius": 542, "orbitSpeed": 0.0519, "angle": 3.612, "flore": 35, "faune": 96,
          "moons": [
            { "name": "Zetalmir", "radius": 34, "orbitRadius": 129, "orbitSpeed": 0.1568, "angle": 1.444, "flore": 4, "faune": 7 },
            { "name": "Palenton", "radius": 23, "orbitRadius": 129, "orbitSpeed": 0.1568, "angle": -0.731, "flore": 40, "faune": 16 }
          ]
        }
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Amas Titanesque",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    {
      "name": "Corellux", "radius": 168, "orbitRadius": 936, "orbitSpeed": 0.0172, "angle": 1.398, "color": "#FFB830",
      "planets": [
        { "name": "Ithalria", "radius": 96, "orbitRadius": 487, "orbitSpeed": 0.0556, "angle": 4.343, "flore": 63, "faune": 16,
          "moons": [
            { "name": "Aurumpha", "radius": 22, "orbitRadius": 169, "orbitSpeed": 0.1503, "angle": 8.77, "flore": 59, "faune": 18 },
            { "name": "Erialria", "radius": 33, "orbitRadius": 169, "orbitSpeed": 0.1503, "angle": 11.17, "flore": 70, "faune": 26 },
            { "name": "Zanumtis", "radius": 20, "orbitRadius": 169, "orbitSpeed": 0.1503, "angle": 9.762, "flore": 70, "faune": 24 }
          ]
        },
        { "name": "Zanumra", "radius": 81, "orbitRadius": 487, "orbitSpeed": 0.0556, "angle": 2.269, "flore": 56, "faune": 49,
          "moons": [
            { "name": "Kryexis", "radius": 42, "orbitRadius": 180, "orbitSpeed": 0.3424, "angle": 25.716, "flore": 66, "faune": 18 },
            { "name": "Thaluxis", "radius": 49, "orbitRadius": 180, "orbitSpeed": 0.3424, "angle": 24.297, "flore": 6, "faune": 19 },
            { "name": "Xorelmir", "radius": 36, "orbitRadius": 242, "orbitSpeed": 0.2466, "angle": 16.115, "flore": 55, "faune": 52 },
            { "name": "Voruria", "radius": 34, "orbitRadius": 242, "orbitSpeed": 0.2466, "angle": 14.53, "flore": 59, "faune": 53 }
          ]
        }
      ]
    },
    {
      "name": "Nebanlux", "radius": 178, "orbitRadius": 936, "orbitSpeed": 0.0172, "angle": -0.908, "color": "#FF6B6B",
      "planets": [
        { "name": "Velonlux", "radius": 92, "orbitRadius": 368, "orbitSpeed": 0.0519, "angle": 1.987, "flore": 59, "faune": 43,
          "moons": [
            { "name": "Auranxis", "radius": 37, "orbitRadius": 179, "orbitSpeed": 0.2778, "angle": 13.421, "flore": 11, "faune": 26 }
          ]
        },
        { "name": "Ithospha", "radius": 89, "orbitRadius": 368, "orbitSpeed": 0.0519, "angle": 4.726, "flore": 78, "faune": 69,
          "moons": [
            { "name": "Zetera", "radius": 32, "orbitRadius": 144, "orbitSpeed": 0.1765, "angle": 5.847, "flore": 41, "faune": 11 },
            { "name": "Synalbus", "radius": 35, "orbitRadius": 144, "orbitSpeed": 0.1765, "angle": 10.091, "flore": 70, "faune": 35 }
          ]
        },
        { "name": "Zanumvyn", "radius": 78, "orbitRadius": 629, "orbitSpeed": 0.0476, "angle": 5.433, "flore": 47, "faune": 61,
          "moons": [
            { "name": "Aurumth", "radius": 43, "orbitRadius": 218, "orbitSpeed": 0.3409, "angle": 13.397, "flore": 2, "faune": 14 },
            { "name": "Synaxxis", "radius": 24, "orbitRadius": 218, "orbitSpeed": 0.3409, "angle": 17.809, "flore": 56, "faune": 38 }
          ]
        }
      ]
    },
    {
      "name": "Voroton", "radius": 171, "orbitRadius": 2322, "orbitSpeed": 0.0155, "angle": 0.253, "color": "#FF8C42",
      "planets": [
        { "name": "Coronlux", "radius": 104, "orbitRadius": 746, "orbitSpeed": 0.034, "angle": 0.013, "flore": 34, "faune": 43,
          "moons": [
            { "name": "Kryabus", "radius": 38, "orbitRadius": 213, "orbitSpeed": 0.2691, "angle": 2.005, "flore": 8, "faune": 1 },
            { "name": "Erienis", "radius": 48, "orbitRadius": 213, "orbitSpeed": 0.2691, "angle": 4.988, "flore": 26, "faune": 18 },
            { "name": "Velexis", "radius": 29, "orbitRadius": 450, "orbitSpeed": 0.3281, "angle": 4.716, "flore": 10, "faune": 24 },
            { "name": "Omielxis", "radius": 50, "orbitRadius": 450, "orbitSpeed": 0.3281, "angle": 1.591, "flore": 38, "faune": 18 },
            { "name": "Palalxis", "radius": 57, "orbitRadius": 450, "orbitSpeed": 0.3281, "angle": 6.408, "flore": 15, "faune": 32 },
            { "name": "Kryisria", "radius": 53, "orbitRadius": 450, "orbitSpeed": 0.3281, "angle": 6.274, "flore": 11, "faune": 29 }
          ]
        },
        { "name": "Thalendon", "radius": 116, "orbitRadius": 746, "orbitSpeed": 0.034, "angle": 3.567, "flore": 25, "faune": 56,
          "moons": [
            { "name": "Sigalra", "radius": 23, "orbitRadius": 209, "orbitSpeed": 0.2724, "angle": 3.654, "flore": 44, "faune": 16 },
            { "name": "Corolux", "radius": 60, "orbitRadius": 302, "orbitSpeed": 0.1807, "angle": 0.91, "flore": 45, "faune": 46 },
            { "name": "Voraxlux", "radius": 42, "orbitRadius": 209, "orbitSpeed": 0.2724, "angle": 6.116, "flore": 48, "faune": 14 }
          ]
        }
      ]
    },
    {
      "name": "Corandis", "radius": 216, "orbitRadius": 2322, "orbitSpeed": 0.0155, "angle": 1.943, "color": "#FFB830",
      "planets": [
        { "name": "Nebuzar", "radius": 71, "orbitRadius": 321, "orbitSpeed": 0.0661, "angle": 6.543, "flore": 96, "faune": 8, "moons": [] },
        { "name": "Zanalxis", "radius": 119, "orbitRadius": 643, "orbitSpeed": 0.0465, "angle": 3.444, "flore": 46, "faune": 119,
          "moons": [
            { "name": "Zetirbus", "radius": 42, "orbitRadius": 178, "orbitSpeed": 0.2048, "angle": 21.437, "flore": 73, "faune": 66 },
            { "name": "Lyrisxis", "radius": 32, "orbitRadius": 178, "orbitSpeed": 0.2048, "angle": 18.995, "flore": 127, "faune": 0 },
            { "name": "Vorirmir", "radius": 29, "orbitRadius": 242, "orbitSpeed": 0.2663, "angle": 23.548, "flore": 131, "faune": 56 },
            { "name": "Kryeldis", "radius": 37, "orbitRadius": 242, "orbitSpeed": 0.2663, "angle": 22.121, "flore": 135, "faune": 3 }
          ]
        }
      ]
    },
    {
      "name": "Aurovyn", "radius": 156, "orbitRadius": 2322, "orbitSpeed": 0.0155, "angle": 4.504, "color": "#FF8C42",
      "planets": [
        { "name": "Omiedis", "radius": 117, "orbitRadius": 994, "orbitSpeed": 0.0283, "angle": 3.701, "flore": 1, "faune": 2,
          "moons": [
            { "name": "Velumria", "radius": 24, "orbitRadius": 156, "orbitSpeed": 0.2336, "angle": 2.979, "flore": 1, "faune": 23 }
          ]
        },
        { "name": "Zanarmir", "radius": 107, "orbitRadius": 654, "orbitSpeed": 0.0586, "angle": 6.159, "flore": 1, "faune": 27,
          "moons": [
            { "name": "Draalux", "radius": 30, "orbitRadius": 151, "orbitSpeed": 0.2427, "angle": 7.305, "flore": 1, "faune": 35 }
          ]
        },
        { "name": "Ithilux", "radius": 113, "orbitRadius": 654, "orbitSpeed": 0.0586, "angle": 4.099, "flore": 1, "faune": 16,
          "moons": [
            { "name": "Palonth", "radius": 54, "orbitRadius": 234, "orbitSpeed": 0.3252, "angle": 11.079, "flore": 1, "faune": 31 },
            { "name": "Draellux", "radius": 24, "orbitRadius": 234, "orbitSpeed": 0.3252, "angle": 13.061, "flore": 1, "faune": 1 },
            { "name": "Kryirbus", "radius": 33, "orbitRadius": 234, "orbitSpeed": 0.3252, "angle": 8.551, "flore": 1, "faune": 16 }
          ]
        },
        { "name": "Thalonis", "radius": 123, "orbitRadius": 994, "orbitSpeed": 0.0283, "angle": 5.201, "flore": 1, "faune": 42,
          "moons": [
            { "name": "Vorilux", "radius": 33, "orbitRadius": 201, "orbitSpeed": 0.3049, "angle": 6.651, "flore": 1, "faune": 4 },
            { "name": "Corabus", "radius": 26, "orbitRadius": 201, "orbitSpeed": 0.3049, "angle": 10.775, "flore": 1, "faune": 3 },
            { "name": "Thalirxis", "radius": 46, "orbitRadius": 257, "orbitSpeed": 0.3295, "angle": 4.538, "flore": 1, "faune": 24 }
          ]
        },
        { "name": "Kryarra", "radius": 78, "orbitRadius": 363, "orbitSpeed": 0.0598, "angle": 7.601, "flore": 1, "faune": 17,
          "moons": [
            { "name": "Draodon", "radius": 35, "orbitRadius": 131, "orbitSpeed": 0.3141, "angle": 12.252, "flore": 1, "faune": 23 },
            { "name": "Thalanpha", "radius": 29, "orbitRadius": 131, "orbitSpeed": 0.3141, "angle": 15.444, "flore": 1, "faune": 33 }
          ]
        }
      ]
    },
    {
      "name": "Thalezar", "radius": 218, "orbitRadius": 3265, "orbitSpeed": 0.009, "angle": 3.01, "color": "#7CB9FF",
      "planets": [
        { "name": "Kryalria", "radius": 110, "orbitRadius": 516, "orbitSpeed": 0.0415, "angle": -1.319, "flore": 43, "faune": 3,
          "moons": [
            { "name": "Paluria", "radius": 36, "orbitRadius": 181, "orbitSpeed": 0.3235, "angle": 1.745, "flore": 89, "faune": 69 },
            { "name": "Kryosvyn", "radius": 23, "orbitRadius": 181, "orbitSpeed": 0.3235, "angle": -0.878, "flore": 33, "faune": 110 },
            { "name": "Draisdis", "radius": 37, "orbitRadius": 181, "orbitSpeed": 0.3235, "angle": 3.857, "flore": 65, "faune": 63 }
          ]
        },
        { "name": "Omiondis", "radius": 123, "orbitRadius": 516, "orbitSpeed": 0.0415, "angle": 2.197, "flore": 141, "faune": 8, "moons": [] }
      ]
    },
    {
      "name": "Lyralzar", "radius": 210, "orbitRadius": 3265, "orbitSpeed": 0.009, "angle": -0.561, "color": "#FFB830",
      "planets": [
        { "name": "Auranxis", "radius": 73, "orbitRadius": 492, "orbitSpeed": 0.0659, "angle": -1.631, "flore": 395, "faune": 191,
          "moons": [
            { "name": "Thalubus", "radius": 29, "orbitRadius": 137, "orbitSpeed": 0.1645, "angle": -0.439, "flore": 500, "faune": 62 }
          ]
        }
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Sentinelle Rouge",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    {
      "name": "Omianlux", "radius": 156, "orbitRadius": 1935, "orbitSpeed": 0.0126, "angle": 0.288, "color": "#FFE44D",
      "planets": [
        { "name": "Celixis", "radius": 94, "orbitRadius": 547, "orbitSpeed": 0.043, "angle": 1.368, "flore": 25, "faune": 33,
          "moons": [
            { "name": "Erienpha", "radius": 38, "orbitRadius": 177, "orbitSpeed": 0.1573, "angle": 5.311, "flore": 9, "faune": 9 },
            { "name": "Corenra", "radius": 36, "orbitRadius": 177, "orbitSpeed": 0.1573, "angle": 6.695, "flore": 30, "faune": 52 },
            { "name": "Pyxiria", "radius": 47, "orbitRadius": 334, "orbitSpeed": 0.2015, "angle": 10.248, "flore": 32, "faune": 42 },
            { "name": "Thalonlux", "radius": 23, "orbitRadius": 334, "orbitSpeed": 0.2015, "angle": 11.77, "flore": 15, "faune": 6 }
          ]
        },
        { "name": "Xorumlux", "radius": 102, "orbitRadius": 547, "orbitSpeed": 0.043, "angle": -0.618, "flore": 72, "faune": 43,
          "moons": [
            { "name": "Corardis", "radius": 54, "orbitRadius": 179, "orbitSpeed": 0.2404, "angle": 10.03, "flore": 16, "faune": 49 },
            { "name": "Xoraxnis", "radius": 51, "orbitRadius": 179, "orbitSpeed": 0.2404, "angle": 13.064, "flore": 37, "faune": 5 },
            { "name": "Zanalbus", "radius": 40, "orbitRadius": 356, "orbitSpeed": 0.1933, "angle": 11.776, "flore": 11, "faune": 12 },
            { "name": "Kryaldis", "radius": 27, "orbitRadius": 179, "orbitSpeed": 0.2404, "angle": 11.419, "flore": 42, "faune": 57 }
          ]
        },
        { "name": "Erialmir", "radius": 128, "orbitRadius": 867, "orbitSpeed": 0.0424, "angle": 2.957, "flore": 99, "faune": 17,
          "moons": [
            { "name": "Paloszar", "radius": 28, "orbitRadius": 237, "orbitSpeed": 0.2305, "angle": 8.062, "flore": 36, "faune": 46 },
            { "name": "Sigosvyn", "radius": 60, "orbitRadius": 237, "orbitSpeed": 0.2305, "angle": 5.893, "flore": 1, "faune": 43 },
            { "name": "Erioszar", "radius": 28, "orbitRadius": 458, "orbitSpeed": 0.2349, "angle": 11.13, "flore": 17, "faune": 16 },
            { "name": "Synodis", "radius": 34, "orbitRadius": 458, "orbitSpeed": 0.2349, "angle": 5.822, "flore": 27, "faune": 44 }
          ]
        }
      ]
    },
    {
      "name": "Xoraria", "radius": 190, "orbitRadius": 1935, "orbitSpeed": 0.0126, "angle": 3.549, "color": "#FFB830",
      "planets": [
        { "name": "Thalelzar", "radius": 124, "orbitRadius": 779, "orbitSpeed": 0.0371, "angle": 2.159, "flore": 23, "faune": 52,
          "moons": [
            { "name": "Sigenpha", "radius": 26, "orbitRadius": 310, "orbitSpeed": 0.2278, "angle": 18.436, "flore": 18, "faune": 40 },
            { "name": "Kryonmus", "radius": 50, "orbitRadius": 310, "orbitSpeed": 0.2278, "angle": 16.289, "flore": 22, "faune": 51 },
            { "name": "Palopha", "radius": 59, "orbitRadius": 488, "orbitSpeed": 0.174, "angle": 15.865, "flore": 49, "faune": 50 },
            { "name": "Vorarxis", "radius": 39, "orbitRadius": 488, "orbitSpeed": 0.174, "angle": 12.998, "flore": 10, "faune": 30 }
          ]
        },
        { "name": "Synaxmir", "radius": 103, "orbitRadius": 779, "orbitSpeed": 0.0371, "angle": 4.58, "flore": 70, "faune": 5,
          "moons": [
            { "name": "Palera", "radius": 46, "orbitRadius": 219, "orbitSpeed": 0.297, "angle": 22.181, "flore": 2, "faune": 45 },
            { "name": "Kryelth", "radius": 48, "orbitRadius": 219, "orbitSpeed": 0.297, "angle": 19.818, "flore": 11, "faune": 7 },
            { "name": "Zetumxis", "radius": 26, "orbitRadius": 397, "orbitSpeed": 0.2508, "angle": 17.933, "flore": 13, "faune": 39 },
            { "name": "Thalirlux", "radius": 50, "orbitRadius": 397, "orbitSpeed": 0.2508, "angle": 19.393, "flore": 27, "faune": 25 }
          ]
        },
        { "name": "Thalith", "radius": 127, "orbitRadius": 779, "orbitSpeed": 0.0371, "angle": 6.459, "flore": 41, "faune": 81,
          "moons": [
            { "name": "Pyxalria", "radius": 47, "orbitRadius": 276, "orbitSpeed": 0.3101, "angle": 19.814, "flore": 7, "faune": 16 },
            { "name": "Kryaria", "radius": 34, "orbitRadius": 276, "orbitSpeed": 0.3101, "angle": 18.527, "flore": 44, "faune": 41 },
            { "name": "Lyranpha", "radius": 50, "orbitRadius": 276, "orbitSpeed": 0.3101, "angle": 22.404, "flore": 37, "faune": 4 },
            { "name": "Draolux", "radius": 21, "orbitRadius": 555, "orbitSpeed": 0.2183, "angle": 16.984, "flore": 36, "faune": 26 }
          ]
        }
      ]
    },
    {
      "name": "Omialth", "radius": 232, "orbitRadius": 4030, "orbitSpeed": 0.0105, "angle": -1.198, "color": "#FF6B6B",
      "planets": [
        { "name": "Erienmus", "radius": 90, "orbitRadius": 536, "orbitSpeed": 0.0635, "angle": 0.308, "flore": 283, "faune": 190,
          "moons": [
            { "name": "Velosbus", "radius": 35, "orbitRadius": 165, "orbitSpeed": 0.2917, "angle": 4.634, "flore": 374, "faune": 56 },
            { "name": "Aurirth", "radius": 39, "orbitRadius": 165, "orbitSpeed": 0.2917, "angle": 5.478, "flore": 324, "faune": 43 },
            { "name": "Xorellux", "radius": 49, "orbitRadius": 165, "orbitSpeed": 0.2917, "angle": 1.303, "flore": 91, "faune": 5 },
            { "name": "Vorirra", "radius": 29, "orbitRadius": 165, "orbitSpeed": 0.2917, "angle": 3.042, "flore": 175, "faune": 142 }
          ]
        }
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Le Carrousel",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    {
      "name": "Draenton", "radius": 217, "orbitRadius": 2431, "orbitSpeed": 0.0143, "angle": -0.277, "color": "#7CB9FF",
      "planets": [
        { "name": "Synenra", "radius": 104, "orbitRadius": 463, "orbitSpeed": 0.0601, "angle": 5.166, "flore": 97, "faune": 62,
          "moons": [
            { "name": "Lyrenis", "radius": 39, "orbitRadius": 175, "orbitSpeed": 0.2832, "angle": 27.581, "flore": 33, "faune": 30 }
          ]
        },
        { "name": "Voronth", "radius": 72, "orbitRadius": 1071, "orbitSpeed": 0.0366, "angle": 1.295, "flore": 88, "faune": 15,
          "moons": [
            { "name": "Pyxevyn", "radius": 40, "orbitRadius": 312, "orbitSpeed": 0.3013, "angle": 28.358, "flore": 18, "faune": 5 },
            { "name": "Corelnis", "radius": 44, "orbitRadius": 419, "orbitSpeed": 0.3108, "angle": 32.166, "flore": 23, "faune": 41 }
          ]
        },
        { "name": "Corolux", "radius": 81, "orbitRadius": 1071, "orbitSpeed": 0.0366, "angle": 4.896, "flore": 81, "faune": 3,
          "moons": [
            { "name": "Zanisra", "radius": 33, "orbitRadius": 151, "orbitSpeed": 0.2381, "angle": 24.823, "flore": 39, "faune": 62 },
            { "name": "Ithedis", "radius": 40, "orbitRadius": 300, "orbitSpeed": 0.3239, "angle": 35.161, "flore": 16, "faune": 9 },
            { "name": "Draanton", "radius": 22, "orbitRadius": 300, "orbitSpeed": 0.3239, "angle": 37.903, "flore": 16, "faune": 33 }
          ]
        }
      ]
    },
    {
      "name": "Pyxardon", "radius": 175, "orbitRadius": 2431, "orbitSpeed": 0.0143, "angle": 1.135, "color": "#FF8C42",
      "planets": [
        { "name": "Lyrarvyn", "radius": 95, "orbitRadius": 643, "orbitSpeed": 0.058, "angle": 3.718, "flore": 32, "faune": 22,
          "moons": [
            { "name": "Nebovyn", "radius": 31, "orbitRadius": 157, "orbitSpeed": 0.1557, "angle": 8.463, "flore": 25, "faune": 17 },
            { "name": "Palemir", "radius": 20, "orbitRadius": 157, "orbitSpeed": 0.1557, "angle": 10.598, "flore": 48, "faune": 50 }
          ]
        },
        { "name": "Eriirzar", "radius": 109, "orbitRadius": 1093, "orbitSpeed": 0.0335, "angle": 5.581, "flore": 44, "faune": 21,
          "moons": [
            { "name": "Coreton", "radius": 59, "orbitRadius": 248, "orbitSpeed": 0.1685, "angle": 10.239, "flore": 20, "faune": 31 },
            { "name": "Pyxeltis", "radius": 20, "orbitRadius": 455, "orbitSpeed": 0.3029, "angle": 18.166, "flore": 13, "faune": 23 },
            { "name": "Vorara", "radius": 46, "orbitRadius": 455, "orbitSpeed": 0.3029, "angle": 22.333, "flore": 34, "faune": 32 }
          ]
        },
        { "name": "Eriora", "radius": 112, "orbitRadius": 1093, "orbitSpeed": 0.0335, "angle": 2.004, "flore": 37, "faune": 51,
          "moons": [
            { "name": "Corirth", "radius": 26, "orbitRadius": 251, "orbitSpeed": 0.2819, "angle": 20.066, "flore": 47, "faune": 34 }
          ]
        }
      ]
    },
    {
      "name": "Xoronmus", "radius": 174, "orbitRadius": 2431, "orbitSpeed": 0.0143, "angle": 4.426, "color": "#FF8C42",
      "planets": [
        { "name": "Pyxoton", "radius": 83, "orbitRadius": 557, "orbitSpeed": 0.0394, "angle": -0.175, "flore": 23, "faune": 37,
          "moons": [
            { "name": "Vorara", "radius": 48, "orbitRadius": 180, "orbitSpeed": 0.2277, "angle": 1.548, "flore": 28, "faune": 58 }
          ]
        },
        { "name": "Eriarth", "radius": 98, "orbitRadius": 875, "orbitSpeed": 0.0334, "angle": 3.745, "flore": 5, "faune": 11,
          "moons": [
            { "name": "Palaldis", "radius": 20, "orbitRadius": 181, "orbitSpeed": 0.184, "angle": 1.559, "flore": 62, "faune": 3 },
            { "name": "Auranton", "radius": 29, "orbitRadius": 181, "orbitSpeed": 0.184, "angle": -0.975, "flore": 46, "faune": 37 }
          ]
        },
        { "name": "Kryaxbus", "radius": 104, "orbitRadius": 875, "orbitSpeed": 0.0334, "angle": 1.452, "flore": 15, "faune": 88,
          "moons": [
            { "name": "Zetizar", "radius": 34, "orbitRadius": 243, "orbitSpeed": 0.3376, "angle": 5.585, "flore": 89, "faune": 40 },
            { "name": "Nebirmir", "radius": 25, "orbitRadius": 243, "orbitSpeed": 0.3376, "angle": 3.839, "flore": 125, "faune": 10 },
            { "name": "Thalaxvyn", "radius": 50, "orbitRadius": 450, "orbitSpeed": 0.2912, "angle": 7.412, "flore": 99, "faune": 1 }
          ]
        }
      ]
    },
    {
      "name": "Lyralmir", "radius": 221, "orbitRadius": 2431, "orbitSpeed": 0.0143, "angle": 2.491, "color": "#FFB830",
      "planets": [
        { "name": "Velemus", "radius": 98, "orbitRadius": 543, "orbitSpeed": 0.0662, "angle": 2.016, "flore": 78, "faune": 83,
          "moons": [
            { "name": "Synenra", "radius": 47, "orbitRadius": 174, "orbitSpeed": 0.2072, "angle": 7.589, "flore": 7, "faune": 3 }
          ]
        },
        { "name": "Aurirxis", "radius": 98, "orbitRadius": 543, "orbitSpeed": 0.0662, "angle": 5.528, "flore": 64, "faune": 30,
          "moons": [
            { "name": "Eriudon", "radius": 35, "orbitRadius": 220, "orbitSpeed": 0.2196, "angle": 7.392, "flore": 30, "faune": 44 },
            { "name": "Thalelvyn", "radius": 56, "orbitRadius": 220, "orbitSpeed": 0.2196, "angle": 11.648, "flore": 36, "faune": 55 }
          ]
        },
        { "name": "Thalaldis", "radius": 112, "orbitRadius": 1223, "orbitSpeed": 0.0317, "angle": -1.527, "flore": 29, "faune": 5,
          "moons": [
            { "name": "Lyrura", "radius": 39, "orbitRadius": 396, "orbitSpeed": 0.2974, "angle": 10.879, "flore": 18, "faune": 50 },
            { "name": "Eriulux", "radius": 55, "orbitRadius": 396, "orbitSpeed": 0.2974, "angle": 13.298, "flore": 6, "faune": 7 },
            { "name": "Zetalux", "radius": 29, "orbitRadius": 562, "orbitSpeed": 0.2876, "angle": 11.759, "flore": 40, "faune": 29 }
          ]
        }
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "David et Goliath",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    {
      "name": "Pyxirvyn", "radius": 216, "orbitRadius": 2216, "orbitSpeed": 0.0154, "angle": 0.4, "color": "#FF8C42",
      "planets": [
        { "name": "Coristis", "radius": 97, "orbitRadius": 606, "orbitSpeed": 0.0453, "angle": 3.731, "flore": 1, "faune": 61,
          "moons": [
            { "name": "Zanenlux", "radius": 45, "orbitRadius": 192, "orbitSpeed": 0.1994, "angle": 11.206, "flore": 1, "faune": 10 },
            { "name": "Velolux", "radius": 54, "orbitRadius": 192, "orbitSpeed": 0.1994, "angle": 13.44, "flore": 1, "faune": 25 },
            { "name": "Thalidon", "radius": 41, "orbitRadius": 254, "orbitSpeed": 0.2922, "angle": 14.579, "flore": 1, "faune": 20 }
          ]
        },
        { "name": "Sigeldon", "radius": 118, "orbitRadius": 1093, "orbitSpeed": 0.0366, "angle": 5.996, "flore": 1, "faune": 26,
          "moons": [
            { "name": "Zetizar", "radius": 25, "orbitRadius": 319, "orbitSpeed": 0.2202, "angle": 6.957, "flore": 1, "faune": 11 },
            { "name": "Erianxis", "radius": 38, "orbitRadius": 319, "orbitSpeed": 0.2202, "angle": 5.523, "flore": 1, "faune": 3 },
            { "name": "Ithamir", "radius": 32, "orbitRadius": 188, "orbitSpeed": 0.3252, "angle": 13.165, "flore": 1, "faune": 1 },
            { "name": "Synumlux", "radius": 21, "orbitRadius": 319, "orbitSpeed": 0.2202, "angle": 8.582, "flore": 1, "faune": 17 }
          ]
        },
        { "name": "Lyraxton", "radius": 89, "orbitRadius": 1668, "orbitSpeed": 0.0207, "angle": 3.761, "flore": 1, "faune": 26,
          "moons": [
            { "name": "Vorantis", "radius": 25, "orbitRadius": 133, "orbitSpeed": 0.3325, "angle": 13.92, "flore": 1, "faune": 19 },
            { "name": "Draenria", "radius": 28, "orbitRadius": 201, "orbitSpeed": 0.3169, "angle": 14.008, "flore": 1, "faune": 17 },
            { "name": "Aurara", "radius": 24, "orbitRadius": 201, "orbitSpeed": 0.3169, "angle": 15.949, "flore": 1, "faune": 11 },
            { "name": "Xorumbus", "radius": 43, "orbitRadius": 201, "orbitSpeed": 0.3169, "angle": 11.76, "flore": 1, "faune": 30 }
          ]
        },
        { "name": "Zetisnis", "radius": 96, "orbitRadius": 1093, "orbitSpeed": 0.0366, "angle": 3.98, "flore": 1, "faune": 28,
          "moons": [
            { "name": "Erielpha", "radius": 46, "orbitRadius": 216, "orbitSpeed": 0.2526, "angle": 11.431, "flore": 1, "faune": 16 },
            { "name": "Siganmir", "radius": 33, "orbitRadius": 216, "orbitSpeed": 0.2526, "angle": 14.116, "flore": 1, "faune": 27 }
          ]
        },
        { "name": "Auronton", "radius": 99, "orbitRadius": 1668, "orbitSpeed": 0.0207, "angle": 1.535, "flore": 1, "faune": 7,
          "moons": [
            { "name": "Corondis", "radius": 26, "orbitRadius": 275, "orbitSpeed": 0.1633, "angle": 9.284, "flore": 1, "faune": 18 },
            { "name": "Coristh", "radius": 30, "orbitRadius": 275, "orbitSpeed": 0.1633, "angle": 13.139, "flore": 1, "faune": 34 },
            { "name": "Celennis", "radius": 59, "orbitRadius": 275, "orbitSpeed": 0.1633, "angle": 3.793, "flore": 1, "faune": 30 }
          ]
        },
        { "name": "Pyxoria", "radius": 126, "orbitRadius": 1668, "orbitSpeed": 0.0207, "angle": 0.027, "flore": 1, "faune": 30,
          "moons": [
            { "name": "Zetirmir", "radius": 25, "orbitRadius": 445, "orbitSpeed": 0.2365, "angle": 18.431, "flore": 1, "faune": 34 },
            { "name": "Lyrenpha", "radius": 52, "orbitRadius": 312, "orbitSpeed": 0.2293, "angle": 17.824, "flore": 1, "faune": 17 },
            { "name": "Zetismir", "radius": 42, "orbitRadius": 312, "orbitSpeed": 0.2293, "angle": 13.577, "flore": 1, "faune": 11 },
            { "name": "Veluzar", "radius": 48, "orbitRadius": 445, "orbitSpeed": 0.2365, "angle": 16.54, "flore": 1, "faune": 14 }
          ]
        }
      ]
    },
    {
      "name": "Nebonbus", "radius": 199, "orbitRadius": 2216, "orbitSpeed": 0.0154, "angle": -2.204, "color": "#7CB9FF",
      "planets": [
        { "name": "Velozar", "radius": 96, "orbitRadius": 632, "orbitSpeed": 0.0537, "angle": 2.038, "flore": 500, "faune": 99,
          "moons": [
            { "name": "Synepha", "radius": 28, "orbitRadius": 233, "orbitSpeed": 0.205, "angle": 0.052, "flore": 226, "faune": 145 },
            { "name": "Corumzar", "radius": 32, "orbitRadius": 233, "orbitSpeed": 0.205, "angle": 2.029, "flore": 188, "faune": 141 },
            { "name": "Xoraxvyn", "radius": 20, "orbitRadius": 233, "orbitSpeed": 0.205, "angle": 4.158, "flore": 207, "faune": 78 }
          ]
        }
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Trois Royaumes",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    {
      "name": "Auraxtis", "radius": 234, "orbitRadius": 896, "orbitSpeed": 0.0209, "angle": 0.175, "color": "#FF8C42",
      "planets": [
        { "name": "Zetendon", "radius": 79, "orbitRadius": 454, "orbitSpeed": 0.0441, "angle": 1.042, "flore": 318, "faune": 176, "moons": [] }
      ]
    },
    {
      "name": "Synonra", "radius": 183, "orbitRadius": 1594, "orbitSpeed": 0.0146, "angle": -2.303, "color": "#FFB830",
      "planets": [
        { "name": "Ithupha", "radius": 87, "orbitRadius": 323, "orbitSpeed": 0.0702, "angle": 1.086, "flore": 25, "faune": 85, "moons": [] },
        { "name": "Velirton", "radius": 129, "orbitRadius": 484, "orbitSpeed": 0.0603, "angle": 4.205, "flore": 70, "faune": 82,
          "moons": [
            { "name": "Zanumton", "radius": 44, "orbitRadius": 210, "orbitSpeed": 0.1783, "angle": 2.054, "flore": 45, "faune": 21 },
            { "name": "Zeteton", "radius": 22, "orbitRadius": 210, "orbitSpeed": 0.1783, "angle": 5.965, "flore": 46, "faune": 9 }
          ]
        }
      ]
    },
    {
      "name": "Xorarria", "radius": 162, "orbitRadius": 2750, "orbitSpeed": 0.0101, "angle": -0.008, "color": "#FF6B6B",
      "planets": [
        { "name": "Corarra", "radius": 107, "orbitRadius": 495, "orbitSpeed": 0.0514, "angle": -0.49, "flore": 49, "faune": 21,
          "moons": [
            { "name": "Palatis", "radius": 30, "orbitRadius": 181, "orbitSpeed": 0.1852, "angle": 0.108, "flore": 20, "faune": 18 },
            { "name": "Zetosria", "radius": 33, "orbitRadius": 181, "orbitSpeed": 0.1852, "angle": 1.577, "flore": 6, "faune": 8 }
          ]
        },
        { "name": "Synitis", "radius": 75, "orbitRadius": 495, "orbitSpeed": 0.0514, "angle": 3.411, "flore": 5, "faune": 87,
          "moons": [
            { "name": "Lyrevyn", "radius": 52, "orbitRadius": 197, "orbitSpeed": 0.2333, "angle": 1.428, "flore": 22, "faune": 11 }
          ]
        },
        { "name": "Lyralton", "radius": 77, "orbitRadius": 495, "orbitSpeed": 0.0514, "angle": 1.705, "flore": 5, "faune": 37,
          "moons": [
            { "name": "Pyxaldis", "radius": 36, "orbitRadius": 168, "orbitSpeed": 0.233, "angle": 0.105, "flore": 11, "faune": 9 }
          ]
        }
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Avant-Poste",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    {
      "name": "Zanispha", "radius": 201, "orbitRadius": 1838, "orbitSpeed": 0.0139, "angle": 0.624, "color": "#FF6B6B",
      "planets": [
        { "name": "Omiumdon", "radius": 83, "orbitRadius": 519, "orbitSpeed": 0.0429, "angle": -0.346, "flore": 0, "faune": 44,
          "moons": [
            { "name": "Palennis", "radius": 47, "orbitRadius": 195, "orbitSpeed": 0.3486, "angle": 13.282, "flore": 3, "faune": 9 },
            { "name": "Thalalra", "radius": 49, "orbitRadius": 195, "orbitSpeed": 0.3486, "angle": 10.302, "flore": 23, "faune": 24 }
          ]
        },
        { "name": "Corarth", "radius": 105, "orbitRadius": 1150, "orbitSpeed": 0.0274, "angle": 3.38, "flore": 61, "faune": 8,
          "moons": [
            { "name": "Aurarpha", "radius": 53, "orbitRadius": 283, "orbitSpeed": 0.2453, "angle": 7.433, "flore": 11, "faune": 0 },
            { "name": "Sigirlux", "radius": 26, "orbitRadius": 283, "orbitSpeed": 0.2453, "angle": 10.037, "flore": 30, "faune": 19 },
            { "name": "Ithadis", "radius": 44, "orbitRadius": 483, "orbitSpeed": 0.2643, "angle": 11.321, "flore": 24, "faune": 34 }
          ]
        }
      ]
    },
    {
      "name": "Eriera", "radius": 221, "orbitRadius": 1838, "orbitSpeed": 0.0139, "angle": 3.725, "color": "#FFB830",
      "planets": [
        { "name": "Vorellux", "radius": 129, "orbitRadius": 564, "orbitSpeed": 0.0445, "angle": 1.117, "flore": 17, "faune": 68,
          "moons": [
            { "name": "Sigelzar", "radius": 31, "orbitRadius": 243, "orbitSpeed": 0.3198, "angle": 7.655, "flore": 10, "faune": 18 },
            { "name": "Thaloxis", "radius": 48, "orbitRadius": 243, "orbitSpeed": 0.3198, "angle": 9.824, "flore": 14, "faune": 27 }
          ]
        },
        { "name": "Zanondis", "radius": 104, "orbitRadius": 1142, "orbitSpeed": 0.0284, "angle": -0.759, "flore": 13, "faune": 7,
          "moons": [
            { "name": "Sigarvyn", "radius": 21, "orbitRadius": 394, "orbitSpeed": 0.3444, "angle": 8.176, "flore": 13, "faune": 5 },
            { "name": "Pyxelnis", "radius": 55, "orbitRadius": 394, "orbitSpeed": 0.3444, "angle": 6.026, "flore": 14, "faune": 12 },
            { "name": "Xoruton", "radius": 41, "orbitRadius": 275, "orbitSpeed": 0.2538, "angle": 8.049, "flore": 1, "faune": 12 }
          ]
        }
      ]
    },
    {
      "name": "Celanlux", "radius": 169, "orbitRadius": 3217, "orbitSpeed": 0.0106, "angle": -0.792, "color": "#FFB830",
      "planets": [
        { "name": "Palumnis", "radius": 77, "orbitRadius": 699, "orbitSpeed": 0.0369, "angle": 0.297, "flore": 215, "faune": 61,
          "moons": [
            { "name": "Omionvyn", "radius": 47, "orbitRadius": 233, "orbitSpeed": 0.1559, "angle": 1.675, "flore": 92, "faune": 66 }
          ]
        }
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Étoile du Berger",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    {
      "name": "Draenria", "radius": 214, "orbitRadius": 2399, "orbitSpeed": 0.0113, "angle": 0.65, "color": "#FF8C42",
      "planets": [
        { "name": "Celanria", "radius": 122, "orbitRadius": 436, "orbitSpeed": 0.0568, "angle": 1.343, "flore": 87, "faune": 81, "moons": [] },
        { "name": "Voralmir", "radius": 94, "orbitRadius": 714, "orbitSpeed": 0.0475, "angle": -0.192, "flore": 68, "faune": 20,
          "moons": [
            { "name": "Zetentis", "radius": 20, "orbitRadius": 216, "orbitSpeed": 0.3141, "angle": 10.928, "flore": 9, "faune": 43 }
          ]
        },
        { "name": "Omiadon", "radius": 78, "orbitRadius": 951, "orbitSpeed": 0.0465, "angle": 4.004, "flore": 29, "faune": 20,
          "moons": [
            { "name": "Palirbus", "radius": 49, "orbitRadius": 173, "orbitSpeed": 0.3296, "angle": 9.924, "flore": 24, "faune": 33 },
            { "name": "Nebavyn", "radius": 49, "orbitRadius": 173, "orbitSpeed": 0.3296, "angle": 11.685, "flore": 42, "faune": 28 },
            { "name": "Vorebus", "radius": 39, "orbitRadius": 308, "orbitSpeed": 0.1627, "angle": 6.876, "flore": 19, "faune": 9 }
          ]
        }
      ]
    },
    {
      "name": "Zananlux", "radius": 166, "orbitRadius": 2399, "orbitSpeed": 0.0113, "angle": 2.782, "color": "#FFE44D",
      "planets": [
        { "name": "Sigiria", "radius": 106, "orbitRadius": 564, "orbitSpeed": 0.0622, "angle": 1.895, "flore": 37, "faune": 30,
          "moons": [
            { "name": "Zetiszar", "radius": 46, "orbitRadius": 251, "orbitSpeed": 0.2558, "angle": 7.416, "flore": 17, "faune": 44 }
          ]
        },
        { "name": "Coripha", "radius": 117, "orbitRadius": 919, "orbitSpeed": 0.0408, "angle": 0.021, "flore": 94, "faune": 14,
          "moons": [
            { "name": "Lyrelria", "radius": 55, "orbitRadius": 224, "orbitSpeed": 0.2308, "angle": 8.22, "flore": 18, "faune": 60 }
          ]
        },
        { "name": "Voreldon", "radius": 81, "orbitRadius": 318, "orbitSpeed": 0.0814, "angle": 3.665, "flore": 71, "faune": 90, "moons": [] }
      ]
    },
    {
      "name": "Coreltis", "radius": 242, "orbitRadius": 1199, "orbitSpeed": 0.0191, "angle": -1.36, "color": "#7CB9FF",
      "planets": [
        { "name": "Omialria", "radius": 96, "orbitRadius": 464, "orbitSpeed": 0.0686, "angle": 3.269, "flore": 75, "faune": 18,
          "moons": [
            { "name": "Palalxis", "radius": 22, "orbitRadius": 174, "orbitSpeed": 0.3051, "angle": 11.845, "flore": 14, "faune": 31 },
            { "name": "Pyxenzar", "radius": 53, "orbitRadius": 174, "orbitSpeed": 0.3051, "angle": 9.542, "flore": 27, "faune": 27 }
          ]
        },
        { "name": "Velonis", "radius": 94, "orbitRadius": 464, "orbitSpeed": 0.0686, "angle": 5.409, "flore": 31, "faune": 56,
          "moons": [
            { "name": "Sigaxria", "radius": 32, "orbitRadius": 175, "orbitSpeed": 0.2668, "angle": 5.247, "flore": 11, "faune": 21 }
          ]
        },
        { "name": "Thalosxis", "radius": 127, "orbitRadius": 864, "orbitSpeed": 0.0342, "angle": 3.734, "flore": 58, "faune": 54,
          "moons": [
            { "name": "Celirvyn", "radius": 20, "orbitRadius": 220, "orbitSpeed": 0.2425, "angle": 4.952, "flore": 25, "faune": 16 },
            { "name": "Voraxth", "radius": 41, "orbitRadius": 220, "orbitSpeed": 0.2425, "angle": 9.496, "flore": 25, "faune": 30 }
          ]
        }
      ]
    },
    {
      "name": "Paloria", "radius": 202, "orbitRadius": 3362, "orbitSpeed": 0.0109, "angle": -0.575, "color": "#FF6B6B",
      "planets": [
        { "name": "Voruth", "radius": 89, "orbitRadius": 457, "orbitSpeed": 0.0458, "angle": 1.106, "flore": 144, "faune": 28,
          "moons": [
            { "name": "Ithonmir", "radius": 26, "orbitRadius": 209, "orbitSpeed": 0.1523, "angle": 3.085, "flore": 35, "faune": 39 },
            { "name": "Zetenzar", "radius": 34, "orbitRadius": 209, "orbitSpeed": 0.1523, "angle": 1.284, "flore": 49, "faune": 55 }
          ]
        },
        { "name": "Draeldon", "radius": 123, "orbitRadius": 457, "orbitSpeed": 0.0458, "angle": -1.003, "flore": 97, "faune": 93, "moons": [] }
      ]
    },
    {
      "name": "Zanarth", "radius": 188, "orbitRadius": 3362, "orbitSpeed": 0.0109, "angle": -2.279, "color": "#7CB9FF",
      "planets": [
        { "name": "Synudon", "radius": 129, "orbitRadius": 517, "orbitSpeed": 0.0666, "angle": -1.074, "flore": 80, "faune": 40,
          "moons": [
            { "name": "Zanirdis", "radius": 38, "orbitRadius": 232, "orbitSpeed": 0.1999, "angle": -2.348, "flore": 49, "faune": 5 },
            { "name": "Lyrisbus", "radius": 39, "orbitRadius": 232, "orbitSpeed": 0.1999, "angle": 0.617, "flore": 41, "faune": 21 }
          ]
        },
        { "name": "Kryidon", "radius": 117, "orbitRadius": 1004, "orbitSpeed": 0.0289, "angle": 2.6, "flore": 12, "faune": 41,
          "moons": [
            { "name": "Omionbus", "radius": 31, "orbitRadius": 235, "orbitSpeed": 0.2411, "angle": -1.086, "flore": 14, "faune": 34 },
            { "name": "Vorondis", "radius": 36, "orbitRadius": 340, "orbitSpeed": 0.3437, "angle": 1.176, "flore": 1, "faune": 32 },
            { "name": "Corandon", "radius": 35, "orbitRadius": 340, "orbitSpeed": 0.3437, "angle": 3.741, "flore": 43, "faune": 43 }
          ]
        }
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Sigexis-Ithidon",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    { "name": "Velelra", "radius": 182, "orbitRadius": 1281, "orbitSpeed": 0.0153, "angle": 3.752, "color": "#7CB9FF",
      "planets": [
        { "name": "Lyrirnis", "radius": 94, "orbitRadius": 463, "orbitSpeed": 0.0668, "angle": 22.192, "flore": 71, "faune": 61, "moons": [
            { "name": "Corosra", "radius": 57, "orbitRadius": 221, "orbitSpeed": 0.2832, "angle": 74.266, "flore": 44, "faune": 42 },
            { "name": "Omiinis", "radius": 59, "orbitRadius": 221, "orbitSpeed": 0.2832, "angle": 71.313, "flore": 21, "faune": 16 }
        ]},
        { "name": "Eriismir", "radius": 109, "orbitRadius": 740, "orbitSpeed": 0.0546, "angle": 16.702, "flore": 104, "faune": 26, "moons": [
            { "name": "Aurilux", "radius": 25, "orbitRadius": 211, "orbitSpeed": 0.3161, "angle": 88.669, "flore": 3, "faune": 44 },
            { "name": "Kryosth", "radius": 22, "orbitRadius": 211, "orbitSpeed": 0.3161, "angle": 90.322, "flore": 12, "faune": 31 },
            { "name": "Sigaxth", "radius": 37, "orbitRadius": 311, "orbitSpeed": 0.25, "angle": 68.466, "flore": 3, "faune": 35 }
        ]},
        { "name": "Nebelpha", "radius": 128, "orbitRadius": 463, "orbitSpeed": 0.0668, "angle": 18.331, "flore": 45, "faune": 43, "moons": [
            { "name": "Vorosmus", "radius": 32, "orbitRadius": 197, "orbitSpeed": 0.1808, "angle": 47.484, "flore": 21, "faune": 29 },
            { "name": "Auroston", "radius": 46, "orbitRadius": 197, "orbitSpeed": 0.1808, "angle": 46.195, "flore": 22, "faune": 31 }
        ]}
      ]
    },
    { "name": "Auraxpha", "radius": 170, "orbitRadius": 1281, "orbitSpeed": 0.0153, "angle": 1.509, "color": "#FFB830",
      "planets": [
        { "name": "Celenra", "radius": 117, "orbitRadius": 490, "orbitSpeed": 0.0674, "angle": 16.452, "flore": 99, "faune": 6, "moons": [
            { "name": "Aurovyn", "radius": 20, "orbitRadius": 223, "orbitSpeed": 0.2791, "angle": 64.926, "flore": 23, "faune": 34 },
            { "name": "Celadis", "radius": 44, "orbitRadius": 180, "orbitSpeed": 0.2044, "angle": 48.81, "flore": 32, "faune": 60 },
            { "name": "Pyxirnis", "radius": 57, "orbitRadius": 223, "orbitSpeed": 0.2791, "angle": 68.035, "flore": 48, "faune": 15 }
        ]},
        { "name": "Aurara", "radius": 104, "orbitRadius": 781, "orbitSpeed": 0.033, "angle": 10.691, "flore": 69, "faune": 21, "moons": [
            { "name": "Velirpha", "radius": 45, "orbitRadius": 197, "orbitSpeed": 0.1571, "angle": 34.685, "flore": 40, "faune": 28 },
            { "name": "Celonth", "radius": 54, "orbitRadius": 366, "orbitSpeed": 0.2709, "angle": 60.767, "flore": 44, "faune": 8 },
            { "name": "Zetalmir", "radius": 60, "orbitRadius": 366, "orbitSpeed": 0.2709, "angle": 64.927, "flore": 43, "faune": 37 },
            { "name": "Vorupha", "radius": 45, "orbitRadius": 197, "orbitSpeed": 0.1571, "angle": 37.12, "flore": 22, "faune": 53 }
        ]},
        { "name": "Corisria", "radius": 97, "orbitRadius": 781, "orbitSpeed": 0.033, "angle": 6.986, "flore": 12, "faune": 10, "moons": [
            { "name": "Omianlux", "radius": 22, "orbitRadius": 187, "orbitSpeed": 0.324, "angle": 80.277, "flore": 31, "faune": 1 },
            { "name": "Auraxlux", "radius": 57, "orbitRadius": 187, "orbitSpeed": 0.324, "angle": 75.506, "flore": 6, "faune": 40 },
            { "name": "Zetalria", "radius": 49, "orbitRadius": 337, "orbitSpeed": 0.3497, "angle": 84.362, "flore": 0, "faune": 46 }
        ]}
      ]
    },
    { "name": "Drairbus", "radius": 190, "orbitRadius": 3551, "orbitSpeed": 0.0076, "angle": 0.44, "color": "#FF8C42",
      "planets": [
        { "name": "Zanebus", "radius": 80, "orbitRadius": 493, "orbitSpeed": 0.0449, "angle": 9.832, "flore": 19, "faune": 10, "moons": [
            { "name": "Paluria", "radius": 41, "orbitRadius": 178, "orbitSpeed": 0.1577, "angle": 17.509, "flore": 32, "faune": 11 },
            { "name": "Zanaxra", "radius": 23, "orbitRadius": 178, "orbitSpeed": 0.1577, "angle": 19.66, "flore": 44, "faune": 8 },
            { "name": "Eriaxbus", "radius": 37, "orbitRadius": 178, "orbitSpeed": 0.1577, "angle": 22.151, "flore": 20, "faune": 40 }
        ]},
        { "name": "Zanizar", "radius": 110, "orbitRadius": 851, "orbitSpeed": 0.0476, "angle": 4.535, "flore": 36, "faune": 40, "moons": [
            { "name": "Velallux", "radius": 60, "orbitRadius": 232, "orbitSpeed": 0.2749, "angle": 32.229, "flore": 17, "faune": 42 },
            { "name": "Omiomus", "radius": 39, "orbitRadius": 232, "orbitSpeed": 0.2749, "angle": 31.275, "flore": 40, "faune": 21 },
            { "name": "Kryosdis", "radius": 31, "orbitRadius": 232, "orbitSpeed": 0.2749, "angle": 36.613, "flore": 2, "faune": 30 }
        ]},
        { "name": "Eriaxton", "radius": 118, "orbitRadius": 493, "orbitSpeed": 0.0449, "angle": 5.915, "flore": 36, "faune": 59, "moons": [
            { "name": "Lyrisra", "radius": 51, "orbitRadius": 173, "orbitSpeed": 0.1859, "angle": 25.849, "flore": 11, "faune": 27 },
            { "name": "Thalismir", "radius": 58, "orbitRadius": 273, "orbitSpeed": 0.3395, "angle": 42.998, "flore": 10, "faune": 23 }
        ]},
        { "name": "Thalarton", "radius": 106, "orbitRadius": 851, "orbitSpeed": 0.0476, "angle": 7.34, "flore": 83, "faune": 45, "moons": [
            { "name": "Eriontis", "radius": 20, "orbitRadius": 201, "orbitSpeed": 0.2265, "angle": 30.757, "flore": 11, "faune": 26 },
            { "name": "Nebandis", "radius": 50, "orbitRadius": 201, "orbitSpeed": 0.2265, "angle": 35.178, "flore": 34, "faune": 40 }
        ]}
      ]
    },
    { "name": "Thalonpha", "radius": 163, "orbitRadius": 3551, "orbitSpeed": 0.0076, "angle": -0.736, "color": "#FF8C42",
      "planets": [
        { "name": "Lyrobus", "radius": 105, "orbitRadius": 384, "orbitSpeed": 0.0615, "angle": 5.867, "flore": 391, "faune": 64, "moons": [
            { "name": "Ithoxis", "radius": 38, "orbitRadius": 190, "orbitSpeed": 0.2823, "angle": 27.7, "flore": 500, "faune": 295 }
        ]}
      ]
    },
    { "name": "Xorenton", "radius": 205, "orbitRadius": 3551, "orbitSpeed": 0.0076, "angle": -2.301, "color": "#FF6B6B",
      "planets": [
        { "name": "Xorelra", "radius": 93, "orbitRadius": 378, "orbitSpeed": 0.069, "angle": 6.339, "flore": 1, "faune": 31, "moons": [] },
        { "name": "Kryarbus", "radius": 77, "orbitRadius": 676, "orbitSpeed": 0.0518, "angle": 4.118, "flore": 2, "faune": 23, "moons": [
            { "name": "Draenvyn", "radius": 31, "orbitRadius": 240, "orbitSpeed": 0.2583, "angle": 21.777, "flore": 3, "faune": 26 },
            { "name": "Coranmus", "radius": 23, "orbitRadius": 240, "orbitSpeed": 0.2583, "angle": 18.376, "flore": 1, "faune": 15 },
            { "name": "Synonvyn", "radius": 36, "orbitRadius": 240, "orbitSpeed": 0.2583, "angle": 22.798, "flore": 4, "faune": 21 },
            { "name": "Eriisdis", "radius": 45, "orbitRadius": 159, "orbitSpeed": 0.2776, "angle": 21.207, "flore": 8, "faune": 10 }
        ]},
        { "name": "Zetalmus", "radius": 110, "orbitRadius": 676, "orbitSpeed": 0.0518, "angle": 1.807, "flore": 12, "faune": 23, "moons": [
            { "name": "Nebaldon", "radius": 24, "orbitRadius": 230, "orbitSpeed": 0.316, "angle": 22.521, "flore": 2, "faune": 7 },
            { "name": "Zetoth", "radius": 51, "orbitRadius": 230, "orbitSpeed": 0.316, "angle": 19.937, "flore": 7, "faune": 10 },
            { "name": "Sigumth", "radius": 57, "orbitRadius": 230, "orbitSpeed": 0.316, "angle": 24.361, "flore": 3, "faune": 17 }
        ]},
        { "name": "Nebisth", "radius": 96, "orbitRadius": 676, "orbitSpeed": 0.0518, "angle": 6.371, "flore": 19, "faune": 44, "moons": [
            { "name": "Sigarra", "radius": 33, "orbitRadius": 158, "orbitSpeed": 0.271, "angle": 20.773, "flore": 3, "faune": 23 },
            { "name": "Eriumria", "radius": 37, "orbitRadius": 265, "orbitSpeed": 0.1619, "angle": 10.886, "flore": 5, "faune": 24 },
            { "name": "Palalth", "radius": 20, "orbitRadius": 265, "orbitSpeed": 0.1619, "angle": 15.68, "flore": 5, "faune": 18 },
            { "name": "Celirdis", "radius": 40, "orbitRadius": 265, "orbitSpeed": 0.1619, "angle": 13.618, "flore": 6, "faune": 24 }
        ]},
        { "name": "Zanopha", "radius": 102, "orbitRadius": 1257, "orbitSpeed": 0.0274, "angle": -1.364, "flore": 3, "faune": 18, "moons": [
            { "name": "Sigonria", "radius": 50, "orbitRadius": 247, "orbitSpeed": 0.2283, "angle": 16.833, "flore": 6, "faune": 13 },
            { "name": "Eriazar", "radius": 59, "orbitRadius": 247, "orbitSpeed": 0.2283, "angle": 11.978, "flore": 9, "faune": 24 }
        ]},
        { "name": "Xoramir", "radius": 95, "orbitRadius": 1257, "orbitSpeed": 0.0274, "angle": 1.611, "flore": 16, "faune": 28, "moons": [
            { "name": "Nebalzar", "radius": 37, "orbitRadius": 236, "orbitSpeed": 0.2996, "angle": 18.921, "flore": 5, "faune": 23 }
        ]}
      ]
    },
    { "name": "Aurimus", "radius": 222, "orbitRadius": 3551, "orbitSpeed": 0.0076, "angle": 2.397, "color": "#FF8C42",
      "planets": [
        { "name": "Vorisnis", "radius": 98, "orbitRadius": 651, "orbitSpeed": 0.043, "angle": -0.288, "flore": 1, "faune": 30, "moons": [
            { "name": "Lyralth", "radius": 32, "orbitRadius": 199, "orbitSpeed": 0.1843, "angle": 1.75, "flore": 13, "faune": 49 },
            { "name": "Aurarmus", "radius": 20, "orbitRadius": 199, "orbitSpeed": 0.1843, "angle": 3.263, "flore": 24, "faune": 23 },
            { "name": "Aurirria", "radius": 29, "orbitRadius": 199, "orbitSpeed": 0.1843, "angle": 4.617, "flore": 13, "faune": 0 }
        ]},
        { "name": "Pyxanton", "radius": 70, "orbitRadius": 941, "orbitSpeed": 0.0332, "angle": 1.081, "flore": 94, "faune": 17, "moons": [
            { "name": "Kryaxria", "radius": 43, "orbitRadius": 196, "orbitSpeed": 0.3296, "angle": 11.39, "flore": 47, "faune": 32 },
            { "name": "Lyrumria", "radius": 31, "orbitRadius": 196, "orbitSpeed": 0.3296, "angle": 7.104, "flore": 2, "faune": 32 }
        ]},
        { "name": "Omiebus", "radius": 102, "orbitRadius": 651, "orbitSpeed": 0.043, "angle": 3.923, "flore": 8, "faune": 27, "moons": [
            { "name": "Eriisdon", "radius": 39, "orbitRadius": 217, "orbitSpeed": 0.2727, "angle": 2.533, "flore": 42, "faune": 13 },
            { "name": "Sigaltis", "radius": 54, "orbitRadius": 217, "orbitSpeed": 0.2727, "angle": 0.64, "flore": 25, "faune": 6 },
            { "name": "Palannis", "radius": 30, "orbitRadius": 330, "orbitSpeed": 0.2862, "angle": 5.206, "flore": 49, "faune": 53 },
            { "name": "Zetarmus", "radius": 50, "orbitRadius": 330, "orbitSpeed": 0.2862, "angle": 3.868, "flore": 41, "faune": 22 }
        ]},
        { "name": "Omieldon", "radius": 114, "orbitRadius": 941, "orbitSpeed": 0.0332, "angle": 2.164, "flore": 37, "faune": 64, "moons": [
            { "name": "Draarbus", "radius": 20, "orbitRadius": 217, "orbitSpeed": 0.304, "angle": 7.725, "flore": 35, "faune": 54 }
        ]}
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Aurirdon-Synaxra",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    { "name": "Corirtis", "radius": 155, "orbitRadius": 1517, "orbitSpeed": 0.017, "angle": 2.414, "color": "#FFB830",
      "planets": [
        { "name": "Omiunis", "radius": 108, "orbitRadius": 486, "orbitSpeed": 0.0575, "angle": 12.198, "flore": 56, "faune": 85, "moons": [
            { "name": "Draosth", "radius": 40, "orbitRadius": 194, "orbitSpeed": 0.2489, "angle": 31.43, "flore": 19, "faune": 42 },
            { "name": "Nebaxlux", "radius": 29, "orbitRadius": 194, "orbitSpeed": 0.2489, "angle": 35.733, "flore": 5, "faune": 5 }
        ]},
        { "name": "Draonra", "radius": 90, "orbitRadius": 947, "orbitSpeed": 0.0325, "angle": 8.393, "flore": 42, "faune": 26, "moons": [
            { "name": "Aurisbus", "radius": 58, "orbitRadius": 177, "orbitSpeed": 0.279, "angle": 37.411, "flore": 16, "faune": 37 },
            { "name": "Lyroria", "radius": 60, "orbitRadius": 177, "orbitSpeed": 0.279, "angle": 35.981, "flore": 24, "faune": 5 }
        ]},
        { "name": "Corostis", "radius": 97, "orbitRadius": 947, "orbitSpeed": 0.0325, "angle": 4.433, "flore": 21, "faune": 33, "moons": [
            { "name": "Thalarlux", "radius": 24, "orbitRadius": 167, "orbitSpeed": 0.3131, "angle": 44.916, "flore": 21, "faune": 15 },
            { "name": "Ithomir", "radius": 33, "orbitRadius": 241, "orbitSpeed": 0.3084, "angle": 43.868, "flore": 29, "faune": 41 },
            { "name": "Lyrelra", "radius": 32, "orbitRadius": 167, "orbitSpeed": 0.3131, "angle": 47.134, "flore": 20, "faune": 50 }
        ]},
        { "name": "Zetondis", "radius": 95, "orbitRadius": 947, "orbitSpeed": 0.0325, "angle": 3.179, "flore": 48, "faune": 67, "moons": [
            { "name": "Synostis", "radius": 60, "orbitRadius": 283, "orbitSpeed": 0.2493, "angle": 35.091, "flore": 10, "faune": 8 },
            { "name": "Celepha", "radius": 54, "orbitRadius": 283, "orbitSpeed": 0.2493, "angle": 37.239, "flore": 8, "faune": 19 },
            { "name": "Omiisxis", "radius": 36, "orbitRadius": 159, "orbitSpeed": 0.1806, "angle": 28.137, "flore": 1, "faune": 32 }
        ]},
        { "name": "Coraxmir", "radius": 90, "orbitRadius": 486, "orbitSpeed": 0.0575, "angle": 7.893, "flore": 24, "faune": 72, "moons": [
            { "name": "Eriimus", "radius": 27, "orbitRadius": 204, "orbitSpeed": 0.2292, "angle": 37.916, "flore": 6, "faune": 33 },
            { "name": "Ithalmir", "radius": 54, "orbitRadius": 204, "orbitSpeed": 0.2292, "angle": 34.389, "flore": 5, "faune": 11 }
        ]}
      ]
    },
    { "name": "Lyrenmir", "radius": 215, "orbitRadius": 4208, "orbitSpeed": 0.0075, "angle": 1.027, "color": "#FF8C42",
      "planets": [
        { "name": "Thalisdis", "radius": 122, "orbitRadius": 508, "orbitSpeed": 0.0417, "angle": 2.677, "flore": 57, "faune": 93, "moons": [
            { "name": "Pyxarbus", "radius": 59, "orbitRadius": 244, "orbitSpeed": 0.3424, "angle": 40.542, "flore": 57, "faune": 59 },
            { "name": "Vorosdon", "radius": 53, "orbitRadius": 244, "orbitSpeed": 0.3424, "angle": 36.429, "flore": 17, "faune": 60 }
        ]},
        { "name": "Celaxtis", "radius": 113, "orbitRadius": 864, "orbitSpeed": 0.0408, "angle": 4.001, "flore": 76, "faune": 88, "moons": [
            { "name": "Omiarbus", "radius": 50, "orbitRadius": 198, "orbitSpeed": 0.2473, "angle": 26.53, "flore": 12, "faune": 32 },
            { "name": "Corodis", "radius": 40, "orbitRadius": 198, "orbitSpeed": 0.2473, "angle": 25.078, "flore": 15, "faune": 54 },
            { "name": "Eriumth", "radius": 36, "orbitRadius": 299, "orbitSpeed": 0.2463, "angle": 25.234, "flore": 48, "faune": 11 },
            { "name": "Nebanis", "radius": 50, "orbitRadius": 299, "orbitSpeed": 0.2463, "angle": 29.099, "flore": 5, "faune": 6 }
        ]},
        { "name": "Kryelton", "radius": 76, "orbitRadius": 864, "orbitSpeed": 0.0408, "angle": 6.197, "flore": 92, "faune": 14, "moons": [
            { "name": "Lyraxth", "radius": 20, "orbitRadius": 194, "orbitSpeed": 0.2079, "angle": 27.195, "flore": 4, "faune": 23 },
            { "name": "Zanuton", "radius": 26, "orbitRadius": 194, "orbitSpeed": 0.2079, "angle": 23.578, "flore": 1, "faune": 52 },
            { "name": "Thalisbus", "radius": 44, "orbitRadius": 194, "orbitSpeed": 0.2079, "angle": 25.25, "flore": 44, "faune": 57 }
        ]}
      ]
    },
    { "name": "Draonth", "radius": 243, "orbitRadius": 4208, "orbitSpeed": 0.0075, "angle": -1.521, "color": "#FFE44D",
      "planets": [
        { "name": "Ithiszar", "radius": 124, "orbitRadius": 689, "orbitSpeed": 0.0406, "angle": 3.428, "flore": 62, "faune": 38, "moons": [
            { "name": "Draadis", "radius": 32, "orbitRadius": 180, "orbitSpeed": 0.2849, "angle": 22.073, "flore": 39, "faune": 5 },
            { "name": "Eriumdis", "radius": 27, "orbitRadius": 180, "orbitSpeed": 0.2849, "angle": 26.197, "flore": 30, "faune": 42 }
        ]},
        { "name": "Synisdis", "radius": 82, "orbitRadius": 1097, "orbitSpeed": 0.0397, "angle": 3.326, "flore": 38, "faune": 83, "moons": [
            { "name": "Xoristis", "radius": 28, "orbitRadius": 220, "orbitSpeed": 0.3194, "angle": 24.924, "flore": 10, "faune": 49 },
            { "name": "Zanirth", "radius": 29, "orbitRadius": 220, "orbitSpeed": 0.3194, "angle": 25.863, "flore": 17, "faune": 27 },
            { "name": "Corirbus", "radius": 36, "orbitRadius": 220, "orbitSpeed": 0.3194, "angle": 27.545, "flore": 5, "faune": 10 }
        ]},
        { "name": "Xoranlux", "radius": 85, "orbitRadius": 1097, "orbitSpeed": 0.0397, "angle": 1.771, "flore": 39, "faune": 26, "moons": [
            { "name": "Vorummir", "radius": 56, "orbitRadius": 402, "orbitSpeed": 0.214, "angle": 18.912, "flore": 15, "faune": 40 },
            { "name": "Vororia", "radius": 37, "orbitRadius": 402, "orbitSpeed": 0.214, "angle": 14.213, "flore": 12, "faune": 6 },
            { "name": "Zetitis", "radius": 38, "orbitRadius": 237, "orbitSpeed": 0.2897, "angle": 22.768, "flore": 28, "faune": 22 },
            { "name": "Sigarth", "radius": 25, "orbitRadius": 237, "orbitSpeed": 0.2897, "angle": 24.832, "flore": 8, "faune": 16 }
        ]},
        { "name": "Siganpha", "radius": 123, "orbitRadius": 1599, "orbitSpeed": 0.0309, "angle": 5.828, "flore": 33, "faune": 28, "moons": [
            { "name": "Sigenbus", "radius": 44, "orbitRadius": 203, "orbitSpeed": 0.307, "angle": 21.508, "flore": 38, "faune": 57 },
            { "name": "Pyxuxis", "radius": 24, "orbitRadius": 383, "orbitSpeed": 0.2545, "angle": 18.805, "flore": 46, "faune": 56 }
        ]},
        { "name": "Nebenria", "radius": 79, "orbitRadius": 1097, "orbitSpeed": 0.0397, "angle": 5.594, "flore": 35, "faune": 95, "moons": [
            { "name": "Ithovyn", "radius": 43, "orbitRadius": 294, "orbitSpeed": 0.3108, "angle": 18.381, "flore": 24, "faune": 11 }
        ]}
      ]
    },
    { "name": "Coruth", "radius": 152, "orbitRadius": 4208, "orbitSpeed": 0.0075, "angle": 3.322, "color": "#FF8C42",
      "planets": [
        { "name": "Palumria", "radius": 89, "orbitRadius": 402, "orbitSpeed": 0.0668, "angle": 1.927, "flore": 86, "faune": 62, "moons": [
            { "name": "Auraxth", "radius": 58, "orbitRadius": 174, "orbitSpeed": 0.2386, "angle": 5.193, "flore": 47, "faune": 29 },
            { "name": "Ithisdis", "radius": 23, "orbitRadius": 174, "orbitSpeed": 0.2386, "angle": 7.608, "flore": 44, "faune": 24 }
        ]},
        { "name": "Thalaxdis", "radius": 90, "orbitRadius": 942, "orbitSpeed": 0.0316, "angle": 0.29, "flore": 85, "faune": 40, "moons": [
            { "name": "Velantis", "radius": 41, "orbitRadius": 194, "orbitSpeed": 0.2861, "angle": 6.726, "flore": 19, "faune": 13 }
        ]},
        { "name": "Palosbus", "radius": 116, "orbitRadius": 942, "orbitSpeed": 0.0316, "angle": -0.993, "flore": 6, "faune": 51, "moons": [
            { "name": "Siganxis", "radius": 53, "orbitRadius": 296, "orbitSpeed": 0.3475, "angle": 10.687, "flore": 22, "faune": 80 },
            { "name": "Pyxetis", "radius": 31, "orbitRadius": 296, "orbitSpeed": 0.3475, "angle": 14.696, "flore": 9, "faune": 78 },
            { "name": "Zanibus", "radius": 36, "orbitRadius": 489, "orbitSpeed": 0.3119, "angle": 12.363, "flore": 25, "faune": 27 }
        ]},
        { "name": "Lyrirmir", "radius": 120, "orbitRadius": 942, "orbitSpeed": 0.0316, "angle": 3.654, "flore": 15, "faune": 33, "moons": [
            { "name": "Draisra", "radius": 34, "orbitRadius": 292, "orbitSpeed": 0.3459, "angle": 11.143, "flore": 36, "faune": 36 },
            { "name": "Synendis", "radius": 57, "orbitRadius": 251, "orbitSpeed": 0.3343, "angle": 12.117, "flore": 9, "faune": 4 },
            { "name": "Draonria", "radius": 20, "orbitRadius": 292, "orbitSpeed": 0.3459, "angle": 14.604, "flore": 24, "faune": 43 }
        ]}
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Corora-Corelria",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    { "name": "Palutis", "radius": 244, "orbitRadius": 2305, "orbitSpeed": 0.0116, "angle": 3.787, "color": "#FF6B6B",
      "planets": [
        { "name": "Vorera", "radius": 130, "orbitRadius": 565, "orbitSpeed": 0.0378, "angle": 8.756, "flore": 37, "faune": 50, "moons": [
            { "name": "Kryenton", "radius": 45, "orbitRadius": 228, "orbitSpeed": 0.2807, "angle": 78.437, "flore": 16, "faune": 39 },
            { "name": "Voranpha", "radius": 47, "orbitRadius": 228, "orbitSpeed": 0.2807, "angle": 74.416, "flore": 36, "faune": 10 }
        ]},
        { "name": "Palelton", "radius": 110, "orbitRadius": 1180, "orbitSpeed": 0.0405, "angle": 8.684, "flore": 84, "faune": 59, "moons": [
            { "name": "Palozar", "radius": 41, "orbitRadius": 351, "orbitSpeed": 0.1874, "angle": 48.965, "flore": 27, "faune": 4 },
            { "name": "Celexis", "radius": 42, "orbitRadius": 254, "orbitSpeed": 0.3444, "angle": 95.197, "flore": 36, "faune": 23 },
            { "name": "Celira", "radius": 33, "orbitRadius": 254, "orbitSpeed": 0.3444, "angle": 92.965, "flore": 24, "faune": 40 }
        ]},
        { "name": "Sigulux", "radius": 108, "orbitRadius": 1180, "orbitSpeed": 0.0405, "angle": 14.033, "flore": 64, "faune": 71, "moons": [
            { "name": "Nebozar", "radius": 34, "orbitRadius": 302, "orbitSpeed": 0.2793, "angle": 76.752, "flore": 15, "faune": 59 },
            { "name": "Draistis", "radius": 46, "orbitRadius": 302, "orbitSpeed": 0.2793, "angle": 75.475, "flore": 15, "faune": 34 }
        ]},
        { "name": "Palirtis", "radius": 86, "orbitRadius": 1180, "orbitSpeed": 0.0405, "angle": 10.976, "flore": 62, "faune": 3, "moons": [
            { "name": "Draanton", "radius": 31, "orbitRadius": 180, "orbitSpeed": 0.2081, "angle": 55.147, "flore": 15, "faune": 40 },
            { "name": "Celisria", "radius": 35, "orbitRadius": 300, "orbitSpeed": 0.3361, "angle": 91.912, "flore": 32, "faune": 19 }
        ]},
        { "name": "Pyxonbus", "radius": 124, "orbitRadius": 565, "orbitSpeed": 0.0378, "angle": 10.582, "flore": 46, "faune": 52, "moons": [
            { "name": "Thalalxis", "radius": 51, "orbitRadius": 195, "orbitSpeed": 0.3188, "angle": 89.538, "flore": 21, "faune": 12 },
            { "name": "Zanirton", "radius": 51, "orbitRadius": 195, "orbitSpeed": 0.3188, "angle": 86.146, "flore": 34, "faune": 55 }
        ]},
        { "name": "Eriumtis", "radius": 90, "orbitRadius": 1180, "orbitSpeed": 0.0405, "angle": 12.7, "flore": 22, "faune": 86, "moons": [
            { "name": "Xorirdis", "radius": 34, "orbitRadius": 344, "orbitSpeed": 0.2709, "angle": 65.331, "flore": 28, "faune": 52 }
        ]}
      ]
    },
    { "name": "Xororia", "radius": 177, "orbitRadius": 2305, "orbitSpeed": 0.0116, "angle": 6.148, "color": "#FFB830",
      "planets": [
        { "name": "Lyrelnis", "radius": 86, "orbitRadius": 475, "orbitSpeed": 0.059, "angle": 11.838, "flore": 116, "faune": 50, "moons": [
            { "name": "Ithanria", "radius": 26, "orbitRadius": 196, "orbitSpeed": 0.3158, "angle": 72.204, "flore": 38, "faune": 56 },
            { "name": "Pyxalbus", "radius": 60, "orbitRadius": 196, "orbitSpeed": 0.3158, "angle": 68.9, "flore": 47, "faune": 14 }
        ]},
        { "name": "Nebirzar", "radius": 86, "orbitRadius": 475, "orbitSpeed": 0.059, "angle": 16.529, "flore": 83, "faune": 20, "moons": [
            { "name": "Draonbus", "radius": 54, "orbitRadius": 211, "orbitSpeed": 0.2698, "angle": 61.664, "flore": 71, "faune": 36 }
        ]},
        { "name": "Thalisvyn", "radius": 106, "orbitRadius": 1056, "orbitSpeed": 0.0402, "angle": 9.877, "flore": 8, "faune": 71, "moons": [
            { "name": "Synelnis", "radius": 24, "orbitRadius": 326, "orbitSpeed": 0.3206, "angle": 72.335, "flore": 61, "faune": 19 }
        ]},
        { "name": "Palonnis", "radius": 86, "orbitRadius": 1056, "orbitSpeed": 0.0402, "angle": 8.644, "flore": 3, "faune": 16, "moons": [
            { "name": "Velelra", "radius": 49, "orbitRadius": 273, "orbitSpeed": 0.2991, "angle": 71.211, "flore": 68, "faune": 54 },
            { "name": "Thalilux", "radius": 41, "orbitRadius": 273, "orbitSpeed": 0.2991, "angle": 66.362, "flore": 10, "faune": 31 }
        ]},
        { "name": "Xoronmus", "radius": 73, "orbitRadius": 1056, "orbitSpeed": 0.0402, "angle": 6.695, "flore": 8, "faune": 94, "moons": [
            { "name": "Lyrilux", "radius": 29, "orbitRadius": 101, "orbitSpeed": 0.2853, "angle": 65.399, "flore": 1, "faune": 28 },
            { "name": "Nebantis", "radius": 35, "orbitRadius": 445, "orbitSpeed": 0.3024, "angle": 69.996, "flore": 64, "faune": 29 },
            { "name": "Lyrarpha", "radius": 47, "orbitRadius": 445, "orbitSpeed": 0.3024, "angle": 68.974, "flore": 4, "faune": 35 }
        ]},
        { "name": "Zananra", "radius": 71, "orbitRadius": 1056, "orbitSpeed": 0.0402, "angle": 7.545, "flore": 54, "faune": 86, "moons": [
            { "name": "Omiosdon", "radius": 35, "orbitRadius": 255, "orbitSpeed": 0.2291, "angle": 54.36, "flore": 1, "faune": 56 },
            { "name": "Zetirton", "radius": 26, "orbitRadius": 255, "orbitSpeed": 0.2291, "angle": 52.647, "flore": 37, "faune": 6 },
            { "name": "Zetizar", "radius": 42, "orbitRadius": 340, "orbitSpeed": 0.2948, "angle": 64.68, "flore": 1, "faune": 57 }
        ]}
      ]
    },
    { "name": "Zanirria", "radius": 236, "orbitRadius": 2305, "orbitSpeed": 0.0116, "angle": 1.737, "color": "#FFB830",
      "planets": [
        { "name": "Vorenria", "radius": 78, "orbitRadius": 529, "orbitSpeed": 0.0547, "angle": 19.317, "flore": 22, "faune": 55, "moons": [
            { "name": "Erialmus", "radius": 58, "orbitRadius": 166, "orbitSpeed": 0.2592, "angle": 77.763, "flore": 19, "faune": 3 },
            { "name": "Sigeria", "radius": 38, "orbitRadius": 211, "orbitSpeed": 0.2395, "angle": 74.301, "flore": 4, "faune": 13 }
        ]},
        { "name": "Synendis", "radius": 105, "orbitRadius": 529, "orbitSpeed": 0.0547, "angle": 21.402, "flore": 58, "faune": 55, "moons": [
            { "name": "Nebispha", "radius": 55, "orbitRadius": 198, "orbitSpeed": 0.3043, "angle": 88.961, "flore": 22, "faune": 50 },
            { "name": "Erialnis", "radius": 31, "orbitRadius": 198, "orbitSpeed": 0.3043, "angle": 91.686, "flore": 4, "faune": 58 }
        ]},
        { "name": "Eriudon", "radius": 120, "orbitRadius": 1337, "orbitSpeed": 0.0288, "angle": 6.928, "flore": 41, "faune": 60, "moons": [
            { "name": "Nebarnis", "radius": 52, "orbitRadius": 279, "orbitSpeed": 0.3045, "angle": 91.648, "flore": 11, "faune": 9 }
        ]},
        { "name": "Zetoton", "radius": 106, "orbitRadius": 1337, "orbitSpeed": 0.0288, "angle": 11.947, "flore": 14, "faune": 75, "moons": [
            { "name": "Velisdon", "radius": 38, "orbitRadius": 356, "orbitSpeed": 0.2826, "angle": 82.421, "flore": 30, "faune": 9 },
            { "name": "Ithulux", "radius": 36, "orbitRadius": 356, "orbitSpeed": 0.2826, "angle": 86.781, "flore": 42, "faune": 26 },
            { "name": "Thalitis", "radius": 56, "orbitRadius": 218, "orbitSpeed": 0.1518, "angle": 46.354, "flore": 29, "faune": 39 }
        ]},
        { "name": "Synosnis", "radius": 116, "orbitRadius": 1337, "orbitSpeed": 0.0288, "angle": 10.501, "flore": 14, "faune": 73, "moons": [
            { "name": "Nebodis", "radius": 60, "orbitRadius": 238, "orbitSpeed": 0.2718, "angle": 81.233, "flore": 29, "faune": 11 },
            { "name": "Sigirpha", "radius": 54, "orbitRadius": 412, "orbitSpeed": 0.2383, "angle": 70.487, "flore": 19, "faune": 39 }
        ]},
        { "name": "Sigalzar", "radius": 101, "orbitRadius": 1337, "orbitSpeed": 0.0288, "angle": 9.589, "flore": 9, "faune": 71, "moons": [
            { "name": "Aurelzar", "radius": 49, "orbitRadius": 171, "orbitSpeed": 0.1655, "angle": 55.735, "flore": 33, "faune": 16 },
            { "name": "Omiarth", "radius": 22, "orbitRadius": 322, "orbitSpeed": 0.3248, "angle": 101.535, "flore": 22, "faune": 25 },
            { "name": "Xorenlux", "radius": 28, "orbitRadius": 400, "orbitSpeed": 0.349, "angle": 109.034, "flore": 37, "faune": 30 },
            { "name": "Palexis", "radius": 24, "orbitRadius": 400, "orbitSpeed": 0.349, "angle": 107.961, "flore": 35, "faune": 42 }
        ]}
      ]
    },
    { "name": "Palinis", "radius": 204, "orbitRadius": 4954, "orbitSpeed": 0.0087, "angle": 4.66, "color": "#7CB9FF",
      "planets": [
        { "name": "Kryidon", "radius": 85, "orbitRadius": 914, "orbitSpeed": 0.0407, "angle": 5.63, "flore": 78, "faune": 102, "moons": [
            { "name": "Auraxra", "radius": 57, "orbitRadius": 316, "orbitSpeed": 0.2377, "angle": 46.316, "flore": 20, "faune": 0 },
            { "name": "Omiirlux", "radius": 26, "orbitRadius": 199, "orbitSpeed": 0.2755, "angle": 51.682, "flore": 15, "faune": 0 },
            { "name": "Nebonnis", "radius": 29, "orbitRadius": 199, "orbitSpeed": 0.2755, "angle": 50.126, "flore": 23, "faune": 35 }
        ]},
        { "name": "Pyxumdon", "radius": 108, "orbitRadius": 914, "orbitSpeed": 0.0407, "angle": 8.551, "flore": 8, "faune": 1, "moons": [
            { "name": "Aurixis", "radius": 58, "orbitRadius": 371, "orbitSpeed": 0.1685, "angle": 33.087, "flore": 15, "faune": 55 },
            { "name": "Ithosra", "radius": 58, "orbitRadius": 371, "orbitSpeed": 0.1685, "angle": 29.139, "flore": 56, "faune": 25 }
        ]},
        { "name": "Zetalton", "radius": 84, "orbitRadius": 914, "orbitSpeed": 0.0407, "angle": 10.345, "flore": 21, "faune": 77, "moons": [
            { "name": "Pyxenth", "radius": 20, "orbitRadius": 267, "orbitSpeed": 0.2451, "angle": 42.551, "flore": 47, "faune": 52 },
            { "name": "Nebanpha", "radius": 58, "orbitRadius": 267, "orbitSpeed": 0.2451, "angle": 46.282, "flore": 54, "faune": 68 }
        ]},
        { "name": "Zetolux", "radius": 129, "orbitRadius": 1368, "orbitSpeed": 0.0226, "angle": 3.143, "flore": 1, "faune": 56, "moons": [
            { "name": "Zanelnis", "radius": 50, "orbitRadius": 257, "orbitSpeed": 0.2953, "angle": 52.584, "flore": 29, "faune": 27 },
            { "name": "Zetelpha", "radius": 44, "orbitRadius": 257, "orbitSpeed": 0.2953, "angle": 56.823, "flore": 43, "faune": 8 }
        ]},
        { "name": "Thalirria", "radius": 108, "orbitRadius": 1368, "orbitSpeed": 0.0226, "angle": 4.377, "flore": 63, "faune": 43, "moons": [
            { "name": "Auremir", "radius": 37, "orbitRadius": 287, "orbitSpeed": 0.2084, "angle": 32.558, "flore": 16, "faune": 43 }
        ]},
        { "name": "Auraltis", "radius": 70, "orbitRadius": 1368, "orbitSpeed": 0.0226, "angle": 6.758, "flore": 45, "faune": 39, "moons": [
            { "name": "Coronis", "radius": 27, "orbitRadius": 155, "orbitSpeed": 0.227, "angle": 34.665, "flore": 19, "faune": 14 }
        ]}
      ]
    },
    { "name": "Zetarmus", "radius": 180, "orbitRadius": 4954, "orbitSpeed": 0.0087, "angle": -0.06, "color": "#FFE44D",
      "planets": [
        { "name": "Nebivyn", "radius": 116, "orbitRadius": 576, "orbitSpeed": 0.0417, "angle": 5.519, "flore": 5, "faune": 1, "moons": [
            { "name": "Vorarvyn", "radius": 42, "orbitRadius": 223, "orbitSpeed": 0.2733, "angle": 33.462, "flore": 8, "faune": 6 },
            { "name": "Draaxbus", "radius": 43, "orbitRadius": 223, "orbitSpeed": 0.2733, "angle": 37.644, "flore": 5, "faune": 36 },
            { "name": "Synumnis", "radius": 30, "orbitRadius": 223, "orbitSpeed": 0.2733, "angle": 36.805, "flore": 10, "faune": 25 }
        ]},
        { "name": "Lyrarmus", "radius": 87, "orbitRadius": 576, "orbitSpeed": 0.0417, "angle": 9.513, "flore": 6, "faune": 52, "moons": [
            { "name": "Palardon", "radius": 25, "orbitRadius": 182, "orbitSpeed": 0.198, "angle": 23.135, "flore": 2, "faune": 23 },
            { "name": "Aurisbus", "radius": 47, "orbitRadius": 182, "orbitSpeed": 0.198, "angle": 27.867, "flore": 3, "faune": 6 }
        ]},
        { "name": "Synarmir", "radius": 123, "orbitRadius": 576, "orbitSpeed": 0.0417, "angle": 8.226, "flore": 3, "faune": 29, "moons": [
            { "name": "Sigonis", "radius": 41, "orbitRadius": 276, "orbitSpeed": 0.2022, "angle": 29.091, "flore": 9, "faune": 38 },
            { "name": "Nebumdis", "radius": 40, "orbitRadius": 389, "orbitSpeed": 0.2189, "angle": 29.845, "flore": 5, "faune": 21 },
            { "name": "Sigumdis", "radius": 36, "orbitRadius": 276, "orbitSpeed": 0.2022, "angle": 25.168, "flore": 2, "faune": 31 }
        ]},
        { "name": "Xorendon", "radius": 110, "orbitRadius": 1266, "orbitSpeed": 0.0252, "angle": 1.252, "flore": 16, "faune": 34, "moons": [
            { "name": "Omiaxxis", "radius": 25, "orbitRadius": 177, "orbitSpeed": 0.2763, "angle": 42.016, "flore": 9, "faune": 9 },
            { "name": "Aurobus", "radius": 51, "orbitRadius": 319, "orbitSpeed": 0.2099, "angle": 26.542, "flore": 4, "faune": 20 },
            { "name": "Corubus", "radius": 34, "orbitRadius": 177, "orbitSpeed": 0.2763, "angle": 37.003, "flore": 3, "faune": 39 }
        ]},
        { "name": "Xoraxth", "radius": 102, "orbitRadius": 1266, "orbitSpeed": 0.0252, "angle": 6.854, "flore": 11, "faune": 26, "moons": [
            { "name": "Zetonnis", "radius": 20, "orbitRadius": 212, "orbitSpeed": 0.204, "angle": 31.462, "flore": 1, "faune": 24 },
            { "name": "Veludis", "radius": 26, "orbitRadius": 438, "orbitSpeed": 0.2261, "angle": 28.512, "flore": 7, "faune": 6 },
            { "name": "Lyrenbus", "radius": 23, "orbitRadius": 438, "orbitSpeed": 0.2261, "angle": 34.003, "flore": 10, "faune": 27 },
            { "name": "Palonra", "radius": 39, "orbitRadius": 438, "orbitSpeed": 0.2261, "angle": 32.85, "flore": 2, "faune": 6 }
        ]},
        { "name": "Celoston", "radius": 96, "orbitRadius": 1266, "orbitSpeed": 0.0252, "angle": 3.596, "flore": 5, "faune": 27, "moons": [
            { "name": "Draomir", "radius": 57, "orbitRadius": 242, "orbitSpeed": 0.2086, "angle": 28.754, "flore": 10, "faune": 30 },
            { "name": "Zanara", "radius": 21, "orbitRadius": 315, "orbitSpeed": 0.2514, "angle": 33.754, "flore": 2, "faune": 38 },
            { "name": "Draaltis", "radius": 41, "orbitRadius": 242, "orbitSpeed": 0.2086, "angle": 24.767, "flore": 9, "faune": 27 },
            { "name": "Sigarria", "radius": 45, "orbitRadius": 315, "orbitSpeed": 0.2514, "angle": 31.35, "flore": 8, "faune": 39 }
        ]},
        { "name": "Sigelzar", "radius": 128, "orbitRadius": 1266, "orbitSpeed": 0.0252, "angle": 2.486, "flore": 1, "faune": 58, "moons": [
            { "name": "Ithaxth", "radius": 24, "orbitRadius": 256, "orbitSpeed": 0.3419, "angle": 50.743, "flore": 4, "faune": 5 },
            { "name": "Itheth", "radius": 56, "orbitRadius": 471, "orbitSpeed": 0.268, "angle": 41.656, "flore": 1, "faune": 25 },
            { "name": "Zanarlux", "radius": 59, "orbitRadius": 256, "orbitSpeed": 0.3419, "angle": 46.039, "flore": 2, "faune": 22 }
        ]},
        { "name": "Pyxeton", "radius": 97, "orbitRadius": 1266, "orbitSpeed": 0.0252, "angle": 5.024, "flore": 7, "faune": 29, "moons": [] }
      ]
    },
    { "name": "Thalatis", "radius": 209, "orbitRadius": 4954, "orbitSpeed": 0.0087, "angle": 1.444, "color": "#FFE44D",
      "planets": [
        { "name": "Pyxenis", "radius": 113, "orbitRadius": 487, "orbitSpeed": 0.0428, "angle": 2.179, "flore": 9, "faune": 18, "moons": [
            { "name": "Coronmus", "radius": 31, "orbitRadius": 207, "orbitSpeed": 0.2115, "angle": 23.527, "flore": 47, "faune": 17 },
            { "name": "Celenbus", "radius": 34, "orbitRadius": 207, "orbitSpeed": 0.2115, "angle": 19.37, "flore": 52, "faune": 49 }
        ]},
        { "name": "Nebisdis", "radius": 124, "orbitRadius": 813, "orbitSpeed": 0.0393, "angle": 1.291, "flore": 88, "faune": 55, "moons": [] },
        { "name": "Synismus", "radius": 91, "orbitRadius": 813, "orbitSpeed": 0.0393, "angle": 5.952, "flore": 26, "faune": 59, "moons": [
            { "name": "Coranra", "radius": 31, "orbitRadius": 161, "orbitSpeed": 0.2807, "angle": 20.499, "flore": 28, "faune": 40 },
            { "name": "Palaxbus", "radius": 54, "orbitRadius": 161, "orbitSpeed": 0.2807, "angle": 24.918, "flore": 44, "faune": 30 }
        ]},
        { "name": "Zetumir", "radius": 108, "orbitRadius": 487, "orbitSpeed": 0.0428, "angle": 4.889, "flore": 15, "faune": 34, "moons": [
            { "name": "Aurirth", "radius": 32, "orbitRadius": 228, "orbitSpeed": 0.2383, "angle": 17.085, "flore": 31, "faune": 62 },
            { "name": "Nebenlux", "radius": 25, "orbitRadius": 228, "orbitSpeed": 0.2383, "angle": 22.549, "flore": 3, "faune": 31 },
            { "name": "Zanenpha", "radius": 45, "orbitRadius": 228, "orbitSpeed": 0.2383, "angle": 19.931, "flore": 41, "faune": 1 }
        ]},
        { "name": "Corelra", "radius": 99, "orbitRadius": 813, "orbitSpeed": 0.0393, "angle": 3.352, "flore": 103, "faune": 49, "moons": [
            { "name": "Xorezar", "radius": 28, "orbitRadius": 198, "orbitSpeed": 0.3483, "angle": 30.943, "flore": 11, "faune": 38 },
            { "name": "Ithexis", "radius": 26, "orbitRadius": 198, "orbitSpeed": 0.3483, "angle": 35.87, "flore": 33, "faune": 57 },
            { "name": "Zanalvyn", "radius": 44, "orbitRadius": 198, "orbitSpeed": 0.3483, "angle": 34.89, "flore": 32, "faune": 7 },
            { "name": "Draitis", "radius": 34, "orbitRadius": 274, "orbitSpeed": 0.1943, "angle": 20.009, "flore": 20, "faune": 39 },
            { "name": "Ithanxis", "radius": 38, "orbitRadius": 274, "orbitSpeed": 0.1943, "angle": 15.68, "flore": 41, "faune": 59 }
        ]}
      ]
    },
    { "name": "Kryaxth", "radius": 174, "orbitRadius": 4954, "orbitSpeed": 0.0087, "angle": 2.479, "color": "#FFB830",
      "planets": [
        { "name": "Pyxanxis", "radius": 110, "orbitRadius": 363, "orbitSpeed": 0.0666, "angle": 2.822, "flore": 65, "faune": 44, "moons": [] },
        { "name": "Celumnis", "radius": 74, "orbitRadius": 866, "orbitSpeed": 0.0423, "angle": 0.267, "flore": 43, "faune": 66, "moons": [
            { "name": "Pyxenbus", "radius": 42, "orbitRadius": 140, "orbitSpeed": 0.2087, "angle": 12.291, "flore": 36, "faune": 22 },
            { "name": "Vorora", "radius": 29, "orbitRadius": 140, "orbitSpeed": 0.2087, "angle": 11.324, "flore": 25, "faune": 55 },
            { "name": "Palura", "radius": 56, "orbitRadius": 244, "orbitSpeed": 0.1911, "angle": 9.959, "flore": 39, "faune": 54 }
        ]},
        { "name": "Pyxunis", "radius": 119, "orbitRadius": 363, "orbitSpeed": 0.0666, "angle": 6.731, "flore": 21, "faune": 23, "moons": [] },
        { "name": "Vorabus", "radius": 92, "orbitRadius": 866, "orbitSpeed": 0.0423, "angle": 3.759, "flore": 64, "faune": 63, "moons": [
            { "name": "Lyrobus", "radius": 29, "orbitRadius": 142, "orbitSpeed": 0.219, "angle": 7.624, "flore": 7, "faune": 5 },
            { "name": "Kryisxis", "radius": 40, "orbitRadius": 340, "orbitSpeed": 0.3086, "angle": 11.924, "flore": 41, "faune": 49 },
            { "name": "Nebirxis", "radius": 21, "orbitRadius": 340, "orbitSpeed": 0.3086, "angle": 17.287, "flore": 7, "faune": 4 },
            { "name": "Pyxanis", "radius": 53, "orbitRadius": 340, "orbitSpeed": 0.3086, "angle": 16.127, "flore": 38, "faune": 9 }
        ]},
        { "name": "Sigadis", "radius": 124, "orbitRadius": 866, "orbitSpeed": 0.0423, "angle": 5.13, "flore": 14, "faune": 20, "moons": [
            { "name": "Vorumir", "radius": 36, "orbitRadius": 240, "orbitSpeed": 0.1817, "angle": 6.692, "flore": 22, "faune": 35 },
            { "name": "Kryanbus", "radius": 45, "orbitRadius": 240, "orbitSpeed": 0.1817, "angle": 11.188, "flore": 37, "faune": 47 },
            { "name": "Drairpha", "radius": 25, "orbitRadius": 400, "orbitSpeed": 0.3131, "angle": 17.578, "flore": 34, "faune": 13 },
            { "name": "Nebeth", "radius": 42, "orbitRadius": 240, "orbitSpeed": 0.1817, "angle": 9.053, "flore": 36, "faune": 32 },
            { "name": "Omienlux", "radius": 33, "orbitRadius": 400, "orbitSpeed": 0.3131, "angle": 13.246, "flore": 42, "faune": 7 },
            { "name": "Lyrosdon", "radius": 49, "orbitRadius": 400, "orbitSpeed": 0.3131, "angle": 12.504, "flore": 27, "faune": 31 }
        ]},
        { "name": "Xoridon", "radius": 126, "orbitRadius": 866, "orbitSpeed": 0.0423, "angle": 2.659, "flore": 7, "faune": 12, "moons": [
            { "name": "Thalath", "radius": 58, "orbitRadius": 280, "orbitSpeed": 0.3208, "angle": 21.367, "flore": 22, "faune": 49 },
            { "name": "Vorondon", "radius": 35, "orbitRadius": 280, "orbitSpeed": 0.3208, "angle": 16.564, "flore": 30, "faune": 56 }
        ]}
      ]
    },
    { "name": "Palondis", "radius": 156, "orbitRadius": 4954, "orbitSpeed": 0.0087, "angle": -2.811, "color": "#FF6B6B",
      "planets": [
        { "name": "Omioth", "radius": 99, "orbitRadius": 386, "orbitSpeed": 0.0617, "angle": -1.441, "flore": 40, "faune": 8, "moons": [
            { "name": "Synarmus", "radius": 56, "orbitRadius": 191, "orbitSpeed": 0.191, "angle": 1.659, "flore": 2, "faune": 31 }
        ]},
        { "name": "Palith", "radius": 113, "orbitRadius": 851, "orbitSpeed": 0.0427, "angle": -1.804, "flore": 75, "faune": 8, "moons": [
            { "name": "Aurenria", "radius": 31, "orbitRadius": 280, "orbitSpeed": 0.2631, "angle": 0.427, "flore": 44, "faune": 63 },
            { "name": "Auranra", "radius": 46, "orbitRadius": 280, "orbitSpeed": 0.2631, "angle": 5.751, "flore": 30, "faune": 13 }
        ]},
        { "name": "Xorallux", "radius": 129, "orbitRadius": 851, "orbitSpeed": 0.0427, "angle": -0.421, "flore": 28, "faune": 43, "moons": [
            { "name": "Lyralvyn", "radius": 27, "orbitRadius": 215, "orbitSpeed": 0.1804, "angle": -0.344, "flore": 43, "faune": 20 },
            { "name": "Itharnis", "radius": 40, "orbitRadius": 215, "orbitSpeed": 0.1804, "angle": 1.293, "flore": 28, "faune": 70 },
            { "name": "Draelzar", "radius": 48, "orbitRadius": 309, "orbitSpeed": 0.3038, "angle": 5.348, "flore": 3, "faune": 71 }
        ]},
        { "name": "Xorinis", "radius": 100, "orbitRadius": 386, "orbitSpeed": 0.0617, "angle": 1.839, "flore": 57, "faune": 25, "moons": [] },
        { "name": "Synirra", "radius": 92, "orbitRadius": 851, "orbitSpeed": 0.0427, "angle": 2.94, "flore": 37, "faune": 125, "moons": [
            { "name": "Zetopha", "radius": 47, "orbitRadius": 147, "orbitSpeed": 0.3359, "angle": -0.238, "flore": 33, "faune": 34 },
            { "name": "Aurosth", "radius": 43, "orbitRadius": 361, "orbitSpeed": 0.2861, "angle": 4.667, "flore": 22, "faune": 29 },
            { "name": "Vorirtis", "radius": 29, "orbitRadius": 361, "orbitSpeed": 0.2861, "angle": 3.845, "flore": 42, "faune": 20 }
        ]},
        { "name": "Celaxria", "radius": 119, "orbitRadius": 851, "orbitSpeed": 0.0427, "angle": 2.102, "flore": 62, "faune": 23, "moons": [
            { "name": "Celera", "radius": 56, "orbitRadius": 198, "orbitSpeed": 0.199, "angle": 3.453, "flore": 8, "faune": 64 }
        ]}
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Eriarxis-Ithuria",
  "blackHole": { "x": 0, "y": 0, "radius": 300 },
  "suns": [
    { "name": "Pyxirxis", "radius": 168, "orbitRadius": 1834, "orbitSpeed": 0.0121, "angle": 7.459, "color": "#FFB830",
      "planets": [
        { "name": "Coredon", "radius": 75, "orbitRadius": 464, "orbitSpeed": 0.0517, "angle": 21.672, "flore": 319, "faune": 117, "moons": [
            { "name": "Omiunis", "radius": 29, "orbitRadius": 176, "orbitSpeed": 0.3169, "angle": 21.984, "flore": 132, "faune": 145 },
            { "name": "Sigaxvyn", "radius": 55, "orbitRadius": 176, "orbitSpeed": 0.3169, "angle": 23.175, "flore": 26, "faune": 79 }
        ]},
        { "name": "Synatis", "radius": 74, "orbitRadius": 464, "orbitSpeed": 0.0517, "angle": 19.683, "flore": 197, "faune": 130, "moons": [
            { "name": "Ithismus", "radius": 42, "orbitRadius": 200, "orbitSpeed": 0.3031, "angle": 21.684, "flore": 115, "faune": 107 }
        ]},
        { "name": "Vorelzar", "radius": 94, "orbitRadius": 464, "orbitSpeed": 0.0517, "angle": 18.316, "flore": 204, "faune": 51, "moons": [] }
      ]
    },
    { "name": "Pyxeton", "radius": 218, "orbitRadius": 1834, "orbitSpeed": 0.0121, "angle": 5.559, "color": "#FF6B6B",
      "planets": [
        { "name": "Celumtis", "radius": 74, "orbitRadius": 1047, "orbitSpeed": 0.0346, "angle": 10.093, "flore": 2, "faune": 35, "moons": [
            { "name": "Coronmir", "radius": 55, "orbitRadius": 155, "orbitSpeed": 0.1773, "angle": 24.858, "flore": 4, "faune": 24 },
            { "name": "Eriaton", "radius": 24, "orbitRadius": 155, "orbitSpeed": 0.1773, "angle": 29.412, "flore": 6, "faune": 33 }
        ]},
        { "name": "Zetellux", "radius": 117, "orbitRadius": 1047, "orbitSpeed": 0.0346, "angle": 9.45, "flore": 1, "faune": 23, "moons": [
            { "name": "Zetenis", "radius": 29, "orbitRadius": 232, "orbitSpeed": 0.152, "angle": 21.215, "flore": 11, "faune": 39 },
            { "name": "Xoronbus", "radius": 39, "orbitRadius": 232, "orbitSpeed": 0.152, "angle": 26.277, "flore": 5, "faune": 17 },
            { "name": "Omialux", "radius": 21, "orbitRadius": 373, "orbitSpeed": 0.1843, "angle": 30.642, "flore": 14, "faune": 5 }
        ]},
        { "name": "Xoraxria", "radius": 95, "orbitRadius": 1047, "orbitSpeed": 0.0346, "angle": 14.309, "flore": 3, "faune": 51, "moons": [
            { "name": "Zetudon", "radius": 60, "orbitRadius": 291, "orbitSpeed": 0.2225, "angle": 33.57, "flore": 10, "faune": 17 },
            { "name": "Zetedis", "radius": 48, "orbitRadius": 291, "orbitSpeed": 0.2225, "angle": 31.798, "flore": 3, "faune": 37 }
        ]},
        { "name": "Kryenmus", "radius": 76, "orbitRadius": 1047, "orbitSpeed": 0.0346, "angle": 11.266, "flore": 16, "faune": 58, "moons": [
            { "name": "Kryenbus", "radius": 42, "orbitRadius": 237, "orbitSpeed": 0.3444, "angle": 48.78, "flore": 8, "faune": 13 }
        ]},
        { "name": "Zanaxzar", "radius": 118, "orbitRadius": 1047, "orbitSpeed": 0.0346, "angle": 13.315, "flore": 13, "faune": 74, "moons": [
            { "name": "Pyxuton", "radius": 39, "orbitRadius": 392, "orbitSpeed": 0.3304, "angle": 43.583, "flore": 12, "faune": 39 },
            { "name": "Erionzar", "radius": 40, "orbitRadius": 392, "orbitSpeed": 0.3304, "angle": 45.271, "flore": 6, "faune": 19 }
        ]},
        { "name": "Xoralxis", "radius": 93, "orbitRadius": 502, "orbitSpeed": 0.0413, "angle": 10.492, "flore": 19, "faune": 58, "moons": [
            { "name": "Celaldon", "radius": 58, "orbitRadius": 184, "orbitSpeed": 0.2729, "angle": 39.993, "flore": 1, "faune": 16 },
            { "name": "Celiston", "radius": 58, "orbitRadius": 184, "orbitSpeed": 0.2729, "angle": 37.336, "flore": 3, "faune": 7 }
        ]},
        { "name": "Kryelzar", "radius": 81, "orbitRadius": 502, "orbitSpeed": 0.0413, "angle": 14.922, "flore": 11, "faune": 23, "moons": [
            { "name": "Coramir", "radius": 26, "orbitRadius": 192, "orbitSpeed": 0.2178, "angle": 29.367, "flore": 5, "faune": 39 },
            { "name": "Sigumxis", "radius": 46, "orbitRadius": 192, "orbitSpeed": 0.2178, "angle": 33.765, "flore": 8, "faune": 22 }
        ]},
        { "name": "Velalpha", "radius": 107, "orbitRadius": 502, "orbitSpeed": 0.0413, "angle": 13.501, "flore": 4, "faune": 7, "moons": [
            { "name": "Zanidon", "radius": 32, "orbitRadius": 223, "orbitSpeed": 0.1616, "angle": 20.238, "flore": 5, "faune": 26 },
            { "name": "Synonis", "radius": 41, "orbitRadius": 223, "orbitSpeed": 0.1616, "angle": 21.867, "flore": 14, "faune": 22 },
            { "name": "Velaxpha", "radius": 41, "orbitRadius": 223, "orbitSpeed": 0.1616, "angle": 23.419, "flore": 12, "faune": 34 }
        ]}
      ]
    },
    { "name": "Xoreria", "radius": 239, "orbitRadius": 1834, "orbitSpeed": 0.0121, "angle": 1.964, "color": "#FFE44D",
      "planets": [
        { "name": "Kryirpha", "radius": 91, "orbitRadius": 372, "orbitSpeed": 0.0683, "angle": 28.08, "flore": 15, "faune": 12, "moons": [] },
        { "name": "Omiaxnis", "radius": 88, "orbitRadius": 758, "orbitSpeed": 0.0502, "angle": 15.334, "flore": 31, "faune": 25, "moons": [
            { "name": "Vorupha", "radius": 36, "orbitRadius": 179, "orbitSpeed": 0.2037, "angle": 21.113, "flore": 19, "faune": 13 },
            { "name": "Sigemir", "radius": 29, "orbitRadius": 271, "orbitSpeed": 0.3197, "angle": 26.377, "flore": 29, "faune": 28 }
        ]},
        { "name": "Vorelmus", "radius": 85, "orbitRadius": 372, "orbitSpeed": 0.0683, "angle": 23.598, "flore": 47, "faune": 49, "moons": [] },
        { "name": "Aurumria", "radius": 101, "orbitRadius": 372, "orbitSpeed": 0.0683, "angle": 24.667, "flore": 26, "faune": 79, "moons": [] },
        { "name": "Velumdis", "radius": 106, "orbitRadius": 758, "orbitSpeed": 0.0502, "angle": 18.963, "flore": 37, "faune": 55, "moons": [
            { "name": "Synenria", "radius": 58, "orbitRadius": 330, "orbitSpeed": 0.3007, "angle": 23.372, "flore": 24, "faune": 43 },
            { "name": "Celora", "radius": 20, "orbitRadius": 231, "orbitSpeed": 0.2357, "angle": 22.193, "flore": 31, "faune": 48 },
            { "name": "Pyxera", "radius": 26, "orbitRadius": 231, "orbitSpeed": 0.2357, "angle": 20.631, "flore": 36, "faune": 58 },
            { "name": "Paleria", "radius": 39, "orbitRadius": 330, "orbitSpeed": 0.3007, "angle": 25.706, "flore": 12, "faune": 45 }
        ]},
        { "name": "Palosmus", "radius": 126, "orbitRadius": 758, "orbitSpeed": 0.0502, "angle": 20.336, "flore": 28, "faune": 12, "moons": [
            { "name": "Sigismus", "radius": 43, "orbitRadius": 213, "orbitSpeed": 0.3127, "angle": 26.297, "flore": 31, "faune": 8 },
            { "name": "Nebosth", "radius": 27, "orbitRadius": 213, "orbitSpeed": 0.3127, "angle": 27.304, "flore": 3, "faune": 33 },
            { "name": "Zananmir", "radius": 55, "orbitRadius": 213, "orbitSpeed": 0.3127, "angle": 28.31, "flore": 35, "faune": 35 }
        ]},
        { "name": "Synarria", "radius": 124, "orbitRadius": 758, "orbitSpeed": 0.0502, "angle": 16.912, "flore": 41, "faune": 61, "moons": [
            { "name": "Coralbus", "radius": 42, "orbitRadius": 223, "orbitSpeed": 0.3397, "angle": 30.971, "flore": 9, "faune": 52 },
            { "name": "Vorelux", "radius": 51, "orbitRadius": 223, "orbitSpeed": 0.3397, "angle": 29.896, "flore": 4, "faune": 40 }
        ]}
      ]
    },
    { "name": "Kryeltis", "radius": 240, "orbitRadius": 1834, "orbitSpeed": 0.0121, "angle": 3.647, "color": "#FFB830",
      "planets": [
        { "name": "Syneldis", "radius": 121, "orbitRadius": 415, "orbitSpeed": 0.0486, "angle": 20.697, "flore": 31, "faune": 29, "moons": [] },
        { "name": "Velanpha", "radius": 71, "orbitRadius": 801, "orbitSpeed": 0.0362, "angle": 16.45, "flore": 75, "faune": 13, "moons": [
            { "name": "Ithaxxis", "radius": 44, "orbitRadius": 211, "orbitSpeed": 0.1809, "angle": 21.319, "flore": 0, "faune": 40 },
            { "name": "Draosmir", "radius": 44, "orbitRadius": 211, "orbitSpeed": 0.1809, "angle": 17.895, "flore": 1, "faune": 56 }
        ]},
        { "name": "Zetalra", "radius": 130, "orbitRadius": 415, "orbitSpeed": 0.0486, "angle": 16.59, "flore": 19, "faune": 80, "moons": [] },
        { "name": "Vorodis", "radius": 100, "orbitRadius": 801, "orbitSpeed": 0.0362, "angle": 11.169, "flore": 29, "faune": 59, "moons": [
            { "name": "Zanarxis", "radius": 34, "orbitRadius": 264, "orbitSpeed": 0.2052, "angle": 23.175, "flore": 39, "faune": 38 },
            { "name": "Corimir", "radius": 21, "orbitRadius": 264, "orbitSpeed": 0.2052, "angle": 26.78, "flore": 36, "faune": 0 },
            { "name": "Vorendis", "radius": 27, "orbitRadius": 264, "orbitSpeed": 0.2052, "angle": 22.031, "flore": 36, "faune": 42 },
            { "name": "Ithismus", "radius": 33, "orbitRadius": 192, "orbitSpeed": 0.2096, "angle": 25.28, "flore": 31, "faune": 8 },
            { "name": "Zanalxis", "radius": 33, "orbitRadius": 192, "orbitSpeed": 0.2096, "angle": 20.446, "flore": 49, "faune": 47 }
        ]},
        { "name": "Pyxandis", "radius": 75, "orbitRadius": 801, "orbitSpeed": 0.0362, "angle": 13.344, "flore": 90, "faune": 58, "moons": [
            { "name": "Vorosxis", "radius": 43, "orbitRadius": 182, "orbitSpeed": 0.2647, "angle": 30.547, "flore": 48, "faune": 4 },
            { "name": "Velith", "radius": 45, "orbitRadius": 182, "orbitSpeed": 0.2647, "angle": 33.121, "flore": 5, "faune": 32 }
        ]},
        { "name": "Draisra", "radius": 108, "orbitRadius": 801, "orbitSpeed": 0.0362, "angle": 14.824, "flore": 22, "faune": 42, "moons": [
            { "name": "Celandon", "radius": 22, "orbitRadius": 155, "orbitSpeed": 0.1705, "angle": 20.448, "flore": 6, "faune": 42 },
            { "name": "Aurumzar", "radius": 45, "orbitRadius": 248, "orbitSpeed": 0.2309, "angle": 28.034, "flore": 32, "faune": 50 },
            { "name": "Zanantis", "radius": 41, "orbitRadius": 155, "orbitSpeed": 0.1705, "angle": 24.091, "flore": 26, "faune": 56 }
        ]}
      ]
    },
    { "name": "Synumdon", "radius": 220, "orbitRadius": 4525, "orbitSpeed": 0.0099, "angle": 2.135, "color": "#FF6B6B",
      "planets": [
        { "name": "Aurath", "radius": 72, "orbitRadius": 594, "orbitSpeed": 0.0567, "angle": 19.061, "flore": 46, "faune": 2, "moons": [
            { "name": "Corostis", "radius": 24, "orbitRadius": 210, "orbitSpeed": 0.227, "angle": 61.523, "flore": 4, "faune": 35 },
            { "name": "Velomir", "radius": 50, "orbitRadius": 210, "orbitSpeed": 0.227, "angle": 56.351, "flore": 17, "faune": 43 },
            { "name": "Lyrapha", "radius": 29, "orbitRadius": 294, "orbitSpeed": 0.2128, "angle": 54.299, "flore": 6, "faune": 31 }
        ]},
        { "name": "Sigiton", "radius": 90, "orbitRadius": 1168, "orbitSpeed": 0.0292, "angle": 10.131, "flore": 12, "faune": 17, "moons": [
            { "name": "Kryenpha", "radius": 43, "orbitRadius": 261, "orbitSpeed": 0.2952, "angle": 70.671, "flore": 5, "faune": 37 },
            { "name": "Voraxpha", "radius": 20, "orbitRadius": 261, "orbitSpeed": 0.2952, "angle": 73.94, "flore": 24, "faune": 45 },
            { "name": "Coraxbus", "radius": 58, "orbitRadius": 261, "orbitSpeed": 0.2952, "angle": 68.941, "flore": 9, "faune": 10 }
        ]},
        { "name": "Synoxis", "radius": 77, "orbitRadius": 1168, "orbitSpeed": 0.0292, "angle": 11.165, "flore": 42, "faune": 23, "moons": [
            { "name": "Draelux", "radius": 39, "orbitRadius": 187, "orbitSpeed": 0.3078, "angle": 75.257, "flore": 7, "faune": 56 },
            { "name": "Zanismir", "radius": 53, "orbitRadius": 265, "orbitSpeed": 0.1799, "angle": 46.868, "flore": 25, "faune": 37 },
            { "name": "Eriith", "radius": 53, "orbitRadius": 187, "orbitSpeed": 0.3078, "angle": 80.041, "flore": 8, "faune": 11 }
        ]},
        { "name": "Zetadon", "radius": 85, "orbitRadius": 594, "orbitSpeed": 0.0567, "angle": 17.344, "flore": 39, "faune": 27, "moons": [
            { "name": "Sigenzar", "radius": 45, "orbitRadius": 182, "orbitSpeed": 0.1762, "angle": 45.204, "flore": 3, "faune": 38 },
            { "name": "Draisvyn", "radius": 24, "orbitRadius": 182, "orbitSpeed": 0.1762, "angle": 46.468, "flore": 15, "faune": 35 },
            { "name": "Veledis", "radius": 43, "orbitRadius": 275, "orbitSpeed": 0.1802, "angle": 44.028, "flore": 16, "faune": 24 },
            { "name": "Palazar", "radius": 31, "orbitRadius": 275, "orbitSpeed": 0.1802, "angle": 45.427, "flore": 21, "faune": 40 },
            { "name": "Ithath", "radius": 27, "orbitRadius": 275, "orbitSpeed": 0.1802, "angle": 48.842, "flore": 18, "faune": 2 }
        ]},
        { "name": "Draalmir", "radius": 126, "orbitRadius": 1168, "orbitSpeed": 0.0292, "angle": 8.672, "flore": 18, "faune": 31, "moons": [
            { "name": "Zanonlux", "radius": 37, "orbitRadius": 227, "orbitSpeed": 0.1768, "angle": 50.185, "flore": 22, "faune": 18 },
            { "name": "Kryalra", "radius": 24, "orbitRadius": 227, "orbitSpeed": 0.1768, "angle": 45.577, "flore": 1, "faune": 32 },
            { "name": "Vorosth", "radius": 21, "orbitRadius": 350, "orbitSpeed": 0.2346, "angle": 62.276, "flore": 9, "faune": 28 }
        ]},
        { "name": "Celaxxis", "radius": 111, "orbitRadius": 1168, "orbitSpeed": 0.0292, "angle": 7.855, "flore": 22, "faune": 33, "moons": [
            { "name": "Ithixis", "radius": 24, "orbitRadius": 228, "orbitSpeed": 0.2116, "angle": 54.954, "flore": 23, "faune": 42 },
            { "name": "Lyrosnis", "radius": 48, "orbitRadius": 340, "orbitSpeed": 0.2219, "angle": 62.562, "flore": 19, "faune": 34 }
        ]}
      ]
    },
    { "name": "Celisdon", "radius": 155, "orbitRadius": 4525, "orbitSpeed": 0.0099, "angle": 1.072, "color": "#7CB9FF",
      "planets": [
        { "name": "Palontis", "radius": 87, "orbitRadius": 559, "orbitSpeed": 0.0587, "angle": 12.742, "flore": 75, "faune": 69, "moons": [
            { "name": "Sigaxvyn", "radius": 46, "orbitRadius": 198, "orbitSpeed": 0.3135, "angle": 65.652, "flore": 30, "faune": 13 },
            { "name": "Lyrenxis", "radius": 51, "orbitRadius": 198, "orbitSpeed": 0.3135, "angle": 67.449, "flore": 2, "faune": 36 }
        ]},
        { "name": "Kryisnis", "radius": 112, "orbitRadius": 891, "orbitSpeed": 0.0414, "angle": 7.31, "flore": 59, "faune": 18, "moons": [
            { "name": "Palemir", "radius": 25, "orbitRadius": 197, "orbitSpeed": 0.2845, "angle": 65.93, "flore": 50, "faune": 37 },
            { "name": "Omianis", "radius": 28, "orbitRadius": 197, "orbitSpeed": 0.2845, "angle": 60.613, "flore": 33, "faune": 17 },
            { "name": "Celannis", "radius": 47, "orbitRadius": 197, "orbitSpeed": 0.2845, "angle": 58.226, "flore": 20, "faune": 15 }
        ]},
        { "name": "Palenbus", "radius": 71, "orbitRadius": 891, "orbitSpeed": 0.0414, "angle": 11.786, "flore": 44, "faune": 100, "moons": [
            { "name": "Zanisdon", "radius": 40, "orbitRadius": 227, "orbitSpeed": 0.3012, "angle": 58.325, "flore": 21, "faune": 7 },
            { "name": "Draennis", "radius": 54, "orbitRadius": 227, "orbitSpeed": 0.3012, "angle": 63.025, "flore": 31, "faune": 30 }
        ]},
        { "name": "Aurelzar", "radius": 83, "orbitRadius": 559, "orbitSpeed": 0.0587, "angle": 14.251, "flore": 57, "faune": 45, "moons": [
            { "name": "Palarvyn", "radius": 43, "orbitRadius": 201, "orbitSpeed": 0.3376, "angle": 76.142, "flore": 6, "faune": 9 },
            { "name": "Xoristis", "radius": 48, "orbitRadius": 201, "orbitSpeed": 0.3376, "angle": 72.223, "flore": 40, "faune": 43 }
        ]},
        { "name": "Sigardis", "radius": 87, "orbitRadius": 891, "orbitSpeed": 0.0414, "angle": 9.732, "flore": 17, "faune": 82, "moons": [
            { "name": "Auronnis", "radius": 50, "orbitRadius": 303, "orbitSpeed": 0.2094, "angle": 46.53, "flore": 11, "faune": 4 },
            { "name": "Ithaxdis", "radius": 44, "orbitRadius": 303, "orbitSpeed": 0.2094, "angle": 41.07, "flore": 10, "faune": 54 },
            { "name": "Kryirxis", "radius": 38, "orbitRadius": 303, "orbitSpeed": 0.2094, "angle": 44.809, "flore": 45, "faune": 48 }
        ]}
      ]
    },
    { "name": "Auranra", "radius": 231, "orbitRadius": 4525, "orbitSpeed": 0.0099, "angle": -0.945, "color": "#FFE44D",
      "planets": [
        { "name": "Omionzar", "radius": 105, "orbitRadius": 927, "orbitSpeed": 0.0367, "angle": 7.037, "flore": 88, "faune": 82, "moons": [
            { "name": "Vorera", "radius": 58, "orbitRadius": 363, "orbitSpeed": 0.3387, "angle": 53.94, "flore": 33, "faune": 55 },
            { "name": "Thalonvyn", "radius": 24, "orbitRadius": 363, "orbitSpeed": 0.3387, "angle": 55.468, "flore": 33, "faune": 19 },
            { "name": "Synosdon", "radius": 22, "orbitRadius": 240, "orbitSpeed": 0.2641, "angle": 44.437, "flore": 48, "faune": 46 },
            { "name": "Vorelra", "radius": 46, "orbitRadius": 240, "orbitSpeed": 0.2641, "angle": 40.511, "flore": 37, "faune": 12 }
        ]},
        { "name": "Zanezar", "radius": 99, "orbitRadius": 927, "orbitSpeed": 0.0367, "angle": 5.816, "flore": 76, "faune": 116, "moons": [
            { "name": "Zetaxvyn", "radius": 36, "orbitRadius": 218, "orbitSpeed": 0.278, "angle": 42.654, "flore": 36, "faune": 39 },
            { "name": "Lyrelth", "radius": 32, "orbitRadius": 407, "orbitSpeed": 0.1556, "angle": 22.849, "flore": 13, "faune": 10 },
            { "name": "Celispha", "radius": 43, "orbitRadius": 407, "orbitSpeed": 0.1556, "angle": 27.875, "flore": 13, "faune": 24 },
            { "name": "Ithebus", "radius": 45, "orbitRadius": 218, "orbitSpeed": 0.278, "angle": 47.043, "flore": 30, "faune": 36 },
            { "name": "Nebisra", "radius": 28, "orbitRadius": 218, "orbitSpeed": 0.278, "angle": 45.23, "flore": 33, "faune": 40 }
        ]},
        { "name": "Itharxis", "radius": 127, "orbitRadius": 927, "orbitSpeed": 0.0367, "angle": 8.927, "flore": 107, "faune": 21, "moons": [
            { "name": "Zetaxlux", "radius": 23, "orbitRadius": 356, "orbitSpeed": 0.3301, "angle": 55.943, "flore": 16, "faune": 37 },
            { "name": "Zanartis", "radius": 59, "orbitRadius": 299, "orbitSpeed": 0.1724, "angle": 30.762, "flore": 1, "faune": 72 },
            { "name": "Sigepha", "radius": 26, "orbitRadius": 356, "orbitSpeed": 0.3301, "angle": 59.045, "flore": 3, "faune": 21 }
        ]}
      ]
    },
    { "name": "Lyrarmus", "radius": 168, "orbitRadius": 6891, "orbitSpeed": 0.0046, "angle": -2.577, "color": "#FF8C42",
      "planets": [
        { "name": "Zanonzar", "radius": 122, "orbitRadius": 526, "orbitSpeed": 0.0423, "angle": 2.501, "flore": 62, "faune": 97, "moons": [
            { "name": "Thalumnis", "radius": 32, "orbitRadius": 217, "orbitSpeed": 0.2665, "angle": 7.052, "flore": 21, "faune": 60 },
            { "name": "Auralton", "radius": 26, "orbitRadius": 217, "orbitSpeed": 0.2665, "angle": 8.102, "flore": 35, "faune": 4 },
            { "name": "Auredis", "radius": 45, "orbitRadius": 285, "orbitSpeed": 0.206, "angle": 8.232, "flore": 32, "faune": 58 },
            { "name": "Nebivyn", "radius": 25, "orbitRadius": 285, "orbitSpeed": 0.206, "angle": 8.928, "flore": 25, "faune": 49 }
        ]},
        { "name": "Synanis", "radius": 72, "orbitRadius": 526, "orbitSpeed": 0.0423, "angle": 4.806, "flore": 21, "faune": 85, "moons": [
            { "name": "Velupha", "radius": 57, "orbitRadius": 204, "orbitSpeed": 0.2924, "angle": 10.82, "flore": 21, "faune": 59 },
            { "name": "Voraxth", "radius": 35, "orbitRadius": 204, "orbitSpeed": 0.2924, "angle": 9.173, "flore": 45, "faune": 3 }
        ]},
        { "name": "Kryonnis", "radius": 124, "orbitRadius": 526, "orbitSpeed": 0.0423, "angle": 0.424, "flore": 19, "faune": 8, "moons": [
            { "name": "Xorendon", "radius": 33, "orbitRadius": 199, "orbitSpeed": 0.2073, "angle": 6.27, "flore": 44, "faune": 14 }
        ]},
        { "name": "Zetirth", "radius": 106, "orbitRadius": 908, "orbitSpeed": 0.0463, "angle": 1.293, "flore": 75, "faune": 39, "moons": [
            { "name": "Zanatis", "radius": 53, "orbitRadius": 213, "orbitSpeed": 0.2786, "angle": 12.037, "flore": 20, "faune": 30 },
            { "name": "Synanth", "radius": 46, "orbitRadius": 213, "orbitSpeed": 0.2786, "angle": 10.363, "flore": 50, "faune": 59 },
            { "name": "Vorelbus", "radius": 49, "orbitRadius": 213, "orbitSpeed": 0.2786, "angle": 14.734, "flore": 23, "faune": 33 }
        ]},
        { "name": "Kryonria", "radius": 127, "orbitRadius": 908, "orbitSpeed": 0.0463, "angle": 3.84, "flore": 2, "faune": 4, "moons": [
            { "name": "Thalonnis", "radius": 41, "orbitRadius": 272, "orbitSpeed": 0.2166, "angle": 6.646, "flore": 20, "faune": 22 },
            { "name": "Kryontis", "radius": 58, "orbitRadius": 272, "orbitSpeed": 0.2166, "angle": 11.105, "flore": 3, "faune": 41 },
            { "name": "Zetirmir", "radius": 36, "orbitRadius": 370, "orbitSpeed": 0.2541, "angle": 11.024, "flore": 11, "faune": 19 }
        ]}
      ]
    },
    { "name": "Eriavyn", "radius": 173, "orbitRadius": 6891, "orbitSpeed": 0.0046, "angle": 1.166, "color": "#7CB9FF",
      "planets": [
        { "name": "Aurannis", "radius": 95, "orbitRadius": 425, "orbitSpeed": 0.0448, "angle": -0.735, "flore": 43, "faune": 94, "moons": [
            { "name": "Auraton", "radius": 57, "orbitRadius": 221, "orbitSpeed": 0.1582, "angle": -1.032, "flore": 12, "faune": 60 },
            { "name": "Voranlux", "radius": 29, "orbitRadius": 221, "orbitSpeed": 0.1582, "angle": 4.275, "flore": 26, "faune": 8 }
        ]},
        { "name": "Synumus", "radius": 127, "orbitRadius": 849, "orbitSpeed": 0.0429, "angle": -2.145, "flore": 3, "faune": 77, "moons": [
            { "name": "Zanarpha", "radius": 24, "orbitRadius": 233, "orbitSpeed": 0.3017, "angle": 4.406, "flore": 63, "faune": 34 },
            { "name": "Kryandis", "radius": 43, "orbitRadius": 233, "orbitSpeed": 0.3017, "angle": -0.429, "flore": 5, "faune": 30 }
        ]},
        { "name": "Voronth", "radius": 100, "orbitRadius": 425, "orbitSpeed": 0.0448, "angle": 2.623, "flore": 93, "faune": 93, "moons": [
            { "name": "Aurarbus", "radius": 37, "orbitRadius": 209, "orbitSpeed": 0.3271, "angle": 0.317, "flore": 22, "faune": 19 },
            { "name": "Vorispha", "radius": 51, "orbitRadius": 209, "orbitSpeed": 0.3271, "angle": 4.881, "flore": 17, "faune": 24 },
            { "name": "Sigaxlux", "radius": 46, "orbitRadius": 209, "orbitSpeed": 0.3271, "angle": 3.636, "flore": 5, "faune": 6 }
        ]},
        { "name": "Pyxaxton", "radius": 97, "orbitRadius": 849, "orbitSpeed": 0.0429, "angle": 1.147, "flore": 131, "faune": 110, "moons": [
            { "name": "Eriatis", "radius": 59, "orbitRadius": 246, "orbitSpeed": 0.3043, "angle": 1.972, "flore": 76, "faune": 52 },
            { "name": "Coronpha", "radius": 45, "orbitRadius": 246, "orbitSpeed": 0.3043, "angle": 6.671, "flore": 55, "faune": 23 }
        ]}
      ]
    }
  ],
  "asteroidBelts": []
  },
  {
  "name": "Zetapha-Eriaxdis",
  "blackHole": {"x": 0, "y": 0, "radius": 300},
  "suns": [
    {"name": "Pyxalra", "radius": 185, "orbitRadius": 2460, "orbitSpeed": 0.0133, "angle": 23.382, "color": "#FF6B6B", "planets": [
      {"name": "Velazar", "radius": 77, "orbitRadius": 638, "orbitSpeed": 0.0601, "angle": 111.754, "flore": 58, "faune": 91, "moons": [
            {"name": "Velixis", "radius": 23, "orbitRadius": 163, "orbitSpeed": 0.2717, "angle": 487.353, "flore": 6, "faune": 11},
            {"name": "Pyximir", "radius": 47, "orbitRadius": 248, "orbitSpeed": 0.2589, "angle": 463.307, "flore": 42, "faune": 29},
            {"name": "Draanton", "radius": 27, "orbitRadius": 364, "orbitSpeed": 0.3317, "angle": 597.936, "flore": 18, "faune": 12}
        ]},
      {"name": "Omiumir", "radius": 108, "orbitRadius": 638, "orbitSpeed": 0.0601, "angle": 108.8, "flore": 12, "faune": 17, "moons": [
            {"name": "Zetirxis", "radius": 43, "orbitRadius": 187, "orbitSpeed": 0.2722, "angle": 488.941, "flore": 22, "faune": 4},
            {"name": "Lyrumpha", "radius": 40, "orbitRadius": 187, "orbitSpeed": 0.2722, "angle": 492.862, "flore": 15, "faune": 21},
            {"name": "Palunis", "radius": 53, "orbitRadius": 317, "orbitSpeed": 0.1664, "angle": 302.721, "flore": 46, "faune": 33}
        ]},
      {"name": "Zetaxbus", "radius": 72, "orbitRadius": 638, "orbitSpeed": 0.0601, "angle": 110.181, "flore": 92, "faune": 73, "moons": [
        ]},
      {"name": "Thalaxth", "radius": 75, "orbitRadius": 1369, "orbitSpeed": 0.0333, "angle": 59.108, "flore": 77, "faune": 17, "moons": [
            {"name": "Erialth", "radius": 28, "orbitRadius": 172, "orbitSpeed": 0.2565, "angle": 457.674, "flore": 48, "faune": 29},
            {"name": "Celosmir", "radius": 21, "orbitRadius": 321, "orbitSpeed": 0.3191, "angle": 563.429, "flore": 50, "faune": 10},
            {"name": "Xoronmus", "radius": 25, "orbitRadius": 321, "orbitSpeed": 0.3191, "angle": 565.97, "flore": 3, "faune": 59}
        ]},
      {"name": "Kryontis", "radius": 107, "orbitRadius": 1369, "orbitSpeed": 0.0333, "angle": 57.255, "flore": 0, "faune": 84, "moons": [
            {"name": "Coralmir", "radius": 42, "orbitRadius": 337, "orbitSpeed": 0.3206, "angle": 563.893, "flore": 5, "faune": 20},
            {"name": "Velimus", "radius": 49, "orbitRadius": 202, "orbitSpeed": 0.2624, "angle": 457.124, "flore": 3, "faune": 4},
            {"name": "Kryumria", "radius": 59, "orbitRadius": 337, "orbitSpeed": 0.3206, "angle": 560.562, "flore": 1, "faune": 47}
        ]},
      {"name": "Kryelbus", "radius": 101, "orbitRadius": 1369, "orbitSpeed": 0.0333, "angle": 61.631, "flore": 18, "faune": 75, "moons": [
            {"name": "Celaxxis", "radius": 30, "orbitRadius": 273, "orbitSpeed": 0.1936, "angle": 337.928, "flore": 45, "faune": 21},
            {"name": "Xoromir", "radius": 25, "orbitRadius": 273, "orbitSpeed": 0.1936, "angle": 342.123, "flore": 6, "faune": 12},
            {"name": "Zanaxdis", "radius": 29, "orbitRadius": 432, "orbitSpeed": 0.3179, "angle": 560.99, "flore": 3, "faune": 52},
            {"name": "Xoreton", "radius": 37, "orbitRadius": 432, "orbitSpeed": 0.3179, "angle": 556.53, "flore": 8, "faune": 43},
            {"name": "Xorismir", "radius": 51, "orbitRadius": 432, "orbitSpeed": 0.3179, "angle": 558.39, "flore": 19, "faune": 37}
        ]},
      {"name": "Zetuzar", "radius": 124, "orbitRadius": 1369, "orbitSpeed": 0.0333, "angle": 60.123, "flore": 89, "faune": 73, "moons": [
            {"name": "Kryisth", "radius": 55, "orbitRadius": 314, "orbitSpeed": 0.3474, "angle": 612.517, "flore": 21, "faune": 60},
            {"name": "Lyralnis", "radius": 44, "orbitRadius": 314, "orbitSpeed": 0.3474, "angle": 614.032, "flore": 5, "faune": 9},
            {"name": "Eriantis", "radius": 35, "orbitRadius": 438, "orbitSpeed": 0.2135, "angle": 379.841, "flore": 28, "faune": 46},
            {"name": "Lyraxlux", "radius": 47, "orbitRadius": 438, "orbitSpeed": 0.2135, "angle": 375.699, "flore": 36, "faune": 25},
            {"name": "Eriaxdon", "radius": 55, "orbitRadius": 438, "orbitSpeed": 0.2135, "angle": 377.524, "flore": 10, "faune": 46}
        ]}
    ]},
    {"name": "Pyximir", "radius": 212, "orbitRadius": 2460, "orbitSpeed": 0.0133, "angle": 20.763, "color": "#FFB830", "planets": [
      {"name": "Omiummus", "radius": 105, "orbitRadius": 604, "orbitSpeed": 0.0576, "angle": 98.475, "flore": 69, "faune": 16, "moons": [
            {"name": "Nebumbus", "radius": 32, "orbitRadius": 147, "orbitSpeed": 0.2196, "angle": 374.499, "flore": 20, "faune": 43},
            {"name": "Pyxendon", "radius": 20, "orbitRadius": 270, "orbitSpeed": 0.15, "angle": 255.179, "flore": 46, "faune": 26},
            {"name": "Corumus", "radius": 51, "orbitRadius": 270, "orbitSpeed": 0.15, "angle": 259.59, "flore": 16, "faune": 52},
            {"name": "Zetudis", "radius": 25, "orbitRadius": 270, "orbitSpeed": 0.15, "angle": 257.369, "flore": 3, "faune": 43}
        ]},
      {"name": "Eriiton", "radius": 80, "orbitRadius": 1250, "orbitSpeed": 0.0247, "angle": 39.569, "flore": 96, "faune": 88, "moons": [
            {"name": "Lyronpha", "radius": 37, "orbitRadius": 330, "orbitSpeed": 0.1538, "angle": 264.516, "flore": 38, "faune": 47},
            {"name": "Palaxth", "radius": 47, "orbitRadius": 228, "orbitSpeed": 0.263, "angle": 445.23, "flore": 8, "faune": 13},
            {"name": "Lyrendis", "radius": 50, "orbitRadius": 228, "orbitSpeed": 0.263, "angle": 447.387, "flore": 41, "faune": 7},
            {"name": "Velismir", "radius": 43, "orbitRadius": 330, "orbitSpeed": 0.1538, "angle": 263.165, "flore": 48, "faune": 54},
            {"name": "Corilux", "radius": 59, "orbitRadius": 330, "orbitSpeed": 0.1538, "angle": 260.86, "flore": 34, "faune": 10}
        ]},
      {"name": "Ithenzar", "radius": 74, "orbitRadius": 604, "orbitSpeed": 0.0576, "angle": 96.448, "flore": 29, "faune": 71, "moons": [
            {"name": "Synonnis", "radius": 47, "orbitRadius": 187, "orbitSpeed": 0.3131, "angle": 532.614, "flore": 13, "faune": 8},
            {"name": "Lyrummir", "radius": 38, "orbitRadius": 187, "orbitSpeed": 0.3131, "angle": 536.742, "flore": 5, "faune": 0},
            {"name": "Aurudis", "radius": 34, "orbitRadius": 318, "orbitSpeed": 0.1832, "angle": 315.862, "flore": 44, "faune": 43},
            {"name": "Celodis", "radius": 31, "orbitRadius": 318, "orbitSpeed": 0.1832, "angle": 312.243, "flore": 37, "faune": 40}
        ]},
      {"name": "Zetarpha", "radius": 84, "orbitRadius": 1250, "orbitSpeed": 0.0247, "angle": 43.765, "flore": 43, "faune": 51, "moons": [
            {"name": "Sigaxmir", "radius": 23, "orbitRadius": 334, "orbitSpeed": 0.1704, "angle": 277.412, "flore": 18, "faune": 48},
            {"name": "Palelnis", "radius": 45, "orbitRadius": 334, "orbitSpeed": 0.1704, "angle": 281.693, "flore": 16, "faune": 18},
            {"name": "Celonis", "radius": 25, "orbitRadius": 334, "orbitSpeed": 0.1704, "angle": 280.46, "flore": 37, "faune": 31},
            {"name": "Celirpha", "radius": 51, "orbitRadius": 187, "orbitSpeed": 0.2949, "angle": 482.681, "flore": 14, "faune": 33},
            {"name": "Siganbus", "radius": 54, "orbitRadius": 187, "orbitSpeed": 0.2949, "angle": 479.697, "flore": 30, "faune": 17}
        ]},
      {"name": "Lyraxton", "radius": 107, "orbitRadius": 1250, "orbitSpeed": 0.0247, "angle": 40.916, "flore": 91, "faune": 100, "moons": [
            {"name": "Voranxis", "radius": 27, "orbitRadius": 284, "orbitSpeed": 0.335, "angle": 551.068, "flore": 7, "faune": 21},
            {"name": "Omiosria", "radius": 30, "orbitRadius": 284, "orbitSpeed": 0.335, "angle": 549.155, "flore": 31, "faune": 29},
            {"name": "Thalelzar", "radius": 27, "orbitRadius": 284, "orbitSpeed": 0.335, "angle": 553.814, "flore": 37, "faune": 27},
            {"name": "Palendis", "radius": 55, "orbitRadius": 198, "orbitSpeed": 0.1893, "angle": 312.737, "flore": 14, "faune": 28},
            {"name": "Vorirzar", "radius": 44, "orbitRadius": 518, "orbitSpeed": 0.2137, "angle": 349.918, "flore": 3, "faune": 58},
            {"name": "Vorobus", "radius": 53, "orbitRadius": 518, "orbitSpeed": 0.2137, "angle": 353.689, "flore": 21, "faune": 30}
        ]}
    ]},
    {"name": "Lyraxbus", "radius": 165, "orbitRadius": 2460, "orbitSpeed": 0.0133, "angle": 19.134, "color": "#FFB830", "planets": [
      {"name": "Kryontis", "radius": 75, "orbitRadius": 552, "orbitSpeed": 0.0483, "angle": 75.698, "flore": 97, "faune": 0, "moons": [
            {"name": "Xorumus", "radius": 48, "orbitRadius": 169, "orbitSpeed": 0.3303, "angle": 529.755, "flore": 22, "faune": 31},
            {"name": "Aurirdis", "radius": 28, "orbitRadius": 169, "orbitSpeed": 0.3303, "angle": 525.278, "flore": 17, "faune": 67},
            {"name": "Auraldon", "radius": 42, "orbitRadius": 277, "orbitSpeed": 0.1948, "angle": 311.884, "flore": 67, "faune": 61},
            {"name": "Omialria", "radius": 20, "orbitRadius": 277, "orbitSpeed": 0.1948, "angle": 309.593, "flore": 64, "faune": 39}
        ]},
      {"name": "Celelbus", "radius": 125, "orbitRadius": 552, "orbitSpeed": 0.0483, "angle": 78.098, "flore": 35, "faune": 88, "moons": [
            {"name": "Paludis", "radius": 44, "orbitRadius": 323, "orbitSpeed": 0.307, "angle": 494.443, "flore": 65, "faune": 15},
            {"name": "Draelxis", "radius": 50, "orbitRadius": 221, "orbitSpeed": 0.3106, "angle": 495.808, "flore": 44, "faune": 15},
            {"name": "Omiosria", "radius": 40, "orbitRadius": 221, "orbitSpeed": 0.3106, "angle": 497.982, "flore": 53, "faune": 8}
        ]},
      {"name": "Xoropha", "radius": 122, "orbitRadius": 1134, "orbitSpeed": 0.0381, "angle": 57.291, "flore": 33, "faune": 47, "moons": [
            {"name": "Omiondon", "radius": 45, "orbitRadius": 344, "orbitSpeed": 0.3129, "angle": 481.387, "flore": 25, "faune": 55},
            {"name": "Draeldon", "radius": 35, "orbitRadius": 344, "orbitSpeed": 0.3129, "angle": 480.436, "flore": 46, "faune": 12},
            {"name": "Palendon", "radius": 34, "orbitRadius": 344, "orbitSpeed": 0.3129, "angle": 484.806, "flore": 21, "faune": 35},
            {"name": "Celondis", "radius": 48, "orbitRadius": 236, "orbitSpeed": 0.3008, "angle": 465.825, "flore": 11, "faune": 70},
            {"name": "Kryamus", "radius": 53, "orbitRadius": 236, "orbitSpeed": 0.3008, "angle": 463.709, "flore": 58, "faune": 22}
        ]},
      {"name": "Zetadis", "radius": 112, "orbitRadius": 1134, "orbitSpeed": 0.0381, "angle": 61.437, "flore": 25, "faune": 54, "moons": [
            {"name": "Eriaxdon", "radius": 38, "orbitRadius": 247, "orbitSpeed": 0.2374, "angle": 362.675, "flore": 42, "faune": 69}
        ]},
      {"name": "Ithirpha", "radius": 72, "orbitRadius": 1134, "orbitSpeed": 0.0381, "angle": 58.45, "flore": 122, "faune": 120, "moons": [
            {"name": "Sigodon", "radius": 53, "orbitRadius": 195, "orbitSpeed": 0.1743, "angle": 277.263, "flore": 18, "faune": 16},
            {"name": "Velabus", "radius": 36, "orbitRadius": 195, "orbitSpeed": 0.1743, "angle": 272.77, "flore": 22, "faune": 35},
            {"name": "Omiipha", "radius": 39, "orbitRadius": 195, "orbitSpeed": 0.1743, "angle": 268.61, "flore": 39, "faune": 8},
            {"name": "Celelux", "radius": 23, "orbitRadius": 333, "orbitSpeed": 0.1794, "angle": 275.842, "flore": 33, "faune": 66},
            {"name": "Corirbus", "radius": 40, "orbitRadius": 333, "orbitSpeed": 0.1794, "angle": 280.898, "flore": 21, "faune": 15}
        ]}
    ]},
    {"name": "Vorelbus", "radius": 196, "orbitRadius": 7072, "orbitSpeed": 0.0049, "angle": 4.307, "color": "#7CB9FF", "planets": [
      {"name": "Zetanvyn", "radius": 116, "orbitRadius": 682, "orbitSpeed": 0.0584, "angle": 86.879, "flore": 33, "faune": 10, "moons": [
            {"name": "Xorath", "radius": 39, "orbitRadius": 235, "orbitSpeed": 0.3476, "angle": 512.417, "flore": 3, "faune": 35},
            {"name": "Sigummus", "radius": 32, "orbitRadius": 341, "orbitSpeed": 0.3381, "angle": 502.869, "flore": 33, "faune": 54},
            {"name": "Coraltis", "radius": 48, "orbitRadius": 341, "orbitSpeed": 0.3381, "angle": 501.399, "flore": 6, "faune": 24},
            {"name": "Eriondis", "radius": 31, "orbitRadius": 341, "orbitSpeed": 0.3381, "angle": 499.853, "flore": 22, "faune": 34},
            {"name": "Synenpha", "radius": 31, "orbitRadius": 235, "orbitSpeed": 0.3476, "angle": 514.474, "flore": 18, "faune": 51}
        ]},
      {"name": "Thaliria", "radius": 89, "orbitRadius": 682, "orbitSpeed": 0.0584, "angle": 90.105, "flore": 13, "faune": 78, "moons": [
            {"name": "Celalpha", "radius": 59, "orbitRadius": 227, "orbitSpeed": 0.1611, "angle": 239.658, "flore": 1, "faune": 11},
            {"name": "Draantis", "radius": 45, "orbitRadius": 421, "orbitSpeed": 0.1691, "angle": 244.393, "flore": 22, "faune": 54},
            {"name": "Synaxpha", "radius": 25, "orbitRadius": 421, "orbitSpeed": 0.1691, "angle": 249.295, "flore": 15, "faune": 9},
            {"name": "Celaldis", "radius": 44, "orbitRadius": 421, "orbitSpeed": 0.1691, "angle": 247.295, "flore": 11, "faune": 11},
            {"name": "Vorarnis", "radius": 59, "orbitRadius": 421, "orbitSpeed": 0.1691, "angle": 246.201, "flore": 13, "faune": 5},
            {"name": "Synarton", "radius": 37, "orbitRadius": 227, "orbitSpeed": 0.1611, "angle": 237.105, "flore": 10, "faune": 52}
        ]},
      {"name": "Pyxelnis", "radius": 123, "orbitRadius": 1733, "orbitSpeed": 0.0224, "angle": 33.145, "flore": 51, "faune": 73, "moons": [
            {"name": "Corenmir", "radius": 48, "orbitRadius": 461, "orbitSpeed": 0.2579, "angle": 365.831, "flore": 1, "faune": 40}
        ]},
      {"name": "Aurenis", "radius": 90, "orbitRadius": 1733, "orbitSpeed": 0.0224, "angle": 30.637, "flore": 24, "faune": 93, "moons": [
            {"name": "Celomir", "radius": 33, "orbitRadius": 294, "orbitSpeed": 0.2938, "angle": 428.352, "flore": 23, "faune": 44},
            {"name": "Zetath", "radius": 36, "orbitRadius": 294, "orbitSpeed": 0.2938, "angle": 425.989, "flore": 29, "faune": 46},
            {"name": "Lyrobus", "radius": 57, "orbitRadius": 294, "orbitSpeed": 0.2938, "angle": 425.238, "flore": 15, "faune": 13},
            {"name": "Corenmus", "radius": 48, "orbitRadius": 614, "orbitSpeed": 0.3438, "angle": 499.163, "flore": 9, "faune": 51},
            {"name": "Vorudon", "radius": 55, "orbitRadius": 614, "orbitSpeed": 0.3438, "angle": 494.826, "flore": 1, "faune": 41},
            {"name": "Kryellux", "radius": 29, "orbitRadius": 614, "orbitSpeed": 0.3438, "angle": 496.692, "flore": 21, "faune": 17}
        ]},
      {"name": "Corevyn", "radius": 101, "orbitRadius": 1733, "orbitSpeed": 0.0224, "angle": 35.201, "flore": 33, "faune": 6, "moons": [
            {"name": "Kryabus", "radius": 49, "orbitRadius": 209, "orbitSpeed": 0.3012, "angle": 430.411, "flore": 6, "faune": 0},
            {"name": "Draelzar", "radius": 27, "orbitRadius": 209, "orbitSpeed": 0.3012, "angle": 435.214, "flore": 34, "faune": 1},
            {"name": "Zetirria", "radius": 29, "orbitRadius": 209, "orbitSpeed": 0.3012, "angle": 433.634, "flore": 28, "faune": 19},
            {"name": "Pyxarth", "radius": 42, "orbitRadius": 473, "orbitSpeed": 0.3081, "angle": 444.519, "flore": 26, "faune": 8},
            {"name": "Lyropha", "radius": 50, "orbitRadius": 473, "orbitSpeed": 0.3081, "angle": 442.254, "flore": 33, "faune": 20},
            {"name": "Thalalzar", "radius": 60, "orbitRadius": 473, "orbitSpeed": 0.3081, "angle": 441.33, "flore": 23, "faune": 11}
        ]},
      {"name": "Palandon", "radius": 85, "orbitRadius": 1733, "orbitSpeed": 0.0224, "angle": 31.71, "flore": 7, "faune": 73, "moons": [
            {"name": "Synuth", "radius": 28, "orbitRadius": 191, "orbitSpeed": 0.1884, "angle": 264.715, "flore": 1, "faune": 46},
            {"name": "Eriumton", "radius": 57, "orbitRadius": 191, "orbitSpeed": 0.1884, "angle": 269.256, "flore": 22, "faune": 30},
            {"name": "Lyraxria", "radius": 51, "orbitRadius": 430, "orbitSpeed": 0.238, "angle": 339.674, "flore": 24, "faune": 10}
        ]},
      {"name": "Voreldon", "radius": 81, "orbitRadius": 682, "orbitSpeed": 0.0584, "angle": 82.289, "flore": 13, "faune": 45, "moons": [
        ]}
    ]},
    {"name": "Celisria", "radius": 223, "orbitRadius": 7072, "orbitSpeed": 0.0049, "angle": 9.634, "color": "#FF6B6B", "planets": [
      {"name": "Kryarth", "radius": 96, "orbitRadius": 907, "orbitSpeed": 0.04, "angle": 54.843, "flore": 8, "faune": 57, "moons": [
            {"name": "Erieria", "radius": 48, "orbitRadius": 240, "orbitSpeed": 0.2807, "angle": 383.922, "flore": 0, "faune": 61},
            {"name": "Kryonmir", "radius": 31, "orbitRadius": 240, "orbitSpeed": 0.2807, "angle": 382.48, "flore": 44, "faune": 58},
            {"name": "Synaxton", "radius": 42, "orbitRadius": 427, "orbitSpeed": 0.1803, "angle": 244.673, "flore": 3, "faune": 22},
            {"name": "Celumria", "radius": 27, "orbitRadius": 427, "orbitSpeed": 0.1803, "angle": 249.574, "flore": 16, "faune": 48},
            {"name": "Thalisdon", "radius": 40, "orbitRadius": 427, "orbitSpeed": 0.1803, "angle": 248.009, "flore": 19, "faune": 20}
        ]},
      {"name": "Ithirdis", "radius": 106, "orbitRadius": 1650, "orbitSpeed": 0.0227, "angle": 29.255, "flore": 34, "faune": 86, "moons": [
            {"name": "Velardis", "radius": 60, "orbitRadius": 229, "orbitSpeed": 0.2498, "angle": 338.724, "flore": 43, "faune": 12},
            {"name": "Draelux", "radius": 52, "orbitRadius": 229, "orbitSpeed": 0.2498, "angle": 333.711, "flore": 1, "faune": 23},
            {"name": "Aurumvyn", "radius": 32, "orbitRadius": 314, "orbitSpeed": 0.1715, "angle": 230.281, "flore": 5, "faune": 7}
        ]},
      {"name": "Sigonxis", "radius": 118, "orbitRadius": 1650, "orbitSpeed": 0.0227, "angle": 31.784, "flore": 93, "faune": 68, "moons": [
            {"name": "Nebirton", "radius": 46, "orbitRadius": 256, "orbitSpeed": 0.1519, "angle": 207.261, "flore": 24, "faune": 18},
            {"name": "Sigannis", "radius": 34, "orbitRadius": 256, "orbitSpeed": 0.1519, "angle": 212.008, "flore": 10, "faune": 22},
            {"name": "Eriistis", "radius": 42, "orbitRadius": 256, "orbitSpeed": 0.1519, "angle": 209.309, "flore": 17, "faune": 3},
            {"name": "Omiismus", "radius": 26, "orbitRadius": 412, "orbitSpeed": 0.298, "angle": 409.631, "flore": 1, "faune": 14},
            {"name": "Vorendis", "radius": 35, "orbitRadius": 412, "orbitSpeed": 0.298, "angle": 407.243, "flore": 40, "faune": 31}
        ]},
      {"name": "Voranth", "radius": 110, "orbitRadius": 907, "orbitSpeed": 0.04, "angle": 58.401, "flore": 65, "faune": 38, "moons": [
            {"name": "Zanosmir", "radius": 27, "orbitRadius": 352, "orbitSpeed": 0.2529, "angle": 344.346, "flore": 39, "faune": 41},
            {"name": "Lyranmus", "radius": 47, "orbitRadius": 209, "orbitSpeed": 0.2669, "angle": 364.682, "flore": 31, "faune": 32},
            {"name": "Voronpha", "radius": 38, "orbitRadius": 352, "orbitSpeed": 0.2529, "angle": 346.653, "flore": 50, "faune": 15},
            {"name": "Ithimus", "radius": 34, "orbitRadius": 352, "orbitSpeed": 0.2529, "angle": 341.798, "flore": 32, "faune": 45},
            {"name": "Kryirth", "radius": 44, "orbitRadius": 209, "orbitSpeed": 0.2669, "angle": 360.45, "flore": 15, "faune": 41}
        ]},
      {"name": "Zetaxzar", "radius": 81, "orbitRadius": 1650, "orbitSpeed": 0.0227, "angle": 33.588, "flore": 40, "faune": 33, "moons": [
            {"name": "Lyrarmir", "radius": 40, "orbitRadius": 426, "orbitSpeed": 0.1994, "angle": 268.238, "flore": 32, "faune": 37},
            {"name": "Palosria", "radius": 55, "orbitRadius": 298, "orbitSpeed": 0.1506, "angle": 204.381, "flore": 49, "faune": 53},
            {"name": "Zetadon", "radius": 38, "orbitRadius": 298, "orbitSpeed": 0.1506, "angle": 202.866, "flore": 29, "faune": 4},
            {"name": "Zetoston", "radius": 60, "orbitRadius": 426, "orbitSpeed": 0.1994, "angle": 271.765, "flore": 40, "faune": 54}
        ]}
    ]},
    {"name": "Omieria", "radius": 238, "orbitRadius": 7072, "orbitSpeed": 0.0049, "angle": 8.845, "color": "#FF6B6B", "planets": [
      {"name": "Kryaxth", "radius": 121, "orbitRadius": 954, "orbitSpeed": 0.0282, "angle": 36.48, "flore": 12, "faune": 60, "moons": [
            {"name": "Omiedis", "radius": 46, "orbitRadius": 248, "orbitSpeed": 0.2617, "angle": 340.777, "flore": 2, "faune": 36},
            {"name": "Zetumxis", "radius": 54, "orbitRadius": 478, "orbitSpeed": 0.2161, "angle": 280.857, "flore": 14, "faune": 33},
            {"name": "Sigulux", "radius": 28, "orbitRadius": 478, "orbitSpeed": 0.2161, "angle": 285.697, "flore": 7, "faune": 52},
            {"name": "Velantis", "radius": 20, "orbitRadius": 478, "orbitSpeed": 0.2161, "angle": 283.773, "flore": 12, "faune": 56},
            {"name": "Velith", "radius": 41, "orbitRadius": 248, "orbitSpeed": 0.2617, "angle": 344.713, "flore": 22, "faune": 12}
        ]},
      {"name": "Nebirdis", "radius": 112, "orbitRadius": 1539, "orbitSpeed": 0.0222, "angle": 32.358, "flore": 35, "faune": 52, "moons": [
            {"name": "Celuxis", "radius": 26, "orbitRadius": 250, "orbitSpeed": 0.1847, "angle": 237.362, "flore": 12, "faune": 36},
            {"name": "Sigelvyn", "radius": 54, "orbitRadius": 577, "orbitSpeed": 0.2374, "angle": 305.845, "flore": 26, "faune": 48},
            {"name": "Palonmus", "radius": 21, "orbitRadius": 577, "orbitSpeed": 0.2374, "angle": 305.325, "flore": 24, "faune": 54},
            {"name": "Palisvyn", "radius": 45, "orbitRadius": 577, "orbitSpeed": 0.2374, "angle": 310.117, "flore": 7, "faune": 16},
            {"name": "Celalzar", "radius": 54, "orbitRadius": 577, "orbitSpeed": 0.2374, "angle": 308.204, "flore": 15, "faune": 57},
            {"name": "Itharvyn", "radius": 29, "orbitRadius": 250, "orbitSpeed": 0.1847, "angle": 240.993, "flore": 9, "faune": 12},
            {"name": "Kryomus", "radius": 32, "orbitRadius": 430, "orbitSpeed": 0.1929, "angle": 251.354, "flore": 20, "faune": 1},
            {"name": "Zanendis", "radius": 35, "orbitRadius": 430, "orbitSpeed": 0.1929, "angle": 249.568, "flore": 8, "faune": 46}
        ]},
      {"name": "Omiadis", "radius": 126, "orbitRadius": 1539, "orbitSpeed": 0.0222, "angle": 30.121, "flore": 2, "faune": 78, "moons": [
            {"name": "Vorirdis", "radius": 47, "orbitRadius": 196, "orbitSpeed": 0.292, "angle": 380.045, "flore": 21, "faune": 56},
            {"name": "Zanenpha", "radius": 48, "orbitRadius": 386, "orbitSpeed": 0.2713, "angle": 351.778, "flore": 25, "faune": 32},
            {"name": "Lyrisria", "radius": 51, "orbitRadius": 386, "orbitSpeed": 0.2713, "angle": 353.047, "flore": 6, "faune": 23},
            {"name": "Palalpha", "radius": 31, "orbitRadius": 386, "orbitSpeed": 0.2713, "angle": 356.607, "flore": 5, "faune": 40},
            {"name": "Drainis", "radius": 55, "orbitRadius": 196, "orbitSpeed": 0.292, "angle": 378.007, "flore": 16, "faune": 14}
        ]},
      {"name": "Omiirzar", "radius": 126, "orbitRadius": 2443, "orbitSpeed": 0.0236, "angle": 29.518, "flore": 42, "faune": 21, "moons": [
        ]},
      {"name": "Pyxummus", "radius": 112, "orbitRadius": 2443, "orbitSpeed": 0.0236, "angle": 32.947, "flore": 12, "faune": 35, "moons": [
            {"name": "Zetovyn", "radius": 40, "orbitRadius": 370, "orbitSpeed": 0.2949, "angle": 372.827, "flore": 12, "faune": 50},
            {"name": "Velonxis", "radius": 54, "orbitRadius": 228, "orbitSpeed": 0.223, "angle": 283.414, "flore": 1, "faune": 39},
            {"name": "Synopha", "radius": 44, "orbitRadius": 370, "orbitSpeed": 0.2949, "angle": 375.661, "flore": 6, "faune": 20},
            {"name": "Thalubus", "radius": 34, "orbitRadius": 370, "orbitSpeed": 0.2949, "angle": 371.257, "flore": 14, "faune": 8}
        ]},
      {"name": "Vorelzar", "radius": 96, "orbitRadius": 2443, "orbitSpeed": 0.0236, "angle": 30.905, "flore": 41, "faune": 0, "moons": [
            {"name": "Zanirnis", "radius": 31, "orbitRadius": 415, "orbitSpeed": 0.2256, "angle": 281.37, "flore": 25, "faune": 41},
            {"name": "Zetaxvyn", "radius": 45, "orbitRadius": 286, "orbitSpeed": 0.255, "angle": 316.988, "flore": 25, "faune": 31},
            {"name": "Pyxumra", "radius": 56, "orbitRadius": 415, "orbitSpeed": 0.2256, "angle": 285.461, "flore": 21, "faune": 3}
        ]},
      {"name": "Pyximus", "radius": 100, "orbitRadius": 2443, "orbitSpeed": 0.0236, "angle": 28.294, "flore": 30, "faune": 36, "moons": [
            {"name": "Vorirmir", "radius": 41, "orbitRadius": 190, "orbitSpeed": 0.2856, "angle": 357.263, "flore": 26, "faune": 13}
        ]}
    ]},
    {"name": "Pyxoria", "radius": 214, "orbitRadius": 7072, "orbitSpeed": 0.0049, "angle": 5.73, "color": "#7CB9FF", "planets": [
      {"name": "Pyxaxxis", "radius": 126, "orbitRadius": 728, "orbitSpeed": 0.0347, "angle": 40.773, "flore": 6, "faune": 55, "moons": [
            {"name": "Ithanth", "radius": 33, "orbitRadius": 194, "orbitSpeed": 0.239, "angle": 290.703, "flore": 4, "faune": 19},
            {"name": "Xorenmir", "radius": 49, "orbitRadius": 339, "orbitSpeed": 0.2055, "angle": 244.673, "flore": 39, "faune": 5},
            {"name": "Zanummir", "radius": 26, "orbitRadius": 194, "orbitSpeed": 0.239, "angle": 285.707, "flore": 50, "faune": 31},
            {"name": "Ithenxis", "radius": 33, "orbitRadius": 339, "orbitSpeed": 0.2055, "angle": 247.609, "flore": 29, "faune": 52},
            {"name": "Pyximir", "radius": 53, "orbitRadius": 339, "orbitSpeed": 0.2055, "angle": 249.053, "flore": 49, "faune": 13}
        ]},
      {"name": "Sigaxlux", "radius": 78, "orbitRadius": 1262, "orbitSpeed": 0.0285, "angle": 31.887, "flore": 78, "faune": 67, "moons": [
            {"name": "Velalpha", "radius": 30, "orbitRadius": 142, "orbitSpeed": 0.1904, "angle": 224.156, "flore": 25, "faune": 15},
            {"name": "Celelzar", "radius": 43, "orbitRadius": 238, "orbitSpeed": 0.2471, "angle": 291.983, "flore": 11, "faune": 48}
        ]},
      {"name": "Corirton", "radius": 71, "orbitRadius": 1262, "orbitSpeed": 0.0285, "angle": 32.845, "flore": 88, "faune": 81, "moons": [
            {"name": "Thaleltis", "radius": 38, "orbitRadius": 193, "orbitSpeed": 0.2363, "angle": 279.738, "flore": 23, "faune": 13},
            {"name": "Zetosvyn", "radius": 45, "orbitRadius": 193, "orbitSpeed": 0.2363, "angle": 281.235, "flore": 50, "faune": 44},
            {"name": "Zanaxtis", "radius": 52, "orbitRadius": 367, "orbitSpeed": 0.3, "angle": 356.189, "flore": 37, "faune": 5},
            {"name": "Pyxoth", "radius": 36, "orbitRadius": 367, "orbitSpeed": 0.3, "angle": 360.883, "flore": 4, "faune": 52},
            {"name": "Kryondon", "radius": 42, "orbitRadius": 367, "orbitSpeed": 0.3, "angle": 358.498, "flore": 26, "faune": 18}
        ]},
      {"name": "Omiisdon", "radius": 72, "orbitRadius": 728, "orbitSpeed": 0.0347, "angle": 43.169, "flore": 36, "faune": 78, "moons": [
            {"name": "Celumxis", "radius": 30, "orbitRadius": 252, "orbitSpeed": 0.1915, "angle": 229.266, "flore": 37, "faune": 42},
            {"name": "Xoraxtis", "radius": 37, "orbitRadius": 252, "orbitSpeed": 0.1915, "angle": 231.097, "flore": 14, "faune": 15},
            {"name": "Synalux", "radius": 46, "orbitRadius": 252, "orbitSpeed": 0.1915, "angle": 233.761, "flore": 37, "faune": 42},
            {"name": "Voronbus", "radius": 49, "orbitRadius": 430, "orbitSpeed": 0.2461, "angle": 299.988, "flore": 30, "faune": 50},
            {"name": "Omialtis", "radius": 53, "orbitRadius": 430, "orbitSpeed": 0.2461, "angle": 295.73, "flore": 31, "faune": 39}
        ]},
      {"name": "Lyrismus", "radius": 93, "orbitRadius": 1924, "orbitSpeed": 0.0173, "angle": 23.69, "flore": 47, "faune": 15, "moons": [
            {"name": "Ithalpha", "radius": 36, "orbitRadius": 253, "orbitSpeed": 0.3056, "angle": 361.245, "flore": 44, "faune": 9},
            {"name": "Sigendis", "radius": 20, "orbitRadius": 372, "orbitSpeed": 0.2345, "angle": 278.048, "flore": 17, "faune": 2},
            {"name": "Sigumus", "radius": 29, "orbitRadius": 253, "orbitSpeed": 0.3056, "angle": 362.652, "flore": 17, "faune": 55},
            {"name": "Auralth", "radius": 40, "orbitRadius": 253, "orbitSpeed": 0.3056, "angle": 364.298, "flore": 37, "faune": 55},
            {"name": "Auroslux", "radius": 56, "orbitRadius": 372, "orbitSpeed": 0.2345, "angle": 279.505, "flore": 34, "faune": 24}
        ]},
      {"name": "Nebavyn", "radius": 93, "orbitRadius": 1924, "orbitSpeed": 0.0173, "angle": 20.55, "flore": 45, "faune": 35, "moons": [
            {"name": "Synalmus", "radius": 59, "orbitRadius": 264, "orbitSpeed": 0.2951, "angle": 343.725, "flore": 46, "faune": 48},
            {"name": "Omielth", "radius": 42, "orbitRadius": 264, "orbitSpeed": 0.2951, "angle": 347.37, "flore": 2, "faune": 36},
            {"name": "Xorendon", "radius": 25, "orbitRadius": 450, "orbitSpeed": 0.3123, "angle": 365.937, "flore": 30, "faune": 50}
        ]}
    ]},
    {"name": "Thalumbus", "radius": 156, "orbitRadius": 7072, "orbitSpeed": 0.0049, "angle": 7.678, "color": "#FF6B6B", "planets": [
      {"name": "Sigisnis", "radius": 113, "orbitRadius": 684, "orbitSpeed": 0.0386, "angle": 41.411, "flore": 16, "faune": 13, "moons": [
            {"name": "Omiiston", "radius": 44, "orbitRadius": 249, "orbitSpeed": 0.3099, "angle": 347.696, "flore": 34, "faune": 18},
            {"name": "Omiislux", "radius": 20, "orbitRadius": 249, "orbitSpeed": 0.3099, "angle": 342.699, "flore": 50, "faune": 44},
            {"name": "Corexis", "radius": 39, "orbitRadius": 249, "orbitSpeed": 0.3099, "angle": 344.569, "flore": 20, "faune": 68}
        ]},
      {"name": "Voraxton", "radius": 112, "orbitRadius": 1147, "orbitSpeed": 0.0391, "angle": 44.585, "flore": 8, "faune": 20, "moons": [
            {"name": "Ithabus", "radius": 48, "orbitRadius": 203, "orbitSpeed": 0.1971, "angle": 219.799, "flore": 37, "faune": 69},
            {"name": "Sigisra", "radius": 44, "orbitRadius": 422, "orbitSpeed": 0.2277, "angle": 255.066, "flore": 50, "faune": 9},
            {"name": "Celunis", "radius": 55, "orbitRadius": 203, "orbitSpeed": 0.1971, "angle": 221.5, "flore": 16, "faune": 59},
            {"name": "Velezar", "radius": 45, "orbitRadius": 422, "orbitSpeed": 0.2277, "angle": 257.094, "flore": 19, "faune": 54}
        ]},
      {"name": "Nebobus", "radius": 74, "orbitRadius": 684, "orbitSpeed": 0.0386, "angle": 45.571, "flore": 92, "faune": 89, "moons": [
            {"name": "Thalelux", "radius": 22, "orbitRadius": 135, "orbitSpeed": 0.2743, "angle": 305.524, "flore": 48, "faune": 62},
            {"name": "Thalenpha", "radius": 29, "orbitRadius": 211, "orbitSpeed": 0.3182, "angle": 354.779, "flore": 28, "faune": 30},
            {"name": "Drairia", "radius": 53, "orbitRadius": 211, "orbitSpeed": 0.3182, "angle": 351.654, "flore": 42, "faune": 63}
        ]},
      {"name": "Xoraxxis", "radius": 100, "orbitRadius": 1919, "orbitSpeed": 0.0273, "angle": 29.897, "flore": 53, "faune": 23, "moons": [
            {"name": "Xoronpha", "radius": 20, "orbitRadius": 435, "orbitSpeed": 0.1596, "angle": 171.332, "flore": 14, "faune": 1},
            {"name": "Thalonmus", "radius": 37, "orbitRadius": 237, "orbitSpeed": 0.3474, "angle": 374.483, "flore": 33, "faune": 39},
            {"name": "Sigomir", "radius": 23, "orbitRadius": 237, "orbitSpeed": 0.3474, "angle": 378.766, "flore": 35, "faune": 10},
            {"name": "Drairth", "radius": 23, "orbitRadius": 435, "orbitSpeed": 0.1596, "angle": 174.312, "flore": 17, "faune": 28},
            {"name": "Palaxpha", "radius": 47, "orbitRadius": 435, "orbitSpeed": 0.1596, "angle": 173.04, "flore": 6, "faune": 6}
        ]},
      {"name": "Xorarria", "radius": 71, "orbitRadius": 1919, "orbitSpeed": 0.0273, "angle": 28.039, "flore": 88, "faune": 31, "moons": [
            {"name": "Voruria", "radius": 30, "orbitRadius": 231, "orbitSpeed": 0.1946, "angle": 211.574, "flore": 12, "faune": 8},
            {"name": "Zanodis", "radius": 46, "orbitRadius": 231, "orbitSpeed": 0.1946, "angle": 209.873, "flore": 7, "faune": 23}
        ]},
      {"name": "Celalth", "radius": 70, "orbitRadius": 1919, "orbitSpeed": 0.0273, "angle": 33.009, "flore": 13, "faune": 78, "moons": [
            {"name": "Synetis", "radius": 51, "orbitRadius": 463, "orbitSpeed": 0.1513, "angle": 163.551, "flore": 4, "faune": 59},
            {"name": "Kryelpha", "radius": 46, "orbitRadius": 309, "orbitSpeed": 0.2043, "angle": 220.553, "flore": 51, "faune": 18},
            {"name": "Corarbus", "radius": 39, "orbitRadius": 151, "orbitSpeed": 0.2417, "angle": 261.309, "flore": 47, "faune": 26},
            {"name": "Draumzar", "radius": 59, "orbitRadius": 151, "orbitSpeed": 0.2417, "angle": 263.299, "flore": 21, "faune": 1}
        ]}
    ]},
    {"name": "Thalosria", "radius": 212, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 5.767, "color": "#FF8C42", "planets": [
      {"name": "Synobus", "radius": 121, "orbitRadius": 746, "orbitSpeed": 0.0479, "angle": 36.627, "flore": 70, "faune": 79, "moons": [
            {"name": "Nebaxxis", "radius": 42, "orbitRadius": 199, "orbitSpeed": 0.3027, "angle": 229.724, "flore": 44, "faune": 8},
            {"name": "Eriandis", "radius": 42, "orbitRadius": 345, "orbitSpeed": 0.3376, "angle": 257.012, "flore": 38, "faune": 59},
            {"name": "Xorimus", "radius": 21, "orbitRadius": 199, "orbitSpeed": 0.3027, "angle": 231.825, "flore": 44, "faune": 25},
            {"name": "Sigonvyn", "radius": 53, "orbitRadius": 345, "orbitSpeed": 0.3376, "angle": 259.274, "flore": 4, "faune": 39}
        ]},
      {"name": "Xorilux", "radius": 79, "orbitRadius": 1539, "orbitSpeed": 0.0298, "angle": 21.117, "flore": 53, "faune": 98, "moons": [
            {"name": "Palonria", "radius": 21, "orbitRadius": 231, "orbitSpeed": 0.1988, "angle": 146.233, "flore": 29, "faune": 9},
            {"name": "Omiuria", "radius": 30, "orbitRadius": 231, "orbitSpeed": 0.1988, "angle": 147.856, "flore": 8, "faune": 6},
            {"name": "Xorirria", "radius": 38, "orbitRadius": 147, "orbitSpeed": 0.2761, "angle": 205.333, "flore": 41, "faune": 9},
            {"name": "Zanelpha", "radius": 46, "orbitRadius": 147, "orbitSpeed": 0.2761, "angle": 207.602, "flore": 37, "faune": 29}
        ]},
      {"name": "Zanennis", "radius": 127, "orbitRadius": 1539, "orbitSpeed": 0.0298, "angle": 22.363, "flore": 71, "faune": 64, "moons": [
            {"name": "Omiirbus", "radius": 39, "orbitRadius": 365, "orbitSpeed": 0.2033, "angle": 152.516, "flore": 21, "faune": 49},
            {"name": "Kryonra", "radius": 48, "orbitRadius": 232, "orbitSpeed": 0.2184, "angle": 163.375, "flore": 16, "faune": 9},
            {"name": "Zetalria", "radius": 57, "orbitRadius": 232, "orbitSpeed": 0.2184, "angle": 164.855, "flore": 22, "faune": 52},
            {"name": "Zetostis", "radius": 41, "orbitRadius": 232, "orbitSpeed": 0.2184, "angle": 167.154, "flore": 14, "faune": 14},
            {"name": "Celunis", "radius": 43, "orbitRadius": 365, "orbitSpeed": 0.2033, "angle": 156.426, "flore": 12, "faune": 36}
        ]},
      {"name": "Celumdon", "radius": 109, "orbitRadius": 746, "orbitSpeed": 0.0479, "angle": 34.736, "flore": 9, "faune": 2, "moons": [
            {"name": "Nebelmir", "radius": 50, "orbitRadius": 255, "orbitSpeed": 0.2572, "angle": 193.478, "flore": 18, "faune": 3},
            {"name": "Sigondis", "radius": 31, "orbitRadius": 255, "orbitSpeed": 0.2572, "angle": 195.099, "flore": 29, "faune": 46},
            {"name": "Sigelbus", "radius": 36, "orbitRadius": 357, "orbitSpeed": 0.3078, "angle": 235.062, "flore": 50, "faune": 1},
            {"name": "Pyxelbus", "radius": 38, "orbitRadius": 357, "orbitSpeed": 0.3078, "angle": 233.762, "flore": 40, "faune": 50},
            {"name": "Aurodon", "radius": 47, "orbitRadius": 357, "orbitSpeed": 0.3078, "angle": 230.754, "flore": 32, "faune": 57}
        ]},
      {"name": "Synuvyn", "radius": 85, "orbitRadius": 1539, "orbitSpeed": 0.0298, "angle": 25.178, "flore": 55, "faune": 2, "moons": [
            {"name": "Corospha", "radius": 41, "orbitRadius": 217, "orbitSpeed": 0.2591, "angle": 198.867, "flore": 2, "faune": 52},
            {"name": "Zananzar", "radius": 54, "orbitRadius": 217, "orbitSpeed": 0.2591, "angle": 200.96, "flore": 9, "faune": 39},
            {"name": "Xorirria", "radius": 52, "orbitRadius": 367, "orbitSpeed": 0.2567, "angle": 197.27, "flore": 16, "faune": 57},
            {"name": "Xorirnis", "radius": 58, "orbitRadius": 367, "orbitSpeed": 0.2567, "angle": 194.967, "flore": 4, "faune": 51}
        ]}
    ]},
    {"name": "Velath", "radius": 155, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 6.336, "color": "#7CB9FF", "planets": [
      {"name": "Ithazar", "radius": 109, "orbitRadius": 631, "orbitSpeed": 0.0489, "angle": 34.738, "flore": 82, "faune": 81, "moons": [
            {"name": "Lyrislux", "radius": 56, "orbitRadius": 190, "orbitSpeed": 0.2254, "angle": 160.338, "flore": 45, "faune": 47}
        ]},
      {"name": "Sigelpha", "radius": 93, "orbitRadius": 631, "orbitSpeed": 0.0489, "angle": 37.413, "flore": 38, "faune": 82, "moons": [
            {"name": "Celoton", "radius": 41, "orbitRadius": 255, "orbitSpeed": 0.2352, "angle": 166.893, "flore": 25, "faune": 30},
            {"name": "Draarria", "radius": 24, "orbitRadius": 255, "orbitSpeed": 0.2352, "angle": 171.444, "flore": 11, "faune": 3},
            {"name": "Xorudis", "radius": 37, "orbitRadius": 255, "orbitSpeed": 0.2352, "angle": 169.292, "flore": 5, "faune": 34}
        ]},
      {"name": "Synosria", "radius": 103, "orbitRadius": 631, "orbitSpeed": 0.0489, "angle": 33.027, "flore": 35, "faune": 77, "moons": [
            {"name": "Draarbus", "radius": 37, "orbitRadius": 222, "orbitSpeed": 0.2079, "angle": 148.914, "flore": 17, "faune": 1},
            {"name": "Zetirra", "radius": 43, "orbitRadius": 222, "orbitSpeed": 0.2079, "angle": 150.622, "flore": 44, "faune": 2}
        ]},
      {"name": "Synaria", "radius": 121, "orbitRadius": 1410, "orbitSpeed": 0.0306, "angle": 21.563, "flore": 75, "faune": 41, "moons": [
            {"name": "Nebumdis", "radius": 54, "orbitRadius": 251, "orbitSpeed": 0.3204, "angle": 222.061, "flore": 13, "faune": 35},
            {"name": "Zanenis", "radius": 48, "orbitRadius": 251, "orbitSpeed": 0.3204, "angle": 220.356, "flore": 9, "faune": 15},
            {"name": "Aurumton", "radius": 38, "orbitRadius": 429, "orbitSpeed": 0.273, "angle": 188.214, "flore": 35, "faune": 29},
            {"name": "Draaxis", "radius": 42, "orbitRadius": 429, "orbitSpeed": 0.273, "angle": 192.462, "flore": 9, "faune": 54},
            {"name": "Palosdis", "radius": 36, "orbitRadius": 429, "orbitSpeed": 0.273, "angle": 191.052, "flore": 37, "faune": 5}
        ]},
      {"name": "Nebarzar", "radius": 126, "orbitRadius": 1410, "orbitSpeed": 0.0306, "angle": 23.421, "flore": 42, "faune": 1, "moons": [
            {"name": "Xorelzar", "radius": 55, "orbitRadius": 285, "orbitSpeed": 0.3206, "angle": 219.611, "flore": 47, "faune": 11},
            {"name": "Velelpha", "radius": 39, "orbitRadius": 285, "orbitSpeed": 0.3206, "angle": 221.002, "flore": 35, "faune": 22},
            {"name": "Draenxis", "radius": 52, "orbitRadius": 285, "orbitSpeed": 0.3206, "angle": 222.466, "flore": 22, "faune": 33},
            {"name": "Celumdis", "radius": 35, "orbitRadius": 522, "orbitSpeed": 0.2902, "angle": 201.837, "flore": 26, "faune": 58},
            {"name": "Omienth", "radius": 38, "orbitRadius": 522, "orbitSpeed": 0.2902, "angle": 200.704, "flore": 32, "faune": 45},
            {"name": "Drairvyn", "radius": 52, "orbitRadius": 522, "orbitSpeed": 0.2902, "angle": 199.613, "flore": 31, "faune": 45}
        ]},
      {"name": "Omionxis", "radius": 78, "orbitRadius": 1410, "orbitSpeed": 0.0306, "angle": 20.178, "flore": 78, "faune": 71, "moons": [
            {"name": "Eriaxxis", "radius": 31, "orbitRadius": 309, "orbitSpeed": 0.2978, "angle": 206.706, "flore": 32, "faune": 42},
            {"name": "Nebartis", "radius": 37, "orbitRadius": 309, "orbitSpeed": 0.2978, "angle": 211.821, "flore": 1, "faune": 49},
            {"name": "Lyrosth", "radius": 21, "orbitRadius": 191, "orbitSpeed": 0.2934, "angle": 208.209, "flore": 42, "faune": 19},
            {"name": "Zanuton", "radius": 54, "orbitRadius": 191, "orbitSpeed": 0.2934, "angle": 205.842, "flore": 12, "faune": 11}
        ]}
    ]},
    {"name": "Zetaxzar", "radius": 159, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 0.463, "color": "#FF8C42", "planets": [
      {"name": "Ithelxis", "radius": 85, "orbitRadius": 403, "orbitSpeed": 0.0672, "angle": 47.927, "flore": 58, "faune": 81, "moons": [
            {"name": "Lyrummir", "radius": 21, "orbitRadius": 165, "orbitSpeed": 0.2416, "angle": 158.471, "flore": 30, "faune": 27}
        ]},
      {"name": "Draaxmus", "radius": 111, "orbitRadius": 936, "orbitSpeed": 0.0298, "angle": 21.652, "flore": 22, "faune": 69, "moons": [
            {"name": "Pyxalria", "radius": 41, "orbitRadius": 310, "orbitSpeed": 0.2951, "angle": 190.818, "flore": 8, "faune": 32},
            {"name": "Zanaxdon", "radius": 52, "orbitRadius": 195, "orbitSpeed": 0.335, "angle": 215.437, "flore": 32, "faune": 20},
            {"name": "Erielton", "radius": 32, "orbitRadius": 195, "orbitSpeed": 0.335, "angle": 217.837, "flore": 31, "faune": 40},
            {"name": "Ithentis", "radius": 23, "orbitRadius": 310, "orbitSpeed": 0.2951, "angle": 194.28, "flore": 13, "faune": 44}
        ]},
      {"name": "Pyxalvyn", "radius": 88, "orbitRadius": 1597, "orbitSpeed": 0.0237, "angle": 18.131, "flore": 26, "faune": 60, "moons": [
            {"name": "Nebaxdon", "radius": 45, "orbitRadius": 146, "orbitSpeed": 0.2387, "angle": 151.392, "flore": 1, "faune": 15},
            {"name": "Omiidon", "radius": 27, "orbitRadius": 254, "orbitSpeed": 0.2778, "angle": 181.394, "flore": 9, "faune": 15},
            {"name": "Celilux", "radius": 59, "orbitRadius": 146, "orbitSpeed": 0.2387, "angle": 155.316, "flore": 28, "faune": 39},
            {"name": "Zanodon", "radius": 33, "orbitRadius": 254, "orbitSpeed": 0.2778, "angle": 179.263, "flore": 5, "faune": 14}
        ]},
      {"name": "Kryaton", "radius": 108, "orbitRadius": 1597, "orbitSpeed": 0.0237, "angle": 17.059, "flore": 41, "faune": 82, "moons": [
            {"name": "Velosxis", "radius": 47, "orbitRadius": 264, "orbitSpeed": 0.245, "angle": 154.591, "flore": 38, "faune": 56},
            {"name": "Velonth", "radius": 39, "orbitRadius": 438, "orbitSpeed": 0.3407, "angle": 215.044, "flore": 37, "faune": 30},
            {"name": "Sigozar", "radius": 51, "orbitRadius": 438, "orbitSpeed": 0.3407, "angle": 220.423, "flore": 33, "faune": 33},
            {"name": "Lyrislux", "radius": 32, "orbitRadius": 438, "orbitSpeed": 0.3407, "angle": 219.233, "flore": 11, "faune": 28},
            {"name": "Kryaxvyn", "radius": 20, "orbitRadius": 264, "orbitSpeed": 0.245, "angle": 157.132, "flore": 5, "faune": 16}
        ]},
      {"name": "Palonlux", "radius": 74, "orbitRadius": 1597, "orbitSpeed": 0.0237, "angle": 16.274, "flore": 35, "faune": 50, "moons": [
            {"name": "Coranria", "radius": 27, "orbitRadius": 327, "orbitSpeed": 0.3146, "angle": 197.627, "flore": 0, "faune": 38},
            {"name": "Zetenis", "radius": 26, "orbitRadius": 203, "orbitSpeed": 0.3085, "angle": 192.726, "flore": 32, "faune": 47},
            {"name": "Omiepha", "radius": 53, "orbitRadius": 203, "orbitSpeed": 0.3085, "angle": 197.199, "flore": 26, "faune": 18},
            {"name": "Thalidis", "radius": 28, "orbitRadius": 327, "orbitSpeed": 0.3146, "angle": 199.224, "flore": 41, "faune": 13}
        ]},
      {"name": "Sigarth", "radius": 121, "orbitRadius": 1597, "orbitSpeed": 0.0237, "angle": 14.015, "flore": 33, "faune": 47, "moons": [
            {"name": "Ithaxtis", "radius": 21, "orbitRadius": 281, "orbitSpeed": 0.2154, "angle": 133.092, "flore": 40, "faune": 31}
        ]},
      {"name": "Sigonlux", "radius": 103, "orbitRadius": 936, "orbitSpeed": 0.0298, "angle": 17.134, "flore": 34, "faune": 73, "moons": [
            {"name": "Nebirdon", "radius": 27, "orbitRadius": 293, "orbitSpeed": 0.3281, "angle": 215.741, "flore": 35, "faune": 0},
            {"name": "Draenvyn", "radius": 38, "orbitRadius": 293, "orbitSpeed": 0.3281, "angle": 217.088, "flore": 0, "faune": 37},
            {"name": "Aurirth", "radius": 42, "orbitRadius": 293, "orbitSpeed": 0.3281, "angle": 212.206, "flore": 25, "faune": 13},
            {"name": "Pyxuxis", "radius": 46, "orbitRadius": 206, "orbitSpeed": 0.155, "angle": 98.554, "flore": 43, "faune": 42}
        ]}
    ]},
    {"name": "Celostis", "radius": 190, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 0.949, "color": "#FFB830", "planets": [
      {"name": "Vorenton", "radius": 83, "orbitRadius": 699, "orbitSpeed": 0.0562, "angle": 37.271, "flore": 70, "faune": 3, "moons": [
            {"name": "Ithanvyn", "radius": 49, "orbitRadius": 276, "orbitSpeed": 0.2668, "angle": 159.719, "flore": 12, "faune": 33},
            {"name": "Nebalra", "radius": 52, "orbitRadius": 276, "orbitSpeed": 0.2668, "angle": 164.159, "flore": 7, "faune": 16},
            {"name": "Omionth", "radius": 29, "orbitRadius": 208, "orbitSpeed": 0.3032, "angle": 184.909, "flore": 7, "faune": 36},
            {"name": "Thalaxnis", "radius": 47, "orbitRadius": 401, "orbitSpeed": 0.2761, "angle": 165.921, "flore": 14, "faune": 18}
        ]},
      {"name": "Sigelvyn", "radius": 121, "orbitRadius": 1958, "orbitSpeed": 0.0167, "angle": 13.049, "flore": 61, "faune": 99, "moons": [
            {"name": "Zanirxis", "radius": 48, "orbitRadius": 474, "orbitSpeed": 0.3232, "angle": 188.432, "flore": 12, "faune": 5}
        ]},
      {"name": "Zanirmus", "radius": 70, "orbitRadius": 1958, "orbitSpeed": 0.0167, "angle": 12.348, "flore": 31, "faune": 98, "moons": [
            {"name": "Zanaxnis", "radius": 30, "orbitRadius": 683, "orbitSpeed": 0.2917, "angle": 169.977, "flore": 31, "faune": 15},
            {"name": "Eriumra", "radius": 45, "orbitRadius": 683, "orbitSpeed": 0.2917, "angle": 171.989, "flore": 27, "faune": 40}
        ]},
      {"name": "Thalarxis", "radius": 103, "orbitRadius": 1958, "orbitSpeed": 0.0167, "angle": 10.762, "flore": 27, "faune": 18, "moons": [
            {"name": "Xoranlux", "radius": 33, "orbitRadius": 460, "orbitSpeed": 0.3264, "angle": 188.238, "flore": 17, "faune": 53},
            {"name": "Voraxth", "radius": 40, "orbitRadius": 356, "orbitSpeed": 0.1575, "angle": 94.761, "flore": 15, "faune": 27},
            {"name": "Omiondon", "radius": 40, "orbitRadius": 181, "orbitSpeed": 0.2104, "angle": 124.753, "flore": 21, "faune": 41},
            {"name": "Corelpha", "radius": 37, "orbitRadius": 181, "orbitSpeed": 0.2104, "angle": 123.428, "flore": 26, "faune": 47},
            {"name": "Omialton", "radius": 60, "orbitRadius": 356, "orbitSpeed": 0.1575, "angle": 91.085, "flore": 17, "faune": 19}
        ]},
      {"name": "Synirmir", "radius": 78, "orbitRadius": 1958, "orbitSpeed": 0.0167, "angle": 9.575, "flore": 41, "faune": 26, "moons": [
            {"name": "Voreth", "radius": 43, "orbitRadius": 567, "orbitSpeed": 0.331, "angle": 188.822, "flore": 22, "faune": 21},
            {"name": "Draedis", "radius": 47, "orbitRadius": 355, "orbitSpeed": 0.2395, "angle": 141.457, "flore": 33, "faune": 57},
            {"name": "Thalanzar", "radius": 32, "orbitRadius": 355, "orbitSpeed": 0.2395, "angle": 139.371, "flore": 31, "faune": 43},
            {"name": "Omiaxria", "radius": 32, "orbitRadius": 567, "orbitSpeed": 0.331, "angle": 190.3, "flore": 16, "faune": 34}
        ]},
      {"name": "Thaloxis", "radius": 117, "orbitRadius": 699, "orbitSpeed": 0.0562, "angle": 33.266, "flore": 18, "faune": 0, "moons": [
            {"name": "Draoria", "radius": 53, "orbitRadius": 421, "orbitSpeed": 0.1901, "angle": 116.167, "flore": 24, "faune": 50},
            {"name": "Omiuxis", "radius": 20, "orbitRadius": 421, "orbitSpeed": 0.1901, "angle": 110.913, "flore": 28, "faune": 15},
            {"name": "Ithumria", "radius": 32, "orbitRadius": 421, "orbitSpeed": 0.1901, "angle": 112.596, "flore": 23, "faune": 30},
            {"name": "Velamir", "radius": 32, "orbitRadius": 421, "orbitSpeed": 0.1901, "angle": 114.312, "flore": 18, "faune": 21}
        ]},
      {"name": "Zetarth", "radius": 125, "orbitRadius": 1958, "orbitSpeed": 0.0167, "angle": 8.054, "flore": 24, "faune": 88, "moons": [
            {"name": "Lyralzar", "radius": 28, "orbitRadius": 328, "orbitSpeed": 0.3337, "angle": 203.641, "flore": 3, "faune": 3},
            {"name": "Synendis", "radius": 44, "orbitRadius": 252, "orbitSpeed": 0.3154, "angle": 189.951, "flore": 24, "faune": 2},
            {"name": "Coronpha", "radius": 23, "orbitRadius": 543, "orbitSpeed": 0.1895, "angle": 117.789, "flore": 36, "faune": 19},
            {"name": "Kryadon", "radius": 47, "orbitRadius": 328, "orbitSpeed": 0.3337, "angle": 204.883, "flore": 39, "faune": 26},
            {"name": "Pyxelra", "radius": 49, "orbitRadius": 543, "orbitSpeed": 0.1895, "angle": 116.336, "flore": 1, "faune": 59}
        ]}
    ]},
    {"name": "Pyxendon", "radius": 218, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 1.467, "color": "#FFB830", "planets": [
      {"name": "Aurentis", "radius": 122, "orbitRadius": 539, "orbitSpeed": 0.0533, "angle": 27.189, "flore": 62, "faune": 72, "moons": [
            {"name": "Zetavyn", "radius": 21, "orbitRadius": 243, "orbitSpeed": 0.312, "angle": 162.284, "flore": 7, "faune": 53},
            {"name": "Ithonpha", "radius": 29, "orbitRadius": 243, "orbitSpeed": 0.312, "angle": 157.386, "flore": 16, "faune": 8}
        ]},
      {"name": "Pyxolux", "radius": 109, "orbitRadius": 1199, "orbitSpeed": 0.0312, "angle": 14.342, "flore": 74, "faune": 55, "moons": [
            {"name": "Zanomus", "radius": 24, "orbitRadius": 260, "orbitSpeed": 0.2073, "angle": 108.309, "flore": 49, "faune": 17},
            {"name": "Zanadis", "radius": 35, "orbitRadius": 155, "orbitSpeed": 0.2839, "angle": 142.411, "flore": 40, "faune": 11},
            {"name": "Zetumra", "radius": 54, "orbitRadius": 260, "orbitSpeed": 0.2073, "angle": 103.569, "flore": 36, "faune": 56},
            {"name": "Draubus", "radius": 34, "orbitRadius": 260, "orbitSpeed": 0.2073, "angle": 106.275, "flore": 32, "faune": 26}
        ]},
      {"name": "Palora", "radius": 70, "orbitRadius": 1199, "orbitSpeed": 0.0312, "angle": 19.782, "flore": 63, "faune": 39, "moons": [
            {"name": "Omiaxpha", "radius": 43, "orbitRadius": 172, "orbitSpeed": 0.2018, "angle": 99.084, "flore": 46, "faune": 5},
            {"name": "Pyxarmir", "radius": 60, "orbitRadius": 329, "orbitSpeed": 0.2835, "angle": 142.345, "flore": 46, "faune": 55},
            {"name": "Nebubus", "radius": 53, "orbitRadius": 329, "orbitSpeed": 0.2835, "angle": 144.423, "flore": 6, "faune": 37}
        ]},
      {"name": "Draallux", "radius": 81, "orbitRadius": 1199, "orbitSpeed": 0.0312, "angle": 18.038, "flore": 33, "faune": 95, "moons": [
            {"name": "Velenmir", "radius": 45, "orbitRadius": 238, "orbitSpeed": 0.1989, "angle": 103.575, "flore": 40, "faune": 20},
            {"name": "Itharnis", "radius": 50, "orbitRadius": 349, "orbitSpeed": 0.2007, "angle": 109.674, "flore": 17, "faune": 54},
            {"name": "Zanisria", "radius": 43, "orbitRadius": 238, "orbitSpeed": 0.1989, "angle": 108.187, "flore": 3, "faune": 1}
        ]},
      {"name": "Zetaxnis", "radius": 128, "orbitRadius": 1199, "orbitSpeed": 0.0312, "angle": 16.282, "flore": 57, "faune": 67, "moons": [
            {"name": "Neboth", "radius": 30, "orbitRadius": 452, "orbitSpeed": 0.2776, "angle": 149.631, "flore": 18, "faune": 45},
            {"name": "Voralux", "radius": 57, "orbitRadius": 307, "orbitSpeed": 0.1596, "angle": 86.375, "flore": 17, "faune": 18},
            {"name": "Nebaxmir", "radius": 38, "orbitRadius": 307, "orbitSpeed": 0.1596, "angle": 84.961, "flore": 47, "faune": 31},
            {"name": "Eriarmir", "radius": 24, "orbitRadius": 452, "orbitSpeed": 0.2776, "angle": 142.122, "flore": 47, "faune": 40},
            {"name": "Pyxosdon", "radius": 29, "orbitRadius": 452, "orbitSpeed": 0.2776, "angle": 139.973, "flore": 1, "faune": 35}
        ]},
      {"name": "Erionbus", "radius": 120, "orbitRadius": 1753, "orbitSpeed": 0.0228, "angle": 15.142, "flore": 54, "faune": 41, "moons": [
            {"name": "Draexis", "radius": 44, "orbitRadius": 222, "orbitSpeed": 0.3159, "angle": 158.185, "flore": 20, "faune": 50},
            {"name": "Thalisth", "radius": 33, "orbitRadius": 222, "orbitSpeed": 0.3159, "angle": 160.047, "flore": 3, "faune": 16}
        ]}
    ]},
    {"name": "Kryosria", "radius": 185, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 5.354, "color": "#FF8C42", "planets": [
      {"name": "Palelth", "radius": 108, "orbitRadius": 1023, "orbitSpeed": 0.0373, "angle": 15.671, "flore": 170, "faune": 85, "moons": [
        ]},
      {"name": "Synamus", "radius": 127, "orbitRadius": 1667, "orbitSpeed": 0.0278, "angle": 11.689, "flore": 103, "faune": 71, "moons": [
            {"name": "Lyrirth", "radius": 59, "orbitRadius": 502, "orbitSpeed": 0.2678, "angle": 125.678, "flore": 91, "faune": 6},
            {"name": "Celirmir", "radius": 29, "orbitRadius": 295, "orbitSpeed": 0.2527, "angle": 118.967, "flore": 45, "faune": 73},
            {"name": "Xorarbus", "radius": 20, "orbitRadius": 366, "orbitSpeed": 0.1696, "angle": 80.449, "flore": 2, "faune": 28},
            {"name": "Lyriton", "radius": 52, "orbitRadius": 366, "orbitSpeed": 0.1696, "angle": 81.624, "flore": 25, "faune": 4},
            {"name": "Nebondon", "radius": 22, "orbitRadius": 295, "orbitSpeed": 0.2527, "angle": 114.997, "flore": 112, "faune": 18},
            {"name": "Zanantis", "radius": 34, "orbitRadius": 366, "orbitSpeed": 0.1696, "angle": 78.542, "flore": 98, "faune": 20},
            {"name": "Erielpha", "radius": 20, "orbitRadius": 502, "orbitSpeed": 0.2678, "angle": 124.388, "flore": 7, "faune": 38}
        ]},
      {"name": "Nebedon", "radius": 73, "orbitRadius": 1667, "orbitSpeed": 0.0278, "angle": 14.959, "flore": 36, "faune": 117, "moons": [
            {"name": "Zanezar", "radius": 31, "orbitRadius": 295, "orbitSpeed": 0.2612, "angle": 115.339, "flore": 89, "faune": 51},
            {"name": "Pyxarton", "radius": 49, "orbitRadius": 414, "orbitSpeed": 0.3127, "angle": 143.679, "flore": 25, "faune": 24},
            {"name": "Coronth", "radius": 24, "orbitRadius": 295, "orbitSpeed": 0.2612, "angle": 118.345, "flore": 94, "faune": 20},
            {"name": "Xoronbus", "radius": 35, "orbitRadius": 295, "orbitSpeed": 0.2612, "angle": 117.51, "flore": 105, "faune": 59},
            {"name": "Kryinis", "radius": 55, "orbitRadius": 414, "orbitSpeed": 0.3127, "angle": 139.267, "flore": 65, "faune": 55}
        ]},
      {"name": "Draismir", "radius": 76, "orbitRadius": 1023, "orbitSpeed": 0.0373, "angle": 17.782, "flore": 201, "faune": 166, "moons": [
            {"name": "Pyxardis", "radius": 41, "orbitRadius": 316, "orbitSpeed": 0.2683, "angle": 122.146, "flore": 36, "faune": 113}
        ]}
    ]},
    {"name": "Zanelria", "radius": 236, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 5.021, "color": "#FFE44D", "planets": [
      {"name": "Thalanlux", "radius": 125, "orbitRadius": 773, "orbitSpeed": 0.0503, "angle": 19.92, "flore": 68, "faune": 57, "moons": [
            {"name": "Eriaxra", "radius": 27, "orbitRadius": 323, "orbitSpeed": 0.2782, "angle": 116.234, "flore": 41, "faune": 40},
            {"name": "Omiaton", "radius": 32, "orbitRadius": 323, "orbitSpeed": 0.2782, "angle": 115.428, "flore": 44, "faune": 35},
            {"name": "Thaloston", "radius": 30, "orbitRadius": 478, "orbitSpeed": 0.1623, "angle": 67.954, "flore": 21, "faune": 7},
            {"name": "Palondon", "radius": 36, "orbitRadius": 478, "orbitSpeed": 0.1623, "angle": 66.245, "flore": 28, "faune": 44},
            {"name": "Zanosmir", "radius": 31, "orbitRadius": 323, "orbitSpeed": 0.2782, "angle": 111.291, "flore": 37, "faune": 56}
        ]},
      {"name": "Celoston", "radius": 72, "orbitRadius": 1642, "orbitSpeed": 0.0285, "angle": 9.509, "flore": 49, "faune": 35, "moons": [
            {"name": "Synara", "radius": 37, "orbitRadius": 152, "orbitSpeed": 0.3416, "angle": 131.953, "flore": 49, "faune": 13},
            {"name": "Draarzar", "radius": 55, "orbitRadius": 301, "orbitSpeed": 0.1621, "angle": 66.811, "flore": 44, "faune": 0},
            {"name": "Velumtis", "radius": 20, "orbitRadius": 301, "orbitSpeed": 0.1621, "angle": 65.354, "flore": 32, "faune": 36},
            {"name": "Voralzar", "radius": 32, "orbitRadius": 301, "orbitSpeed": 0.1621, "angle": 63.925, "flore": 39, "faune": 25}
        ]},
      {"name": "Zananvyn", "radius": 78, "orbitRadius": 1642, "orbitSpeed": 0.0285, "angle": 10.581, "flore": 62, "faune": 62, "moons": [
            {"name": "Omiaxzar", "radius": 43, "orbitRadius": 222, "orbitSpeed": 0.3276, "angle": 129.431, "flore": 12, "faune": 33},
            {"name": "Synonmus", "radius": 31, "orbitRadius": 584, "orbitSpeed": 0.3065, "angle": 119.86, "flore": 12, "faune": 50},
            {"name": "Thalidis", "radius": 36, "orbitRadius": 376, "orbitSpeed": 0.327, "angle": 133.992, "flore": 16, "faune": 52},
            {"name": "Itheldis", "radius": 49, "orbitRadius": 376, "orbitSpeed": 0.327, "angle": 132.779, "flore": 19, "faune": 50},
            {"name": "Synatis", "radius": 43, "orbitRadius": 376, "orbitSpeed": 0.327, "angle": 131.105, "flore": 21, "faune": 15}
        ]},
      {"name": "Zetirdis", "radius": 84, "orbitRadius": 1642, "orbitSpeed": 0.0285, "angle": 12.51, "flore": 74, "faune": 90, "moons": [
            {"name": "Erienth", "radius": 38, "orbitRadius": 274, "orbitSpeed": 0.1863, "angle": 74.256, "flore": 19, "faune": 13},
            {"name": "Synanis", "radius": 47, "orbitRadius": 274, "orbitSpeed": 0.1863, "angle": 79.008, "flore": 7, "faune": 44},
            {"name": "Pyxera", "radius": 32, "orbitRadius": 475, "orbitSpeed": 0.2124, "angle": 89.496, "flore": 38, "faune": 16},
            {"name": "Zanandis", "radius": 43, "orbitRadius": 475, "orbitSpeed": 0.2124, "angle": 86.97, "flore": 41, "faune": 33}
        ]},
      {"name": "Kryaldon", "radius": 80, "orbitRadius": 1642, "orbitSpeed": 0.0285, "angle": 14.361, "flore": 57, "faune": 89, "moons": [
            {"name": "Celelton", "radius": 35, "orbitRadius": 417, "orbitSpeed": 0.2917, "angle": 120.036, "flore": 4, "faune": 58},
            {"name": "Lyranis", "radius": 60, "orbitRadius": 177, "orbitSpeed": 0.2382, "angle": 98.397, "flore": 51, "faune": 44},
            {"name": "Synaltis", "radius": 25, "orbitRadius": 288, "orbitSpeed": 0.1829, "angle": 76.571, "flore": 46, "faune": 26},
            {"name": "Velaxzar", "radius": 41, "orbitRadius": 288, "orbitSpeed": 0.1829, "angle": 78.536, "flore": 4, "faune": 1}
        ]}
    ]},
    {"name": "Xorirbus", "radius": 215, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 4.648, "color": "#FFE44D", "planets": [
      {"name": "Kryumbus", "radius": 113, "orbitRadius": 675, "orbitSpeed": 0.0349, "angle": 11.671, "flore": 77, "faune": 60, "moons": [
            {"name": "Aurisra", "radius": 48, "orbitRadius": 196, "orbitSpeed": 0.2772, "angle": 94.451, "flore": 38, "faune": 60},
            {"name": "Xoraxlux", "radius": 30, "orbitRadius": 428, "orbitSpeed": 0.3119, "angle": 106.857, "flore": 5, "faune": 5},
            {"name": "Thaleton", "radius": 37, "orbitRadius": 428, "orbitSpeed": 0.3119, "angle": 111.177, "flore": 24, "faune": 46},
            {"name": "Ithemir", "radius": 53, "orbitRadius": 196, "orbitSpeed": 0.2772, "angle": 97.962, "flore": 15, "faune": 29},
            {"name": "Kryelth", "radius": 36, "orbitRadius": 428, "orbitSpeed": 0.3119, "angle": 109.217, "flore": 12, "faune": 16},
            {"name": "Eriaxmir", "radius": 50, "orbitRadius": 428, "orbitSpeed": 0.3119, "angle": 106.359, "flore": 16, "faune": 13}
        ]},
      {"name": "Draalvyn", "radius": 84, "orbitRadius": 1557, "orbitSpeed": 0.0306, "angle": 9.643, "flore": 69, "faune": 33, "moons": [
            {"name": "Palara", "radius": 52, "orbitRadius": 201, "orbitSpeed": 0.32, "angle": 102.465, "flore": 11, "faune": 59}
        ]},
      {"name": "Kryisdis", "radius": 71, "orbitRadius": 1557, "orbitSpeed": 0.0306, "angle": 8.569, "flore": 42, "faune": 56, "moons": [
            {"name": "Nebadis", "radius": 39, "orbitRadius": 244, "orbitSpeed": 0.2469, "angle": 78.205, "flore": 5, "faune": 22},
            {"name": "Auraton", "radius": 43, "orbitRadius": 244, "orbitSpeed": 0.2469, "angle": 82.741, "flore": 31, "faune": 31},
            {"name": "Synoszar", "radius": 32, "orbitRadius": 310, "orbitSpeed": 0.2058, "angle": 68.437, "flore": 20, "faune": 14},
            {"name": "Xorosdis", "radius": 41, "orbitRadius": 310, "orbitSpeed": 0.2058, "angle": 67.408, "flore": 41, "faune": 3}
        ]},
      {"name": "Omiudis", "radius": 73, "orbitRadius": 675, "orbitSpeed": 0.0349, "angle": 14.594, "flore": 14, "faune": 92, "moons": [
            {"name": "Lyrivyn", "radius": 46, "orbitRadius": 142, "orbitSpeed": 0.1593, "angle": 53.083, "flore": 24, "faune": 8},
            {"name": "Pyxulux", "radius": 31, "orbitRadius": 229, "orbitSpeed": 0.1727, "angle": 56.142, "flore": 43, "faune": 5},
            {"name": "Pyxiton", "radius": 37, "orbitRadius": 229, "orbitSpeed": 0.1727, "angle": 61.14, "flore": 37, "faune": 0},
            {"name": "Corirmir", "radius": 55, "orbitRadius": 229, "orbitSpeed": 0.1727, "angle": 60.437, "flore": 37, "faune": 36}
        ]},
      {"name": "Coronlux", "radius": 120, "orbitRadius": 1557, "orbitSpeed": 0.0306, "angle": 12.132, "flore": 83, "faune": 87, "moons": [
            {"name": "Nebuth", "radius": 32, "orbitRadius": 463, "orbitSpeed": 0.2054, "angle": 67.281, "flore": 16, "faune": 22},
            {"name": "Coralxis", "radius": 27, "orbitRadius": 463, "orbitSpeed": 0.2054, "angle": 66.368, "flore": 15, "faune": 59},
            {"name": "Zanaldon", "radius": 47, "orbitRadius": 463, "orbitSpeed": 0.2054, "angle": 71.395, "flore": 10, "faune": 30},
            {"name": "Xorisxis", "radius": 51, "orbitRadius": 300, "orbitSpeed": 0.2363, "angle": 81.334, "flore": 27, "faune": 25},
            {"name": "Vorislux", "radius": 38, "orbitRadius": 300, "orbitSpeed": 0.2363, "angle": 79.53, "flore": 1, "faune": 12}
        ]},
      {"name": "Lyrarth", "radius": 110, "orbitRadius": 1557, "orbitSpeed": 0.0306, "angle": 10.641, "flore": 9, "faune": 96, "moons": [
            {"name": "Kryaxxis", "radius": 46, "orbitRadius": 224, "orbitSpeed": 0.3495, "angle": 128.921, "flore": 14, "faune": 31},
            {"name": "Paleria", "radius": 41, "orbitRadius": 478, "orbitSpeed": 0.1567, "angle": 53.825, "flore": 1, "faune": 21},
            {"name": "Synirlux", "radius": 23, "orbitRadius": 478, "orbitSpeed": 0.1567, "angle": 58.449, "flore": 20, "faune": 43},
            {"name": "Kryanton", "radius": 60, "orbitRadius": 478, "orbitSpeed": 0.1567, "angle": 56.289, "flore": 15, "faune": 10},
            {"name": "Veleton", "radius": 21, "orbitRadius": 224, "orbitSpeed": 0.3495, "angle": 125.096, "flore": 13, "faune": 20},
            {"name": "Erialra", "radius": 40, "orbitRadius": 224, "orbitSpeed": 0.3495, "angle": 126.424, "flore": 11, "faune": 39}
        ]}
    ]},
    {"name": "Ithonis", "radius": 184, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 4.225, "color": "#7CB9FF", "planets": [
      {"name": "Eriarmus", "radius": 129, "orbitRadius": 931, "orbitSpeed": 0.0296, "angle": 8.397, "flore": 11, "faune": 38, "moons": [
            {"name": "Lyrontis", "radius": 52, "orbitRadius": 273, "orbitSpeed": 0.1912, "angle": 53.573, "flore": 20, "faune": 59},
            {"name": "Ithaltis", "radius": 32, "orbitRadius": 273, "orbitSpeed": 0.1912, "angle": 58.51, "flore": 9, "faune": 11},
            {"name": "Zetaxvyn", "radius": 32, "orbitRadius": 273, "orbitSpeed": 0.1912, "angle": 57.394, "flore": 5, "faune": 24},
            {"name": "Pyxizar", "radius": 49, "orbitRadius": 374, "orbitSpeed": 0.1812, "angle": 54.85, "flore": 11, "faune": 22},
            {"name": "Voranpha", "radius": 59, "orbitRadius": 580, "orbitSpeed": 0.2209, "angle": 66.881, "flore": 36, "faune": 6}
        ]},
      {"name": "Pyxarxis", "radius": 83, "orbitRadius": 1742, "orbitSpeed": 0.0213, "angle": 4.728, "flore": 72, "faune": 13, "moons": [
            {"name": "Sigosbus", "radius": 34, "orbitRadius": 190, "orbitSpeed": 0.2433, "angle": 65.296, "flore": 47, "faune": 3},
            {"name": "Draarth", "radius": 21, "orbitRadius": 301, "orbitSpeed": 0.2281, "angle": 60.012, "flore": 22, "faune": 31},
            {"name": "Eriumria", "radius": 60, "orbitRadius": 190, "orbitSpeed": 0.2433, "angle": 69.57, "flore": 3, "faune": 11},
            {"name": "Zetumtis", "radius": 47, "orbitRadius": 190, "orbitSpeed": 0.2433, "angle": 67.939, "flore": 21, "faune": 1},
            {"name": "Vorutis", "radius": 38, "orbitRadius": 301, "orbitSpeed": 0.2281, "angle": 63.77, "flore": 32, "faune": 28},
            {"name": "Omialth", "radius": 47, "orbitRadius": 301, "orbitSpeed": 0.2281, "angle": 63.304, "flore": 34, "faune": 31}
        ]},
      {"name": "Nebodis", "radius": 115, "orbitRadius": 1742, "orbitSpeed": 0.0213, "angle": 3.751, "flore": 15, "faune": 48, "moons": [
            {"name": "Pyxanria", "radius": 24, "orbitRadius": 210, "orbitSpeed": 0.2724, "angle": 79.678, "flore": 24, "faune": 55},
            {"name": "Sigirzar", "radius": 47, "orbitRadius": 210, "orbitSpeed": 0.2724, "angle": 75.09, "flore": 23, "faune": 11},
            {"name": "Palelra", "radius": 41, "orbitRadius": 210, "orbitSpeed": 0.2724, "angle": 76.007, "flore": 39, "faune": 59},
            {"name": "Omiannis", "radius": 32, "orbitRadius": 445, "orbitSpeed": 0.2444, "angle": 68.417, "flore": 29, "faune": 27}
        ]},
      {"name": "Xorelmir", "radius": 94, "orbitRadius": 931, "orbitSpeed": 0.0296, "angle": 6.061, "flore": 27, "faune": 14, "moons": [
            {"name": "Thaledon", "radius": 42, "orbitRadius": 241, "orbitSpeed": 0.2486, "angle": 70.441, "flore": 30, "faune": 16},
            {"name": "Coraton", "radius": 46, "orbitRadius": 241, "orbitSpeed": 0.2486, "angle": 72.327, "flore": 16, "faune": 55},
            {"name": "Coroton", "radius": 34, "orbitRadius": 241, "orbitSpeed": 0.2486, "angle": 73.828, "flore": 41, "faune": 56},
            {"name": "Xoraxdon", "radius": 47, "orbitRadius": 311, "orbitSpeed": 0.3094, "angle": 91.076, "flore": 43, "faune": 48},
            {"name": "Nebeltis", "radius": 57, "orbitRadius": 413, "orbitSpeed": 0.3053, "angle": 89.328, "flore": 1, "faune": 12}
        ]},
      {"name": "Kryenmir", "radius": 96, "orbitRadius": 931, "orbitSpeed": 0.0296, "angle": 10.849, "flore": 58, "faune": 43, "moons": [
            {"name": "Kryonvyn", "radius": 40, "orbitRadius": 325, "orbitSpeed": 0.2553, "angle": 78.751, "flore": 8, "faune": 54},
            {"name": "Nebarria", "radius": 45, "orbitRadius": 182, "orbitSpeed": 0.1932, "angle": 55.75, "flore": 1, "faune": 45}
        ]},
      {"name": "Zetelpha", "radius": 83, "orbitRadius": 1742, "orbitSpeed": 0.0213, "angle": 7.733, "flore": 43, "faune": 26, "moons": [
            {"name": "Omiomir", "radius": 43, "orbitRadius": 262, "orbitSpeed": 0.3485, "angle": 103.126, "flore": 44, "faune": 54},
            {"name": "Synetis", "radius": 25, "orbitRadius": 353, "orbitSpeed": 0.1883, "angle": 59.704, "flore": 9, "faune": 46},
            {"name": "Xorirvyn", "radius": 31, "orbitRadius": 353, "orbitSpeed": 0.1883, "angle": 58.903, "flore": 19, "faune": 7},
            {"name": "Aurisbus", "radius": 54, "orbitRadius": 353, "orbitSpeed": 0.1883, "angle": 57.668, "flore": 16, "faune": 36},
            {"name": "Auranis", "radius": 23, "orbitRadius": 262, "orbitSpeed": 0.3485, "angle": 105.038, "flore": 24, "faune": 44}
        ]}
    ]},
    {"name": "Draumnis", "radius": 212, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 3.82, "color": "#FF6B6B", "planets": [
      {"name": "Zetummus", "radius": 104, "orbitRadius": 902, "orbitSpeed": 0.0305, "angle": 7.051, "flore": 27, "faune": 78, "moons": [
            {"name": "Eriaxmus", "radius": 26, "orbitRadius": 310, "orbitSpeed": 0.2836, "angle": 69.037, "flore": 1, "faune": 49},
            {"name": "Aurisra", "radius": 59, "orbitRadius": 204, "orbitSpeed": 0.2838, "angle": 67.683, "flore": 28, "faune": 21},
            {"name": "Synexis", "radius": 51, "orbitRadius": 204, "orbitSpeed": 0.2838, "angle": 72.413, "flore": 34, "faune": 6},
            {"name": "Aureth", "radius": 41, "orbitRadius": 310, "orbitSpeed": 0.2836, "angle": 72.679, "flore": 24, "faune": 6}
        ]},
      {"name": "Synumus", "radius": 82, "orbitRadius": 902, "orbitSpeed": 0.0305, "angle": 5.728, "flore": 69, "faune": 9, "moons": [
            {"name": "Itharpha", "radius": 54, "orbitRadius": 225, "orbitSpeed": 0.3199, "angle": 75.531, "flore": 12, "faune": 23},
            {"name": "Voridon", "radius": 43, "orbitRadius": 225, "orbitSpeed": 0.3199, "angle": 80.419, "flore": 27, "faune": 48},
            {"name": "Zetedon", "radius": 44, "orbitRadius": 225, "orbitSpeed": 0.3199, "angle": 79.151, "flore": 14, "faune": 28}
        ]},
      {"name": "Nebalra", "radius": 112, "orbitRadius": 1623, "orbitSpeed": 0.0306, "angle": 5.065, "flore": 25, "faune": 65, "moons": [
            {"name": "Erionzar", "radius": 39, "orbitRadius": 396, "orbitSpeed": 0.2977, "angle": 70.502, "flore": 26, "faune": 58},
            {"name": "Lyroria", "radius": 58, "orbitRadius": 225, "orbitSpeed": 0.3193, "angle": 76.344, "flore": 10, "faune": 30},
            {"name": "Velath", "radius": 47, "orbitRadius": 225, "orbitSpeed": 0.3193, "angle": 78.005, "flore": 5, "faune": 38},
            {"name": "Lyrosxis", "radius": 24, "orbitRadius": 225, "orbitSpeed": 0.3193, "angle": 72.93, "flore": 8, "faune": 16},
            {"name": "Nebelzar", "radius": 20, "orbitRadius": 396, "orbitSpeed": 0.2977, "angle": 73.578, "flore": 34, "faune": 9}
        ]},
      {"name": "Synenth", "radius": 126, "orbitRadius": 1623, "orbitSpeed": 0.0306, "angle": 10.266, "flore": 42, "faune": 70, "moons": [
            {"name": "Vorutis", "radius": 57, "orbitRadius": 329, "orbitSpeed": 0.2134, "angle": 48.385, "flore": 8, "faune": 10},
            {"name": "Auretis", "radius": 37, "orbitRadius": 329, "orbitSpeed": 0.2134, "angle": 50.252, "flore": 5, "faune": 47},
            {"name": "Vorelnis", "radius": 25, "orbitRadius": 239, "orbitSpeed": 0.3297, "angle": 78.359, "flore": 9, "faune": 55},
            {"name": "Nebenzar", "radius": 52, "orbitRadius": 516, "orbitSpeed": 0.2833, "angle": 67.324, "flore": 27, "faune": 47},
            {"name": "Velondon", "radius": 45, "orbitRadius": 516, "orbitSpeed": 0.2833, "angle": 66.201, "flore": 18, "faune": 29},
            {"name": "Draalton", "radius": 55, "orbitRadius": 239, "orbitSpeed": 0.3297, "angle": 73.115, "flore": 18, "faune": 45}
        ]},
      {"name": "Synimir", "radius": 81, "orbitRadius": 1623, "orbitSpeed": 0.0306, "angle": 9.265, "flore": 58, "faune": 69, "moons": [
            {"name": "Zanotis", "radius": 23, "orbitRadius": 206, "orbitSpeed": 0.2615, "angle": 57.501, "flore": 5, "faune": 4},
            {"name": "Kryarxis", "radius": 30, "orbitRadius": 206, "orbitSpeed": 0.2615, "angle": 59.257, "flore": 9, "faune": 31},
            {"name": "Draarton", "radius": 48, "orbitRadius": 206, "orbitSpeed": 0.2615, "angle": 60.387, "flore": 12, "faune": 12}
        ]},
      {"name": "Zanarpha", "radius": 71, "orbitRadius": 902, "orbitSpeed": 0.0305, "angle": 9.496, "flore": 3, "faune": 86, "moons": [
            {"name": "Kryamus", "radius": 43, "orbitRadius": 118, "orbitSpeed": 0.2019, "angle": 48.189, "flore": 38, "faune": 12}
        ]},
      {"name": "Pyxonxis", "radius": 99, "orbitRadius": 1623, "orbitSpeed": 0.0306, "angle": 7.873, "flore": 38, "faune": 25, "moons": [
            {"name": "Zanalbus", "radius": 37, "orbitRadius": 227, "orbitSpeed": 0.2789, "angle": 68.125, "flore": 34, "faune": 19},
            {"name": "Pyxalra", "radius": 36, "orbitRadius": 306, "orbitSpeed": 0.2037, "angle": 53.953, "flore": 1, "faune": 14},
            {"name": "Eriosria", "radius": 21, "orbitRadius": 227, "orbitSpeed": 0.2789, "angle": 72.227, "flore": 2, "faune": 41},
            {"name": "Palirtis", "radius": 43, "orbitRadius": 227, "orbitSpeed": 0.2789, "angle": 70.764, "flore": 6, "faune": 13}
        ]}
    ]},
    {"name": "Nebiton", "radius": 189, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 3.321, "color": "#FFB830", "planets": [
      {"name": "Sigaxdis", "radius": 85, "orbitRadius": 788, "orbitSpeed": 0.052, "angle": 9.071, "flore": 2, "faune": 33, "moons": [
            {"name": "Corazar", "radius": 28, "orbitRadius": 325, "orbitSpeed": 0.1587, "angle": 33.639, "flore": 27, "faune": 28},
            {"name": "Nebisdis", "radius": 59, "orbitRadius": 325, "orbitSpeed": 0.1587, "angle": 30.282, "flore": 47, "faune": 5},
            {"name": "Pyxura", "radius": 49, "orbitRadius": 179, "orbitSpeed": 0.2198, "angle": 43.511, "flore": 48, "faune": 2},
            {"name": "Coraxmus", "radius": 60, "orbitRadius": 179, "orbitSpeed": 0.2198, "angle": 38.659, "flore": 2, "faune": 58}
        ]},
      {"name": "Draura", "radius": 82, "orbitRadius": 1564, "orbitSpeed": 0.0338, "angle": 4.793, "flore": 0, "faune": 75, "moons": [
            {"name": "Nebalmus", "radius": 33, "orbitRadius": 266, "orbitSpeed": 0.2035, "angle": 31.33, "flore": 16, "faune": 25},
            {"name": "Auralnis", "radius": 37, "orbitRadius": 266, "orbitSpeed": 0.2035, "angle": 29.256, "flore": 47, "faune": 52}
        ]},
      {"name": "Kryoslux", "radius": 91, "orbitRadius": 788, "orbitSpeed": 0.052, "angle": 10.67, "flore": 81, "faune": 0, "moons": [
            {"name": "Kryenra", "radius": 37, "orbitRadius": 256, "orbitSpeed": 0.2166, "angle": 40.591, "flore": 40, "faune": 8},
            {"name": "Zetaxvyn", "radius": 29, "orbitRadius": 256, "orbitSpeed": 0.2166, "angle": 41.709, "flore": 2, "faune": 1},
            {"name": "Velumbus", "radius": 43, "orbitRadius": 256, "orbitSpeed": 0.2166, "angle": 45.131, "flore": 6, "faune": 32},
            {"name": "Synira", "radius": 24, "orbitRadius": 424, "orbitSpeed": 0.1601, "angle": 34.067, "flore": 19, "faune": 6},
            {"name": "Thalaxria", "radius": 51, "orbitRadius": 424, "orbitSpeed": 0.1601, "angle": 29.461, "flore": 8, "faune": 17},
            {"name": "Drairdis", "radius": 26, "orbitRadius": 424, "orbitSpeed": 0.1601, "angle": 30.592, "flore": 9, "faune": 36}
        ]},
      {"name": "Pyxandis", "radius": 80, "orbitRadius": 1564, "orbitSpeed": 0.0338, "angle": 7.732, "flore": 52, "faune": 86, "moons": [
            {"name": "Eriivyn", "radius": 35, "orbitRadius": 253, "orbitSpeed": 0.219, "angle": 37.761, "flore": 20, "faune": 53},
            {"name": "Thalisdon", "radius": 23, "orbitRadius": 253, "orbitSpeed": 0.219, "angle": 39.129, "flore": 42, "faune": 58},
            {"name": "Sigadon", "radius": 59, "orbitRadius": 136, "orbitSpeed": 0.2752, "angle": 50.053, "flore": 44, "faune": 55},
            {"name": "Corara", "radius": 53, "orbitRadius": 253, "orbitSpeed": 0.219, "angle": 36.705, "flore": 10, "faune": 9}
        ]},
      {"name": "Palenria", "radius": 85, "orbitRadius": 1564, "orbitSpeed": 0.0338, "angle": 6.666, "flore": 69, "faune": 72, "moons": [
            {"name": "Draalux", "radius": 40, "orbitRadius": 399, "orbitSpeed": 0.3494, "angle": 61.157, "flore": 22, "faune": 51},
            {"name": "Velazar", "radius": 47, "orbitRadius": 232, "orbitSpeed": 0.1978, "angle": 29.962, "flore": 27, "faune": 9},
            {"name": "Omialton", "radius": 44, "orbitRadius": 232, "orbitSpeed": 0.1978, "angle": 31.4, "flore": 6, "faune": 20},
            {"name": "Ithoria", "radius": 54, "orbitRadius": 232, "orbitSpeed": 0.1978, "angle": 33.422, "flore": 35, "faune": 31},
            {"name": "Synelton", "radius": 27, "orbitRadius": 399, "orbitSpeed": 0.3494, "angle": 58.103, "flore": 40, "faune": 10},
            {"name": "Ithumpha", "radius": 41, "orbitRadius": 399, "orbitSpeed": 0.3494, "angle": 57.137, "flore": 5, "faune": 51}
        ]},
      {"name": "Aurumdon", "radius": 87, "orbitRadius": 1564, "orbitSpeed": 0.0338, "angle": 9.433, "flore": 79, "faune": 59, "moons": [
            {"name": "Pyxandis", "radius": 31, "orbitRadius": 316, "orbitSpeed": 0.2817, "angle": 51.694, "flore": 30, "faune": 13},
            {"name": "Synonvyn", "radius": 47, "orbitRadius": 219, "orbitSpeed": 0.2537, "angle": 47.453, "flore": 49, "faune": 34},
            {"name": "Synuvyn", "radius": 36, "orbitRadius": 219, "orbitSpeed": 0.2537, "angle": 49.637, "flore": 16, "faune": 28},
            {"name": "Zanalria", "radius": 41, "orbitRadius": 316, "orbitSpeed": 0.2817, "angle": 50.494, "flore": 36, "faune": 1}
        ]}
    ]},
    {"name": "Auranis", "radius": 244, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 2.833, "color": "#FFE44D", "planets": [
      {"name": "Pyxobus", "radius": 85, "orbitRadius": 599, "orbitSpeed": 0.043, "angle": 4.705, "flore": 93, "faune": 6, "moons": [
            {"name": "Thalenmir", "radius": 54, "orbitRadius": 292, "orbitSpeed": 0.1771, "angle": 24.678, "flore": 41, "faune": 36},
            {"name": "Aurolux", "radius": 23, "orbitRadius": 292, "orbitSpeed": 0.1771, "angle": 25.868, "flore": 12, "faune": 17},
            {"name": "Nebazar", "radius": 49, "orbitRadius": 168, "orbitSpeed": 0.2717, "angle": 38.264, "flore": 34, "faune": 14},
            {"name": "Omiuton", "radius": 47, "orbitRadius": 168, "orbitSpeed": 0.2717, "angle": 33.802, "flore": 33, "faune": 51}
        ]},
      {"name": "Xoristh", "radius": 106, "orbitRadius": 1314, "orbitSpeed": 0.0365, "angle": 2.708, "flore": 25, "faune": 101, "moons": [
            {"name": "Thaluvyn", "radius": 27, "orbitRadius": 221, "orbitSpeed": 0.1999, "angle": 27.354, "flore": 10, "faune": 22},
            {"name": "Eriaxmir", "radius": 57, "orbitRadius": 221, "orbitSpeed": 0.1999, "angle": 21.907, "flore": 17, "faune": 12},
            {"name": "Xoranth", "radius": 59, "orbitRadius": 366, "orbitSpeed": 0.1671, "angle": 23.132, "flore": 32, "faune": 22},
            {"name": "Kryotis", "radius": 55, "orbitRadius": 366, "orbitSpeed": 0.1671, "angle": 21.959, "flore": 0, "faune": 66},
            {"name": "Drautis", "radius": 56, "orbitRadius": 366, "orbitSpeed": 0.1671, "angle": 20.576, "flore": 23, "faune": 25},
            {"name": "Omiomir", "radius": 30, "orbitRadius": 221, "orbitSpeed": 0.1999, "angle": 24.973, "flore": 12, "faune": 17}
        ]},
      {"name": "Kryarbus", "radius": 127, "orbitRadius": 1314, "orbitSpeed": 0.0365, "angle": 3.671, "flore": 51, "faune": 43, "moons": [
            {"name": "Velaxria", "radius": 24, "orbitRadius": 200, "orbitSpeed": 0.2332, "angle": 32.781, "flore": 2, "faune": 32},
            {"name": "Veloslux", "radius": 37, "orbitRadius": 435, "orbitSpeed": 0.2785, "angle": 38.731, "flore": 6, "faune": 61},
            {"name": "Kryalmir", "radius": 34, "orbitRadius": 435, "orbitSpeed": 0.2785, "angle": 32.87, "flore": 12, "faune": 12},
            {"name": "Zetaton", "radius": 35, "orbitRadius": 435, "orbitSpeed": 0.2785, "angle": 34.424, "flore": 5, "faune": 22},
            {"name": "Ithomus", "radius": 37, "orbitRadius": 200, "orbitSpeed": 0.2332, "angle": 28.923, "flore": 35, "faune": 19}
        ]},
      {"name": "Synonbus", "radius": 99, "orbitRadius": 599, "orbitSpeed": 0.043, "angle": 6.087, "flore": 62, "faune": 129, "moons": [
            {"name": "Palaxmir", "radius": 24, "orbitRadius": 234, "orbitSpeed": 0.151, "angle": 23.412, "flore": 31, "faune": 68},
            {"name": "Synosdon", "radius": 57, "orbitRadius": 234, "orbitSpeed": 0.151, "angle": 18.516, "flore": 28, "faune": 35},
            {"name": "Ithonxis", "radius": 54, "orbitRadius": 234, "orbitSpeed": 0.151, "angle": 21.105, "flore": 20, "faune": 29}
        ]},
      {"name": "Pyxaldon", "radius": 82, "orbitRadius": 1314, "orbitSpeed": 0.0365, "angle": 6.074, "flore": 50, "faune": 0, "moons": [
            {"name": "Pyxosbus", "radius": 53, "orbitRadius": 229, "orbitSpeed": 0.3046, "angle": 41.057, "flore": 18, "faune": 78},
            {"name": "Celelzar", "radius": 25, "orbitRadius": 229, "orbitSpeed": 0.3046, "angle": 45.566, "flore": 2, "faune": 19},
            {"name": "Aurumth", "radius": 42, "orbitRadius": 381, "orbitSpeed": 0.3039, "angle": 45.079, "flore": 30, "faune": 9},
            {"name": "Xorobus", "radius": 57, "orbitRadius": 381, "orbitSpeed": 0.3039, "angle": 40.256, "flore": 12, "faune": 1}
        ]}
    ]},
    {"name": "Lyrelbus", "radius": 244, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 2.433, "color": "#FFB830", "planets": [
      {"name": "Kryaton", "radius": 106, "orbitRadius": 771, "orbitSpeed": 0.0347, "angle": 1.413, "flore": 65, "faune": 152, "moons": [
            {"name": "Zetonton", "radius": 28, "orbitRadius": 187, "orbitSpeed": 0.3431, "angle": 34.548, "flore": 49, "faune": 96}
        ]},
      {"name": "Sigummir", "radius": 128, "orbitRadius": 1382, "orbitSpeed": 0.0239, "angle": 5.264, "flore": 57, "faune": 29, "moons": [
            {"name": "Draonth", "radius": 45, "orbitRadius": 471, "orbitSpeed": 0.1844, "angle": 13.817, "flore": 31, "faune": 2},
            {"name": "Xorenis", "radius": 41, "orbitRadius": 272, "orbitSpeed": 0.1682, "angle": 13.067, "flore": 20, "faune": 30},
            {"name": "Nebismir", "radius": 42, "orbitRadius": 272, "orbitSpeed": 0.1682, "angle": 14.034, "flore": 37, "faune": 34},
            {"name": "Pyxendis", "radius": 30, "orbitRadius": 272, "orbitSpeed": 0.1682, "angle": 16.167, "flore": 6, "faune": 13},
            {"name": "Lyrarvyn", "radius": 59, "orbitRadius": 471, "orbitSpeed": 0.1844, "angle": 16.346, "flore": 4, "faune": 96}
        ]},
      {"name": "Velubus", "radius": 83, "orbitRadius": 1382, "orbitSpeed": 0.0239, "angle": -0.118, "flore": 13, "faune": 10, "moons": [
            {"name": "Aurumbus", "radius": 43, "orbitRadius": 146, "orbitSpeed": 0.2634, "angle": 22.439, "flore": 8, "faune": 74},
            {"name": "Corarmir", "radius": 41, "orbitRadius": 313, "orbitSpeed": 0.3119, "angle": 27.08, "flore": 31, "faune": 82},
            {"name": "Sigondis", "radius": 40, "orbitRadius": 313, "orbitSpeed": 0.3119, "angle": 21.861, "flore": 48, "faune": 88},
            {"name": "Celaxlux", "radius": 29, "orbitRadius": 313, "orbitSpeed": 0.3119, "angle": 23.938, "flore": 12, "faune": 16},
            {"name": "Zetepha", "radius": 60, "orbitRadius": 313, "orbitSpeed": 0.3119, "angle": 24.601, "flore": 41, "faune": 19}
        ]},
      {"name": "Omioston", "radius": 85, "orbitRadius": 771, "orbitSpeed": 0.0347, "angle": 2.666, "flore": 63, "faune": 22, "moons": [
            {"name": "Erienton", "radius": 58, "orbitRadius": 174, "orbitSpeed": 0.2812, "angle": 26.509, "flore": 20, "faune": 8},
            {"name": "Vororia", "radius": 55, "orbitRadius": 174, "orbitSpeed": 0.2812, "angle": 21.643, "flore": 14, "faune": 47}
        ]},
      {"name": "Eriirxis", "radius": 127, "orbitRadius": 1382, "orbitSpeed": 0.0239, "angle": 1.861, "flore": 86, "faune": 21, "moons": [
            {"name": "Kryarmir", "radius": 54, "orbitRadius": 375, "orbitSpeed": 0.3041, "angle": 26.84, "flore": 15, "faune": 0},
            {"name": "Zanirzar", "radius": 28, "orbitRadius": 245, "orbitSpeed": 0.312, "angle": 28.727, "flore": 25, "faune": 34},
            {"name": "Palumzar", "radius": 46, "orbitRadius": 245, "orbitSpeed": 0.312, "angle": 33.028, "flore": 23, "faune": 11},
            {"name": "Eriemus", "radius": 50, "orbitRadius": 375, "orbitSpeed": 0.3041, "angle": 31.012, "flore": 41, "faune": 63}
        ]}
    ]},
    {"name": "Syniton", "radius": 226, "orbitRadius": 10922, "orbitSpeed": 0.0048, "angle": 1.977, "color": "#FFB830", "planets": [
      {"name": "Celumdon", "radius": 94, "orbitRadius": 870, "orbitSpeed": 0.0312, "angle": 0.007, "flore": 8, "faune": 46, "moons": [
            {"name": "Thaluria", "radius": 22, "orbitRadius": 180, "orbitSpeed": 0.2387, "angle": 4.959, "flore": 3, "faune": 0},
            {"name": "Velosra", "radius": 46, "orbitRadius": 356, "orbitSpeed": 0.2663, "angle": 6.131, "flore": 6, "faune": 28},
            {"name": "Zaninis", "radius": 60, "orbitRadius": 356, "orbitSpeed": 0.2663, "angle": 6.917, "flore": 5, "faune": 22},
            {"name": "Velonpha", "radius": 24, "orbitRadius": 356, "orbitSpeed": 0.2663, "angle": 10.112, "flore": 3, "faune": 13},
            {"name": "Aurumtis", "radius": 40, "orbitRadius": 180, "orbitSpeed": 0.2387, "angle": 8.662, "flore": 4, "faune": 10},
            {"name": "Kryuvyn", "radius": 42, "orbitRadius": 180, "orbitSpeed": 0.2387, "angle": 7.88, "flore": 3, "faune": 10}
        ]},
      {"name": "Pyxislux", "radius": 121, "orbitRadius": 388, "orbitSpeed": 0.0703, "angle": 2.68, "flore": 10, "faune": 15, "moons": [
        ]},
      {"name": "Synobus", "radius": 100, "orbitRadius": 2001, "orbitSpeed": 0.02, "angle": -1.521, "flore": 5, "faune": 31, "moons": [
            {"name": "Draardis", "radius": 28, "orbitRadius": 301, "orbitSpeed": 0.2962, "angle": 10.884, "flore": 3, "faune": 26},
            {"name": "Thalisdis", "radius": 25, "orbitRadius": 301, "orbitSpeed": 0.2962, "angle": 5.916, "flore": 4, "faune": 16},
            {"name": "Xoroston", "radius": 27, "orbitRadius": 301, "orbitSpeed": 0.2962, "angle": 6.964, "flore": 4, "faune": 7},
            {"name": "Omiantis", "radius": 37, "orbitRadius": 545, "orbitSpeed": 0.1953, "angle": 5.609, "flore": 4, "faune": 32},
            {"name": "Celirzar", "radius": 48, "orbitRadius": 545, "orbitSpeed": 0.1953, "angle": 5.957, "flore": 5, "faune": 46},
            {"name": "Corirria", "radius": 50, "orbitRadius": 545, "orbitSpeed": 0.1953, "angle": 7.243, "flore": 4, "faune": 5},
            {"name": "Vorinis", "radius": 34, "orbitRadius": 301, "orbitSpeed": 0.2962, "angle": 8.962, "flore": 4, "faune": 36}
        ]},
      {"name": "Velonvyn", "radius": 86, "orbitRadius": 2001, "orbitSpeed": 0.02, "angle": 0.385, "flore": 7, "faune": 31, "moons": [
            {"name": "Xorenmus", "radius": 40, "orbitRadius": 286, "orbitSpeed": 0.326, "angle": 9.91, "flore": 2, "faune": 12},
            {"name": "Lyrenvyn", "radius": 35, "orbitRadius": 286, "orbitSpeed": 0.326, "angle": 10.861, "flore": 6, "faune": 3},
            {"name": "Palalth", "radius": 24, "orbitRadius": 201, "orbitSpeed": 0.2181, "angle": 6.913, "flore": 6, "faune": 41},
            {"name": "Corumvyn", "radius": 34, "orbitRadius": 201, "orbitSpeed": 0.2181, "angle": 8.035, "flore": 3, "faune": 40},
            {"name": "Aurivyn", "radius": 50, "orbitRadius": 286, "orbitSpeed": 0.326, "angle": 14.062, "flore": 2, "faune": 31}
        ]},
      {"name": "Nebosvyn", "radius": 128, "orbitRadius": 2001, "orbitSpeed": 0.02, "angle": 1.387, "flore": 4, "faune": 39, "moons": [
            {"name": "Velomus", "radius": 51, "orbitRadius": 439, "orbitSpeed": 0.1811, "angle": 6.893, "flore": 4, "faune": 17},
            {"name": "Synarxis", "radius": 33, "orbitRadius": 217, "orbitSpeed": 0.3177, "angle": 12.397, "flore": 4, "faune": 15},
            {"name": "Nebumbus", "radius": 56, "orbitRadius": 439, "orbitSpeed": 0.1811, "angle": 5.314, "flore": 5, "faune": 22},
            {"name": "Veladon", "radius": 38, "orbitRadius": 217, "orbitSpeed": 0.3177, "angle": 11.207, "flore": 1, "faune": 14},
            {"name": "Auroszar", "radius": 39, "orbitRadius": 439, "orbitSpeed": 0.1811, "angle": 8.631, "flore": 3, "faune": 45}
        ]},
      {"name": "Zanora", "radius": 104, "orbitRadius": 2001, "orbitSpeed": 0.02, "angle": 2.605, "flore": 3, "faune": 18, "moons": [
            {"name": "Synarbus", "radius": 53, "orbitRadius": 331, "orbitSpeed": 0.3426, "angle": 4.777, "flore": 1, "faune": 40},
            {"name": "Draonmus", "radius": 29, "orbitRadius": 240, "orbitSpeed": 0.2393, "angle": 4.118, "flore": 1, "faune": 46},
            {"name": "Kryopha", "radius": 32, "orbitRadius": 331, "orbitSpeed": 0.3426, "angle": 5.995, "flore": 3, "faune": 24},
            {"name": "Zanispha", "radius": 51, "orbitRadius": 240, "orbitSpeed": 0.2393, "angle": 5.64, "flore": 4, "faune": 26},
            {"name": "Velandis", "radius": 49, "orbitRadius": 331, "orbitSpeed": 0.3426, "angle": 7.704, "flore": 5, "faune": 45},
            {"name": "Velumpha", "radius": 31, "orbitRadius": 331, "orbitSpeed": 0.3426, "angle": 3.055, "flore": 5, "faune": 37}
        ]},
      {"name": "Omiuria", "radius": 87, "orbitRadius": 870, "orbitSpeed": 0.0312, "angle": 2.929, "flore": 3, "faune": 70, "moons": [
            {"name": "Celaxvyn", "radius": 25, "orbitRadius": 242, "orbitSpeed": 0.2268, "angle": 8.829, "flore": 5, "faune": 15},
            {"name": "Pyxiria", "radius": 48, "orbitRadius": 242, "orbitSpeed": 0.2268, "angle": 13.874, "flore": 1, "faune": 21},
            {"name": "Voranmus", "radius": 34, "orbitRadius": 242, "orbitSpeed": 0.2268, "angle": 11.831, "flore": 5, "faune": 19}
        ]},
      {"name": "Xorelnis", "radius": 116, "orbitRadius": 388, "orbitSpeed": 0.0703, "angle": 5.809, "flore": 9, "faune": 40, "moons": [
        ]},
      {"name": "Synirdis", "radius": 109, "orbitRadius": 2001, "orbitSpeed": 0.02, "angle": -2.578, "flore": 7, "faune": 23, "moons": [
            {"name": "Aurexis", "radius": 39, "orbitRadius": 257, "orbitSpeed": 0.314, "angle": 0.663, "flore": 6, "faune": 34}
        ]}
    ]}
  ],
  "asteroidBelts": []
  }
];
