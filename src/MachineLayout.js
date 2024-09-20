import React, { useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import styles from "./MachineLayout.module.css";

// Maschinenbeschreibungen
const machineDescriptions = {
  Constructor: "Baumaschine zur Herstellung.",
  Assembler: "Montiermaschine für Endprodukte.",
  Smelter: "Ofen zum Schmelzen von Materialien.",
  Conveyor: "Transportiert Materialien zwischen Maschinen.",
  Manufacturer: "Komplexe Montage für fortgeschrittene Produkte.",
};

// Produkte und ihre Anordnungen
const productLayouts = {
  Plates: ["Constructor", "Conveyor"],
  Rods: ["Constructor", "Conveyor"],
  Cables: ["Constructor", "Assembler"],
  // Weitere Produkte hier hinzufügen
};

const machines = Object.keys(machineDescriptions);

// Maschine Komponente
function Machine({ name }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "MACHINE",
    item: { name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`${styles.machine} ${isDragging ? "dragging" : ""}`}
    >
      <FontAwesomeIcon icon={faCog} /> {name}
    </div>
  );
}

// Drop-Zone Komponente
function DropZone({ onDrop, droppedItems }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "MACHINE",
    drop: (item) => onDrop(item.name),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={`${styles.dropZone} ${isOver ? "hovered" : ""}`}>
      {isOver ? "Lass los!" : "Zieh die Maschine hierhin"}
      <div>
        {droppedItems.map((item, index) => (
          <div key={index}>
            {item} - {machineDescriptions[item]}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hauptkomponente für das Maschinenlayout
export default function MachineLayout() {
  const [droppedItems, setDroppedItems] = useState([]);
  const [product, setProduct] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const savedLayout = JSON.parse(localStorage.getItem("savedLayout"));
    if (savedLayout) {
      setDroppedItems(savedLayout);
    }
  }, []);

  const handleDrop = (name) => {
    if (!droppedItems.includes(name)) {
      setDroppedItems((prevItems) => [...prevItems, name]);
    } else {
      setFeedback("Diese Maschine ist bereits platziert.");
    }
  };

  const suggestLayout = () => {
    const suggestion = productLayouts[product] || [];
    setDroppedItems(suggestion);
  };

  const saveLayout = () => {
    localStorage.setItem("savedLayout", JSON.stringify(droppedItems));
    setFeedback("Layout gespeichert!");
  };

  return (
    <div className={styles.container}>
      <h2>Maschinen Layout</h2>
      <select
        onChange={(e) => setProduct(e.target.value)}
        style={{ marginBottom: "10px" }}
      >
        <option value="">Wähle ein Produkt</option>
        {Object.keys(productLayouts).map((productName) => (
          <option key={productName} value={productName}>
            {productName}
          </option>
        ))}
      </select>
      <button onClick={suggestLayout} style={{ marginLeft: "10px" }}>
        Anordnung vorschlagen
      </button>
      <button onClick={saveLayout} style={{ marginLeft: "10px" }}>
        Layout speichern
      </button>
      <div style={{ marginTop: "10px", color: "green" }}>{feedback}</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "10px",
        }}
      >
        {machines.map((machine) => (
          <Machine key={machine} name={machine} />
        ))}
      </div>

      <DropZone onDrop={handleDrop} droppedItems={droppedItems} />
    </div>
  );
}
