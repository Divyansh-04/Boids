import { useState, useRef, useEffect } from "react";
import "./Screen.css";

class vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  magnitude() {
    return this.x * this.x + this.y * this.y;
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  add(other) {
    return new vector(this.x + other.x, this.y + other.y);
  }

  scale(num) {
    return new vector(this.x * num, this.y * num);
  }

  unit() {
    return new vector(
      this.x / Math.sqrt(this.magnitude()),
      this.y / Math.sqrt(this.magnitude())
    );
  }
}

export default function Screen() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    height: 50,
    width: 100,
  });

  const velocity = 5;
  const [boids, setBoids] = useState([new vector(10, 20)]);
  const [directions, setDirections] = useState([
    new vector(Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)),
  ]);

  function separate(currDir, currPos, otherPos) {
    let power = 5;
    let delta = currPos.add(otherPos.scale(-1)); //other to curr;
    if (delta.magnitude() == 0) return currDir;
    console.log(delta);
    console.log(
      currDir,
      currDir.add(delta.scale(power / delta.magnitude())).unit()
    );
    return currDir.add(delta.scale(power / delta.magnitude())).unit();
  }

  function align(current, other) {
    let power = 0.1;
    return current.add(other.scale(power)).unit();
  }

  function cohesion(currDir, currPos, averagePos) {
    let power = 0.0005;
    averagePos = new vector(
      averagePos.x / averagePos.size,
      averagePos.y / averagePos.size
    );

    let delta = averagePos.add(currPos.scale(-1)); // curr to average
    if (delta.magnitude() == 0) return currDir;
    return currDir.add(delta.scale(power)).unit();
  }

  function changeDir() {
    const range = 100;
    let newDirs = directions.slice();
    for (let i = 0; i < boids.length; ++i) {
      let averagePos = { x: 0, y: 0, size: 0 };
      for (let j = 0; j < boids.length; ++j) {
        if (j == i) continue;
        let delta = boids[j].add(boids[i].scale(-1)); // j-i
        if (delta.magnitude() <= Math.pow(range, 2)) {
          delta = delta.unit();
          let cos = delta.dot(directions[i]);
          if (cos >= -Math.sqrt(3) / 2) {
            newDirs[i] = align(newDirs[i], directions[j]);
            newDirs[i] = separate(newDirs[i], boids[i], boids[j]);
            averagePos.x += boids[j].x;
            averagePos.y += boids[j].y;
            ++averagePos.size;
          }
        }
      }
      if (averagePos.size)
        newDirs[i] = cohesion(newDirs[i], boids[i], averagePos);
    }

    setDirections(newDirs);
  }

  function changePos() {
    let newBoids = boids.slice();

    for (let i = 0; i < boids.length; ++i) {
      newBoids[i] = boids[i].add(directions[i].scale(velocity));

      newBoids[i].x = (newBoids[i].x + dimensions.height) % dimensions.height;
      newBoids[i].y = (newBoids[i].y + dimensions.width) % dimensions.width;
    }

    setBoids(newBoids);
  }

  function render() {
    changeDir();
    changePos();
  }

  useEffect(() => {
    const interval = setTimeout(render, 16);
    return () => clearTimeout(interval);
  }, [boids]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();

    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  function handleAdd() {
    const nextBoids = [
      ...boids,
      new vector(
        Math.floor(Math.random() * dimensions.height),
        Math.floor(Math.random() * dimensions.width)
      ),
    ];
    setBoids(nextBoids);

    let xComponent = Math.sin(Math.random() * 2 * Math.PI);
    let yComponent =
      Math.sqrt(1 - xComponent * xComponent) *
      (Math.floor(Math.random() * 2) % 2 ? 1 : -1);

    const nextDirs = [...directions, new vector(xComponent, yComponent)];
    setDirections(nextDirs);
  }

  function handleRemove() {
    if (boids.length === 0) return;
    const nextBoids = [...boids.slice(0, boids.length - 1)];
    setBoids(nextBoids);

    const nextDirs = [...directions.slice(0, directions.length - 1)];
    setDirections(nextDirs);
  }

  const arrows = boids.map((atr, index) => {
    return <Arrow pos={atr} key={index} dir={directions[index]} k={index} />;
  });

  return (
    <div className="Screen">
      <div className="Header">
        <AddButton onAdd={handleAdd} />
        <RemoveButton onRemove={handleRemove} />
      </div>
      <div className="Box" ref={containerRef}>
        {arrows}
      </div>
    </div>
  );
}

function AddButton({ onAdd }) {
  return <button onClick={onAdd}>Add Boid</button>;
}

function RemoveButton({ onRemove }) {
  return <button onClick={onRemove}>Remove Boid</button>;
}

function Arrow({ pos, dir, k }) {
  let offset = -25;
  // let color = ["red", "cyan", "pink", "green"];
  return (
    <div
      className="Arrow"
      style={{
        top: pos.x + offset,
        left: pos.y + offset,
        transform: `rotate(${Math.atan2(dir.x, dir.y)}rad)`,
        // borderLeftColor: color[k % color.length],
      }}
    ></div>
  );
}
