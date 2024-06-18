import { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import "./Screen.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AddBox, Delete, Today } from "@mui/icons-material";
import Box from "@mui/material/Box";
import { AllOut, Sync, GroupWork } from "@mui/icons-material";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import Merge from "@mui/icons-material/Merge";

const theme = createTheme({
  palette: {
    primary: {
      light: "#ce93d8",
      main: "#aa00ff",
      dark: "#7b1fa2",
      contrastText: "#F3E5F5",
    },
    secondary: {
      light: "#ef5350",
      main: "#e53935",
      dark: "#c62828",
      contrastText: "#FFEBEE",
    },
  },
});

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
  const [boids, setBoids] = useState([]);
  const [directions, setDirections] = useState([]);

  const [separationCoefficient, setSeparationCoefficient] = useState(1);
  const [alignmentCoefficient, setAlignmentCoefficient] = useState(1);
  const [cohesionCoefficient, setCohesionCoefficient] = useState(1);

  const [toggleSeparation, setToggleSeparation] = useState(true);
  const [toggleAlignment, setToggleAlignment] = useState(true);
  const [toggleCohesion, setToggleCohesion] = useState(true);

  function toDefault() {
    setAlignmentCoefficient(1);
    setCohesionCoefficient(1);
    setSeparationCoefficient(1);
    setToggleAlignment(true);
    setToggleCohesion(true);
    setToggleSeparation(true);
  }

  function separate(currDir, currPos, otherPos, coeff = separationCoefficient) {
    let power = 5 * coeff;
    let delta = currPos.add(otherPos.scale(-1)); //other to curr;
    if (delta.magnitude() == 0) return currDir;
    return currDir.add(delta.scale(power / delta.magnitude())).unit();
  }

  function align(current, other, coeff = alignmentCoefficient) {
    let power = 0.08 * coeff;
    return current.add(other.scale(power)).unit();
  }

  function cohesion(currDir, currPos, averagePos, coeff = cohesionCoefficient) {
    let power = 0.0005 * coeff;
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
            if (toggleAlignment) newDirs[i] = align(newDirs[i], directions[j]);
            if (toggleSeparation)
              newDirs[i] = separate(newDirs[i], boids[i], boids[j]);
          }
        }

        if (delta.magnitude() <= Math.pow(5 * range, 2)) {
          delta = delta.unit();
          let cos = delta.dot(directions[i]);
          if (Math.abs(cos) >= 1 / 2) {
            averagePos.x += boids[j].x;
            averagePos.y += boids[j].y;
            ++averagePos.size;
          }
        }
      }
      if (averagePos.size && toggleCohesion)
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
    const interval = setTimeout(handleAdd10, 1500);
    return () => clearTimeout(interval);
  }, []);

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

  function handleAdd10() {
    let temp = [];
    for (let i = 0; i < 10; ++i) {
      temp[i] = new vector(
        Math.floor(Math.random() * dimensions.height),
        Math.floor(Math.random() * dimensions.width)
      );
    }

    const nextBoids = [...boids, ...temp];
    setBoids(nextBoids);

    for (let i = 0; i < 10; ++i) {
      let xComponent = Math.sin(Math.random() * 2 * Math.PI);
      let yComponent =
        Math.sqrt(1 - xComponent * xComponent) *
        (Math.floor(Math.random() * 2) % 2 ? 1 : -1);
      temp[i] = new vector(xComponent, yComponent);
    }

    const nextDirs = [...directions, ...temp];
    setDirections(nextDirs);
  }

  function handleRemove() {
    if (boids.length === 0) return;
    const nextBoids = [...boids.slice(0, boids.length - 1)];
    setBoids(nextBoids);

    const nextDirs = [...directions.slice(0, directions.length - 1)];
    setDirections(nextDirs);
  }

  function handleRemove10() {
    if (boids.length === 0) return;
    const nextBoids = [
      ...boids.slice(0, boids.length - Math.min(boids.length, 10)),
    ];
    setBoids(nextBoids);

    const nextDirs = [
      ...directions.slice(0, directions.length - Math.min(boids.length, 10)),
    ];
    setDirections(nextDirs);
  }

  const arrows = boids.map((atr, index) => {
    return <Arrow pos={atr} key={index} dir={directions[index]} k={index} />;
  });

  function onSepChange(event, newValue) {
    setSeparationCoefficient(newValue);
  }
  function onAlignChange(event, newValue) {
    setAlignmentCoefficient(newValue);
  }
  function onCohesionChange(event, newValue) {
    setCohesionCoefficient(newValue);
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="Screen">
        <ControlPanel
          handleAdd={handleAdd}
          handleRemove={handleRemove}
          handleAdd10={handleAdd10}
          handleRemove10={handleRemove10}
          toDefault={toDefault}
          separationCoefficient={separationCoefficient}
          alignmentCoefficient={alignmentCoefficient}
          cohesionCoefficient={cohesionCoefficient}
          onSepChange={onSepChange}
          onAlignChange={onAlignChange}
          onCohesionChange={onCohesionChange}
          toggleAlignment={toggleAlignment}
          toggleCohesion={toggleCohesion}
          toggleSeparation={toggleSeparation}
          setToggleSeparation={setToggleSeparation}
          setToggleAlignment={setToggleAlignment}
          setToggleCohesion={setToggleCohesion}
        />
        <div className="Box" ref={containerRef}>
          {arrows}
        </div>
      </div>
    </ThemeProvider>
  );
}

