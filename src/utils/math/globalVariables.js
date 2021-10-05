export const importGlobals = (parser) => {
  parser.evaluate("G = 6.67408e-11 m^3 kg^-1 s^-2")  // Constante gravitacional
  parser.evaluate("mbody = 5.9724e24 kg")            // Massa da Terra
  parser.evaluate("mu = G * mbody")                  // Parametro padrão gravitacional
  parser.evaluate("g0 = 9.80665 m/s^2")              // Gravidade padrão: usada para calcular a propriedade consumption(dmdt)
  parser.evaluate("r0 = 6371 km")                    // Raio médio da Terra
  parser.evaluate("t0 = 0 s")                        // Começo da simulação
  parser.evaluate("dt = 0.5 s")                      // Intervalo da simulação
  parser.evaluate("tfinal = 149.5 s")                // Duração da simulação
  parser.evaluate("isp_sea = 282 s")                 // Impulso especifico (nivel do mar)
  parser.evaluate("isp_vac = 311 s")                 // Impulso especifico (no vácuo)
  parser.evaluate("gamma0 = 89.99970 deg")           // Angulo de inclinação inicial (90deg é o angulo vertical)
  parser.evaluate("v0 = 1 m/s")                      // Velocidade inicial (deve ser diferente de zero, pois a ODE é mal condicionada)
  parser.evaluate("phi0 = 0 deg")                    // Angulo orbital inicial de referencia
  parser.evaluate("m1 = 433100 kg")                  // Massa do primeiro estágio
  parser.evaluate("m2 = 111500 kg")                  // Massa do segundo estágio
  parser.evaluate("m3 = 1700 kg")                    // Massa do terceiro estágio / massa de carenagem
  parser.evaluate("mp = 5000 kg")                    // Massa de carga
  parser.evaluate("m0 = m1+m2+m3+mp")                // Massa inicial do foguete
  parser.evaluate("dm = 2750 kg/s")                  // Taxa de fluxo de massa
  parser.evaluate("A = (3.66 m)^2 * pi")             // Area do foguete
  parser.evaluate("dragCoef = 0.2")                  // Coeficiente de resistência
}

export const importMotionEquations = (parser) => {
  parser.evaluate("gravity(r) = mu / r^2")
  parser.evaluate("angVel(r, v, gamma) = v/r * cos(gamma) * rad")   // Velocidade angular do foguete próximo à lua
  parser.evaluate("density(r) = 1.2250 kg/m^3 * exp(-g0 * (r - r0) / (83246.8 m^2/s^2))") // Constante de temperatura
  parser.evaluate("drag(r, v) = 1/2 * density(r) .* v.^2 * A * dragCoef")
  parser.evaluate("isp(r) = isp_vac + (isp_sea - isp_vac) * density(r)/density(r0)") // pressão ~ densidade para constante de temperatura
  parser.evaluate("thrust(isp) = g0 * isp * dm")
}

export const importCommonFunctions = (parser) => {
  // É importante que a ordem de cada argumento das funções abaixo seja mantida
  parser.evaluate("drdt(r, v, m, phi, gamma, t) = v sin(gamma)")
  parser.evaluate("dvdt(r, v, m, phi, gamma, t) = - gravity(r) * sin(gamma) + (thrust(isp(r)) - drag(r, v)) / m")
  parser.evaluate("dmdt(r, v, m, phi, gamma, t) = - dm")
  parser.evaluate("dphidt(r, v, m, phi, gamma, t) = angVel(r, v, gamma)")
  parser.evaluate("dgammadt(r, v, m, phi, gamma, t) = angVel(r, v, gamma) - gravity(r) * cos(gamma) / v * rad")
  parser.evaluate("dtdt(r, v, m, phi, gamma, t) = 1")
}