export const setInitialConditionsTo = (parser, config) => {
  const configKeys = Object.keys(config);

  configKeys.forEach(key => parser.evaluate(`${key} = ${config[key]}`));
}

export const ndsolve = (math) => (f, x0, dt, tmax) => {
  let x = x0.clone()  // Valor atual das variáveis
  const result = [x]  // Contem a resolução
  const nsteps = math.divide(tmax, dt)   // Numero de passos
  for (let i = 0; i < nsteps; i++) {
    // Computar derivadas
    const dxdt = f.map(func => func(...x.toArray()));

    // Calcular próximo passo utilizando método de Euler
    const dx = math.multiply(dxdt, dt)
    x = math.add(x, dx)
    result.push(x)
  }
  return math.matrix(result)
}