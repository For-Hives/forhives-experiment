'use client'

import { useEffect, useRef } from 'react'

interface ShaderCanvasProps {
	className?: string
}

export default function ShaderCanvas({ className = '' }: ShaderCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animationFrameRef = useRef<number>(0)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true })
		if (!gl) {
			console.error('WebGL not supported')
			return
		}

		const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

		const fragmentShaderSource = `
      precision highp float;
      
      uniform float iTime;
      uniform vec2 iResolution;
      
      /* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */
      vec3 random3(vec3 c) {
          float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
          vec3 r;
          r.z = fract(512.0*j);
          j *= .125;
          r.x = fract(512.0*j);
          j *= .125;
          r.y = fract(512.0*j);
          return r-0.5;
      }

      /* skew constants for 3d simplex functions */
      const float F3 =  0.3333333;
      const float G3 =  0.1666667;

      /* 3d simplex noise */
      float simplex3d(vec3 p) {
           /* 1. find current tetrahedron T and it's four vertices */
           /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
           /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/
           
           /* calculate s and x */
           vec3 s = floor(p + dot(p, vec3(F3)));
           vec3 x = p - s + dot(s, vec3(G3));
           
           /* calculate i1 and i2 */
           vec3 e = step(vec3(0.0), x - x.yzx);
           vec3 i1 = e*(1.0 - e.zxy);
           vec3 i2 = 1.0 - e.zxy*(1.0 - e);
               
           /* x1, x2, x3 */
           vec3 x1 = x - i1 + G3;
           vec3 x2 = x - i2 + 2.0*G3;
           vec3 x3 = x - 1.0 + 3.0*G3;
           
           /* 2. find four surflets and store them in d */
           vec4 w, d;
           
           /* calculate surflet weights */
           w.x = dot(x, x);
           w.y = dot(x1, x1);
           w.z = dot(x2, x2);
           w.w = dot(x3, x3);
           
           /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
           w = max(0.6 - w, 0.0);
           
           /* calculate surflet components */
           d.x = dot(random3(s), x);
           d.y = dot(random3(s + i1), x1);
           d.z = dot(random3(s + i2), x2);
           d.w = dot(random3(s + 1.0), x3);
           
           /* multiply d by w^4 */
           w *= w;
           w *= w;
           d *= w;
           
           /* 3. return the sum of the four surflets */
           return dot(d, vec4(52.0));
      }

      float noise(vec3 m) {
          return   0.5333333*simplex3d(m)
                  +0.2666667*simplex3d(2.0*m)
                  +0.1333333*simplex3d(4.0*m)
                  +0.0666667*simplex3d(8.0*m);
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec4 fragColor;
        
        vec2 uv = fragCoord.xy / iResolution.xy;    
        uv = uv * 2. -1.;  
       
        vec2 p = fragCoord.xy/iResolution.x;
        vec3 p3 = vec3(p, iTime*0.25);    
          
        float intensity = noise(vec3(p3*12.0+12.0));
                                
        float t = clamp((uv.x * -uv.x * 0.16) + 0.15, 0., 1.);                         
        float y = abs(intensity * -t + uv.y);
          
        float g = pow(y, 0.14);
                                
        vec3 col = vec3(2.0, 2.1, 2.3);
        col = col * -g + col;                    
        col = col * col;
        col = col * col;
                                
        fragColor.rgb = col;                          
        fragColor.w = dot(col, vec3(0.299, 0.587, 0.114));
        
        gl_FragColor = fragColor;
      }
    `

		function createShader(gl: WebGLRenderingContext, type: number, source: string) {
			const shader = gl.createShader(type)
			if (!shader) return null

			gl.shaderSource(shader, source)
			gl.compileShader(shader)

			if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == false) {
				console.error('Error compiling shader:', gl.getShaderInfoLog(shader))
				gl.deleteShader(shader)
				return null
			}

			return shader
		}

		function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
			const program = gl.createProgram()
			if (program == null || vertexShader == null || fragmentShader == null || gl == null) return null

			gl.attachShader(program, vertexShader)
			gl.attachShader(program, fragmentShader)
			gl.linkProgram(program)

			if (gl.getProgramParameter(program, gl.LINK_STATUS) == false) {
				console.error('Error linking program:', gl.getProgramInfoLog(program))
				gl.deleteProgram(program)
				return null
			}

			return program
		}

		const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
		const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

		if (!vertexShader || !fragmentShader) return

		const program = createProgram(gl, vertexShader, fragmentShader)
		if (!program) return

		const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
		const timeUniformLocation = gl.getUniformLocation(program, 'iTime')
		const resolutionUniformLocation = gl.getUniformLocation(program, 'iResolution')

		const positionBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)

		function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
			const displayWidth = canvas.clientWidth
			const displayHeight = canvas.clientHeight

			if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
				canvas.width = displayWidth
				canvas.height = displayHeight
			}
		}

		function render(time: number) {
			if (!canvas || !gl) return

			resizeCanvasToDisplaySize(canvas)

			gl.viewport(0, 0, canvas.width, canvas.height)
			gl.clearColor(0, 0, 0, 0)
			gl.clear(gl.COLOR_BUFFER_BIT)
			gl.enable(gl.BLEND)
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

			gl.useProgram(program)

			gl.enableVertexAttribArray(positionAttributeLocation)
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
			gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

			gl.uniform1f(timeUniformLocation, time * 0.001)
			gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)

			gl.drawArrays(gl.TRIANGLES, 0, 6)

			animationFrameRef.current = requestAnimationFrame(render)
		}

		animationFrameRef.current = requestAnimationFrame(render)

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current)
			}
		}
	}, [])

	return (
		<canvas
			ref={canvasRef}
			className={`${className} pointer-events-none bg-transparent`}
			style={{ display: 'block' }}
		/>
	)
}