function ControlPanel({
  handleAdd,
  handleRemove,
  handleAdd10,
  handleRemove10,
  toDefault,
  onSepChange,
  onAlignChange,
  onCohesionChange,
  separationCoefficient,
  alignmentCoefficient,
  cohesionCoefficient,
  toggleAlignment,
  toggleCohesion,
  toggleSeparation,
  setToggleSeparation,
  setToggleAlignment,
  setToggleCohesion,
}) {
  return (
    <div className="ControlPanel">
      <div className="buttonContainer">
        <div>
          <AddButton onAdd={handleAdd} />
          <Add10Button onAdd={handleAdd10} />
        </div>
        <div>
          <RemoveButton onRemove={handleRemove} />
          <Remove10Button onRemove={handleRemove10} />
        </div>
        <div>
          <ToDefault toDefault={toDefault} />
        </div>
      </div>
      <div className="switches">
        <ToggleSep checked={toggleSeparation} onChange={setToggleSeparation} />
        <ToggleAlign checked={toggleAlignment} onChange={setToggleAlignment} />
        <ToggleCohesion checked={toggleCohesion} onChange={setToggleCohesion} />
      </div>
      <div className="sliders">
        <SeparationSlider
          aria-label="Volume"
          defaultValue={1}
          handleChange={onSepChange}
          value={separationCoefficient}
        />
        <AlignmentSlider
          aria-label="Volume"
          defaultValue={1}
          handleChange={onAlignChange}
          value={alignmentCoefficient}
        />
        <CohesionSlider
          aria-label="Volume"
          defaultValue={1}
          handleChange={onCohesionChange}
          value={cohesionCoefficient}
        />
      </div>
    </div>
  );
}

function ToggleSep({ checked, onChange }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
      <IconButton
        sx={{ color: "#ce93d8" }}
        aria-label="Toggle Separation"
        onClick={() => onChange(!checked)}
      >
        {<AllOut sx={{ color: !checked && "#ef5350" }} />}
      </IconButton>
      <FormControlLabel
        sx={{ marginLeft: 1, color: "#ce93d8" }}
        control={
          <Switch
            checked={checked}
            onChange={() => onChange(!checked)}
            inputProps={{ "aria-label": "Toggle Separation" }}
          />
        }
        label="Separation"
      />
    </Box>
  );
}

