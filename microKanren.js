
let empty = null;
let isEmpty = s => s === empty;
let cons = (car, cdr) => ({car: car, cdr: cdr});
let car = x => x.car;
let cdr = x => typeof x.cdr === 'function' ? x.cdr() : x.cdr;

function nextNat(currentNat) {
  return cons (currentNat, () => nextNat(currentNat + 1));
}
let nats = nextNat(0);

let mzero = empty;
let unit = s => cons(s, mzero);

function mapStream(s, f) { 
  let result = [];
  while (!isEmpty(s)) {
    result.push(f(car(s)));
    s = cdr(s);
  }
  return result;
}

function bind(ss, g) {

}

// appends two substitutionStreams together
let mplus = (s1, s2) => 
  isEmpty(s1) ? s2 : cons(car(s1), mplus(cdr(s1), s2));

// eqeq is a goal constructor
function eqeq(u, v) {
  // a goal is a function that takes a substitution and returns a substitution stream
  return s => {
    extS = unify(u, v, s);
    return extS ? unit(extS) : mzero;
  }
}

function lvar(name) {
  return Symbol(name);
}

function isArray(a) { return a instanceof Array;}
function isObject(o) { return typeof o === 'object';}
function isLvar(l) { return typeof l === 'symbol';}

let fail = false;
let emptySub = x => x;
let extendSubstitution = (s, l, v) => x => (x === l ? v : s(x));

function walk(u, s) {
  let nextU = s(u);
  while (nextU !== u) {
    u = nextU;
    nextU = s(u);
  }
  return u;
}

function walkStar(u, s) {
  u = walk(u, s);
  if (isArray(u)) {
    return u.map(x => walkStar(x, s));
  } else if (isObject(u)) {
    let o = {};
    Object.keys(u).forEach(k => o[k] = walkStar(u[k], s));
    return o;
  }
  return u;
}

function unify(u, v, s) {
  u = walk(u, s);
  v = walk(v, s);

  if (u === v) {
    return s;
  } else if (isLvar(u)) {
    return extendSubstitution(s, u, v);
  } else if (isLvar(v)) {
    return extendSubstitution(s, v, u);
  } else if (isArray(u) && isArray(v)) {
    if (u.length !== v.length) {
      return fail;
    }
    for (let i = 0; i < u.length; i++) {
      s = unify(u[i], v[i], s);
      if (s === fail) {
        return fail;
      }
    }
    return s;
  } else if (isObject(u) &&  isObject(v)) {
    let uKeys = Object.keys(u);
    
    if (uKeys.length !== Object.keys(v).length) { return fail; }
    for (let key of uKeys) {
      if (!v.hasOwnProperty(key)) {
        return fail;
      }
      s = unify(u[key], v[key], s);
      if (s === fail) {
        return fail;
      }
    }
    return s;
  }
  return fail;
}

function run() {
  let a = lvar('a');
  let b = lvar('b');
  let c = lvar('c');

  let goal1 = eqeq(a,1);
  let ss1 = goal1(emptySub);
  let goal2 = eqeq(a,2);
  let ss2 = goal2(emptySub);
  let goal3 = eqeq(a,3);
  let ss3 = goal3(emptySub);

  console.log(mapStream(mplus(mplus(ss1,ss2), ss3), (s) => walkStar(a, s)));
}

run();