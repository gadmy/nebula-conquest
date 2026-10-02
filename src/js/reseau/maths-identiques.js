/* ─────────────────────────────────────────────
   DES MATHS IDENTIQUES DANS TOUS LES NAVIGATEURS
   Sinus, cosinus, arc tangente, exponentielle... ne sont pas calcules de la
   meme facon par Chrome, Firefox et Safari : le dernier chiffre peut
   differer. Rien ne se voit, mais repete 60 fois par seconde l'ecart finit
   par changer la partie - premier essai Chrome contre Firefox en ligne :
   desynchronisation au tour 240. Les additions, multiplications, divisions
   et racines carrees, elles, sont exactes partout (norme IEEE 754).
   Voici donc ces fonctions refaites avec ces seules operations (d'apres
   fdlibm, la bibliotheque de reference). Precision : l'ecart avec celles du
   navigateur est de l'ordre de 1e-16, invisible en jeu.
   En lockstep, elles remplacent celles du navigateur des le depart de la
   partie (installerMathsFixes), decor compris.
   ───────────────────────────────────────────── */
const MATHS_FIXES = (function () {
    const PIO2_1 = 1.57079632673412561417e+00, PIO2_2 = 6.07710050630396597660e-11,
          PIO2_2T = 2.02226624879595063154e-21, INVPIO2 = 6.36619772367581382433e-01;
    const S1 = -1.66666666666666324348e-01, S2 = 8.33333333332248946124e-03,
          S3 = -1.98412698298579493134e-04, S4 = 2.75573137070700676789e-06,
          S5 = -2.50507602534068634195e-08, S6 = 1.58969099521155010221e-10;
    const C1 = 4.16666666666666019037e-02, C2 = -1.38888888888741095749e-03,
          C3 = 2.48015872894767294178e-05, C4 = -2.75573143513906633035e-07,
          C5 = 2.08757232129817482790e-09, C6 = -1.13596475577881948265e-11;
    const ksin = function (x) {
        const z = x * x, v = z * x;
        return x + v * (S1 + z * (S2 + z * (S3 + z * (S4 + z * (S5 + z * S6)))));
    };
    const kcos = function (x) {
        const z = x * x;
        const r = z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * C6)))));
        const hz = 0.5 * z, w = 1 - hz;
        return w + (((1 - w) - hz) + z * r);
    };
    /* x = n * pi/2 + y, avec y entre -pi/4 et pi/4. Le quart (_q) et le reste
       (_y) sont ranges dans deux variables plutot que dans un tableau neuf a
       chaque appel : des centaines de milliers de petits tableaux par minute
       en moins a ramasser. Meme calcul, meme resultat au bit pres. */
    let _q = 0, _y = 0;
    const reduire = function (x) {
        const n = Math.round(x * INVPIO2);
        _y = ((x - n * PIO2_1) - n * PIO2_2) - n * PIO2_2T;
        _q = ((n % 4) + 4) % 4;
    };
    const sin = function (x) {
        if (!isFinite(x)) return NaN;
        if (x > -0.7853981633974483 && x < 0.7853981633974483) return ksin(x);
        reduire(x);
        const q = _q, y = _y;
        return q === 0 ? ksin(y) : q === 1 ? kcos(y) : q === 2 ? -ksin(y) : -kcos(y);
    };
    const cos = function (x) {
        if (!isFinite(x)) return NaN;
        if (x > -0.7853981633974483 && x < 0.7853981633974483) return kcos(x);
        reduire(x);
        const q = _q, y = _y;
        return q === 0 ? kcos(y) : q === 1 ? -ksin(y) : q === 2 ? -kcos(y) : ksin(y);
    };
    const ATANHI = [4.63647609000806093515e-01, 7.85398163397448278999e-01,
                    9.82793723247329054082e-01, 1.57079632679489655800e+00];
    const ATANLO = [2.26987774529616870924e-17, 3.06161699786838301793e-17,
                    1.39033110312309984516e-17, 6.12323399573676603587e-17];
    const AT = [3.33333333333329318027e-01, -1.99999999998764832476e-01, 1.42857142725034663711e-01,
                -1.11111104054623557880e-01, 9.09088713343650656196e-02, -7.69187620504482999495e-02,
                6.66107313738753120669e-02, -5.83357013379057348645e-02, 4.97687799461593236017e-02,
                -3.65315727442169155270e-02, 1.62858201153657823623e-02];
    const atan = function (x) {
        if (x !== x) return x;
        const negatif = x < 0;
        if (negatif) x = -x;
        let id;
        if (x >= 2.4375) {
            if (x > 1e17) return negatif ? -(ATANHI[3] + ATANLO[3]) : ATANHI[3] + ATANLO[3];
            id = 3; x = -1 / x;
        } else if (x < 0.4375) {
            if (x < 1e-9) return negatif ? -x : x;
            id = -1;
        } else if (x < 1.1875) {
            if (x < 0.6875) { id = 0; x = (2 * x - 1) / (2 + x); }
            else { id = 1; x = (x - 1) / (x + 1); }
        } else { id = 2; x = (x - 1.5) / (1 + 1.5 * x); }
        const z = x * x, w = z * z;
        const s1 = z * (AT[0] + w * (AT[2] + w * (AT[4] + w * (AT[6] + w * (AT[8] + w * AT[10])))));
        const s2 = w * (AT[1] + w * (AT[3] + w * (AT[5] + w * (AT[7] + w * AT[9]))));
        const r = id < 0 ? x - x * (s1 + s2) : ATANHI[id] - ((x * (s1 + s2) - ATANLO[id]) - x);
        return negatif ? -r : r;
    };
    const PI = 3.14159265358979311600e+00, PI_LO = 1.2246467991473531772e-16;
    const atan2 = function (y, x) {
        if (x !== x || y !== y) return NaN;
        if (y === 0) {
            if (x > 0 || (x === 0 && 1 / x > 0)) return y;          /* +0 ou -0 */
            return (1 / y < 0) ? -PI : PI;
        }
        if (x === 0) return y > 0 ? PI / 2 : -PI / 2;
        if (!isFinite(x) || !isFinite(y)) {
            if (!isFinite(y)) {
                const a = !isFinite(x) ? (x > 0 ? PI / 4 : 3 * PI / 4) : PI / 2;
                return y > 0 ? a : -a;
            }
            return x > 0 ? (y > 0 ? 0 : -0) : (y > 0 ? PI : -PI);
        }
        const z = atan(Math.abs(y / x));
        if (x > 0) return y > 0 ? z : -z;
        return y > 0 ? PI - (z - PI_LO) : (z - PI_LO) - PI;
    };
    const LN2HI = 6.93147180369123816490e-01, LN2LO = 1.90821492927058770002e-10,
          INVLN2 = 1.44269504088896338700e+00;
    const P1 = 1.66666666666666019037e-01, P2 = -2.77777777770155933842e-03,
          P3 = 6.61375632143793436117e-05, P4 = -1.65339022054652515390e-06,
          P5 = 4.13813679705723846039e-08;
    const bits = new DataView(new ArrayBuffer(8));
    /* 2 puissance k, construit bit a bit : exact partout. */
    const deuxPuissance = function (k) {
        bits.setUint32(0, (k + 1023) << 20);
        bits.setUint32(4, 0);
        return bits.getFloat64(0);
    };
    const exp = function (x) {
        if (x !== x) return x;
        if (x > 709.78) return Infinity;
        if (x < -745.13) return 0;
        const k = Math.round(x * INVLN2);
        const hi = x - k * LN2HI, lo = k * LN2LO, r = hi - lo;
        const t = r * r;
        const c = r - t * (P1 + t * (P2 + t * (P3 + t * (P4 + t * P5))));
        const y = 1 - ((lo - (r * c) / (2 - c)) - hi);
        if (k > 1023) return y * deuxPuissance(1023) * deuxPuissance(k - 1023);
        if (k < -1022) return y * deuxPuissance(-1022) * deuxPuissance(k + 1022);
        return y * deuxPuissance(k);
    };
    const hypot = function () {
        if (arguments.length === 2) {
            const a = arguments[0], b = arguments[1];
            if (!isFinite(a) || !isFinite(b)) return (a === Infinity || a === -Infinity || b === Infinity || b === -Infinity) ? Infinity : NaN;
            return Math.sqrt(a * a + b * b);
        }
        let s = 0;
        for (let i = 0; i < arguments.length; i++) { const v = +arguments[i]; s += v * v; }
        return Math.sqrt(s);
    };
    /* Puissance : par exposant entier, en carres successifs (exact et
       identique partout). Le calcul de la partie n'utilise que des entiers ;
       un exposant a virgule (le decor seulement) passe par l'exponentielle. */
    const pow = function (x, y) {
        if (Number.isInteger(y) && Math.abs(y) <= 1024) {
            let n = Math.abs(y), r = 1, b = x;
            while (n > 0) { if (n & 1) r *= b; b *= b; n >>= 1; }
            return y < 0 ? 1 / r : r;
        }
        if (x > 0 && isFinite(x) && isFinite(y)) return exp(y * MATHS_FIXES_LN(x));
        return MATHS_NATIFS.pow(x, y);
    };
    return { sin: sin, cos: cos, atan2: atan2, exp: exp, hypot: hypot, pow: pow };
})();
const MATHS_NATIFS = { sin: Math.sin, cos: Math.cos, atan2: Math.atan2, exp: Math.exp,
                       hypot: Math.hypot, pow: Math.pow, log: Math.log };
/* Le logarithme ne sert qu'aux puissances a exposant non entier (decor). */
function MATHS_FIXES_LN(x) { return MATHS_NATIFS.log(x); }

function installerMathsFixes() {
    Math.sin = MATHS_FIXES.sin;
    Math.cos = MATHS_FIXES.cos;
    Math.atan2 = MATHS_FIXES.atan2;
    Math.exp = MATHS_FIXES.exp;
    Math.hypot = MATHS_FIXES.hypot;
    Math.pow = MATHS_FIXES.pow;
}

