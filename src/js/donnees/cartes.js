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
        { "name": "Vorenxis", "radius": 115, "orbitRadius": 450, "orbitSpeed": 0.0451, "angle": 6.049, "flore": 60, "faune": 31,
          "moons": [
            { "name": "Omiarria", "radius": 28, "orbitRadius": 198, "orbitSpeed": 0.3028, "angle": 54.086, "flore": 31, "faune": 59 },
            { "name": "Lyrondis", "radius": 26, "orbitRadius": 198, "orbitSpeed": 0.3028, "angle": 51.863, "flore": 17, "faune": 60 },
            { "name": "Velalzar", "radius": 35, "orbitRadius": 247, "orbitSpeed": 0.2917, "angle": 48.066, "flore": 13, "faune": 57 }
          ]
        },
        { "name": "Ithosmus", "radius": 71, "orbitRadius": 450, "orbitSpeed": 0.0451, "angle": 10.169, "flore": 42, "faune": 79,
          "moons": [
            { "name": "Nebisdis", "radius": 26, "orbitRadius": 181, "orbitSpeed": 0.3159, "angle": 44.733, "flore": 14, "faune": 26 },
            { "name": "Eriunis", "radius": 41, "orbitRadius": 181, "orbitSpeed": 0.3159, "angle": 46.609, "flore": 35, "faune": 34 }
          ]
        },
        { "name": "Synaxra", "radius": 84, "orbitRadius": 268, "orbitSpeed": 0.0616, "angle": 4.193, "flore": 11, "faune": 74, "moons": [] }
      ]
    },
    {
      "name": "Thalarmir", "radius": 208, "orbitRadius": 1010, "orbitSpeed": 0.0186, "angle": 1.384, "color": "#7CB9FF",
      "planets": [
        { "name": "Auredis", "radius": 108, "orbitRadius": 478, "orbitSpeed": 0.0432, "angle": 6.688, "flore": 13, "faune": 24,
          "moons": [
            { "name": "Sigaxria", "radius": 48, "orbitRadius": 184, "orbitSpeed": 0.3418, "angle": 27.737, "flore": 8, "faune": 48 },
            { "name": "Thaliria", "radius": 35, "orbitRadius": 184, "orbitSpeed": 0.3418, "angle": 25.809, "flore": 41, "faune": 47 },
            { "name": "Erionton", "radius": 25, "orbitRadius": 232, "orbitSpeed": 0.2729, "angle": 18.924, "flore": 14, "faune": 31 }
          ]
        },
        { "name": "Draumus", "radius": 125, "orbitRadius": 478, "orbitSpeed": 0.0432, "angle": 3.132, "flore": 89, "faune": 20, "moons": [] }
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
        { "name": "Velenxis", "radius": 114, "orbitRadius": 413, "orbitSpeed": 0.0453, "angle": 1.638, "flore": 94, "faune": 82,
          "moons": [
            { "name": "Paliton", "radius": 48, "orbitRadius": 196, "orbitSpeed": 0.1595, "angle": 4.007, "flore": 42, "faune": 16 },
            { "name": "Zanadon", "radius": 60, "orbitRadius": 196, "orbitSpeed": 0.1595, "angle": 6.275, "flore": 5, "faune": 51 }
          ]
        },
        { "name": "Auristis", "radius": 117, "orbitRadius": 920, "orbitSpeed": 0.0324, "angle": -1.063, "flore": 28, "faune": 42,
          "moons": [
            { "name": "Itheldon", "radius": 22, "orbitRadius": 194, "orbitSpeed": 0.3312, "angle": 13.179, "flore": 45, "faune": 56 },
            { "name": "Voridon", "radius": 26, "orbitRadius": 194, "orbitSpeed": 0.3312, "angle": 10.7, "flore": 34, "faune": 54 }
          ]
        },
        { "name": "Thalarlux", "radius": 124, "orbitRadius": 920, "orbitSpeed": 0.0324, "angle": 0.65, "flore": 51, "faune": 64,
          "moons": [
            { "name": "Lyrumir", "radius": 33, "orbitRadius": 252, "orbitSpeed": 0.1527, "angle": 2.608, "flore": 44, "faune": 49 }
          ]
        },
        { "name": "Lyrelton", "radius": 110, "orbitRadius": 920, "orbitSpeed": 0.0324, "angle": 2.623, "flore": 1, "faune": 3,
          "moons": [
            { "name": "Thalendis", "radius": 23, "orbitRadius": 270, "orbitSpeed": 0.271, "angle": 4.708, "flore": 50, "faune": 42 },
            { "name": "Vorismus", "radius": 31, "orbitRadius": 270, "orbitSpeed": 0.271, "angle": 10.454, "flore": 5, "faune": 22 },
            { "name": "Corenmir", "radius": 27, "orbitRadius": 218, "orbitSpeed": 0.216, "angle": 6.329, "flore": 34, "faune": 19 }
          ]
        }
      ]
    },
    {
      "name": "Ithexis", "radius": 243, "orbitRadius": 1513, "orbitSpeed": 0.0151, "angle": 3.213, "color": "#FF6B6B",
      "planets": [
        { "name": "Zanosnis", "radius": 72, "orbitRadius": 495, "orbitSpeed": 0.0494, "angle": 1.722, "flore": 88, "faune": 75,
          "moons": [
            { "name": "Auranra", "radius": 34, "orbitRadius": 149, "orbitSpeed": 0.1583, "angle": 2.169, "flore": 6, "faune": 59 },
            { "name": "Siganton", "radius": 26, "orbitRadius": 149, "orbitSpeed": 0.1583, "angle": 0.388, "flore": 38, "faune": 58 },
            { "name": "Kryaxpha", "radius": 39, "orbitRadius": 206, "orbitSpeed": 0.183, "angle": 4.578, "flore": 38, "faune": 42 }
          ]
        },
        { "name": "Celenria", "radius": 109, "orbitRadius": 930, "orbitSpeed": 0.0309, "angle": -0.336, "flore": 99, "faune": 66,
          "moons": [
            { "name": "Nebelria", "radius": 31, "orbitRadius": 179, "orbitSpeed": 0.2834, "angle": 6.308, "flore": 31, "faune": 19 },
            { "name": "Thalaxvyn", "radius": 51, "orbitRadius": 179, "orbitSpeed": 0.2834, "angle": 1.83, "flore": 42, "faune": 60 }
          ]
        },
        { "name": "Lyrenxis", "radius": 127, "orbitRadius": 495, "orbitSpeed": 0.0494, "angle": -1.607, "flore": 44, "faune": 93, "moons": [] },
        { "name": "Celumton", "radius": 115, "orbitRadius": 930, "orbitSpeed": 0.0309, "angle": 2.969, "flore": 37, "faune": 33,
          "moons": [
            { "name": "Kryanis", "radius": 27, "orbitRadius": 237, "orbitSpeed": 0.3072, "angle": 3.178, "flore": 5, "faune": 24 },
            { "name": "Erielvyn", "radius": 26, "orbitRadius": 279, "orbitSpeed": 0.1855, "angle": 3.263, "flore": 44, "faune": 41 },
            { "name": "Velivyn", "radius": 36, "orbitRadius": 237, "orbitSpeed": 0.3072, "angle": 6.637, "flore": 20, "faune": 13 },
            { "name": "Voraxnis", "radius": 57, "orbitRadius": 237, "orbitSpeed": 0.3072, "angle": 1.624, "flore": 18, "faune": 21 },
            { "name": "Velipha", "radius": 22, "orbitRadius": 237, "orbitSpeed": 0.3072, "angle": 2.523, "flore": 2, "faune": 13 }
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
        { "name": "Pyxirlux", "radius": 111, "orbitRadius": 550, "orbitSpeed": 0.0475, "angle": 2.856, "flore": 22, "faune": 53,
          "moons": [
            { "name": "Ithonnis", "radius": 26, "orbitRadius": 244, "orbitSpeed": 0.3019, "angle": 3.652, "flore": 26, "faune": 37 },
            { "name": "Palath", "radius": 44, "orbitRadius": 244, "orbitSpeed": 0.3019, "angle": 5.757, "flore": 23, "faune": 13 }
          ]
        },
        { "name": "Ithaxdon", "radius": 80, "orbitRadius": 550, "orbitSpeed": 0.0475, "angle": -0.628, "flore": 23, "faune": 80,
          "moons": [
            { "name": "Zanamir", "radius": 43, "orbitRadius": 162, "orbitSpeed": 0.3118, "angle": 2.684, "flore": 11, "faune": 35 },
            { "name": "Zetovyn", "radius": 23, "orbitRadius": 162, "orbitSpeed": 0.3118, "angle": 0.449, "flore": 13, "faune": 45 }
          ]
        }
      ]
    },
    {
      "name": "Synaxra", "radius": 242, "orbitRadius": 3080, "orbitSpeed": 0.0118, "angle": -2.405, "color": "#7CB9FF",
      "planets": [
        { "name": "Pyxelra", "radius": 77, "orbitRadius": 529, "orbitSpeed": 0.0458, "angle": 2.666, "flore": 40, "faune": 19,
          "moons": [
            { "name": "Nebuton", "radius": 27, "orbitRadius": 192, "orbitSpeed": 0.2246, "angle": -1.265, "flore": 49, "faune": 43 },
            { "name": "Lyriria", "radius": 48, "orbitRadius": 192, "orbitSpeed": 0.2246, "angle": 3.303, "flore": 40, "faune": 29 },
            { "name": "Nebismus", "radius": 27, "orbitRadius": 261, "orbitSpeed": 0.2635, "angle": 2.385, "flore": 22, "faune": 12 },
            { "name": "Pyxosra", "radius": 28, "orbitRadius": 261, "orbitSpeed": 0.2635, "angle": 1.147, "flore": 49, "faune": 22 },
            { "name": "Draapha", "radius": 48, "orbitRadius": 261, "orbitSpeed": 0.2635, "angle": -1.824, "flore": 11, "faune": 22 }
          ]
        },
        { "name": "Corapha", "radius": 105, "orbitRadius": 529, "orbitSpeed": 0.0458, "angle": 0.006, "flore": 47, "faune": 47,
          "moons": [
            { "name": "Pyxoslux", "radius": 35, "orbitRadius": 160, "orbitSpeed": 0.2045, "angle": -1.015, "flore": 16, "faune": 35 },
            { "name": "Zanora", "radius": 47, "orbitRadius": 160, "orbitSpeed": 0.2045, "angle": 0.604, "flore": 10, "faune": 19 }
          ]
        },
        { "name": "Nebisxis", "radius": 99, "orbitRadius": 743, "orbitSpeed": 0.0331, "angle": 1.245, "flore": 19, "faune": 49,
          "moons": [
            { "name": "Thalirth", "radius": 40, "orbitRadius": 160, "orbitSpeed": 0.3096, "angle": 0.097, "flore": 28, "faune": 25 },
            { "name": "Palalvyn", "radius": 30, "orbitRadius": 266, "orbitSpeed": 0.2675, "angle": 0.33, "flore": 15, "faune": 27 },
            { "name": "Synospha", "radius": 21, "orbitRadius": 266, "orbitSpeed": 0.2675, "angle": 3.132, "flore": 25, "faune": 18 }
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
        { "name": "Draonmir", "radius": 117, "orbitRadius": 625, "orbitSpeed": 0.0489, "angle": 7.088, "flore": 64, "faune": 59,
          "moons": [
            { "name": "Voronbus", "radius": 31, "orbitRadius": 184, "orbitSpeed": 0.1696, "angle": 19.048, "flore": 36, "faune": 46 },
            { "name": "Eriath", "radius": 38, "orbitRadius": 311, "orbitSpeed": 0.1759, "angle": 21.705, "flore": 3, "faune": 1 },
            { "name": "Zetaxlux", "radius": 48, "orbitRadius": 311, "orbitSpeed": 0.1759, "angle": 23.49, "flore": 43, "faune": 56 }
          ]
        },
        { "name": "Omiirria", "radius": 74, "orbitRadius": 1002, "orbitSpeed": 0.038, "angle": 8.234, "flore": 68, "faune": 35,
          "moons": [
            { "name": "Pyxaltis", "radius": 39, "orbitRadius": 210, "orbitSpeed": 0.1712, "angle": 20.036, "flore": 50, "faune": 36 },
            { "name": "Synedon", "radius": 52, "orbitRadius": 210, "orbitSpeed": 0.1712, "angle": 22.513, "flore": 40, "faune": 19 }
          ]
        },
        { "name": "Kryonxis", "radius": 123, "orbitRadius": 1002, "orbitSpeed": 0.038, "angle": 4.194, "flore": 76, "faune": 9,
          "moons": [
            { "name": "Erianvyn", "radius": 49, "orbitRadius": 218, "orbitSpeed": 0.3216, "angle": 46.587, "flore": 7, "faune": 55 },
            { "name": "Nebanria", "radius": 32, "orbitRadius": 331, "orbitSpeed": 0.1937, "angle": 17.911, "flore": 25, "faune": 59 }
          ]
        }
      ]
    },
    {
      "name": "Xorilux", "radius": 241, "orbitRadius": 1687, "orbitSpeed": 0.016, "angle": -1.493, "color": "#FF8C42",
      "planets": [
        { "name": "Synonth", "radius": 112, "orbitRadius": 978, "orbitSpeed": 0.0364, "angle": 2.267, "flore": 62, "faune": 66,
          "moons": [
            { "name": "Veluxis", "radius": 21, "orbitRadius": 191, "orbitSpeed": 0.2171, "angle": 20.388, "flore": 16, "faune": 42 },
            { "name": "Xorendon", "radius": 26, "orbitRadius": 405, "orbitSpeed": 0.2605, "angle": 21.248, "flore": 8, "faune": 56 },
            { "name": "Corixis", "radius": 57, "orbitRadius": 405, "orbitSpeed": 0.2605, "angle": 22.763, "flore": 12, "faune": 50 },
            { "name": "Palumxis", "radius": 24, "orbitRadius": 405, "orbitSpeed": 0.2605, "angle": 19.193, "flore": 46, "faune": 33 }
          ]
        }
      ]
    },
    {
      "name": "Palazar", "radius": 218, "orbitRadius": 2797, "orbitSpeed": 0.01, "angle": 3.014, "color": "#FFE44D",
      "planets": [
        { "name": "Kryaxria", "radius": 86, "orbitRadius": 473, "orbitSpeed": 0.0676, "angle": 2.985, "flore": 67, "faune": 19,
          "moons": [
            { "name": "Aurenxis", "radius": 45, "orbitRadius": 192, "orbitSpeed": 0.1675, "angle": 6.178, "flore": 11, "faune": 54 },
            { "name": "Corenria", "radius": 34, "orbitRadius": 243, "orbitSpeed": 0.2531, "angle": 10.621, "flore": 41, "faune": 10 },
            { "name": "Kryardis", "radius": 36, "orbitRadius": 192, "orbitSpeed": 0.1675, "angle": 3.636, "flore": 30, "faune": 55 }
          ]
        },
        { "name": "Draanpha", "radius": 91, "orbitRadius": 801, "orbitSpeed": 0.0356, "angle": 0.29, "flore": 86, "faune": 72,
          "moons": [
            { "name": "Ithumvyn", "radius": 54, "orbitRadius": 176, "orbitSpeed": 0.2399, "angle": 7.553, "flore": 46, "faune": 55 },
            { "name": "Xorenra", "radius": 32, "orbitRadius": 176, "orbitSpeed": 0.2399, "angle": 5.581, "flore": 48, "faune": 47 }
          ]
        },
        { "name": "Sigomus", "radius": 112, "orbitRadius": 801, "orbitSpeed": 0.0356, "angle": 4.304, "flore": 5, "faune": 37,
          "moons": [
            { "name": "Celarria", "radius": 56, "orbitRadius": 213, "orbitSpeed": 0.1754, "angle": 4.289, "flore": 9, "faune": 26 },
            { "name": "Eriudis", "radius": 54, "orbitRadius": 213, "orbitSpeed": 0.1754, "angle": 6.821, "flore": 11, "faune": 20 },
            { "name": "Xorenton", "radius": 59, "orbitRadius": 379, "orbitSpeed": 0.1939, "angle": 2.932, "flore": 40, "faune": 54 },
            { "name": "Omiidis", "radius": 32, "orbitRadius": 379, "orbitSpeed": 0.1939, "angle": 6.383, "flore": 32, "faune": 17 }
          ]
        }
      ]
    },
    {
      "name": "Pyxudon", "radius": 244, "orbitRadius": 2797, "orbitSpeed": 0.01, "angle": -0.392, "color": "#FF6B6B",
      "planets": [
        { "name": "Sigozar", "radius": 94, "orbitRadius": 542, "orbitSpeed": 0.0519, "angle": 0.458, "flore": 53, "faune": 29,
          "moons": [
            { "name": "Vorirmus", "radius": 46, "orbitRadius": 222, "orbitSpeed": 0.3025, "angle": 1.216, "flore": 33, "faune": 60 },
            { "name": "Aurandis", "radius": 44, "orbitRadius": 222, "orbitSpeed": 0.3025, "angle": 5.132, "flore": 44, "faune": 10 },
            { "name": "Thalepha", "radius": 35, "orbitRadius": 149, "orbitSpeed": 0.1575, "angle": 1.677, "flore": 37, "faune": 12 }
          ]
        },
        { "name": "Zetalra", "radius": 99, "orbitRadius": 734, "orbitSpeed": 0.0553, "angle": -1.113, "flore": 11, "faune": 75,
          "moons": [
            { "name": "Syniria", "radius": 40, "orbitRadius": 159, "orbitSpeed": 0.3499, "angle": 6.648, "flore": 26, "faune": 37 },
            { "name": "Corirxis", "radius": 30, "orbitRadius": 159, "orbitSpeed": 0.3499, "angle": 3.067, "flore": 34, "faune": 42 },
            { "name": "Zanazar", "radius": 60, "orbitRadius": 354, "orbitSpeed": 0.2866, "angle": 3.025, "flore": 40, "faune": 47 }
          ]
        },
        { "name": "Celipha", "radius": 71, "orbitRadius": 542, "orbitSpeed": 0.0519, "angle": 3.612, "flore": 32, "faune": 96,
          "moons": [
            { "name": "Zetalmir", "radius": 34, "orbitRadius": 129, "orbitSpeed": 0.1568, "angle": 1.444, "flore": 4, "faune": 7 },
            { "name": "Palenton", "radius": 23, "orbitRadius": 129, "orbitSpeed": 0.1568, "angle": -0.731, "flore": 37, "faune": 16 }
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
        { "name": "Ithalria", "radius": 96, "orbitRadius": 487, "orbitSpeed": 0.0556, "angle": 4.343, "flore": 45, "faune": 16,
          "moons": [
            { "name": "Aurumpha", "radius": 22, "orbitRadius": 169, "orbitSpeed": 0.1503, "angle": 8.77, "flore": 42, "faune": 18 },
            { "name": "Erialria", "radius": 33, "orbitRadius": 169, "orbitSpeed": 0.1503, "angle": 11.17, "flore": 50, "faune": 26 },
            { "name": "Zanumtis", "radius": 20, "orbitRadius": 169, "orbitSpeed": 0.1503, "angle": 9.762, "flore": 50, "faune": 24 }
          ]
        },
        { "name": "Zanumra", "radius": 81, "orbitRadius": 487, "orbitSpeed": 0.0556, "angle": 2.269, "flore": 40, "faune": 49,
          "moons": [
            { "name": "Kryexis", "radius": 42, "orbitRadius": 180, "orbitSpeed": 0.3424, "angle": 25.716, "flore": 47, "faune": 18 },
            { "name": "Thaluxis", "radius": 49, "orbitRadius": 180, "orbitSpeed": 0.3424, "angle": 24.297, "flore": 4, "faune": 19 },
            { "name": "Xorelmir", "radius": 36, "orbitRadius": 242, "orbitSpeed": 0.2466, "angle": 16.115, "flore": 39, "faune": 52 },
            { "name": "Voruria", "radius": 34, "orbitRadius": 242, "orbitSpeed": 0.2466, "angle": 14.53, "flore": 42, "faune": 53 }
          ]
        }
      ]
    },
    {
      "name": "Nebanlux", "radius": 178, "orbitRadius": 936, "orbitSpeed": 0.0172, "angle": -0.908, "color": "#FF6B6B",
      "planets": [
        { "name": "Velonlux", "radius": 92, "orbitRadius": 368, "orbitSpeed": 0.0519, "angle": 1.987, "flore": 38, "faune": 60,
          "moons": [
            { "name": "Auranxis", "radius": 37, "orbitRadius": 179, "orbitSpeed": 0.2778, "angle": 13.421, "flore": 7, "faune": 36 }
          ]
        },
        { "name": "Ithospha", "radius": 89, "orbitRadius": 368, "orbitSpeed": 0.0519, "angle": 4.726, "flore": 50, "faune": 97,
          "moons": [
            { "name": "Zetera", "radius": 32, "orbitRadius": 144, "orbitSpeed": 0.1765, "angle": 5.847, "flore": 26, "faune": 16 },
            { "name": "Synalbus", "radius": 35, "orbitRadius": 144, "orbitSpeed": 0.1765, "angle": 10.091, "flore": 45, "faune": 49 }
          ]
        },
        { "name": "Zanumvyn", "radius": 78, "orbitRadius": 629, "orbitSpeed": 0.0476, "angle": 5.433, "flore": 30, "faune": 86,
          "moons": [
            { "name": "Aurumth", "radius": 43, "orbitRadius": 218, "orbitSpeed": 0.3409, "angle": 13.397, "flore": 0, "faune": 19 },
            { "name": "Synaxxis", "radius": 24, "orbitRadius": 218, "orbitSpeed": 0.3409, "angle": 17.809, "flore": 36, "faune": 54 }
          ]
        }
      ]
    },
    {
      "name": "Voroton", "radius": 171, "orbitRadius": 2322, "orbitSpeed": 0.0155, "angle": 0.253, "color": "#FF8C42",
      "planets": [
        { "name": "Coronlux", "radius": 104, "orbitRadius": 746, "orbitSpeed": 0.034, "angle": 0.013, "flore": 34, "faune": 48,
          "moons": [
            { "name": "Kryabus", "radius": 38, "orbitRadius": 213, "orbitSpeed": 0.2691, "angle": 2.005, "flore": 8, "faune": 1 },
            { "name": "Erienis", "radius": 48, "orbitRadius": 213, "orbitSpeed": 0.2691, "angle": 4.988, "flore": 26, "faune": 20 },
            { "name": "Velexis", "radius": 29, "orbitRadius": 450, "orbitSpeed": 0.3281, "angle": 4.716, "flore": 10, "faune": 27 },
            { "name": "Omielxis", "radius": 50, "orbitRadius": 450, "orbitSpeed": 0.3281, "angle": 1.591, "flore": 38, "faune": 20 },
            { "name": "Palalxis", "radius": 57, "orbitRadius": 450, "orbitSpeed": 0.3281, "angle": 6.408, "flore": 15, "faune": 36 },
            { "name": "Kryisria", "radius": 53, "orbitRadius": 450, "orbitSpeed": 0.3281, "angle": 6.274, "flore": 11, "faune": 33 }
          ]
        },
        { "name": "Thalendon", "radius": 116, "orbitRadius": 746, "orbitSpeed": 0.034, "angle": 3.567, "flore": 25, "faune": 63,
          "moons": [
            { "name": "Sigalra", "radius": 23, "orbitRadius": 209, "orbitSpeed": 0.2724, "angle": 3.654, "flore": 44, "faune": 18 },
            { "name": "Corolux", "radius": 60, "orbitRadius": 302, "orbitSpeed": 0.1807, "angle": 0.91, "flore": 45, "faune": 52 },
            { "name": "Voraxlux", "radius": 42, "orbitRadius": 209, "orbitSpeed": 0.2724, "angle": 6.116, "flore": 48, "faune": 16 }
          ]
        }
      ]
    },
    {
      "name": "Corandis", "radius": 216, "orbitRadius": 2322, "orbitSpeed": 0.0155, "angle": 1.943, "color": "#FFB830",
      "planets": [
        { "name": "Nebuzar", "radius": 71, "orbitRadius": 321, "orbitSpeed": 0.0661, "angle": 6.543, "flore": 25, "faune": 6, "moons": [] },
        { "name": "Zanalxis", "radius": 119, "orbitRadius": 643, "orbitSpeed": 0.0465, "angle": 3.444, "flore": 12, "faune": 85,
          "moons": [
            { "name": "Zetirbus", "radius": 42, "orbitRadius": 178, "orbitSpeed": 0.2048, "angle": 21.437, "flore": 19, "faune": 47 },
            { "name": "Lyrisxis", "radius": 32, "orbitRadius": 178, "orbitSpeed": 0.2048, "angle": 18.995, "flore": 33, "faune": 0 },
            { "name": "Vorirmir", "radius": 29, "orbitRadius": 242, "orbitSpeed": 0.2663, "angle": 23.548, "flore": 34, "faune": 40 },
            { "name": "Kryeldis", "radius": 37, "orbitRadius": 242, "orbitSpeed": 0.2663, "angle": 22.121, "flore": 35, "faune": 2 }
          ]
        }
      ]
    },
    {
      "name": "Aurovyn", "radius": 156, "orbitRadius": 2322, "orbitSpeed": 0.0155, "angle": 4.504, "color": "#FF8C42",
      "planets": [
        { "name": "Omiedis", "radius": 117, "orbitRadius": 994, "orbitSpeed": 0.0283, "angle": 3.701, "flore": 32, "faune": 3,
          "moons": [
            { "name": "Velumria", "radius": 24, "orbitRadius": 156, "orbitSpeed": 0.2336, "angle": 2.979, "flore": 35, "faune": 39 }
          ]
        },
        { "name": "Zanarmir", "radius": 107, "orbitRadius": 654, "orbitSpeed": 0.0586, "angle": 6.159, "flore": 32, "faune": 46,
          "moons": [
            { "name": "Draalux", "radius": 30, "orbitRadius": 151, "orbitSpeed": 0.2427, "angle": 7.305, "flore": 14, "faune": 58 }
          ]
        },
        { "name": "Ithilux", "radius": 113, "orbitRadius": 654, "orbitSpeed": 0.0586, "angle": 4.099, "flore": 20, "faune": 26,
          "moons": [
            { "name": "Palonth", "radius": 54, "orbitRadius": 234, "orbitSpeed": 0.3252, "angle": 11.079, "flore": 40, "faune": 52 },
            { "name": "Draellux", "radius": 24, "orbitRadius": 234, "orbitSpeed": 0.3252, "angle": 13.061, "flore": 9, "faune": 2 },
            { "name": "Kryirbus", "radius": 33, "orbitRadius": 234, "orbitSpeed": 0.3252, "angle": 8.551, "flore": 29, "faune": 26 }
          ]
        },
        { "name": "Thalonis", "radius": 123, "orbitRadius": 994, "orbitSpeed": 0.0283, "angle": 5.201, "flore": 21, "faune": 71,
          "moons": [
            { "name": "Vorilux", "radius": 33, "orbitRadius": 201, "orbitSpeed": 0.3049, "angle": 6.651, "flore": 22, "faune": 6 },
            { "name": "Corabus", "radius": 26, "orbitRadius": 201, "orbitSpeed": 0.3049, "angle": 10.775, "flore": 33, "faune": 5 },
            { "name": "Thalirxis", "radius": 46, "orbitRadius": 257, "orbitSpeed": 0.3295, "angle": 4.538, "flore": 32, "faune": 41 }
          ]
        },
        { "name": "Kryarra", "radius": 78, "orbitRadius": 363, "orbitSpeed": 0.0598, "angle": 7.601, "flore": 32, "faune": 28,
          "moons": [
            { "name": "Draodon", "radius": 35, "orbitRadius": 131, "orbitSpeed": 0.3141, "angle": 12.252, "flore": 35, "faune": 39 },
            { "name": "Thalanpha", "radius": 29, "orbitRadius": 131, "orbitSpeed": 0.3141, "angle": 15.444, "flore": 16, "faune": 56 }
          ]
        }
      ]
    },
    {
      "name": "Thalezar", "radius": 218, "orbitRadius": 3265, "orbitSpeed": 0.009, "angle": 3.01, "color": "#7CB9FF",
      "planets": [
        { "name": "Kryalria", "radius": 110, "orbitRadius": 516, "orbitSpeed": 0.0415, "angle": -1.319, "flore": 23, "faune": 1,
          "moons": [
            { "name": "Paluria", "radius": 36, "orbitRadius": 181, "orbitSpeed": 0.3235, "angle": 1.745, "flore": 48, "faune": 25 },
            { "name": "Kryosvyn", "radius": 23, "orbitRadius": 181, "orbitSpeed": 0.3235, "angle": -0.878, "flore": 18, "faune": 40 },
            { "name": "Draisdis", "radius": 37, "orbitRadius": 181, "orbitSpeed": 0.3235, "angle": 3.857, "flore": 35, "faune": 23 }
          ]
        },
        { "name": "Omiondis", "radius": 123, "orbitRadius": 516, "orbitSpeed": 0.0415, "angle": 2.197, "flore": 76, "faune": 3, "moons": [] }
      ]
    },
    {
      "name": "Lyralzar", "radius": 210, "orbitRadius": 3265, "orbitSpeed": 0.009, "angle": -0.561, "color": "#FFB830",
      "planets": [
        { "name": "Auranxis", "radius": 73, "orbitRadius": 492, "orbitSpeed": 0.0659, "angle": -1.631, "flore": 34, "faune": 92,
          "moons": [
            { "name": "Thalubus", "radius": 29, "orbitRadius": 137, "orbitSpeed": 0.1645, "angle": -0.439, "flore": 47, "faune": 30 }
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
        { "name": "Thalelzar", "radius": 124, "orbitRadius": 779, "orbitSpeed": 0.0371, "angle": 2.159, "flore": 23, "faune": 61,
          "moons": [
            { "name": "Sigenpha", "radius": 26, "orbitRadius": 310, "orbitSpeed": 0.2278, "angle": 18.436, "flore": 18, "faune": 47 },
            { "name": "Kryonmus", "radius": 50, "orbitRadius": 310, "orbitSpeed": 0.2278, "angle": 16.289, "flore": 22, "faune": 60 },
            { "name": "Palopha", "radius": 59, "orbitRadius": 488, "orbitSpeed": 0.174, "angle": 15.865, "flore": 49, "faune": 59 },
            { "name": "Vorarxis", "radius": 39, "orbitRadius": 488, "orbitSpeed": 0.174, "angle": 12.998, "flore": 10, "faune": 35 }
          ]
        },
        { "name": "Synaxmir", "radius": 103, "orbitRadius": 779, "orbitSpeed": 0.0371, "angle": 4.58, "flore": 70, "faune": 6,
          "moons": [
            { "name": "Palera", "radius": 46, "orbitRadius": 219, "orbitSpeed": 0.297, "angle": 22.181, "flore": 2, "faune": 53 },
            { "name": "Kryelth", "radius": 48, "orbitRadius": 219, "orbitSpeed": 0.297, "angle": 19.818, "flore": 11, "faune": 8 },
            { "name": "Zetumxis", "radius": 26, "orbitRadius": 397, "orbitSpeed": 0.2508, "angle": 17.933, "flore": 13, "faune": 46 },
            { "name": "Thalirlux", "radius": 50, "orbitRadius": 397, "orbitSpeed": 0.2508, "angle": 19.393, "flore": 27, "faune": 29 }
          ]
        },
        { "name": "Thalith", "radius": 127, "orbitRadius": 779, "orbitSpeed": 0.0371, "angle": 6.459, "flore": 41, "faune": 95,
          "moons": [
            { "name": "Pyxalria", "radius": 47, "orbitRadius": 276, "orbitSpeed": 0.3101, "angle": 19.814, "flore": 7, "faune": 19 },
            { "name": "Kryaria", "radius": 34, "orbitRadius": 276, "orbitSpeed": 0.3101, "angle": 18.527, "flore": 44, "faune": 48 },
            { "name": "Lyranpha", "radius": 50, "orbitRadius": 276, "orbitSpeed": 0.3101, "angle": 22.404, "flore": 37, "faune": 5 },
            { "name": "Draolux", "radius": 21, "orbitRadius": 555, "orbitSpeed": 0.2183, "angle": 16.984, "flore": 36, "faune": 30 }
          ]
        }
      ]
    },
    {
      "name": "Omialth", "radius": 232, "orbitRadius": 4030, "orbitSpeed": 0.0105, "angle": -1.198, "color": "#FF6B6B",
      "planets": [
        { "name": "Erienmus", "radius": 90, "orbitRadius": 536, "orbitSpeed": 0.0635, "angle": 0.308, "flore": 34, "faune": 71,
          "moons": [
            { "name": "Velosbus", "radius": 35, "orbitRadius": 165, "orbitSpeed": 0.2917, "angle": 4.634, "flore": 45, "faune": 21 },
            { "name": "Aurirth", "radius": 39, "orbitRadius": 165, "orbitSpeed": 0.2917, "angle": 5.478, "flore": 39, "faune": 16 },
            { "name": "Xorellux", "radius": 49, "orbitRadius": 165, "orbitSpeed": 0.2917, "angle": 1.303, "flore": 11, "faune": 2 },
            { "name": "Vorirra", "radius": 29, "orbitRadius": 165, "orbitSpeed": 0.2917, "angle": 3.042, "flore": 21, "faune": 53 }
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
        { "name": "Synenra", "radius": 104, "orbitRadius": 463, "orbitSpeed": 0.0601, "angle": 5.166, "flore": 97, "faune": 59,
          "moons": [
            { "name": "Lyrenis", "radius": 39, "orbitRadius": 175, "orbitSpeed": 0.2832, "angle": 27.581, "flore": 33, "faune": 28 }
          ]
        },
        { "name": "Voronth", "radius": 72, "orbitRadius": 1071, "orbitSpeed": 0.0366, "angle": 1.295, "flore": 88, "faune": 14,
          "moons": [
            { "name": "Pyxevyn", "radius": 40, "orbitRadius": 312, "orbitSpeed": 0.3013, "angle": 28.358, "flore": 18, "faune": 5 },
            { "name": "Corelnis", "radius": 44, "orbitRadius": 419, "orbitSpeed": 0.3108, "angle": 32.166, "flore": 23, "faune": 39 }
          ]
        },
        { "name": "Corolux", "radius": 81, "orbitRadius": 1071, "orbitSpeed": 0.0366, "angle": 4.896, "flore": 81, "faune": 3,
          "moons": [
            { "name": "Zanisra", "radius": 33, "orbitRadius": 151, "orbitSpeed": 0.2381, "angle": 24.823, "flore": 39, "faune": 59 },
            { "name": "Ithedis", "radius": 40, "orbitRadius": 300, "orbitSpeed": 0.3239, "angle": 35.161, "flore": 16, "faune": 9 },
            { "name": "Draanton", "radius": 22, "orbitRadius": 300, "orbitSpeed": 0.3239, "angle": 37.903, "flore": 16, "faune": 31 }
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
        { "name": "Pyxoton", "radius": 83, "orbitRadius": 557, "orbitSpeed": 0.0394, "angle": -0.175, "flore": 9, "faune": 37,
          "moons": [
            { "name": "Vorara", "radius": 48, "orbitRadius": 180, "orbitSpeed": 0.2277, "angle": 1.548, "flore": 11, "faune": 58 }
          ]
        },
        { "name": "Eriarth", "radius": 98, "orbitRadius": 875, "orbitSpeed": 0.0334, "angle": 3.745, "flore": 2, "faune": 11,
          "moons": [
            { "name": "Palaldis", "radius": 20, "orbitRadius": 181, "orbitSpeed": 0.184, "angle": 1.559, "flore": 24, "faune": 3 },
            { "name": "Auranton", "radius": 29, "orbitRadius": 181, "orbitSpeed": 0.184, "angle": -0.975, "flore": 18, "faune": 37 }
          ]
        },
        { "name": "Kryaxbus", "radius": 104, "orbitRadius": 875, "orbitSpeed": 0.0334, "angle": 1.452, "flore": 6, "faune": 88,
          "moons": [
            { "name": "Zetizar", "radius": 34, "orbitRadius": 243, "orbitSpeed": 0.3376, "angle": 5.585, "flore": 34, "faune": 40 },
            { "name": "Nebirmir", "radius": 25, "orbitRadius": 243, "orbitSpeed": 0.3376, "angle": 3.839, "flore": 48, "faune": 10 },
            { "name": "Thalaxvyn", "radius": 50, "orbitRadius": 450, "orbitSpeed": 0.2912, "angle": 7.412, "flore": 38, "faune": 1 }
          ]
        }
      ]
    },
    {
      "name": "Lyralmir", "radius": 221, "orbitRadius": 2431, "orbitSpeed": 0.0143, "angle": 2.491, "color": "#FFB830",
      "planets": [
        { "name": "Velemus", "radius": 98, "orbitRadius": 543, "orbitSpeed": 0.0662, "angle": 2.016, "flore": 96, "faune": 84,
          "moons": [
            { "name": "Synenra", "radius": 47, "orbitRadius": 174, "orbitSpeed": 0.2072, "angle": 7.589, "flore": 9, "faune": 3 }
          ]
        },
        { "name": "Aurirxis", "radius": 98, "orbitRadius": 543, "orbitSpeed": 0.0662, "angle": 5.528, "flore": 79, "faune": 30,
          "moons": [
            { "name": "Eriudon", "radius": 35, "orbitRadius": 220, "orbitSpeed": 0.2196, "angle": 7.392, "flore": 37, "faune": 45 },
            { "name": "Thalelvyn", "radius": 56, "orbitRadius": 220, "orbitSpeed": 0.2196, "angle": 11.648, "flore": 45, "faune": 56 }
          ]
        },
        { "name": "Thalaldis", "radius": 112, "orbitRadius": 1223, "orbitSpeed": 0.0317, "angle": -1.527, "flore": 36, "faune": 5,
          "moons": [
            { "name": "Lyrura", "radius": 39, "orbitRadius": 396, "orbitSpeed": 0.2974, "angle": 10.879, "flore": 22, "faune": 51 },
            { "name": "Eriulux", "radius": 55, "orbitRadius": 396, "orbitSpeed": 0.2974, "angle": 13.298, "flore": 8, "faune": 7 },
            { "name": "Zetalux", "radius": 29, "orbitRadius": 562, "orbitSpeed": 0.2876, "angle": 11.759, "flore": 50, "faune": 29 }
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
        { "name": "Coristis", "radius": 97, "orbitRadius": 606, "orbitSpeed": 0.0453, "angle": 3.731, "flore": 76, "faune": 99,
          "moons": [
            { "name": "Zanenlux", "radius": 45, "orbitRadius": 192, "orbitSpeed": 0.1994, "angle": 11.206, "flore": 9, "faune": 16 },
            { "name": "Velolux", "radius": 54, "orbitRadius": 192, "orbitSpeed": 0.1994, "angle": 13.44, "flore": 41, "faune": 40 },
            { "name": "Thalidon", "radius": 41, "orbitRadius": 254, "orbitSpeed": 0.2922, "angle": 14.579, "flore": 50, "faune": 32 }
          ]
        },
        { "name": "Sigeldon", "radius": 118, "orbitRadius": 1093, "orbitSpeed": 0.0366, "angle": 5.996, "flore": 47, "faune": 42,
          "moons": [
            { "name": "Zetizar", "radius": 25, "orbitRadius": 319, "orbitSpeed": 0.2202, "angle": 6.957, "flore": 30, "faune": 17 },
            { "name": "Erianxis", "radius": 38, "orbitRadius": 319, "orbitSpeed": 0.2202, "angle": 5.523, "flore": 48, "faune": 5 },
            { "name": "Ithamir", "radius": 32, "orbitRadius": 188, "orbitSpeed": 0.3252, "angle": 13.165, "flore": 33, "faune": 1 },
            { "name": "Synumlux", "radius": 21, "orbitRadius": 319, "orbitSpeed": 0.2202, "angle": 8.582, "flore": 14, "faune": 27 }
          ]
        },
        { "name": "Lyraxton", "radius": 89, "orbitRadius": 1668, "orbitSpeed": 0.0207, "angle": 3.761, "flore": 5, "faune": 42,
          "moons": [
            { "name": "Vorantis", "radius": 25, "orbitRadius": 133, "orbitSpeed": 0.3325, "angle": 13.92, "flore": 7, "faune": 31 },
            { "name": "Draenria", "radius": 28, "orbitRadius": 201, "orbitSpeed": 0.3169, "angle": 14.008, "flore": 1, "faune": 27 },
            { "name": "Aurara", "radius": 24, "orbitRadius": 201, "orbitSpeed": 0.3169, "angle": 15.949, "flore": 23, "faune": 18 },
            { "name": "Xorumbus", "radius": 43, "orbitRadius": 201, "orbitSpeed": 0.3169, "angle": 11.76, "flore": 6, "faune": 49 }
          ]
        },
        { "name": "Zetisnis", "radius": 96, "orbitRadius": 1093, "orbitSpeed": 0.0366, "angle": 3.98, "flore": 26, "faune": 45,
          "moons": [
            { "name": "Erielpha", "radius": 46, "orbitRadius": 216, "orbitSpeed": 0.2526, "angle": 11.431, "flore": 43, "faune": 26 },
            { "name": "Siganmir", "radius": 33, "orbitRadius": 216, "orbitSpeed": 0.2526, "angle": 14.116, "flore": 4, "faune": 43 }
          ]
        },
        { "name": "Auronton", "radius": 99, "orbitRadius": 1668, "orbitSpeed": 0.0207, "angle": 1.535, "flore": 69, "faune": 11,
          "moons": [
            { "name": "Corondis", "radius": 26, "orbitRadius": 275, "orbitSpeed": 0.1633, "angle": 9.284, "flore": 3, "faune": 29 },
            { "name": "Coristh", "radius": 30, "orbitRadius": 275, "orbitSpeed": 0.1633, "angle": 13.139, "flore": 50, "faune": 55 },
            { "name": "Celennis", "radius": 59, "orbitRadius": 275, "orbitSpeed": 0.1633, "angle": 3.793, "flore": 48, "faune": 49 }
          ]
        },
        { "name": "Pyxoria", "radius": 126, "orbitRadius": 1668, "orbitSpeed": 0.0207, "angle": 0.027, "flore": 92, "faune": 48,
          "moons": [
            { "name": "Zetirmir", "radius": 25, "orbitRadius": 445, "orbitSpeed": 0.2365, "angle": 18.431, "flore": 0, "faune": 54 },
            { "name": "Lyrenpha", "radius": 52, "orbitRadius": 312, "orbitSpeed": 0.2293, "angle": 17.824, "flore": 15, "faune": 27 },
            { "name": "Zetismir", "radius": 42, "orbitRadius": 312, "orbitSpeed": 0.2293, "angle": 13.577, "flore": 1, "faune": 18 },
            { "name": "Veluzar", "radius": 48, "orbitRadius": 445, "orbitSpeed": 0.2365, "angle": 16.54, "flore": 50, "faune": 23 }
          ]
        }
      ]
    },
    {
      "name": "Nebonbus", "radius": 199, "orbitRadius": 2216, "orbitSpeed": 0.0154, "angle": -2.204, "color": "#7CB9FF",
      "planets": [
        { "name": "Velozar", "radius": 96, "orbitRadius": 632, "orbitSpeed": 0.0537, "angle": 2.038, "flore": 32, "faune": 28,
          "moons": [
            { "name": "Synepha", "radius": 28, "orbitRadius": 233, "orbitSpeed": 0.205, "angle": 0.052, "flore": 12, "faune": 41 },
            { "name": "Corumzar", "radius": 32, "orbitRadius": 233, "orbitSpeed": 0.205, "angle": 2.029, "flore": 10, "faune": 40 },
            { "name": "Xoraxvyn", "radius": 20, "orbitRadius": 233, "orbitSpeed": 0.205, "angle": 4.158, "flore": 11, "faune": 22 }
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
        { "name": "Zetendon", "radius": 79, "orbitRadius": 454, "orbitSpeed": 0.0441, "angle": 1.042, "flore": 63, "faune": 7, "moons": [] }
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
        { "name": "Corarra", "radius": 107, "orbitRadius": 495, "orbitSpeed": 0.0514, "angle": -0.49, "flore": 92, "faune": 21,
          "moons": [
            { "name": "Palatis", "radius": 30, "orbitRadius": 181, "orbitSpeed": 0.1852, "angle": 0.108, "flore": 38, "faune": 18 },
            { "name": "Zetosria", "radius": 33, "orbitRadius": 181, "orbitSpeed": 0.1852, "angle": 1.577, "flore": 11, "faune": 8 }
          ]
        },
        { "name": "Synitis", "radius": 75, "orbitRadius": 495, "orbitSpeed": 0.0514, "angle": 3.411, "flore": 10, "faune": 87,
          "moons": [
            { "name": "Lyrevyn", "radius": 52, "orbitRadius": 197, "orbitSpeed": 0.2333, "angle": 1.428, "flore": 41, "faune": 11 }
          ]
        },
        { "name": "Lyralton", "radius": 77, "orbitRadius": 495, "orbitSpeed": 0.0514, "angle": 1.705, "flore": 9, "faune": 37,
          "moons": [
            { "name": "Pyxaldis", "radius": 36, "orbitRadius": 168, "orbitSpeed": 0.233, "angle": 0.105, "flore": 21, "faune": 9 }
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
        { "name": "Vorellux", "radius": 129, "orbitRadius": 564, "orbitSpeed": 0.0445, "angle": 1.117, "flore": 52, "faune": 82,
          "moons": [
            { "name": "Sigelzar", "radius": 31, "orbitRadius": 243, "orbitSpeed": 0.3198, "angle": 7.655, "flore": 29, "faune": 22 },
            { "name": "Thaloxis", "radius": 48, "orbitRadius": 243, "orbitSpeed": 0.3198, "angle": 9.824, "flore": 43, "faune": 33 }
          ]
        },
        { "name": "Zanondis", "radius": 104, "orbitRadius": 1142, "orbitSpeed": 0.0284, "angle": -0.759, "flore": 39, "faune": 8,
          "moons": [
            { "name": "Sigarvyn", "radius": 21, "orbitRadius": 394, "orbitSpeed": 0.3444, "angle": 8.176, "flore": 39, "faune": 6 },
            { "name": "Pyxelnis", "radius": 55, "orbitRadius": 394, "orbitSpeed": 0.3444, "angle": 6.026, "flore": 44, "faune": 15 },
            { "name": "Xoruton", "radius": 41, "orbitRadius": 275, "orbitSpeed": 0.2538, "angle": 8.049, "flore": 4, "faune": 14 }
          ]
        }
      ]
    },
    {
      "name": "Celanlux", "radius": 169, "orbitRadius": 3217, "orbitSpeed": 0.0106, "angle": -0.792, "color": "#FFB830",
      "planets": [
        { "name": "Palumnis", "radius": 77, "orbitRadius": 699, "orbitSpeed": 0.0369, "angle": 0.297, "flore": 47, "faune": 36,
          "moons": [
            { "name": "Omionvyn", "radius": 47, "orbitRadius": 233, "orbitSpeed": 0.1559, "angle": 1.675, "flore": 20, "faune": 39 }
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
        { "name": "Omialria", "radius": 96, "orbitRadius": 464, "orbitSpeed": 0.0686, "angle": 3.269, "flore": 85, "faune": 23,
          "moons": [
            { "name": "Palalxis", "radius": 22, "orbitRadius": 174, "orbitSpeed": 0.3051, "angle": 11.845, "flore": 16, "faune": 39 },
            { "name": "Pyxenzar", "radius": 53, "orbitRadius": 174, "orbitSpeed": 0.3051, "angle": 9.542, "flore": 31, "faune": 34 }
          ]
        },
        { "name": "Velonis", "radius": 94, "orbitRadius": 464, "orbitSpeed": 0.0686, "angle": 5.409, "flore": 35, "faune": 71,
          "moons": [
            { "name": "Sigaxria", "radius": 32, "orbitRadius": 175, "orbitSpeed": 0.2668, "angle": 5.247, "flore": 13, "faune": 26 }
          ]
        },
        { "name": "Thalosxis", "radius": 127, "orbitRadius": 864, "orbitSpeed": 0.0342, "angle": 3.734, "flore": 66, "faune": 68,
          "moons": [
            { "name": "Celirvyn", "radius": 20, "orbitRadius": 220, "orbitSpeed": 0.2425, "angle": 4.952, "flore": 28, "faune": 20 },
            { "name": "Voraxth", "radius": 41, "orbitRadius": 220, "orbitSpeed": 0.2425, "angle": 9.496, "flore": 29, "faune": 38 }
          ]
        }
      ]
    },
    {
      "name": "Paloria", "radius": 202, "orbitRadius": 3362, "orbitSpeed": 0.0109, "angle": -0.575, "color": "#FF6B6B",
      "planets": [
        { "name": "Voruth", "radius": 89, "orbitRadius": 457, "orbitSpeed": 0.0458, "angle": 1.106, "flore": 94, "faune": 25,
          "moons": [
            { "name": "Ithonmir", "radius": 26, "orbitRadius": 209, "orbitSpeed": 0.1523, "angle": 3.085, "flore": 23, "faune": 35 },
            { "name": "Zetenzar", "radius": 34, "orbitRadius": 209, "orbitSpeed": 0.1523, "angle": 1.284, "flore": 32, "faune": 49 }
          ]
        },
        { "name": "Draeldon", "radius": 123, "orbitRadius": 457, "orbitSpeed": 0.0458, "angle": -1.003, "flore": 63, "faune": 82, "moons": [] }
      ]
    },
    {
      "name": "Zanarth", "radius": 188, "orbitRadius": 3362, "orbitSpeed": 0.0109, "angle": -2.279, "color": "#7CB9FF",
      "planets": [
        { "name": "Synudon", "radius": 129, "orbitRadius": 517, "orbitSpeed": 0.0666, "angle": -1.074, "flore": 79, "faune": 39,
          "moons": [
            { "name": "Zanirdis", "radius": 38, "orbitRadius": 232, "orbitSpeed": 0.1999, "angle": -2.348, "flore": 48, "faune": 5 },
            { "name": "Lyrisbus", "radius": 39, "orbitRadius": 232, "orbitSpeed": 0.1999, "angle": 0.617, "flore": 40, "faune": 20 }
          ]
        },
        { "name": "Kryidon", "radius": 117, "orbitRadius": 1004, "orbitSpeed": 0.0289, "angle": 2.6, "flore": 12, "faune": 40,
          "moons": [
            { "name": "Omionbus", "radius": 31, "orbitRadius": 235, "orbitSpeed": 0.2411, "angle": -1.086, "flore": 14, "faune": 33 },
            { "name": "Vorondis", "radius": 36, "orbitRadius": 340, "orbitSpeed": 0.3437, "angle": 1.176, "flore": 1, "faune": 31 },
            { "name": "Corandon", "radius": 35, "orbitRadius": 340, "orbitSpeed": 0.3437, "angle": 3.741, "flore": 42, "faune": 42 }
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
        { "name": "Lyrirnis", "radius": 94, "orbitRadius": 463, "orbitSpeed": 0.0668, "angle": 22.192, "flore": 55, "faune": 56, "moons": [
            { "name": "Corosra", "radius": 57, "orbitRadius": 221, "orbitSpeed": 0.2832, "angle": 74.266, "flore": 34, "faune": 39 },
            { "name": "Omiinis", "radius": 59, "orbitRadius": 221, "orbitSpeed": 0.2832, "angle": 71.313, "flore": 16, "faune": 15 }
        ]},
        { "name": "Eriismir", "radius": 109, "orbitRadius": 740, "orbitSpeed": 0.0546, "angle": 16.702, "flore": 81, "faune": 24, "moons": [
            { "name": "Aurilux", "radius": 25, "orbitRadius": 211, "orbitSpeed": 0.3161, "angle": 88.669, "flore": 2, "faune": 41 },
            { "name": "Kryosth", "radius": 22, "orbitRadius": 211, "orbitSpeed": 0.3161, "angle": 90.322, "flore": 9, "faune": 29 },
            { "name": "Sigaxth", "radius": 37, "orbitRadius": 311, "orbitSpeed": 0.25, "angle": 68.466, "flore": 2, "faune": 32 }
        ]},
        { "name": "Nebelpha", "radius": 128, "orbitRadius": 463, "orbitSpeed": 0.0668, "angle": 18.331, "flore": 35, "faune": 40, "moons": [
            { "name": "Vorosmus", "radius": 32, "orbitRadius": 197, "orbitSpeed": 0.1808, "angle": 47.484, "flore": 16, "faune": 27 },
            { "name": "Auroston", "radius": 46, "orbitRadius": 197, "orbitSpeed": 0.1808, "angle": 46.195, "flore": 17, "faune": 29 }
        ]}
      ]
    },
    { "name": "Auraxpha", "radius": 170, "orbitRadius": 1281, "orbitSpeed": 0.0153, "angle": 1.509, "color": "#FFB830",
      "planets": [
        { "name": "Celenra", "radius": 117, "orbitRadius": 490, "orbitSpeed": 0.0674, "angle": 16.452, "flore": 99, "faune": 6, "moons": [
            { "name": "Aurovyn", "radius": 20, "orbitRadius": 223, "orbitSpeed": 0.2791, "angle": 64.926, "flore": 23, "faune": 32 },
            { "name": "Celadis", "radius": 44, "orbitRadius": 180, "orbitSpeed": 0.2044, "angle": 48.81, "flore": 32, "faune": 57 },
            { "name": "Pyxirnis", "radius": 57, "orbitRadius": 223, "orbitSpeed": 0.2791, "angle": 68.035, "flore": 48, "faune": 14 }
        ]},
        { "name": "Aurara", "radius": 104, "orbitRadius": 781, "orbitSpeed": 0.033, "angle": 10.691, "flore": 69, "faune": 20, "moons": [
            { "name": "Velirpha", "radius": 45, "orbitRadius": 197, "orbitSpeed": 0.1571, "angle": 34.685, "flore": 40, "faune": 27 },
            { "name": "Celonth", "radius": 54, "orbitRadius": 366, "orbitSpeed": 0.2709, "angle": 60.767, "flore": 44, "faune": 8 },
            { "name": "Zetalmir", "radius": 60, "orbitRadius": 366, "orbitSpeed": 0.2709, "angle": 64.927, "flore": 43, "faune": 35 },
            { "name": "Vorupha", "radius": 45, "orbitRadius": 197, "orbitSpeed": 0.1571, "angle": 37.12, "flore": 22, "faune": 51 }
        ]},
        { "name": "Corisria", "radius": 97, "orbitRadius": 781, "orbitSpeed": 0.033, "angle": 6.986, "flore": 12, "faune": 10, "moons": [
            { "name": "Omianlux", "radius": 22, "orbitRadius": 187, "orbitSpeed": 0.324, "angle": 80.277, "flore": 31, "faune": 1 },
            { "name": "Auraxlux", "radius": 57, "orbitRadius": 187, "orbitSpeed": 0.324, "angle": 75.506, "flore": 6, "faune": 38 },
            { "name": "Zetalria", "radius": 49, "orbitRadius": 337, "orbitSpeed": 0.3497, "angle": 84.362, "flore": 0, "faune": 44 }
        ]}
      ]
    },
    { "name": "Drairbus", "radius": 190, "orbitRadius": 3551, "orbitSpeed": 0.0076, "angle": 0.44, "color": "#FF8C42",
      "planets": [
        { "name": "Zanebus", "radius": 80, "orbitRadius": 493, "orbitSpeed": 0.0449, "angle": 9.832, "flore": 21, "faune": 14, "moons": [
            { "name": "Paluria", "radius": 41, "orbitRadius": 178, "orbitSpeed": 0.1577, "angle": 17.509, "flore": 35, "faune": 16 },
            { "name": "Zanaxra", "radius": 23, "orbitRadius": 178, "orbitSpeed": 0.1577, "angle": 19.66, "flore": 48, "faune": 12 },
            { "name": "Eriaxbus", "radius": 37, "orbitRadius": 178, "orbitSpeed": 0.1577, "angle": 22.151, "flore": 22, "faune": 56 }
        ]},
        { "name": "Zanizar", "radius": 110, "orbitRadius": 851, "orbitSpeed": 0.0476, "angle": 4.535, "flore": 40, "faune": 57, "moons": [
            { "name": "Velallux", "radius": 60, "orbitRadius": 232, "orbitSpeed": 0.2749, "angle": 32.229, "flore": 19, "faune": 59 },
            { "name": "Omiomus", "radius": 39, "orbitRadius": 232, "orbitSpeed": 0.2749, "angle": 31.275, "flore": 44, "faune": 30 },
            { "name": "Kryosdis", "radius": 31, "orbitRadius": 232, "orbitSpeed": 0.2749, "angle": 36.613, "flore": 2, "faune": 42 }
        ]},
        { "name": "Eriaxton", "radius": 118, "orbitRadius": 493, "orbitSpeed": 0.0449, "angle": 5.915, "flore": 40, "faune": 83, "moons": [
            { "name": "Lyrisra", "radius": 51, "orbitRadius": 173, "orbitSpeed": 0.1859, "angle": 25.849, "flore": 12, "faune": 38 },
            { "name": "Thalismir", "radius": 58, "orbitRadius": 273, "orbitSpeed": 0.3395, "angle": 42.998, "flore": 11, "faune": 32 }
        ]},
        { "name": "Thalarton", "radius": 106, "orbitRadius": 851, "orbitSpeed": 0.0476, "angle": 7.34, "flore": 91, "faune": 64, "moons": [
            { "name": "Eriontis", "radius": 20, "orbitRadius": 201, "orbitSpeed": 0.2265, "angle": 30.757, "flore": 12, "faune": 37 },
            { "name": "Nebandis", "radius": 50, "orbitRadius": 201, "orbitSpeed": 0.2265, "angle": 35.178, "flore": 37, "faune": 57 }
        ]}
      ]
    },
    { "name": "Thalonpha", "radius": 163, "orbitRadius": 3551, "orbitSpeed": 0.0076, "angle": -0.736, "color": "#FF8C42",
      "planets": [
        { "name": "Lyrobus", "radius": 105, "orbitRadius": 384, "orbitSpeed": 0.0615, "angle": 5.867, "flore": 19, "faune": 8, "moons": [
            { "name": "Ithoxis", "radius": 38, "orbitRadius": 190, "orbitSpeed": 0.2823, "angle": 27.7, "flore": 34, "faune": 37 }
        ]}
      ]
    },
    { "name": "Xorenton", "radius": 205, "orbitRadius": 3551, "orbitSpeed": 0.0076, "angle": -2.301, "color": "#FF6B6B",
      "planets": [
        { "name": "Xorelra", "radius": 93, "orbitRadius": 378, "orbitSpeed": 0.069, "angle": 6.339, "flore": 0, "faune": 71, "moons": [] },
        { "name": "Kryarbus", "radius": 77, "orbitRadius": 676, "orbitSpeed": 0.0518, "angle": 4.118, "flore": 9, "faune": 52, "moons": [
            { "name": "Draenvyn", "radius": 31, "orbitRadius": 240, "orbitSpeed": 0.2583, "angle": 21.777, "flore": 13, "faune": 59 },
            { "name": "Coranmus", "radius": 23, "orbitRadius": 240, "orbitSpeed": 0.2583, "angle": 18.376, "flore": 5, "faune": 34 },
            { "name": "Synonvyn", "radius": 36, "orbitRadius": 240, "orbitSpeed": 0.2583, "angle": 22.798, "flore": 18, "faune": 49 },
            { "name": "Eriisdis", "radius": 45, "orbitRadius": 159, "orbitSpeed": 0.2776, "angle": 21.207, "flore": 40, "faune": 24 }
        ]},
        { "name": "Zetalmus", "radius": 110, "orbitRadius": 676, "orbitSpeed": 0.0518, "angle": 1.807, "flore": 60, "faune": 52, "moons": [
            { "name": "Nebaldon", "radius": 24, "orbitRadius": 230, "orbitSpeed": 0.316, "angle": 22.521, "flore": 9, "faune": 16 },
            { "name": "Zetoth", "radius": 51, "orbitRadius": 230, "orbitSpeed": 0.316, "angle": 19.937, "flore": 33, "faune": 23 },
            { "name": "Sigumth", "radius": 57, "orbitRadius": 230, "orbitSpeed": 0.316, "angle": 24.361, "flore": 15, "faune": 39 }
        ]},
        { "name": "Nebisth", "radius": 96, "orbitRadius": 676, "orbitSpeed": 0.0518, "angle": 6.371, "flore": 92, "faune": 100, "moons": [
            { "name": "Sigarra", "radius": 33, "orbitRadius": 158, "orbitSpeed": 0.271, "angle": 20.773, "flore": 16, "faune": 52 },
            { "name": "Eriumria", "radius": 37, "orbitRadius": 265, "orbitSpeed": 0.1619, "angle": 10.886, "flore": 27, "faune": 56 },
            { "name": "Palalth", "radius": 20, "orbitRadius": 265, "orbitSpeed": 0.1619, "angle": 15.68, "flore": 26, "faune": 42 },
            { "name": "Celirdis", "radius": 40, "orbitRadius": 265, "orbitSpeed": 0.1619, "angle": 13.618, "flore": 29, "faune": 54 }
        ]},
        { "name": "Zanopha", "radius": 102, "orbitRadius": 1257, "orbitSpeed": 0.0274, "angle": -1.364, "flore": 16, "faune": 41, "moons": [
            { "name": "Sigonria", "radius": 50, "orbitRadius": 247, "orbitSpeed": 0.2283, "angle": 16.833, "flore": 29, "faune": 30 },
            { "name": "Eriazar", "radius": 59, "orbitRadius": 247, "orbitSpeed": 0.2283, "angle": 11.978, "flore": 45, "faune": 54 }
        ]},
        { "name": "Xoramir", "radius": 95, "orbitRadius": 1257, "orbitSpeed": 0.0274, "angle": 1.611, "flore": 78, "faune": 65, "moons": [
            { "name": "Nebalzar", "radius": 37, "orbitRadius": 236, "orbitSpeed": 0.2996, "angle": 18.921, "flore": 27, "faune": 53 }
        ]}
      ]
    },
    { "name": "Aurimus", "radius": 222, "orbitRadius": 3551, "orbitSpeed": 0.0076, "angle": 2.397, "color": "#FF8C42",
      "planets": [
        { "name": "Vorisnis", "radius": 98, "orbitRadius": 651, "orbitSpeed": 0.043, "angle": -0.288, "flore": 1, "faune": 31, "moons": [
            { "name": "Lyralth", "radius": 32, "orbitRadius": 199, "orbitSpeed": 0.1843, "angle": 1.75, "flore": 13, "faune": 51 },
            { "name": "Aurarmus", "radius": 20, "orbitRadius": 199, "orbitSpeed": 0.1843, "angle": 3.263, "flore": 24, "faune": 24 },
            { "name": "Aurirria", "radius": 29, "orbitRadius": 199, "orbitSpeed": 0.1843, "angle": 4.617, "flore": 13, "faune": 0 }
        ]},
        { "name": "Pyxanton", "radius": 70, "orbitRadius": 941, "orbitSpeed": 0.0332, "angle": 1.081, "flore": 94, "faune": 18, "moons": [
            { "name": "Kryaxria", "radius": 43, "orbitRadius": 196, "orbitSpeed": 0.3296, "angle": 11.39, "flore": 47, "faune": 33 },
            { "name": "Lyrumria", "radius": 31, "orbitRadius": 196, "orbitSpeed": 0.3296, "angle": 7.104, "flore": 2, "faune": 33 }
        ]},
        { "name": "Omiebus", "radius": 102, "orbitRadius": 651, "orbitSpeed": 0.043, "angle": 3.923, "flore": 8, "faune": 28, "moons": [
            { "name": "Eriisdon", "radius": 39, "orbitRadius": 217, "orbitSpeed": 0.2727, "angle": 2.533, "flore": 42, "faune": 14 },
            { "name": "Sigaltis", "radius": 54, "orbitRadius": 217, "orbitSpeed": 0.2727, "angle": 0.64, "flore": 25, "faune": 6 },
            { "name": "Palannis", "radius": 30, "orbitRadius": 330, "orbitSpeed": 0.2862, "angle": 5.206, "flore": 49, "faune": 55 },
            { "name": "Zetarmus", "radius": 50, "orbitRadius": 330, "orbitSpeed": 0.2862, "angle": 3.868, "flore": 41, "faune": 23 }
        ]},
        { "name": "Omieldon", "radius": 114, "orbitRadius": 941, "orbitSpeed": 0.0332, "angle": 2.164, "flore": 37, "faune": 66, "moons": [
            { "name": "Draarbus", "radius": 20, "orbitRadius": 217, "orbitSpeed": 0.304, "angle": 7.725, "flore": 35, "faune": 56 }
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
        { "name": "Omiunis", "radius": 108, "orbitRadius": 486, "orbitSpeed": 0.0575, "angle": 12.198, "flore": 93, "faune": 85, "moons": [
            { "name": "Draosth", "radius": 40, "orbitRadius": 194, "orbitSpeed": 0.2489, "angle": 31.43, "flore": 32, "faune": 42 },
            { "name": "Nebaxlux", "radius": 29, "orbitRadius": 194, "orbitSpeed": 0.2489, "angle": 35.733, "flore": 9, "faune": 5 }
        ]},
        { "name": "Draonra", "radius": 90, "orbitRadius": 947, "orbitSpeed": 0.0325, "angle": 8.393, "flore": 69, "faune": 26, "moons": [
            { "name": "Aurisbus", "radius": 58, "orbitRadius": 177, "orbitSpeed": 0.279, "angle": 37.411, "flore": 27, "faune": 37 },
            { "name": "Lyroria", "radius": 60, "orbitRadius": 177, "orbitSpeed": 0.279, "angle": 35.981, "flore": 40, "faune": 5 }
        ]},
        { "name": "Corostis", "radius": 97, "orbitRadius": 947, "orbitSpeed": 0.0325, "angle": 4.433, "flore": 34, "faune": 33, "moons": [
            { "name": "Thalarlux", "radius": 24, "orbitRadius": 167, "orbitSpeed": 0.3131, "angle": 44.916, "flore": 35, "faune": 15 },
            { "name": "Ithomir", "radius": 33, "orbitRadius": 241, "orbitSpeed": 0.3084, "angle": 43.868, "flore": 48, "faune": 41 },
            { "name": "Lyrelra", "radius": 32, "orbitRadius": 167, "orbitSpeed": 0.3131, "angle": 47.134, "flore": 33, "faune": 50 }
        ]},
        { "name": "Zetondis", "radius": 95, "orbitRadius": 947, "orbitSpeed": 0.0325, "angle": 3.179, "flore": 79, "faune": 67, "moons": [
            { "name": "Synostis", "radius": 60, "orbitRadius": 283, "orbitSpeed": 0.2493, "angle": 35.091, "flore": 17, "faune": 8 },
            { "name": "Celepha", "radius": 54, "orbitRadius": 283, "orbitSpeed": 0.2493, "angle": 37.239, "flore": 14, "faune": 19 },
            { "name": "Omiisxis", "radius": 36, "orbitRadius": 159, "orbitSpeed": 0.1806, "angle": 28.137, "flore": 1, "faune": 32 }
        ]},
        { "name": "Coraxmir", "radius": 90, "orbitRadius": 486, "orbitSpeed": 0.0575, "angle": 7.893, "flore": 40, "faune": 72, "moons": [
            { "name": "Eriimus", "radius": 27, "orbitRadius": 204, "orbitSpeed": 0.2292, "angle": 37.916, "flore": 10, "faune": 33 },
            { "name": "Ithalmir", "radius": 54, "orbitRadius": 204, "orbitSpeed": 0.2292, "angle": 34.389, "flore": 9, "faune": 11 }
        ]}
      ]
    },
    { "name": "Lyrenmir", "radius": 215, "orbitRadius": 4208, "orbitSpeed": 0.0075, "angle": 1.027, "color": "#FF8C42",
      "planets": [
        { "name": "Thalisdis", "radius": 122, "orbitRadius": 508, "orbitSpeed": 0.0417, "angle": 2.677, "flore": 44, "faune": 93, "moons": [
            { "name": "Pyxarbus", "radius": 59, "orbitRadius": 244, "orbitSpeed": 0.3424, "angle": 40.542, "flore": 44, "faune": 59 },
            { "name": "Vorosdon", "radius": 53, "orbitRadius": 244, "orbitSpeed": 0.3424, "angle": 36.429, "flore": 13, "faune": 60 }
        ]},
        { "name": "Celaxtis", "radius": 113, "orbitRadius": 864, "orbitSpeed": 0.0408, "angle": 4.001, "flore": 59, "faune": 88, "moons": [
            { "name": "Omiarbus", "radius": 50, "orbitRadius": 198, "orbitSpeed": 0.2473, "angle": 26.53, "flore": 9, "faune": 32 },
            { "name": "Corodis", "radius": 40, "orbitRadius": 198, "orbitSpeed": 0.2473, "angle": 25.078, "flore": 12, "faune": 54 },
            { "name": "Eriumth", "radius": 36, "orbitRadius": 299, "orbitSpeed": 0.2463, "angle": 25.234, "flore": 37, "faune": 11 },
            { "name": "Nebanis", "radius": 50, "orbitRadius": 299, "orbitSpeed": 0.2463, "angle": 29.099, "flore": 4, "faune": 6 }
        ]},
        { "name": "Kryelton", "radius": 76, "orbitRadius": 864, "orbitSpeed": 0.0408, "angle": 6.197, "flore": 72, "faune": 14, "moons": [
            { "name": "Lyraxth", "radius": 20, "orbitRadius": 194, "orbitSpeed": 0.2079, "angle": 27.195, "flore": 3, "faune": 23 },
            { "name": "Zanuton", "radius": 26, "orbitRadius": 194, "orbitSpeed": 0.2079, "angle": 23.578, "flore": 1, "faune": 52 },
            { "name": "Thalisbus", "radius": 44, "orbitRadius": 194, "orbitSpeed": 0.2079, "angle": 25.25, "flore": 34, "faune": 57 }
        ]}
      ]
    },
    { "name": "Draonth", "radius": 243, "orbitRadius": 4208, "orbitSpeed": 0.0075, "angle": -1.521, "color": "#FFE44D",
      "planets": [
        { "name": "Ithiszar", "radius": 124, "orbitRadius": 689, "orbitSpeed": 0.0406, "angle": 3.428, "flore": 62, "faune": 40, "moons": [
            { "name": "Draadis", "radius": 32, "orbitRadius": 180, "orbitSpeed": 0.2849, "angle": 22.073, "flore": 39, "faune": 5 },
            { "name": "Eriumdis", "radius": 27, "orbitRadius": 180, "orbitSpeed": 0.2849, "angle": 26.197, "flore": 30, "faune": 44 }
        ]},
        { "name": "Synisdis", "radius": 82, "orbitRadius": 1097, "orbitSpeed": 0.0397, "angle": 3.326, "flore": 38, "faune": 87, "moons": [
            { "name": "Xoristis", "radius": 28, "orbitRadius": 220, "orbitSpeed": 0.3194, "angle": 24.924, "flore": 10, "faune": 51 },
            { "name": "Zanirth", "radius": 29, "orbitRadius": 220, "orbitSpeed": 0.3194, "angle": 25.863, "flore": 17, "faune": 28 },
            { "name": "Corirbus", "radius": 36, "orbitRadius": 220, "orbitSpeed": 0.3194, "angle": 27.545, "flore": 5, "faune": 10 }
        ]},
        { "name": "Xoranlux", "radius": 85, "orbitRadius": 1097, "orbitSpeed": 0.0397, "angle": 1.771, "flore": 39, "faune": 27, "moons": [
            { "name": "Vorummir", "radius": 56, "orbitRadius": 402, "orbitSpeed": 0.214, "angle": 18.912, "flore": 15, "faune": 42 },
            { "name": "Vororia", "radius": 37, "orbitRadius": 402, "orbitSpeed": 0.214, "angle": 14.213, "flore": 12, "faune": 6 },
            { "name": "Zetitis", "radius": 38, "orbitRadius": 237, "orbitSpeed": 0.2897, "angle": 22.768, "flore": 28, "faune": 23 },
            { "name": "Sigarth", "radius": 25, "orbitRadius": 237, "orbitSpeed": 0.2897, "angle": 24.832, "flore": 8, "faune": 17 }
        ]},
        { "name": "Siganpha", "radius": 123, "orbitRadius": 1599, "orbitSpeed": 0.0309, "angle": 5.828, "flore": 33, "faune": 29, "moons": [
            { "name": "Sigenbus", "radius": 44, "orbitRadius": 203, "orbitSpeed": 0.307, "angle": 21.508, "flore": 38, "faune": 59 },
            { "name": "Pyxuxis", "radius": 24, "orbitRadius": 383, "orbitSpeed": 0.2545, "angle": 18.805, "flore": 46, "faune": 58 }
        ]},
        { "name": "Nebenria", "radius": 79, "orbitRadius": 1097, "orbitSpeed": 0.0397, "angle": 5.594, "flore": 35, "faune": 99, "moons": [
            { "name": "Ithovyn", "radius": 43, "orbitRadius": 294, "orbitSpeed": 0.3108, "angle": 18.381, "flore": 24, "faune": 12 }
        ]}
      ]
    },
    { "name": "Coruth", "radius": 152, "orbitRadius": 4208, "orbitSpeed": 0.0075, "angle": 3.322, "color": "#FF8C42",
      "planets": [
        { "name": "Palumria", "radius": 89, "orbitRadius": 402, "orbitSpeed": 0.0668, "angle": 1.927, "flore": 86, "faune": 47, "moons": [
            { "name": "Auraxth", "radius": 58, "orbitRadius": 174, "orbitSpeed": 0.2386, "angle": 5.193, "flore": 47, "faune": 22 },
            { "name": "Ithisdis", "radius": 23, "orbitRadius": 174, "orbitSpeed": 0.2386, "angle": 7.608, "flore": 44, "faune": 18 }
        ]},
        { "name": "Thalaxdis", "radius": 90, "orbitRadius": 942, "orbitSpeed": 0.0316, "angle": 0.29, "flore": 85, "faune": 30, "moons": [
            { "name": "Velantis", "radius": 41, "orbitRadius": 194, "orbitSpeed": 0.2861, "angle": 6.726, "flore": 19, "faune": 10 }
        ]},
        { "name": "Palosbus", "radius": 116, "orbitRadius": 942, "orbitSpeed": 0.0316, "angle": -0.993, "flore": 6, "faune": 38, "moons": [
            { "name": "Siganxis", "radius": 53, "orbitRadius": 296, "orbitSpeed": 0.3475, "angle": 10.687, "flore": 22, "faune": 60 },
            { "name": "Pyxetis", "radius": 31, "orbitRadius": 296, "orbitSpeed": 0.3475, "angle": 14.696, "flore": 9, "faune": 59 },
            { "name": "Zanibus", "radius": 36, "orbitRadius": 489, "orbitSpeed": 0.3119, "angle": 12.363, "flore": 25, "faune": 20 }
        ]},
        { "name": "Lyrirmir", "radius": 120, "orbitRadius": 942, "orbitSpeed": 0.0316, "angle": 3.654, "flore": 15, "faune": 25, "moons": [
            { "name": "Draisra", "radius": 34, "orbitRadius": 292, "orbitSpeed": 0.3459, "angle": 11.143, "flore": 36, "faune": 27 },
            { "name": "Synendis", "radius": 57, "orbitRadius": 251, "orbitSpeed": 0.3343, "angle": 12.117, "flore": 9, "faune": 3 },
            { "name": "Draonria", "radius": 20, "orbitRadius": 292, "orbitSpeed": 0.3459, "angle": 14.604, "flore": 24, "faune": 32 }
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
        { "name": "Vorera", "radius": 130, "orbitRadius": 565, "orbitSpeed": 0.0378, "angle": 8.756, "flore": 43, "faune": 50, "moons": [
            { "name": "Kryenton", "radius": 45, "orbitRadius": 228, "orbitSpeed": 0.2807, "angle": 78.437, "flore": 19, "faune": 39 },
            { "name": "Voranpha", "radius": 47, "orbitRadius": 228, "orbitSpeed": 0.2807, "angle": 74.416, "flore": 42, "faune": 10 }
        ]},
        { "name": "Palelton", "radius": 110, "orbitRadius": 1180, "orbitSpeed": 0.0405, "angle": 8.684, "flore": 98, "faune": 59, "moons": [
            { "name": "Palozar", "radius": 41, "orbitRadius": 351, "orbitSpeed": 0.1874, "angle": 48.965, "flore": 31, "faune": 4 },
            { "name": "Celexis", "radius": 42, "orbitRadius": 254, "orbitSpeed": 0.3444, "angle": 95.197, "flore": 42, "faune": 23 },
            { "name": "Celira", "radius": 33, "orbitRadius": 254, "orbitSpeed": 0.3444, "angle": 92.965, "flore": 28, "faune": 40 }
        ]},
        { "name": "Sigulux", "radius": 108, "orbitRadius": 1180, "orbitSpeed": 0.0405, "angle": 14.033, "flore": 75, "faune": 71, "moons": [
            { "name": "Nebozar", "radius": 34, "orbitRadius": 302, "orbitSpeed": 0.2793, "angle": 76.752, "flore": 17, "faune": 59 },
            { "name": "Draistis", "radius": 46, "orbitRadius": 302, "orbitSpeed": 0.2793, "angle": 75.475, "flore": 18, "faune": 34 }
        ]},
        { "name": "Palirtis", "radius": 86, "orbitRadius": 1180, "orbitSpeed": 0.0405, "angle": 10.976, "flore": 72, "faune": 3, "moons": [
            { "name": "Draanton", "radius": 31, "orbitRadius": 180, "orbitSpeed": 0.2081, "angle": 55.147, "flore": 17, "faune": 40 },
            { "name": "Celisria", "radius": 35, "orbitRadius": 300, "orbitSpeed": 0.3361, "angle": 91.912, "flore": 37, "faune": 19 }
        ]},
        { "name": "Pyxonbus", "radius": 124, "orbitRadius": 565, "orbitSpeed": 0.0378, "angle": 10.582, "flore": 54, "faune": 52, "moons": [
            { "name": "Thalalxis", "radius": 51, "orbitRadius": 195, "orbitSpeed": 0.3188, "angle": 89.538, "flore": 25, "faune": 12 },
            { "name": "Zanirton", "radius": 51, "orbitRadius": 195, "orbitSpeed": 0.3188, "angle": 86.146, "flore": 40, "faune": 55 }
        ]},
        { "name": "Eriumtis", "radius": 90, "orbitRadius": 1180, "orbitSpeed": 0.0405, "angle": 12.7, "flore": 26, "faune": 86, "moons": [
            { "name": "Xorirdis", "radius": 34, "orbitRadius": 344, "orbitSpeed": 0.2709, "angle": 65.331, "flore": 33, "faune": 52 }
        ]}
      ]
    },
    { "name": "Xororia", "radius": 177, "orbitRadius": 2305, "orbitSpeed": 0.0116, "angle": 6.148, "color": "#FFB830",
      "planets": [
        { "name": "Lyrelnis", "radius": 86, "orbitRadius": 475, "orbitSpeed": 0.059, "angle": 11.838, "flore": 82, "faune": 52, "moons": [
            { "name": "Ithanria", "radius": 26, "orbitRadius": 196, "orbitSpeed": 0.3158, "angle": 72.204, "flore": 27, "faune": 59 },
            { "name": "Pyxalbus", "radius": 60, "orbitRadius": 196, "orbitSpeed": 0.3158, "angle": 68.9, "flore": 33, "faune": 15 }
        ]},
        { "name": "Nebirzar", "radius": 86, "orbitRadius": 475, "orbitSpeed": 0.059, "angle": 16.529, "flore": 59, "faune": 21, "moons": [
            { "name": "Draonbus", "radius": 54, "orbitRadius": 211, "orbitSpeed": 0.2698, "angle": 61.664, "flore": 50, "faune": 38 }
        ]},
        { "name": "Thalisvyn", "radius": 106, "orbitRadius": 1056, "orbitSpeed": 0.0402, "angle": 9.877, "flore": 6, "faune": 74, "moons": [
            { "name": "Synelnis", "radius": 24, "orbitRadius": 326, "orbitSpeed": 0.3206, "angle": 72.335, "flore": 43, "faune": 20 }
        ]},
        { "name": "Palonnis", "radius": 86, "orbitRadius": 1056, "orbitSpeed": 0.0402, "angle": 8.644, "flore": 2, "faune": 17, "moons": [
            { "name": "Velelra", "radius": 49, "orbitRadius": 273, "orbitSpeed": 0.2991, "angle": 71.211, "flore": 48, "faune": 57 },
            { "name": "Thalilux", "radius": 41, "orbitRadius": 273, "orbitSpeed": 0.2991, "angle": 66.362, "flore": 7, "faune": 32 }
        ]},
        { "name": "Xoronmus", "radius": 73, "orbitRadius": 1056, "orbitSpeed": 0.0402, "angle": 6.695, "flore": 6, "faune": 99, "moons": [
            { "name": "Lyrilux", "radius": 29, "orbitRadius": 101, "orbitSpeed": 0.2853, "angle": 65.399, "flore": 0, "faune": 29 },
            { "name": "Nebantis", "radius": 35, "orbitRadius": 445, "orbitSpeed": 0.3024, "angle": 69.996, "flore": 45, "faune": 30 },
            { "name": "Lyrarpha", "radius": 47, "orbitRadius": 445, "orbitSpeed": 0.3024, "angle": 68.974, "flore": 3, "faune": 37 }
        ]},
        { "name": "Zananra", "radius": 71, "orbitRadius": 1056, "orbitSpeed": 0.0402, "angle": 7.545, "flore": 38, "faune": 90, "moons": [
            { "name": "Omiosdon", "radius": 35, "orbitRadius": 255, "orbitSpeed": 0.2291, "angle": 54.36, "flore": 0, "faune": 59 },
            { "name": "Zetirton", "radius": 26, "orbitRadius": 255, "orbitSpeed": 0.2291, "angle": 52.647, "flore": 26, "faune": 6 },
            { "name": "Zetizar", "radius": 42, "orbitRadius": 340, "orbitSpeed": 0.2948, "angle": 64.68, "flore": 0, "faune": 60 }
        ]}
      ]
    },
    { "name": "Zanirria", "radius": 236, "orbitRadius": 2305, "orbitSpeed": 0.0116, "angle": 1.737, "color": "#FFB830",
      "planets": [
        { "name": "Vorenria", "radius": 78, "orbitRadius": 529, "orbitSpeed": 0.0547, "angle": 19.317, "flore": 22, "faune": 56, "moons": [
            { "name": "Erialmus", "radius": 58, "orbitRadius": 166, "orbitSpeed": 0.2592, "angle": 77.763, "flore": 19, "faune": 3 },
            { "name": "Sigeria", "radius": 38, "orbitRadius": 211, "orbitSpeed": 0.2395, "angle": 74.301, "flore": 4, "faune": 13 }
        ]},
        { "name": "Synendis", "radius": 105, "orbitRadius": 529, "orbitSpeed": 0.0547, "angle": 21.402, "flore": 58, "faune": 56, "moons": [
            { "name": "Nebispha", "radius": 55, "orbitRadius": 198, "orbitSpeed": 0.3043, "angle": 88.961, "flore": 22, "faune": 51 },
            { "name": "Erialnis", "radius": 31, "orbitRadius": 198, "orbitSpeed": 0.3043, "angle": 91.686, "flore": 4, "faune": 60 }
        ]},
        { "name": "Eriudon", "radius": 120, "orbitRadius": 1337, "orbitSpeed": 0.0288, "angle": 6.928, "flore": 41, "faune": 62, "moons": [
            { "name": "Nebarnis", "radius": 52, "orbitRadius": 279, "orbitSpeed": 0.3045, "angle": 91.648, "flore": 11, "faune": 9 }
        ]},
        { "name": "Zetoton", "radius": 106, "orbitRadius": 1337, "orbitSpeed": 0.0288, "angle": 11.947, "flore": 14, "faune": 77, "moons": [
            { "name": "Velisdon", "radius": 38, "orbitRadius": 356, "orbitSpeed": 0.2826, "angle": 82.421, "flore": 30, "faune": 9 },
            { "name": "Ithulux", "radius": 36, "orbitRadius": 356, "orbitSpeed": 0.2826, "angle": 86.781, "flore": 42, "faune": 27 },
            { "name": "Thalitis", "radius": 56, "orbitRadius": 218, "orbitSpeed": 0.1518, "angle": 46.354, "flore": 29, "faune": 40 }
        ]},
        { "name": "Synosnis", "radius": 116, "orbitRadius": 1337, "orbitSpeed": 0.0288, "angle": 10.501, "flore": 14, "faune": 75, "moons": [
            { "name": "Nebodis", "radius": 60, "orbitRadius": 238, "orbitSpeed": 0.2718, "angle": 81.233, "flore": 29, "faune": 11 },
            { "name": "Sigirpha", "radius": 54, "orbitRadius": 412, "orbitSpeed": 0.2383, "angle": 70.487, "flore": 19, "faune": 40 }
        ]},
        { "name": "Sigalzar", "radius": 101, "orbitRadius": 1337, "orbitSpeed": 0.0288, "angle": 9.589, "flore": 9, "faune": 73, "moons": [
            { "name": "Aurelzar", "radius": 49, "orbitRadius": 171, "orbitSpeed": 0.1655, "angle": 55.735, "flore": 33, "faune": 16 },
            { "name": "Omiarth", "radius": 22, "orbitRadius": 322, "orbitSpeed": 0.3248, "angle": 101.535, "flore": 22, "faune": 26 },
            { "name": "Xorenlux", "radius": 28, "orbitRadius": 400, "orbitSpeed": 0.349, "angle": 109.034, "flore": 37, "faune": 31 },
            { "name": "Palexis", "radius": 24, "orbitRadius": 400, "orbitSpeed": 0.349, "angle": 107.961, "flore": 35, "faune": 43 }
        ]}
      ]
    },
    { "name": "Palinis", "radius": 204, "orbitRadius": 4954, "orbitSpeed": 0.0087, "angle": 4.66, "color": "#7CB9FF",
      "planets": [
        { "name": "Kryidon", "radius": 85, "orbitRadius": 914, "orbitSpeed": 0.0407, "angle": 5.63, "flore": 62, "faune": 87, "moons": [
            { "name": "Auraxra", "radius": 57, "orbitRadius": 316, "orbitSpeed": 0.2377, "angle": 46.316, "flore": 16, "faune": 0 },
            { "name": "Omiirlux", "radius": 26, "orbitRadius": 199, "orbitSpeed": 0.2755, "angle": 51.682, "flore": 12, "faune": 0 },
            { "name": "Nebonnis", "radius": 29, "orbitRadius": 199, "orbitSpeed": 0.2755, "angle": 50.126, "flore": 18, "faune": 30 }
        ]},
        { "name": "Pyxumdon", "radius": 108, "orbitRadius": 914, "orbitSpeed": 0.0407, "angle": 8.551, "flore": 6, "faune": 1, "moons": [
            { "name": "Aurixis", "radius": 58, "orbitRadius": 371, "orbitSpeed": 0.1685, "angle": 33.087, "flore": 12, "faune": 47 },
            { "name": "Ithosra", "radius": 58, "orbitRadius": 371, "orbitSpeed": 0.1685, "angle": 29.139, "flore": 44, "faune": 21 }
        ]},
        { "name": "Zetalton", "radius": 84, "orbitRadius": 914, "orbitSpeed": 0.0407, "angle": 10.345, "flore": 17, "faune": 66, "moons": [
            { "name": "Pyxenth", "radius": 20, "orbitRadius": 267, "orbitSpeed": 0.2451, "angle": 42.551, "flore": 37, "faune": 44 },
            { "name": "Nebanpha", "radius": 58, "orbitRadius": 267, "orbitSpeed": 0.2451, "angle": 46.282, "flore": 43, "faune": 58 }
        ]},
        { "name": "Zetolux", "radius": 129, "orbitRadius": 1368, "orbitSpeed": 0.0226, "angle": 3.143, "flore": 1, "faune": 48, "moons": [
            { "name": "Zanelnis", "radius": 50, "orbitRadius": 257, "orbitSpeed": 0.2953, "angle": 52.584, "flore": 23, "faune": 23 },
            { "name": "Zetelpha", "radius": 44, "orbitRadius": 257, "orbitSpeed": 0.2953, "angle": 56.823, "flore": 34, "faune": 7 }
        ]},
        { "name": "Thalirria", "radius": 108, "orbitRadius": 1368, "orbitSpeed": 0.0226, "angle": 4.377, "flore": 50, "faune": 37, "moons": [
            { "name": "Auremir", "radius": 37, "orbitRadius": 287, "orbitSpeed": 0.2084, "angle": 32.558, "flore": 13, "faune": 37 }
        ]},
        { "name": "Auraltis", "radius": 70, "orbitRadius": 1368, "orbitSpeed": 0.0226, "angle": 6.758, "flore": 36, "faune": 33, "moons": [
            { "name": "Coronis", "radius": 27, "orbitRadius": 155, "orbitSpeed": 0.227, "angle": 34.665, "flore": 15, "faune": 12 }
        ]}
      ]
    },
    { "name": "Zetarmus", "radius": 180, "orbitRadius": 4954, "orbitSpeed": 0.0087, "angle": -0.06, "color": "#FFE44D",
      "planets": [
        { "name": "Nebivyn", "radius": 116, "orbitRadius": 576, "orbitSpeed": 0.0417, "angle": 5.519, "flore": 24, "faune": 1, "moons": [
            { "name": "Vorarvyn", "radius": 42, "orbitRadius": 223, "orbitSpeed": 0.2733, "angle": 33.462, "flore": 38, "faune": 9 },
            { "name": "Draaxbus", "radius": 43, "orbitRadius": 223, "orbitSpeed": 0.2733, "angle": 37.644, "flore": 22, "faune": 52 },
            { "name": "Synumnis", "radius": 30, "orbitRadius": 223, "orbitSpeed": 0.2733, "angle": 36.805, "flore": 46, "faune": 36 }
        ]},
        { "name": "Lyrarmus", "radius": 87, "orbitRadius": 576, "orbitSpeed": 0.0417, "angle": 9.513, "flore": 31, "faune": 74, "moons": [
            { "name": "Palardon", "radius": 25, "orbitRadius": 182, "orbitSpeed": 0.198, "angle": 23.135, "flore": 9, "faune": 33 },
            { "name": "Aurisbus", "radius": 47, "orbitRadius": 182, "orbitSpeed": 0.198, "angle": 27.867, "flore": 12, "faune": 9 }
        ]},
        { "name": "Synarmir", "radius": 123, "orbitRadius": 576, "orbitSpeed": 0.0417, "angle": 8.226, "flore": 16, "faune": 41, "moons": [
            { "name": "Sigonis", "radius": 41, "orbitRadius": 276, "orbitSpeed": 0.2022, "angle": 29.091, "flore": 45, "faune": 54 },
            { "name": "Nebumdis", "radius": 40, "orbitRadius": 389, "orbitSpeed": 0.2189, "angle": 29.845, "flore": 25, "faune": 30 },
            { "name": "Sigumdis", "radius": 36, "orbitRadius": 276, "orbitSpeed": 0.2022, "angle": 25.168, "flore": 10, "faune": 44 }
        ]},
        { "name": "Xorendon", "radius": 110, "orbitRadius": 1266, "orbitSpeed": 0.0252, "angle": 1.252, "flore": 79, "faune": 49, "moons": [
            { "name": "Omiaxxis", "radius": 25, "orbitRadius": 177, "orbitSpeed": 0.2763, "angle": 42.016, "flore": 41, "faune": 13 },
            { "name": "Aurobus", "radius": 51, "orbitRadius": 319, "orbitSpeed": 0.2099, "angle": 26.542, "flore": 21, "faune": 29 },
            { "name": "Corubus", "radius": 34, "orbitRadius": 177, "orbitSpeed": 0.2763, "angle": 37.003, "flore": 16, "faune": 55 }
        ]},
        { "name": "Xoraxth", "radius": 102, "orbitRadius": 1266, "orbitSpeed": 0.0252, "angle": 6.854, "flore": 51, "faune": 37, "moons": [
            { "name": "Zetonnis", "radius": 20, "orbitRadius": 212, "orbitSpeed": 0.204, "angle": 31.462, "flore": 2, "faune": 34 },
            { "name": "Veludis", "radius": 26, "orbitRadius": 438, "orbitSpeed": 0.2261, "angle": 28.512, "flore": 34, "faune": 9 },
            { "name": "Lyrenbus", "radius": 23, "orbitRadius": 438, "orbitSpeed": 0.2261, "angle": 34.003, "flore": 46, "faune": 38 },
            { "name": "Palonra", "radius": 39, "orbitRadius": 438, "orbitSpeed": 0.2261, "angle": 32.85, "flore": 8, "faune": 8 }
        ]},
        { "name": "Celoston", "radius": 96, "orbitRadius": 1266, "orbitSpeed": 0.0252, "angle": 3.596, "flore": 25, "faune": 39, "moons": [
            { "name": "Draomir", "radius": 57, "orbitRadius": 242, "orbitSpeed": 0.2086, "angle": 28.754, "flore": 47, "faune": 43 },
            { "name": "Zanara", "radius": 21, "orbitRadius": 315, "orbitSpeed": 0.2514, "angle": 33.754, "flore": 10, "faune": 54 },
            { "name": "Draaltis", "radius": 41, "orbitRadius": 242, "orbitSpeed": 0.2086, "angle": 24.767, "flore": 45, "faune": 38 },
            { "name": "Sigarria", "radius": 45, "orbitRadius": 315, "orbitSpeed": 0.2514, "angle": 31.35, "flore": 37, "faune": 56 }
        ]},
        { "name": "Sigelzar", "radius": 128, "orbitRadius": 1266, "orbitSpeed": 0.0252, "angle": 2.486, "flore": 3, "faune": 82, "moons": [
            { "name": "Ithaxth", "radius": 24, "orbitRadius": 256, "orbitSpeed": 0.3419, "angle": 50.743, "flore": 20, "faune": 7 },
            { "name": "Itheth", "radius": 56, "orbitRadius": 471, "orbitSpeed": 0.268, "angle": 41.656, "flore": 0, "faune": 35 },
            { "name": "Zanarlux", "radius": 59, "orbitRadius": 256, "orbitSpeed": 0.3419, "angle": 46.039, "flore": 9, "faune": 31 }
        ]},
        { "name": "Pyxeton", "radius": 97, "orbitRadius": 1266, "orbitSpeed": 0.0252, "angle": 5.024, "flore": 35, "faune": 41, "moons": [] }
      ]
    },
    { "name": "Thalatis", "radius": 209, "orbitRadius": 4954, "orbitSpeed": 0.0087, "angle": 1.444, "color": "#FFE44D",
      "planets": [
        { "name": "Pyxenis", "radius": 113, "orbitRadius": 487, "orbitSpeed": 0.0428, "angle": 2.179, "flore": 8, "faune": 17, "moons": [
            { "name": "Coronmus", "radius": 31, "orbitRadius": 207, "orbitSpeed": 0.2115, "angle": 23.527, "flore": 43, "faune": 16 },
            { "name": "Celenbus", "radius": 34, "orbitRadius": 207, "orbitSpeed": 0.2115, "angle": 19.37, "flore": 48, "faune": 47 }
        ]},
        { "name": "Nebisdis", "radius": 124, "orbitRadius": 813, "orbitSpeed": 0.0393, "angle": 1.291, "flore": 81, "faune": 53, "moons": [] },
        { "name": "Synismus", "radius": 91, "orbitRadius": 813, "orbitSpeed": 0.0393, "angle": 5.952, "flore": 24, "faune": 57, "moons": [
            { "name": "Coranra", "radius": 31, "orbitRadius": 161, "orbitSpeed": 0.2807, "angle": 20.499, "flore": 26, "faune": 39 },
            { "name": "Palaxbus", "radius": 54, "orbitRadius": 161, "orbitSpeed": 0.2807, "angle": 24.918, "flore": 40, "faune": 29 }
        ]},
        { "name": "Zetumir", "radius": 108, "orbitRadius": 487, "orbitSpeed": 0.0428, "angle": 4.889, "flore": 14, "faune": 33, "moons": [
            { "name": "Aurirth", "radius": 32, "orbitRadius": 228, "orbitSpeed": 0.2383, "angle": 17.085, "flore": 28, "faune": 60 },
            { "name": "Nebenlux", "radius": 25, "orbitRadius": 228, "orbitSpeed": 0.2383, "angle": 22.549, "flore": 3, "faune": 30 },
            { "name": "Zanenpha", "radius": 45, "orbitRadius": 228, "orbitSpeed": 0.2383, "angle": 19.931, "flore": 38, "faune": 1 }
        ]},
        { "name": "Corelra", "radius": 99, "orbitRadius": 813, "orbitSpeed": 0.0393, "angle": 3.352, "flore": 94, "faune": 47, "moons": [
            { "name": "Xorezar", "radius": 28, "orbitRadius": 198, "orbitSpeed": 0.3483, "angle": 30.943, "flore": 10, "faune": 37 },
            { "name": "Ithexis", "radius": 26, "orbitRadius": 198, "orbitSpeed": 0.3483, "angle": 35.87, "flore": 30, "faune": 55 },
            { "name": "Zanalvyn", "radius": 44, "orbitRadius": 198, "orbitSpeed": 0.3483, "angle": 34.89, "flore": 29, "faune": 7 },
            { "name": "Draitis", "radius": 34, "orbitRadius": 274, "orbitSpeed": 0.1943, "angle": 20.009, "flore": 18, "faune": 38 },
            { "name": "Ithanxis", "radius": 38, "orbitRadius": 274, "orbitSpeed": 0.1943, "angle": 15.68, "flore": 38, "faune": 57 }
        ]}
      ]
    },
    { "name": "Kryaxth", "radius": 174, "orbitRadius": 4954, "orbitSpeed": 0.0087, "angle": 2.479, "color": "#FFB830",
      "planets": [
        { "name": "Pyxanxis", "radius": 110, "orbitRadius": 363, "orbitSpeed": 0.0666, "angle": 2.822, "flore": 69, "faune": 44, "moons": [] },
        { "name": "Celumnis", "radius": 74, "orbitRadius": 866, "orbitSpeed": 0.0423, "angle": 0.267, "flore": 46, "faune": 66, "moons": [
            { "name": "Pyxenbus", "radius": 42, "orbitRadius": 140, "orbitSpeed": 0.2087, "angle": 12.291, "flore": 39, "faune": 22 },
            { "name": "Vorora", "radius": 29, "orbitRadius": 140, "orbitSpeed": 0.2087, "angle": 11.324, "flore": 27, "faune": 55 },
            { "name": "Palura", "radius": 56, "orbitRadius": 244, "orbitSpeed": 0.1911, "angle": 9.959, "flore": 42, "faune": 54 }
        ]},
        { "name": "Pyxunis", "radius": 119, "orbitRadius": 363, "orbitSpeed": 0.0666, "angle": 6.731, "flore": 22, "faune": 23, "moons": [] },
        { "name": "Vorabus", "radius": 92, "orbitRadius": 866, "orbitSpeed": 0.0423, "angle": 3.759, "flore": 68, "faune": 63, "moons": [
            { "name": "Lyrobus", "radius": 29, "orbitRadius": 142, "orbitSpeed": 0.219, "angle": 7.624, "flore": 8, "faune": 5 },
            { "name": "Kryisxis", "radius": 40, "orbitRadius": 340, "orbitSpeed": 0.3086, "angle": 11.924, "flore": 44, "faune": 49 },
            { "name": "Nebirxis", "radius": 21, "orbitRadius": 340, "orbitSpeed": 0.3086, "angle": 17.287, "flore": 8, "faune": 4 },
            { "name": "Pyxanis", "radius": 53, "orbitRadius": 340, "orbitSpeed": 0.3086, "angle": 16.127, "flore": 41, "faune": 9 }
        ]},
        { "name": "Sigadis", "radius": 124, "orbitRadius": 866, "orbitSpeed": 0.0423, "angle": 5.13, "flore": 15, "faune": 20, "moons": [
            { "name": "Vorumir", "radius": 36, "orbitRadius": 240, "orbitSpeed": 0.1817, "angle": 6.692, "flore": 23, "faune": 35 },
            { "name": "Kryanbus", "radius": 45, "orbitRadius": 240, "orbitSpeed": 0.1817, "angle": 11.188, "flore": 40, "faune": 47 },
            { "name": "Drairpha", "radius": 25, "orbitRadius": 400, "orbitSpeed": 0.3131, "angle": 17.578, "flore": 36, "faune": 13 },
            { "name": "Nebeth", "radius": 42, "orbitRadius": 240, "orbitSpeed": 0.1817, "angle": 9.053, "flore": 39, "faune": 32 },
            { "name": "Omienlux", "radius": 33, "orbitRadius": 400, "orbitSpeed": 0.3131, "angle": 13.246, "flore": 45, "faune": 7 },
            { "name": "Lyrosdon", "radius": 49, "orbitRadius": 400, "orbitSpeed": 0.3131, "angle": 12.504, "flore": 29, "faune": 31 }
        ]},
        { "name": "Xoridon", "radius": 126, "orbitRadius": 866, "orbitSpeed": 0.0423, "angle": 2.659, "flore": 8, "faune": 12, "moons": [
            { "name": "Thalath", "radius": 58, "orbitRadius": 280, "orbitSpeed": 0.3208, "angle": 21.367, "flore": 24, "faune": 49 },
            { "name": "Vorondon", "radius": 35, "orbitRadius": 280, "orbitSpeed": 0.3208, "angle": 16.564, "flore": 32, "faune": 56 }
        ]}
      ]
    },
    { "name": "Palondis", "radius": 156, "orbitRadius": 4954, "orbitSpeed": 0.0087, "angle": -2.811, "color": "#FF6B6B",
      "planets": [
        { "name": "Omioth", "radius": 99, "orbitRadius": 386, "orbitSpeed": 0.0617, "angle": -1.441, "flore": 40, "faune": 6, "moons": [
            { "name": "Synarmus", "radius": 56, "orbitRadius": 191, "orbitSpeed": 0.191, "angle": 1.659, "flore": 2, "faune": 25 }
        ]},
        { "name": "Palith", "radius": 113, "orbitRadius": 851, "orbitSpeed": 0.0427, "angle": -1.804, "flore": 75, "faune": 6, "moons": [
            { "name": "Aurenria", "radius": 31, "orbitRadius": 280, "orbitSpeed": 0.2631, "angle": 0.427, "flore": 44, "faune": 50 },
            { "name": "Auranra", "radius": 46, "orbitRadius": 280, "orbitSpeed": 0.2631, "angle": 5.751, "flore": 30, "faune": 10 }
        ]},
        { "name": "Xorallux", "radius": 129, "orbitRadius": 851, "orbitSpeed": 0.0427, "angle": -0.421, "flore": 28, "faune": 34, "moons": [
            { "name": "Lyralvyn", "radius": 27, "orbitRadius": 215, "orbitSpeed": 0.1804, "angle": -0.344, "flore": 43, "faune": 16 },
            { "name": "Itharnis", "radius": 40, "orbitRadius": 215, "orbitSpeed": 0.1804, "angle": 1.293, "flore": 28, "faune": 56 },
            { "name": "Draelzar", "radius": 48, "orbitRadius": 309, "orbitSpeed": 0.3038, "angle": 5.348, "flore": 3, "faune": 57 }
        ]},
        { "name": "Xorinis", "radius": 100, "orbitRadius": 386, "orbitSpeed": 0.0617, "angle": 1.839, "flore": 57, "faune": 20, "moons": [] },
        { "name": "Synirra", "radius": 92, "orbitRadius": 851, "orbitSpeed": 0.0427, "angle": 2.94, "flore": 37, "faune": 100, "moons": [
            { "name": "Zetopha", "radius": 47, "orbitRadius": 147, "orbitSpeed": 0.3359, "angle": -0.238, "flore": 33, "faune": 27 },
            { "name": "Aurosth", "radius": 43, "orbitRadius": 361, "orbitSpeed": 0.2861, "angle": 4.667, "flore": 22, "faune": 23 },
            { "name": "Vorirtis", "radius": 29, "orbitRadius": 361, "orbitSpeed": 0.2861, "angle": 3.845, "flore": 42, "faune": 16 }
        ]},
        { "name": "Celaxria", "radius": 119, "orbitRadius": 851, "orbitSpeed": 0.0427, "angle": 2.102, "flore": 62, "faune": 18, "moons": [
            { "name": "Celera", "radius": 56, "orbitRadius": 198, "orbitSpeed": 0.199, "angle": 3.453, "flore": 8, "faune": 51 }
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
        { "name": "Coredon", "radius": 75, "orbitRadius": 464, "orbitSpeed": 0.0517, "angle": 21.672, "flore": 97, "faune": 46, "moons": [
            { "name": "Omiunis", "radius": 29, "orbitRadius": 176, "orbitSpeed": 0.3169, "angle": 21.984, "flore": 40, "faune": 57 },
            { "name": "Sigaxvyn", "radius": 55, "orbitRadius": 176, "orbitSpeed": 0.3169, "angle": 23.175, "flore": 8, "faune": 31 }
        ]},
        { "name": "Synatis", "radius": 74, "orbitRadius": 464, "orbitSpeed": 0.0517, "angle": 19.683, "flore": 60, "faune": 51, "moons": [
            { "name": "Ithismus", "radius": 42, "orbitRadius": 200, "orbitSpeed": 0.3031, "angle": 21.684, "flore": 35, "faune": 42 }
        ]},
        { "name": "Vorelzar", "radius": 94, "orbitRadius": 464, "orbitSpeed": 0.0517, "angle": 18.316, "flore": 62, "faune": 20, "moons": [] }
      ]
    },
    { "name": "Pyxeton", "radius": 218, "orbitRadius": 1834, "orbitSpeed": 0.0121, "angle": 5.559, "color": "#FF6B6B",
      "planets": [
        { "name": "Celumtis", "radius": 74, "orbitRadius": 1047, "orbitSpeed": 0.0346, "angle": 10.093, "flore": 6, "faune": 47, "moons": [
            { "name": "Coronmir", "radius": 55, "orbitRadius": 155, "orbitSpeed": 0.1773, "angle": 24.858, "flore": 13, "faune": 32 },
            { "name": "Eriaton", "radius": 24, "orbitRadius": 155, "orbitSpeed": 0.1773, "angle": 29.412, "flore": 19, "faune": 45 }
        ]},
        { "name": "Zetellux", "radius": 117, "orbitRadius": 1047, "orbitSpeed": 0.0346, "angle": 9.45, "flore": 4, "faune": 31, "moons": [
            { "name": "Zetenis", "radius": 29, "orbitRadius": 232, "orbitSpeed": 0.152, "angle": 21.215, "flore": 36, "faune": 52 },
            { "name": "Xoronbus", "radius": 39, "orbitRadius": 232, "orbitSpeed": 0.152, "angle": 26.277, "flore": 16, "faune": 23 },
            { "name": "Omialux", "radius": 21, "orbitRadius": 373, "orbitSpeed": 0.1843, "angle": 30.642, "flore": 45, "faune": 7 }
        ]},
        { "name": "Xoraxria", "radius": 95, "orbitRadius": 1047, "orbitSpeed": 0.0346, "angle": 14.309, "flore": 9, "faune": 69, "moons": [
            { "name": "Zetudon", "radius": 60, "orbitRadius": 291, "orbitSpeed": 0.2225, "angle": 33.57, "flore": 32, "faune": 23 },
            { "name": "Zetedis", "radius": 48, "orbitRadius": 291, "orbitSpeed": 0.2225, "angle": 31.798, "flore": 10, "faune": 50 }
        ]},
        { "name": "Kryenmus", "radius": 76, "orbitRadius": 1047, "orbitSpeed": 0.0346, "angle": 11.266, "flore": 53, "faune": 78, "moons": [
            { "name": "Kryenbus", "radius": 42, "orbitRadius": 237, "orbitSpeed": 0.3444, "angle": 48.78, "flore": 26, "faune": 18 }
        ]},
        { "name": "Zanaxzar", "radius": 118, "orbitRadius": 1047, "orbitSpeed": 0.0346, "angle": 13.315, "flore": 43, "faune": 99, "moons": [
            { "name": "Pyxuton", "radius": 39, "orbitRadius": 392, "orbitSpeed": 0.3304, "angle": 43.583, "flore": 39, "faune": 53 },
            { "name": "Erionzar", "radius": 40, "orbitRadius": 392, "orbitSpeed": 0.3304, "angle": 45.271, "flore": 19, "faune": 26 }
        ]},
        { "name": "Xoralxis", "radius": 93, "orbitRadius": 502, "orbitSpeed": 0.0413, "angle": 10.492, "flore": 63, "faune": 78, "moons": [
            { "name": "Celaldon", "radius": 58, "orbitRadius": 184, "orbitSpeed": 0.2729, "angle": 39.993, "flore": 3, "faune": 21 },
            { "name": "Celiston", "radius": 58, "orbitRadius": 184, "orbitSpeed": 0.2729, "angle": 37.336, "flore": 9, "faune": 9 }
        ]},
        { "name": "Kryelzar", "radius": 81, "orbitRadius": 502, "orbitSpeed": 0.0413, "angle": 14.922, "flore": 35, "faune": 31, "moons": [
            { "name": "Coramir", "radius": 26, "orbitRadius": 192, "orbitSpeed": 0.2178, "angle": 29.367, "flore": 18, "faune": 52 },
            { "name": "Sigumxis", "radius": 46, "orbitRadius": 192, "orbitSpeed": 0.2178, "angle": 33.765, "flore": 26, "faune": 29 }
        ]},
        { "name": "Velalpha", "radius": 107, "orbitRadius": 502, "orbitSpeed": 0.0413, "angle": 13.501, "flore": 12, "faune": 10, "moons": [
            { "name": "Zanidon", "radius": 32, "orbitRadius": 223, "orbitSpeed": 0.1616, "angle": 20.238, "flore": 17, "faune": 35 },
            { "name": "Synonis", "radius": 41, "orbitRadius": 223, "orbitSpeed": 0.1616, "angle": 21.867, "flore": 47, "faune": 29 },
            { "name": "Velaxpha", "radius": 41, "orbitRadius": 223, "orbitSpeed": 0.1616, "angle": 23.419, "flore": 40, "faune": 46 }
        ]}
      ]
    },
    { "name": "Xoreria", "radius": 239, "orbitRadius": 1834, "orbitSpeed": 0.0121, "angle": 1.964, "color": "#FFE44D",
      "planets": [
        { "name": "Kryirpha", "radius": 91, "orbitRadius": 372, "orbitSpeed": 0.0683, "angle": 28.08, "flore": 20, "faune": 12, "moons": [] },
        { "name": "Omiaxnis", "radius": 88, "orbitRadius": 758, "orbitSpeed": 0.0502, "angle": 15.334, "flore": 42, "faune": 25, "moons": [
            { "name": "Vorupha", "radius": 36, "orbitRadius": 179, "orbitSpeed": 0.2037, "angle": 21.113, "flore": 26, "faune": 13 },
            { "name": "Sigemir", "radius": 29, "orbitRadius": 271, "orbitSpeed": 0.3197, "angle": 26.377, "flore": 40, "faune": 28 }
        ]},
        { "name": "Vorelmus", "radius": 85, "orbitRadius": 372, "orbitSpeed": 0.0683, "angle": 23.598, "flore": 64, "faune": 49, "moons": [] },
        { "name": "Aurumria", "radius": 101, "orbitRadius": 372, "orbitSpeed": 0.0683, "angle": 24.667, "flore": 36, "faune": 79, "moons": [] },
        { "name": "Velumdis", "radius": 106, "orbitRadius": 758, "orbitSpeed": 0.0502, "angle": 18.963, "flore": 51, "faune": 55, "moons": [
            { "name": "Synenria", "radius": 58, "orbitRadius": 330, "orbitSpeed": 0.3007, "angle": 23.372, "flore": 33, "faune": 43 },
            { "name": "Celora", "radius": 20, "orbitRadius": 231, "orbitSpeed": 0.2357, "angle": 22.193, "flore": 42, "faune": 48 },
            { "name": "Pyxera", "radius": 26, "orbitRadius": 231, "orbitSpeed": 0.2357, "angle": 20.631, "flore": 49, "faune": 58 },
            { "name": "Paleria", "radius": 39, "orbitRadius": 330, "orbitSpeed": 0.3007, "angle": 25.706, "flore": 17, "faune": 45 }
        ]},
        { "name": "Palosmus", "radius": 126, "orbitRadius": 758, "orbitSpeed": 0.0502, "angle": 20.336, "flore": 38, "faune": 12, "moons": [
            { "name": "Sigismus", "radius": 43, "orbitRadius": 213, "orbitSpeed": 0.3127, "angle": 26.297, "flore": 43, "faune": 8 },
            { "name": "Nebosth", "radius": 27, "orbitRadius": 213, "orbitSpeed": 0.3127, "angle": 27.304, "flore": 4, "faune": 33 },
            { "name": "Zananmir", "radius": 55, "orbitRadius": 213, "orbitSpeed": 0.3127, "angle": 28.31, "flore": 48, "faune": 35 }
        ]},
        { "name": "Synarria", "radius": 124, "orbitRadius": 758, "orbitSpeed": 0.0502, "angle": 16.912, "flore": 57, "faune": 61, "moons": [
            { "name": "Coralbus", "radius": 42, "orbitRadius": 223, "orbitSpeed": 0.3397, "angle": 30.971, "flore": 13, "faune": 52 },
            { "name": "Vorelux", "radius": 51, "orbitRadius": 223, "orbitSpeed": 0.3397, "angle": 29.896, "flore": 5, "faune": 40 }
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
        { "name": "Aurath", "radius": 72, "orbitRadius": 594, "orbitSpeed": 0.0567, "angle": 19.061, "flore": 87, "faune": 2, "moons": [
            { "name": "Corostis", "radius": 24, "orbitRadius": 210, "orbitSpeed": 0.227, "angle": 61.523, "flore": 7, "faune": 35 },
            { "name": "Velomir", "radius": 50, "orbitRadius": 210, "orbitSpeed": 0.227, "angle": 56.351, "flore": 33, "faune": 43 },
            { "name": "Lyrapha", "radius": 29, "orbitRadius": 294, "orbitSpeed": 0.2128, "angle": 54.299, "flore": 11, "faune": 31 }
        ]},
        { "name": "Sigiton", "radius": 90, "orbitRadius": 1168, "orbitSpeed": 0.0292, "angle": 10.131, "flore": 23, "faune": 17, "moons": [
            { "name": "Kryenpha", "radius": 43, "orbitRadius": 261, "orbitSpeed": 0.2952, "angle": 70.671, "flore": 9, "faune": 37 },
            { "name": "Voraxpha", "radius": 20, "orbitRadius": 261, "orbitSpeed": 0.2952, "angle": 73.94, "flore": 45, "faune": 45 },
            { "name": "Coraxbus", "radius": 58, "orbitRadius": 261, "orbitSpeed": 0.2952, "angle": 68.941, "flore": 18, "faune": 10 }
        ]},
        { "name": "Synoxis", "radius": 77, "orbitRadius": 1168, "orbitSpeed": 0.0292, "angle": 11.165, "flore": 79, "faune": 23, "moons": [
            { "name": "Draelux", "radius": 39, "orbitRadius": 187, "orbitSpeed": 0.3078, "angle": 75.257, "flore": 13, "faune": 56 },
            { "name": "Zanismir", "radius": 53, "orbitRadius": 265, "orbitSpeed": 0.1799, "angle": 46.868, "flore": 47, "faune": 37 },
            { "name": "Eriith", "radius": 53, "orbitRadius": 187, "orbitSpeed": 0.3078, "angle": 80.041, "flore": 15, "faune": 11 }
        ]},
        { "name": "Zetadon", "radius": 85, "orbitRadius": 594, "orbitSpeed": 0.0567, "angle": 17.344, "flore": 74, "faune": 27, "moons": [
            { "name": "Sigenzar", "radius": 45, "orbitRadius": 182, "orbitSpeed": 0.1762, "angle": 45.204, "flore": 6, "faune": 38 },
            { "name": "Draisvyn", "radius": 24, "orbitRadius": 182, "orbitSpeed": 0.1762, "angle": 46.468, "flore": 29, "faune": 35 },
            { "name": "Veledis", "radius": 43, "orbitRadius": 275, "orbitSpeed": 0.1802, "angle": 44.028, "flore": 30, "faune": 24 },
            { "name": "Palazar", "radius": 31, "orbitRadius": 275, "orbitSpeed": 0.1802, "angle": 45.427, "flore": 40, "faune": 40 },
            { "name": "Ithath", "radius": 27, "orbitRadius": 275, "orbitSpeed": 0.1802, "angle": 48.842, "flore": 34, "faune": 2 }
        ]},
        { "name": "Draalmir", "radius": 126, "orbitRadius": 1168, "orbitSpeed": 0.0292, "angle": 8.672, "flore": 35, "faune": 31, "moons": [
            { "name": "Zanonlux", "radius": 37, "orbitRadius": 227, "orbitSpeed": 0.1768, "angle": 50.185, "flore": 42, "faune": 18 },
            { "name": "Kryalra", "radius": 24, "orbitRadius": 227, "orbitSpeed": 0.1768, "angle": 45.577, "flore": 0, "faune": 32 },
            { "name": "Vorosth", "radius": 21, "orbitRadius": 350, "orbitSpeed": 0.2346, "angle": 62.276, "flore": 17, "faune": 28 }
        ]},
        { "name": "Celaxxis", "radius": 111, "orbitRadius": 1168, "orbitSpeed": 0.0292, "angle": 7.855, "flore": 42, "faune": 33, "moons": [
            { "name": "Ithixis", "radius": 24, "orbitRadius": 228, "orbitSpeed": 0.2116, "angle": 54.954, "flore": 44, "faune": 42 },
            { "name": "Lyrosnis", "radius": 48, "orbitRadius": 340, "orbitSpeed": 0.2219, "angle": 62.562, "flore": 37, "faune": 34 }
        ]}
      ]
    },
    { "name": "Celisdon", "radius": 155, "orbitRadius": 4525, "orbitSpeed": 0.0099, "angle": 1.072, "color": "#7CB9FF",
      "planets": [
        { "name": "Palontis", "radius": 87, "orbitRadius": 559, "orbitSpeed": 0.0587, "angle": 12.742, "flore": 75, "faune": 65, "moons": [
            { "name": "Sigaxvyn", "radius": 46, "orbitRadius": 198, "orbitSpeed": 0.3135, "angle": 65.652, "flore": 30, "faune": 12 },
            { "name": "Lyrenxis", "radius": 51, "orbitRadius": 198, "orbitSpeed": 0.3135, "angle": 67.449, "flore": 2, "faune": 34 }
        ]},
        { "name": "Kryisnis", "radius": 112, "orbitRadius": 891, "orbitSpeed": 0.0414, "angle": 7.31, "flore": 59, "faune": 17, "moons": [
            { "name": "Palemir", "radius": 25, "orbitRadius": 197, "orbitSpeed": 0.2845, "angle": 65.93, "flore": 50, "faune": 35 },
            { "name": "Omianis", "radius": 28, "orbitRadius": 197, "orbitSpeed": 0.2845, "angle": 60.613, "flore": 33, "faune": 16 },
            { "name": "Celannis", "radius": 47, "orbitRadius": 197, "orbitSpeed": 0.2845, "angle": 58.226, "flore": 20, "faune": 14 }
        ]},
        { "name": "Palenbus", "radius": 71, "orbitRadius": 891, "orbitSpeed": 0.0414, "angle": 11.786, "flore": 44, "faune": 94, "moons": [
            { "name": "Zanisdon", "radius": 40, "orbitRadius": 227, "orbitSpeed": 0.3012, "angle": 58.325, "flore": 21, "faune": 7 },
            { "name": "Draennis", "radius": 54, "orbitRadius": 227, "orbitSpeed": 0.3012, "angle": 63.025, "flore": 31, "faune": 28 }
        ]},
        { "name": "Aurelzar", "radius": 83, "orbitRadius": 559, "orbitSpeed": 0.0587, "angle": 14.251, "flore": 57, "faune": 42, "moons": [
            { "name": "Palarvyn", "radius": 43, "orbitRadius": 201, "orbitSpeed": 0.3376, "angle": 76.142, "flore": 6, "faune": 8 },
            { "name": "Xoristis", "radius": 48, "orbitRadius": 201, "orbitSpeed": 0.3376, "angle": 72.223, "flore": 40, "faune": 40 }
        ]},
        { "name": "Sigardis", "radius": 87, "orbitRadius": 891, "orbitSpeed": 0.0414, "angle": 9.732, "flore": 17, "faune": 77, "moons": [
            { "name": "Auronnis", "radius": 50, "orbitRadius": 303, "orbitSpeed": 0.2094, "angle": 46.53, "flore": 11, "faune": 4 },
            { "name": "Ithaxdis", "radius": 44, "orbitRadius": 303, "orbitSpeed": 0.2094, "angle": 41.07, "flore": 10, "faune": 51 },
            { "name": "Kryirxis", "radius": 38, "orbitRadius": 303, "orbitSpeed": 0.2094, "angle": 44.809, "flore": 45, "faune": 45 }
        ]}
      ]
    },
    { "name": "Auranra", "radius": 231, "orbitRadius": 4525, "orbitSpeed": 0.0099, "angle": -0.945, "color": "#FFE44D",
      "planets": [
        { "name": "Omionzar", "radius": 105, "orbitRadius": 927, "orbitSpeed": 0.0367, "angle": 7.037, "flore": 81, "faune": 64, "moons": [
            { "name": "Vorera", "radius": 58, "orbitRadius": 363, "orbitSpeed": 0.3387, "angle": 53.94, "flore": 30, "faune": 43 },
            { "name": "Thalonvyn", "radius": 24, "orbitRadius": 363, "orbitSpeed": 0.3387, "angle": 55.468, "flore": 30, "faune": 15 },
            { "name": "Synosdon", "radius": 22, "orbitRadius": 240, "orbitSpeed": 0.2641, "angle": 44.437, "flore": 44, "faune": 36 },
            { "name": "Vorelra", "radius": 46, "orbitRadius": 240, "orbitSpeed": 0.2641, "angle": 40.511, "flore": 34, "faune": 9 }
        ]},
        { "name": "Zanezar", "radius": 99, "orbitRadius": 927, "orbitSpeed": 0.0367, "angle": 5.816, "flore": 70, "faune": 90, "moons": [
            { "name": "Zetaxvyn", "radius": 36, "orbitRadius": 218, "orbitSpeed": 0.278, "angle": 42.654, "flore": 33, "faune": 30 },
            { "name": "Lyrelth", "radius": 32, "orbitRadius": 407, "orbitSpeed": 0.1556, "angle": 22.849, "flore": 12, "faune": 8 },
            { "name": "Celispha", "radius": 43, "orbitRadius": 407, "orbitSpeed": 0.1556, "angle": 27.875, "flore": 12, "faune": 19 },
            { "name": "Ithebus", "radius": 45, "orbitRadius": 218, "orbitSpeed": 0.278, "angle": 47.043, "flore": 28, "faune": 28 },
            { "name": "Nebisra", "radius": 28, "orbitRadius": 218, "orbitSpeed": 0.278, "angle": 45.23, "flore": 30, "faune": 31 }
        ]},
        { "name": "Itharxis", "radius": 127, "orbitRadius": 927, "orbitSpeed": 0.0367, "angle": 8.927, "flore": 99, "faune": 16, "moons": [
            { "name": "Zetaxlux", "radius": 23, "orbitRadius": 356, "orbitSpeed": 0.3301, "angle": 55.943, "flore": 15, "faune": 29 },
            { "name": "Zanartis", "radius": 59, "orbitRadius": 299, "orbitSpeed": 0.1724, "angle": 30.762, "flore": 0, "faune": 56 },
            { "name": "Sigepha", "radius": 26, "orbitRadius": 356, "orbitSpeed": 0.3301, "angle": 59.045, "flore": 3, "faune": 16 }
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
        { "name": "Aurannis", "radius": 95, "orbitRadius": 425, "orbitSpeed": 0.0448, "angle": -0.735, "flore": 26, "faune": 85, "moons": [
            { "name": "Auraton", "radius": 57, "orbitRadius": 221, "orbitSpeed": 0.1582, "angle": -1.032, "flore": 7, "faune": 54 },
            { "name": "Voranlux", "radius": 29, "orbitRadius": 221, "orbitSpeed": 0.1582, "angle": 4.275, "flore": 16, "faune": 7 }
        ]},
        { "name": "Synumus", "radius": 127, "orbitRadius": 849, "orbitSpeed": 0.0429, "angle": -2.145, "flore": 2, "faune": 70, "moons": [
            { "name": "Zanarpha", "radius": 24, "orbitRadius": 233, "orbitSpeed": 0.3017, "angle": 4.406, "flore": 38, "faune": 31 },
            { "name": "Kryandis", "radius": 43, "orbitRadius": 233, "orbitSpeed": 0.3017, "angle": -0.429, "flore": 3, "faune": 27 }
        ]},
        { "name": "Voronth", "radius": 100, "orbitRadius": 425, "orbitSpeed": 0.0448, "angle": 2.623, "flore": 56, "faune": 84, "moons": [
            { "name": "Aurarbus", "radius": 37, "orbitRadius": 209, "orbitSpeed": 0.3271, "angle": 0.317, "flore": 13, "faune": 17 },
            { "name": "Vorispha", "radius": 51, "orbitRadius": 209, "orbitSpeed": 0.3271, "angle": 4.881, "flore": 10, "faune": 22 },
            { "name": "Sigaxlux", "radius": 46, "orbitRadius": 209, "orbitSpeed": 0.3271, "angle": 3.636, "flore": 3, "faune": 5 }
        ]},
        { "name": "Pyxaxton", "radius": 97, "orbitRadius": 849, "orbitSpeed": 0.0429, "angle": 1.147, "flore": 79, "faune": 100, "moons": [
            { "name": "Eriatis", "radius": 59, "orbitRadius": 246, "orbitSpeed": 0.3043, "angle": 1.972, "flore": 46, "faune": 47 },
            { "name": "Coronpha", "radius": 45, "orbitRadius": 246, "orbitSpeed": 0.3043, "angle": 6.671, "flore": 33, "faune": 21 }
        ]}
      ]
    }
  ],
  "asteroidBelts": []
  }
];