function ToggleAlign({ checked, onChange }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
      <IconButton
        sx={{ color: "#ce93d8" }}
        aria-label="Toggle Alignment"
        onClick={() => onChange(!checked)}
      >
        {<Merge sx={{ color: !checked && "#ef5350" }} />}
      </IconButton>
      <FormControlLabel
        sx={{ marginLeft: 1, color: "#ce93d8" }}
        control={
          <Switch
            checked={checked}
            onChange={() => onChange(!checked)}
            inputProps={{ "aria-label": "Toggle Alignment" }}
          />
        }
        label="Alignment"
      />
    </Box>
  );
}

function ToggleCohesion({ checked, onChange }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
      <IconButton
        sx={{ color: "#ce93d8" }}
        aria-label="Toggle Cohesion"
        onClick={() => onChange(!checked)}
      >
        {<Sync sx={{ color: !checked && "#ef5350" }} />}
      </IconButton>
      <FormControlLabel
        sx={{ marginLeft: 1, color: "#ce93d8" }}
        control={
          <Switch
            checked={checked}
            onChange={() => onChange(!checked)}
            inputProps={{ "aria-label": "Toggle Cohesion" }}
          />
        }
        label="Cohesion"
      />
    </Box>
  );
}

function SeparationSlider({ handleChange, value = 1 }) {
  return (
    <Box sx={{ width: 400 }}>
      <Typography id="separation-slider-label" gutterBottom>
        <AllOut sx={{ marginRight: "0.5em", marginTop: "0.35em" }} /> Separation
      </Typography>
      <Slider
        aria-labelledby="separation-slider-label"
        value={value}
        onChange={handleChange}
        step={0.00001}
        valueLabelDisplay="auto"
        min={-10}
        max={10}
      />
    </Box>
  );
}

function AlignmentSlider({ handleChange, value = 1 }) {
  return (
    <Box sx={{ width: 400 }}>
      <Typography id="alignment-slider-label" gutterBottom>
        <Merge sx={{ marginRight: "0.5em" }} /> Alignment
      </Typography>
      <Slider
        aria-labelledby="alignment-slider-label"
        value={value}
        onChange={handleChange}
        step={0.00001}
        valueLabelDisplay="auto"
        min={-10}
        max={10}
      />
    </Box>
  );
}

function CohesionSlider({ handleChange, value = 1 }) {
  return (
    <Box sx={{ width: 400 }}>
      <Typography id="cohesion-slider-label" gutterBottom>
        <Sync sx={{ marginRight: "0.5em" }} /> Cohesion
      </Typography>
      <Slider
        aria-labelledby="cohesion-slider-label"
        value={value}
        onChange={handleChange}
        step={0.00001}
        valueLabelDisplay="auto"
        min={-10}
        max={10}
      />
    </Box>
  );
}

function Add10Button({ onAdd }) {
  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={onAdd}
      sx={{ minWidth: "4rem" }}
    >
      +10
    </Button>
  );
}

function Remove10Button({ onRemove }) {
  return (
    <Button
      variant="outlined"
      color="secondary"
      onClick={onRemove}
      sx={{ minWidth: "4rem" }}
    >
      -10
    </Button>
  );
}

function AddButton({ onAdd }) {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddBox />}
      onClick={onAdd}
      sx={{ minWidth: "10rem" }}
    >
      Add Boid
    </Button>
  );
}

function RemoveButton({ onRemove }) {
  return (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<Delete />}
      onClick={onRemove}
      sx={{ minWidth: "10rem" }}
    >
      Remove Boid
    </Button>
  );
}

function ToDefault({ toDefault }) {
  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={<SettingsBackupRestoreIcon />}
      onClick={toDefault}
      sx={{ minWidth: "14rem" }}
    >
      Reset to Default
    </Button>
  );
}

function Arrow({ pos, dir, k }) {
  let offset = -25;
  let color = ["red", "cyan", "pink", "green"];
  return (
    <div
      className="Arrow"
      style={{
        top: pos.x + offset,
        left: pos.y + offset,
        transform: `rotate(${Math.atan2(dir.x, dir.y)}rad)`,
        borderLeftColor: theme.palette.primary.main,
      }}
    ></div>
  );
}
