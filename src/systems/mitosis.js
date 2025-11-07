export function evaluateMitosisReadiness({ canBud, canMitosis }) {
  const buddingReady = typeof canBud === 'function' ? Boolean(canBud()) : false;
  const mitosisReady = typeof canMitosis === 'function' ? Boolean(canMitosis()) : false;

  return { buddingReady, mitosisReady };
}
