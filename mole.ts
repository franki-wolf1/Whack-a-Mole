import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Box, Sphere, Text, OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'

function Mole({ position, isActive, onWhack }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (ref.current) {
      const targetY = isActive ? 0.5 : -0.5
      ref.current.position.y += (targetY - ref.current.position.y) * 0.1
    }
  })

  return (
    <Sphere
      ref={ref}
      position={[position[0], -0.5, position[2]]}
      args={[0.5, 32, 32]}
      onClick={onWhack}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial color={hovered ? 'hotpink' : 'brown'} />
    </Sphere>
  )
}

function Hole({ position }) {
  return (
    <Sphere position={position} args={[0.7, 32, 32]}>
      <meshStandardMaterial color="black" />
    </Sphere>
  )
}

function GameBoard() {
  const [moles, setMoles] = useState(Array(9).fill(false))
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setGameOver(true)
    }
  }, [timeLeft, gameOver])

  useEffect(() => {
    if (!gameOver) {
      const interval = setInterval(() => {
        setMoles(moles => {
          const newMoles = [...moles]
          const inactiveIndices = newMoles.reduce((acc, mole, index) => mole ? acc : [...acc, index], [])
          if (inactiveIndices.length > 0) {
            const randomIndex = inactiveIndices[Math.floor(Math.random() * inactiveIndices.length)]
            newMoles[randomIndex] = true
          }
          return newMoles
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [gameOver])

  const whackMole = (index) => {
    if (moles[index] && !gameOver) {
      setMoles(moles => {
        const newMoles = [...moles]
        newMoles[index] = false
        return newMoles
      })
      setScore(score + 1)
    }
  }

  const resetGame = () => {
    setMoles(Array(9).fill(false))
    setScore(0)
    setTimeLeft(30)
    setGameOver(false)
  }

  return (
    <>
      {[0, 1, 2].map(row =>
        [0, 1, 2].map(col => {
          const index = row * 3 + col
          return (
            <group key={index} position={[col * 2 - 2, 0, row * 2 - 2]}>
              <Hole position={[0, -0.5, 0]} />
              <Mole position={[0, 0, 0]} isActive={moles[index]} onWhack={() => whackMole(index)} />
            </group>
          )
        })
      )}
      <Box position={[0, -1, 0]} args={[7, 0.5, 7]}>
        <meshStandardMaterial color="green" />
      </Box>
      <Text position={[0, 3, 0]} fontSize={0.5} color="white">
        Score: {score} | Time: {timeLeft}s
      </Text>
      {gameOver && (
        <Text position={[0, 2, 0]} fontSize={0.5} color="white">
          Game Over! Final Score: {score}
        </Text>
      )}
      {gameOver && (
        <Box position={[0, 1, 0]} args={[2, 0.5, 0.5]} onClick={resetGame}>
          <meshStandardMaterial color="blue" />
          <Text position={[0, 0, 0.26]} fontSize={0.2} color="white">
            Play Again
          </Text>
        </Box>
      )}
    </>
  )
}

export default function Component() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 5, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <GameBoard />
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI/4} maxPolarAngle={Math.PI/2.5} />
      </Canvas>
      <div className="absolute top-0 left-0 text-white p-4">
        <h1 className="text-2xl font-bold">3D Whack-a-Mole</h1>
        <p>Click on the moles to whack them!</p>
      </div>
    </div>
  )
}
