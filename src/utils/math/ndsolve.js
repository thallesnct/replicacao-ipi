import { create, all } from 'mathjs';

const math = create(all)

function ndsolve(f, x0, dt, tmax) {
  let x = x0.clone()  // Current values of variables
  const result = [x]  // Contains entire solution
  const nsteps = math.divide(tmax, dt)   // Number of time steps
  for (let i = 0; i < nsteps; i++) {
    // Compute derivatives
    const dxdt = f.map(func => func(...x.toArray()))
    // Euler method to compute next time step
    const dx = math.multiply(dxdt, dt)
    x = math.add(x, dx)
    result.push(x)
  }
  return math.matrix(result)
}

export default ndsolve;
